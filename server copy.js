'use strict';

const express = require('express');
var cors = require('cors');
const bodyParser = require("body-parser");
require('dotenv').config({ path: '.env.local' });
import './services/scheduler.js'; // Import the scheduler to start the cron job


var DBServices =  require("./services/dbService.js");
const dbServices = new DBServices();

const PORT = process.env.PORT || 3110;


// ================================================================================================================

const server = express()
.use(cors())
.use(bodyParser.urlencoded({ extended: false }))
.use(bodyParser.json())

// // View Engine Setup
// .set("views", path.join(__dirname, "views"))
// .set("view engine", "ejs")

.get('/', (req, res) => {
	res.sendFile(__dirname + "/index.html")
	// res.send("The service is started");	
})
.post("/", async(req, res) => {
	var action = req.query.action;
	const body = req.body;
	try
	{
		var result;
		if( action == "add" ) {
			result = await dbServices.addDocument( body );
		}
		else if( action == "find" ) {
			result = await dbServices.findDocuments(body);
		}

		res.send(result);
	}
	catch( ex )
	{
		res.send({"status": "error", data: {msg: ex.message}});
		console.log(ex.message);
	}
})

.listen(PORT, () => console.log(`Listening on ${PORT}` ));