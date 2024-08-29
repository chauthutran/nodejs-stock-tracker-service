const axios = require('axios');

var DBServices = require("./dbService");
const { parseISO } = require('date-fns/parseISO');
const { format } = require('date-fns/format');
const dbServices = new DBServices();
const nodemailer = require('nodemailer');


// Define the stock API URL and key (if needed)
// const STOCK_API_URL = 'http://localhost:3000/api'; // Replace with your API URL
const STOCK_API_URL = 'https://next-stock-index-tracker.vercel.app/api';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;


const runNoticationSettings = async() => {

	const userList = await getUserList();
	if( userList.length > 0 ) {

		let useNotificationsettings = await getNotificationSettings();
		let symbols = getSymbolsInSetting(useNotificationsettings);

		if( symbols.length > 0 ) {
			const stocksResponse = await axios.get(`${STOCK_API_URL}/stock-index?symbols=${symbols.join(",")}`);
			const stockPriceList = stocksResponse.data;
			if ( stocksResponse.status === 200 ) {

				for (var i = 0; i < useNotificationsettings.length; i++) {
					const useNotificationsetting = useNotificationsettings[i];
					const settingId = useNotificationsetting._id;
					const userId = useNotificationsetting.userId;
					const email = findFromArray(userList, userId, "_id").email;

					const notificationSettingList = useNotificationsetting.notifications;

					for (var j = 0; j < notificationSettingList.length; j++) {
						const settingData = notificationSettingList[j];
						const hasNewNotification = settingData.hasNewNotification;
						if( !hasNewNotification ) {
							const symbol = settingData.symbol;
							const threshold = settingData.threshold;
							const direction = settingData.direction;
	
							const stockPrice = findFromArray(stockPriceList, symbol, "symbol").regularMarketPrice;
	
							if( direction == "above" && threshold <= stockPrice ) {
								const msg = `The stock '${symbol}' is now ${stockPrice}, above ${threshold} at ${getCurrentDate()}`;
								await sendNotification(settingId, userId, msg);
								await sendEmail(email, `Notification - ${symbol}`, msg);
								await updateNotificationSetting(userId, settingData);
							}
						}
						
					}
				}
			}
		}
	}
}

const getNotificationSettings = async() => {
	console.log("---------------- Loading Notification Setting list");

	// Get the Notification Settings
	const payload = {
		"collectionName": "notificationsettings",
		"payload": {
			"notifications": {
				"$elemMatch": {
					"hasNewNotification": false
				}
			}
		}
	};

	let response = await dbServices.findDocuments(payload);
	
	if (response.status == "success") return response.data;

	console.log(`Error to load use list. ERROR: ${response.message}.`);
	return [];
}

const getUserList = async() => {
	// Get the Notification Settings
	console.log("================== Loading user list");
	const payload = {
		"collectionName": "users"
	};

	let response = await dbServices.findDocuments(payload);
	
	if(response.status === "success" ) return response.data;

	console.log(`Error to load use list. ERROR: ${response.message}.`);
	return [];
}


const getSymbolsInSetting = (useNotificationsettings) => {
	let symbols = [];
	for (var i = 0; i < useNotificationsettings.length; i++) {
		const useNotificationsetting = useNotificationsettings[i];
		const userId = useNotificationsetting.userId;

		const notificationSettingList = useNotificationsetting.notifications;
		let systemSymbols = notificationSettingList.map((item) => item.symbol);

		symbols = [...symbols, ...systemSymbols];
	}

	return symbols;
}


// Function to send notification
const sendNotification = async(settingId, userId, message) => {
	const payload = {
		"collectionName": "notifications",
		"payload": {
			userId,
			notificationSettingId: settingId,
			message,
			createdDate: new Date()
		}
	}
	const addResponse = await dbServices.addDocument(payload);
	console.log('Notification sent to mongodb :', message);

	
};


const sendEmail = async (to, subject, text) => {
	try {
	  await transporter.sendMail({
		from: EMAIL_USER,
		to,
		subject,
		text
	  });
	  
	console.log('Notification sent to email :', text);
	} catch (error) {
	  console.error('Error sending notification:', error);
	  throw error;
	}
  };


// Function to send notification
const updateNotificationSetting = async(userId, notification) => {

	delete notification._id;

	const payload = {
		"collectionName": "notificationsettings",
		"filter": { userId, 'notifications.symbol': notification.symbol  },
		"payload": {
			'notifications.$': {
				...notification,
				hasNewNotification: true
			},
		}
	}
	const response = await dbServices.updateDocuments(payload);
	console.log('Updated NotificationSetting');
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

	const month = String(curDate.getMonth() + 1).padStart(2, '0');
	const day = String(curDate.getDate()).padStart(2, '0');

	const hours = (curDate.getHours() + "").padStart(2, '0');
	const minutes = (curDate.getMinutes() + "").padStart(2, '0');
	const seconds = (curDate.getSeconds() + "").padStart(2, '0');

	const dateStr = `${curDate.getFullYear()}-${month}-${day}T${hours}:${minutes}:${seconds}`;
	const date = parseISO(dateStr);
	return format(date, 'MMM dd, yyyy HH:mm');
}

const transporter = nodemailer.createTransport({
	service: 'gmail', // Replace with your email service
	auth: {
	  user: EMAIL_USER,
	  pass: EMAIL_PASS
	}
});


module.exports = {
	runNoticationSettings
};