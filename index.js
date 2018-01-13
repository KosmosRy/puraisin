/*
index.js by secretario



*/
const path = require('path');
const express = require('express');
const app = express();
const { Pool, Client } = require('pg');
const bodyParser = require("body-parser");

app.set('port', (process.env.PORT || 5000));
app.use(express.static(path.join(__dirname, 'static')));
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
	const biter = request.body.biter;
    const info = request.body.info;
	const query1 = {
		name: 'create-puraisu',
		text: 'INSERT INTO puraisu (type, content, location, source, biter, info) VALUES($1, $2, $3, $4, $5, $6) RETURNING type',
		values: [type,content,location,source,biter,info]
	}

	const client = new Client({
        user: '[username]',
        host: '127.0.0.1',
        database: 'puraisin',
        password: '[password]',
        port: 5432,
	    // {connectionString: process.env.DATABASE_URL,}
    })


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


   