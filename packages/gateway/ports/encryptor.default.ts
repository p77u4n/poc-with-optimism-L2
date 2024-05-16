import crypto from 'crypto';
import * as Reader from 'fp-ts/lib/Reader.js';
import { IEncryptor } from './encryptor.base';
import * as Either from 'fp-ts/Either';
// reference: https://dev.to/jobizil/encrypt-and-decrypt-data-in-nodejs-using-aes-256-cbc-2l6d
//
export const Encryptor: Reader.Reader<
  {
    secretKey: string;
    secretIv: string;
    encryptionMethod: string;
  },
  IEncryptor
> = ({ secretKey, secretIv, encryptionMethod }) => {
  // Generate secret hash with crypto to use for encryption
  const key = crypto
    .createHash('sha512')
    .update(secretKey)
    .digest('hex')
    .substring(0, 32);
  const encryptionIV = crypto
    .createHash('sha512')
    .update(secretIv)
    .digest('hex')
    .substring(0, 16);
  return {
    encryptData: (data) =>
      Either.tryCatch(
        () => {
          const cipher = crypto.createCipheriv(
            encryptionMethod,
            key,
            encryptionIV,
          );
          const dataEncrypted = Buffer.concat([
            cipher.update(data),
            cipher.final(),
          ]); // Encrypts data and converts to hex and base64
          return dataEncrypted.toString('hex');
        },
        (e) => e as Error,
      ),
    decryptData: (encryptedData) =>
      Either.tryCatch(
        () => {
          const buff = Buffer.from(encryptedData, 'base64');
          const decipher = crypto.createDecipheriv(
            encryptionMethod,
            key,
            encryptionIV,
          );
          return (
            decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
            decipher.final('utf8')
          ); // Decrypts data and converts to utf8
        },
        (e) => e as Error,
      ),
  };
};
