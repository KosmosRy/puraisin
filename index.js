var express = require('express');
var app = express();
var pg = require('pg');

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
	
	var xid = request.body.id
	var xfreetext = request.body.freetext
	var pool = new pg.Pool();
	response.send('you sent: ' + xid + ':' + xfreetext);
	var query1 = "INSERT INTO test (id, freetext) VALUES (" +  xid + ",'" + xfreetext + "')";
	
	var con = new pg.Client({
	  host:'ec2-107-20-176-7.compute-1.amazonaws.com',
	  port:5432,
	  user:'pnauocceetyrto',
	  password:'52883e8680d07c58469cc9f2c2b5dfe6fc870aae9d85b92b05160fa77619660c',
	  database:'d1d6v3castj3lj'
	})
	
	con.connect()
	var query = con.query(query1, (err, res) => {
	  if (err) throw err;
	  console.log(err);
	  for (let row of res.rows) {
	  console.log(JSON.stringify(row));
	  }
	})
	
/*
	var q1 = "INSERT INTO test (id, freetext) VALUES (" +  xid + ",'" + xfreetext + "')";
	console.log(q1);
	
	pool.connect(function(err, client, done) {
    client.query(q1, (err, res) => {
	  if (err) throw err;
	  console.log(err);
	  for (let row of res.rows) {
	  console.log(JSON.stringify(row));
	  }
    });
    done()
    pool.end()
})
*/


});

/*
var server = app.listen(5000, function () {
    console.log('Node server is running..');
});
*/
   