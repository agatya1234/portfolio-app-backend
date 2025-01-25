import Stock from "../models/stockModel.js";
import axios from "axios";

// Function to fetch live stock data from the API
const fetchStockData = async (tickers) => {
  const options = {
    method: 'GET',
    url: 'https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/quotes',
    params: { ticker: tickers.join(',') },
    headers: {
      'x-rapidapi-key': process.env.STOCK_API_KEY,
      'x-rapidapi-host': 'yahoo-finance15.p.rapidapi.com',
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
};

// fetch all stocks and calculate portfolio value
const getStocks = async (req, res) => {
  try {
    const stocks = await Stock.find();
    if (!stocks || stocks.length === 0) {
      return res.json({ status: "200", data: [], portfolio: { invested: 0, current: 0, pnlTotal: 0, topPerformingStock: null } });
    }

    // Extract tickers from the portfolio
    const tickers = stocks.map(stock => stock.ticker); // Assuming each stock has a `ticker` field

    // Fetch live stock data
    const liveData = await fetchStockData(tickers);

    let invested = 0;
    let current = 0;
    let topPerformingStock = null;
    let highestPnL = -Infinity;

    // Calculate portfolio metrics
    const enrichedStocks = stocks?.map(stock => {
      const liveStock = liveData?.body?.find(data => data.symbol === stock.ticker);
      if (!liveStock) return { ...stock.toObject(), currentValue: 0, pnl: 0 };

      const currentValue = liveStock.regularMarketPrice * stock.quantity;
      const buyValue = stock.buyPrice * stock.quantity;
      const pnl = currentValue - buyValue;

      invested += buyValue;
      current += currentValue;

      if (pnl > highestPnL) {
        highestPnL = pnl;
        topPerformingStock = stock.ticker;
      }

      return {
        ...stock.toObject(),
        currentValue,
        pnl,
      };
    });

    const pnlTotal = current - invested;

    res.status(200).json({
      data: enrichedStocks,
      portfolio: {
        invested,
        current,
        pnlTotal,
        topPerformingStock,
      },
    })
  } catch (error) {
    res.status(400).json({ message: "Can not get stocks", error: error })
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