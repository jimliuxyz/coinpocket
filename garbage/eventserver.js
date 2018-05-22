"use strict";

//import libraries
const Web3 = require('web3'),
    contract = require("truffle-contract"),
    path = require('path'),
    program = require('commander'),
    CoinPocketJSON = require(path.join(__dirname, 'build/contracts/CoinPocket.json'));

const TruffleCfg = require('./truffle')


//config program
program
    .version('0.0.1')
    .option('-n, --network <type>', 'set network (see truffle.js)', 'development')
    .parse(process.argv);

// process.env.CPK_NETWORK = program.network
// console.log(process.env)

const network = TruffleCfg.networks[program.network]
if (typeof network == 'undefined') {
    console.error(`network "${program.network}" is undefined in truffle.js`)
    process.exit(1)
}
const httpsoc = `http://${network.host}:${network.port}`

function showRuntimeEnv() {
    console.log(`network : ${JSON.stringify(network, undefined, 2)}`)
}
showRuntimeEnv();


//setup rpc connection
var provider = new Web3.providers.HttpProvider(httpsoc);


//generate a web3 instance
let web3 = new Web3(provider);
if (web3.isConnected()) {
    console.log(`web3.eth.coinbase : ${web3.eth.coinbase}`)
} else {
    console.error(`network connection fail!`)
    process.exit(1)
}


//generate a truffle contract instance (more like a class)
var CoinPocket = contract(CoinPocketJSON);
CoinPocket.setProvider(provider);



//try to get a callable contract instance
CoinPocket.deployed().then(function (instance) {

    // return instance.func.call(arg1, arg2, { from: '0x...' })  

    console.log(`contract : ${CoinPocket.contractName} addr : ${instance.address}`)
    console.log(`instance.txlog : ${instance.txlog}`)
    console.log(`web3.eth.coinbase : ${web3.eth.coinbase}`)

    
    //txlog is a coustom event of smart contract
    var exampleEvent = instance.txlog({
        fromBlock: 0,
        toBlock: 'latest'
    });

    exampleEvent.watch(function (err, result) {
        console.log("err", err)
        console.log("result", result)

        if (err) {
            return;
        }
        // console.log(result.args._value)

        console.log(`===交易事件===`)
        console.log(result)

        console.log("===交易資訊===")
        console.log(web3.eth.getTransaction(result.transactionHash))
    })


}).then(function (result) {
    console.log(result);
}, function (error) {
    console.log(error);
});