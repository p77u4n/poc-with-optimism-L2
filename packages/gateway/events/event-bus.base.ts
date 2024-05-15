import { TE } from 'yl-ddd-ts';

export interface DomainEvent<Props> {
  name: string;
  data: Props;
}

export interface EventBus {
  emit: <Props>(event: DomainEvent<Props>) => void;
  on: <Props>(
    event: string,
    callback: (eventProps: Props) => TE.TaskEither<Error, any>,
  ) => void;
}
