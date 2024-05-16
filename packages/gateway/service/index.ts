import { Statuses, Task, parseTask } from 'core/model/task';
import { BaseCommandService } from 'core/service';
import * as TE from 'fp-ts/lib/TaskEither';
import * as Opt from 'fp-ts/lib/Option';
import * as Either from 'fp-ts/lib/Either';
import { flow, pipe } from 'fp-ts/lib/function';
import { DataSource } from 'typeorm';
import { DMDoc, DMTask } from 'database-typeorm/entities';
import { UploadFile } from 'core/model/file';
import { ObjectStoragePort } from 'ports/object-storage.base';
import { DomainEvent, EventBus } from 'events/event-bus.base';
import { IEncryptor } from 'ports/encryptor.base';

// has sideeffect so we use IO here to wrap the side-effect logic (FP principle)
const dataMapperForTask = (dmTask: DMTask, task: Task) => () => {
  dmTask.doc_id = task.docId;
  dmTask.status = task.status;
  // dmTask.file = task.file;
  dmTask.result = pipe(
    task.result,
    Opt.getOrElse(() => null),
  );
  dmTask.gene_file = task.geneFile;
  dmTask.created_at = task.createdAt;
  dmTask.reason = pipe(
    task.failReason,
    Opt.getOrElse(() => null),
  );
  return dmTask;
};

export type RequestStartEvent = DomainEvent<{ docId: string; task: Task }>;

export const REQ_START_EVENT_NAME = 'requestStart';

export class TypeORMRabbitMqCMDService implements BaseCommandService {
  constructor(
    private datasource: DataSource,
    private objectStorageClient: ObjectStoragePort,
    private eventBus: EventBus,
    private encryptor: IEncryptor,
  ) {}

  createDMTask = (datasource: DataSource) => (task: Task) => {
    const createDocResult = pipe(
      Either.tryCatch(
        () => {
          return datasource.getRepository(DMDoc).create({});
        },
        (e) => new Error(`REQUEST_CREATE_DOC_FAILED ${e}`),
      ),
      TE.fromEither,
      TE.chain((dmDoc) =>
        TE.fromIO(() => {
          dmDoc.id = task.docId;
          return dmDoc;
        }),
      ),
      TE.chain((dmDoc) =>
        TE.tryCatch(
          () => datasource.getRepository(DMDoc).save(dmDoc),
          (e) => new Error(`REQUEST_CREATE_DOC_FAILED ${e}`),
        ),
      ),
    );
    const createTaskResult = pipe(
      Either.tryCatch(
        () => {
          return datasource.getRepository(DMTask).create({});
        },
        (e) => new Error(`REQUEST_OTHER_COMMAND_FAILED ${e}`),
      ),
      TE.fromEither,
      TE.chain((dmTask) =>
        // wrap IO of mapping from domain model to data model inside TaskEither
        pipe(dataMapperForTask(dmTask, task), TE.fromIO),
      ),
      TE.chain((dmTask) =>
        TE.tryCatch(
          () => datasource.getRepository(DMTask).save(dmTask),
          () => new Error('SAVE_FAILED'),
        ),
      ),
    );
    return pipe(
      createDocResult,
      TE.chain(() => createTaskResult),
    );
  };

  _checkIfDocIdSubmit(docId: string): TE.TaskEither<Error, void> {
    return pipe(
      TE.tryCatch(
        () => this.datasource.getRepository(DMDoc).findOneById(docId),
        (e) => e,
      ),
      TE.chain((doc) =>
        doc == null
          ? TE.right(null)
          : TE.left(new Error('DOC_ALREADY_EXISTED')),
      ),
      TE.mapLeft((e) => e as Error),
    );
  }

  requestAnalytic(
    docId: string,
    fileGene: UploadFile,
  ): TE.TaskEither<Error, string> {
    const validation = pipe(docId, this._checkIfDocIdSubmit.bind(this));
    const mainLogic = pipe(
      fileGene,
      flow(
        (f) => f.content.toString('utf8'),
        this.encryptor.encryptData,
        TE.fromEither,
      ),
      TE.chain((encryptedF) =>
        this.objectStorageClient.updateGeneData([
          {
            fileName: docId,
            content: Buffer.from(encryptedF, 'hex'),
          },
        ]),
      ),
      TE.flatMap((fileLinks) =>
        TE.fromEither(
          parseTask({
            docId,
            geneFile: fileLinks[0],
            status: Statuses.PENDING,
            createdAt: new Date(Date.now()),
          }),
        ),
      ),
      TE.tap(this.createDMTask(this.datasource)),
      TE.tap((task) => {
        this.eventBus.emit<RequestStartEvent>({
          name: REQ_START_EVENT_NAME,
          data: {
            docId: task.docId,
            task,
          },
        });
        return TE.right(null);
      }),
      // TE.tap(
      //   this.taskQueue.putTask.bind(
      //     this.taskQueue,
      //   ) as typeof this.taskQueue.putTask,
      // ),
      TE.map((task) => task.docId),
      // put to rabbimq here
    );
    return pipe(
      validation,
      TE.chain(() => mainLogic),
    );
  }
}
