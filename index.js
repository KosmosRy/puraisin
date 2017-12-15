/*
index.js by secretario



*/

const express = require('express');
const app = express();
const { Pool, Client } = require('pg');
const connectionString = 'postgres://pnauocceetyrto:52883e8680d07c58469cc9f2c2b5dfe6fc870aae9d85b92b05160fa77619660c@ec2-107-20-176-7.compute-1.amazonaws.com:5432/d1d6v3castj3lj'
// const connectionString = 'postgres://samih:erkki12Esimerkki@localhost:5432/node';
const bodyParser = require("body-parser");

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', function (req, res) {
    res.sendFile('index.html', { root: __dirname });
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port: ', app.get('port'));
});

app.post('/submit-data', function (request, response) {
	const type = request.body.type;
	const content = request.body.content;
	const location = request.body.location;
	const source = request.body.source;
	const query1 = {
		name: 'create-puraisu',
		text: 'INSERT INTO puraisu (type, content, location, source) VALUES($1, $2, $3, $4) RETURNING type',
		values: [type,content,location,source]
	}

	// debug :: parsed query
	// console.log(query1);
	
	const client = new Client(
	    {connectionString: connectionString,}
	);

    // init connection
	client.connect();
	
    // fire up query! 
    client.query(query1, (err,res) => {
		if (err) {
			console.log(err.stack);
		} else {
			console.log(res.rows[0]);
		}
		response.sendFile('tattis.html', { root: __dirname });
		client.end();
	});

});


   