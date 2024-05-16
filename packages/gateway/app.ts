import { S3Port } from 'ports/s3-storage-port';
import { REQ_START_EVENT_NAME, TypeORMRabbitMqCMDService } from 'service';
import { postgresDTsource } from 'database-typeorm/datasource';
import { runExpress } from 'restapi-view';
import { configDotenv } from 'dotenv';
import { RabbitTaskQueue } from 'ports/task-queue/rabbit-queue';
import { TE } from 'yl-ddd-ts';
import amqp from 'amqplib';
import { get } from 'env-var';
import { pipe } from 'fp-ts/lib/function';
import * as Either from 'fp-ts/Either';
import { OnchainWeb3 } from 'ports/onchain/onchain.web3js';
import { config } from 'config';
import { SimpleEventBus } from 'events/simple.event-bust';
import { TaskQueuePushing } from 'event-listener/start-event/task-queue-pushing';
import { OnchainFileUpload } from 'event-listener/start-event/onchain-fileupload';
import { EventBus } from 'events/event-bus.base';
import { Registry } from 'registry.base';

configDotenv();

const configEventSubs = (eventBus: EventBus) => {
  const onchainOperator = new OnchainWeb3(
    config.walletPrivKey,
    config.onchainRpc,
    config,
  );

  const queueName = 'task-queue';
  const channelCreate = TE.tryCatch(
    () =>
      amqp
        .connect({
          hostname: get('RABBITMQ_HOST').required().asString(),
          username: get('RABBITMQ_POC_USERNAME').required().asString(),
          password: get('RABBITMQ_POC_PWD').required().asString(),
          vhost: get('RABBITMQ_POC_VIRTUAL_HOST').required().asString(),
        })
        .then((c) => c.createChannel())
        .then(async (channel) => {
          channel.assertQueue(queueName, { durable: true });
          return channel;
        }),
    (e) => e as Error,
  );
  return pipe(
    channelCreate,
    TE.map((c) => new RabbitTaskQueue(c, queueName)),
    TE.bindTo('taskQueue'),
    TE.bind('taskQueuePushing', ({ taskQueue }) =>
      TE.right(TaskQueuePushing({ taskQueue })),
    ),
    TE.map(({ taskQueuePushing }) => ({
      taskQueuePushing,
      onchainFileUpload: OnchainFileUpload({
        onchainOperator,
        datasource: postgresDTsource,
      }),
    })),
    TE.tapIO(({ taskQueuePushing, onchainFileUpload }) => () => {
      eventBus.on(REQ_START_EVENT_NAME, taskQueuePushing);
      eventBus.on(REQ_START_EVENT_NAME, onchainFileUpload);
    }),
  );
};

const getSingleRegistry: () => TE.TaskEither<Error, Registry> = () => {
  const objectStoragePort = new S3Port();
  const eventBus = new SimpleEventBus();
  return pipe(
    TE.right({
      commandService: new TypeORMRabbitMqCMDService(
        postgresDTsource,
        objectStoragePort,
        eventBus,
      ),
    }),
    TE.tap(() => configEventSubs(eventBus)),
  );
};

const start = async () => {
  const registry = await getSingleRegistry()();
  pipe(
    registry,
    Either.match(
      (e) => {
        console.error('REGISTRY_CREATING_FAILED: ', e);
        throw e;
      },
      (reg) => {
        runExpress(reg);
      },
    ),
  );
};

start();
