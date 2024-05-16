import { EventHandler } from 'events/event-bus.base';
import { OnchainOperators } from 'ports/onchain/onchain.base';
import { RequestStartEvent } from 'service';
import * as Reader from 'fp-ts/Reader';
import { pipe } from 'fp-ts/lib/function';
import { TE } from 'yl-ddd-ts';

export const OnchainFileUpload: Reader.Reader<
  { onchainOperator: OnchainOperators },
  EventHandler<RequestStartEvent>
> =
  ({ onchainOperator }) =>
  (data) => {
    return pipe(
      onchainOperator.initGeneDataAnalysisTask(data.docId),
      TE.tapError((e) => {
        console.log('onchain file upload error: ', e);
        return TE.left(e);
      }),
      TE.tapIO((tx) => () => {
        console.log('tx hash', tx);
      }),
    );
  };
