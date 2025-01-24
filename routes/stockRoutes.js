import express from "express";
import { addStock, getStocks } from "../controller/stockController.js";
const router = express.Router();

router.get('/', getStocks)
router.post('/', addStock)
router.put('/:id', addStock)
router.delete('/:id', addStock)

export default router;