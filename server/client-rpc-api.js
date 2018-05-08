"use strict";

const JsonRPC = require('./jsonrpc2/jsonrpc2-jlxyz');

const API = {
  /**
   * got receipt
   * @param {object} receipt 
   */
  takeReceipt(receipt) {
    return JsonRPC.makeRequest('takeReceipt', {
      receipt
    })
  }
}



class Service {

  constructor() {
  }

  /**
   * handle the 'gotReceipt' request (for handler)
   * @param {string} id - the id of JsonRpc
   * @param {object} params - the params of JsonRpc
   * @param {Function} resolve - call this function to return result
   */
  _takeReceipt(id, params, resolve) {
    console.log("_gotReceipt", params)
  }
}

module.exports.API = API
module.exports.Service = Service
