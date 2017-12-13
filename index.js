var express = require('express');
var app = express();
const { Pool, Client } = require('pg');
const connectionString = 'postgres://pnauocceetyrto:52883e8680d07c58469cc9f2c2b5dfe6fc870aae9d85b92b05160fa77619660c@ec2-107-20-176-7.compute-1.amazonaws.com:5432/d1d6v3castj3lj'

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
    res.sendFile('index.html', { root: __dirname });
});

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port: ', app.get('port'));
});


app.post('/submit-data', function (request, response){
	
	// var xid = request.body.id
	// var xfreetext = request.body.freetext
	var ptype = request.body.ptype
	var pcontent = request.body.pcontent
	var plocation = request.body.plocation
	var psource = request.body.psource
	var timestamp = request.body.timestamp
	// var pool = new pg.Pool();
	// response.send('you sent: ' + xid + ':' + xfreetext);
	// var query1 = "INSERT INTO test (id, freetext) VALUES (" +  xid + ",'" + xfreetext + "')";
	var query1 = "INSERT INTO puraisut (ptype, pcontent, plocation, psource, timestamp) VALUES ('" + ptype + "','" + pcontent + "','" + plocation + "','" + psource + "','" + timestamp + "');";
	console.log(query1)
	const client = new Client({
	  connectionString: connectionString,
	})
	
	client.connect()
	// var query = con.query(query1, (err, res) => {
    client.query(query1, (err, res, done) => {
	  if (err) throw err;
	  console.log(err)
	  for (let row of res.rows) {
	  console.log(JSON.stringify(row));
	  client.end()
	  done()
	  }
	  })

});


   