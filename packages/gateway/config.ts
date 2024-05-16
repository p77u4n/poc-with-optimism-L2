import { AppConfig } from 'config.base';
import { get } from 'env-var';

export const config: AppConfig = {
  onchainRpc: get('ONCHAIN_RPC').default('http://127.0.0.1:8545').asString(),
  walletPrivKey: get('WALLET_PRIV').required().asString(),
  controllerAddr: get('CONTROLLER_ADDRESS').required().asString(),
  encryptionKey: get('FILE_ENCRYPTED_SECRET_KEY').required().asString(),
  encryptionIv: get('FILE_ENCRYPTED_SECRET_IV').required().asString(),
  encryptionMethod: get('ENCRYPTION_METHOD').default('aes-256-cbc').asString(),
};
