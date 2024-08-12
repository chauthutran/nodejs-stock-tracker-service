
// To get the config in .env.local file
const { MongoClient, ServerApiVersion } = require("mongodb");

var MONGODB_URI = process.env.MONGODB_URI;
var DB_NAME = process.env.DB_NAME;
console.log("MONGODB_URI: " + MONGODB_URI);


const DBServices = class {
	constructor() {
		// Create a MongoClient with a MongoClientOptions object to set the Stable API version
		this.client = new MongoClient(MONGODB_URI,  {
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true,
			}
		});
	}

	async testDbConnection() {
		try {
			// Send a ping to confirm a successful connection
			const db = this.client.db(DB_NAME)
			await db.command({ ping: 1 });
			console.log("Pinged your deployment. You successfully connected to MongoDB!");
		}
		catch(ex) {
			console.log("Mongodb Connection is failed." + ex.message);
		}
		finally {
			// Ensures that the client will close when you finish/error
			await this.client.close();
			console.log("Mongodb Connection is closed.");
		}
	}

	
	// ---------------------------------------------------------------------------------------------------
	// --- Find documents

	/**
	 * @payloadJson {
	 * 				"collectionName": "users",
	 * 				"payload": {"email": "xxxxx", "password": "yyyy"}  // If "payload" is null, then load all documents in the collection
	 * 			}
	 */
	async findDocuments(payloadJson) {
		var docs = [];
		var errMsg = "";

		try {
			// const collection = this.openDbConnectionAndGetCollection(payloadJson.collectionName);
			const database = this.openDbConnection();
			const collection = database.collection(payloadJson.collectionName);

			// const options = {
			// 	// Sort returned documents in ascending order by title (A->Z)
			// 	sort: { _id: 1 }
			//   };
			// Query for collection
			// const cursor = collection.find(payloadJson.payload, options);

			// Query for collection
			const cursor = (payloadJson.payload) ? collection.find(payloadJson.payload) : collection.find();

			// Print returned documents
			for await (const doc of cursor) {
				docs.push(doc);
			}
		}
		catch(ex) {
			errMsg = ex.message;
		} 
		finally {
			// Ensures that the client will close when you finish/error
			this.closeConnection();
			if( errMsg != "" ) {
				return { status: "error", message: errMsg };
			}
			
			return { status: "success", data: docs };
		}
	}

	/**
	 * @payloadJson {
	 * 				"collectionName": "users",
	 * 				"payload": {"firstName": "test1", "lastName": "last1", email": "xxxxx", "password": "yyyy"}
	 * 			}
	 */
	async addDocument(payloadJson) {
		var result;
		var errMsg = "";
		try {
			const collection = this.openDbConnectionAndGetCollection(payloadJson.collectionName);
			result = await collection.insertOne(payloadJson.payload);
		}
		catch(ex) {
			errMsg = ex.message;
		} 
		finally {
			// Ensures that the client will close when you finish/error
			this.closeConnection();
			if( errMsg != "" ) {
				return { status: "error", data: errMsg };
			}
			
			return { status: "success", data: [result] };
		}
	}
	
	/**
	 * @payloadJson {
	 * 				"collectionName": "users",
	 * 				"filter": {_id: "1234567890"}
	 * 				"payload": {"_id": "xxx", firstName": "test1", "lastName": "last1", email": "xxxxx", "password": "yyyy"}
	 * 			}
	 */
	async updateDocuments(payloadJson) {
		var result;
		var errMsg = "";
		try {
			const collection = this.openDbConnectionAndGetCollection(payloadJson.collectionName);
			// const filter = { _id: "1234567890" };
			/* Set the upsert option to insert a document if no documents match the filter */
			const options = { upsert: true };
			// Specify the update to set a value for the plot field
			const updateDoc = { $set: payloadJson.payload };
			// Update the first document that matches the filter
			result = await collection.findOneAndUpdate(payloadJson.filter, updateDoc, options);
		}
		catch(ex) {
			errMsg = ex.message;
		} 
		finally {
			// Ensures that the client will close when you finish/error
			this.closeConnection();
			if( errMsg != "" ) {
				return { status: "success", data: errMsg };
			}
			
			return { status: "error", data: [result] };
		}
	}

	// ---------------------------------------------------------------------------------------------------
	// --- Supportive methods

	openDbConnection() {
		// Create a MongoClient with a MongoClientOptions object to set the Stable API version
		this.client = new MongoClient(MONGODB_URI,  {
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true,
			}
		});

		this.client.db(DB_NAME);
		return this.client.db(DB_NAME);
	}

	openDbConnectionAndGetCollection(name) {
		// Create a MongoClient with a MongoClientOptions object to set the Stable API version
		this.openDbConnection();

		const database = this.client.db(DB_NAME);
		return database.collection(name);
	}

	async closeConnection() {
		await this.client.close();
	}

}

module.exports = DBServices;