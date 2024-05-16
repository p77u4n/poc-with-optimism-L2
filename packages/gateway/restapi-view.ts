import { TaskRoute } from 'controller/task.controller';
import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { Registry } from 'registry.base';

export const app = express();
const port = 3003;
app.use(
  cors({
    allowedHeaders: '*',
    origin: '*',
    methods: '*',
  }),
);
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export const runExpress = (registry: Registry) => {
  app.use(TaskRoute(registry.commandService));
  app.get('/', (req, res) => {
    res.send('Welcome !');
  });
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};
