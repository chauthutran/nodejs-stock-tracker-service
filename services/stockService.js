const axios = require('axios');

var DBServices = require("./dbService");
const dbServices = new DBServices();


// Define the stock API URL and key (if needed)
const STOCK_API_URL = 'http://localhost:3000/api'; // Replace with your API URL


const runNoticationSettings = async() => {
	const payload = {
		"collectionName": "notificationsettings",
		"payload": {
			// "userId": "66a62b6e97d97a5b743e7b8b",
			"notifications": {
				"$elemMatch": {
					"hasNewNotification": false
				}
			}
		}
	};

	let settingResponse = await dbServices.findDocuments(payload);
	if (settingResponse.status == "success") {
		const useNotificationsettings = settingResponse.data;
		let symbols = useNotificationsettings.map((item) => item.symbol);

		const stocksResponse = await axios.get(`${STOCK_API_URL}/stock-index?symbols=${symbols.join(",")}`);
		const stockPriceList = stocksResponse.data.data;
		if (stocksResponse.data.status === "success") {
			for (var i = 0; i < useNotificationsettings.length; i++) {
				const useNotificationsetting = useNotificationsettings[i];
				const userId = useNotificationsetting.userId;

				const notificationSettingList = useNotificationsetting.notifications;
				for (var j = 0; j < notificationSettingList.length; j++) {
					const settingData = notificationSettingList[j];
					const symbol = settingData.symbol;
					const threshold = settingData.threshold;
					const direction = settingData.direction;

					const stockPrice = findFromArray(stockPriceList, symbol, "symbol").regularMarketPrice;
					if( direction == "above" && threshold > stockPrice ) {
						await sendNotification(`The stock '${symbol}' is above ${threshold} at ${getCurrentDate()}`)
					}
				}
			}
		}
	}
}

// Function to send notification
const sendNotification = async(settingId, userId, message) => {
	console.log('Notification:', message);

	const payload = {
		userId,
		notificationSettingId: settingId,
		message
	}
	const addResponse = await dbServices.addDocument(payload);
};


const findFromArray = function( list, value, propertyName )
{
	for( let i = 0; i < list.length; i++ )
	{
		var item = list[i];
		if ( item[ propertyName ] == value ) 
		{
			return item;
		}
	}
	
	return;
};

const getCurrentDate = () => {
	const curDate = new Date();

	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	const hours = (curDate.getHours() + "").padStart(2, '0');
	const minutes = (curDate.getMinutes() + "").padStart(2, '0');
	const seconds = (curDate.getSeconds() + "").padStart(2, '0');

	const dateStr = `${date.getFullYear()}-${month}-${day}T${formatToDbDate(date)}T${hours}:${minutes}:${seconds}`;
	const date = parseISO(dateStr);
	return format(date, 'MMM dd, yyyy HH:mm');
}

module.exports = {
	runNotificationSettings
};