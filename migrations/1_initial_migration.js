var CoinPocket = artifacts.require("./CoinPocket.sol");

module.exports = function(deployer) {
  deployer.deploy(CoinPocket);
};
