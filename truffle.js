module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      // host: "127.0.0.1",
      host: "192.168.1.101",
      port: 8545,
      network_id: "*", // match any network
      gas: 3000000
    },
    live: {
      host: "127.0.0.1",
      port: 9453,
      network_id: 9453
    }
  }
};