// read more about test script http://truffleframework.com/docs/getting_started/javascript-tests

var CoinPocket = artifacts.require("./CoinPocket.sol");

contract('CoinPocket', function(accounts) {

  console.log(accounts)

  it("should web3 instance work", function() {
    let balance = web3.eth.getBalance(accounts[0]);
  });

  it("should get the hello message", function() {
    return CoinPocket.deployed().then(function(instance) {
      //instance.sayHello.call()
      return instance.sayHello();
    }).then(function(msg) {
      console.log(msg);
      assert(msg, "got empty message");
    });
  });
});
