import { Brand, Either, Task } from 'yl-ddd-ts';
import * as Option from 'fp-ts/Option';
import { validate } from 'uuid';
import { P, match } from 'ts-pattern';

export type UUID = Brand<string, 'UUID'>;

export function isUUID(v: string): v is UUID {
  return validate(v);
}

export enum Statuses {
  FINISH = 'FINISH',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
}

function isStatus(v: string): v is Statuses {
  return Object.values(Statuses).includes(v as Statuses);
}

export interface Task {
  docId: UUID;
  status: Statuses;
  createdAt: Date;
  result: Option.Option<string>;
  failReason: Option.Option<string>;
  geneFile: string;
}

export const parseTask = (params: {
  docId: string;
  status: string;
  result?: string;
  failReason?: string;
  geneFile: string;
  createdAt: Date;
}): Either.Either<Error, Task> => {
  return match([params.docId, params.status])
    .with(
      [P.select('docId', P.when(isUUID)), P.select('status', P.when(isStatus))],
      ({ docId, status }) => {
        return Either.right({
          docId,
          status: status,
          result: Option.fromNullable(params.result),
          failReason: Option.fromNullable(params.failReason),
          geneFile: params.geneFile,
          createdAt: params.createdAt,
        } as Task);
      },
    )
    .otherwise(() =>
      Either.left(
        new Error(`TASK_PROPS_FAILED_VALIDATION: ${JSON.stringify(params)}`),
      ),
    ) as Either.Either<Error, Task>;
};
