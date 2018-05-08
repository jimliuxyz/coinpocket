"use strict";

const JsonRPC = require('./jsonrpc2-jlxyz');
const sapi = require('./server-rpc-api').create();
const capi = require('./client-rpc-api').create();
const jsonrpc = new JsonRPC([sapi, capi]);

var PORT = 8081;
var io = require('socket.io-client');


var patch = require('socketio-wildcard')(io.Manager);

(function () {
  console.log("try....")
  var socket = io('ws://localhost:8081');
  patch(socket);

  socket.on('connect', data => {
    console.log("connected...")
  })

  socket.on('alive', data => {
    console.log("alive...", data.counter)
  })

  socket.on('disconnect', data => {
    console.log("disconnected...")
  })

  //catch client unregistered event
  socket.on('*', function (packet) {
    if (!socket.hasListeners(packet.data[0])) {
      console.log('unknown event : ', packet)
    }
  });

  const username = "jim"
  socket.emit('login', {
    username
  })
  socket.emit('heck', {
    username
  })

  socket.on('jsonrpc', function (json) {
    jsonrpc.dispatch(json, (result) => {
      socket.emit('jsonrpc', result.toJson());
    });
  })

  setTimeout(() => {
    
    //make a jsonrpc request object
    const request = sapi.sum(5, 3);

    jsonrpc.bindResultHandler(request, data => {
      console.log('yes! we can! ', data)
    })

    socket.emit('jsonrpc', request.toJson())
    
  }, 1000);

})()