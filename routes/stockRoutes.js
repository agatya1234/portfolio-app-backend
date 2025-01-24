import express from "express";
import { addStock, deleteStock, getStocks, updateStock } from "../controller/stockController.js";
const router = express.Router();

router.get('/', getStocks)
router.post('/', addStock)
router.put('/:id', updateStock)
router.delete('/:id', deleteStock)

export default router;