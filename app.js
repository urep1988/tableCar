var express = require('express');
var path = require('path');
var http = require('http');


var app = express();
app.set('port', 5454);

app.engine('ejs', require('ejs-locals'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


var pgp = require("pg-promise")();
var db = pgp("postgres://urep:123@localhost:5432/car_db");
var carDB = {array_to_json: []};
db.one("SELECT array_to_json(array_agg(cars)) FROM cars", 123)
  .then(function (data) {
    carDB = data;
    console.log("DATA   :", carDB);
  })
  .catch(function (error) {
    console.log("ERROR:", error);
});
app.get('/', function(req, res, next) {
  res.render('index', {car: carDB});
});

var server = http.createServer(app);

var io = require('socket.io')(server);

io.on('connection', function (socket) {
  socket.on('chat message', function(msg){
    for (var i = 0; i < carDB.array_to_json.length; i++) {
      if (carDB.array_to_json[i].id == msg) {
        carDB.array_to_json.splice(i, 1);
        db.one("DELETE FROM cars WHERE id = " + msg, 123)
          .then(function (data) {
            console.log("DATA :", data);
          })
          .catch(function (error) {
            console.log("ERROR:", error);
        });
      }
    }
  });
  socket.on('addCar', function(car){
    var carId;
    var id = db.one("INSERT INTO cars (name, capacity) VALUES ('" + car.name + "', " + car.capacity + ") RETURNING id", 123)
      .then(function (data) {
        carId = data;
        console.log(carId);
        carDB.array_to_json.push({
          id: carId.id,
          name: car.name,
          capacity: car.capacity,
        });
        socket.emit('addCar', carId.id);
      })
      .catch(function (error) {
        console.log("ERROR:", error);
    });
  });
});
server.listen(app.get('port'), function() {
});

module.exports = app;
