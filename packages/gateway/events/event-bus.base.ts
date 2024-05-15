import { TE } from 'yl-ddd-ts';

export interface DomainEvent<Props> {
  name: string;
  data: Props;
}

export type EventHandler<Event extends DomainEvent<any>> = (
  eventProps: Event['data'],
) => TE.TaskEither<Error, any>;

export interface EventBus {
  emit: <Event extends DomainEvent<any>>(event: Event) => void;
  on: <Event extends DomainEvent<any>>(
    event: string,
    callback: EventHandler<Event>,
  ) => void;
}
