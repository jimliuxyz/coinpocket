"use strict";

const cfg = require("./config.js")

console.log(cfg)
// const cfg2 = require('./server/nodeop')
// console.log(cfg2)

const web3_ = require("./coinpocket/providers.js").web3()
const coinpocket = require("./coinpocket/providers.js").coinpocket()

coinpocket.deployed(async (ready) => {
    // console.log("coinpocket", coinpocket)
    console.log("okay " + ready)

    coinpocket.detail()


}).catch(err => {console.log("xxxxxx ", err)});


(function wait() {
    setTimeout(() => {
        wait()
    }, 1000);
})();

// process.exit(0)

// //import libraries
// const Web3 = require('web3'),
//     contract = require("truffle-contract"),
//     path = require('path'),
//     // program = require('commander'),
//     CoinPocketJSON = require(path.join(__dirname, 'build/contracts/CoinPocket.json'));

// const TruffleCfg = require('./truffle')


// //config program
// // program
// //     .version('0.0.1')
// //     .option('-n, --network <type>', 'set network (see truffle.js)', 'development')
// //     .parse(process.argv);



// const network = TruffleCfg.networks[program.network]
// if (typeof network == 'undefined') {
//     console.error(`network "${program.network}" is undefined in truffle.js`)
//     process.exit(1)
// }



// const httpsoc = `http://${network.host}:${network.port}`

// function showRuntimeEnv() {
//     console.log(`network : ${JSON.stringify(network, undefined, 2)}`)
// }
// showRuntimeEnv();


// //setup rpc connection
// var provider = new Web3.providers.HttpProvider(httpsoc);


// //generate a web3 instance
// let web3 = new Web3(provider);
// if (web3.isConnected()) {
//     console.log(`web3.eth.coinbase : ${web3.eth.coinbase}`)
// } else {
//     console.error(`network connection fail!`)
//     process.exit(1)
// }


// //generate a truffle contract instance (more like a class)
// var CoinPocket = contract(CoinPocketJSON);
// CoinPocket.setProvider(provider);



// //try to get a callable contract instance
// CoinPocket.deployed().then(function (instance) {

//     // return instance.func.call(arg1, arg2, { from: '0x...' })  

//     console.log(`contract : ${CoinPocket.contractName} addr : ${instance.address}`)

//     let promise = instance.sayHello();
//     promise.then(data => {
//             console.log(`data : ${data}`)
//         })
//         .catch(err => {
//             console.log(`err : ${err}`)
//         })



//     // console.log(instance.deposit)
//     // instance.deposit(0, 1).then(()=>{
//     // })


//     // instance.detail({from: web3.eth.coinbase}).then((data)=>{
//     //     console.log(data)
//     //     console.log(data[0].c)
//     // })

//     // instance.deposit(0, 4, {from: web3.eth.coinbase}).then((data)=>{
//     //     //receipt:
//     //     // console.log(data)
//     // })



// }).then(function (result) {
//     console.log(result);
// }, function (error) {
//     console.log(error);
// });


// (function wait(){
//     setTimeout(() => {
//         wait()
//     }, 1000);
// })()