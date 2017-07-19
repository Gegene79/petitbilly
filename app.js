var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

require('dotenv').config();
var db = require('./common/db');
var filesync = require('./common/fsdbsync');
var monitor = require('./routes/api/monitor');
var gallery = require('./routes/api/gallery');
var proxymonitor = require('./routes/api/proxymonitor');
var proxynode = require('./routes/api/proxynode');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('*/api',proxymonitor);
app.use('*/api/monitor', monitor);
app.use('*/api/gallery', gallery);
app.use('/', express.static('public'));
app.use(process.env.THUMBS_DIR, express.static(process.env.THUMBS_DIR,""));

// Connect DB
db.connect(function(){
});
/*
process.on( 'SIGINT', function() {
  console.log( "\nOn eteint tout apres ce SIGINT (Ctrl-C)" );
  // some other closing procedures go here
  process.exit();
});
*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
