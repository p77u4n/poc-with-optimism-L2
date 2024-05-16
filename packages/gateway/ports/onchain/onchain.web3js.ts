import Web3 from 'web3';
import { OnchainOperators } from './onchain.base';
import { TE } from 'yl-ddd-ts';
import { abi } from 'genomicdao-hardhat';
import { AppConfig } from 'config.base';

export class OnchainWeb3 implements OnchainOperators {
  web3Instance: Web3;
  wallet: Web3['eth']['accounts']['wallet'][0];

  constructor(
    privateKey: string,
    networkRpcURL: string,
    private config: AppConfig,
  ) {
    this.web3Instance = new Web3(networkRpcURL);
    this.wallet = this.web3Instance.eth.accounts.wallet.add(privateKey)[0];
    console.log('wallet address ', this.wallet.address);
  }

  initGeneDataAnalysisTask(docId: string): TE.TaskEither<Error, string> {
    const controllerContract = new this.web3Instance.eth.Contract(
      abi.Controller,
      this.config.controllerAddr,
    );
    return TE.tryCatch(
      async () => {
        return controllerContract.methods
          .uploadData(docId)
          .send({ from: this.wallet.address })
          .then((tx) =>
            tx.status === BigInt(1)
              ? Promise.resolve(tx.transactionHash)
              : Promise.reject(new Error(tx.transactionHash)),
          );
      },
      (e) => e as Error,
    );
  }
}
