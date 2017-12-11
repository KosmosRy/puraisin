var express = require('express');
var square = require('./square');
var wiki = require('./wiki.js');
var app = express();
app.use('/wiki', wiki);


app.get('/', function(req, res) {
  res.send('Hello World!');
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
  console.log('The area of a square with a width of 4 is ' + square.area(4));
});

