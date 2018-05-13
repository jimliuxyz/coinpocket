"use strict";

const config = require('./config');
const coinpocket = require("./coinpocket/providers.js").coinpocket()

coinpocket.deployed(async (instance) => {

  // console.log(`contract : ${CoinPocket.contractName} addr : ${instance.address}`)
  // console.log(`instance.txlog : ${instance.txlog}`)
  // console.log(`web3.eth.coinbase : ${web3.eth.coinbase}`)

  const web3 = coinpocket.web3;

  //txlog is a coustom event of smart contract
  // const exampleEvent = instance.txlog({}, {
  //   fromBlock: 0,
  //   toBlock: 'latest'
  // });
  const exampleEvent = instance.txlog();

  exampleEvent.watch(function (err, event) {
    if (err)
      return;
    
    const tx = web3.eth.getTransaction(event.transactionHash);
    const sender = tx.from;
    const receiver = event.args.receiver;
    const blockNumber = tx.blockNumber;

    console.log("===交易資訊===", tx);
    console.log("===交易事件===", event);

    // console.log(`#${blockNumber}:sender:${sender} receiver:${receiver}`, event.args);

    // console.log("listeners?", listeners)

    for (const id in listeners) {
      const listener = listeners[id];
      if (listener.addr == sender || listener.addr == receiver || listener.addr == '*')
        listener.callback(event);
    }
  })

}).catch(err => {
  console.log(err)
});

const listeners = {};

class EventWatcher{
  
  reg(id, addr, callback) {
    listeners[id] = { addr, callback };
    console.log('reg!')
  }
  
  unreg(id) {
    console.log('unreg!')
    delete listeners[name];
  }
}

module.exports = new EventWatcher();
