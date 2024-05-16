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
      TE.map((events) => {
        console.log(
          'session id',
          events['UploadData'].returnValues['sessionId'],
        );
        return events['UploadData'].returnValues['sessionId'] as bigint;
      }),
      TE.tap((sessionId) => {
        return TE.tryCatch(
          () =>
            datasource.getRepository(DMTask).update(
              {
                doc_id: data.docId,
              },
              {
                session_id: Number(sessionId),
              },
            ),
          (e) => e as Error,
        );
      }),
      TE.tap((sessionId) =>
        // should separate updateSender and initGeneDataAnalysisTask
        // by event-driven method (eventually consistency), so we can tolerate the case of
        // one of them failed, and make the state half-completed
        onchainOperator.updateSender(sessionId, data.senderAddress),
      ),
      TE.tapError((e) => {
        console.error('onchain file update address error: ', e);
        return TE.left(e);
      }),
    );
  };
