const config = require('./config');

const ClientRpcAPI = require('./client-rpc-api').API;
const ServerRpcService = require('./server-rpc-api').Service;
const JsonRPC = require('./jsonrpc2/jsonrpc2-jlxyz');

const coinpocket = require("./coinpocket/providers.js").coinpocket()
const watcher = require('./event-watcher');


var app = require('http').createServer();
var io = require('socket.io')(app);
var PORT = 8081;


io.on('connection', function (socket) {
  console.log('new connection~')

  const service = new ServerRpcService();
  const jsonrpc = new JsonRPC([service]);

  let listening = false;

  //override the service methods for easily control data flow.
  service._watchEvent = (id, params, resolve) => {
    if (listening) return;
    watcher.reg(service.user.name + socket.id, service.user.addr, async event => {
      let receipt = await coinpocket.receiptlizeTxEvent(event);
      await service.userlizeReceipt(receipt);

      const notify = ClientRpcAPI.takeReceipt(receipt);
      setTimeout(() => {
        socket.emit('jsonrpc', notify.toJson());
      }, 1000);
    });
  }

  service._logout = (id, params, resolve) => {
    console.log("logout~")
    socket.disconnect()
  }

  //handle jsonrpc
  socket.on('jsonrpc', function (json) {
    //dispatch jsonrpc to its handler
    jsonrpc.dispatch(json, (result) => {
      //send the result back
      // console.log("send the result back,", result);
      socket.emit('jsonrpc', result.toJson());
    });
  })

  socket.on('disconnect', data => {
    console.log("disconnected...");
    if (listening) {
      listening = false;
      watcher.unreg(service.user.name + socket.id);
    }
  })

})

//start server after contract depolyed
coinpocket.deployed(ready => {
  if (ready) {
    var sio = app.listen(PORT);
    console.log('app listen at ' + PORT);
  } else {
    console.log('contract not deployed! try "truffle migrate --reset" to deploy the contract');
    process.exit(1);
  }
})
