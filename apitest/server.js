

const JsonRPC = require('./jsonrpc2-jlxyz');
const sapi = require('./server-rpc-api').create();
const capi = require('./client-rpc-api').create();
const jsonrpc = new JsonRPC([sapi, capi]);





var app = require('http').createServer();
var io = require('socket.io')(app);
var PORT = 8081;

var middleware = require('socketio-wildcard')();
io.use(middleware);

io.on('connection', function (socket) {
  console.log("new connection...");

  socket.on('login', function (data) {
    console.log("login...", data);

    socket.emit('loginSuccess', data);
    io.sockets.emit('comesSomeone', data) //broadcast to all of connection

    let counter = 0;
    const alive = function () {
      if (socket.connected) {
        counter++;
        socket.emit('alive', {
          counter
        });
        setTimeout(() => {
          alive()
        }, 5000);
      }
    }
    alive();
  })

  socket.on('disconnect', function (data) {
    console.log("disconnect...");
  })

  //catch server unregistered event
  socket.on('*', function (packet) {
    if (socket.eventNames().indexOf(packet.data[0]) < 0) {
      console.log('unknown event : ', packet)
    }
  });

  socket.on('jsonrpc', function (json) {
    //dispatch jsonrpc to its handler
    jsonrpc.dispatch(json, (result) => {
      //send the result back
      socket.emit('jsonrpc', result.toJson());
    });
  })


  setTimeout(() => {
    //make a jsonrpc request
    const request = capi.multiply(5, 3);

    //set the handler for this request
    jsonrpc.bindResultHandler(request, data => {
      console.log('yes! we can! ', data)
    })
    socket.emit('jsonrpc', request.toJson())
    
  }, 1000);

})

var sio = app.listen(PORT);
console.log('app listen at ' + PORT);

