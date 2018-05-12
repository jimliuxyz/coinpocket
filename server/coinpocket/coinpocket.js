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
    return api.contract.deployed().then((instance) => {
        if (!api.instance)
          console.log(`contract addr : ${instance.address}`);
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

      const txhash = await api.instance.deposit.sendTransaction(type, amount, {
        from: addr,
      });
      return txhash;
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

      // var data = await api.instance.transfer(0, 1, receiver, {
      //   from: sender,
      // })

      var txhash = await api.instance.transfer.sendTransaction(type, amount, receiver, {
        from: sender,
      });
      return txhash;
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

      var txhash = await api.instance.withdraw.sendTransaction(type, amount, {
        from: addr,
      });
      return txhash;
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
    const tx = api.web3.eth.getTransaction(event.transactionHash);
    const sender = tx.from;
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

    // addr = '0xe3407dfed3582e3e7f16252d8bcbc62ad99eccc7'
    const txEvent = api.instance.txlog({}, {
      fromBlock: 0,
      toBlock: 'latest'
    });

    await txEvent.get(async (err, events) => {
      const list = [];
      if (!err) {
        await utils.asyncForEach(events, async event => {
          const receipt = await api.receiptlizeTxEvent(event);
          if (receipt && (addr == receipt.sender || addr == receipt.receiver))
            list.push(receipt);
        })
      }
      callback(list);
    })
  }
};

module.exports = api;