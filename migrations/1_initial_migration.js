var CoinPocket = artifacts.require("./CoinPocket.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(CoinPocket);
};
