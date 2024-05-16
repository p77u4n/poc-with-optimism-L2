// @ts-nocheck

import { BaseCommandService } from 'core/service';
import { postgresDTsource } from 'database-typeorm/datasource';
import { DMTask } from 'database-typeorm/entities';
import { v4 } from 'uuid';
import express from 'express';
import { UploadFile } from 'core/model/file';
import * as Either from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';

export const TaskRoute = (service: BaseCommandService) => {
  const taskRoute = express.Router();
  taskRoute.get('/me', (req, res) => {
    res.status(200).send('ok');
  });
  taskRoute.post('/me/gene-data-task', async (req, res) => {
    const docId = v4();
    const file = req.files;
    const address = req.body.walletAddress;
    // user should sign on the address that they claim that belonging to them using its correspond
    // public key, then we should check this signature to guarantee that user own the wallet address
    // but now for the sake of simplicity we only use the plain address
    if (Object.values(file || {}).length === 0) {
      res.status(400).send('please upload file');
      return;
    }
    const files = Object.values(file || {}).flatMap((file) => {
      if (Array.isArray(file)) {
        return file.map(
          (f) =>
            ({
              fileName: f.name,
              content: f.data,
            }) as UploadFile,
        );
      } else {
        return [
          {
            fileName: file.name,
            content: file.data,
          } as UploadFile,
        ];
      }
    });
    const result = await service.requestAnalytic(docId, files[0], address)();
    pipe(
      result,
      Either.match(
        (e) => {
          console.error(e);
          res.status(500).send({
            error: e.message,
          });
        },
        (docId) =>
          res.status(200).send({
            docId,
            notice:
              'We dont relate any user information to genome doc to protect privacy, so please keep the docId for retrieving genome analytic result and relating your result with your wallet address on onchain',
          }),
      ),
    );
  });

  taskRoute.get('/me/gene-data-task/:docId/status', async (req, res) => {
    console.log('docId', req.params);
    try {
      await postgresDTsource
        .getRepository(DMTask)
        .findOneBy({ doc_id: req.params.docId })
        .then((task) => {
          if (!task) {
            res.status(404).send('NOT FOUND');
          } else {
            res.status(200).send({ ...task });
          }
        });
    } catch (error) {
      res.status(500).send(error);
    }
  });
  return taskRoute;
};
