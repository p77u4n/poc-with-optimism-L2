from dataclasses import dataclass
from typing import final
from uuid import UUID
from returns.future import FutureResultE, future_safe
from returns.maybe import Maybe
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from infra.sqlalchemy.schema import DMTask
from models.task import Task, parse_task
from repository.task import TaskRepository


@final
@dataclass
class PgTaskRepository(TaskRepository):
    session: AsyncSession

    def get_by_id(self, id: UUID) -> FutureResultE[Task]:
        task: FutureResultE[DMTask] = future_safe(
            lambda: self.session.get(DMTask, str(id))
        )()
        return (
            task.bind(
                lambda t: FutureResultE.from_result(
                    parse_task(
                        doc_id=t.doc_id,
                        status=t.status,
                        file_gene=t.gene_file,
                        result=Maybe.from_optional(t.result),
                        fail_reason=Maybe.from_optional(t.reason),
                    )
                )
            )
            if task is not None
            else FutureResultE.from_failure(Exception("TASK_NOT_EXIST"))
        )

    @future_safe
    async def save(self, task: Task):
        stmt = (
            update(DMTask)
            .where(DMTask.doc_id == task.doc_id)
            .values(
                status=task.status.value,
                reason=task.fail_reason.map(lambda r: r.value).value_or(None),
                result=task.result.map(lambda r: r.value).value_or(None),
            )
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        print("result", result)
