const program = require('commander');
const TruffleCfg = require('../truffle')


program
  .version('0.0.1')
  .option('-n, --network <type>', 'set network (see truffle.js)', 'development')
  .parse(process.argv);

//config shell
const config = {
  network: {
    host: "",
    port: 0,
    network_id: ""
  },
  jwt: {
    secret: 'vbVrtVipfv,dx'
  },
  database: {
    url : 'mongodb://localhost:27017/coinpocket'
    // url : 'mongodb://db:27017/coinpocket'
  }
}

//set blockchain network
config.network = TruffleCfg.networks[program.network]
if (typeof config.network == 'undefined') {
  console.error(`network "${program.network}" is undefined in truffle.js`)
  process.exit(1)
}



console.log("設定", JSON.stringify(config, undefined, 2))
module.exports = config