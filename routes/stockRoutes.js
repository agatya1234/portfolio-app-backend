import express from "express";
import { getStocks } from "../controller/stockController.js";
const router = express.Router();

router.get('/', getStocks)

export default router;