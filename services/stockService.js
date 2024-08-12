import axios from 'axios';
var DBServices =  require("./services/dbService");
const dbServices = new DBServices();


// Define the stock API URL and key (if needed)
const STOCK_API_URL = 'http://localhost:3000/api'; // Replace with your API URL


const getSymbolsInNotificationSettings = async() => {
    const payload = {
        "collectionName": "notificationsettings",
        "payload": {
            // "userId": "66a62b6e97d97a5b743e7b8b",
            "notifications": { "$elemMatch": { "hasNewNotification": false } }
        }
    };

    let settingResponse = await dbServices.findDocuments( payload );
    if( settingResponse.status == "success" ) {
        const settings = settingResponse.data;
        let symbols = settings.map((item) => item.symbol);

        const stocksResponse = await axios.get(`${STOCK_API_URL}/stock-index?symbols=${symbols.join(",")}`);
        if( stocksResponse.data.status === "success" ) {
            const stockList = stocksResponse.data.data;
    
        }
    }
    
}


// Function to send notification
const sendNotification = (message: string) => {
  // Implement your notification logic here (e.g., email, SMS, etc.)
  console.log('Notification:', message);
};

const getNotificationSettings = async() => {
    let result = await dbServices.findDocuments(body);
}

// Main function to check stock prices and notify
export const checkStockPricesAndNotify = async () => {
  const stocks = ['AAPL', 'GOOGL', 'MSFT']; // List of stock symbols to check

  for (const symbol of stocks) {
    const price = await fetchStockPrice(symbol);
    if (price > 5) {
      sendNotification(`Stock ${symbol} has exceeded $5. Current price: $${price}`);
    }
  }
};
