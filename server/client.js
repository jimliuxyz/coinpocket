"use strict";

const JsonRPC = require('./jsonrpc2/jsonrpc2-jlxyz');
const sapi = require('./server-rpc-api').API;

const ClientRpcService = require('./client-rpc-api').Service;
const jsonrpc = new JsonRPC([new ClientRpcService()]);

var PORT = 8081;
var io = require('socket.io-client');

(function () {
  var socket = io('http://localhost:8081');

  socket.on('jsonrpc', function (json) {
    // console.log('got ....', json)
    jsonrpc.dispatch(json, (result) => {
      socket.emit('jsonrpc', result.toJson());
    });
  })

  socket.on('connect__', data => {
    const request = sapi.login('Jim1qq', '123');
    jsonrpc.bindResultHandler(request, result => {
      const request = sapi.listReceipt();
      socket.emit('jsonrpc', request.toJson());

    })
    socket.emit('jsonrpc', request.toJson());
  })

  socket.on('connect', data => {
    const request = sapi.login('guest', '123');
    jsonrpc.bindResultHandler(request, result => {
    })
    socket.emit('jsonrpc', request.toJson());
  })

  socket.on('connect_', data => {
    console.log("connected...")

    //try login...
    const request = sapi.login('jim5', '123');
    jsonrpc.bindResultHandler(request, result => {
      if (result.ok) {
        console.log('login ok! ', result);
        const request = sapi.listReceipt();
        jsonrpc.bindResultHandler(request, result => {
          console.log('my events! ', result);
          socket.emit('jsonrpc', sapi.watchEvent().toJson());

          const request = sapi.deposit(0, 88);
          jsonrpc.bindResultHandler(request, result => {
            console.log("tx?", result);

            const request = sapi.transfer(0, 5, "jim7");
            jsonrpc.bindResultHandler(request, result => {
              console.log("tx?", result);
              
            });
            socket.emit('jsonrpc', request.toJson());
            
          });
          socket.emit('jsonrpc', request.toJson());

        });
        socket.emit('jsonrpc', request.toJson());
      }
    })
    socket.emit('jsonrpc', request.toJson());
  })

  socket.on('disconnect', data => {
    console.log("disconnected...")
  })



  setTimeout(() => {}, 1000);

})()