import { EventHandler } from 'events/event-bus.base';
import { OnchainOperators } from 'ports/onchain/onchain.base';
import { RequestStartEvent } from 'service';
import * as Reader from 'fp-ts/Reader';
import { pipe } from 'fp-ts/lib/function';
import { TE } from 'yl-ddd-ts';
import { DataSource } from 'typeorm';
import { DMTask } from 'database-typeorm/entities';
import { EventLog } from 'web3';

export const OnchainFileUpload: Reader.Reader<
  { onchainOperator: OnchainOperators<EventLog>; datasource: DataSource },
  EventHandler<RequestStartEvent>
> =
  ({ onchainOperator, datasource }) =>
  (data) => {
    return pipe(
      onchainOperator.initGeneDataAnalysisTask(data.docId),
      TE.tapError((e) => {
        console.error('onchain file upload error: ', e);
        return TE.left(e);
      }),
      TE.tapIO((events) => () => {
        console.log(
          'session id',
          events['UploadData'].returnValues['sessionId'],
        );
      }),
      TE.tap((events: Record<string, EventLog>) => {
        return TE.tryCatch(
          () =>
            datasource.getRepository(DMTask).update(
              {
                doc_id: data.docId,
              },
              {
                session_id: Number(
                  events['UploadData'].returnValues['sessionId'],
                ),
              },
            ),
          (e) => e as Error,
        );
      }),
    );
  };
