import { TaskEither } from 'fp-ts/lib/TaskEither';

export interface OnchainOperators<EventType> {
  initGeneDataAnalysisTask(
    docId: string,
  ): TaskEither<Error, Record<string, EventType>>;
}
