const express = require("express");
const axios = require("axios");

const app = express();

const calculateTotalSaleAmount = (transactions, selectedMonth) => {
  let totalSaleAmount = 0;
  transactions.forEach((transaction) => {
    const transactionMonth = new Date(transaction.dateOfSale).getMonth() + 1;
    if (transactionMonth === selectedMonth) {
      totalSaleAmount += transaction.price;
    }
  });
  return totalSaleAmount;
};

const calculateTotalSoldItems = (transactions, selectedMonth) => {
  let totalSoldItems = 0;
  transactions.forEach((transaction) => {
    const transactionMonth = new Date(transaction.dateOfSale).getMonth() + 1;
    if (transactionMonth === selectedMonth && transaction.sold) {
      totalSoldItems += 1;
    }
  });
  return totalSoldItems;
};

const calculateTotalUnsoldItems = (transactions, selectedMonth) => {
  let totalUnsoldItems = 0;
  transactions.forEach((transaction) => {
    const transactionMonth = new Date(transaction.dateOfSale).getMonth() + 1;
    if (transactionMonth === selectedMonth && !transaction.sold) {
      totalUnsoldItems += 1;
    }
  });
  return totalUnsoldItems;
};

app.get("/statistics/:year/:month", async (req, res) => {
  const year = parseInt(req.params.year);
  const month = parseInt(req.params.month);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return res.status(400).json({ message: "Invalid year or month." });
  }

  try {
    // Fetch data from the API endpoint
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    const transactions = response.data;

    const filteredTransactions = transactions.filter((transaction) => {
      const transactionYear = new Date(transaction.dateOfSale).getFullYear();
      const transactionMonth = new Date(transaction.dateOfSale).getMonth() + 1;
      return transactionYear === year && transactionMonth === month;
    });

    const totalSaleAmount = calculateTotalSaleAmount(
      filteredTransactions,
      month
    );
    const totalSoldItems = calculateTotalSoldItems(filteredTransactions, month);
    const totalUnsoldItems = calculateTotalUnsoldItems(
      filteredTransactions,
      month
    );

    res.json({
      year,
      month,
      totalSaleAmount,
      totalSoldItems,
      totalUnsoldItems,
    });
  } catch (error) {
    console.error("Error fetching JSON data:", error.message);
    return res.status(500).json({ message: "Error fetching JSON data." });
  }
});

const getPriceRange = (price) => {
  if (price >= 0 && price <= 100) return "0 - 100";
  if (price >= 101 && price <= 200) return "101 - 200";
  if (price >= 201 && price <= 300) return "201 - 300";
  if (price >= 301 && price <= 400) return "301 - 400";
  if (price >= 401 && price <= 500) return "401 - 500";
  if (price >= 501 && price <= 600) return "501 - 600";
  if (price >= 601 && price <= 700) return "601 - 700";
  if (price >= 701 && price <= 800) return "701 - 800";
  if (price >= 801 && price <= 900) return "801 - 900";
  if (price >= 901) return "901 - above";
};

app.get("/barchart/:month", async (req, res) => {
  const month = parseInt(req.params.month);

  if (isNaN(month) || month < 1 || month > 12) {
    return res.status(400).json({ message: "Invalid month." });
  }

  try {
    // Fetch data from the API endpoint
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    const data = response.data;

    // Filter transactions for the selected month
    const filteredData = data.filter((item) => {
      const transactionMonth = new Date(item.dateOfSale).getMonth() + 1;
      return transactionMonth === month;
    });

    // Calculate the price range and the number of items in that range
    const priceRanges = {
      "0 - 100": 0,
      "101 - 200": 0,
      "201 - 300": 0,
      "301 - 400": 0,
      "401 - 500": 0,
      "501 - 600": 0,
      "601 - 700": 0,
      "701 - 800": 0,
      "801 - 900": 0,
      "901 - above": 0,
    };

    filteredData.forEach((item) => {
      const priceRange = getPriceRange(item.price);
      priceRanges[priceRange]++;
    });

    res.json(priceRanges);
  } catch (error) {
    console.error("Error fetching JSON data:", error.message);
    return res.status(500).json({ message: "Error fetching JSON data." });
  }
});

app.get("/piechart/:month", async (req, res) => {
  const month = parseInt(req.params.month);

  if (isNaN(month) || month < 1 || month > 12) {
    return res.status(400).json({ message: "Invalid month." });
  }

  try {
    // Fetch data from the API endpoint
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    const data = response.data;

    // Filter transactions for the selected month
    const filteredData = data.filter((item) => {
      const transactionMonth = new Date(item.dateOfSale).getMonth() + 1;
      return transactionMonth === month;
    });

    // Calculate unique categories and the number of items in each category
    const categories = {};
    filteredData.forEach((item) => {
      if (!categories[item.category]) {
        categories[item.category] = 0;
      }
      categories[item.category]++;
    });

    res.json(categories);
  } catch (error) {
    console.error("Error fetching JSON data:", error.message);
    return res.status(500).json({ message: "Error fetching JSON data." });
  }
});

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000`);
});
