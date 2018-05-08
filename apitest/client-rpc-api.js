"use strict";

const JsonRPC = require('./jsonrpc2-jlxyz');

class ClientRpcApi{
  /**
   * generate the 'multiply' request (for caller)
   * @param {number} a 
   * @param {number} b 
   */
  multiply(a, b) {
    return JsonRPC.makeRequest('multiply', {a, b})
  }

  /**
   * handle the 'multiply' request (for handler)
   * @param {string} id - the id of JsonRpc
   * @param {object} params - the params of JsonRpc
   * @param {Function} resolve - call this function to return result
   */
  _multiply(id, params, resolve) {
    if (typeof params.a !== 'number' || typeof params.b !== 'number')
      resolve(JsonRPC.makeResult_InvalidParams(id))
    else
      resolve(JsonRPC.makeResult(id, `${params.a} x ${params.b} = ${params.a*params.b}`))
  }
}

module.exports.create = function () {
  return new ClientRpcApi();
}
