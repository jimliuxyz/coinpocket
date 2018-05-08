"use strict";

const JsonRPC = require('./jsonrpc2-jlxyz');

class ServerRpcApi{
  /**
   * generate the 'sum' request (for caller)
   * @param {number} a 
   * @param {number} b 
   */
  sum(a, b) {
    return JsonRPC.makeRequest('sum', {a, b})
  }

  /**
   * handle the 'sum' request (for handler)
   * @param {string} id - the id of JsonRpc
   * @param {object} params - the params of JsonRpc
   * @param {Function} resolve - call this function to return result
   */
  _sum(id, params, resolve) {
    if (typeof params.a !== 'number' || typeof params.b !== 'number')
      resolve(JsonRPC.makeResult_InvalidParams(id))
    else
      resolve(JsonRPC.makeResult(id, `${params.a} + ${params.b} = ${params.a+params.b}`))
  }
}

module.exports.create = function () {
  return new ServerRpcApi();
}
