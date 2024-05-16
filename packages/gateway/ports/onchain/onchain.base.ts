import { TaskEither } from 'fp-ts/lib/TaskEither';
import { Address } from 'web3';

export interface OnchainOperators<EventType> {
  initGeneDataAnalysisTask(
    docId: string,
  ): TaskEither<Error, Record<string, EventType>>;
  updateSender(sessionId: bigint, sender: Address): TaskEither<Error, any>;
}
