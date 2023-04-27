var mysql = require('mysql');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var pool = mysql.createPool({
	host	: 'localhost',
	user	: 'root',
	password : '',
	database	: 'bohol'
});

server.listen(8080, function() {
	console.log("Server is running.");
});
var id = [];
var users = { CommandCenter : '' };

io.on('connection', function(socket){
	console.log("Device connected " + socket.id);
	id.push(socket.id);

	socket.on('login', function(data){
		users[data.name] = socket.id;
		console.log(users);
	});
	socket.on('disconnect', function(){
		users[getKeyByValue(users, socket.id)] = '';
		console.log("Device disconnected " + socket.id);
		console.log(users);

	}).on('join', function (room) {
		socket.join(room, function() {
			console.log(room);
			console.log('some one connect to the room' + room);
		}).on('count', function() {
			//get all client in rooms
			io.of('/').in(room).clients((error, clients) => {
        		if (error) throw error;
        		console.log(clients); // => [Anw2LatarvGVVXEIAAAD]
      		});
		});
	});

	/*socket.emit('view_connection', socket.id);
	console.log(id[0])
 	io.to(id[0]).emit('view_connection', socket.id);*/

 	socket.on('updateLocation', function(data){
    console.log(data.lng + "---" + data.lng);
    //pool.getConnection(function(err, connection){
      //connection.query('INSERT INTO location (lat, lng) VALUES (?, ?)', [data.lat, data.lng]);
      //if (err) throw err;
      /*connection.query('SELECT * FROM location', function (error, results, fields) {
    // And done with the connection.
        //console.log(results);
          for (var i = 0;i<results.length;i++){
              console.log(results[i].id);
              console.log(results[i].lat);
              console.log(results[i].lng);
              console.log(results[i].created_at);
          }
          if (error) throw error;
      });*/
      //connection.release();
    //});
		//socket.broadcast.emit('updateLocation', data);
		socket.to(users.comCenter).emit('updateLocation', data);
		console.log(data);
	});

	socket.on('send_alert', function(data){
		console.log('send_alert');
		socket.to(users[data.name]).emit('receive_alert', data);
	});

});

io.on('tracklocation', function(socket){
	socket.on('disconnect', function(){ });
});

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}
