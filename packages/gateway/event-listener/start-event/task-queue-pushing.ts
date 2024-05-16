import { EventHandler } from 'events/event-bus.base';
import * as Reader from 'fp-ts/Reader';
import { pipe } from 'fp-ts/lib/function';
import { TaskQueue } from 'ports/task-queue/task-queue.base';
import { RequestStartEvent } from 'service';
import * as TE from 'fp-ts/TaskEither';

export const TaskQueuePushing: Reader.Reader<
  { taskQueue: TaskQueue },
  EventHandler<RequestStartEvent>
> =
  ({ taskQueue }) =>
  ({ task }) =>
    pipe(
      taskQueue.putTask(task),
      TE.tapError((e) => {
        console.log('push task error: ', e);
        return TE.left(e);
      }),
    );
