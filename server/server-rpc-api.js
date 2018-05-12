"use strict";

const config = require('./config');
const JsonRPC = require('./jsonrpc2/jsonrpc2-jlxyz');
const mongoose = require('mongoose');
const User = require('./user');
const jwt = require('jsonwebtoken');
const utils = require("./utils")

mongoose.connect(config.database.url);

const coinpocket = require("./coinpocket/providers.js").coinpocket()

coinpocket.deployed(async (ready) => {
  return;

  // const addr = await coinpocket.newAccount();
  const receiver = "0x8e8b053BD34F3E1795b66f3A3470aE0D249b4Ad7"
  const addr = "0x6b1bb7de09c02f1b7194329f7f4561616fc620a3"
  console.log("newAccount", addr);

  // const txhash = await coinpocket.deposit(addr, 0, 100);
  // const txhash = await coinpocket.transfer(addr, receiver, 0, 1);
  const txhash = await coinpocket.withdraw(addr, 0, 1);

  // coinpocket.detail(addr);
  console.log("addr", await coinpocket.detail(addr));
  console.log("receiver", await coinpocket.detail(receiver));

}).catch(err => {
  console.log(err)
});

const API = {

  ERR_LOGIN_FAILED: {
    code: 100,
    desc: 'ERR_LOGIN_FAILED'
  },
  ERR_API_NOT_READY: {
    code: 101,
    desc: 'ERR_API_NOT_READY'
  },
  ERR_JWT_EXPIRED: {
    code: 102,
    desc: 'ERR_JWT_EXPIRED'
  },
  ERR_TRANSACTION_FAILED: {
    code: 103,
    desc: 'ERR_TRANSACTION_FAILED'
  },
  ERR_TRANSFER_FAILED: {
    code: 104,
    desc: 'ERR_TRANSFER_FAILED'
  },

  /**
   * generate the 'login' request (for caller)
   * @param {string} name 
   * @param {string} pwd
   * @param {string} token
   */
  login(name, pwd, token) {
    return JsonRPC.makeRequest('login', {
      name,
      pwd,
      token
    });
  },

  logout(name, pwd, token) {
    return JsonRPC.makeRequest('login', {});
  },

  /**
   * watch the contract event
   */
  watchEvent() {
    return JsonRPC.makeRequest('watchEvent', {});
  },

  /**
   * get the all contract event
   */
  listReceipt() {
    return JsonRPC.makeRequest('listReceipt', {});
  },

  balance(type, amount) {
    return JsonRPC.makeRequest('balance', {});
  },
  
  /**
   * deposit money into user addr
   * @param {number} type
   * @param {number} amount
   */
  deposit(type, amount) {
    return JsonRPC.makeRequest('deposit', {
      type,
      amount
    });
  },  
  /**
   * withdraw money from user addr
   * @param {number} type
   * @param {number} amount
   */
  withdraw(type, amount) {
    return JsonRPC.makeRequest('withdraw', {
      type,
      amount
    });
  },  
  /**
   * transfer money user addr to account
   * @param {number} type
   * @param {number} amount
   * @param {string} account
   */
  transfer(type, amount, receiver) {
    return JsonRPC.makeRequest('transfer', {
      type,
      amount,
      receiver
    });
  },

}

const TOKEN_EXPIRES = 60;
const users = {};
const addrMap = {}; //indexed by addr
const userMap = {}; //indexed by username

/**
 * sign jwt by payload
 * @param {object} payload object
 * @return {string} jwt token
 */
function signJwt(user) {
  const payload = {
    name: user.name
  }

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: TOKEN_EXPIRES
  })
}

async function addr2username(addr) {
  if (addrMap[addr]) return addrMap[addr];

  const user = await User.findOne({
    addr
  });

  if (user) {
    addrMap[addr] = user.name;
    userMap[user.name] = addr;
  }
  return user ? user.name : undefined;
}

async function username2addr(name) {
  if (userMap[name]) return userMap[name];

  const user = await User.findOne({
    name
  });

  if (user) {
    addrMap[addr] = user.name;
    userMap[user.name] = addr;
  }
  return user ? user.addr : undefined;
}
let idcnt = 0;

class Service {

  constructor() {
    this.id = ++idcnt
    this.user;
    this.jwtoken;
  }

  /**
   * 
   * @param {object} jsonobj - jsonrpc 
   * @return {boolean} return true if allow this rpc otherwise return false
   */
  guard(jsonobj) {
    if (!this.user && jsonobj.method !== 'login') {
      console.error("you're not logged!!")
      return false;
    }
    return true;
  }

  /**
   * receipt addr to username
   * @param {*} receipt a receiptlized txEvent
   */
  async userlizeReceipt(receipt) {
    receipt.receiver = (await addr2username(receipt.receiver)) || receipt.receiver;
    receipt.sender = (await addr2username(receipt.sender)) || receipt.sender;
  }

  async _listReceipt(id, params, resolve) {

    const list = await coinpocket.listReceipt(this.user.addr, async list => {
      //map addr to username
      await utils.asyncForEach(list, async receipt => {
        await this.userlizeReceipt(receipt);
      })

      return resolve(JsonRPC.makeResult(id, {
        list,
      }));
    });
  }

  /**
   * watch events (this function is overrided by server.js)
   */
  async _watchEvent(id, params, resolve) {
  }

  /**
   * handle the 'sum' request (for handler)
   * @param {string} id - the id of JsonRpc
   * @param {object} params - the params of JsonRpc
   * @param {Function} resolve - call this function to return result
   */
  _login(id, params, resolve) {
    console.log("try login...", params)
    if (typeof params.name === 'string' && typeof params.pwd === 'string') {
      const name = params.name
      const pwd = params.pwd
      console.log("params.name/pwd ", name, pwd)

      //find user
      User.findOne({
        name
      }, async (err, user) => {
        if (err) {
          return resolve(JsonRPC.makeResult_CustomError(id, API.ERR_LOGIN_FAILED));
        }
        //not found
        if (!user) {
          //create new user
          const addr = await coinpocket.newAccount("");
          const userdata = {
            name,
            pwd,
            addr
          }
          console.log('create new user', userdata)

          this.user = new User(userdata);
          this.user.save((err) => {
            if (err) {
              return resolve(JsonRPC.makeResult_CustomError(id, API.ERR_LOGIN_FAILED));
            };

            //resign a new token
            const token = signJwt(this.user);
            return resolve(JsonRPC.makeResult(id, {
              ok: true,
              token
            }));
          })
        } else {
          //existing user
          this.user = user;
          console.log('existing user', user)

          //resign a new token
          const token = signJwt(user);
          return resolve(JsonRPC.makeResult(id, {
            ok: true,
            token
          }));
        }
      })
    } else if (typeof params.token === 'string') {
      jwt.verify(params.token, config.jwt.secret, (err, decoded) => {
        if (err)
          return resolve(JsonRPC.makeResult_CustomError(id, API.ERR_JWT_EXPIRED));
        
        User.findOne({
          name: decoded.name
        }, async (err, user) => {
          if (err)
            return resolve(JsonRPC.makeResult_CustomError(id, API.ERR_JWT_EXPIRED));

            this.user = user;

          //resign a new token
          const token = signJwt(user);
          return resolve(JsonRPC.makeResult(id, {
            ok: true,
            token
          }));
        })
      })
    } else
      return resolve(JsonRPC.makeResult_InvalidParams(id));
  }

  async _balance(id, params, resolve) {
    const addr = this.user.addr;
    const balance = await coinpocket.balance(addr);

    return resolve(JsonRPC.makeResult(id, {
      balance,
    }));
  }

  async _deposit(id, params, resolve) {
    if (typeof params.type === 'number' && typeof params.amount === 'number') {
      const type = params.type;
      const amount = params.amount;
      const addr = this.user.addr;
      const passphrase = "";

      try {
        const txhash = await coinpocket.deposit(addr, type, amount, passphrase);
        return resolve(JsonRPC.makeResult(id, {
          txhash,
        }));
      } catch (error) {
        console.log(error)
        return resolve(JsonRPC.makeResult_CustomError(id, API.ERR_TRANSACTION_FAILED));
      }
    }
  }
  
  async _withdraw(id, params, resolve) {
    if (typeof params.type === 'number' && typeof params.amount === 'number') {
      const type = params.type;
      const amount = params.amount;
      const addr = this.user.addr;
      const passphrase = "";
      try {
        const txhash = await coinpocket.withdraw(addr, type, amount, passphrase);
        return resolve(JsonRPC.makeResult(id, {
          txhash,
        }));
      } catch (error) {
        console.log(error)
        return resolve(JsonRPC.makeResult_CustomError(id, API.ERR_TRANSACTION_FAILED));
      }
    }
  }
  
  async _transfer(id, params, resolve) {
    if (typeof params.type === 'number' && typeof params.amount === 'number' && typeof params.receiver === 'string') {
      const type = params.type;
      const amount = params.amount;
      const sender = this.user.addr;
      const receiver = await User.findOne({
        name: params.receiver
      });
      if (!receiver) {
        return resolve(JsonRPC.makeResult_CustomError(id, API.ERR_TRANSFER_FAILED))
      }

      const passphrase = "";
      try {
        const txhash = await coinpocket.transfer(sender, receiver.addr, type, amount, passphrase);
        return resolve(JsonRPC.makeResult(id, {
          txhash,
        }));
      } catch (error) {
        console.log(error)
        return resolve(JsonRPC.makeResult_CustomError(id, API.ERR_TRANSACTION_FAILED));
      }
    }
  }

}

module.exports.API = API
module.exports.Service = Service