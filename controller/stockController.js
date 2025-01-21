import Stock from "../models/stockModel.js";

const getStocks = async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json({ status: "200", data: stocks })
  } catch (error) {
    res.json({ status: "400", message: "Can not get stocks" })
  }
};


export { getStocks }