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

app.post('/submit-data', function (request, response) {
	
	var xid = request.body.id
	var xfreetext = request.body.freetext
	var pool = new pg.Pool();
	response.send('you sent: ' + xid + 'foo' + xfreetext)

	
    function(request, response){
        // var pg = require('pg');          
        var conString = process.env.DATABASE_URL || "postgres://pnauocceetyrto:52883e8680d07c58469cc9f2c2b5dfe6fc870aae9d85b92b05160fa77619660c@ec2-107-20-176-7.compute-1.amazonaws.com:5432/d1d6v3castj3lj";
        var client = new pg.Client(conString);
        client.connect();
        var query = client.query("INSERT INTO test (id, freetext) VALUES (" + xid + ", '" + xfreetext + "')");    
        query.on("end", function (result) {          
            client.end(); 
            res.write('Success');
            res.end();  
        });	
	
/*
pool.connect(function(err, client, done) {
    client.query('INSERT INTO test (id, freetext) VALUES ($1, $2)', [xid, xfreetext], (err, res) => {
	  if (err) throw err;
		for (let row of res.rows) {
		console.log(JSON.stringify(row));
		}
    });
  done()
pool.end()
})*/

});

var server = app.listen(5000, function () {
    console.log('Node server is running..');
});
   