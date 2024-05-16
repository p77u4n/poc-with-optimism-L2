import * as TE from 'fp-ts/TaskEither';
import { Task } from '../model/task';
import { UploadFile } from 'core/model/file';
import { Address } from 'web3';

export interface BaseQueryService {
  getMyAnalyticId(docId: string): TE.TaskEither<Error, Task>;
}

export interface BaseCommandService {
  requestAnalytic(
    docId: string,
    fileGene: UploadFile,
    userAdress: Address,
  ): TE.TaskEither<Error, string>;
}
