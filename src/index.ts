// filepath: /C:/Users/Haythem/Documents/000 dream/ebook/ebook-server-master/src/index.ts
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { dbConnect } from './db/connect';
import { isAuth, isValidReadingRequest } from './middlewares'; // Assurez-vous que ce chemin est correct
import webhookRouter from './routes/webhook';

const app = express();
const publicPath = 'path_to_public_directory';

dbConnect();

app.use(morgan("dev"));
app.use(
  cors({
    origin: [process.env.APP_URL!, process.env.APP_URL_2!],
    credentials: true,
  })
);
app.use("/webhook", webhookRouter);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/books", isAuth, isValidReadingRequest, express.static(publicPath));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});