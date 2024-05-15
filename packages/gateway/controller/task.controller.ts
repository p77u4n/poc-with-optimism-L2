// @ts-nocheck

import { postgresDTsource } from 'database-typeorm/datasource';
import { DMTask } from 'database-typeorm/entities';
import express from 'express';
import { client } from 'ports/grpc/client';

export const taskRoute = express.Router();

taskRoute.post('/me/gene-data-task', async (req, res) => {
  const userId = req.body.userId;
  const command = req.body.command;
  const files = req.files || [];
  client.createCommandWithFile(
    {
      user_id: userId,
      command: command,
      files: Object.values(files).flatMap((file) => {
        if (Array.isArray(file)) {
          return file.map((f) => ({
            filename: f.name,
            content: f.data,
          }));
        } else {
          return [
            {
              filename: file.name,
              content: file.data,
            },
          ];
        }
      }),
    },
    (err, data) => {
      if (err) {
        res.status(400).send(err.details);
      } else {
        res.status(200).send('OK');
      }
    },
  );
});

taskRoute.get('/me/gene-data-task/:id/status', async (req, res) => {
  const task = await postgresDTsource
    .getRepository(DMTask)
    .findOneBy({ id: req.params.id });
  if (!task) {
    res.status(404).send('NOT FOUND');
  } else {
    res.status(200).send({ status: task.status });
  }
});

taskRoute.get('/me/gene-data', async (req, res) => {
  const userId = req.params.userId;
  const tasks = await postgresDTsource
    .getRepository(DMTask)
    .findBy({ user_id: userId });
  res.status(200).send({ tasks });
});
