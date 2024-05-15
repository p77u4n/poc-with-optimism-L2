import * as TE from 'fp-ts/TaskEither';
import { Task } from '../model/task';
import { UploadFile } from 'core/model/file';

export interface BaseQueryService {
  getMyAnalytics(userId: string): TE.TaskEither<Error, Task[]>;
  getMyAnalyticId(userId: string, taskId: string): TE.TaskEither<Error, Task>;
}

export interface BaseCommandService {
  requestAnalytic(
    userId: string,
    fileGene: UploadFile,
  ): TE.TaskEither<Error, string>;
}
