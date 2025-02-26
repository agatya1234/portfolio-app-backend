import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import colors from 'colors';
import connectDB from './config/db.js';
import stockRoutes from "./routes/stockRoutes.js"

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.use(cors());

app.use("/api/stocks", stockRoutes)

const PORT = process.env.PORT || 5500;

app.listen(PORT, console.log(`server listening on port ${PORT}`.yellow.bold))