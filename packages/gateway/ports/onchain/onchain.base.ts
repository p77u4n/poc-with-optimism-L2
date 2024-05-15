import { TaskEither } from 'fp-ts/lib/TaskEither';

export interface OnchainOperators {
  initGeneDataAnalysisTask(docId: string): TaskEither<Error, void>;
}
