let serialInt = 0;
function getRandomInt() {
  const max = Number.MAX_SAFE_INTEGER
  return Math.floor(Math.random() * Math.floor(max));
}

function getSerialInt() {
  return ++serialInt;
}

function makeErrorResult(id, errcode, message) {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code: errcode,
      message
    },
  };
}

function toJson(json) {
  var copy = Object.assign({}, this);
  delete copy.toJson;

  return JSON.stringify(copy, undefined, 2)
}


class Test {

  /**
   * constructor
   * @param {api[]} apilist - api array
   */
  constructor(apilist) {
    this.apis = apilist;
    this.handlers = {};
  }

  /**
   * bind the result handler for request
   * @param {object} request - a jsonobj for this request
   * @param {Function} handler - (result, error) for handle this request
   */
  bindResultHandler(request, handler) {
    this.handlers[request.id] = handler;
  }

  /**
   * dispatch the jsonrpc to its handler and call the resolve with result
   * @param {string} json 
   * @param {Function} resolve - (result) handle result for send back
   */
  dispatch(json, resolve) {

    if (typeof json === 'undefined') {
      //do not respond
      return;
    }

    try {
      //parse json
      let jsonobj;
      try {
        jsonobj = JSON.parse(json);
        if (typeof jsonobj.id === 'undefined' || jsonobj.jsonrpc !== "2.0") {
          resolve(this.makeResult_InvalidRequest(jsonobj.id));
          return;
        }
      } catch (error) {
        resolve(this.makeResult_ParseError(jsonobj.id));
        return;
      }

      //call method
      if (jsonobj.method) {
        for (const api of this.apis) {
          if (api['_' + jsonobj.method]) {
            api['_' + jsonobj.method](jsonobj.id, jsonobj.params, resolve);
            return;
          }
        }
        resolve(this.makeResult_MethodNotFound(jsonobj.id));
        return;
      }
      //handle result
      else if (jsonobj.result || jsonobj.error) {
        if (this.handlers[jsonobj.id]) {
          const handler = this.handlers[jsonobj.id]
          delete this.handlers[jsonobj.id];

          handler(jsonobj.result, jsonobj.error);
          return;
        } else
          return;
      }

    } catch (error) {

    }
    //do not respond
  }

  static makeRequest(method, params) {
    return {
      jsonrpc: "2.0",
      method,
      params,
      "id": getRandomInt().toString(),
      toJson
    };
  }
  static makeResult(id, result, errcode, message) {
    var object = {};
    object.jsonrpc = "2.0";
    object.id = id;
    object.toJson = toJson;
    if (typeof errcode !== 'undefined') {
      object.error = {
        code: errcode,
        message
      }
    } else {
      object.result = result;
    }
    return object;
  }
  static makeResult_ParseError(id) {
    return makeErrorResult(id, -32700, "Parse Error");
  }
  static makeResult_InvalidRequest(id) {
    return makeErrorResult(id, -32600, "Invalid Request");
  }
  static makeResult_MethodNotFound(id) {
    return makeErrorResult(id, -32601, "Method Not Found");
  }
  static makeResult_InvalidParams(id) {
    return makeErrorResult(id, -32602, "Invalid Params");
  }
  static makeResult_InternalError(id) {
    return makeErrorResult(id, -32603, "Internal Error");
  }
  static makeResult_InternalError(id) {
    return makeErrorResult(id, -32603, "Internal Error");
  }
  static makeResult_CustomError(id) {
    return makeErrorResult(id, errcode, message);
  }
  static makeErrorResult(id) {
    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: errcode,
        message
      },
    };
  }
}

module.exports = Test;