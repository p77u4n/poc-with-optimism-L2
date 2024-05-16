import asyncio
import functools
import os
import sys
import traceback

from returns.future import future_safe
from returns.result import Failure
from sqlalchemy.ext.asyncio import AsyncSession

from infra.ports.message_queue.gene_file_reader import FileReaderAES256
from infra.sqlalchemy.database import session

sys.path.append(os.getcwd())

from uuid import UUID
from dino_seedwork_be import get_env, print_exception_with_traceback
import jsonpickle
import pika

from returns.io import IOFailure, IOSuccess
from sqlalchemy import select, update
from sqlalchemy.sql.functions import count

from event_broker_in_memory import EventBrokerInMemory
from models.task import Status
from usecase.task import TaskUsecaseExceptions, TaskUsecases
from config import env_service_config
from infra.repo.pg_task import PgTaskRepository
from infra.sqlalchemy.schema import DMTask

username = str(get_env("RABBITMQ_POC_USERNAME") or "username")
pwd = str(get_env("RABBITMQ_POC_PWD") or "pwd")


def run_consumer(session: AsyncSession):
    TASK_QUEUE_NAME = "task-queue"
    host = str(get_env("RABBITMQ_HOST") or "/")
    virtual_host = str(get_env("RABBITMQ_POC_VIRTUAL_HOST") or "/")
    credentials = pika.PlainCredentials(username, pwd)
    print(f"pika: ${host}, ${virtual_host}")
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host=host,
            virtual_host=virtual_host,
            credentials=credentials,
        )
    )
    channel = connection.channel()
    task_repo = PgTaskRepository(session)
    event_broker = EventBrokerInMemory()
    file_reader = FileReaderAES256(
        env_service_config.encryption_key, env_service_config.encryption_iv
    )
    task_service = TaskUsecases(
        task_repo,
        env_service_config.max_number_of_concurent_job,
        event_broker,
        env_service_config,
        file_reader,
    )
    channel.queue_declare(queue=TASK_QUEUE_NAME, durable=True)
    print(" [*] Waiting for messages. To exit press CTRL+C")

    @future_safe
    async def callback(ch, method, properties, body):
        try:
            stmt = select(count(DMTask.doc_id)).where(
                DMTask.status == Status.PROCESSING.value
            )
            count_current_job = (await session.execute(stmt)).scalars().one()
            print(f" [x] Received {body.decode()} ${count_current_job}")
            doc_id = UUID(jsonpickle.decode(body.decode())["docId"])
            result = await task_service.run_new_task(
                count_current_job, doc_id
            ).awaitable()
            print("result io ", result)
            match result:
                case IOSuccess():
                    ch.basic_ack(delivery_tag=method.delivery_tag)
                    print("Task Done")
                case IOFailure(Failure(e)):
                    match dict(enumerate(e.args)).get(0):
                        case TaskUsecaseExceptions.task_already_run:
                            ch.basic_nack(
                                delivery_tag=method.delivery_tag,
                                multiple=False,
                                requeue=True,
                            )
                        case _:
                            print_exception_with_traceback(e)
                            await asyncio.sleep(15)
                            ch.basic_nack(
                                delivery_tag=method.delivery_tag,
                                multiple=False,
                                requeue=True,
                            )
                            stmt = (
                                update(DMTask)
                                .where(DMTask.doc_id == doc_id)
                                .values(status=Status.PENDING.value)
                            )
                            await session.execute(stmt)
        except Exception as e:
            print("exception ", e, traceback.format_exc())

    channel.basic_qos(prefetch_count=1)

    def sync(f):
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            return asyncio.get_event_loop().run_until_complete(f(*args, **kwargs))

        return wrapper

    cb_async = sync(callback)
    channel.basic_consume(queue=TASK_QUEUE_NAME, on_message_callback=cb_async)

    channel.start_consuming()


run_consumer(session)
