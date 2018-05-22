const cfg = require("../config")
const utils = require("../utils")

var api = {
  web3: null,
  contract: null,
  instance: null,

  /**
   * you should call this at least once to bring up your app
   * (call the callback if the contract deployed)
   * @param {Function(boolean)} callback
   * @return {Promise<object>} return contract instance
   */
  deployed: (callback) => {
    // console.log("waiting contract deployed response...");
    return api.contract.deployed().then(async (instance) => {
        if (!api.instance)
          console.log(`contract addr : ${instance.address}`);
      
          const balance_coinbase = await api.web3.eth.getBalance(api.web3.eth.coinbase)
          console.log("coinbase : ", balance_coinbase.toString())
          // console.log("coinbase : ", api.web3.toEther('0x'+balance_coinbase.toString('hex'), 'wei'))
      
        api.instance = instance;
        callback(instance);
      })
      .catch(err => {
        callback();
      })
  },

  /**
   * deposit money into addr (mint for addr itself for now)
   * @param {string} addr
   * @param {number} type
   * @param {number} amount
   */
  deposit: async (addr, type, amount, passphrase) => {
    await api.web3.personal.unlockAccount(addr, passphrase);
    
    const balance = await api.web3.eth.getBalance(addr)

    console.log(balance.toString())

      /**
       * there are two ways to send and get back tx result
       * 
       * 1. await instance.deposit.sendTransaction(type, amount, {})
       * > it'll return fullly information of tx (tx/logs/receipt)
       * 
       * 2. await instance.deposit(type, amount, {})
       * > it'll return a tx hash string only
       * > this way makes `event watcher of truffle` lost receipt event sometimes
       * 
       * http://truffleframework.com/docs/getting_started/contracts
       */
      
      const txinfo = await api.instance.deposit(type, amount, {
        from: addr,
        gas: 300000,
        gasPrice: api.web3.toWei(1, 'wei'),
      });
      return txinfo.tx
  },

  /**
   * transfer money from sender to receiver
   * @param {string} sender
   * @param {string} receiver
   * @param {number} type
   * @param {number} amount
   * @return {string} transaction hash
   */
  transfer: async (sender, receiver, type, amount, passphrase) => {
      await api.web3.personal.unlockAccount(sender, passphrase);

      var txinfo = await api.instance.transfer(type, amount, receiver, {
        from: sender,
        gas: 300000,
        gasPrice: api.web3.toWei(1, 'wei'),
      });
      return txinfo.tx;
  },

  /**
   * withdraw money from addr
   * @param {string} addr
   * @param {number} type
   * @param {number} amount
   * @return {string} transaction hash
   */
  withdraw: async (addr, type, amount, passphrase) => {
      await api.web3.personal.unlockAccount(addr, passphrase);

      var txinfo = await api.instance.withdraw(type, amount, {
        from: addr,
        gas: 300000,
        gasPrice: api.web3.toWei(1, 'wei'),
      });
      return txinfo.tx;
  },

  /**
   * get balance of a addr
   * @param {string} addr
   * @return {Promise<string[]>} balance of each Dollar
   */
  balance: async (addr) => {
    const data = await api.instance.detail({
      from: addr
    })
    // console.log(data)
    return data.map(v => v.toString());
  },

  /**
   * create new account
   * @param {string} passphrase - password
   * @return {Promise<string>} addr
   */
  newAccount: async (passphrase) => {
      const account = await api.web3.personal.newAccount(passphrase);

      //give some money as gas to account to make it able to transaction
      const txhash = await api.web3.eth.sendTransaction({
        from: api.web3.eth.coinbase,
        to: account,
        value: api.web3.toWei(0.1, "ether")
      });
      return account
  },

  receiptlizeTxEvent: async (event) => {
    // const tx = api.web3.eth.getTransaction(event.transactionHash);
    // const sender = tx.from;

    const sender = event.args.sender;
    const receiver = event.args.receiver;
    return {
      txhash: event.transactionHash,
      sender,
      dtypes: event.args.dtypes,
      action: event.args.action,
      amount: event.args.amount,
      receiver: event.args.receiver,
    }
  },

  /**
   * list contract event as receipt
   * @param {string} addr
   * @param {Function} callback callback with receipt list
   */
  listReceipt: async (addr, callback) => {
    console.log("try listReceipt...")
    // addr = '0xe3407dfed3582e3e7f16252d8bcbc62ad99eccc7'
    const txEvent = api.instance.txlog({}, {
      fromBlock: 0,
      toBlock: 'latest'
    });

    await txEvent.get(async (err, events) => {
      const list = [];
      // console.log("caller addr : ", addr)
      console.log("total events", events.length)

      if (!err) {
        await utils.asyncForEach(events, async event => {
          const receipt = await api.receiptlizeTxEvent(event);
          if (receipt && (addr == receipt.sender || addr == receipt.receiver))
            list.push(receipt);
          })
      }
      // console.log("list", list.length)

      callback(list);
    })
  }
};

module.exports = api;