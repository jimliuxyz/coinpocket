const cfg = require("../config.js")
const coinpocket = require("./coinpocket.js")

const Web3 = require('web3'),
  contract = require("truffle-contract"),
  CoinPocketJSON = require('../../build/contracts/CoinPocket.json');

const httpsoc = `http://${cfg.network.host}:${cfg.network.port}`
const provider = new Web3.providers.HttpProvider(httpsoc);

const web3 = new Web3(provider);
if (!web3.isConnected()) {
  console.error(`network connection fail!`)
  process.exit(1);
}

// console.log(web3)
console.log(`web3.eth.coinbase : ${web3.eth.coinbase}`)

var CoinPocket = contract(CoinPocketJSON);
CoinPocket.setProvider(provider);

module.exports.web3 = function () {
  return web3;
}

module.exports.coinpocket = function (callback) {
  coinpocket.contract = CoinPocket
  coinpocket.web3 = web3

  // CoinPocket.deployed().then((instance) => {
  //   console.log("3???")

  // })
  //   .catch(err => console.log("xxx"))
  
  return coinpocket;
}
