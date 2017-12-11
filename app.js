var express = require('express');
var app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  res.sendFile('index.html');
});

app.post('/submit-puraisu', function (req, res) {
    var name = req.body.id + ' ' + req.body.freetext;
    res.send(name + ' Submitted Successfully!');
});


var.server = app.listen(3000, function() {
  console.log('app.js listening on port 3000...');
});

