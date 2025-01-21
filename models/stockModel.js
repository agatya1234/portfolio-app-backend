import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  ticker: { type: String, required: true },
  quantity: { type: Number, required: true },
  buyPrice: { type: Number, required: true },
})

const Stock = mongoose.model("Stock", stockSchema);

export default Stock;