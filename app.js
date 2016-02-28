var express = require('express');
var path = require('path');
var http = require('http');


var app = express();
app.set('port', 8000);

app.engine('ejs', require('ejs-locals'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


var pgp = require("pg-promise")(/*options*/);
var db = pgp("postgres://urep:123@localhost:5432/car_db");
var carDB;
//db.one("SELECT array_to_json(array_agg(cars)) FROM cars", 123)
db.one("SELECT array_to_json(array_agg(cars)) FROM cars", 123)
  .then(function (data) {
    carDB = data;
    console.log("DATA:", carDB);
  })
  .catch(function (error) {
    console.log("ERROR:", error);
});
app.get('/', function(req, res, next) {
  res.render('index', {car: carDB});
});

var server = http.createServer(app);
server.listen(app.get('port'), function() {
  console.log('2222ddssssss');
});

var io = require('socket.io')(server);

io.on('connection', function (socket) {
  socket.on('chat message4', function(msg){
    io.emit('chat message', msg);
  });
});

/*var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
*/

module.exports = app;
