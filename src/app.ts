import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { callRouter } from './features/call/presentation/routes';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/calls', callRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
