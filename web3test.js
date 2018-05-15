const Web3 = require('web3')

const httpsoc = `http://127.0.0.1:8545`
const provider = new Web3.providers.HttpProvider(httpsoc);

const web3 = new Web3(provider);

console.log(`web3 : ${web3}`)
console.log(`web3.eth.coinbase : ${web3.eth.coinbase}`)

setTimeout(async () => {
  console.log("A")
  let account = await web3.personal.newAccount("");
  console.log("B ", account)
}, 1000);

