
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var AssetsInclude = require('../../index');

var app = express();
var includer = new AssetsInclude('assets.yml');

// all environments
app.set('port', 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.logger('dev'));
app.use(app.router);
app.use(express.errorHandler());
app.use(express.static(path.join(__dirname, 'public')));
app.locals({ assets: includer });

app.get('/', function(req, res){
  res.render('index', { title: 'Express' });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
