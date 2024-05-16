// encryption.js
import * as Either from 'fp-ts/lib/Either.js';

export interface IEncryptor {
  encryptData: (data: string) => Either.Either<Error, string>;
  decryptData: (data: string) => Either.Either<Error, string>;
}
