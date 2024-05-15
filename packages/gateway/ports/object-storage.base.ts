import * as TE from 'fp-ts/TaskEither';

export interface ObjectStoragePort {
  updateGeneData(
    files: { content: Buffer; fileName: string }[],
  ): TE.TaskEither<Error, string[]>;
}
