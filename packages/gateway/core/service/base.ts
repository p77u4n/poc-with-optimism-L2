import * as TE from 'fp-ts/TaskEither';
import { Task } from '../model/task';
import { UploadFile } from 'core/model/file';

export interface BaseQueryService {
  getMyAnalyticId(docId: string): TE.TaskEither<Error, Task>;
}

export interface BaseCommandService {
  requestAnalytic(
    docId: string,
    fileGene: UploadFile,
  ): TE.TaskEither<Error, string>;
}
