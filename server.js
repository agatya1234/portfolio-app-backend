import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import colors from 'colors';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.use(cors());

const PORT = process.env.PORT || 5500;

app.listen(PORT, console.log(`server listening on port ${PORT}`.yellow.bold))