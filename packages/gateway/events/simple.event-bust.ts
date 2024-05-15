import { TE } from 'yl-ddd-ts';
import { DomainEvent, EventBus } from './event-bus.base';
import { Emitter, createNanoEvents } from 'nanoevents';

export class SimpleEventBust implements EventBus {
  emmiter: Emitter;
  subscribers: Record<
    string,
    ((eventProps: Record<string, any>) => TE.TaskEither<Error, any>)[]
  >;
  constructor() {
    this.emmiter = createNanoEvents();
    this.subscribers = {};
  }
  emit<Props>(event: DomainEvent<Props>) {
    const cbs = this.subscribers[event.name] || [];
    Promise.all(cbs.map((cb) => cb(event.data)));
  }
  on<Props>(
    event: string,
    callback: (eventProps: Props) => TE.TaskEither<Error, any>,
  ) {
    this.subscribers[event] = [...this.subscribers[event], callback];
  }
}
