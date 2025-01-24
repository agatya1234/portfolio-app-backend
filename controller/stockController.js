import Stock from "../models/stockModel.js";

// fetch all stocks and calculate portfolio value
const getStocks = async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json({ status: "200", data: stocks })
  } catch (error) {
    res.json({ status: "400", message: "Can not get stocks" })
  }
};

// add a new stock
const addStock = async (req, res) => {
  try {
    const { userId, name, ticker, quantity, buyPrice } = req.body;
    if (!userId || !name || !ticker || !quantity || !buyPrice) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the stock already exists in the database for the user
    const stockInDB = await Stock.findOne({ userId, name });
    let stock;

    if (stockInDB) {
      // Update the existing stock's quantity and recalculate the average buy price
      const newQuantity = stockInDB.quantity + parseInt(quantity);
      const newBuyPrice =
        (stockInDB.buyPrice * stockInDB.quantity + buyPrice * quantity) / newQuantity;

      stock = await Stock.findByIdAndUpdate(
        stockInDB._id,
        { quantity: newQuantity, buyPrice: newBuyPrice },
        { new: true } // Return the updated document
      );
    } else {
      // Create a new stock entry
      stock = new Stock({ userId, name, ticker, quantity, buyPrice });
      await stock.save();
    }

    res.status(201).json({ message: "Stock added successfully", data: stock })
  } catch (error) {
    res.status(500).json({ message: 'Error adding stock', error });
  }
}

// Update existing stock details
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity) {
      return res.status(400).json({ message: 'Quantity is required' });
    }

    const stock = await Stock.findByIdAndUpdate(
      id,
      { quantity },
      { new: true }
    );

    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    res.status(200).json({ message: 'Stock updated successfully', stock });
  } catch (error) {
    res.status(500).json({ message: 'Error updating stock', error });
  }
}

// remove stock
const deleteStock = async (req, res) => {
  try {
    const { id } = req.params;

    const stock = await Stock.findByIdAndDelete(id);

    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    res.status(200).json({ message: 'Stock deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting stock', error });
  }
}


export { getStocks, addStock, updateStock, deleteStock }