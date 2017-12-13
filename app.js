var express = require('express');
var app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
    res.sendFile('index.html', { root: __dirname });
});


//app.post('/submit-data', function (req, res) {
// var name = req.body.id + ' ' + req.body.freetext;
// res.send(name + ' Submitted Successfully!');
	
	app.post('/submit-data', function (req, res, next) {
	// const xdata = req.body;
	var xid = req.body.id
	var xfreetext = req.body.freetext
	// res.send('you sent:');
	res.send(xid + 'foo' + xfreetext)

const pg = require('pg');
// const connectionString = 'postgres://pnauocceetyrto:52883e8680d07c58469cc9f2c2b5dfe6fc870aae9d85b92b05160fa77619660c@ec2-107-20-176-7.compute-1.amazonaws.com:5432/d1d6v3castj3lj';
// connectionString = process.env.DATABASE_URL || 'postgres://pnauocceetyrto:52883e8680d07c58469cc9f2c2b5dfe6fc870aae9d85b92b05160fa77619660c@ec2-107-20-176-7.compute-1.amazonaws.com:5432/d1d6v3castj3lj';


const { Client } = require('pg');
const client = new Client({
  conString:process.env.DATABASE_URL || 'postgres://pnauocceetyrto:52883e8680d07c58469cc9f2c2b5dfe6fc870aae9d85b92b05160fa77619660c@ec2-107-20-176-7.compute-1.amazonaws.com:5432/d1d6v3castj3lj',
  ssl: false,
});

client.connect();

client.query('INSERT INTO test (id, freetext) VALUES ($1, $2)', [xid, xfreetext], (err, res) => {
  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
  client.end();
});

});


var server = app.listen(5000, function () {
    console.log('Node server is running..');
});
   