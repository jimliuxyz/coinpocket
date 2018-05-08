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
  }
}

const TOKEN_EXPIRES = 60;
const users = {};

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

async function addr2User(addr) {
  const user = await User.findOne({
    addr
  });
  return user?user.name:addr;
}


class Service {

  constructor() {
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
      return false;
    }
    return true;
  }

  /**
   * receipt addr to username
   * @param {*} receipt a normalized txEvent
   */
  async normalizeReceipt(receipt) {
    receipt.receiver = await addr2User(receipt.receiver);
    receipt.sender = await addr2User(receipt.sender);
  }

  async _listReceipt(id, params, resolve) {

    const list = await coinpocket.listReceipt(this.user.addr, async list => {
      //map addr to username
      await utils.asyncForEach(list, async receipt => {
        // receipt.receiver = await addr2User(receipt.receiver);
        // receipt.sender = await addr2User(receipt.sender);
        await this.normalizeReceipt
        (receipt);
      })

      return resolve(JsonRPC.makeResult(id, {
        list,
      }));
    });
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
            const token = signJwt(user);
            return resolve(JsonRPC.makeResult(id, {
              ok: true,
              token
            }));
          })
        } else {
          //existing user
          this.user = user;

          //resign a new token
          const token = signJwt(user);
          return resolve(JsonRPC.makeResult(id, {
            ok: true,
            token
          }));
        }
      })
    } else if (typeof params.token === 'string') {
      jwt.verify(params.token, config.jwt.secret, function (err, decoded) {
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
}

module.exports.API = API
module.exports.Service = Service