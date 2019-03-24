var MyMoneroCoreCpp = (function() {
  var _scriptDir =
    typeof document !== "undefined" && document.currentScript
      ? document.currentScript.src
      : undefined;
  return function(MyMoneroCoreCpp) {
    MyMoneroCoreCpp = MyMoneroCoreCpp || {};

    var Module = typeof MyMoneroCoreCpp !== "undefined" ? MyMoneroCoreCpp : {};
    var moduleOverrides = {};
    var key;
    for (key in Module) {
      if (Module.hasOwnProperty(key)) {
        moduleOverrides[key] = Module[key];
      }
    }
    Module["arguments"] = [];
    Module["thisProgram"] = "./this.program";
    Module["quit"] = function(status, toThrow) {
      throw toThrow;
    };
    Module["preRun"] = [];
    Module["postRun"] = [];
    var ENVIRONMENT_IS_WEB = false;
    var ENVIRONMENT_IS_WORKER = false;
    var ENVIRONMENT_IS_NODE = false;
    var ENVIRONMENT_IS_SHELL = false;
    ENVIRONMENT_IS_WEB = typeof window === "object";
    ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
    ENVIRONMENT_IS_NODE =
      typeof process === "object" &&
      typeof require === "function" &&
      !ENVIRONMENT_IS_WEB &&
      !ENVIRONMENT_IS_WORKER;
    ENVIRONMENT_IS_SHELL =
      !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
    if (Module["ENVIRONMENT"]) {
      throw new Error(
        "Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -s ENVIRONMENT=web or -s ENVIRONMENT=node)"
      );
    }
    assert(
      typeof Module["memoryInitializerPrefixURL"] === "undefined",
      "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead"
    );
    assert(
      typeof Module["pthreadMainPrefixURL"] === "undefined",
      "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead"
    );
    assert(
      typeof Module["cdInitializerPrefixURL"] === "undefined",
      "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead"
    );
    assert(
      typeof Module["filePackagePrefixURL"] === "undefined",
      "Module.filePackagePrefixURL option was removed, use Module.locateFile instead"
    );
    var scriptDirectory = "";
    function locateFile(path) {
      if (Module["locateFile"]) {
        return Module["locateFile"](path, scriptDirectory);
      } else {
        return scriptDirectory + path;
      }
    }
    if (ENVIRONMENT_IS_NODE) {
      scriptDirectory = __dirname + "/";
      var nodeFS;
      var nodePath;
      Module["read"] = function shell_read(filename, binary) {
        var ret;
        if (!nodeFS) nodeFS = require("fs");
        if (!nodePath) nodePath = require("path");
        filename = nodePath["normalize"](filename);
        ret = nodeFS["readFileSync"](filename);
        return binary ? ret : ret.toString();
      };
      Module["readBinary"] = function readBinary(filename) {
        var ret = Module["read"](filename, true);
        if (!ret.buffer) {
          ret = new Uint8Array(ret);
        }
        assert(ret.buffer);
        return ret;
      };
      if (process["argv"].length > 1) {
        Module["thisProgram"] = process["argv"][1].replace(/\\/g, "/");
      }
      Module["arguments"] = process["argv"].slice(2);
      process["on"]("unhandledRejection", abort);
      Module["quit"] = function(status) {
        process["exit"](status);
      };
      Module["inspect"] = function() {
        return "[Emscripten Module object]";
      };
    } else if (ENVIRONMENT_IS_SHELL) {
      if (typeof read != "undefined") {
        Module["read"] = function shell_read(f) {
          return read(f);
        };
      }
      Module["readBinary"] = function readBinary(f) {
        var data;
        if (typeof readbuffer === "function") {
          return new Uint8Array(readbuffer(f));
        }
        data = read(f, "binary");
        assert(typeof data === "object");
        return data;
      };
      if (typeof scriptArgs != "undefined") {
        Module["arguments"] = scriptArgs;
      } else if (typeof arguments != "undefined") {
        Module["arguments"] = arguments;
      }
      if (typeof quit === "function") {
        Module["quit"] = function(status) {
          quit(status);
        };
      }
    } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
      if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href;
      } else if (document.currentScript) {
        scriptDirectory = document.currentScript.src;
      }
      if (_scriptDir) {
        scriptDirectory = _scriptDir;
      }
      if (scriptDirectory.indexOf("blob:") !== 0) {
        scriptDirectory = scriptDirectory.substr(
          0,
          scriptDirectory.lastIndexOf("/") + 1
        );
      } else {
        scriptDirectory = "";
      }
      Module["read"] = function shell_read(url) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);
        return xhr.responseText;
      };
      if (ENVIRONMENT_IS_WORKER) {
        Module["readBinary"] = function readBinary(url) {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", url, false);
          xhr.responseType = "arraybuffer";
          xhr.send(null);
          return new Uint8Array(xhr.response);
        };
      }
      Module["readAsync"] = function readAsync(url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "arraybuffer";
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
            onload(xhr.response);
            return;
          }
          onerror();
        };
        xhr.onerror = onerror;
        xhr.send(null);
      };
      Module["setWindowTitle"] = function(title) {
        document.title = title;
      };
    } else {
      throw new Error("environment detection error");
    }
    var out =
      Module["print"] ||
      (typeof console !== "undefined"
        ? console.log.bind(console)
        : typeof print !== "undefined"
        ? print
        : null);
    var err =
      Module["printErr"] ||
      (typeof printErr !== "undefined"
        ? printErr
        : (typeof console !== "undefined" && console.warn.bind(console)) ||
          out);
    for (key in moduleOverrides) {
      if (moduleOverrides.hasOwnProperty(key)) {
        Module[key] = moduleOverrides[key];
      }
    }
    moduleOverrides = undefined;
    var STACK_ALIGN = 16;
    stackSave = stackRestore = stackAlloc = setTempRet0 = getTempRet0 = function() {
      abort(
        "cannot use the stack before compiled code is ready to run, and has provided stack access"
      );
    };
    function staticAlloc(size) {
      assert(!staticSealed);
      var ret = STATICTOP;
      STATICTOP = (STATICTOP + size + 15) & -16;
      assert(
        STATICTOP < TOTAL_MEMORY,
        "not enough memory for static allocation - increase TOTAL_MEMORY"
      );
      return ret;
    }
    function dynamicAlloc(size) {
      assert(DYNAMICTOP_PTR);
      var ret = HEAP32[DYNAMICTOP_PTR >> 2];
      var end = (ret + size + 15) & -16;
      HEAP32[DYNAMICTOP_PTR >> 2] = end;
      if (end >= TOTAL_MEMORY) {
        var success = enlargeMemory();
        if (!success) {
          HEAP32[DYNAMICTOP_PTR >> 2] = ret;
          return 0;
        }
      }
      return ret;
    }
    function alignMemory(size, factor) {
      if (!factor) factor = STACK_ALIGN;
      var ret = (size = Math.ceil(size / factor) * factor);
      return ret;
    }
    function getNativeTypeSize(type) {
      switch (type) {
        case "i1":
        case "i8":
          return 1;
        case "i16":
          return 2;
        case "i32":
          return 4;
        case "i64":
          return 8;
        case "float":
          return 4;
        case "double":
          return 8;
        default: {
          if (type[type.length - 1] === "*") {
            return 4;
          } else if (type[0] === "i") {
            var bits = parseInt(type.substr(1));
            assert(bits % 8 === 0);
            return bits / 8;
          } else {
            return 0;
          }
        }
      }
    }
    function warnOnce(text) {
      if (!warnOnce.shown) warnOnce.shown = {};
      if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text);
      }
    }
    var asm2wasmImports = {
      "f64-rem": function(x, y) {
        return x % y;
      },
      debugger: function() {
        debugger;
      }
    };
    var functionPointers = new Array(0);
    var GLOBAL_BASE = 1024;
    var ABORT = false;
    var EXITSTATUS = 0;
    function assert(condition, text) {
      if (!condition) {
        abort("Assertion failed: " + text);
      }
    }
    function setValue(ptr, value, type, noSafe) {
      type = type || "i8";
      if (type.charAt(type.length - 1) === "*") type = "i32";
      switch (type) {
        case "i1":
          HEAP8[ptr >> 0] = value;
          break;
        case "i8":
          HEAP8[ptr >> 0] = value;
          break;
        case "i16":
          HEAP16[ptr >> 1] = value;
          break;
        case "i32":
          HEAP32[ptr >> 2] = value;
          break;
        case "i64":
          (tempI64 = [
            value >>> 0,
            ((tempDouble = value),
            +Math_abs(tempDouble) >= 1
              ? tempDouble > 0
                ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) |
                    0) >>>
                  0
                : ~~+Math_ceil(
                    (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
                  ) >>> 0
              : 0)
          ]),
            (HEAP32[ptr >> 2] = tempI64[0]),
            (HEAP32[(ptr + 4) >> 2] = tempI64[1]);
          break;
        case "float":
          HEAPF32[ptr >> 2] = value;
          break;
        case "double":
          HEAPF64[ptr >> 3] = value;
          break;
        default:
          abort("invalid type for setValue: " + type);
      }
    }
    var ALLOC_NORMAL = 0;
    var ALLOC_STATIC = 2;
    var ALLOC_NONE = 4;
    function allocate(slab, types, allocator, ptr) {
      var zeroinit, size;
      if (typeof slab === "number") {
        zeroinit = true;
        size = slab;
      } else {
        zeroinit = false;
        size = slab.length;
      }
      var singleType = typeof types === "string" ? types : null;
      var ret;
      if (allocator == ALLOC_NONE) {
        ret = ptr;
      } else {
        ret = [
          typeof _malloc === "function" ? _malloc : staticAlloc,
          stackAlloc,
          staticAlloc,
          dynamicAlloc
        ][allocator === undefined ? ALLOC_STATIC : allocator](
          Math.max(size, singleType ? 1 : types.length)
        );
      }
      if (zeroinit) {
        var stop;
        ptr = ret;
        assert((ret & 3) == 0);
        stop = ret + (size & ~3);
        for (; ptr < stop; ptr += 4) {
          HEAP32[ptr >> 2] = 0;
        }
        stop = ret + size;
        while (ptr < stop) {
          HEAP8[ptr++ >> 0] = 0;
        }
        return ret;
      }
      if (singleType === "i8") {
        if (slab.subarray || slab.slice) {
          HEAPU8.set(slab, ret);
        } else {
          HEAPU8.set(new Uint8Array(slab), ret);
        }
        return ret;
      }
      var i = 0,
        type,
        typeSize,
        previousType;
      while (i < size) {
        var curr = slab[i];
        type = singleType || types[i];
        if (type === 0) {
          i++;
          continue;
        }
        assert(type, "Must know what type to store in allocate!");
        if (type == "i64") type = "i32";
        setValue(ret + i, curr, type);
        if (previousType !== type) {
          typeSize = getNativeTypeSize(type);
          previousType = type;
        }
        i += typeSize;
      }
      return ret;
    }
    function getMemory(size) {
      if (!staticSealed) return staticAlloc(size);
      if (!runtimeInitialized) return dynamicAlloc(size);
      return _malloc(size);
    }
    function Pointer_stringify(ptr, length) {
      if (length === 0 || !ptr) return "";
      var hasUtf = 0;
      var t;
      var i = 0;
      while (1) {
        assert(ptr + i < TOTAL_MEMORY);
        t = HEAPU8[(ptr + i) >> 0];
        hasUtf |= t;
        if (t == 0 && !length) break;
        i++;
        if (length && i == length) break;
      }
      if (!length) length = i;
      var ret = "";
      if (hasUtf < 128) {
        var MAX_CHUNK = 1024;
        var curr;
        while (length > 0) {
          curr = String.fromCharCode.apply(
            String,
            HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK))
          );
          ret = ret ? ret + curr : curr;
          ptr += MAX_CHUNK;
          length -= MAX_CHUNK;
        }
        return ret;
      }
      return UTF8ToString(ptr);
    }
    var UTF8Decoder =
      typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;
    function UTF8ArrayToString(u8Array, idx) {
      var endPtr = idx;
      while (u8Array[endPtr]) ++endPtr;
      if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
        return UTF8Decoder.decode(u8Array.subarray(idx, endPtr));
      } else {
        var u0, u1, u2, u3, u4, u5;
        var str = "";
        while (1) {
          u0 = u8Array[idx++];
          if (!u0) return str;
          if (!(u0 & 128)) {
            str += String.fromCharCode(u0);
            continue;
          }
          u1 = u8Array[idx++] & 63;
          if ((u0 & 224) == 192) {
            str += String.fromCharCode(((u0 & 31) << 6) | u1);
            continue;
          }
          u2 = u8Array[idx++] & 63;
          if ((u0 & 240) == 224) {
            u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
          } else {
            u3 = u8Array[idx++] & 63;
            if ((u0 & 248) == 240) {
              u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | u3;
            } else {
              u4 = u8Array[idx++] & 63;
              if ((u0 & 252) == 248) {
                u0 =
                  ((u0 & 3) << 24) | (u1 << 18) | (u2 << 12) | (u3 << 6) | u4;
              } else {
                u5 = u8Array[idx++] & 63;
                u0 =
                  ((u0 & 1) << 30) |
                  (u1 << 24) |
                  (u2 << 18) |
                  (u3 << 12) |
                  (u4 << 6) |
                  u5;
              }
            }
          }
          if (u0 < 65536) {
            str += String.fromCharCode(u0);
          } else {
            var ch = u0 - 65536;
            str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
          }
        }
      }
    }
    function UTF8ToString(ptr) {
      return UTF8ArrayToString(HEAPU8, ptr);
    }
    function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
      if (!(maxBytesToWrite > 0)) return 0;
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1;
      for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) {
          var u1 = str.charCodeAt(++i);
          u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
        }
        if (u <= 127) {
          if (outIdx >= endIdx) break;
          outU8Array[outIdx++] = u;
        } else if (u <= 2047) {
          if (outIdx + 1 >= endIdx) break;
          outU8Array[outIdx++] = 192 | (u >> 6);
          outU8Array[outIdx++] = 128 | (u & 63);
        } else if (u <= 65535) {
          if (outIdx + 2 >= endIdx) break;
          outU8Array[outIdx++] = 224 | (u >> 12);
          outU8Array[outIdx++] = 128 | ((u >> 6) & 63);
          outU8Array[outIdx++] = 128 | (u & 63);
        } else if (u <= 2097151) {
          if (outIdx + 3 >= endIdx) break;
          outU8Array[outIdx++] = 240 | (u >> 18);
          outU8Array[outIdx++] = 128 | ((u >> 12) & 63);
          outU8Array[outIdx++] = 128 | ((u >> 6) & 63);
          outU8Array[outIdx++] = 128 | (u & 63);
        } else if (u <= 67108863) {
          if (outIdx + 4 >= endIdx) break;
          outU8Array[outIdx++] = 248 | (u >> 24);
          outU8Array[outIdx++] = 128 | ((u >> 18) & 63);
          outU8Array[outIdx++] = 128 | ((u >> 12) & 63);
          outU8Array[outIdx++] = 128 | ((u >> 6) & 63);
          outU8Array[outIdx++] = 128 | (u & 63);
        } else {
          if (outIdx + 5 >= endIdx) break;
          outU8Array[outIdx++] = 252 | (u >> 30);
          outU8Array[outIdx++] = 128 | ((u >> 24) & 63);
          outU8Array[outIdx++] = 128 | ((u >> 18) & 63);
          outU8Array[outIdx++] = 128 | ((u >> 12) & 63);
          outU8Array[outIdx++] = 128 | ((u >> 6) & 63);
          outU8Array[outIdx++] = 128 | (u & 63);
        }
      }
      outU8Array[outIdx] = 0;
      return outIdx - startIdx;
    }
    function stringToUTF8(str, outPtr, maxBytesToWrite) {
      assert(
        typeof maxBytesToWrite == "number",
        "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"
      );
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    }
    function lengthBytesUTF8(str) {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343)
          u = (65536 + ((u & 1023) << 10)) | (str.charCodeAt(++i) & 1023);
        if (u <= 127) {
          ++len;
        } else if (u <= 2047) {
          len += 2;
        } else if (u <= 65535) {
          len += 3;
        } else if (u <= 2097151) {
          len += 4;
        } else if (u <= 67108863) {
          len += 5;
        } else {
          len += 6;
        }
      }
      return len;
    }
    var UTF16Decoder =
      typeof TextDecoder !== "undefined"
        ? new TextDecoder("utf-16le")
        : undefined;
    function allocateUTF8(str) {
      var size = lengthBytesUTF8(str) + 1;
      var ret = _malloc(size);
      if (ret) stringToUTF8Array(str, HEAP8, ret, size);
      return ret;
    }
    function allocateUTF8OnStack(str) {
      var size = lengthBytesUTF8(str) + 1;
      var ret = stackAlloc(size);
      stringToUTF8Array(str, HEAP8, ret, size);
      return ret;
    }
    function demangle(func) {
      var __cxa_demangle_func =
        Module["___cxa_demangle"] || Module["__cxa_demangle"];
      assert(__cxa_demangle_func);
      try {
        var s = func;
        if (s.startsWith("__Z")) s = s.substr(1);
        var len = lengthBytesUTF8(s) + 1;
        var buf = _malloc(len);
        stringToUTF8(s, buf, len);
        var status = _malloc(4);
        var ret = __cxa_demangle_func(buf, 0, 0, status);
        if (HEAP32[status >> 2] === 0 && ret) {
          return Pointer_stringify(ret);
        }
      } catch (e) {
      } finally {
        if (buf) _free(buf);
        if (status) _free(status);
        if (ret) _free(ret);
      }
      return func;
    }
    function demangleAll(text) {
      var regex = /__Z[\w\d_]+/g;
      return text.replace(regex, function(x) {
        var y = demangle(x);
        return x === y ? x : y + " [" + x + "]";
      });
    }
    function jsStackTrace() {
      var err = new Error();
      if (!err.stack) {
        try {
          throw new Error(0);
        } catch (e) {
          err = e;
        }
        if (!err.stack) {
          return "(no stack trace available)";
        }
      }
      return err.stack.toString();
    }
    function stackTrace() {
      var js = jsStackTrace();
      if (Module["extraStackTrace"]) js += "\n" + Module["extraStackTrace"]();
      return demangleAll(js);
    }
    var PAGE_SIZE = 16384;
    var WASM_PAGE_SIZE = 65536;
    var ASMJS_PAGE_SIZE = 16777216;
    var MIN_TOTAL_MEMORY = 16777216;
    function alignUp(x, multiple) {
      if (x % multiple > 0) {
        x += multiple - (x % multiple);
      }
      return x;
    }
    var buffer,
      HEAP8,
      HEAPU8,
      HEAP16,
      HEAPU16,
      HEAP32,
      HEAPU32,
      HEAPF32,
      HEAPF64;
    function updateGlobalBuffer(buf) {
      Module["buffer"] = buffer = buf;
    }
    function updateGlobalBufferViews() {
      Module["HEAP8"] = HEAP8 = new Int8Array(buffer);
      Module["HEAP16"] = HEAP16 = new Int16Array(buffer);
      Module["HEAP32"] = HEAP32 = new Int32Array(buffer);
      Module["HEAPU8"] = HEAPU8 = new Uint8Array(buffer);
      Module["HEAPU16"] = HEAPU16 = new Uint16Array(buffer);
      Module["HEAPU32"] = HEAPU32 = new Uint32Array(buffer);
      Module["HEAPF32"] = HEAPF32 = new Float32Array(buffer);
      Module["HEAPF64"] = HEAPF64 = new Float64Array(buffer);
    }
    var STATIC_BASE, STATICTOP, staticSealed;
    var STACK_BASE, STACKTOP, STACK_MAX;
    var DYNAMIC_BASE, DYNAMICTOP_PTR;
    STATIC_BASE = STATICTOP = STACK_BASE = STACKTOP = STACK_MAX = DYNAMIC_BASE = DYNAMICTOP_PTR = 0;
    staticSealed = false;
    function writeStackCookie() {
      assert((STACK_MAX & 3) == 0);
      HEAPU32[(STACK_MAX >> 2) - 1] = 34821223;
      HEAPU32[(STACK_MAX >> 2) - 2] = 2310721022;
    }
    function checkStackCookie() {
      if (
        HEAPU32[(STACK_MAX >> 2) - 1] != 34821223 ||
        HEAPU32[(STACK_MAX >> 2) - 2] != 2310721022
      ) {
        abort(
          "Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x02135467, but received 0x" +
            HEAPU32[(STACK_MAX >> 2) - 2].toString(16) +
            " " +
            HEAPU32[(STACK_MAX >> 2) - 1].toString(16)
        );
      }
      if (HEAP32[0] !== 1668509029)
        throw "Runtime error: The application has corrupted its heap memory area (address zero)!";
    }
    function abortStackOverflow(allocSize) {
      abort(
        "Stack overflow! Attempted to allocate " +
          allocSize +
          " bytes on the stack, but stack has only " +
          (STACK_MAX - stackSave() + allocSize) +
          " bytes available!"
      );
    }
    function abortOnCannotGrowMemory() {
      abort(
        "Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " +
          TOTAL_MEMORY +
          ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 "
      );
    }
    if (!Module["reallocBuffer"])
      Module["reallocBuffer"] = function(size) {
        var ret;
        try {
          var oldHEAP8 = HEAP8;
          ret = new ArrayBuffer(size);
          var temp = new Int8Array(ret);
          temp.set(oldHEAP8);
        } catch (e) {
          return false;
        }
        var success = _emscripten_replace_memory(ret);
        if (!success) return false;
        return ret;
      };
    function enlargeMemory() {
      assert(HEAP32[DYNAMICTOP_PTR >> 2] > TOTAL_MEMORY);
      var PAGE_MULTIPLE = Module["usingWasm"]
        ? WASM_PAGE_SIZE
        : ASMJS_PAGE_SIZE;
      var LIMIT = 2147483648 - PAGE_MULTIPLE;
      if (HEAP32[DYNAMICTOP_PTR >> 2] > LIMIT) {
        err(
          "Cannot enlarge memory, asked to go up to " +
            HEAP32[DYNAMICTOP_PTR >> 2] +
            " bytes, but the limit is " +
            LIMIT +
            " bytes!"
        );
        return false;
      }
      var OLD_TOTAL_MEMORY = TOTAL_MEMORY;
      TOTAL_MEMORY = Math.max(TOTAL_MEMORY, MIN_TOTAL_MEMORY);
      while (TOTAL_MEMORY < HEAP32[DYNAMICTOP_PTR >> 2]) {
        if (TOTAL_MEMORY <= 536870912) {
          TOTAL_MEMORY = alignUp(2 * TOTAL_MEMORY, PAGE_MULTIPLE);
        } else {
          TOTAL_MEMORY = Math.min(
            alignUp((3 * TOTAL_MEMORY + 2147483648) / 4, PAGE_MULTIPLE),
            LIMIT
          );
          if (TOTAL_MEMORY === OLD_TOTAL_MEMORY) {
            warnOnce(
              "Cannot ask for more memory since we reached the practical limit in browsers (which is just below 2GB), so the request would have failed. Requesting only " +
                TOTAL_MEMORY
            );
          }
        }
      }
      var start = Date.now();
      var replacement = Module["reallocBuffer"](TOTAL_MEMORY);
      if (!replacement || replacement.byteLength != TOTAL_MEMORY) {
        err(
          "Failed to grow the heap from " +
            OLD_TOTAL_MEMORY +
            " bytes to " +
            TOTAL_MEMORY +
            " bytes, not enough memory!"
        );
        if (replacement) {
          err(
            "Expected to get back a buffer of size " +
              TOTAL_MEMORY +
              " bytes, but instead got back a buffer of size " +
              replacement.byteLength
          );
        }
        TOTAL_MEMORY = OLD_TOTAL_MEMORY;
        return false;
      }
      updateGlobalBuffer(replacement);
      updateGlobalBufferViews();
      if (!Module["usingWasm"]) {
        err(
          "Warning: Enlarging memory arrays, this is not fast! " +
            [OLD_TOTAL_MEMORY, TOTAL_MEMORY]
        );
      }
      return true;
    }
    var byteLength;
    try {
      byteLength = Function.prototype.call.bind(
        Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get
      );
      byteLength(new ArrayBuffer(4));
    } catch (e) {
      byteLength = function(buffer) {
        return buffer.byteLength;
      };
    }
    var TOTAL_STACK = Module["TOTAL_STACK"] || 5242880;
    var TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 16777216;
    if (TOTAL_MEMORY < TOTAL_STACK)
      err(
        "TOTAL_MEMORY should be larger than TOTAL_STACK, was " +
          TOTAL_MEMORY +
          "! (TOTAL_STACK=" +
          TOTAL_STACK +
          ")"
      );
    assert(
      typeof Int32Array !== "undefined" &&
        typeof Float64Array !== "undefined" &&
        Int32Array.prototype.subarray !== undefined &&
        Int32Array.prototype.set !== undefined,
      "JS engine does not provide full typed array support"
    );
    if (Module["buffer"]) {
      buffer = Module["buffer"];
      assert(
        buffer.byteLength === TOTAL_MEMORY,
        "provided buffer should be " +
          TOTAL_MEMORY +
          " bytes, but it is " +
          buffer.byteLength
      );
    } else {
      if (
        typeof WebAssembly === "object" &&
        typeof WebAssembly.Memory === "function"
      ) {
        assert(TOTAL_MEMORY % WASM_PAGE_SIZE === 0);
        Module["wasmMemory"] = new WebAssembly.Memory({
          initial: TOTAL_MEMORY / WASM_PAGE_SIZE
        });
        buffer = Module["wasmMemory"].buffer;
      } else {
        buffer = new ArrayBuffer(TOTAL_MEMORY);
      }
      assert(buffer.byteLength === TOTAL_MEMORY);
      Module["buffer"] = buffer;
    }
    updateGlobalBufferViews();
    function getTotalMemory() {
      return TOTAL_MEMORY;
    }
    HEAP32[0] = 1668509029;
    HEAP16[1] = 25459;
    if (HEAPU8[2] !== 115 || HEAPU8[3] !== 99)
      throw "Runtime error: expected the system to be little-endian!";
    function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == "function") {
          callback();
          continue;
        }
        var func = callback.func;
        if (typeof func === "number") {
          if (callback.arg === undefined) {
            Module["dynCall_v"](func);
          } else {
            Module["dynCall_vi"](func, callback.arg);
          }
        } else {
          func(callback.arg === undefined ? null : callback.arg);
        }
      }
    }
    var __ATPRERUN__ = [];
    var __ATINIT__ = [];
    var __ATMAIN__ = [];
    var __ATEXIT__ = [];
    var __ATPOSTRUN__ = [];
    var runtimeInitialized = false;
    var runtimeExited = false;
    function preRun() {
      if (Module["preRun"]) {
        if (typeof Module["preRun"] == "function")
          Module["preRun"] = [Module["preRun"]];
        while (Module["preRun"].length) {
          addOnPreRun(Module["preRun"].shift());
        }
      }
      callRuntimeCallbacks(__ATPRERUN__);
    }
    function ensureInitRuntime() {
      checkStackCookie();
      if (runtimeInitialized) return;
      runtimeInitialized = true;
      callRuntimeCallbacks(__ATINIT__);
    }
    function preMain() {
      checkStackCookie();
      callRuntimeCallbacks(__ATMAIN__);
    }
    function exitRuntime() {
      checkStackCookie();
      callRuntimeCallbacks(__ATEXIT__);
      runtimeExited = true;
    }
    function postRun() {
      checkStackCookie();
      if (Module["postRun"]) {
        if (typeof Module["postRun"] == "function")
          Module["postRun"] = [Module["postRun"]];
        while (Module["postRun"].length) {
          addOnPostRun(Module["postRun"].shift());
        }
      }
      callRuntimeCallbacks(__ATPOSTRUN__);
    }
    function addOnPreRun(cb) {
      __ATPRERUN__.unshift(cb);
    }
    function addOnPostRun(cb) {
      __ATPOSTRUN__.unshift(cb);
    }
    function writeArrayToMemory(array, buffer) {
      assert(
        array.length >= 0,
        "writeArrayToMemory array must have a length (should be an array or typed array)"
      );
      HEAP8.set(array, buffer);
    }
    function writeAsciiToMemory(str, buffer, dontAddNull) {
      for (var i = 0; i < str.length; ++i) {
        assert((str.charCodeAt(i) === str.charCodeAt(i)) & 255);
        HEAP8[buffer++ >> 0] = str.charCodeAt(i);
      }
      if (!dontAddNull) HEAP8[buffer >> 0] = 0;
    }
    assert(
      Math["imul"] && Math["fround"] && Math["clz32"] && Math["trunc"],
      "this is a legacy browser, build with LEGACY_VM_SUPPORT"
    );
    var Math_abs = Math.abs;
    var Math_ceil = Math.ceil;
    var Math_floor = Math.floor;
    var Math_min = Math.min;
    var runDependencies = 0;
    var runDependencyWatcher = null;
    var dependenciesFulfilled = null;
    var runDependencyTracking = {};
    function getUniqueRunDependency(id) {
      var orig = id;
      while (1) {
        if (!runDependencyTracking[id]) return id;
        id = orig + Math.random();
      }
      return id;
    }
    function addRunDependency(id) {
      runDependencies++;
      if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies);
      }
      if (id) {
        assert(!runDependencyTracking[id]);
        runDependencyTracking[id] = 1;
        if (
          runDependencyWatcher === null &&
          typeof setInterval !== "undefined"
        ) {
          runDependencyWatcher = setInterval(function() {
            if (ABORT) {
              clearInterval(runDependencyWatcher);
              runDependencyWatcher = null;
              return;
            }
            var shown = false;
            for (var dep in runDependencyTracking) {
              if (!shown) {
                shown = true;
                err("still waiting on run dependencies:");
              }
              err("dependency: " + dep);
            }
            if (shown) {
              err("(end of list)");
            }
          }, 1e4);
        }
      } else {
        err("warning: run dependency added without ID");
      }
    }
    function removeRunDependency(id) {
      runDependencies--;
      if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies);
      }
      if (id) {
        assert(runDependencyTracking[id]);
        delete runDependencyTracking[id];
      } else {
        err("warning: run dependency removed without ID");
      }
      if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
        }
        if (dependenciesFulfilled) {
          var callback = dependenciesFulfilled;
          dependenciesFulfilled = null;
          callback();
        }
      }
    }
    Module["preloadedImages"] = {};
    Module["preloadedAudios"] = {};
    var dataURIPrefix = "data:application/octet-stream;base64,";
    function isDataURI(filename) {
      return String.prototype.startsWith
        ? filename.startsWith(dataURIPrefix)
        : filename.indexOf(dataURIPrefix) === 0;
    }
    function integrateWasmJS() {
      var wasmTextFile = "MyMoneroCoreCpp_WASM.wast";
      var wasmBinaryFile = "MyMoneroCoreCpp_WASM.wasm";
      var asmjsCodeFile = "MyMoneroCoreCpp_WASM.temp.asm.js";
      if (!isDataURI(wasmTextFile)) {
        wasmTextFile = locateFile(wasmTextFile);
      }
      if (!isDataURI(wasmBinaryFile)) {
        wasmBinaryFile = locateFile(wasmBinaryFile);
      }
      if (!isDataURI(asmjsCodeFile)) {
        asmjsCodeFile = locateFile(asmjsCodeFile);
      }
      var wasmPageSize = 64 * 1024;
      var info = {
        global: null,
        env: null,
        asm2wasm: asm2wasmImports,
        parent: Module
      };
      var exports = null;
      function mergeMemory(newBuffer) {
        var oldBuffer = Module["buffer"];
        if (newBuffer.byteLength < oldBuffer.byteLength) {
          err(
            "the new buffer in mergeMemory is smaller than the previous one. in native wasm, we should grow memory here"
          );
        }
        var oldView = new Int8Array(oldBuffer);
        var newView = new Int8Array(newBuffer);
        newView.set(oldView);
        updateGlobalBuffer(newBuffer);
        updateGlobalBufferViews();
      }
      function fixImports(imports) {
        return imports;
      }
      function getBinary() {
        try {
          if (Module["wasmBinary"]) {
            return new Uint8Array(Module["wasmBinary"]);
          }
          if (Module["readBinary"]) {
            return Module["readBinary"](wasmBinaryFile);
          } else {
            throw "both async and sync fetching of the wasm failed";
          }
        } catch (err) {
          abort(err);
        }
      }
      function getBinaryPromise() {
        if (
          !Module["wasmBinary"] &&
          (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) &&
          typeof fetch === "function"
        ) {
          return fetch(wasmBinaryFile, { credentials: "same-origin" })
            .then(function(response) {
              if (!response["ok"]) {
                throw "failed to load wasm binary file at '" +
                  wasmBinaryFile +
                  "'";
              }
              return response["arrayBuffer"]();
            })
            .catch(function() {
              return getBinary();
            });
        }
        return new Promise(function(resolve, reject) {
          resolve(getBinary());
        });
      }
      function doNativeWasm(global, env, providedBuffer) {
        if (typeof WebAssembly !== "object") {
          abort(
            "No WebAssembly support found. Build with -s WASM=0 to target JavaScript instead."
          );
          err("no native wasm support detected");
          return false;
        }
        if (!(Module["wasmMemory"] instanceof WebAssembly.Memory)) {
          err("no native wasm Memory in use");
          return false;
        }
        env["memory"] = Module["wasmMemory"];
        info["global"] = { NaN: NaN, Infinity: Infinity };
        info["global.Math"] = Math;
        info["env"] = env;
        function receiveInstance(instance, module) {
          exports = instance.exports;
          if (exports.memory) mergeMemory(exports.memory);
          Module["asm"] = exports;
          Module["usingWasm"] = true;
          removeRunDependency("wasm-instantiate");
        }
        addRunDependency("wasm-instantiate");
        if (Module["instantiateWasm"]) {
          try {
            return Module["instantiateWasm"](info, receiveInstance);
          } catch (e) {
            err("Module.instantiateWasm callback failed with error: " + e);
            return false;
          }
        }
        var trueModule = Module;
        function receiveInstantiatedSource(output) {
          assert(
            Module === trueModule,
            "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?"
          );
          trueModule = null;
          receiveInstance(output["instance"], output["module"]);
        }
        function instantiateArrayBuffer(receiver) {
          getBinaryPromise()
            .then(function(binary) {
              return WebAssembly.instantiate(binary, info);
            })
            .then(receiver, function(reason) {
              err("failed to asynchronously prepare wasm: " + reason);
              abort(reason);
            });
        }
        if (
          !Module["wasmBinary"] &&
          typeof WebAssembly.instantiateStreaming === "function" &&
          !isDataURI(wasmBinaryFile) &&
          typeof fetch === "function"
        ) {
          WebAssembly.instantiateStreaming(
            fetch(wasmBinaryFile, { credentials: "same-origin" }),
            info
          ).then(receiveInstantiatedSource, function(reason) {
            err("wasm streaming compile failed: " + reason);
            err("falling back to ArrayBuffer instantiation");
            instantiateArrayBuffer(receiveInstantiatedSource);
          });
        } else {
          instantiateArrayBuffer(receiveInstantiatedSource);
        }
        return {};
      }
      Module["asmPreload"] = Module["asm"];
      var asmjsReallocBuffer = Module["reallocBuffer"];
      var wasmReallocBuffer = function(size) {
        var PAGE_MULTIPLE = Module["usingWasm"]
          ? WASM_PAGE_SIZE
          : ASMJS_PAGE_SIZE;
        size = alignUp(size, PAGE_MULTIPLE);
        var old = Module["buffer"];
        var oldSize = old.byteLength;
        if (Module["usingWasm"]) {
          try {
            var result = Module["wasmMemory"].grow(
              (size - oldSize) / wasmPageSize
            );
            if (result !== (-1 | 0)) {
              return (Module["buffer"] = Module["wasmMemory"].buffer);
            } else {
              return null;
            }
          } catch (e) {
            console.error(
              "Module.reallocBuffer: Attempted to grow from " +
                oldSize +
                " bytes to " +
                size +
                " bytes, but got error: " +
                e
            );
            return null;
          }
        }
      };
      Module["reallocBuffer"] = function(size) {
        if (finalMethod === "asmjs") {
          return asmjsReallocBuffer(size);
        } else {
          return wasmReallocBuffer(size);
        }
      };
      var finalMethod = "";
      Module["asm"] = function(global, env, providedBuffer) {
        env = fixImports(env);
        if (!env["table"]) {
          var TABLE_SIZE = Module["wasmTableSize"];
          if (TABLE_SIZE === undefined) TABLE_SIZE = 1024;
          var MAX_TABLE_SIZE = Module["wasmMaxTableSize"];
          if (
            typeof WebAssembly === "object" &&
            typeof WebAssembly.Table === "function"
          ) {
            if (MAX_TABLE_SIZE !== undefined) {
              env["table"] = new WebAssembly.Table({
                initial: TABLE_SIZE,
                maximum: MAX_TABLE_SIZE,
                element: "anyfunc"
              });
            } else {
              env["table"] = new WebAssembly.Table({
                initial: TABLE_SIZE,
                element: "anyfunc"
              });
            }
          } else {
            env["table"] = new Array(TABLE_SIZE);
          }
          Module["wasmTable"] = env["table"];
        }
        if (!env["memoryBase"]) {
          env["memoryBase"] = Module["STATIC_BASE"];
        }
        if (!env["tableBase"]) {
          env["tableBase"] = 0;
        }
        var exports;
        exports = doNativeWasm(global, env, providedBuffer);
        assert(
          exports,
          "no binaryen method succeeded. consider enabling more options, like interpreting, if you want that: http://kripken.github.io/emscripten-site/docs/compiling/WebAssembly.html#binaryen-methods"
        );
        return exports;
      };
    }
    integrateWasmJS();
    var ASM_CONSTS = [
      function($0, $1) {
        const JS__task_id = Module.UTF8ToString($0);
        const JS__req_params_string = Module.UTF8ToString($1);
        const JS__req_params = JSON.parse(JS__req_params_string);
        Module.fromCpp__send_funds__error(JS__task_id, JS__req_params);
      },
      function($0, $1) {
        const JS__task_id = Module.UTF8ToString($0);
        const JS__req_params_string = Module.UTF8ToString($1);
        const JS__req_params = JSON.parse(JS__req_params_string);
        Module.fromCpp__send_funds__success(JS__task_id, JS__req_params);
      },
      function($0, $1) {
        const JS__task_id = Module.UTF8ToString($0);
        const JS__req_params_string = Module.UTF8ToString($1);
        const JS__req_params = JSON.parse(JS__req_params_string);
        Module.fromCpp__send_funds__get_unspent_outs(
          JS__task_id,
          JS__req_params
        );
      },
      function($0, $1) {
        const JS__task_id = Module.UTF8ToString($0);
        const JS__req_params_string = Module.UTF8ToString($1);
        const JS__req_params = JSON.parse(JS__req_params_string);
        Module.fromCpp__send_funds__status_update(JS__task_id, JS__req_params);
      },
      function($0, $1) {
        const JS__task_id = Module.UTF8ToString($0);
        const JS__req_params_string = Module.UTF8ToString($1);
        const JS__req_params = JSON.parse(JS__req_params_string);
        Module.fromCpp__send_funds__get_random_outs(
          JS__task_id,
          JS__req_params
        );
      },
      function($0, $1) {
        const JS__task_id = Module.UTF8ToString($0);
        const JS__req_params_string = Module.UTF8ToString($1);
        const JS__req_params = JSON.parse(JS__req_params_string);
        Module.fromCpp__send_funds__submit_raw_tx(JS__task_id, JS__req_params);
      }
    ];
    function _emscripten_asm_const_iii(code, a0, a1) {
      return ASM_CONSTS[code](a0, a1);
    }
    STATIC_BASE = GLOBAL_BASE;
    STATICTOP = STATIC_BASE + 750848;
    __ATINIT__.push(
      {
        func: function() {
          __GLOBAL__I_000101();
        }
      },
      {
        func: function() {
          _init_random();
        }
      },
      {
        func: function() {
          ___cxx_global_var_init_40();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_index_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_emscr_async_send_bridge_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_monero_address_utils_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_monero_paymentID_utils_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_monero_key_image_utils_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_monero_fee_utils_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_monero_transfer_utils_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_monero_wallet_utils_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_serial_bridge_index_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_monero_send_routine_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_serial_bridge_utils_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_tools__ret_vals_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_cryptonote_basic_impl_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_account_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_cryptonote_format_utils_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_crypto_cpp();
        }
      },
      {
        func: function() {
          ___cxx_global_var_init_39();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_cryptonote_tx_utils_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_base58_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_threadpool_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_util_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_hex_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_string_tools_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_wipeable_string_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_device_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_device_default_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_rctOps_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_rctTypes_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_rctSigs_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_bulletproofs_cc();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_multiexp_cc();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_electrum_words_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_logger_cpp();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_bind_cpp();
        }
      },
      {
        func: function() {
          ___emscripten_environ_constructor();
        }
      },
      {
        func: function() {
          ___cxx_global_var_init_38();
        }
      },
      {
        func: function() {
          __GLOBAL__sub_I_iostream_cpp();
        }
      }
    );
    var STATIC_BUMP = 750848;
    Module["STATIC_BASE"] = STATIC_BASE;
    Module["STATIC_BUMP"] = STATIC_BUMP;
    var tempDoublePtr = STATICTOP;
    STATICTOP += 16;
    assert(tempDoublePtr % 8 == 0);
    function ___assert_fail(condition, filename, line, func) {
      abort(
        "Assertion failed: " +
          Pointer_stringify(condition) +
          ", at: " +
          [
            filename ? Pointer_stringify(filename) : "unknown filename",
            line,
            func ? Pointer_stringify(func) : "unknown function"
          ]
      );
    }
    function ___atomic_fetch_add_8(ptr, vall, valh, memmodel) {
      var l = HEAP32[ptr >> 2];
      var h = HEAP32[(ptr + 4) >> 2];
      HEAP32[ptr >> 2] = _i64Add(l, h, vall, valh);
      HEAP32[(ptr + 4) >> 2] = getTempRet0();
      return (setTempRet0(h), l) | 0;
    }
    var ENV = {};
    function ___buildEnvironment(environ) {
      var MAX_ENV_VALUES = 64;
      var TOTAL_ENV_SIZE = 1024;
      var poolPtr;
      var envPtr;
      if (!___buildEnvironment.called) {
        ___buildEnvironment.called = true;
        ENV["USER"] = ENV["LOGNAME"] = "web_user";
        ENV["PATH"] = "/";
        ENV["PWD"] = "/";
        ENV["HOME"] = "/home/web_user";
        ENV["LANG"] = "C.UTF-8";
        ENV["_"] = Module["thisProgram"];
        poolPtr = getMemory(TOTAL_ENV_SIZE);
        envPtr = getMemory(MAX_ENV_VALUES * 4);
        HEAP32[envPtr >> 2] = poolPtr;
        HEAP32[environ >> 2] = envPtr;
      } else {
        envPtr = HEAP32[environ >> 2];
        poolPtr = HEAP32[envPtr >> 2];
      }
      var strings = [];
      var totalSize = 0;
      for (var key in ENV) {
        if (typeof ENV[key] === "string") {
          var line = key + "=" + ENV[key];
          strings.push(line);
          totalSize += line.length;
        }
      }
      if (totalSize > TOTAL_ENV_SIZE) {
        throw new Error("Environment size exceeded TOTAL_ENV_SIZE!");
      }
      var ptrSize = 4;
      for (var i = 0; i < strings.length; i++) {
        var line = strings[i];
        writeAsciiToMemory(line, poolPtr);
        HEAP32[(envPtr + i * ptrSize) >> 2] = poolPtr;
        poolPtr += line.length + 1;
      }
      HEAP32[(envPtr + strings.length * ptrSize) >> 2] = 0;
    }
    function ___cxa_allocate_exception(size) {
      return _malloc(size);
    }
    var EXCEPTIONS = {
      last: 0,
      caught: [],
      infos: {},
      deAdjust: function(adjusted) {
        if (!adjusted || EXCEPTIONS.infos[adjusted]) return adjusted;
        for (var key in EXCEPTIONS.infos) {
          var ptr = +key;
          var info = EXCEPTIONS.infos[ptr];
          if (info.adjusted === adjusted) {
            err("de-adjusted exception ptr " + adjusted + " to " + ptr);
            return ptr;
          }
        }
        err("no de-adjustment for unknown exception ptr " + adjusted);
        return adjusted;
      },
      addRef: function(ptr) {
        err("addref " + ptr);
        if (!ptr) return;
        var info = EXCEPTIONS.infos[ptr];
        info.refcount++;
      },
      decRef: function(ptr) {
        err("decref " + ptr);
        if (!ptr) return;
        var info = EXCEPTIONS.infos[ptr];
        assert(info.refcount > 0);
        info.refcount--;
        if (info.refcount === 0 && !info.rethrown) {
          if (info.destructor) {
            Module["dynCall_vi"](info.destructor, ptr);
          }
          delete EXCEPTIONS.infos[ptr];
          ___cxa_free_exception(ptr);
          err(
            "decref freeing exception " +
              [ptr, EXCEPTIONS.last, "stack", EXCEPTIONS.caught]
          );
        }
      },
      clearRef: function(ptr) {
        if (!ptr) return;
        var info = EXCEPTIONS.infos[ptr];
        info.refcount = 0;
      }
    };
    function ___cxa_begin_catch(ptr) {
      var info = EXCEPTIONS.infos[ptr];
      if (info && !info.caught) {
        info.caught = true;
        __ZSt18uncaught_exceptionv.uncaught_exception--;
      }
      if (info) info.rethrown = false;
      EXCEPTIONS.caught.push(ptr);
      err("cxa_begin_catch " + [ptr, "stack", EXCEPTIONS.caught]);
      EXCEPTIONS.addRef(EXCEPTIONS.deAdjust(ptr));
      return ptr;
    }
    function ___cxa_free_exception(ptr) {
      try {
        return _free(ptr);
      } catch (e) {
        err("exception during cxa_free_exception: " + e);
      }
    }
    function ___cxa_end_catch() {
      Module["setThrew"](0);
      var ptr = EXCEPTIONS.caught.pop();
      err(
        "cxa_end_catch popped " +
          [ptr, EXCEPTIONS.last, "stack", EXCEPTIONS.caught]
      );
      if (ptr) {
        EXCEPTIONS.decRef(EXCEPTIONS.deAdjust(ptr));
        EXCEPTIONS.last = 0;
      }
    }
    function ___cxa_find_matching_catch_2() {
      return ___cxa_find_matching_catch.apply(null, arguments);
    }
    function ___cxa_find_matching_catch_3() {
      return ___cxa_find_matching_catch.apply(null, arguments);
    }
    function ___cxa_pure_virtual() {
      ABORT = true;
      throw "Pure virtual function called!";
    }
    function ___cxa_rethrow() {
      var ptr = EXCEPTIONS.caught.pop();
      ptr = EXCEPTIONS.deAdjust(ptr);
      if (!EXCEPTIONS.infos[ptr].rethrown) {
        EXCEPTIONS.caught.push(ptr);
        EXCEPTIONS.infos[ptr].rethrown = true;
      }
      err(
        "Compiled code RE-throwing an exception, popped " +
          [ptr, EXCEPTIONS.last, "stack", EXCEPTIONS.caught]
      );
      EXCEPTIONS.last = ptr;
      throw ptr;
    }
    function ___resumeException(ptr) {
      out("Resuming exception " + [ptr, EXCEPTIONS.last]);
      if (!EXCEPTIONS.last) {
        EXCEPTIONS.last = ptr;
      }
      throw ptr;
    }
    function ___cxa_find_matching_catch() {
      var thrown = EXCEPTIONS.last;
      if (!thrown) {
        return (setTempRet0(0), 0) | 0;
      }
      var info = EXCEPTIONS.infos[thrown];
      var throwntype = info.type;
      if (!throwntype) {
        return (setTempRet0(0), thrown) | 0;
      }
      var typeArray = Array.prototype.slice.call(arguments);
      var pointer = Module["___cxa_is_pointer_type"](throwntype);
      if (!___cxa_find_matching_catch.buffer)
        ___cxa_find_matching_catch.buffer = _malloc(4);
      out("can_catch on " + [thrown]);
      HEAP32[___cxa_find_matching_catch.buffer >> 2] = thrown;
      thrown = ___cxa_find_matching_catch.buffer;
      for (var i = 0; i < typeArray.length; i++) {
        if (
          typeArray[i] &&
          Module["___cxa_can_catch"](typeArray[i], throwntype, thrown)
        ) {
          thrown = HEAP32[thrown >> 2];
          info.adjusted = thrown;
          out("  can_catch found " + [thrown, typeArray[i]]);
          return (setTempRet0(typeArray[i]), thrown) | 0;
        }
      }
      thrown = HEAP32[thrown >> 2];
      return (setTempRet0(throwntype), thrown) | 0;
    }
    function ___cxa_throw(ptr, type, destructor) {
      err("Compiled code throwing an exception, " + [ptr, type, destructor]);
      EXCEPTIONS.infos[ptr] = {
        ptr: ptr,
        adjusted: ptr,
        type: type,
        destructor: destructor,
        refcount: 0,
        caught: false,
        rethrown: false
      };
      EXCEPTIONS.last = ptr;
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr;
    }
    function ___cxa_uncaught_exception() {
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
    function ___lock() {}
    var ERRNO_CODES = {
      EPERM: 1,
      ENOENT: 2,
      ESRCH: 3,
      EINTR: 4,
      EIO: 5,
      ENXIO: 6,
      E2BIG: 7,
      ENOEXEC: 8,
      EBADF: 9,
      ECHILD: 10,
      EAGAIN: 11,
      EWOULDBLOCK: 11,
      ENOMEM: 12,
      EACCES: 13,
      EFAULT: 14,
      ENOTBLK: 15,
      EBUSY: 16,
      EEXIST: 17,
      EXDEV: 18,
      ENODEV: 19,
      ENOTDIR: 20,
      EISDIR: 21,
      EINVAL: 22,
      ENFILE: 23,
      EMFILE: 24,
      ENOTTY: 25,
      ETXTBSY: 26,
      EFBIG: 27,
      ENOSPC: 28,
      ESPIPE: 29,
      EROFS: 30,
      EMLINK: 31,
      EPIPE: 32,
      EDOM: 33,
      ERANGE: 34,
      ENOMSG: 42,
      EIDRM: 43,
      ECHRNG: 44,
      EL2NSYNC: 45,
      EL3HLT: 46,
      EL3RST: 47,
      ELNRNG: 48,
      EUNATCH: 49,
      ENOCSI: 50,
      EL2HLT: 51,
      EDEADLK: 35,
      ENOLCK: 37,
      EBADE: 52,
      EBADR: 53,
      EXFULL: 54,
      ENOANO: 55,
      EBADRQC: 56,
      EBADSLT: 57,
      EDEADLOCK: 35,
      EBFONT: 59,
      ENOSTR: 60,
      ENODATA: 61,
      ETIME: 62,
      ENOSR: 63,
      ENONET: 64,
      ENOPKG: 65,
      EREMOTE: 66,
      ENOLINK: 67,
      EADV: 68,
      ESRMNT: 69,
      ECOMM: 70,
      EPROTO: 71,
      EMULTIHOP: 72,
      EDOTDOT: 73,
      EBADMSG: 74,
      ENOTUNIQ: 76,
      EBADFD: 77,
      EREMCHG: 78,
      ELIBACC: 79,
      ELIBBAD: 80,
      ELIBSCN: 81,
      ELIBMAX: 82,
      ELIBEXEC: 83,
      ENOSYS: 38,
      ENOTEMPTY: 39,
      ENAMETOOLONG: 36,
      ELOOP: 40,
      EOPNOTSUPP: 95,
      EPFNOSUPPORT: 96,
      ECONNRESET: 104,
      ENOBUFS: 105,
      EAFNOSUPPORT: 97,
      EPROTOTYPE: 91,
      ENOTSOCK: 88,
      ENOPROTOOPT: 92,
      ESHUTDOWN: 108,
      ECONNREFUSED: 111,
      EADDRINUSE: 98,
      ECONNABORTED: 103,
      ENETUNREACH: 101,
      ENETDOWN: 100,
      ETIMEDOUT: 110,
      EHOSTDOWN: 112,
      EHOSTUNREACH: 113,
      EINPROGRESS: 115,
      EALREADY: 114,
      EDESTADDRREQ: 89,
      EMSGSIZE: 90,
      EPROTONOSUPPORT: 93,
      ESOCKTNOSUPPORT: 94,
      EADDRNOTAVAIL: 99,
      ENETRESET: 102,
      EISCONN: 106,
      ENOTCONN: 107,
      ETOOMANYREFS: 109,
      EUSERS: 87,
      EDQUOT: 122,
      ESTALE: 116,
      ENOTSUP: 95,
      ENOMEDIUM: 123,
      EILSEQ: 84,
      EOVERFLOW: 75,
      ECANCELED: 125,
      ENOTRECOVERABLE: 131,
      EOWNERDEAD: 130,
      ESTRPIPE: 86
    };
    function ___setErrNo(value) {
      if (Module["___errno_location"])
        HEAP32[Module["___errno_location"]() >> 2] = value;
      else err("failed to set errno from JS");
      return value;
    }
    function ___map_file(pathname, size) {
      ___setErrNo(ERRNO_CODES.EPERM);
      return -1;
    }
    var ERRNO_MESSAGES = {
      0: "Success",
      1: "Not super-user",
      2: "No such file or directory",
      3: "No such process",
      4: "Interrupted system call",
      5: "I/O error",
      6: "No such device or address",
      7: "Arg list too long",
      8: "Exec format error",
      9: "Bad file number",
      10: "No children",
      11: "No more processes",
      12: "Not enough core",
      13: "Permission denied",
      14: "Bad address",
      15: "Block device required",
      16: "Mount device busy",
      17: "File exists",
      18: "Cross-device link",
      19: "No such device",
      20: "Not a directory",
      21: "Is a directory",
      22: "Invalid argument",
      23: "Too many open files in system",
      24: "Too many open files",
      25: "Not a typewriter",
      26: "Text file busy",
      27: "File too large",
      28: "No space left on device",
      29: "Illegal seek",
      30: "Read only file system",
      31: "Too many links",
      32: "Broken pipe",
      33: "Math arg out of domain of func",
      34: "Math result not representable",
      35: "File locking deadlock error",
      36: "File or path name too long",
      37: "No record locks available",
      38: "Function not implemented",
      39: "Directory not empty",
      40: "Too many symbolic links",
      42: "No message of desired type",
      43: "Identifier removed",
      44: "Channel number out of range",
      45: "Level 2 not synchronized",
      46: "Level 3 halted",
      47: "Level 3 reset",
      48: "Link number out of range",
      49: "Protocol driver not attached",
      50: "No CSI structure available",
      51: "Level 2 halted",
      52: "Invalid exchange",
      53: "Invalid request descriptor",
      54: "Exchange full",
      55: "No anode",
      56: "Invalid request code",
      57: "Invalid slot",
      59: "Bad font file fmt",
      60: "Device not a stream",
      61: "No data (for no delay io)",
      62: "Timer expired",
      63: "Out of streams resources",
      64: "Machine is not on the network",
      65: "Package not installed",
      66: "The object is remote",
      67: "The link has been severed",
      68: "Advertise error",
      69: "Srmount error",
      70: "Communication error on send",
      71: "Protocol error",
      72: "Multihop attempted",
      73: "Cross mount point (not really error)",
      74: "Trying to read unreadable message",
      75: "Value too large for defined data type",
      76: "Given log. name not unique",
      77: "f.d. invalid for this operation",
      78: "Remote address changed",
      79: "Can   access a needed shared lib",
      80: "Accessing a corrupted shared lib",
      81: ".lib section in a.out corrupted",
      82: "Attempting to link in too many libs",
      83: "Attempting to exec a shared library",
      84: "Illegal byte sequence",
      86: "Streams pipe error",
      87: "Too many users",
      88: "Socket operation on non-socket",
      89: "Destination address required",
      90: "Message too long",
      91: "Protocol wrong type for socket",
      92: "Protocol not available",
      93: "Unknown protocol",
      94: "Socket type not supported",
      95: "Not supported",
      96: "Protocol family not supported",
      97: "Address family not supported by protocol family",
      98: "Address already in use",
      99: "Address not available",
      100: "Network interface is not configured",
      101: "Network is unreachable",
      102: "Connection reset by network",
      103: "Connection aborted",
      104: "Connection reset by peer",
      105: "No buffer space available",
      106: "Socket is already connected",
      107: "Socket is not connected",
      108: "Can't send after socket shutdown",
      109: "Too many references",
      110: "Connection timed out",
      111: "Connection refused",
      112: "Host is down",
      113: "Host is unreachable",
      114: "Socket already connected",
      115: "Connection already in progress",
      116: "Stale file handle",
      122: "Quota exceeded",
      123: "No medium (in tape drive)",
      125: "Operation canceled",
      130: "Previous owner died",
      131: "State not recoverable"
    };
    var PATH = {
      splitPath: function(filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },
      normalizeArray: function(parts, allowAboveRoot) {
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === ".") {
            parts.splice(i, 1);
          } else if (last === "..") {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        if (allowAboveRoot) {
          for (; up; up--) {
            parts.unshift("..");
          }
        }
        return parts;
      },
      normalize: function(path) {
        var isAbsolute = path.charAt(0) === "/",
          trailingSlash = path.substr(-1) === "/";
        path = PATH.normalizeArray(
          path.split("/").filter(function(p) {
            return !!p;
          }),
          !isAbsolute
        ).join("/");
        if (!path && !isAbsolute) {
          path = ".";
        }
        if (path && trailingSlash) {
          path += "/";
        }
        return (isAbsolute ? "/" : "") + path;
      },
      dirname: function(path) {
        var result = PATH.splitPath(path),
          root = result[0],
          dir = result[1];
        if (!root && !dir) {
          return ".";
        }
        if (dir) {
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },
      basename: function(path) {
        if (path === "/") return "/";
        var lastSlash = path.lastIndexOf("/");
        if (lastSlash === -1) return path;
        return path.substr(lastSlash + 1);
      },
      extname: function(path) {
        return PATH.splitPath(path)[3];
      },
      join: function() {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join("/"));
      },
      join2: function(l, r) {
        return PATH.normalize(l + "/" + r);
      },
      resolve: function() {
        var resolvedPath = "",
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = i >= 0 ? arguments[i] : FS.cwd();
          if (typeof path !== "string") {
            throw new TypeError("Arguments to path.resolve must be strings");
          } else if (!path) {
            return "";
          }
          resolvedPath = path + "/" + resolvedPath;
          resolvedAbsolute = path.charAt(0) === "/";
        }
        resolvedPath = PATH.normalizeArray(
          resolvedPath.split("/").filter(function(p) {
            return !!p;
          }),
          !resolvedAbsolute
        ).join("/");
        return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
      },
      relative: function(from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== "") break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== "") break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split("/"));
        var toParts = trim(to.split("/"));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push("..");
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join("/");
      }
    };
    var TTY = {
      ttys: [],
      init: function() {},
      shutdown: function() {},
      register: function(dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },
      stream_ops: {
        open: function(stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },
        close: function(stream) {
          stream.tty.ops.flush(stream.tty);
        },
        flush: function(stream) {
          stream.tty.ops.flush(stream.tty);
        },
        read: function(stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset + i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },
        write: function(stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }
      },
      default_tty_ops: {
        get_char: function(tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              var BUFSIZE = 256;
              var buf = new Buffer(BUFSIZE);
              var bytesRead = 0;
              var isPosixPlatform = process.platform != "win32";
              var fd = process.stdin.fd;
              if (isPosixPlatform) {
                var usingDevice = false;
                try {
                  fd = fs.openSync("/dev/stdin", "r");
                  usingDevice = true;
                } catch (e) {}
              }
              try {
                bytesRead = fs.readSync(fd, buf, 0, BUFSIZE, null);
              } catch (e) {
                if (e.toString().indexOf("EOF") != -1) bytesRead = 0;
                else throw e;
              }
              if (usingDevice) {
                fs.closeSync(fd);
              }
              if (bytesRead > 0) {
                result = buf.slice(0, bytesRead).toString("utf-8");
              } else {
                result = null;
              }
            } else if (
              typeof window != "undefined" &&
              typeof window.prompt == "function"
            ) {
              result = window.prompt("Input: ");
              if (result !== null) {
                result += "\n";
              }
            } else if (typeof readline == "function") {
              result = readline();
              if (result !== null) {
                result += "\n";
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },
        put_char: function(tty, val) {
          if (val === null || val === 10) {
            out(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val);
          }
        },
        flush: function(tty) {
          if (tty.output && tty.output.length > 0) {
            out(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          }
        }
      },
      default_tty1_ops: {
        put_char: function(tty, val) {
          if (val === null || val === 10) {
            err(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val);
          }
        },
        flush: function(tty) {
          if (tty.output && tty.output.length > 0) {
            err(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          }
        }
      }
    };
    var MEMFS = {
      ops_table: null,
      mount: function(mount) {
        return MEMFS.createNode(null, "/", 16384 | 511, 0);
      },
      createNode: function(parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: { llseek: MEMFS.stream_ops.llseek }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap,
                msync: MEMFS.stream_ops.msync
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            }
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0;
          node.contents = null;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },
      getFileDataAsRegularArray: function(node) {
        if (node.contents && node.contents.subarray) {
          var arr = [];
          for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
          return arr;
        }
        return node.contents;
      },
      getFileDataAsTypedArray: function(node) {
        if (!node.contents) return new Uint8Array();
        if (node.contents.subarray)
          return node.contents.subarray(0, node.usedBytes);
        return new Uint8Array(node.contents);
      },
      expandFileStorage: function(node, newCapacity) {
        if (
          node.contents &&
          node.contents.subarray &&
          newCapacity > node.contents.length
        ) {
          node.contents = MEMFS.getFileDataAsRegularArray(node);
          node.usedBytes = node.contents.length;
        }
        if (!node.contents || node.contents.subarray) {
          var prevCapacity = node.contents ? node.contents.length : 0;
          if (prevCapacity >= newCapacity) return;
          var CAPACITY_DOUBLING_MAX = 1024 * 1024;
          newCapacity = Math.max(
            newCapacity,
            (prevCapacity *
              (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) |
              0
          );
          if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
          var oldContents = node.contents;
          node.contents = new Uint8Array(newCapacity);
          if (node.usedBytes > 0)
            node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
          return;
        }
        if (!node.contents && newCapacity > 0) node.contents = [];
        while (node.contents.length < newCapacity) node.contents.push(0);
      },
      resizeFileStorage: function(node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null;
          node.usedBytes = 0;
          return;
        }
        if (!node.contents || node.contents.subarray) {
          var oldContents = node.contents;
          node.contents = new Uint8Array(new ArrayBuffer(newSize));
          if (oldContents) {
            node.contents.set(
              oldContents.subarray(0, Math.min(newSize, node.usedBytes))
            );
          }
          node.usedBytes = newSize;
          return;
        }
        if (!node.contents) node.contents = [];
        if (node.contents.length > newSize) node.contents.length = newSize;
        else while (node.contents.length < newSize) node.contents.push(0);
        node.usedBytes = newSize;
      },
      node_ops: {
        getattr: function(node) {
          var attr = {};
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.usedBytes;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },
        setattr: function(node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },
        lookup: function(parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },
        mknod: function(parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },
        rename: function(old_node, new_dir, new_name) {
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {}
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },
        unlink: function(parent, name) {
          delete parent.contents[name];
        },
        rmdir: function(parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },
        readdir: function(node) {
          var entries = [".", ".."];
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },
        symlink: function(parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
          node.link = oldpath;
          return node;
        },
        readlink: function(node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }
      },
      stream_ops: {
        read: function(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) {
            buffer.set(contents.subarray(position, position + size), offset);
          } else {
            for (var i = 0; i < size; i++)
              buffer[offset + i] = contents[position + i];
          }
          return size;
        },
        write: function(stream, buffer, offset, length, position, canOwn) {
          if (canOwn) {
            warnOnce(
              "file packager has copied file data into memory, but in memory growth we are forced to copy it again (see --no-heap-copy)"
            );
          }
          canOwn = false;
          if (!length) return 0;
          var node = stream.node;
          node.timestamp = Date.now();
          if (buffer.subarray && (!node.contents || node.contents.subarray)) {
            if (canOwn) {
              assert(
                position === 0,
                "canOwn must imply no weird position inside the file"
              );
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) {
              node.contents = new Uint8Array(
                buffer.subarray(offset, offset + length)
              );
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) {
              node.contents.set(
                buffer.subarray(offset, offset + length),
                position
              );
              return length;
            }
          }
          MEMFS.expandFileStorage(node, position + length);
          if (node.contents.subarray && buffer.subarray)
            node.contents.set(
              buffer.subarray(offset, offset + length),
              position
            );
          else {
            for (var i = 0; i < length; i++) {
              node.contents[position + i] = buffer[offset + i];
            }
          }
          node.usedBytes = Math.max(node.usedBytes, position + length);
          return length;
        },
        llseek: function(stream, offset, whence) {
          var position = offset;
          if (whence === 1) {
            position += stream.position;
          } else if (whence === 2) {
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.usedBytes;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return position;
        },
        allocate: function(stream, offset, length) {
          MEMFS.expandFileStorage(stream.node, offset + length);
          stream.node.usedBytes = Math.max(
            stream.node.usedBytes,
            offset + length
          );
        },
        mmap: function(stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          if (
            !(flags & 2) &&
            (contents.buffer === buffer || contents.buffer === buffer.buffer)
          ) {
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            if (position > 0 || position + length < stream.node.usedBytes) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(
                  contents,
                  position,
                  position + length
                );
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        },
        msync: function(stream, buffer, offset, length, mmapFlags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          if (mmapFlags & 2) {
            return 0;
          }
          var bytesWritten = MEMFS.stream_ops.write(
            stream,
            buffer,
            0,
            length,
            offset,
            false
          );
          return 0;
        }
      }
    };
    var IDBFS = {
      dbs: {},
      indexedDB: function() {
        if (typeof indexedDB !== "undefined") return indexedDB;
        var ret = null;
        if (typeof window === "object")
          ret =
            window.indexedDB ||
            window.mozIndexedDB ||
            window.webkitIndexedDB ||
            window.msIndexedDB;
        assert(ret, "IDBFS used, but indexedDB not supported");
        return ret;
      },
      DB_VERSION: 21,
      DB_STORE_NAME: "FILE_DATA",
      mount: function(mount) {
        return MEMFS.mount.apply(null, arguments);
      },
      syncfs: function(mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },
      getDB: function(name, callback) {
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        if (!req) {
          return callback("Unable to connect to IndexedDB");
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
          var fileStore;
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
          if (!fileStore.indexNames.contains("timestamp")) {
            fileStore.createIndex("timestamp", "timestamp", { unique: false });
          }
        };
        req.onsuccess = function() {
          db = req.result;
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function(e) {
          callback(this.error);
          e.preventDefault();
        };
      },
      getLocalSet: function(mount, callback) {
        var entries = {};
        function isRealDir(p) {
          return p !== "." && p !== "..";
        }
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          };
        }
        var check = FS.readdir(mount.mountpoint)
          .filter(isRealDir)
          .map(toAbsolute(mount.mountpoint));
        while (check.length) {
          var path = check.pop();
          var stat;
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
          if (FS.isDir(stat.mode)) {
            check.push.apply(
              check,
              FS.readdir(path)
                .filter(isRealDir)
                .map(toAbsolute(path))
            );
          }
          entries[path] = { timestamp: stat.mtime };
        }
        return callback(null, { type: "local", entries: entries });
      },
      getRemoteSet: function(mount, callback) {
        var entries = {};
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
          try {
            var transaction = db.transaction([IDBFS.DB_STORE_NAME], "readonly");
            transaction.onerror = function(e) {
              callback(this.error);
              e.preventDefault();
            };
            var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
            var index = store.index("timestamp");
            index.openKeyCursor().onsuccess = function(event) {
              var cursor = event.target.result;
              if (!cursor) {
                return callback(null, {
                  type: "remote",
                  db: db,
                  entries: entries
                });
              }
              entries[cursor.primaryKey] = { timestamp: cursor.key };
              cursor.continue();
            };
          } catch (e) {
            return callback(e);
          }
        });
      },
      loadLocalEntry: function(path, callback) {
        var stat, node;
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          node.contents = MEMFS.getFileDataAsTypedArray(node);
          return callback(null, {
            timestamp: stat.mtime,
            mode: stat.mode,
            contents: node.contents
          });
        } else {
          return callback(new Error("node type not supported"));
        }
      },
      storeLocalEntry: function(path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { canOwn: true });
          } else {
            return callback(new Error("node type not supported"));
          }
          FS.chmod(path, entry.mode);
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
        callback(null);
      },
      removeLocalEntry: function(path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
        callback(null);
      },
      loadRemoteEntry: function(store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) {
          callback(null, event.target.result);
        };
        req.onerror = function(e) {
          callback(this.error);
          e.preventDefault();
        };
      },
      storeRemoteEntry: function(store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() {
          callback(null);
        };
        req.onerror = function(e) {
          callback(this.error);
          e.preventDefault();
        };
      },
      removeRemoteEntry: function(store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() {
          callback(null);
        };
        req.onerror = function(e) {
          callback(this.error);
          e.preventDefault();
        };
      },
      reconcile: function(src, dst, callback) {
        var total = 0;
        var create = [];
        Object.keys(src.entries).forEach(function(key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
        var remove = [];
        Object.keys(dst.entries).forEach(function(key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
        if (!total) {
          return callback(null);
        }
        var completed = 0;
        var db = src.type === "remote" ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], "readwrite");
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        }
        transaction.onerror = function(e) {
          done(this.error);
          e.preventDefault();
        };
        create.sort().forEach(function(path) {
          if (dst.type === "local") {
            IDBFS.loadRemoteEntry(store, path, function(err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function(err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
        remove
          .sort()
          .reverse()
          .forEach(function(path) {
            if (dst.type === "local") {
              IDBFS.removeLocalEntry(path, done);
            } else {
              IDBFS.removeRemoteEntry(store, path, done);
            }
          });
      }
    };
    var NODEFS = {
      isWindows: false,
      staticInit: function() {
        NODEFS.isWindows = !!process.platform.match(/^win/);
        var flags = process["binding"]("constants");
        if (flags["fs"]) {
          flags = flags["fs"];
        }
        NODEFS.flagsForNodeMap = {
          "1024": flags["O_APPEND"],
          "64": flags["O_CREAT"],
          "128": flags["O_EXCL"],
          "0": flags["O_RDONLY"],
          "2": flags["O_RDWR"],
          "4096": flags["O_SYNC"],
          "512": flags["O_TRUNC"],
          "1": flags["O_WRONLY"]
        };
      },
      bufferFrom: function(arrayBuffer) {
        return Buffer.alloc
          ? Buffer.from(arrayBuffer)
          : new Buffer(arrayBuffer);
      },
      mount: function(mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, "/", NODEFS.getMode(mount.opts.root), 0);
      },
      createNode: function(parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },
      getMode: function(path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            stat.mode = stat.mode | ((stat.mode & 292) >> 2);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },
      realPath: function(node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },
      flagsForNode: function(flags) {
        flags &= ~2097152;
        flags &= ~2048;
        flags &= ~32768;
        flags &= ~524288;
        var newFlags = 0;
        for (var k in NODEFS.flagsForNodeMap) {
          if (flags & k) {
            newFlags |= NODEFS.flagsForNodeMap[k];
            flags ^= k;
          }
        }
        if (!flags) {
          return newFlags;
        } else {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
      },
      node_ops: {
        getattr: function(node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = ((stat.size + stat.blksize - 1) / stat.blksize) | 0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },
        setattr: function(node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },
        lookup: function(parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },
        mknod: function(parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, "", { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },
        rename: function(oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },
        unlink: function(parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },
        rmdir: function(parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },
        readdir: function(node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },
        symlink: function(parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },
        readlink: function(node) {
          var path = NODEFS.realPath(node);
          try {
            path = fs.readlinkSync(path);
            path = NODEJS_PATH.relative(
              NODEJS_PATH.resolve(node.mount.opts.root),
              path
            );
            return path;
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }
      },
      stream_ops: {
        open: function(stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsForNode(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },
        close: function(stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },
        read: function(stream, buffer, offset, length, position) {
          if (length === 0) return 0;
          try {
            return fs.readSync(
              stream.nfd,
              NODEFS.bufferFrom(buffer.buffer),
              offset,
              length,
              position
            );
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },
        write: function(stream, buffer, offset, length, position) {
          try {
            return fs.writeSync(
              stream.nfd,
              NODEFS.bufferFrom(buffer.buffer),
              offset,
              length,
              position
            );
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },
        llseek: function(stream, offset, whence) {
          var position = offset;
          if (whence === 1) {
            position += stream.position;
          } else if (whence === 2) {
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return position;
        }
      }
    };
    var WORKERFS = {
      DIR_MODE: 16895,
      FILE_MODE: 33279,
      reader: null,
      mount: function(mount) {
        assert(ENVIRONMENT_IS_WORKER);
        if (!WORKERFS.reader) WORKERFS.reader = new FileReaderSync();
        var root = WORKERFS.createNode(null, "/", WORKERFS.DIR_MODE, 0);
        var createdParents = {};
        function ensureParent(path) {
          var parts = path.split("/");
          var parent = root;
          for (var i = 0; i < parts.length - 1; i++) {
            var curr = parts.slice(0, i + 1).join("/");
            if (!createdParents[curr]) {
              createdParents[curr] = WORKERFS.createNode(
                parent,
                parts[i],
                WORKERFS.DIR_MODE,
                0
              );
            }
            parent = createdParents[curr];
          }
          return parent;
        }
        function base(path) {
          var parts = path.split("/");
          return parts[parts.length - 1];
        }
        Array.prototype.forEach.call(mount.opts["files"] || [], function(file) {
          WORKERFS.createNode(
            ensureParent(file.name),
            base(file.name),
            WORKERFS.FILE_MODE,
            0,
            file,
            file.lastModifiedDate
          );
        });
        (mount.opts["blobs"] || []).forEach(function(obj) {
          WORKERFS.createNode(
            ensureParent(obj["name"]),
            base(obj["name"]),
            WORKERFS.FILE_MODE,
            0,
            obj["data"]
          );
        });
        (mount.opts["packages"] || []).forEach(function(pack) {
          pack["metadata"].files.forEach(function(file) {
            var name = file.filename.substr(1);
            WORKERFS.createNode(
              ensureParent(name),
              base(name),
              WORKERFS.FILE_MODE,
              0,
              pack["blob"].slice(file.start, file.end)
            );
          });
        });
        return root;
      },
      createNode: function(parent, name, mode, dev, contents, mtime) {
        var node = FS.createNode(parent, name, mode);
        node.mode = mode;
        node.node_ops = WORKERFS.node_ops;
        node.stream_ops = WORKERFS.stream_ops;
        node.timestamp = (mtime || new Date()).getTime();
        assert(WORKERFS.FILE_MODE !== WORKERFS.DIR_MODE);
        if (mode === WORKERFS.FILE_MODE) {
          node.size = contents.size;
          node.contents = contents;
        } else {
          node.size = 4096;
          node.contents = {};
        }
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },
      node_ops: {
        getattr: function(node) {
          return {
            dev: 1,
            ino: undefined,
            mode: node.mode,
            nlink: 1,
            uid: 0,
            gid: 0,
            rdev: undefined,
            size: node.size,
            atime: new Date(node.timestamp),
            mtime: new Date(node.timestamp),
            ctime: new Date(node.timestamp),
            blksize: 4096,
            blocks: Math.ceil(node.size / 4096)
          };
        },
        setattr: function(node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
        },
        lookup: function(parent, name) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        },
        mknod: function(parent, name, mode, dev) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        },
        rename: function(oldNode, newDir, newName) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        },
        unlink: function(parent, name) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        },
        rmdir: function(parent, name) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        },
        readdir: function(node) {
          var entries = [".", ".."];
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },
        symlink: function(parent, newName, oldPath) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        },
        readlink: function(node) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
      },
      stream_ops: {
        read: function(stream, buffer, offset, length, position) {
          if (position >= stream.node.size) return 0;
          var chunk = stream.node.contents.slice(position, position + length);
          var ab = WORKERFS.reader.readAsArrayBuffer(chunk);
          buffer.set(new Uint8Array(ab), offset);
          return chunk.size;
        },
        write: function(stream, buffer, offset, length, position) {
          throw new FS.ErrnoError(ERRNO_CODES.EIO);
        },
        llseek: function(stream, offset, whence) {
          var position = offset;
          if (whence === 1) {
            position += stream.position;
          } else if (whence === 2) {
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.size;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return position;
        }
      }
    };
    STATICTOP += 16;
    STATICTOP += 16;
    STATICTOP += 16;
    var FS = {
      root: null,
      mounts: [],
      devices: {},
      streams: [],
      nextInode: 1,
      nameTable: null,
      currentPath: "/",
      initialized: false,
      ignorePermissions: true,
      trackingDelegate: {},
      tracking: { openFlags: { READ: 1, WRITE: 2 } },
      ErrnoError: null,
      genericErrors: {},
      filesystems: null,
      syncFSRequests: 0,
      handleFSError: function(e) {
        if (!(e instanceof FS.ErrnoError)) throw e + " : " + stackTrace();
        return ___setErrNo(e.errno);
      },
      lookupPath: function(path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
        if (!path) return { path: "", node: null };
        var defaults = { follow_mount: true, recurse_count: 0 };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
        if (opts.recurse_count > 8) {
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
        var parts = PATH.normalizeArray(
          path.split("/").filter(function(p) {
            return !!p;
          }),
          false
        );
        var current = FS.root;
        var current_path = "/";
        for (var i = 0; i < parts.length; i++) {
          var islast = i === parts.length - 1;
          if (islast && opts.parent) {
            break;
          }
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              var lookup = FS.lookupPath(current_path, {
                recurse_count: opts.recurse_count
              });
              current = lookup.node;
              if (count++ > 40) {
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
        return { path: current_path, node: current };
      },
      getPath: function(node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length - 1] !== "/"
              ? mount + "/" + path
              : mount + path;
          }
          path = path ? node.name + "/" + path : node.name;
          node = node.parent;
        }
      },
      hashName: function(parentid, name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },
      hashAddNode: function(node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },
      hashRemoveNode: function(node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },
      lookupNode: function(parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err, parent);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        return FS.lookup(parent, name);
      },
      createNode: function(parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
          FS.FSNode.prototype = {};
          var readMode = 292 | 73;
          var writeMode = 146;
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() {
                return (this.mode & readMode) === readMode;
              },
              set: function(val) {
                val ? (this.mode |= readMode) : (this.mode &= ~readMode);
              }
            },
            write: {
              get: function() {
                return (this.mode & writeMode) === writeMode;
              },
              set: function(val) {
                val ? (this.mode |= writeMode) : (this.mode &= ~writeMode);
              }
            },
            isFolder: {
              get: function() {
                return FS.isDir(this.mode);
              }
            },
            isDevice: {
              get: function() {
                return FS.isChrdev(this.mode);
              }
            }
          });
        }
        var node = new FS.FSNode(parent, name, mode, rdev);
        FS.hashAddNode(node);
        return node;
      },
      destroyNode: function(node) {
        FS.hashRemoveNode(node);
      },
      isRoot: function(node) {
        return node === node.parent;
      },
      isMountpoint: function(node) {
        return !!node.mounted;
      },
      isFile: function(mode) {
        return (mode & 61440) === 32768;
      },
      isDir: function(mode) {
        return (mode & 61440) === 16384;
      },
      isLink: function(mode) {
        return (mode & 61440) === 40960;
      },
      isChrdev: function(mode) {
        return (mode & 61440) === 8192;
      },
      isBlkdev: function(mode) {
        return (mode & 61440) === 24576;
      },
      isFIFO: function(mode) {
        return (mode & 61440) === 4096;
      },
      isSocket: function(mode) {
        return (mode & 49152) === 49152;
      },
      flagModes: {
        r: 0,
        rs: 1052672,
        "r+": 2,
        w: 577,
        wx: 705,
        xw: 705,
        "w+": 578,
        "wx+": 706,
        "xw+": 706,
        a: 1089,
        ax: 1217,
        xa: 1217,
        "a+": 1090,
        "ax+": 1218,
        "xa+": 1218
      },
      modeStringToFlags: function(str) {
        var flags = FS.flagModes[str];
        if (typeof flags === "undefined") {
          throw new Error("Unknown file open mode: " + str);
        }
        return flags;
      },
      flagsToPermissionString: function(flag) {
        var perms = ["r", "w", "rw"][flag & 3];
        if (flag & 512) {
          perms += "w";
        }
        return perms;
      },
      nodePermissions: function(node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        if (perms.indexOf("r") !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf("w") !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf("x") !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },
      mayLookup: function(dir) {
        var err = FS.nodePermissions(dir, "x");
        if (err) return err;
        if (!dir.node_ops.lookup) return ERRNO_CODES.EACCES;
        return 0;
      },
      mayCreate: function(dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {}
        return FS.nodePermissions(dir, "wx");
      },
      mayDelete: function(dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, "wx");
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },
      mayOpen: function(node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },
      MAX_OPEN_FDS: 4096,
      nextfd: function(fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },
      getStream: function(fd) {
        return FS.streams[fd];
      },
      createStream: function(stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function() {};
          FS.FSStream.prototype = {};
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() {
                return this.node;
              },
              set: function(val) {
                this.node = val;
              }
            },
            isRead: {
              get: function() {
                return (this.flags & 2097155) !== 1;
              }
            },
            isWrite: {
              get: function() {
                return (this.flags & 2097155) !== 0;
              }
            },
            isAppend: {
              get: function() {
                return this.flags & 1024;
              }
            }
          });
        }
        var newStream = new FS.FSStream();
        for (var p in stream) {
          newStream[p] = stream[p];
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },
      closeStream: function(fd) {
        FS.streams[fd] = null;
      },
      chrdev_stream_ops: {
        open: function(stream) {
          var device = FS.getDevice(stream.node.rdev);
          stream.stream_ops = device.stream_ops;
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },
        llseek: function() {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
      },
      major: function(dev) {
        return dev >> 8;
      },
      minor: function(dev) {
        return dev & 255;
      },
      makedev: function(ma, mi) {
        return (ma << 8) | mi;
      },
      registerDevice: function(dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },
      getDevice: function(dev) {
        return FS.devices[dev];
      },
      getMounts: function(mount) {
        var mounts = [];
        var check = [mount];
        while (check.length) {
          var m = check.pop();
          mounts.push(m);
          check.push.apply(check, m.mounts);
        }
        return mounts;
      },
      syncfs: function(populate, callback) {
        if (typeof populate === "function") {
          callback = populate;
          populate = false;
        }
        FS.syncFSRequests++;
        if (FS.syncFSRequests > 1) {
          console.log(
            "warning: " +
              FS.syncFSRequests +
              " FS.syncfs operations in flight at once, probably just doing extra work"
          );
        }
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
        function doCallback(err) {
          assert(FS.syncFSRequests > 0);
          FS.syncFSRequests--;
          return callback(err);
        }
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return doCallback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            doCallback(null);
          }
        }
        mounts.forEach(function(mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },
      mount: function(type, opts, mountpoint) {
        var root = mountpoint === "/";
        var pseudo = !mountpoint;
        var node;
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
          mountpoint = lookup.path;
          node = lookup.node;
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          node.mounted = mount;
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
        return mountRoot;
      },
      unmount: function(mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
        Object.keys(FS.nameTable).forEach(function(hash) {
          var current = FS.nameTable[hash];
          while (current) {
            var next = current.name_next;
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
            current = next;
          }
        });
        node.mounted = null;
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },
      lookup: function(parent, name) {
        return parent.node_ops.lookup(parent, name);
      },
      mknod: function(path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === "." || name === "..") {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },
      create: function(path, mode) {
        mode = mode !== undefined ? mode : 438;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },
      mkdir: function(path, mode) {
        mode = mode !== undefined ? mode : 511;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },
      mkdirTree: function(path, mode) {
        var dirs = path.split("/");
        var d = "";
        for (var i = 0; i < dirs.length; ++i) {
          if (!dirs[i]) continue;
          d += "/" + dirs[i];
          try {
            FS.mkdir(d, mode);
          } catch (e) {
            if (e.errno != ERRNO_CODES.EEXIST) throw e;
          }
        }
      },
      mkdev: function(path, mode, dev) {
        if (typeof dev === "undefined") {
          dev = mode;
          mode = 438;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },
      symlink: function(oldpath, newpath) {
        if (!PATH.resolve(oldpath)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },
      rename: function(old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        if (!old_dir || !new_dir) throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        var old_node = FS.lookupNode(old_dir, old_name);
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== ".") {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== ".") {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {}
        if (old_node === new_node) {
          return;
        }
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        err = new_node
          ? FS.mayDelete(new_dir, new_name, isdir)
          : FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (
          FS.isMountpoint(old_node) ||
          (new_node && FS.isMountpoint(new_node))
        ) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, "w");
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        try {
          if (FS.trackingDelegate["willMovePath"]) {
            FS.trackingDelegate["willMovePath"](old_path, new_path);
          }
        } catch (e) {
          console.log(
            "FS.trackingDelegate['willMovePath']('" +
              old_path +
              "', '" +
              new_path +
              "') threw an exception: " +
              e.message
          );
        }
        FS.hashRemoveNode(old_node);
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          FS.hashAddNode(old_node);
        }
        try {
          if (FS.trackingDelegate["onMovePath"])
            FS.trackingDelegate["onMovePath"](old_path, new_path);
        } catch (e) {
          console.log(
            "FS.trackingDelegate['onMovePath']('" +
              old_path +
              "', '" +
              new_path +
              "') threw an exception: " +
              e.message
          );
        }
      },
      rmdir: function(path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate["willDeletePath"]) {
            FS.trackingDelegate["willDeletePath"](path);
          }
        } catch (e) {
          console.log(
            "FS.trackingDelegate['willDeletePath']('" +
              path +
              "') threw an exception: " +
              e.message
          );
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate["onDeletePath"])
            FS.trackingDelegate["onDeletePath"](path);
        } catch (e) {
          console.log(
            "FS.trackingDelegate['onDeletePath']('" +
              path +
              "') threw an exception: " +
              e.message
          );
        }
      },
      readdir: function(path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },
      unlink: function(path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate["willDeletePath"]) {
            FS.trackingDelegate["willDeletePath"](path);
          }
        } catch (e) {
          console.log(
            "FS.trackingDelegate['willDeletePath']('" +
              path +
              "') threw an exception: " +
              e.message
          );
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate["onDeletePath"])
            FS.trackingDelegate["onDeletePath"](path);
        } catch (e) {
          console.log(
            "FS.trackingDelegate['onDeletePath']('" +
              path +
              "') threw an exception: " +
              e.message
          );
        }
      },
      readlink: function(path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return PATH.resolve(
          FS.getPath(link.parent),
          link.node_ops.readlink(link)
        );
      },
      stat: function(path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },
      lstat: function(path) {
        return FS.stat(path, true);
      },
      chmod: function(path, mode, dontFollow) {
        var node;
        if (typeof path === "string") {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },
      lchmod: function(path, mode) {
        FS.chmod(path, mode, true);
      },
      fchmod: function(fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },
      chown: function(path, uid, gid, dontFollow) {
        var node;
        if (typeof path === "string") {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, { timestamp: Date.now() });
      },
      lchown: function(path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },
      fchown: function(fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },
      truncate: function(path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === "string") {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, "w");
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, { size: len, timestamp: Date.now() });
      },
      ftruncate: function(fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },
      utime: function(path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, { timestamp: Math.max(atime, mtime) });
      },
      open: function(path, flags, mode, fd_start, fd_end) {
        if (path === "") {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        flags = typeof flags === "string" ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === "undefined" ? 438 : mode;
        if (flags & 64) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === "object") {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, { follow: !(flags & 131072) });
            node = lookup.node;
          } catch (e) {}
        }
        var created = false;
        if (flags & 64) {
          if (node) {
            if (flags & 128) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            node = FS.mknod(path, mode, 0);
            created = true;
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        if (flags & 65536 && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        if (!created) {
          var err = FS.mayOpen(node, flags);
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        if (flags & 512) {
          FS.truncate(node, 0);
        }
        flags &= ~(128 | 512);
        var stream = FS.createStream(
          {
            node: node,
            path: FS.getPath(node),
            flags: flags,
            seekable: true,
            position: 0,
            stream_ops: node.stream_ops,
            ungotten: [],
            error: false
          },
          fd_start,
          fd_end
        );
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module["logReadFiles"] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            err("read file: " + path);
          }
        }
        try {
          if (FS.trackingDelegate["onOpenFile"]) {
            var trackingFlags = 0;
            if ((flags & 2097155) !== 1) {
              trackingFlags |= FS.tracking.openFlags.READ;
            }
            if ((flags & 2097155) !== 0) {
              trackingFlags |= FS.tracking.openFlags.WRITE;
            }
            FS.trackingDelegate["onOpenFile"](path, trackingFlags);
          }
        } catch (e) {
          console.log(
            "FS.trackingDelegate['onOpenFile']('" +
              path +
              "', flags) threw an exception: " +
              e.message
          );
        }
        return stream;
      },
      close: function(stream) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (stream.getdents) stream.getdents = null;
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
        stream.fd = null;
      },
      isClosed: function(stream) {
        return stream.fd === null;
      },
      llseek: function(stream, offset, whence) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position;
      },
      read: function(stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = typeof position !== "undefined";
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(
          stream,
          buffer,
          offset,
          length,
          position
        );
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },
      write: function(stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if (stream.flags & 1024) {
          FS.llseek(stream, 0, 2);
        }
        var seeking = typeof position !== "undefined";
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesWritten = stream.stream_ops.write(
          stream,
          buffer,
          offset,
          length,
          position,
          canOwn
        );
        if (!seeking) stream.position += bytesWritten;
        try {
          if (stream.path && FS.trackingDelegate["onWriteToFile"])
            FS.trackingDelegate["onWriteToFile"](stream.path);
        } catch (e) {
          console.log(
            "FS.trackingDelegate['onWriteToFile']('" +
              path +
              "') threw an exception: " +
              e.message
          );
        }
        return bytesWritten;
      },
      allocate: function(stream, offset, length) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },
      mmap: function(stream, buffer, offset, length, position, prot, flags) {
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(
          stream,
          buffer,
          offset,
          length,
          position,
          prot,
          flags
        );
      },
      msync: function(stream, buffer, offset, length, mmapFlags) {
        if (!stream || !stream.stream_ops.msync) {
          return 0;
        }
        return stream.stream_ops.msync(
          stream,
          buffer,
          offset,
          length,
          mmapFlags
        );
      },
      munmap: function(stream) {
        return 0;
      },
      ioctl: function(stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },
      readFile: function(path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || "r";
        opts.encoding = opts.encoding || "binary";
        if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === "utf8") {
          ret = UTF8ArrayToString(buf, 0);
        } else if (opts.encoding === "binary") {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },
      writeFile: function(path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || "w";
        var stream = FS.open(path, opts.flags, opts.mode);
        if (typeof data === "string") {
          var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
          var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
          FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
        } else if (ArrayBuffer.isView(data)) {
          FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
        } else {
          throw new Error("Unsupported data type");
        }
        FS.close(stream);
      },
      cwd: function() {
        return FS.currentPath;
      },
      chdir: function(path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (lookup.node === null) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, "x");
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },
      createDefaultDirectories: function() {
        FS.mkdir("/tmp");
        FS.mkdir("/home");
        FS.mkdir("/home/web_user");
      },
      createDefaultDevices: function() {
        FS.mkdir("/dev");
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() {
            return 0;
          },
          write: function(stream, buffer, offset, length, pos) {
            return length;
          }
        });
        FS.mkdev("/dev/null", FS.makedev(1, 3));
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev("/dev/tty", FS.makedev(5, 0));
        FS.mkdev("/dev/tty1", FS.makedev(6, 0));
        var random_device;
        if (typeof crypto !== "undefined") {
          var randomBuffer = new Uint8Array(1);
          random_device = function() {
            crypto.getRandomValues(randomBuffer);
            return randomBuffer[0];
          };
        } else if (ENVIRONMENT_IS_NODE) {
          random_device = function() {
            return require("crypto")["randomBytes"](1)[0];
          };
        } else {
          random_device = function() {
            abort("random_device");
          };
        }
        FS.createDevice("/dev", "random", random_device);
        FS.createDevice("/dev", "urandom", random_device);
        FS.mkdir("/dev/shm");
        FS.mkdir("/dev/shm/tmp");
      },
      createSpecialDirectories: function() {
        FS.mkdir("/proc");
        FS.mkdir("/proc/self");
        FS.mkdir("/proc/self/fd");
        FS.mount(
          {
            mount: function() {
              var node = FS.createNode("/proc/self", "fd", 16384 | 511, 73);
              node.node_ops = {
                lookup: function(parent, name) {
                  var fd = +name;
                  var stream = FS.getStream(fd);
                  if (!stream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
                  var ret = {
                    parent: null,
                    mount: { mountpoint: "fake" },
                    node_ops: {
                      readlink: function() {
                        return stream.path;
                      }
                    }
                  };
                  ret.parent = ret;
                  return ret;
                }
              };
              return node;
            }
          },
          {},
          "/proc/self/fd"
        );
      },
      createStandardStreams: function() {
        if (Module["stdin"]) {
          FS.createDevice("/dev", "stdin", Module["stdin"]);
        } else {
          FS.symlink("/dev/tty", "/dev/stdin");
        }
        if (Module["stdout"]) {
          FS.createDevice("/dev", "stdout", null, Module["stdout"]);
        } else {
          FS.symlink("/dev/tty", "/dev/stdout");
        }
        if (Module["stderr"]) {
          FS.createDevice("/dev", "stderr", null, Module["stderr"]);
        } else {
          FS.symlink("/dev/tty1", "/dev/stderr");
        }
        var stdin = FS.open("/dev/stdin", "r");
        assert(stdin.fd === 0, "invalid handle for stdin (" + stdin.fd + ")");
        var stdout = FS.open("/dev/stdout", "w");
        assert(
          stdout.fd === 1,
          "invalid handle for stdout (" + stdout.fd + ")"
        );
        var stderr = FS.open("/dev/stderr", "w");
        assert(
          stderr.fd === 2,
          "invalid handle for stderr (" + stderr.fd + ")"
        );
      },
      ensureErrnoError: function() {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno, node) {
          this.node = node;
          this.setErrno = function(errno) {
            this.errno = errno;
            for (var key in ERRNO_CODES) {
              if (ERRNO_CODES[key] === errno) {
                this.code = key;
                break;
              }
            }
          };
          this.setErrno(errno);
          this.message = ERRNO_MESSAGES[errno];
          if (this.stack)
            Object.defineProperty(this, "stack", {
              value: new Error().stack,
              writable: true
            });
          if (this.stack) this.stack = demangleAll(this.stack);
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = "<generic error, no stack>";
        });
      },
      staticInit: function() {
        FS.ensureErrnoError();
        FS.nameTable = new Array(4096);
        FS.mount(MEMFS, {}, "/");
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
        FS.filesystems = {
          MEMFS: MEMFS,
          IDBFS: IDBFS,
          NODEFS: NODEFS,
          WORKERFS: WORKERFS
        };
      },
      init: function(input, output, error) {
        assert(
          !FS.init.initialized,
          "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)"
        );
        FS.init.initialized = true;
        FS.ensureErrnoError();
        Module["stdin"] = input || Module["stdin"];
        Module["stdout"] = output || Module["stdout"];
        Module["stderr"] = error || Module["stderr"];
        FS.createStandardStreams();
      },
      quit: function() {
        FS.init.initialized = false;
        var fflush = Module["_fflush"];
        if (fflush) fflush(0);
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },
      getMode: function(canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },
      joinPath: function(parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == "/") path = path.substr(1);
        return path;
      },
      absolutePath: function(relative, base) {
        return PATH.resolve(base, relative);
      },
      standardizePath: function(path) {
        return PATH.normalize(path);
      },
      findObject: function(path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },
      analyzePath: function(path, dontResolveLastLink) {
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {}
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === "/";
        } catch (e) {
          ret.error = e.errno;
        }
        return ret;
      },
      createFolder: function(parent, name, canRead, canWrite) {
        var path = PATH.join2(
          typeof parent === "string" ? parent : FS.getPath(parent),
          name
        );
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },
      createPath: function(parent, path, canRead, canWrite) {
        parent = typeof parent === "string" ? parent : FS.getPath(parent);
        var parts = path.split("/").reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {}
          parent = current;
        }
        return current;
      },
      createFile: function(parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(
          typeof parent === "string" ? parent : FS.getPath(parent),
          name
        );
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },
      createDataFile: function(parent, name, data, canRead, canWrite, canOwn) {
        var path = name
          ? PATH.join2(
              typeof parent === "string" ? parent : FS.getPath(parent),
              name
            )
          : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === "string") {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i)
              arr[i] = data.charCodeAt(i);
            data = arr;
          }
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, "w");
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },
      createDevice: function(parent, name, input, output) {
        var path = PATH.join2(
          typeof parent === "string" ? parent : FS.getPath(parent),
          name
        );
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset + i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset + i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },
      createLink: function(parent, name, target, canRead, canWrite) {
        var path = PATH.join2(
          typeof parent === "string" ? parent : FS.getPath(parent),
          name
        );
        return FS.symlink(target, path);
      },
      forceLoadFile: function(obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents)
          return true;
        var success = true;
        if (typeof XMLHttpRequest !== "undefined") {
          throw new Error(
            "Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread."
          );
        } else if (Module["read"]) {
          try {
            obj.contents = intArrayFromString(Module["read"](obj.url), true);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error("Cannot load without read() or XMLHttpRequest.");
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },
      createLazyFile: function(parent, name, url, canRead, canWrite) {
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = [];
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
          if (idx > this.length - 1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = (idx / this.chunkSize) | 0;
          return this.getter(chunkNum)[chunkOffset];
        };
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(
          getter
        ) {
          this.getter = getter;
        };
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
          var xhr = new XMLHttpRequest();
          xhr.open("HEAD", url, false);
          xhr.send(null);
          if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
            throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing =
            (header = xhr.getResponseHeader("Accept-Ranges")) &&
            header === "bytes";
          var usesGzip =
            (header = xhr.getResponseHeader("Content-Encoding")) &&
            header === "gzip";
          var chunkSize = 1024 * 1024;
          if (!hasByteServing) chunkSize = datalength;
          var doXHR = function(from, to) {
            if (from > to)
              throw new Error(
                "invalid range (" +
                  from +
                  ", " +
                  to +
                  ") or no bytes requested!"
              );
            if (to > datalength - 1)
              throw new Error(
                "only " + datalength + " bytes available! programmer error!"
              );
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            if (datalength !== chunkSize)
              xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
            if (typeof Uint8Array != "undefined")
              xhr.responseType = "arraybuffer";
            if (xhr.overrideMimeType) {
              xhr.overrideMimeType("text/plain; charset=x-user-defined");
            }
            xhr.send(null);
            if (
              !((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304)
            )
              throw new Error(
                "Couldn't load " + url + ". Status: " + xhr.status
              );
            if (xhr.response !== undefined) {
              return new Uint8Array(xhr.response || []);
            } else {
              return intArrayFromString(xhr.responseText || "", true);
            }
          };
          var lazyArray = this;
          lazyArray.setDataGetter(function(chunkNum) {
            var start = chunkNum * chunkSize;
            var end = (chunkNum + 1) * chunkSize - 1;
            end = Math.min(end, datalength - 1);
            if (typeof lazyArray.chunks[chunkNum] === "undefined") {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof lazyArray.chunks[chunkNum] === "undefined")
              throw new Error("doXHR failed!");
            return lazyArray.chunks[chunkNum];
          });
          if (usesGzip || !datalength) {
            chunkSize = datalength = 1;
            datalength = this.getter(0).length;
            chunkSize = datalength;
            console.log(
              "LazyFiles on gzip forces download of the whole file when length is accessed"
            );
          }
          this._length = datalength;
          this._chunkSize = chunkSize;
          this.lengthKnown = true;
        };
        if (typeof XMLHttpRequest !== "undefined") {
          if (!ENVIRONMENT_IS_WORKER)
            throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
          var lazyArray = new LazyUint8Array();
          Object.defineProperties(lazyArray, {
            length: {
              get: function() {
                if (!this.lengthKnown) {
                  this.cacheLength();
                }
                return this._length;
              }
            },
            chunkSize: {
              get: function() {
                if (!this.lengthKnown) {
                  this.cacheLength();
                }
                return this._chunkSize;
              }
            }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        Object.defineProperties(node, {
          usedBytes: {
            get: function() {
              return this.contents.length;
            }
          }
        });
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        stream_ops.read = function stream_ops_read(
          stream,
          buffer,
          offset,
          length,
          position
        ) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length) return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },
      createPreloadedFile: function(
        parent,
        name,
        url,
        canRead,
        canWrite,
        onload,
        onerror,
        dontCreateFile,
        canOwn,
        preFinish
      ) {
        Browser.init();
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        var dep = getUniqueRunDependency("cp " + fullname);
        function processData(byteArray) {
          function finish(byteArray) {
            if (preFinish) preFinish();
            if (!dontCreateFile) {
              FS.createDataFile(
                parent,
                name,
                byteArray,
                canRead,
                canWrite,
                canOwn
              );
            }
            if (onload) onload();
            removeRunDependency(dep);
          }
          var handled = false;
          Module["preloadPlugins"].forEach(function(plugin) {
            if (handled) return;
            if (plugin["canHandle"](fullname)) {
              plugin["handle"](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency(dep);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency(dep);
        if (typeof url == "string") {
          Browser.asyncLoad(
            url,
            function(byteArray) {
              processData(byteArray);
            },
            onerror
          );
        } else {
          processData(url);
        }
      },
      indexedDB: function() {
        return (
          window.indexedDB ||
          window.mozIndexedDB ||
          window.webkitIndexedDB ||
          window.msIndexedDB
        );
      },
      DB_NAME: function() {
        return "EM_FS_" + window.location.pathname;
      },
      DB_VERSION: 20,
      DB_STORE_NAME: "FILE_DATA",
      saveFilesToDB: function(paths, onload, onerror) {
        onload = onload || function() {};
        onerror = onerror || function() {};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log("creating db");
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], "readwrite");
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0,
            fail = 0,
            total = paths.length;
          function finish() {
            if (fail == 0) onload();
            else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(
              FS.analyzePath(path).object.contents,
              path
            );
            putRequest.onsuccess = function putRequest_onsuccess() {
              ok++;
              if (ok + fail == total) finish();
            };
            putRequest.onerror = function putRequest_onerror() {
              fail++;
              if (ok + fail == total) finish();
            };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },
      loadFilesFromDB: function(paths, onload, onerror) {
        onload = onload || function() {};
        onerror = onerror || function() {};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror;
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], "readonly");
          } catch (e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0,
            fail = 0,
            total = paths.length;
          function finish() {
            if (fail == 0) onload();
            else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(
                PATH.dirname(path),
                PATH.basename(path),
                getRequest.result,
                true,
                true,
                true
              );
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() {
              fail++;
              if (ok + fail == total) finish();
            };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }
    };
    var SYSCALLS = {
      DEFAULT_POLLMASK: 5,
      mappings: {},
      umask: 511,
      calculateAt: function(dirfd, path) {
        if (path[0] !== "/") {
          var dir;
          if (dirfd === -100) {
            dir = FS.cwd();
          } else {
            var dirstream = FS.getStream(dirfd);
            if (!dirstream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
            dir = dirstream.path;
          }
          path = PATH.join2(dir, path);
        }
        return path;
      },
      doStat: function(func, path, buf) {
        try {
          var stat = func(path);
        } catch (e) {
          if (
            e &&
            e.node &&
            PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))
          ) {
            return -ERRNO_CODES.ENOTDIR;
          }
          throw e;
        }
        HEAP32[buf >> 2] = stat.dev;
        HEAP32[(buf + 4) >> 2] = 0;
        HEAP32[(buf + 8) >> 2] = stat.ino;
        HEAP32[(buf + 12) >> 2] = stat.mode;
        HEAP32[(buf + 16) >> 2] = stat.nlink;
        HEAP32[(buf + 20) >> 2] = stat.uid;
        HEAP32[(buf + 24) >> 2] = stat.gid;
        HEAP32[(buf + 28) >> 2] = stat.rdev;
        HEAP32[(buf + 32) >> 2] = 0;
        HEAP32[(buf + 36) >> 2] = stat.size;
        HEAP32[(buf + 40) >> 2] = 4096;
        HEAP32[(buf + 44) >> 2] = stat.blocks;
        HEAP32[(buf + 48) >> 2] = (stat.atime.getTime() / 1e3) | 0;
        HEAP32[(buf + 52) >> 2] = 0;
        HEAP32[(buf + 56) >> 2] = (stat.mtime.getTime() / 1e3) | 0;
        HEAP32[(buf + 60) >> 2] = 0;
        HEAP32[(buf + 64) >> 2] = (stat.ctime.getTime() / 1e3) | 0;
        HEAP32[(buf + 68) >> 2] = 0;
        HEAP32[(buf + 72) >> 2] = stat.ino;
        return 0;
      },
      doMsync: function(addr, stream, len, flags) {
        var buffer = new Uint8Array(HEAPU8.subarray(addr, addr + len));
        FS.msync(stream, buffer, 0, len, flags);
      },
      doMkdir: function(path, mode) {
        path = PATH.normalize(path);
        if (path[path.length - 1] === "/")
          path = path.substr(0, path.length - 1);
        FS.mkdir(path, mode, 0);
        return 0;
      },
      doMknod: function(path, mode, dev) {
        switch (mode & 61440) {
          case 32768:
          case 8192:
          case 24576:
          case 4096:
          case 49152:
            break;
          default:
            return -ERRNO_CODES.EINVAL;
        }
        FS.mknod(path, mode, dev);
        return 0;
      },
      doReadlink: function(path, buf, bufsize) {
        if (bufsize <= 0) return -ERRNO_CODES.EINVAL;
        var ret = FS.readlink(path);
        var len = Math.min(bufsize, lengthBytesUTF8(ret));
        var endChar = HEAP8[buf + len];
        stringToUTF8(ret, buf, bufsize + 1);
        HEAP8[buf + len] = endChar;
        return len;
      },
      doAccess: function(path, amode) {
        if (amode & ~7) {
          return -ERRNO_CODES.EINVAL;
        }
        var node;
        var lookup = FS.lookupPath(path, { follow: true });
        node = lookup.node;
        var perms = "";
        if (amode & 4) perms += "r";
        if (amode & 2) perms += "w";
        if (amode & 1) perms += "x";
        if (perms && FS.nodePermissions(node, perms)) {
          return -ERRNO_CODES.EACCES;
        }
        return 0;
      },
      doDup: function(path, flags, suggestFD) {
        var suggest = FS.getStream(suggestFD);
        if (suggest) FS.close(suggest);
        return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
      },
      doReadv: function(stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAP32[(iov + i * 8) >> 2];
          var len = HEAP32[(iov + (i * 8 + 4)) >> 2];
          var curr = FS.read(stream, HEAP8, ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
          if (curr < len) break;
        }
        return ret;
      },
      doWritev: function(stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAP32[(iov + i * 8) >> 2];
          var len = HEAP32[(iov + (i * 8 + 4)) >> 2];
          var curr = FS.write(stream, HEAP8, ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
        }
        return ret;
      },
      varargs: 0,
      get: function(varargs) {
        SYSCALLS.varargs += 4;
        var ret = HEAP32[(SYSCALLS.varargs - 4) >> 2];
        return ret;
      },
      getStr: function() {
        var ret = Pointer_stringify(SYSCALLS.get());
        return ret;
      },
      getStreamFromFD: function() {
        var stream = FS.getStream(SYSCALLS.get());
        if (!stream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        return stream;
      },
      getSocketFromFD: function() {
        var socket = SOCKFS.getSocket(SYSCALLS.get());
        if (!socket) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        return socket;
      },
      getSocketAddress: function(allowNull) {
        var addrp = SYSCALLS.get(),
          addrlen = SYSCALLS.get();
        if (allowNull && addrp === 0) return null;
        var info = __read_sockaddr(addrp, addrlen);
        if (info.errno) throw new FS.ErrnoError(info.errno);
        info.addr = DNS.lookup_addr(info.addr) || info.addr;
        return info;
      },
      get64: function() {
        var low = SYSCALLS.get(),
          high = SYSCALLS.get();
        if (low >= 0) assert(high === 0);
        else assert(high === -1);
        return low;
      },
      getZero: function() {
        assert(SYSCALLS.get() === 0);
      }
    };
    function ___syscall140(which, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD(),
          offset_high = SYSCALLS.get(),
          offset_low = SYSCALLS.get(),
          result = SYSCALLS.get(),
          whence = SYSCALLS.get();
        var offset = offset_low;
        FS.llseek(stream, offset, whence);
        HEAP32[result >> 2] = stream.position;
        if (stream.getdents && offset === 0 && whence === 0)
          stream.getdents = null;
        return 0;
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return -e.errno;
      }
    }
    function ___syscall145(which, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD(),
          iov = SYSCALLS.get(),
          iovcnt = SYSCALLS.get();
        return SYSCALLS.doReadv(stream, iov, iovcnt);
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return -e.errno;
      }
    }
    function ___syscall146(which, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD(),
          iov = SYSCALLS.get(),
          iovcnt = SYSCALLS.get();
        return SYSCALLS.doWritev(stream, iov, iovcnt);
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return -e.errno;
      }
    }
    function ___syscall221(which, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD(),
          cmd = SYSCALLS.get();
        switch (cmd) {
          case 0: {
            var arg = SYSCALLS.get();
            if (arg < 0) {
              return -ERRNO_CODES.EINVAL;
            }
            var newStream;
            newStream = FS.open(stream.path, stream.flags, 0, arg);
            return newStream.fd;
          }
          case 1:
          case 2:
            return 0;
          case 3:
            return stream.flags;
          case 4: {
            var arg = SYSCALLS.get();
            stream.flags |= arg;
            return 0;
          }
          case 12:
          case 12: {
            var arg = SYSCALLS.get();
            var offset = 0;
            HEAP16[(arg + offset) >> 1] = 2;
            return 0;
          }
          case 13:
          case 14:
          case 13:
          case 14:
            return 0;
          case 16:
          case 8:
            return -ERRNO_CODES.EINVAL;
          case 9:
            ___setErrNo(ERRNO_CODES.EINVAL);
            return -1;
          default: {
            return -ERRNO_CODES.EINVAL;
          }
        }
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return -e.errno;
      }
    }
    function ___syscall3(which, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD(),
          buf = SYSCALLS.get(),
          count = SYSCALLS.get();
        return FS.read(stream, HEAP8, buf, count);
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return -e.errno;
      }
    }
    function ___syscall5(which, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var pathname = SYSCALLS.getStr(),
          flags = SYSCALLS.get(),
          mode = SYSCALLS.get();
        var stream = FS.open(pathname, flags, mode);
        return stream.fd;
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return -e.errno;
      }
    }
    function ___syscall54(which, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD(),
          op = SYSCALLS.get();
        switch (op) {
          case 21509:
          case 21505: {
            if (!stream.tty) return -ERRNO_CODES.ENOTTY;
            return 0;
          }
          case 21510:
          case 21511:
          case 21512:
          case 21506:
          case 21507:
          case 21508: {
            if (!stream.tty) return -ERRNO_CODES.ENOTTY;
            return 0;
          }
          case 21519: {
            if (!stream.tty) return -ERRNO_CODES.ENOTTY;
            var argp = SYSCALLS.get();
            HEAP32[argp >> 2] = 0;
            return 0;
          }
          case 21520: {
            if (!stream.tty) return -ERRNO_CODES.ENOTTY;
            return -ERRNO_CODES.EINVAL;
          }
          case 21531: {
            var argp = SYSCALLS.get();
            return FS.ioctl(stream, op, argp);
          }
          case 21523: {
            if (!stream.tty) return -ERRNO_CODES.ENOTTY;
            return 0;
          }
          case 21524: {
            if (!stream.tty) return -ERRNO_CODES.ENOTTY;
            return 0;
          }
          default:
            abort("bad ioctl syscall " + op);
        }
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return -e.errno;
      }
    }
    function ___syscall6(which, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD();
        FS.close(stream);
        return 0;
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return -e.errno;
      }
    }
    function ___syscall91(which, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var addr = SYSCALLS.get(),
          len = SYSCALLS.get();
        var info = SYSCALLS.mappings[addr];
        if (!info) return 0;
        if (len === info.len) {
          var stream = FS.getStream(info.fd);
          SYSCALLS.doMsync(addr, stream, len, info.flags);
          FS.munmap(stream);
          SYSCALLS.mappings[addr] = null;
          if (info.allocated) {
            _free(info.malloc);
          }
        }
        return 0;
      } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
          abort(e);
        return -e.errno;
      }
    }
    function ___unlock() {}
    function getShiftFromSize(size) {
      switch (size) {
        case 1:
          return 0;
        case 2:
          return 1;
        case 4:
          return 2;
        case 8:
          return 3;
        default:
          throw new TypeError("Unknown type size: " + size);
      }
    }
    function embind_init_charCodes() {
      var codes = new Array(256);
      for (var i = 0; i < 256; ++i) {
        codes[i] = String.fromCharCode(i);
      }
      embind_charCodes = codes;
    }
    var embind_charCodes = undefined;
    function readLatin1String(ptr) {
      var ret = "";
      var c = ptr;
      while (HEAPU8[c]) {
        ret += embind_charCodes[HEAPU8[c++]];
      }
      return ret;
    }
    var awaitingDependencies = {};
    var registeredTypes = {};
    var typeDependencies = {};
    var char_0 = 48;
    var char_9 = 57;
    function makeLegalFunctionName(name) {
      if (undefined === name) {
        return "_unknown";
      }
      name = name.replace(/[^a-zA-Z0-9_]/g, "$");
      var f = name.charCodeAt(0);
      if (f >= char_0 && f <= char_9) {
        return "_" + name;
      } else {
        return name;
      }
    }
    function createNamedFunction(name, body) {
      name = makeLegalFunctionName(name);
      return new Function(
        "body",
        "return function " +
          name +
          "() {\n" +
          '    "use strict";' +
          "    return body.apply(this, arguments);\n" +
          "};\n"
      )(body);
    }
    function extendError(baseErrorType, errorName) {
      var errorClass = createNamedFunction(errorName, function(message) {
        this.name = errorName;
        this.message = message;
        var stack = new Error(message).stack;
        if (stack !== undefined) {
          this.stack =
            this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "");
        }
      });
      errorClass.prototype = Object.create(baseErrorType.prototype);
      errorClass.prototype.constructor = errorClass;
      errorClass.prototype.toString = function() {
        if (this.message === undefined) {
          return this.name;
        } else {
          return this.name + ": " + this.message;
        }
      };
      return errorClass;
    }
    var BindingError = undefined;
    function throwBindingError(message) {
      throw new BindingError(message);
    }
    var InternalError = undefined;
    function throwInternalError(message) {
      throw new InternalError(message);
    }
    function whenDependentTypesAreResolved(
      myTypes,
      dependentTypes,
      getTypeConverters
    ) {
      myTypes.forEach(function(type) {
        typeDependencies[type] = dependentTypes;
      });
      function onComplete(typeConverters) {
        var myTypeConverters = getTypeConverters(typeConverters);
        if (myTypeConverters.length !== myTypes.length) {
          throwInternalError("Mismatched type converter count");
        }
        for (var i = 0; i < myTypes.length; ++i) {
          registerType(myTypes[i], myTypeConverters[i]);
        }
      }
      var typeConverters = new Array(dependentTypes.length);
      var unregisteredTypes = [];
      var registered = 0;
      dependentTypes.forEach(function(dt, i) {
        if (registeredTypes.hasOwnProperty(dt)) {
          typeConverters[i] = registeredTypes[dt];
        } else {
          unregisteredTypes.push(dt);
          if (!awaitingDependencies.hasOwnProperty(dt)) {
            awaitingDependencies[dt] = [];
          }
          awaitingDependencies[dt].push(function() {
            typeConverters[i] = registeredTypes[dt];
            ++registered;
            if (registered === unregisteredTypes.length) {
              onComplete(typeConverters);
            }
          });
        }
      });
      if (0 === unregisteredTypes.length) {
        onComplete(typeConverters);
      }
    }
    function registerType(rawType, registeredInstance, options) {
      options = options || {};
      if (!("argPackAdvance" in registeredInstance)) {
        throw new TypeError(
          "registerType registeredInstance requires argPackAdvance"
        );
      }
      var name = registeredInstance.name;
      if (!rawType) {
        throwBindingError(
          'type "' + name + '" must have a positive integer typeid pointer'
        );
      }
      if (registeredTypes.hasOwnProperty(rawType)) {
        if (options.ignoreDuplicateRegistrations) {
          return;
        } else {
          throwBindingError("Cannot register type '" + name + "' twice");
        }
      }
      registeredTypes[rawType] = registeredInstance;
      delete typeDependencies[rawType];
      if (awaitingDependencies.hasOwnProperty(rawType)) {
        var callbacks = awaitingDependencies[rawType];
        delete awaitingDependencies[rawType];
        callbacks.forEach(function(cb) {
          cb();
        });
      }
    }
    function __embind_register_bool(
      rawType,
      name,
      size,
      trueValue,
      falseValue
    ) {
      var shift = getShiftFromSize(size);
      name = readLatin1String(name);
      registerType(rawType, {
        name: name,
        fromWireType: function(wt) {
          return !!wt;
        },
        toWireType: function(destructors, o) {
          return o ? trueValue : falseValue;
        },
        argPackAdvance: 8,
        readValueFromPointer: function(pointer) {
          var heap;
          if (size === 1) {
            heap = HEAP8;
          } else if (size === 2) {
            heap = HEAP16;
          } else if (size === 4) {
            heap = HEAP32;
          } else {
            throw new TypeError("Unknown boolean type size: " + name);
          }
          return this["fromWireType"](heap[pointer >> shift]);
        },
        destructorFunction: null
      });
    }
    var emval_free_list = [];
    var emval_handle_array = [
      {},
      { value: undefined },
      { value: null },
      { value: true },
      { value: false }
    ];
    function __emval_decref(handle) {
      if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
        emval_handle_array[handle] = undefined;
        emval_free_list.push(handle);
      }
    }
    function count_emval_handles() {
      var count = 0;
      for (var i = 5; i < emval_handle_array.length; ++i) {
        if (emval_handle_array[i] !== undefined) {
          ++count;
        }
      }
      return count;
    }
    function get_first_emval() {
      for (var i = 5; i < emval_handle_array.length; ++i) {
        if (emval_handle_array[i] !== undefined) {
          return emval_handle_array[i];
        }
      }
      return null;
    }
    function init_emval() {
      Module["count_emval_handles"] = count_emval_handles;
      Module["get_first_emval"] = get_first_emval;
    }
    function __emval_register(value) {
      switch (value) {
        case undefined: {
          return 1;
        }
        case null: {
          return 2;
        }
        case true: {
          return 3;
        }
        case false: {
          return 4;
        }
        default: {
          var handle = emval_free_list.length
            ? emval_free_list.pop()
            : emval_handle_array.length;
          emval_handle_array[handle] = { refcount: 1, value: value };
          return handle;
        }
      }
    }
    function simpleReadValueFromPointer(pointer) {
      return this["fromWireType"](HEAPU32[pointer >> 2]);
    }
    function __embind_register_emval(rawType, name) {
      name = readLatin1String(name);
      registerType(rawType, {
        name: name,
        fromWireType: function(handle) {
          var rv = emval_handle_array[handle].value;
          __emval_decref(handle);
          return rv;
        },
        toWireType: function(destructors, value) {
          return __emval_register(value);
        },
        argPackAdvance: 8,
        readValueFromPointer: simpleReadValueFromPointer,
        destructorFunction: null
      });
    }
    function _embind_repr(v) {
      if (v === null) {
        return "null";
      }
      var t = typeof v;
      if (t === "object" || t === "array" || t === "function") {
        return v.toString();
      } else {
        return "" + v;
      }
    }
    function floatReadValueFromPointer(name, shift) {
      switch (shift) {
        case 2:
          return function(pointer) {
            return this["fromWireType"](HEAPF32[pointer >> 2]);
          };
        case 3:
          return function(pointer) {
            return this["fromWireType"](HEAPF64[pointer >> 3]);
          };
        default:
          throw new TypeError("Unknown float type: " + name);
      }
    }
    function __embind_register_float(rawType, name, size) {
      var shift = getShiftFromSize(size);
      name = readLatin1String(name);
      registerType(rawType, {
        name: name,
        fromWireType: function(value) {
          return value;
        },
        toWireType: function(destructors, value) {
          if (typeof value !== "number" && typeof value !== "boolean") {
            throw new TypeError(
              'Cannot convert "' + _embind_repr(value) + '" to ' + this.name
            );
          }
          return value;
        },
        argPackAdvance: 8,
        readValueFromPointer: floatReadValueFromPointer(name, shift),
        destructorFunction: null
      });
    }
    function new_(constructor, argumentList) {
      if (!(constructor instanceof Function)) {
        throw new TypeError(
          "new_ called with constructor type " +
            typeof constructor +
            " which is not a function"
        );
      }
      var dummy = createNamedFunction(
        constructor.name || "unknownFunctionName",
        function() {}
      );
      dummy.prototype = constructor.prototype;
      var obj = new dummy();
      var r = constructor.apply(obj, argumentList);
      return r instanceof Object ? r : obj;
    }
    function runDestructors(destructors) {
      while (destructors.length) {
        var ptr = destructors.pop();
        var del = destructors.pop();
        del(ptr);
      }
    }
    function craftInvokerFunction(
      humanName,
      argTypes,
      classType,
      cppInvokerFunc,
      cppTargetFunc
    ) {
      var argCount = argTypes.length;
      if (argCount < 2) {
        throwBindingError(
          "argTypes array size mismatch! Must at least get return value and 'this' types!"
        );
      }
      var isClassMethodFunc = argTypes[1] !== null && classType !== null;
      var needsDestructorStack = false;
      for (var i = 1; i < argTypes.length; ++i) {
        if (
          argTypes[i] !== null &&
          argTypes[i].destructorFunction === undefined
        ) {
          needsDestructorStack = true;
          break;
        }
      }
      var returns = argTypes[0].name !== "void";
      var argsList = "";
      var argsListWired = "";
      for (var i = 0; i < argCount - 2; ++i) {
        argsList += (i !== 0 ? ", " : "") + "arg" + i;
        argsListWired += (i !== 0 ? ", " : "") + "arg" + i + "Wired";
      }
      var invokerFnBody =
        "return function " +
        makeLegalFunctionName(humanName) +
        "(" +
        argsList +
        ") {\n" +
        "if (arguments.length !== " +
        (argCount - 2) +
        ") {\n" +
        "throwBindingError('function " +
        humanName +
        " called with ' + arguments.length + ' arguments, expected " +
        (argCount - 2) +
        " args!');\n" +
        "}\n";
      if (needsDestructorStack) {
        invokerFnBody += "var destructors = [];\n";
      }
      var dtorStack = needsDestructorStack ? "destructors" : "null";
      var args1 = [
        "throwBindingError",
        "invoker",
        "fn",
        "runDestructors",
        "retType",
        "classParam"
      ];
      var args2 = [
        throwBindingError,
        cppInvokerFunc,
        cppTargetFunc,
        runDestructors,
        argTypes[0],
        argTypes[1]
      ];
      if (isClassMethodFunc) {
        invokerFnBody +=
          "var thisWired = classParam.toWireType(" + dtorStack + ", this);\n";
      }
      for (var i = 0; i < argCount - 2; ++i) {
        invokerFnBody +=
          "var arg" +
          i +
          "Wired = argType" +
          i +
          ".toWireType(" +
          dtorStack +
          ", arg" +
          i +
          "); // " +
          argTypes[i + 2].name +
          "\n";
        args1.push("argType" + i);
        args2.push(argTypes[i + 2]);
      }
      if (isClassMethodFunc) {
        argsListWired =
          "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired;
      }
      invokerFnBody +=
        (returns ? "var rv = " : "") +
        "invoker(fn" +
        (argsListWired.length > 0 ? ", " : "") +
        argsListWired +
        ");\n";
      if (needsDestructorStack) {
        invokerFnBody += "runDestructors(destructors);\n";
      } else {
        for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
          var paramName = i === 1 ? "thisWired" : "arg" + (i - 2) + "Wired";
          if (argTypes[i].destructorFunction !== null) {
            invokerFnBody +=
              paramName +
              "_dtor(" +
              paramName +
              "); // " +
              argTypes[i].name +
              "\n";
            args1.push(paramName + "_dtor");
            args2.push(argTypes[i].destructorFunction);
          }
        }
      }
      if (returns) {
        invokerFnBody +=
          "var ret = retType.fromWireType(rv);\n" + "return ret;\n";
      } else {
      }
      invokerFnBody += "}\n";
      args1.push(invokerFnBody);
      var invokerFunction = new_(Function, args1).apply(null, args2);
      return invokerFunction;
    }
    function ensureOverloadTable(proto, methodName, humanName) {
      if (undefined === proto[methodName].overloadTable) {
        var prevFunc = proto[methodName];
        proto[methodName] = function() {
          if (
            !proto[methodName].overloadTable.hasOwnProperty(arguments.length)
          ) {
            throwBindingError(
              "Function '" +
                humanName +
                "' called with an invalid number of arguments (" +
                arguments.length +
                ") - expects one of (" +
                proto[methodName].overloadTable +
                ")!"
            );
          }
          return proto[methodName].overloadTable[arguments.length].apply(
            this,
            arguments
          );
        };
        proto[methodName].overloadTable = [];
        proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
      }
    }
    function exposePublicSymbol(name, value, numArguments) {
      if (Module.hasOwnProperty(name)) {
        if (
          undefined === numArguments ||
          (undefined !== Module[name].overloadTable &&
            undefined !== Module[name].overloadTable[numArguments])
        ) {
          throwBindingError("Cannot register public name '" + name + "' twice");
        }
        ensureOverloadTable(Module, name, name);
        if (Module.hasOwnProperty(numArguments)) {
          throwBindingError(
            "Cannot register multiple overloads of a function with the same number of arguments (" +
              numArguments +
              ")!"
          );
        }
        Module[name].overloadTable[numArguments] = value;
      } else {
        Module[name] = value;
        if (undefined !== numArguments) {
          Module[name].numArguments = numArguments;
        }
      }
    }
    function heap32VectorToArray(count, firstElement) {
      var array = [];
      for (var i = 0; i < count; i++) {
        array.push(HEAP32[(firstElement >> 2) + i]);
      }
      return array;
    }
    function replacePublicSymbol(name, value, numArguments) {
      if (!Module.hasOwnProperty(name)) {
        throwInternalError("Replacing nonexistant public symbol");
      }
      if (
        undefined !== Module[name].overloadTable &&
        undefined !== numArguments
      ) {
        Module[name].overloadTable[numArguments] = value;
      } else {
        Module[name] = value;
        Module[name].argCount = numArguments;
      }
    }
    function embind__requireFunction(signature, rawFunction) {
      signature = readLatin1String(signature);
      function makeDynCaller(dynCall) {
        var args = [];
        for (var i = 1; i < signature.length; ++i) {
          args.push("a" + i);
        }
        var name = "dynCall_" + signature + "_" + rawFunction;
        var body = "return function " + name + "(" + args.join(", ") + ") {\n";
        body +=
          "    return dynCall(rawFunction" +
          (args.length ? ", " : "") +
          args.join(", ") +
          ");\n";
        body += "};\n";
        return new Function("dynCall", "rawFunction", body)(
          dynCall,
          rawFunction
        );
      }
      var fp;
      if (Module["FUNCTION_TABLE_" + signature] !== undefined) {
        fp = Module["FUNCTION_TABLE_" + signature][rawFunction];
      } else if (typeof FUNCTION_TABLE !== "undefined") {
        fp = FUNCTION_TABLE[rawFunction];
      } else {
        var dc = Module["asm"]["dynCall_" + signature];
        if (dc === undefined) {
          dc = Module["asm"]["dynCall_" + signature.replace(/f/g, "d")];
          if (dc === undefined) {
            throwBindingError("No dynCall invoker for signature: " + signature);
          }
        }
        fp = makeDynCaller(dc);
      }
      if (typeof fp !== "function") {
        throwBindingError(
          "unknown function pointer with signature " +
            signature +
            ": " +
            rawFunction
        );
      }
      return fp;
    }
    var UnboundTypeError = undefined;
    function getTypeName(type) {
      var ptr = ___getTypeName(type);
      var rv = readLatin1String(ptr);
      _free(ptr);
      return rv;
    }
    function throwUnboundTypeError(message, types) {
      var unboundTypes = [];
      var seen = {};
      function visit(type) {
        if (seen[type]) {
          return;
        }
        if (registeredTypes[type]) {
          return;
        }
        if (typeDependencies[type]) {
          typeDependencies[type].forEach(visit);
          return;
        }
        unboundTypes.push(type);
        seen[type] = true;
      }
      types.forEach(visit);
      throw new UnboundTypeError(
        message + ": " + unboundTypes.map(getTypeName).join([", "])
      );
    }
    function __embind_register_function(
      name,
      argCount,
      rawArgTypesAddr,
      signature,
      rawInvoker,
      fn
    ) {
      var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      name = readLatin1String(name);
      rawInvoker = embind__requireFunction(signature, rawInvoker);
      exposePublicSymbol(
        name,
        function() {
          throwUnboundTypeError(
            "Cannot call " + name + " due to unbound types",
            argTypes
          );
        },
        argCount - 1
      );
      whenDependentTypesAreResolved([], argTypes, function(argTypes) {
        var invokerArgsArray = [argTypes[0], null].concat(argTypes.slice(1));
        replacePublicSymbol(
          name,
          craftInvokerFunction(name, invokerArgsArray, null, rawInvoker, fn),
          argCount - 1
        );
        return [];
      });
    }
    function integerReadValueFromPointer(name, shift, signed) {
      switch (shift) {
        case 0:
          return signed
            ? function readS8FromPointer(pointer) {
                return HEAP8[pointer];
              }
            : function readU8FromPointer(pointer) {
                return HEAPU8[pointer];
              };
        case 1:
          return signed
            ? function readS16FromPointer(pointer) {
                return HEAP16[pointer >> 1];
              }
            : function readU16FromPointer(pointer) {
                return HEAPU16[pointer >> 1];
              };
        case 2:
          return signed
            ? function readS32FromPointer(pointer) {
                return HEAP32[pointer >> 2];
              }
            : function readU32FromPointer(pointer) {
                return HEAPU32[pointer >> 2];
              };
        default:
          throw new TypeError("Unknown integer type: " + name);
      }
    }
    function __embind_register_integer(
      primitiveType,
      name,
      size,
      minRange,
      maxRange
    ) {
      name = readLatin1String(name);
      if (maxRange === -1) {
        maxRange = 4294967295;
      }
      var shift = getShiftFromSize(size);
      var fromWireType = function(value) {
        return value;
      };
      if (minRange === 0) {
        var bitshift = 32 - 8 * size;
        fromWireType = function(value) {
          return (value << bitshift) >>> bitshift;
        };
      }
      var isUnsignedType = name.indexOf("unsigned") != -1;
      registerType(primitiveType, {
        name: name,
        fromWireType: fromWireType,
        toWireType: function(destructors, value) {
          if (typeof value !== "number" && typeof value !== "boolean") {
            throw new TypeError(
              'Cannot convert "' + _embind_repr(value) + '" to ' + this.name
            );
          }
          if (value < minRange || value > maxRange) {
            throw new TypeError(
              'Passing a number "' +
                _embind_repr(value) +
                '" from JS side to C/C++ side to an argument of type "' +
                name +
                '", which is outside the valid range [' +
                minRange +
                ", " +
                maxRange +
                "]!"
            );
          }
          return isUnsignedType ? value >>> 0 : value | 0;
        },
        argPackAdvance: 8,
        readValueFromPointer: integerReadValueFromPointer(
          name,
          shift,
          minRange !== 0
        ),
        destructorFunction: null
      });
    }
    function __embind_register_memory_view(rawType, dataTypeIndex, name) {
      var typeMapping = [
        Int8Array,
        Uint8Array,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array
      ];
      var TA = typeMapping[dataTypeIndex];
      function decodeMemoryView(handle) {
        handle = handle >> 2;
        var heap = HEAPU32;
        var size = heap[handle];
        var data = heap[handle + 1];
        return new TA(heap["buffer"], data, size);
      }
      name = readLatin1String(name);
      registerType(
        rawType,
        {
          name: name,
          fromWireType: decodeMemoryView,
          argPackAdvance: 8,
          readValueFromPointer: decodeMemoryView
        },
        { ignoreDuplicateRegistrations: true }
      );
    }
    function __embind_register_std_string(rawType, name) {
      name = readLatin1String(name);
      var stdStringIsUTF8 = name === "std::string";
      registerType(rawType, {
        name: name,
        fromWireType: function(value) {
          var length = HEAPU32[value >> 2];
          var str;
          if (stdStringIsUTF8) {
            var endChar = HEAPU8[value + 4 + length];
            var endCharSwap = 0;
            if (endChar != 0) {
              endCharSwap = endChar;
              HEAPU8[value + 4 + length] = 0;
            }
            var decodeStartPtr = value + 4;
            for (var i = 0; i <= length; ++i) {
              var currentBytePtr = value + 4 + i;
              if (HEAPU8[currentBytePtr] == 0) {
                var stringSegment = UTF8ToString(decodeStartPtr);
                if (str === undefined) str = stringSegment;
                else {
                  str += String.fromCharCode(0);
                  str += stringSegment;
                }
                decodeStartPtr = currentBytePtr + 1;
              }
            }
            if (endCharSwap != 0) HEAPU8[value + 4 + length] = endCharSwap;
          } else {
            var a = new Array(length);
            for (var i = 0; i < length; ++i) {
              a[i] = String.fromCharCode(HEAPU8[value + 4 + i]);
            }
            str = a.join("");
          }
          _free(value);
          return str;
        },
        toWireType: function(destructors, value) {
          if (value instanceof ArrayBuffer) {
            value = new Uint8Array(value);
          }
          var getLength;
          var valueIsOfTypeString = typeof value === "string";
          if (
            !(
              valueIsOfTypeString ||
              value instanceof Uint8Array ||
              value instanceof Uint8ClampedArray ||
              value instanceof Int8Array
            )
          ) {
            throwBindingError("Cannot pass non-string to std::string");
          }
          if (stdStringIsUTF8 && valueIsOfTypeString) {
            getLength = function() {
              return lengthBytesUTF8(value);
            };
          } else {
            getLength = function() {
              return value.length;
            };
          }
          var length = getLength();
          var ptr = _malloc(4 + length + 1);
          HEAPU32[ptr >> 2] = length;
          if (stdStringIsUTF8 && valueIsOfTypeString) {
            stringToUTF8(value, ptr + 4, length + 1);
          } else {
            if (valueIsOfTypeString) {
              for (var i = 0; i < length; ++i) {
                var charCode = value.charCodeAt(i);
                if (charCode > 255) {
                  _free(ptr);
                  throwBindingError(
                    "String has UTF-16 code units that do not fit in 8 bits"
                  );
                }
                HEAPU8[ptr + 4 + i] = charCode;
              }
            } else {
              for (var i = 0; i < length; ++i) {
                HEAPU8[ptr + 4 + i] = value[i];
              }
            }
          }
          if (destructors !== null) {
            destructors.push(_free, ptr);
          }
          return ptr;
        },
        argPackAdvance: 8,
        readValueFromPointer: simpleReadValueFromPointer,
        destructorFunction: function(ptr) {
          _free(ptr);
        }
      });
    }
    function __embind_register_std_wstring(rawType, charSize, name) {
      name = readLatin1String(name);
      var getHeap, shift;
      if (charSize === 2) {
        getHeap = function() {
          return HEAPU16;
        };
        shift = 1;
      } else if (charSize === 4) {
        getHeap = function() {
          return HEAPU32;
        };
        shift = 2;
      }
      registerType(rawType, {
        name: name,
        fromWireType: function(value) {
          var HEAP = getHeap();
          var length = HEAPU32[value >> 2];
          var a = new Array(length);
          var start = (value + 4) >> shift;
          for (var i = 0; i < length; ++i) {
            a[i] = String.fromCharCode(HEAP[start + i]);
          }
          _free(value);
          return a.join("");
        },
        toWireType: function(destructors, value) {
          var HEAP = getHeap();
          var length = value.length;
          var ptr = _malloc(4 + length * charSize);
          HEAPU32[ptr >> 2] = length;
          var start = (ptr + 4) >> shift;
          for (var i = 0; i < length; ++i) {
            HEAP[start + i] = value.charCodeAt(i);
          }
          if (destructors !== null) {
            destructors.push(_free, ptr);
          }
          return ptr;
        },
        argPackAdvance: 8,
        readValueFromPointer: simpleReadValueFromPointer,
        destructorFunction: function(ptr) {
          _free(ptr);
        }
      });
    }
    function __embind_register_void(rawType, name) {
      name = readLatin1String(name);
      registerType(rawType, {
        isVoid: true,
        name: name,
        argPackAdvance: 0,
        fromWireType: function() {
          return undefined;
        },
        toWireType: function(destructors, o) {
          return undefined;
        }
      });
    }
    function _abort() {
      Module["abort"]();
    }
    function _atexit(func, arg) {
      warnOnce(
        "atexit() called, but EXIT_RUNTIME is not set, so atexits() will not be called. set EXIT_RUNTIME to 1 (see the FAQ)"
      );
      __ATEXIT__.unshift({ func: func, arg: arg });
    }
    function _err() {
      err("missing function: err");
      abort(-1);
    }
    function _errx() {
      err("missing function: errx");
      abort(-1);
    }
    function _getenv(name) {
      if (name === 0) return 0;
      name = Pointer_stringify(name);
      if (!ENV.hasOwnProperty(name)) return 0;
      if (_getenv.ret) _free(_getenv.ret);
      _getenv.ret = allocateUTF8(ENV[name]);
      return _getenv.ret;
    }
    var ___tm_timezone = allocate(
      intArrayFromString("GMT"),
      "i8",
      ALLOC_STATIC
    );
    function _gmtime_r(time, tmPtr) {
      var date = new Date(HEAP32[time >> 2] * 1e3);
      HEAP32[tmPtr >> 2] = date.getUTCSeconds();
      HEAP32[(tmPtr + 4) >> 2] = date.getUTCMinutes();
      HEAP32[(tmPtr + 8) >> 2] = date.getUTCHours();
      HEAP32[(tmPtr + 12) >> 2] = date.getUTCDate();
      HEAP32[(tmPtr + 16) >> 2] = date.getUTCMonth();
      HEAP32[(tmPtr + 20) >> 2] = date.getUTCFullYear() - 1900;
      HEAP32[(tmPtr + 24) >> 2] = date.getUTCDay();
      HEAP32[(tmPtr + 36) >> 2] = 0;
      HEAP32[(tmPtr + 32) >> 2] = 0;
      var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
      var yday = ((date.getTime() - start) / (1e3 * 60 * 60 * 24)) | 0;
      HEAP32[(tmPtr + 28) >> 2] = yday;
      HEAP32[(tmPtr + 40) >> 2] = ___tm_timezone;
      return tmPtr;
    }
    function _llvm_bswap_i64(l, h) {
      var retl = _llvm_bswap_i32(h) >>> 0;
      var reth = _llvm_bswap_i32(l) >>> 0;
      return (setTempRet0(reth), retl) | 0;
    }
    function _llvm_eh_typeid_for(type) {
      return type;
    }
    function _llvm_stackrestore(p) {
      var self = _llvm_stacksave;
      var ret = self.LLVM_SAVEDSTACKS[p];
      self.LLVM_SAVEDSTACKS.splice(p, 1);
      stackRestore(ret);
    }
    function _llvm_stacksave() {
      var self = _llvm_stacksave;
      if (!self.LLVM_SAVEDSTACKS) {
        self.LLVM_SAVEDSTACKS = [];
      }
      self.LLVM_SAVEDSTACKS.push(stackSave());
      return self.LLVM_SAVEDSTACKS.length - 1;
    }
    function _llvm_trap() {
      abort("trap!");
    }
    function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src + num), dest);
      return dest;
    }
    function _tzset() {
      if (_tzset.called) return;
      _tzset.called = true;
      HEAP32[__get_timezone() >> 2] = new Date().getTimezoneOffset() * 60;
      var winter = new Date(2e3, 0, 1);
      var summer = new Date(2e3, 6, 1);
      HEAP32[__get_daylight() >> 2] = Number(
        winter.getTimezoneOffset() != summer.getTimezoneOffset()
      );
      function extractZone(date) {
        var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
        return match ? match[1] : "GMT";
      }
      var winterName = extractZone(winter);
      var summerName = extractZone(summer);
      var winterNamePtr = allocate(
        intArrayFromString(winterName),
        "i8",
        ALLOC_NORMAL
      );
      var summerNamePtr = allocate(
        intArrayFromString(summerName),
        "i8",
        ALLOC_NORMAL
      );
      if (summer.getTimezoneOffset() < winter.getTimezoneOffset()) {
        HEAP32[__get_tzname() >> 2] = winterNamePtr;
        HEAP32[(__get_tzname() + 4) >> 2] = summerNamePtr;
      } else {
        HEAP32[__get_tzname() >> 2] = summerNamePtr;
        HEAP32[(__get_tzname() + 4) >> 2] = winterNamePtr;
      }
    }
    function _mktime(tmPtr) {
      _tzset();
      var date = new Date(
        HEAP32[(tmPtr + 20) >> 2] + 1900,
        HEAP32[(tmPtr + 16) >> 2],
        HEAP32[(tmPtr + 12) >> 2],
        HEAP32[(tmPtr + 8) >> 2],
        HEAP32[(tmPtr + 4) >> 2],
        HEAP32[tmPtr >> 2],
        0
      );
      var dst = HEAP32[(tmPtr + 32) >> 2];
      var guessedOffset = date.getTimezoneOffset();
      var start = new Date(date.getFullYear(), 0, 1);
      var summerOffset = new Date(2e3, 6, 1).getTimezoneOffset();
      var winterOffset = start.getTimezoneOffset();
      var dstOffset = Math.min(winterOffset, summerOffset);
      if (dst < 0) {
        HEAP32[(tmPtr + 32) >> 2] = Number(
          summerOffset != winterOffset && dstOffset == guessedOffset
        );
      } else if (dst > 0 != (dstOffset == guessedOffset)) {
        var nonDstOffset = Math.max(winterOffset, summerOffset);
        var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
        date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4);
      }
      HEAP32[(tmPtr + 24) >> 2] = date.getDay();
      var yday =
        ((date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24)) | 0;
      HEAP32[(tmPtr + 28) >> 2] = yday;
      return (date.getTime() / 1e3) | 0;
    }
    function _pthread_cond_wait() {
      return 0;
    }
    var PTHREAD_SPECIFIC = {};
    function _pthread_getspecific(key) {
      return PTHREAD_SPECIFIC[key] || 0;
    }
    var PTHREAD_SPECIFIC_NEXT_KEY = 1;
    function _pthread_key_create(key, destructor) {
      if (key == 0) {
        return ERRNO_CODES.EINVAL;
      }
      HEAP32[key >> 2] = PTHREAD_SPECIFIC_NEXT_KEY;
      PTHREAD_SPECIFIC[PTHREAD_SPECIFIC_NEXT_KEY] = 0;
      PTHREAD_SPECIFIC_NEXT_KEY++;
      return 0;
    }
    function _pthread_mutex_init() {}
    function _pthread_once(ptr, func) {
      if (!_pthread_once.seen) _pthread_once.seen = {};
      if (ptr in _pthread_once.seen) return;
      Module["dynCall_v"](func);
      _pthread_once.seen[ptr] = 1;
    }
    function _pthread_setspecific(key, value) {
      if (!(key in PTHREAD_SPECIFIC)) {
        return ERRNO_CODES.EINVAL;
      }
      PTHREAD_SPECIFIC[key] = value;
      return 0;
    }
    var __sigalrm_handler = 0;
    function _signal(sig, func) {
      if (sig == 14) {
        __sigalrm_handler = func;
      } else {
        err("Calling stub instead of signal()");
      }
      return 0;
    }
    function __isLeapYear(year) {
      return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    }
    function __arraySum(array, index) {
      var sum = 0;
      for (var i = 0; i <= index; sum += array[i++]);
      return sum;
    }
    var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function __addDays(date, days) {
      var newDate = new Date(date.getTime());
      while (days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap
          ? __MONTH_DAYS_LEAP
          : __MONTH_DAYS_REGULAR)[currentMonth];
        if (days > daysInCurrentMonth - newDate.getDate()) {
          days -= daysInCurrentMonth - newDate.getDate() + 1;
          newDate.setDate(1);
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth + 1);
          } else {
            newDate.setMonth(0);
            newDate.setFullYear(newDate.getFullYear() + 1);
          }
        } else {
          newDate.setDate(newDate.getDate() + days);
          return newDate;
        }
      }
      return newDate;
    }
    function _strftime(s, maxsize, format, tm) {
      var tm_zone = HEAP32[(tm + 40) >> 2];
      var date = {
        tm_sec: HEAP32[tm >> 2],
        tm_min: HEAP32[(tm + 4) >> 2],
        tm_hour: HEAP32[(tm + 8) >> 2],
        tm_mday: HEAP32[(tm + 12) >> 2],
        tm_mon: HEAP32[(tm + 16) >> 2],
        tm_year: HEAP32[(tm + 20) >> 2],
        tm_wday: HEAP32[(tm + 24) >> 2],
        tm_yday: HEAP32[(tm + 28) >> 2],
        tm_isdst: HEAP32[(tm + 32) >> 2],
        tm_gmtoff: HEAP32[(tm + 36) >> 2],
        tm_zone: tm_zone ? Pointer_stringify(tm_zone) : ""
      };
      var pattern = Pointer_stringify(format);
      var EXPANSION_RULES_1 = {
        "%c": "%a %b %d %H:%M:%S %Y",
        "%D": "%m/%d/%y",
        "%F": "%Y-%m-%d",
        "%h": "%b",
        "%r": "%I:%M:%S %p",
        "%R": "%H:%M",
        "%T": "%H:%M:%S",
        "%x": "%m/%d/%y",
        "%X": "%H:%M:%S"
      };
      for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(
          new RegExp(rule, "g"),
          EXPANSION_RULES_1[rule]
        );
      }
      var WEEKDAYS = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ];
      var MONTHS = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      function leadingSomething(value, digits, character) {
        var str = typeof value === "number" ? value.toString() : value || "";
        while (str.length < digits) {
          str = character[0] + str;
        }
        return str;
      }
      function leadingNulls(value, digits) {
        return leadingSomething(value, digits, "0");
      }
      function compareByDay(date1, date2) {
        function sgn(value) {
          return value < 0 ? -1 : value > 0 ? 1 : 0;
        }
        var compare;
        if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
          if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
            compare = sgn(date1.getDate() - date2.getDate());
          }
        }
        return compare;
      }
      function getFirstWeekStartDate(janFourth) {
        switch (janFourth.getDay()) {
          case 0:
            return new Date(janFourth.getFullYear() - 1, 11, 29);
          case 1:
            return janFourth;
          case 2:
            return new Date(janFourth.getFullYear(), 0, 3);
          case 3:
            return new Date(janFourth.getFullYear(), 0, 2);
          case 4:
            return new Date(janFourth.getFullYear(), 0, 1);
          case 5:
            return new Date(janFourth.getFullYear() - 1, 11, 31);
          case 6:
            return new Date(janFourth.getFullYear() - 1, 11, 30);
        }
      }
      function getWeekBasedYear(date) {
        var thisDate = __addDays(
          new Date(date.tm_year + 1900, 0, 1),
          date.tm_yday
        );
        var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
        var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
        var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
        var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
        if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
          if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
            return thisDate.getFullYear() + 1;
          } else {
            return thisDate.getFullYear();
          }
        } else {
          return thisDate.getFullYear() - 1;
        }
      }
      var EXPANSION_RULES_2 = {
        "%a": function(date) {
          return WEEKDAYS[date.tm_wday].substring(0, 3);
        },
        "%A": function(date) {
          return WEEKDAYS[date.tm_wday];
        },
        "%b": function(date) {
          return MONTHS[date.tm_mon].substring(0, 3);
        },
        "%B": function(date) {
          return MONTHS[date.tm_mon];
        },
        "%C": function(date) {
          var year = date.tm_year + 1900;
          return leadingNulls((year / 100) | 0, 2);
        },
        "%d": function(date) {
          return leadingNulls(date.tm_mday, 2);
        },
        "%e": function(date) {
          return leadingSomething(date.tm_mday, 2, " ");
        },
        "%g": function(date) {
          return getWeekBasedYear(date)
            .toString()
            .substring(2);
        },
        "%G": function(date) {
          return getWeekBasedYear(date);
        },
        "%H": function(date) {
          return leadingNulls(date.tm_hour, 2);
        },
        "%I": function(date) {
          var twelveHour = date.tm_hour;
          if (twelveHour == 0) twelveHour = 12;
          else if (twelveHour > 12) twelveHour -= 12;
          return leadingNulls(twelveHour, 2);
        },
        "%j": function(date) {
          return leadingNulls(
            date.tm_mday +
              __arraySum(
                __isLeapYear(date.tm_year + 1900)
                  ? __MONTH_DAYS_LEAP
                  : __MONTH_DAYS_REGULAR,
                date.tm_mon - 1
              ),
            3
          );
        },
        "%m": function(date) {
          return leadingNulls(date.tm_mon + 1, 2);
        },
        "%M": function(date) {
          return leadingNulls(date.tm_min, 2);
        },
        "%n": function() {
          return "\n";
        },
        "%p": function(date) {
          if (date.tm_hour >= 0 && date.tm_hour < 12) {
            return "AM";
          } else {
            return "PM";
          }
        },
        "%S": function(date) {
          return leadingNulls(date.tm_sec, 2);
        },
        "%t": function() {
          return "\t";
        },
        "%u": function(date) {
          var day = new Date(
            date.tm_year + 1900,
            date.tm_mon + 1,
            date.tm_mday,
            0,
            0,
            0,
            0
          );
          return day.getDay() || 7;
        },
        "%U": function(date) {
          var janFirst = new Date(date.tm_year + 1900, 0, 1);
          var firstSunday =
            janFirst.getDay() === 0
              ? janFirst
              : __addDays(janFirst, 7 - janFirst.getDay());
          var endDate = new Date(
            date.tm_year + 1900,
            date.tm_mon,
            date.tm_mday
          );
          if (compareByDay(firstSunday, endDate) < 0) {
            var februaryFirstUntilEndMonth =
              __arraySum(
                __isLeapYear(endDate.getFullYear())
                  ? __MONTH_DAYS_LEAP
                  : __MONTH_DAYS_REGULAR,
                endDate.getMonth() - 1
              ) - 31;
            var firstSundayUntilEndJanuary = 31 - firstSunday.getDate();
            var days =
              firstSundayUntilEndJanuary +
              februaryFirstUntilEndMonth +
              endDate.getDate();
            return leadingNulls(Math.ceil(days / 7), 2);
          }
          return compareByDay(firstSunday, janFirst) === 0 ? "01" : "00";
        },
        "%V": function(date) {
          var janFourthThisYear = new Date(date.tm_year + 1900, 0, 4);
          var janFourthNextYear = new Date(date.tm_year + 1901, 0, 4);
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
          var endDate = __addDays(
            new Date(date.tm_year + 1900, 0, 1),
            date.tm_yday
          );
          if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
            return "53";
          }
          if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
            return "01";
          }
          var daysDifference;
          if (firstWeekStartThisYear.getFullYear() < date.tm_year + 1900) {
            daysDifference =
              date.tm_yday + 32 - firstWeekStartThisYear.getDate();
          } else {
            daysDifference =
              date.tm_yday + 1 - firstWeekStartThisYear.getDate();
          }
          return leadingNulls(Math.ceil(daysDifference / 7), 2);
        },
        "%w": function(date) {
          var day = new Date(
            date.tm_year + 1900,
            date.tm_mon + 1,
            date.tm_mday,
            0,
            0,
            0,
            0
          );
          return day.getDay();
        },
        "%W": function(date) {
          var janFirst = new Date(date.tm_year, 0, 1);
          var firstMonday =
            janFirst.getDay() === 1
              ? janFirst
              : __addDays(
                  janFirst,
                  janFirst.getDay() === 0 ? 1 : 7 - janFirst.getDay() + 1
                );
          var endDate = new Date(
            date.tm_year + 1900,
            date.tm_mon,
            date.tm_mday
          );
          if (compareByDay(firstMonday, endDate) < 0) {
            var februaryFirstUntilEndMonth =
              __arraySum(
                __isLeapYear(endDate.getFullYear())
                  ? __MONTH_DAYS_LEAP
                  : __MONTH_DAYS_REGULAR,
                endDate.getMonth() - 1
              ) - 31;
            var firstMondayUntilEndJanuary = 31 - firstMonday.getDate();
            var days =
              firstMondayUntilEndJanuary +
              februaryFirstUntilEndMonth +
              endDate.getDate();
            return leadingNulls(Math.ceil(days / 7), 2);
          }
          return compareByDay(firstMonday, janFirst) === 0 ? "01" : "00";
        },
        "%y": function(date) {
          return (date.tm_year + 1900).toString().substring(2);
        },
        "%Y": function(date) {
          return date.tm_year + 1900;
        },
        "%z": function(date) {
          var off = date.tm_gmtoff;
          var ahead = off >= 0;
          off = Math.abs(off) / 60;
          off = (off / 60) * 100 + (off % 60);
          return (ahead ? "+" : "-") + String("0000" + off).slice(-4);
        },
        "%Z": function(date) {
          return date.tm_zone;
        },
        "%%": function() {
          return "%";
        }
      };
      for (var rule in EXPANSION_RULES_2) {
        if (pattern.indexOf(rule) >= 0) {
          pattern = pattern.replace(
            new RegExp(rule, "g"),
            EXPANSION_RULES_2[rule](date)
          );
        }
      }
      var bytes = intArrayFromString(pattern, false);
      if (bytes.length > maxsize) {
        return 0;
      }
      writeArrayToMemory(bytes, s);
      return bytes.length - 1;
    }
    function _strftime_l(s, maxsize, format, tm) {
      return _strftime(s, maxsize, format, tm);
    }
    function _sysconf(name) {
      switch (name) {
        case 30:
          return PAGE_SIZE;
        case 85:
          var maxHeapSize = 2 * 1024 * 1024 * 1024 - 65536;
          return maxHeapSize / PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 79:
          return 0;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0:
          return 2097152;
        case 3:
          return 65536;
        case 28:
          return 32768;
        case 44:
          return 32767;
        case 75:
          return 16384;
        case 39:
          return 1e3;
        case 89:
          return 700;
        case 71:
          return 256;
        case 40:
          return 255;
        case 2:
          return 100;
        case 180:
          return 64;
        case 25:
          return 20;
        case 5:
          return 16;
        case 6:
          return 6;
        case 73:
          return 4;
        case 84: {
          if (typeof navigator === "object")
            return navigator["hardwareConcurrency"] || 1;
          return 1;
        }
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
    function _time(ptr) {
      var ret = (Date.now() / 1e3) | 0;
      if (ptr) {
        HEAP32[ptr >> 2] = ret;
      }
      return ret;
    }
    FS.staticInit();
    __ATINIT__.unshift(function() {
      if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
    });
    __ATMAIN__.push(function() {
      FS.ignorePermissions = false;
    });
    __ATEXIT__.push(function() {
      FS.quit();
    });
    __ATINIT__.unshift(function() {
      TTY.init();
    });
    __ATEXIT__.push(function() {
      TTY.shutdown();
    });
    if (ENVIRONMENT_IS_NODE) {
      var fs = require("fs");
      var NODEJS_PATH = require("path");
      NODEFS.staticInit();
    }
    embind_init_charCodes();
    BindingError = Module["BindingError"] = extendError(Error, "BindingError");
    InternalError = Module["InternalError"] = extendError(
      Error,
      "InternalError"
    );
    init_emval();
    UnboundTypeError = Module["UnboundTypeError"] = extendError(
      Error,
      "UnboundTypeError"
    );
    DYNAMICTOP_PTR = staticAlloc(4);
    STACK_BASE = STACKTOP = alignMemory(STATICTOP);
    STACK_MAX = STACK_BASE + TOTAL_STACK;
    DYNAMIC_BASE = alignMemory(STACK_MAX);
    HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
    staticSealed = true;
    assert(
      DYNAMIC_BASE < TOTAL_MEMORY,
      "TOTAL_MEMORY not big enough for stack"
    );
    function intArrayFromString(stringy, dontAddNull, length) {
      var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
      var u8array = new Array(len);
      var numBytesWritten = stringToUTF8Array(
        stringy,
        u8array,
        0,
        u8array.length
      );
      if (dontAddNull) u8array.length = numBytesWritten;
      return u8array;
    }
    var debug_table_i = [
      "0",
      "__ZNSt3__26locale7classicEv",
      "__ZN6crypto4randIjEENSt3__29enable_ifIXsr3std6is_podIT_EE5valueES3_E4typeEv",
      "__ZNSt3__26locale8__globalEv",
      "___cxa_get_globals_fast",
      "0",
      "0",
      "0"
    ];
    var debug_table_ii = [
      "0",
      "__ZNKSt9bad_alloc4whatEv",
      "__ZNK5boost16exception_detail10clone_implINS0_10bad_alloc_EE5cloneEv",
      "__ZTv0_n12_NK5boost16exception_detail10clone_implINS0_10bad_alloc_EE5cloneEv",
      "__ZN5boost6detail17sp_counted_impl_pINS_16exception_detail10clone_implINS2_10bad_alloc_EEEE19get_untyped_deleterEv",
      "__ZNKSt13bad_exception4whatEv",
      "__ZNK5boost16exception_detail10clone_implINS0_14bad_exception_EE5cloneEv",
      "__ZTv0_n12_NK5boost16exception_detail10clone_implINS0_14bad_exception_EE5cloneEv",
      "__ZN5boost6detail17sp_counted_impl_pINS_16exception_detail10clone_implINS2_14bad_exception_EEEE19get_untyped_deleterEv",
      "__ZNSt3__215basic_streambufIcNS_11char_traitsIcEEE4syncEv",
      "__ZNSt3__215basic_streambufIcNS_11char_traitsIcEEE9showmanycEv",
      "__ZNSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEE9underflowEv",
      "__ZNSt3__215basic_streambufIcNS_11char_traitsIcEEE5uflowEv",
      "__ZNKSt13runtime_error4whatEv",
      "__ZNK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_pathEEEE5cloneEv",
      "__ZTv0_n12_NK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_pathEEEE5cloneEv",
      "__ZNK5boost3any6holderINS_13property_tree11string_pathINSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEENS2_13id_translatorISA_EEEEE4typeEv",
      "__ZNK5boost3any6holderINS_13property_tree11string_pathINSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEENS2_13id_translatorISA_EEEEE5cloneEv",
      "__ZNK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_dataEEEE5cloneEv",
      "__ZTv0_n12_NK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_dataEEEE5cloneEv",
      "__ZNK5boost3any6holderINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEE4typeEv",
      "__ZNK5boost3any6holderINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEE5cloneEv",
      "__ZNK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree11json_parser17json_parser_errorEEEE5cloneEv",
      "__ZTv0_n12_NK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree11json_parser17json_parser_errorEEEE5cloneEv",
      "__ZNKSt3__210__function6__funcIPFbhxENS_9allocatorIS3_EES2_E7__cloneEv",
      "__ZNKSt3__210__function6__funcIPFbhxENS_9allocatorIS3_EES2_E11target_typeEv",
      "__ZNKSt3__210__function6__funcIZN17monero_fork_rules22make_use_fork_rules_fnEhEUlhxE_NS_9allocatorIS3_EEFbhxEE7__cloneEv",
      "__ZNKSt3__210__function6__funcIZN17monero_fork_rules22make_use_fork_rules_fnEhEUlhxE_NS_9allocatorIS3_EEFbhxEE11target_typeEv",
      "__ZNKSt11logic_error4whatEv",
      "__ZNK5boost7bad_get4whatEv",
      "__ZNK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_7bad_getEEEE5cloneEv",
      "__ZTv0_n12_NK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_7bad_getEEEE5cloneEv",
      "__ZNK5boost16bad_lexical_cast4whatEv",
      "__ZNK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_16bad_lexical_castEEEE5cloneEv",
      "__ZTv0_n12_NK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_16bad_lexical_castEEEE5cloneEv",
      "__ZNK5boost6system12system_error4whatEv",
      "__ZNK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_10lock_errorEEEE5cloneEv",
      "__ZTv0_n12_NK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_10lock_errorEEEE5cloneEv",
      "__ZNK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_21thread_resource_errorEEEE5cloneEv",
      "__ZTv0_n12_NK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_21thread_resource_errorEEEE5cloneEv",
      "__ZN5boost6detail18sp_counted_impl_pdIPN6crypto7rs_commEPFvPvEE19get_untyped_deleterEv",
      "__ZNK2hw4core14device_defaultcvbEv",
      "__ZN2hw4core14device_default4initEv",
      "__ZN2hw4core14device_default7releaseEv",
      "__ZN2hw4core14device_default7connectEv",
      "__ZN2hw4core14device_default10disconnectEv",
      "__ZNK2hw4core14device_default8get_typeEv",
      "__ZN2hw4core14device_default8try_lockEv",
      "__ZN2hw4core14device_default8close_txEv",
      "__ZN5boost6detail17sp_counted_impl_pIN4epee10misc_utils14call_befor_dieIZN6crypto13ElectrumWords14words_to_bytesERKNS2_15wipeable_stringERS7_mbRNSt3__212basic_stringIcNSB_11char_traitsIcEENSB_9allocatorIcEEEEE3__0EEE19get_untyped_deleterEv",
      "__ZNK5boost6system6detail22generic_error_category4nameEv",
      "__ZNK5boost6system14error_category12std_category4nameEv",
      "___stdio_close",
      "__ZNKSt3__217bad_function_call4whatEv",
      "__ZNSt3__215basic_streambufIcNS_11char_traitsIcEEE9underflowEv",
      "__ZNSt3__215basic_streambufIwNS_11char_traitsIwEEE4syncEv",
      "__ZNSt3__215basic_streambufIwNS_11char_traitsIwEEE9showmanycEv",
      "__ZNSt3__215basic_streambufIwNS_11char_traitsIwEEE9underflowEv",
      "__ZNSt3__215basic_streambufIwNS_11char_traitsIwEEE5uflowEv",
      "__ZNKSt3__219__iostream_category4nameEv",
      "__ZNSt3__211__stdoutbufIwE4syncEv",
      "__ZNSt3__211__stdoutbufIcE4syncEv",
      "__ZNSt3__210__stdinbufIwE9underflowEv",
      "__ZNSt3__210__stdinbufIwE5uflowEv",
      "__ZNSt3__210__stdinbufIcE9underflowEv",
      "__ZNSt3__210__stdinbufIcE5uflowEv",
      "__ZNKSt3__28time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE13do_date_orderEv",
      "__ZNKSt3__220__time_get_c_storageIcE7__weeksEv",
      "__ZNKSt3__220__time_get_c_storageIcE8__monthsEv",
      "__ZNKSt3__220__time_get_c_storageIcE7__am_pmEv",
      "__ZNKSt3__220__time_get_c_storageIcE3__cEv",
      "__ZNKSt3__220__time_get_c_storageIcE3__rEv",
      "__ZNKSt3__220__time_get_c_storageIcE3__xEv",
      "__ZNKSt3__220__time_get_c_storageIcE3__XEv",
      "__ZNKSt3__28time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE13do_date_orderEv",
      "__ZNKSt3__220__time_get_c_storageIwE7__weeksEv",
      "__ZNKSt3__220__time_get_c_storageIwE8__monthsEv",
      "__ZNKSt3__220__time_get_c_storageIwE7__am_pmEv",
      "__ZNKSt3__220__time_get_c_storageIwE3__cEv",
      "__ZNKSt3__220__time_get_c_storageIwE3__rEv",
      "__ZNKSt3__220__time_get_c_storageIwE3__xEv",
      "__ZNKSt3__220__time_get_c_storageIwE3__XEv",
      "__ZNKSt3__210moneypunctIcLb0EE16do_decimal_pointEv",
      "__ZNKSt3__210moneypunctIcLb0EE16do_thousands_sepEv",
      "__ZNKSt3__210moneypunctIcLb0EE14do_frac_digitsEv",
      "__ZNKSt3__210moneypunctIcLb1EE16do_decimal_pointEv",
      "__ZNKSt3__210moneypunctIcLb1EE16do_thousands_sepEv",
      "__ZNKSt3__210moneypunctIcLb1EE14do_frac_digitsEv",
      "__ZNKSt3__210moneypunctIwLb0EE16do_decimal_pointEv",
      "__ZNKSt3__210moneypunctIwLb0EE16do_thousands_sepEv",
      "__ZNKSt3__210moneypunctIwLb0EE14do_frac_digitsEv",
      "__ZNKSt3__210moneypunctIwLb1EE16do_decimal_pointEv",
      "__ZNKSt3__210moneypunctIwLb1EE16do_thousands_sepEv",
      "__ZNKSt3__210moneypunctIwLb1EE14do_frac_digitsEv",
      "__ZNKSt3__27codecvtIDic11__mbstate_tE11do_encodingEv",
      "__ZNKSt3__27codecvtIDic11__mbstate_tE16do_always_noconvEv",
      "__ZNKSt3__27codecvtIDic11__mbstate_tE13do_max_lengthEv",
      "__ZNKSt3__27codecvtIwc11__mbstate_tE11do_encodingEv",
      "__ZNKSt3__27codecvtIwc11__mbstate_tE16do_always_noconvEv",
      "__ZNKSt3__27codecvtIwc11__mbstate_tE13do_max_lengthEv",
      "__ZNKSt3__28numpunctIcE16do_decimal_pointEv",
      "__ZNKSt3__28numpunctIcE16do_thousands_sepEv",
      "__ZNKSt3__28numpunctIwE16do_decimal_pointEv",
      "__ZNKSt3__28numpunctIwE16do_thousands_sepEv",
      "__ZNKSt3__27codecvtIcc11__mbstate_tE11do_encodingEv",
      "__ZNKSt3__27codecvtIcc11__mbstate_tE16do_always_noconvEv",
      "__ZNKSt3__27codecvtIcc11__mbstate_tE13do_max_lengthEv",
      "__ZNKSt3__27codecvtIDsc11__mbstate_tE11do_encodingEv",
      "__ZNKSt3__27codecvtIDsc11__mbstate_tE16do_always_noconvEv",
      "__ZNKSt3__27codecvtIDsc11__mbstate_tE13do_max_lengthEv",
      "__ZNKSt3__224__generic_error_category4nameEv",
      "__ZNKSt3__223__system_error_category4nameEv",
      "__ZNKSt9exception4whatEv",
      "__ZNKSt8bad_cast4whatEv",
      "__ZNKSt10bad_typeid4whatEv",
      "__Znwm",
      "__ZNR5boost8optionalINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEdeEv",
      "__ZNKR5boost8optionalINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEdeEv",
      "__ZNSt3__25stoulERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPmi",
      "__ZNSt3__213unordered_mapINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEP22Send_Task_AsyncContextNS_4hashIS6_EENS_8equal_toIS6_EENS4_INS_4pairIKS6_S8_EEEEEixERSE_",
      "__ZNSt3__213basic_istreamIcNS_11char_traitsIcEEE3getEv",
      "__ZL18_heap_vals_ptr_forRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__ZNR5boost8optionalINSt3__26vectorIN21monero_transfer_utils15SpendableOutputENS1_9allocatorIS4_EEEEEdeEv",
      "__ZNR5boost8optionalIyEdeEv",
      "__ZNR5boost8optionalINSt3__26vectorIN21monero_transfer_utils19RandomAmountOutputsENS1_9allocatorIS4_EEEEEdeEv",
      "__ZNR5boost8optionalIjEdeEv",
      "__ZN16monero_fee_utils17get_fee_algorithmENSt3__28functionIFbhxEEE",
      "__ZNR5boost8optionalImEdeEv",
      "__ZNR5boost8optionalIN10cryptonote11transactionEEdeEv",
      "__ZNR5boost8optionalIN4epee7mlockedIN5tools8scrubbedIN6crypto9ec_scalarEEEEEEdeEv",
      "__ZNR5boost8optionalINSt3__26vectorIN4epee7mlockedIN5tools8scrubbedIN6crypto9ec_scalarEEEEENS1_9allocatorISA_EEEEEdeEv",
      "__ZN2hw10get_deviceERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZNK5boost8optionalINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEptEv",
      "__ZNR5boost8optionalIN19monero_wallet_utils17WalletDescriptionEEdeEv",
      "__ZNR5boost8optionalIN19monero_wallet_utils18ComponentsFromSeedEEdeEv",
      "__ZNR5boost8optionalIN4epee15wipeable_stringEEdeEv",
      "__ZNSt3__24endlIcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_",
      "__ZNR5boost8optionalIhEdeEv",
      "_time",
      "__ZNK5boost7variantIN10cryptonote8txin_genEJNS1_14txin_to_scriptENS1_18txin_to_scripthashENS1_11txin_to_keyEEE4typeEv",
      "__ZN5boost3getIN10cryptonote11txin_to_keyENS1_8txin_genEJNS1_14txin_to_scriptENS1_18txin_to_scripthashES2_EEENS_13add_referenceIKT_E4typeERKNS_7variantIT0_JDpT1_EEE",
      "__ZN5boost8optionalIN10cryptonote23subaddress_receive_infoEEptEv",
      "__ZNSt3__213basic_istreamIcNS_11char_traitsIcEEE4peekEv",
      "__ZN13serialization18check_stream_stateI14binary_archiveILb0EEEEbRT_b",
      "__ZNK5boost7variantIN10cryptonote16tx_extra_paddingEJNS1_16tx_extra_pub_keyENS1_14tx_extra_nonceENS1_25tx_extra_merge_mining_tagENS1_28tx_extra_additional_pub_keysENS1_29tx_extra_mysterious_minergateEEE4typeEv",
      "__ZN5boost3getIN10cryptonote11txin_to_keyENS1_8txin_genEJNS1_14txin_to_scriptENS1_18txin_to_scripthashES2_EEENS_13add_referenceIT_E4typeERNS_7variantIT0_JDpT1_EEE",
      "__ZN5boost3getIN10cryptonote12txout_to_keyENS1_15txout_to_scriptEJNS1_19txout_to_scripthashES2_EEENS_13add_referenceIT_E4typeERNS_7variantIT0_JDpT1_EEE",
      "_atexit",
      "__ZNKR5boost8optionalIN10cryptonote22account_public_addressEEdeEv",
      "__Znam",
      "_sysconf",
      "_pthread_mutex_unlock",
      "_pthread_mutex_lock",
      "_pthread_cond_broadcast",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0"
    ];
    var debug_table_iii = [
      "0",
      "__ZN5boost6detail17sp_counted_impl_pINS_16exception_detail10clone_implINS2_10bad_alloc_EEEE11get_deleterERKSt9type_info",
      "__ZN5boost6detail17sp_counted_impl_pINS_16exception_detail10clone_implINS2_10bad_alloc_EEEE17get_local_deleterERKSt9type_info",
      "__ZN5boost6detail17sp_counted_impl_pINS_16exception_detail10clone_implINS2_14bad_exception_EEEE11get_deleterERKSt9type_info",
      "__ZN5boost6detail17sp_counted_impl_pINS_16exception_detail10clone_implINS2_14bad_exception_EEEE17get_local_deleterERKSt9type_info",
      "__ZNSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEE9pbackfailEi",
      "__ZNSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEE8overflowEi",
      "__ZNKSt3__210__function6__funcIPFbhxENS_9allocatorIS3_EES2_E6targetERKSt9type_info",
      "__ZNKSt3__210__function6__funcIZN17monero_fork_rules22make_use_fork_rules_fnEhEUlhxE_NS_9allocatorIS3_EEFbhxEE6targetERKSt9type_info",
      "__ZN5boost6detail18sp_counted_impl_pdIPN6crypto7rs_commEPFvPvEE11get_deleterERKSt9type_info",
      "__ZN5boost6detail18sp_counted_impl_pdIPN6crypto7rs_commEPFvPvEE17get_local_deleterERKSt9type_info",
      "__ZN2hw4core14device_default8set_nameERKNSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEE",
      "__ZN2hw4core14device_default8set_modeENS_6device11device_modeE",
      "__ZN2hw4core14device_default18get_public_addressERN10cryptonote22account_public_addressE",
      "__ZN2hw4core14device_default7open_txERN4epee7mlockedIN5tools8scrubbedIN6crypto9ec_scalarEEEEE",
      "__ZNKSt3__220__shared_ptr_pointerIPN3rct18straus_cached_dataENS_14default_deleteIS2_EENS_9allocatorIS2_EEE13__get_deleterERKSt9type_info",
      "__ZNKSt3__220__shared_ptr_pointerIPN3rct21pippenger_cached_dataENS_14default_deleteIS2_EENS_9allocatorIS2_EEE13__get_deleterERKSt9type_info",
      "__ZN5boost6detail17sp_counted_impl_pIN4epee10misc_utils14call_befor_dieIZN6crypto13ElectrumWords14words_to_bytesERKNS2_15wipeable_stringERS7_mbRNSt3__212basic_stringIcNSB_11char_traitsIcEENSB_9allocatorIcEEEEE3__0EEE11get_deleterERKSt9type_info",
      "__ZN5boost6detail17sp_counted_impl_pIN4epee10misc_utils14call_befor_dieIZN6crypto13ElectrumWords14words_to_bytesERKNS2_15wipeable_stringERS7_mbRNSt3__212basic_stringIcNSB_11char_traitsIcEENSB_9allocatorIcEEEEE3__0EEE17get_local_deleterERKSt9type_info",
      "__ZNSt3__215basic_streambufIcNS_11char_traitsIcEEE9pbackfailEi",
      "__ZNSt3__215basic_streambufIcNS_11char_traitsIcEEE8overflowEi",
      "__ZNSt3__215basic_streambufIwNS_11char_traitsIwEEE9pbackfailEj",
      "__ZNSt3__215basic_streambufIwNS_11char_traitsIwEEE8overflowEj",
      "__ZNSt3__211__stdoutbufIwE8overflowEj",
      "__ZNSt3__211__stdoutbufIcE8overflowEi",
      "__ZNSt3__210__stdinbufIwE9pbackfailEj",
      "__ZNSt3__210__stdinbufIcE9pbackfailEi",
      "__ZNKSt3__25ctypeIcE10do_toupperEc",
      "__ZNKSt3__25ctypeIcE10do_tolowerEc",
      "__ZNKSt3__25ctypeIcE8do_widenEc",
      "__ZNKSt3__25ctypeIwE10do_toupperEw",
      "__ZNKSt3__25ctypeIwE10do_tolowerEw",
      "__ZNKSt3__25ctypeIwE8do_widenEc",
      "__ZN10emscripten8internal7InvokerINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEJRKS8_EE6invokeEPFS8_SA_EPNS0_11BindingTypeIS8_EUt_E",
      "__ZNK5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE9walk_pathERNS0_11string_pathIS8_NS0_13id_translatorIS8_EEEE",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEaSERKS5_",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc",
      "__ZN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE10force_pathERNS0_11string_pathIS8_NS0_13id_translatorIS8_EEEE",
      "__ZN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEEaSERKSB_",
      "__ZN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE9push_backERKNS2_4pairIKS8_SB_EE",
      "__ZN19serial_bridge_utils16parsed_json_rootERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEERN5boost13property_tree11basic_ptreeIS6_S6_NS0_4lessIS6_EEEE",
      "__ZNK5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE3getIbEET_RKNS0_11string_pathIS8_NS0_13id_translatorIS8_EEEE",
      "__ZN4epee12string_tools10hex_to_podIN5tools8scrubbedIN6crypto9ec_scalarEEEEEbRKNSt3__212basic_stringIcNS7_11char_traitsIcEENS7_9allocatorIcEEEERNS_7mlockedIT_EE",
      "__ZN4epee12string_tools10hex_to_podIN6crypto10public_keyEEEbRKNSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEERT_",
      "__ZN4epee12string_tools23parse_hexstr_to_binbuffIcEEbRKNSt3__212basic_stringIT_NS2_11char_traitsIS4_EENS2_9allocatorIS4_EEEERS9_b",
      "__ZNSt3__2lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_c",
      "__ZNSt3__2lsIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS_13basic_ostreamIT_T0_EES9_RKNS_12basic_stringIS6_S7_T1_EE",
      "__ZNKSt3__26locale9use_facetERNS0_2idE",
      "__ZNSt3__2lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc",
      "__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEm",
      "__ZNK5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE9get_valueIbNS0_17stream_translatorIcS5_S7_bEEEENS_9enable_ifINS0_6detail13is_translatorIT0_EET_E4typeESI_",
      "__ZN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE9get_childERKNS0_11string_pathIS8_NS0_13id_translatorIS8_EEEE",
      "__ZN6cryptolsERNSt3__213basic_ostreamIcNS0_11char_traitsIcEEEERKNS_10public_keyE",
      "__ZN6cryptolsERNSt3__213basic_ostreamIcNS0_11char_traitsIcEEEERKN4epee7mlockedIN5tools8scrubbedINS_9ec_scalarEEEEE",
      "__ZN6cryptolsERNSt3__213basic_ostreamIcNS0_11char_traitsIcEEEERKNS_14key_derivationE",
      "__ZN12_GLOBAL__N_120_add_pid_to_tx_extraERKN5boost8optionalINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEEERNS2_6vectorIhNS6_IhEEEE",
      "__ZN10cryptonote27add_extra_nonce_to_tx_extraERNSt3__26vectorIhNS0_9allocatorIhEEEERKNS0_12basic_stringIcNS0_11char_traitsIcEENS2_IcEEEE",
      "__ZNSt3__213unordered_mapIN6crypto10public_keyEN10cryptonote16subaddress_indexENS_4hashIS2_EENS_8equal_toIS2_EENS_9allocatorINS_4pairIKS2_S4_EEEEEixERSB_",
      "__ZN13serialization9serializeI14binary_archiveILb1EEN10cryptonote11transactionEEEbRT_RT0_",
      "__ZNR5boost7variantIN10cryptonote8txin_genEJNS1_14txin_to_scriptENS1_18txin_to_scripthashENS1_11txin_to_keyEEE13apply_visitorINS_6detail7variant11get_visitorIS5_EEEENT_11result_typeERSC_",
      "__ZN4epee12string_tools10hex_to_podIN3rct3keyEEEbRKNSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEERT_",
      "__ZN19monero_wallet_utils12decoded_seedERKN4epee15wipeable_stringERNS_27MnemonicDecodedSeed_RetValsE",
      "__ZNSt3__2rsIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS_13basic_istreamIT_T0_EES9_RNS_12basic_stringIS6_S7_T1_EE",
      "__ZN4epee12string_tools10hex_to_podIN19monero_wallet_utils19ec_nonscalar_16ByteEEEbRKNSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEERN5tools8scrubbedIT_EE",
      "__ZN6monero13address_utils12isSubAddressERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEN10cryptonote12network_typeE",
      "__ZN6monero13address_utils19isIntegratedAddressERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEN10cryptonote12network_typeE",
      "__ZN19monero_wallet_utils19are_equal_mnemonicsERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEES8_",
      "__ZN4epee12string_tools10hex_to_podIN6crypto5hash8EEEbRKNSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEERT_",
      "__ZN4epee12string_tools10hex_to_podIN6crypto14key_derivationEEEbRKNSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEERT_",
      "__ZNK5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE9get_childERKNS0_11string_pathIS8_NS0_13id_translatorIS8_EEEE",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding5is_wsEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding13is_open_braceEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding14is_close_braceEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding8is_colonEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding8is_commaEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding15is_open_bracketEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding16is_close_bracketEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding8is_quoteEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding4is_tEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding4is_rEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding4is_uEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding4is_eEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding4is_fEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding4is_aEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding4is_lEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding4is_sEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding4is_nEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding8is_minusEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding4is_0Ec",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding9is_digit0Ec",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding6is_dotEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding8is_digitEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding5is_eEEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding12is_plusminusEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding12is_backslashEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding8is_slashEc",
      "__ZNK5boost13property_tree11json_parser6detail32external_ascii_superset_encoding4is_bEc",
      "__ZN13serialization9serializeI14binary_archiveILb1EEN10cryptonote22account_public_addressEEEbRT_RT0_",
      "__ZN13serialization9serializeI14binary_archiveILb1EEN10cryptonote18integrated_addressEEEbRT_RT0_",
      "__ZN13serialization12parse_binaryIN10cryptonote18integrated_addressEEEbRKNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEERT_",
      "__ZN13serialization12parse_binaryIN10cryptonote22account_public_addressEEEbRKNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEERT_",
      "__ZN13serialization9serializeI14binary_archiveILb0EEN10cryptonote18integrated_addressEEEbRT_RT0_",
      "__ZN13serialization9serializeI14binary_archiveILb0EEN10cryptonote22account_public_addressEEEbRT_RT0_",
      "__ZNR5boost7variantIN10cryptonote15txout_to_scriptEJNS1_19txout_to_scripthashENS1_12txout_to_keyEEE13apply_visitorINS_6detail7variant11get_visitorIS4_EEEENT_11result_typeERSB_",
      "__ZNKR5boost7variantIN10cryptonote8txin_genEJNS1_14txin_to_scriptENS1_18txin_to_scripthashENS1_11txin_to_keyEEE13apply_visitorINS_6detail7variant11get_visitorIKS5_EEEENT_11result_typeERSD_",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6insertEmPKc",
      "__ZN5boost10conversion6detail19try_lexical_convertINSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEiEEbRKT0_RT_",
      "__Z12do_serializeI14binary_archiveILb0EEN5boost7variantIN10cryptonote16tx_extra_paddingEJNS4_16tx_extra_pub_keyENS4_14tx_extra_nonceENS4_25tx_extra_merge_mining_tagENS4_28tx_extra_additional_pub_keysENS4_29tx_extra_mysterious_minergateEEEEEbRT_RT0_",
      "__Z12do_serializeI14binary_archiveILb0EEN10cryptonote14tx_extra_nonceEEbRT_RT0_",
      "__Z12do_serializeI14binary_archiveILb0EEN10cryptonote28tx_extra_additional_pub_keysEEbRT_RT0_",
      "__Z12do_serializeI14binary_archiveILb0EEN10cryptonote29tx_extra_mysterious_minergateEEbRT_RT0_",
      "__Z12do_serializeI14binary_archiveEbRT_ILb0EERNSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEE",
      "__ZN13serialization9serializeI14binary_archiveILb0EEN10cryptonote25tx_extra_merge_mining_tag16serialize_helperEEEbRT_RT0_",
      "__ZN10cryptonote14parse_tx_extraERKNSt3__26vectorIhNS0_9allocatorIhEEEERNS1_IN5boost7variantINS_16tx_extra_paddingEJNS_16tx_extra_pub_keyENS_14tx_extra_nonceENS_25tx_extra_merge_mining_tagENS_28tx_extra_additional_pub_keysENS_29tx_extra_mysterious_minergateEEEENS2_ISF_EEEE",
      "__ZNKR5boost7variantIN10cryptonote16tx_extra_paddingEJNS1_16tx_extra_pub_keyENS1_14tx_extra_nonceENS1_25tx_extra_merge_mining_tagENS1_28tx_extra_additional_pub_keysENS1_29tx_extra_mysterious_minergateEEE13apply_visitorINS_6detail7variant11get_visitorIKS3_EEEENT_11result_typeERSF_",
      "__ZN10cryptonote27find_tx_extra_field_by_typeINS_28tx_extra_additional_pub_keysEEEbRKNSt3__26vectorIN5boost7variantINS_16tx_extra_paddingEJNS_16tx_extra_pub_keyENS_14tx_extra_nonceENS_25tx_extra_merge_mining_tagES1_NS_29tx_extra_mysterious_minergateEEEENS2_9allocatorISB_EEEERT_m",
      "__ZNKR5boost7variantIN10cryptonote16tx_extra_paddingEJNS1_16tx_extra_pub_keyENS1_14tx_extra_nonceENS1_25tx_extra_merge_mining_tagENS1_28tx_extra_additional_pub_keysENS1_29tx_extra_mysterious_minergateEEE13apply_visitorINS_6detail7variant11get_visitorIKS6_EEEENT_11result_typeERSF_",
      "__Z12do_serializeI14binary_archiveILb1EEN5boost7variantIN10cryptonote16tx_extra_paddingEJNS4_16tx_extra_pub_keyENS4_14tx_extra_nonceENS4_25tx_extra_merge_mining_tagENS4_28tx_extra_additional_pub_keysENS4_29tx_extra_mysterious_minergateEEEEEbRT_RT0_",
      "__Z12do_serializeI14binary_archiveILb1EEN10cryptonote25tx_extra_merge_mining_tag16serialize_helperEEbRT_RT0_",
      "__ZN13serialization9serializeI14binary_archiveILb1EENSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEEEbRT_RT0_",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc",
      "__ZN5boosteqIN10cryptonote22account_public_addressEEEbRKT_RKNS_8optionalIS3_EE",
      "__ZN5boost14equal_pointeesINS_8optionalIN10cryptonote22account_public_addressEEEEEbRKT_S7_",
      "__ZN10cryptonote27find_tx_extra_field_by_typeINS_14tx_extra_nonceEEEbRKNSt3__26vectorIN5boost7variantINS_16tx_extra_paddingEJNS_16tx_extra_pub_keyES1_NS_25tx_extra_merge_mining_tagENS_28tx_extra_additional_pub_keysENS_29tx_extra_mysterious_minergateEEEENS2_9allocatorISB_EEEERT_m",
      "__ZN3rctlsERNSt3__213basic_ostreamIcNS0_11char_traitsIcEEEERKNS_3keyE",
      "__ZN6cryptolsERNSt3__213basic_ostreamIcNS0_11char_traitsIcEEEERKNS_4hashE",
      "__ZN13serialization9serializeI12json_archiveILb1EEN10cryptonote11transactionEEEbRT_RT0_",
      "__ZNKR5boost7variantIN10cryptonote16tx_extra_paddingEJNS1_16tx_extra_pub_keyENS1_14tx_extra_nonceENS1_25tx_extra_merge_mining_tagENS1_28tx_extra_additional_pub_keysENS1_29tx_extra_mysterious_minergateEEE13apply_visitorINS_6detail7variant11get_visitorIKS4_EEEENT_11result_typeERSF_",
      "__ZN5tools6base586decodeERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEERS7_",
      "__ZN12_GLOBAL__N_113checksum_testENSt3__26vectorIN4epee15wipeable_stringENS0_9allocatorIS3_EEEEPKN8Language4BaseE",
      "__ZNKSt3__212__hash_tableINS_17__hash_value_typeIN4epee15wipeable_stringEjEENS_22__unordered_map_hasherIS3_S4_N8Language8WordHashELb1EEENS_21__unordered_map_equalIS3_S4_NS6_9WordEqualELb1EEENS_9allocatorIS4_EEE4findIS3_EENS_21__hash_const_iteratorIPNS_11__hash_nodeIS4_PvEEEERKT_",
      "__ZNKSt3__213unordered_mapIN4epee15wipeable_stringEjN8Language8WordHashENS3_9WordEqualENS_9allocatorINS_4pairIKS2_jEEEEE2atERS8_",
      "__ZN12_GLOBAL__N_121create_checksum_indexERKNSt3__26vectorIN4epee15wipeable_stringENS0_9allocatorIS3_EEEEPKN8Language4BaseE",
      "__ZNK8Language9WordEqualclERKN4epee15wipeable_stringES4_",
      "__ZNSt3__213unordered_mapIN4epee15wipeable_stringEjN8Language8WordHashENS3_9WordEqualENS_9allocatorINS_4pairIKS2_jEEEEEixEOS2_",
      "__ZNSt3__212__hash_tableINS_17__hash_value_typeIN4epee15wipeable_stringEjEENS_22__unordered_map_hasherIS3_S4_N8Language8WordHashELb1EEENS_21__unordered_map_equalIS3_S4_NS6_9WordEqualELb1EEENS_9allocatorIS4_EEE4findIS3_EENS_15__hash_iteratorIPNS_11__hash_nodeIS4_PvEEEERKT_",
      "__ZNSt3__213unordered_mapIN4epee15wipeable_stringEjN8Language8WordHashENS3_9WordEqualENS_9allocatorINS_4pairIKS2_jEEEEEixERS8_",
      "__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEj",
      "__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEi",
      "__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEt",
      "__ZNSt3__212_GLOBAL__N_110as_integerImNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEEET_RKS7_RKT0_Pmi",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEEN10__cxxabiv112_GLOBAL__N_112malloc_allocIcEEE6appendEPKc",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0"
    ];
    var debug_table_iiii = [
      "0",
      "__ZNSt3__215basic_streambufIcNS_11char_traitsIcEEE6setbufEPcl",
      "__ZNSt3__215basic_streambufIcNS_11char_traitsIcEEE6xsgetnEPcl",
      "__ZNSt3__215basic_streambufIcNS_11char_traitsIcEEE6xsputnEPKcl",
      "__ZNSt3__210__function6__funcIPFbhxENS_9allocatorIS3_EES2_EclEOhOx",
      "__ZNSt3__210__function6__funcIZN17monero_fork_rules22make_use_fork_rules_fnEhEUlhxE_NS_9allocatorIS3_EEFbhxEEclEOhOx",
      "__ZN2hw4core14device_default15get_secret_keysERN4epee7mlockedIN5tools8scrubbedIN6crypto9ec_scalarEEEEESA_",
      "__ZN2hw4core14device_default11verify_keysERKN4epee7mlockedIN5tools8scrubbedIN6crypto9ec_scalarEEEEERKNS6_10public_keyE",
      "__ZN2hw4core14device_default14scalarmultBaseERN3rct3keyERKS3_",
      "__ZN2hw4core14device_default24secret_key_to_public_keyERKN4epee7mlockedIN5tools8scrubbedIN6crypto9ec_scalarEEEEERNS6_10public_keyE",
      "__ZN2hw4core14device_default13mlsag_prepareERN3rct3keyES4_",
      "__ZN2hw4core14device_default10mlsag_hashERKNSt3__26vectorIN3rct3keyENS2_9allocatorIS5_EEEERS5_",
      "__ZNK5boost6system14error_category10equivalentEiRKNS0_15error_conditionE",
      "__ZNK5boost6system14error_category10equivalentERKNS0_10error_codeEi",
      "__ZNK5boost6system14error_category12std_category10equivalentEiRKNSt3__215error_conditionE",
      "__ZNK5boost6system14error_category12std_category10equivalentERKNSt3__210error_codeEi",
      "___stdio_write",
      "___stdio_seek",
      "___stdio_read",
      "___stdout_write",
      "_sn_write",
      "__ZNSt3__215basic_streambufIwNS_11char_traitsIwEEE6setbufEPwl",
      "__ZNSt3__215basic_streambufIwNS_11char_traitsIwEEE6xsgetnEPwl",
      "__ZNSt3__215basic_streambufIwNS_11char_traitsIwEEE6xsputnEPKwl",
      "__ZNKSt3__214error_category10equivalentEiRKNS_15error_conditionE",
      "__ZNKSt3__214error_category10equivalentERKNS_10error_codeEi",
      "__ZNSt3__211__stdoutbufIwE6xsputnEPKwl",
      "__ZNSt3__211__stdoutbufIcE6xsputnEPKcl",
      "__ZNKSt3__27collateIcE7do_hashEPKcS3_",
      "__ZNKSt3__27collateIwE7do_hashEPKwS3_",
      "__ZNKSt3__28messagesIcE7do_openERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKNS_6localeE",
      "__ZNKSt3__28messagesIwE7do_openERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKNS_6localeE",
      "__ZNKSt3__25ctypeIcE10do_toupperEPcPKc",
      "__ZNKSt3__25ctypeIcE10do_tolowerEPcPKc",
      "__ZNKSt3__25ctypeIcE9do_narrowEcc",
      "__ZNKSt3__25ctypeIwE5do_isEtw",
      "__ZNKSt3__25ctypeIwE10do_toupperEPwPKw",
      "__ZNKSt3__25ctypeIwE10do_tolowerEPwPKw",
      "__ZNKSt3__25ctypeIwE9do_narrowEwc",
      "__ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv",
      "__ZNK10__cxxabiv123__fundamental_type_info9can_catchEPKNS_16__shim_type_infoERPv",
      "__ZNK10__cxxabiv119__pointer_type_info9can_catchEPKNS_16__shim_type_infoERPv",
      "__ZNK10__cxxabiv120__function_type_info9can_catchEPKNS_16__shim_type_infoERPv",
      "__ZN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE9put_childERKNS0_11string_pathIS8_NS0_13id_translatorIS8_EEEERKSB_",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm",
      "__ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE4copyEPcmm",
      "__ZN10cryptonote28get_account_address_from_strERNS_18address_parse_infoENS_12network_typeERKNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEE",
      "__ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7compareEmmPKcm",
      "__ZNSt3__26vectorINS_4pairIyN3rct5ctkeyEEENS_9allocatorIS4_EEE6insertENS_11__wrap_iterIPKS4_EERS9_",
      "__ZN19monero_wallet_utils10new_walletERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEERNS_24WalletDescriptionRetValsEN10cryptonote12network_typeE",
      "__ZN6crypto13ElectrumWords14bytes_to_wordsERKN4epee7mlockedIN5tools8scrubbedINS_9ec_scalarEEEEERNS1_15wipeable_stringERKNSt3__212basic_stringIcNSC_11char_traitsIcEENSC_9allocatorIcEEEE",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE5eraseEmm",
      "__ZN6crypto13ElectrumWords14words_to_bytesERKN4epee15wipeable_stringERNS1_7mlockedIN5tools8scrubbedINS_9ec_scalarEEEEERNSt3__212basic_stringIcNSC_11char_traitsIcEENSC_9allocatorIcEEEE",
      "__ZN19monero_wallet_utils14words_to_bytesERKN4epee15wipeable_stringERN5tools8scrubbedINS_19ec_nonscalar_16ByteEEERNSt3__212basic_stringIcNS9_11char_traitsIcEENS9_9allocatorIcEEEE",
      "__ZN19monero_wallet_utils14bytes_to_wordsERKN5tools8scrubbedINS_19ec_nonscalar_16ByteEEERN4epee15wipeable_stringERKNSt3__212basic_stringIcNS9_11char_traitsIcEENS9_9allocatorIcEEEE",
      "__ZN19monero_wallet_utils42convenience__new_wallet_with_language_codeERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEERNS_24WalletDescriptionRetValsEN10cryptonote12network_typeE",
      "__ZN19monero_wallet_utils26address_and_keys_from_seedERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEEN10cryptonote12network_typeERNS_26ComponentsFromSeed_RetValsE",
      "__ZN19monero_wallet_utils11wallet_withERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEERNS_24WalletDescriptionRetValsEN10cryptonote12network_typeE",
      "__ZN6crypto23generate_key_derivationERKNS_10public_keyERKN4epee7mlockedIN5tools8scrubbedINS_9ec_scalarEEEEERNS_14key_derivationE",
      "__ZN5tools6base5811decode_addrENSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEERyRS7_",
      "__ZN10cryptonote27find_tx_extra_field_by_typeINS_16tx_extra_pub_keyEEEbRKNSt3__26vectorIN5boost7variantINS_16tx_extra_paddingEJS1_NS_14tx_extra_nonceENS_25tx_extra_merge_mining_tagENS_28tx_extra_additional_pub_keysENS_29tx_extra_mysterious_minergateEEEENS2_9allocatorISB_EEEERT_m",
      "_do_read",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE23__append_forward_unsafeIPcEERS5_T_S9_",
      "__ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE23__append_forward_unsafeIPwEERS5_T_S9_",
      "__ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6appendEPKwm",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEEN10__cxxabiv112_GLOBAL__N_112malloc_allocIcEEE6appendEPKcm",
      "__ZN10__cxxabiv112_GLOBAL__N_118parse_special_nameINS0_2DbEEEPKcS4_S4_RT_",
      "__ZN10__cxxabiv112_GLOBAL__N_110parse_nameINS0_2DbEEEPKcS4_S4_RT_",
      "__ZN10__cxxabiv112_GLOBAL__N_110parse_typeINS0_2DbEEEPKcS4_S4_RT_",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEEN10__cxxabiv112_GLOBAL__N_112malloc_allocIcEEE6insertEmPKc",
      "__ZNKSt3__212basic_stringIcNS_11char_traitsIcEEN10__cxxabiv112_GLOBAL__N_112malloc_allocIcEEE7compareEmmPKcm",
      "__ZN10__cxxabiv112_GLOBAL__N_117parse_source_nameINS0_2DbEEEPKcS4_S4_RT_",
      "__ZN10__cxxabiv112_GLOBAL__N_118parse_template_argINS0_2DbEEEPKcS4_S4_RT_",
      "__ZN10__cxxabiv112_GLOBAL__N_116parse_expressionINS0_2DbEEEPKcS4_S4_RT_",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0"
    ];
    var debug_table_iiiii = [
      "0",
      "__ZN2hw4core14device_default13scalarmultKeyERN3rct3keyERKS3_S6_",
      "__ZN2hw4core14device_default13sc_secret_addERN4epee7mlockedIN5tools8scrubbedIN6crypto9ec_scalarEEEEERKS9_SC_",
      "__ZN2hw4core14device_default23generate_key_derivationERKN6crypto10public_keyERKN4epee7mlockedIN5tools8scrubbedINS2_9ec_scalarEEEEERNS2_14key_derivationE",
      "__ZN2hw4core14device_default20derivation_to_scalarERKN6crypto14key_derivationEmRNS2_9ec_scalarE",
      "__ZN2hw4core14device_default18generate_key_imageERKN6crypto10public_keyERKN4epee7mlockedIN5tools8scrubbedINS2_9ec_scalarEEEEERNS2_9key_imageE",
      "__ZN2hw4core14device_default18encrypt_payment_idERN6crypto5hash8ERKNS2_10public_keyERKN4epee7mlockedIN5tools8scrubbedINS2_9ec_scalarEEEEE",
      "__ZN2hw4core14device_default10ecdhEncodeERN3rct9ecdhTupleERKNS2_3keyEb",
      "__ZN2hw4core14device_default10ecdhDecodeERN3rct9ecdhTupleERKNS2_3keyEb",
      "__ZNKSt3__25ctypeIcE8do_widenEPKcS3_Pc",
      "__ZNKSt3__25ctypeIwE5do_isEPKwS3_Pt",
      "__ZNKSt3__25ctypeIwE10do_scan_isEtPKwS3_",
      "__ZNKSt3__25ctypeIwE11do_scan_notEtPKwS3_",
      "__ZNKSt3__25ctypeIwE8do_widenEPKcS3_Pw",
      "__ZN6crypto17derive_public_keyERKNS_14key_derivationEmRKNS_10public_keyERS3_",
      "__ZN6crypto13ElectrumWords14words_to_bytesERKN4epee15wipeable_stringERS2_mbRNSt3__212basic_stringIcNS6_11char_traitsIcEENS6_9allocatorIcEEEE",
      "__ZN6crypto28derive_subaddress_public_keyERKNS_10public_keyERKNS_14key_derivationEmRS0_",
      "__ZN3rct10rctSigBase21serialize_rctsig_baseILb1E14binary_archiveEEbRT0_IXT_EEmm",
      "__ZN12_GLOBAL__N_118find_seed_languageERKNSt3__26vectorIN4epee15wipeable_stringENS0_9allocatorIS3_EEEEbRNS1_IjNS4_IjEEEEPPN8Language4BaseE",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEEN10__cxxabiv112_GLOBAL__N_112malloc_allocIcEEE6insertEmPKcm",
      "__ZN10__cxxabiv112_GLOBAL__N_123parse_binary_expressionINS0_2DbEEEPKcS4_S4_RKNT_6StringERS5_",
      "__ZN10__cxxabiv112_GLOBAL__N_123parse_prefix_expressionINS0_2DbEEEPKcS4_S4_RKNT_6StringERS5_",
      "__ZN10__cxxabiv112_GLOBAL__N_121parse_integer_literalINS0_2DbEEEPKcS4_S4_RKNT_6StringERS5_",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEEN10__cxxabiv112_GLOBAL__N_112malloc_allocIcEEE6insertIPKcEENS_9enable_ifIXaasr21__is_forward_iteratorIT_EE5valuesr38__libcpp_string_gets_noexcept_iteratorISC_EE5valueENS_11__wrap_iterIPcEEE4typeENSD_ISA_EESC_SC_",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0"
    ];
    var debug_table_iiiiid = [
      "0",
      "__ZNKSt3__27num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcd",
      "__ZNKSt3__27num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEce",
      "__ZNKSt3__27num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwd",
      "__ZNKSt3__27num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwe",
      "0",
      "0",
      "0"
    ];
    var debug_table_iiiiii = [
      "0",
      "__ZN2hw4core14device_default28derive_subaddress_public_keyERKN6crypto10public_keyERKNS2_14key_derivationEmRS3_",
      "__ZN2hw4core14device_default17derive_secret_keyERKN6crypto14key_derivationEmRKN4epee7mlockedIN5tools8scrubbedINS2_9ec_scalarEEEEERSC_",
      "__ZN2hw4core14device_default17derive_public_keyERKN6crypto14key_derivationEmRKNS2_10public_keyERS6_",
      "__ZNKSt3__27collateIcE10do_compareEPKcS3_S3_S3_",
      "__ZNKSt3__27collateIwE10do_compareEPKwS3_S3_S3_",
      "__ZNKSt3__27num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcb",
      "__ZNKSt3__27num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcl",
      "__ZNKSt3__27num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcm",
      "__ZNKSt3__27num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcPKv",
      "__ZNKSt3__27num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwb",
      "__ZNKSt3__27num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwl",
      "__ZNKSt3__27num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwm",
      "__ZNKSt3__27num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwPKv",
      "__ZNKSt3__27codecvtIDic11__mbstate_tE10do_unshiftERS1_PcS4_RS4_",
      "__ZNKSt3__27codecvtIDic11__mbstate_tE9do_lengthERS1_PKcS5_m",
      "__ZNKSt3__27codecvtIwc11__mbstate_tE10do_unshiftERS1_PcS4_RS4_",
      "__ZNKSt3__27codecvtIwc11__mbstate_tE9do_lengthERS1_PKcS5_m",
      "__ZNKSt3__25ctypeIcE9do_narrowEPKcS3_cPc",
      "__ZNKSt3__25ctypeIwE9do_narrowEPKwS3_cPc",
      "__ZNKSt3__27codecvtIcc11__mbstate_tE10do_unshiftERS1_PcS4_RS4_",
      "__ZNKSt3__27codecvtIcc11__mbstate_tE9do_lengthERS1_PKcS5_m",
      "__ZNKSt3__27codecvtIDsc11__mbstate_tE10do_unshiftERS1_PcS4_RS4_",
      "__ZNKSt3__27codecvtIDsc11__mbstate_tE9do_lengthERS1_PKcS5_m",
      "__ZN16monero_fee_utils20estimate_rct_tx_sizeEiiimb",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0"
    ];
    var debug_table_iiiiiid = [
      "0",
      "__ZNKSt3__29money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_bRNS_8ios_baseEce",
      "__ZNKSt3__29money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_bRNS_8ios_baseEwe",
      "0"
    ];
    var debug_table_iiiiiii = [
      "0",
      "__ZN2hw4core14device_default18conceal_derivationERN6crypto14key_derivationERKNS2_10public_keyERKNSt3__26vectorIS5_NS8_9allocatorIS5_EEEERKS3_RKNS9_IS3_NSA_IS3_EEEE",
      "__ZNKSt3__27num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRb",
      "__ZNKSt3__27num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRl",
      "__ZNKSt3__27num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRx",
      "__ZNKSt3__27num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRt",
      "__ZNKSt3__27num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjS8_",
      "__ZNKSt3__27num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRm",
      "__ZNKSt3__27num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRy",
      "__ZNKSt3__27num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRf",
      "__ZNKSt3__27num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRd",
      "__ZNKSt3__27num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRe",
      "__ZNKSt3__27num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRPv",
      "__ZNKSt3__27num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRb",
      "__ZNKSt3__27num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRl",
      "__ZNKSt3__27num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRx",
      "__ZNKSt3__27num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRt",
      "__ZNKSt3__27num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjS8_",
      "__ZNKSt3__27num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRm",
      "__ZNKSt3__27num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRy",
      "__ZNKSt3__27num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRf",
      "__ZNKSt3__27num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRd",
      "__ZNKSt3__27num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRe",
      "__ZNKSt3__27num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRPv",
      "__ZNKSt3__28time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11do_get_timeES4_S4_RNS_8ios_baseERjP2tm",
      "__ZNKSt3__28time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11do_get_dateES4_S4_RNS_8ios_baseERjP2tm",
      "__ZNKSt3__28time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE14do_get_weekdayES4_S4_RNS_8ios_baseERjP2tm",
      "__ZNKSt3__28time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE16do_get_monthnameES4_S4_RNS_8ios_baseERjP2tm",
      "__ZNKSt3__28time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11do_get_yearES4_S4_RNS_8ios_baseERjP2tm",
      "__ZNKSt3__28time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11do_get_timeES4_S4_RNS_8ios_baseERjP2tm",
      "__ZNKSt3__28time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11do_get_dateES4_S4_RNS_8ios_baseERjP2tm",
      "__ZNKSt3__28time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE14do_get_weekdayES4_S4_RNS_8ios_baseERjP2tm",
      "__ZNKSt3__28time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE16do_get_monthnameES4_S4_RNS_8ios_baseERjP2tm",
      "__ZNKSt3__28time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11do_get_yearES4_S4_RNS_8ios_baseERjP2tm",
      "__ZNKSt3__29money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_bRNS_8ios_baseEcRKNS_12basic_stringIcS3_NS_9allocatorIcEEEE",
      "__ZNKSt3__29money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_bRNS_8ios_baseEwRKNS_12basic_stringIwS3_NS_9allocatorIwEEEE",
      "__ZNSt3__216__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_",
      "__ZN19monero_wallet_utils31validate_wallet_components_withERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEES8_N5boost8optionalIS6_EESB_N10cryptonote12network_typeERNS_33WalletComponentsValidationResultsE",
      "__ZN3rct14rctSigPrunable25serialize_rctsig_prunableILb1E14binary_archiveEEbRT0_IXT_EEhmmm",
      "__ZNSt3__216__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0"
    ];
    var debug_table_iiiiiiii = [
      "0",
      "__ZN2hw4core14device_default13mlsag_prehashERKNSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEmmRKNS2_6vectorIN3rct3keyENS6_ISD_EEEERKNSB_INSC_5ctkeyENS6_ISI_EEEERSD_",
      "__ZN2hw4core14device_default13mlsag_prepareERKN3rct3keyES5_RS3_S6_S6_S6_",
      "__ZN2hw4core14device_default10mlsag_signERKN3rct3keyERKNSt3__26vectorIS3_NS6_9allocatorIS3_EEEESC_mmRSA_",
      "__ZNKSt3__28time_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcPK2tmcc",
      "__ZNKSt3__28time_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwPK2tmcc",
      "__ZNKSt3__29money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_bRNS_8ios_baseERjRe",
      "__ZNKSt3__29money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_bRNS_8ios_baseERjRNS_12basic_stringIcS3_NS_9allocatorIcEEEE",
      "__ZNKSt3__29money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_bRNS_8ios_baseERjRe",
      "__ZNKSt3__29money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_bRNS_8ios_baseERjRNS_12basic_stringIwS3_NS_9allocatorIwEEEE",
      "__ZNSt3__214__scan_keywordINS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEPKNS_12basic_stringIcS3_NS_9allocatorIcEEEENS_5ctypeIcEEEET0_RT_SE_SD_SD_RKT1_Rjb",
      "__ZNSt3__214__scan_keywordINS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEPKNS_12basic_stringIwS3_NS_9allocatorIwEEEENS_5ctypeIwEEEET0_RT_SE_SD_SD_RKT1_Rjb",
      "0",
      "0",
      "0",
      "0"
    ];
    var debug_table_iiiiiiiii = [
      "0",
      "__ZNKSt3__28time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjP2tmcc",
      "__ZNKSt3__28time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjP2tmcc",
      "__ZNKSt3__27codecvtIDic11__mbstate_tE6do_outERS1_PKDiS5_RS5_PcS7_RS7_",
      "__ZNKSt3__27codecvtIDic11__mbstate_tE5do_inERS1_PKcS5_RS5_PDiS7_RS7_",
      "__ZNKSt3__27codecvtIwc11__mbstate_tE6do_outERS1_PKwS5_RS5_PcS7_RS7_",
      "__ZNKSt3__27codecvtIwc11__mbstate_tE5do_inERS1_PKcS5_RS5_PwS7_RS7_",
      "__ZNKSt3__27codecvtIcc11__mbstate_tE6do_outERS1_PKcS5_RS5_PcS7_RS7_",
      "__ZNKSt3__27codecvtIcc11__mbstate_tE5do_inERS1_PKcS5_RS5_PcS7_RS7_",
      "__ZNKSt3__27codecvtIDsc11__mbstate_tE6do_outERS1_PKDsS5_RS5_PcS7_RS7_",
      "__ZNKSt3__27codecvtIDsc11__mbstate_tE5do_inERS1_PKcS5_RS5_PDsS7_RS7_",
      "__ZN10cryptonote33generate_key_image_helper_precompERKNS_12account_keysERKN6crypto10public_keyERKNS3_14key_derivationEmRKNS_16subaddress_indexERNS_7keypairERNS3_9key_imageERN2hw6deviceE",
      "0",
      "0",
      "0",
      "0"
    ];
    var debug_table_iiiiiiiiii = [
      "0",
      "__ZN10cryptonote25generate_key_image_helperERKNS_12account_keysERKNSt3__213unordered_mapIN6crypto10public_keyENS_16subaddress_indexENS3_4hashIS6_EENS3_8equal_toIS6_EENS3_9allocatorINS3_4pairIKS6_S7_EEEEEERSE_SK_RKNS3_6vectorIS6_NSC_IS6_EEEEmRNS_7keypairERNS5_9key_imageERN2hw6deviceE"
    ];
    var debug_table_iiiiiiiiiiii = [
      "0",
      "__ZNSt3__29money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE8__do_getERS4_S4_bRKNS_6localeEjRjRbRKNS_5ctypeIcEERNS_10unique_ptrIcPFvPvEEERPcSM_",
      "__ZNSt3__29money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE8__do_getERS4_S4_bRKNS_6localeEjRjRbRKNS_5ctypeIwEERNS_10unique_ptrIwPFvPvEEERPwSM_",
      "0"
    ];
    var debug_table_iiiiiiiiiiiiii = [
      "0",
      "__ZN2hw4core14device_default30generate_output_ephemeral_keysEmRKN10cryptonote12account_keysERKN6crypto10public_keyERKN4epee7mlockedIN5tools8scrubbedINS6_9ec_scalarEEEEERKNS2_20tx_destination_entryERKN5boost8optionalINS2_22account_public_addressEEEmRKbRKNSt3__26vectorISG_NSU_9allocatorISG_EEEERNSV_IS7_NSW_IS7_EEEERNSV_IN3rct3keyENSW_IS15_EEEERS7_"
    ];
    var debug_table_iiiiiiiijiii = [
      "0",
      "__ZN10cryptonote27construct_tx_and_get_tx_keyERKNS_12account_keysERKNSt3__213unordered_mapIN6crypto10public_keyENS_16subaddress_indexENS3_4hashIS6_EENS3_8equal_toIS6_EENS3_9allocatorINS3_4pairIKS6_S7_EEEEEERNS3_6vectorINS_15tx_source_entryENSC_ISL_EEEERNSK_INS_20tx_destination_entryENSC_ISP_EEEERKN5boost8optionalINS_22account_public_addressEEENSK_IhNSC_IhEEEERNS_11transactionEyRN4epee7mlockedIN5tools8scrubbedINS5_9ec_scalarEEEEERNSK_IS19_NSC_IS19_EEEEbRKN3rct9RCTConfigEPNS1E_12multisig_outE"
    ];
    var debug_table_iiiiiiiijiiiii = [
      "0",
      "__ZN10cryptonote24construct_tx_with_tx_keyERKNS_12account_keysERKNSt3__213unordered_mapIN6crypto10public_keyENS_16subaddress_indexENS3_4hashIS6_EENS3_8equal_toIS6_EENS3_9allocatorINS3_4pairIKS6_S7_EEEEEERNS3_6vectorINS_15tx_source_entryENSC_ISL_EEEERNSK_INS_20tx_destination_entryENSC_ISP_EEEERKN5boost8optionalINS_22account_public_addressEEENSK_IhNSC_IhEEEERNS_11transactionEyRKN4epee7mlockedIN5tools8scrubbedINS5_9ec_scalarEEEEERKNSK_IS19_NSC_IS19_EEEEbRKN3rct9RCTConfigEPNS1G_12multisig_outEb"
    ];
    var debug_table_iiiiij = [
      "0",
      "__ZNKSt3__27num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcx",
      "__ZNKSt3__27num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcy",
      "__ZNKSt3__27num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwx",
      "__ZNKSt3__27num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwy",
      "0",
      "0",
      "0"
    ];
    var debug_table_iiiiiji = [
      "0",
      "__ZN22monero_key_image_utils14new__key_imageERKN6crypto10public_keyERKN4epee7mlockedIN5tools8scrubbedINS0_9ec_scalarEEEEESC_S3_yRNS_15KeyImageRetValsE"
    ];
    var debug_table_iiiij = [
      "0",
      "__ZN2hw4core14device_default19generate_chacha_keyERKN10cryptonote12account_keysERN4epee7mlockedIN5tools8scrubbedINSt3__25arrayIhLm32EEEEEEEy"
    ];
    var debug_table_iiiiji = [
      "0",
      "__ZN12_GLOBAL__N_126_rct_hex_to_decrypted_maskERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEERKN4epee7mlockedIN5tools8scrubbedIN6crypto9ec_scalarEEEEERKNSD_10public_keyEyRN3rct3keyE"
    ];
    var debug_table_iij = [
      "0",
      "__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEy",
      "__ZN17monero_fork_rules37lightwallet_hardcoded__use_fork_rulesEhx",
      "0"
    ];
    var debug_table_ji = [
      "0",
      "__ZNSt3__26stoullERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPmi",
      "__ZN16monero_fee_utils34get_upper_transaction_weight_limitEyNSt3__28functionIFbhxEEE",
      "__ZN10cryptonote22get_transaction_weightERKNS_11transactionE"
    ];
    var debug_table_jii = [
      "0",
      "__ZN10cryptonote22get_transaction_weightERKNS_11transactionEm",
      "__ZNSt3__212_GLOBAL__N_110as_integerIyNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEEET_RKS7_RKT0_Pmi",
      "0"
    ];
    var debug_table_jiii = [
      "0",
      "__ZN16monero_fee_utils18get_fee_multiplierEjjiNSt3__28functionIFbhxEEE"
    ];
    var debug_table_jiiiii = [
      "0",
      "__ZN3rct9decodeRctERKNS_6rctSigERKNS_3keyEjRS3_RN2hw6deviceE",
      "__ZN3rct15decodeRctSimpleERKNS_6rctSigERKNS_3keyEjRS3_RN2hw6deviceE",
      "0"
    ];
    var debug_table_jiiiiijjj = [
      "0",
      "__ZN16monero_fee_utils12estimate_feeEbbiiimbyyy"
    ];
    var debug_table_jiijjj = [
      "0",
      "__ZN16monero_fee_utils13calculate_feeEbRKN10cryptonote11transactionEmyyy"
    ];
    var debug_table_jiji = ["0", "___atomic_fetch_add_8"];
    var debug_table_jjii = [
      "0",
      "__ZN16monero_fee_utils24estimated_tx_network_feeEyjNSt3__28functionIFbhxEEE"
    ];
    var debug_table_v = [
      "0",
      "___cxa_pure_virtual",
      "__ZL25default_terminate_handlerv",
      "___cxa_end_catch",
      "___cxa_rethrow",
      "___cxa_bad_typeid",
      "_cn_slow_hash",
      "__ZN5boost10conversion6detail14throw_bad_castIiNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEEEvv",
      "__ZN2hwL21clear_device_registryEv",
      "__ZN6logger7do_initEv",
      "__ZSt17__throw_bad_allocv",
      "__ZNSt3__26vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lm28EEEEC2Em",
      "__ZNSt3__26locale5__imp7installINS_7collateIcEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_7collateIwEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_5ctypeIcEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_5ctypeIwEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_7codecvtIcc11__mbstate_tEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_7codecvtIwc11__mbstate_tEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_7codecvtIDsc11__mbstate_tEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_7codecvtIDic11__mbstate_tEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_8numpunctIcEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_8numpunctIwEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_7num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_7num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_7num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_7num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_10moneypunctIcLb0EEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_10moneypunctIcLb1EEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_10moneypunctIwLb0EEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_10moneypunctIwLb1EEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_9money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_9money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_9money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_9money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_8time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_8time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_8time_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_8time_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_8messagesIcEEEEvPT_",
      "__ZNSt3__26locale5__imp7installINS_8messagesIwEEEEvPT_",
      "__ZNSt3__26vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lm28EEEE8allocateEm",
      "__ZN10__cxxabiv112_GLOBAL__N_110construct_Ev",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0"
    ];
    var debug_table_vi = [
      "0",
      "__ZN5boost16exception_detail10bad_alloc_D2Ev",
      "__ZN5boost16exception_detail10bad_alloc_D0Ev",
      "__ZThn20_N5boost16exception_detail10bad_alloc_D1Ev",
      "__ZThn20_N5boost16exception_detail10bad_alloc_D0Ev",
      "__ZN5boost16exception_detail10clone_implINS0_10bad_alloc_EED1Ev",
      "__ZN5boost16exception_detail10clone_implINS0_10bad_alloc_EED0Ev",
      "__ZNK5boost16exception_detail10clone_implINS0_10bad_alloc_EE7rethrowEv",
      "__ZThn20_N5boost16exception_detail10clone_implINS0_10bad_alloc_EED1Ev",
      "__ZThn20_N5boost16exception_detail10clone_implINS0_10bad_alloc_EED0Ev",
      "__ZTv0_n16_NK5boost16exception_detail10clone_implINS0_10bad_alloc_EE7rethrowEv",
      "__ZTv0_n20_N5boost16exception_detail10clone_implINS0_10bad_alloc_EED1Ev",
      "__ZTv0_n20_N5boost16exception_detail10clone_implINS0_10bad_alloc_EED0Ev",
      "__ZN5boost16exception_detail10clone_baseD2Ev",
      "__ZN5boost16exception_detail10clone_baseD0Ev",
      "__ZN5boost6detail17sp_counted_impl_pINS_16exception_detail10clone_implINS2_10bad_alloc_EEEED2Ev",
      "__ZN5boost6detail17sp_counted_impl_pINS_16exception_detail10clone_implINS2_10bad_alloc_EEEED0Ev",
      "__ZN5boost6detail17sp_counted_impl_pINS_16exception_detail10clone_implINS2_10bad_alloc_EEEE7disposeEv",
      "__ZN5boost6detail15sp_counted_base7destroyEv",
      "__ZN5boost6detail15sp_counted_baseD2Ev",
      "__ZN5boost6detail15sp_counted_baseD0Ev",
      "__ZN5boost16exception_detail14bad_exception_D2Ev",
      "__ZN5boost16exception_detail14bad_exception_D0Ev",
      "__ZThn20_N5boost16exception_detail14bad_exception_D1Ev",
      "__ZThn20_N5boost16exception_detail14bad_exception_D0Ev",
      "__ZN5boost16exception_detail10clone_implINS0_14bad_exception_EED1Ev",
      "__ZN5boost16exception_detail10clone_implINS0_14bad_exception_EED0Ev",
      "__ZNK5boost16exception_detail10clone_implINS0_14bad_exception_EE7rethrowEv",
      "__ZThn20_N5boost16exception_detail10clone_implINS0_14bad_exception_EED1Ev",
      "__ZThn20_N5boost16exception_detail10clone_implINS0_14bad_exception_EED0Ev",
      "__ZTv0_n16_NK5boost16exception_detail10clone_implINS0_14bad_exception_EE7rethrowEv",
      "__ZTv0_n20_N5boost16exception_detail10clone_implINS0_14bad_exception_EED1Ev",
      "__ZTv0_n20_N5boost16exception_detail10clone_implINS0_14bad_exception_EED0Ev",
      "__ZN5boost6detail17sp_counted_impl_pINS_16exception_detail10clone_implINS2_14bad_exception_EEEED2Ev",
      "__ZN5boost6detail17sp_counted_impl_pINS_16exception_detail10clone_implINS2_14bad_exception_EEEED0Ev",
      "__ZN5boost6detail17sp_counted_impl_pINS_16exception_detail10clone_implINS2_14bad_exception_EEEE7disposeEv",
      "__ZNSt3__219basic_ostringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev",
      "__ZNSt3__219basic_ostringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED0Ev",
      "__ZTv0_n12_NSt3__219basic_ostringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev",
      "__ZTv0_n12_NSt3__219basic_ostringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED0Ev",
      "__ZNSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEED2Ev",
      "__ZNSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEED0Ev",
      "__ZN5boost13property_tree14ptree_bad_pathD2Ev",
      "__ZN5boost13property_tree14ptree_bad_pathD0Ev",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_pathEEEED1Ev",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_pathEEEED0Ev",
      "__ZNK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_pathEEEE7rethrowEv",
      "__ZThn12_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_pathEEEED1Ev",
      "__ZThn12_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_pathEEEED0Ev",
      "__ZTv0_n16_NK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_pathEEEE7rethrowEv",
      "__ZTv0_n20_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_pathEEEED1Ev",
      "__ZTv0_n20_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_pathEEEED0Ev",
      "__ZN5boost16exception_detail19error_info_injectorINS_13property_tree14ptree_bad_pathEED2Ev",
      "__ZN5boost16exception_detail19error_info_injectorINS_13property_tree14ptree_bad_pathEED0Ev",
      "__ZThn12_N5boost16exception_detail19error_info_injectorINS_13property_tree14ptree_bad_pathEED1Ev",
      "__ZThn12_N5boost16exception_detail19error_info_injectorINS_13property_tree14ptree_bad_pathEED0Ev",
      "__ZN5boost13property_tree11ptree_errorD2Ev",
      "__ZN5boost13property_tree11ptree_errorD0Ev",
      "__ZN5boost3any6holderINS_13property_tree11string_pathINSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEENS2_13id_translatorISA_EEEEED2Ev",
      "__ZN5boost3any6holderINS_13property_tree11string_pathINSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEENS2_13id_translatorISA_EEEEED0Ev",
      "__ZN5boost3any11placeholderD2Ev",
      "__ZN5boost3any11placeholderD0Ev",
      "__ZN5boost13property_tree14ptree_bad_dataD2Ev",
      "__ZN5boost13property_tree14ptree_bad_dataD0Ev",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_dataEEEED1Ev",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_dataEEEED0Ev",
      "__ZNK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_dataEEEE7rethrowEv",
      "__ZThn12_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_dataEEEED1Ev",
      "__ZThn12_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_dataEEEED0Ev",
      "__ZTv0_n16_NK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_dataEEEE7rethrowEv",
      "__ZTv0_n20_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_dataEEEED1Ev",
      "__ZTv0_n20_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_dataEEEED0Ev",
      "__ZN5boost16exception_detail19error_info_injectorINS_13property_tree14ptree_bad_dataEED2Ev",
      "__ZN5boost16exception_detail19error_info_injectorINS_13property_tree14ptree_bad_dataEED0Ev",
      "__ZThn12_N5boost16exception_detail19error_info_injectorINS_13property_tree14ptree_bad_dataEED1Ev",
      "__ZThn12_N5boost16exception_detail19error_info_injectorINS_13property_tree14ptree_bad_dataEED0Ev",
      "__ZNSt3__218basic_stringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev",
      "__ZNSt3__218basic_stringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED0Ev",
      "__ZThn8_NSt3__218basic_stringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev",
      "__ZThn8_NSt3__218basic_stringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED0Ev",
      "__ZTv0_n12_NSt3__218basic_stringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev",
      "__ZTv0_n12_NSt3__218basic_stringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED0Ev",
      "__ZN5boost3any6holderINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEED2Ev",
      "__ZN5boost3any6holderINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEED0Ev",
      "__ZN5boost13property_tree17file_parser_errorD2Ev",
      "__ZN5boost13property_tree17file_parser_errorD0Ev",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree11json_parser17json_parser_errorEEEED1Ev",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree11json_parser17json_parser_errorEEEED0Ev",
      "__ZNK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree11json_parser17json_parser_errorEEEE7rethrowEv",
      "__ZThn36_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree11json_parser17json_parser_errorEEEED1Ev",
      "__ZThn36_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree11json_parser17json_parser_errorEEEED0Ev",
      "__ZTv0_n16_NK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree11json_parser17json_parser_errorEEEE7rethrowEv",
      "__ZTv0_n20_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree11json_parser17json_parser_errorEEEED1Ev",
      "__ZTv0_n20_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree11json_parser17json_parser_errorEEEED0Ev",
      "__ZN5boost16exception_detail19error_info_injectorINS_13property_tree11json_parser17json_parser_errorEED2Ev",
      "__ZN5boost16exception_detail19error_info_injectorINS_13property_tree11json_parser17json_parser_errorEED0Ev",
      "__ZThn36_N5boost16exception_detail19error_info_injectorINS_13property_tree11json_parser17json_parser_errorEED1Ev",
      "__ZThn36_N5boost16exception_detail19error_info_injectorINS_13property_tree11json_parser17json_parser_errorEED0Ev",
      "__ZN5boost13property_tree11json_parser17json_parser_errorD2Ev",
      "__ZN5boost13property_tree11json_parser17json_parser_errorD0Ev",
      "__ZNSt3__213basic_istreamIcNS_11char_traitsIcEEED1Ev",
      "__ZNSt3__213basic_istreamIcNS_11char_traitsIcEEED0Ev",
      "__ZTv0_n12_NSt3__213basic_istreamIcNS_11char_traitsIcEEED1Ev",
      "__ZTv0_n12_NSt3__213basic_istreamIcNS_11char_traitsIcEEED0Ev",
      "__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEED1Ev",
      "__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEED0Ev",
      "__ZTv0_n12_NSt3__213basic_ostreamIcNS_11char_traitsIcEEED1Ev",
      "__ZTv0_n12_NSt3__213basic_ostreamIcNS_11char_traitsIcEEED0Ev",
      "__ZNSt3__210__function6__funcIPFbhxENS_9allocatorIS3_EES2_ED2Ev",
      "__ZNSt3__210__function6__funcIPFbhxENS_9allocatorIS3_EES2_ED0Ev",
      "__ZNSt3__210__function6__funcIPFbhxENS_9allocatorIS3_EES2_E7destroyEv",
      "__ZNSt3__210__function6__funcIPFbhxENS_9allocatorIS3_EES2_E18destroy_deallocateEv",
      "__ZNSt3__210__function6__funcIZN17monero_fork_rules22make_use_fork_rules_fnEhEUlhxE_NS_9allocatorIS3_EEFbhxEED2Ev",
      "__ZNSt3__210__function6__funcIZN17monero_fork_rules22make_use_fork_rules_fnEhEUlhxE_NS_9allocatorIS3_EEFbhxEED0Ev",
      "__ZNSt3__210__function6__funcIZN17monero_fork_rules22make_use_fork_rules_fnEhEUlhxE_NS_9allocatorIS3_EEFbhxEE7destroyEv",
      "__ZNSt3__210__function6__funcIZN17monero_fork_rules22make_use_fork_rules_fnEhEUlhxE_NS_9allocatorIS3_EEFbhxEE18destroy_deallocateEv",
      "__ZNSt3__219basic_istringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev",
      "__ZNSt3__219basic_istringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED0Ev",
      "__ZTv0_n12_NSt3__219basic_istringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev",
      "__ZTv0_n12_NSt3__219basic_istringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED0Ev",
      "__ZN5tools5error17wallet_error_baseISt13runtime_errorED2Ev",
      "__ZN5tools5error17wallet_error_baseISt13runtime_errorED0Ev",
      "__ZN5tools5error21wallet_internal_errorD2Ev",
      "__ZN5tools5error21wallet_internal_errorD0Ev",
      "__ZN5tools5error17wallet_error_baseISt11logic_errorED2Ev",
      "__ZN5tools5error17wallet_error_baseISt11logic_errorED0Ev",
      "__ZN5tools5error16invalid_priorityD2Ev",
      "__ZN5tools5error16invalid_priorityD0Ev",
      "__ZN10cryptonote11transactionD2Ev",
      "__ZN10cryptonote11transactionD0Ev",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_7bad_getEEEED1Ev",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_7bad_getEEEED0Ev",
      "__ZNK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_7bad_getEEEE7rethrowEv",
      "__ZThn4_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_7bad_getEEEED1Ev",
      "__ZThn4_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_7bad_getEEEED0Ev",
      "__ZTv0_n16_NK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_7bad_getEEEE7rethrowEv",
      "__ZTv0_n20_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_7bad_getEEEED1Ev",
      "__ZTv0_n20_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_7bad_getEEEED0Ev",
      "__ZN5boost16exception_detail19error_info_injectorINS_7bad_getEED2Ev",
      "__ZN5boost16exception_detail19error_info_injectorINS_7bad_getEED0Ev",
      "__ZThn4_N5boost16exception_detail19error_info_injectorINS_7bad_getEED1Ev",
      "__ZThn4_N5boost16exception_detail19error_info_injectorINS_7bad_getEED0Ev",
      "__ZN5boost7bad_getD2Ev",
      "__ZN5boost7bad_getD0Ev",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_16bad_lexical_castEEEED1Ev",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_16bad_lexical_castEEEED0Ev",
      "__ZNK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_16bad_lexical_castEEEE7rethrowEv",
      "__ZThn12_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_16bad_lexical_castEEEED1Ev",
      "__ZThn12_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_16bad_lexical_castEEEED0Ev",
      "__ZTv0_n16_NK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_16bad_lexical_castEEEE7rethrowEv",
      "__ZTv0_n20_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_16bad_lexical_castEEEED1Ev",
      "__ZTv0_n20_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_16bad_lexical_castEEEED0Ev",
      "__ZN5boost16exception_detail19error_info_injectorINS_16bad_lexical_castEED2Ev",
      "__ZN5boost16exception_detail19error_info_injectorINS_16bad_lexical_castEED0Ev",
      "__ZThn12_N5boost16exception_detail19error_info_injectorINS_16bad_lexical_castEED1Ev",
      "__ZThn12_N5boost16exception_detail19error_info_injectorINS_16bad_lexical_castEED0Ev",
      "__ZN5boost16bad_lexical_castD2Ev",
      "__ZN5boost16bad_lexical_castD0Ev",
      "__ZN5boost6system12system_errorD2Ev",
      "__ZN5boost6system12system_errorD0Ev",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_10lock_errorEEEED1Ev",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_10lock_errorEEEED0Ev",
      "__ZNK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_10lock_errorEEEE7rethrowEv",
      "__ZThn28_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_10lock_errorEEEED1Ev",
      "__ZThn28_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_10lock_errorEEEED0Ev",
      "__ZTv0_n16_NK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_10lock_errorEEEE7rethrowEv",
      "__ZTv0_n20_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_10lock_errorEEEED1Ev",
      "__ZTv0_n20_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_10lock_errorEEEED0Ev",
      "__ZN5boost16exception_detail19error_info_injectorINS_10lock_errorEED2Ev",
      "__ZN5boost16exception_detail19error_info_injectorINS_10lock_errorEED0Ev",
      "__ZThn28_N5boost16exception_detail19error_info_injectorINS_10lock_errorEED1Ev",
      "__ZThn28_N5boost16exception_detail19error_info_injectorINS_10lock_errorEED0Ev",
      "__ZN5boost10lock_errorD2Ev",
      "__ZN5boost10lock_errorD0Ev",
      "__ZN5boost16thread_exceptionD2Ev",
      "__ZN5boost16thread_exceptionD0Ev",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_21thread_resource_errorEEEED1Ev",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_21thread_resource_errorEEEED0Ev",
      "__ZNK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_21thread_resource_errorEEEE7rethrowEv",
      "__ZThn28_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_21thread_resource_errorEEEED1Ev",
      "__ZThn28_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_21thread_resource_errorEEEED0Ev",
      "__ZTv0_n16_NK5boost16exception_detail10clone_implINS0_19error_info_injectorINS_21thread_resource_errorEEEE7rethrowEv",
      "__ZTv0_n20_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_21thread_resource_errorEEEED1Ev",
      "__ZTv0_n20_N5boost16exception_detail10clone_implINS0_19error_info_injectorINS_21thread_resource_errorEEEED0Ev",
      "__ZN5boost16exception_detail19error_info_injectorINS_21thread_resource_errorEED2Ev",
      "__ZN5boost16exception_detail19error_info_injectorINS_21thread_resource_errorEED0Ev",
      "__ZThn28_N5boost16exception_detail19error_info_injectorINS_21thread_resource_errorEED1Ev",
      "__ZThn28_N5boost16exception_detail19error_info_injectorINS_21thread_resource_errorEED0Ev",
      "__ZN5boost21thread_resource_errorD2Ev",
      "__ZN5boost21thread_resource_errorD0Ev",
      "__ZN5boost6detail18sp_counted_impl_pdIPN6crypto7rs_commEPFvPvEED2Ev",
      "__ZN5boost6detail18sp_counted_impl_pdIPN6crypto7rs_commEPFvPvEED0Ev",
      "__ZN5boost6detail18sp_counted_impl_pdIPN6crypto7rs_commEPFvPvEE7disposeEv",
      "__ZN2hw4core14device_defaultD2Ev",
      "__ZN2hw4core14device_defaultD0Ev",
      "__ZN2hw4core14device_default4lockEv",
      "__ZN2hw4core14device_default6unlockEv",
      "__ZN2hw6deviceD2Ev",
      "__ZN2hw6deviceD0Ev",
      "__ZNSt3__220__shared_ptr_pointerIPN3rct18straus_cached_dataENS_14default_deleteIS2_EENS_9allocatorIS2_EEED2Ev",
      "__ZNSt3__220__shared_ptr_pointerIPN3rct18straus_cached_dataENS_14default_deleteIS2_EENS_9allocatorIS2_EEED0Ev",
      "__ZNSt3__220__shared_ptr_pointerIPN3rct18straus_cached_dataENS_14default_deleteIS2_EENS_9allocatorIS2_EEE16__on_zero_sharedEv",
      "__ZNSt3__220__shared_ptr_pointerIPN3rct18straus_cached_dataENS_14default_deleteIS2_EENS_9allocatorIS2_EEE21__on_zero_shared_weakEv",
      "__ZNSt3__220__shared_ptr_pointerIPN3rct21pippenger_cached_dataENS_14default_deleteIS2_EENS_9allocatorIS2_EEED2Ev",
      "__ZNSt3__220__shared_ptr_pointerIPN3rct21pippenger_cached_dataENS_14default_deleteIS2_EENS_9allocatorIS2_EEED0Ev",
      "__ZNSt3__220__shared_ptr_pointerIPN3rct21pippenger_cached_dataENS_14default_deleteIS2_EENS_9allocatorIS2_EEE16__on_zero_sharedEv",
      "__ZNSt3__220__shared_ptr_pointerIPN3rct21pippenger_cached_dataENS_14default_deleteIS2_EENS_9allocatorIS2_EEE21__on_zero_shared_weakEv",
      "__ZN8Language10EnglishOldD2Ev",
      "__ZN8Language10EnglishOldD0Ev",
      "__ZN8Language4BaseD2Ev",
      "__ZN8Language4BaseD0Ev",
      "__ZN8Language6LojbanD2Ev",
      "__ZN8Language6LojbanD0Ev",
      "__ZN8Language9EsperantoD2Ev",
      "__ZN8Language9EsperantoD0Ev",
      "__ZN8Language7RussianD2Ev",
      "__ZN8Language7RussianD0Ev",
      "__ZN8Language8JapaneseD2Ev",
      "__ZN8Language8JapaneseD0Ev",
      "__ZN8Language10PortugueseD2Ev",
      "__ZN8Language10PortugueseD0Ev",
      "__ZN8Language7ItalianD2Ev",
      "__ZN8Language7ItalianD0Ev",
      "__ZN8Language6GermanD2Ev",
      "__ZN8Language6GermanD0Ev",
      "__ZN8Language7SpanishD2Ev",
      "__ZN8Language7SpanishD0Ev",
      "__ZN8Language6FrenchD2Ev",
      "__ZN8Language6FrenchD0Ev",
      "__ZN8Language5DutchD2Ev",
      "__ZN8Language5DutchD0Ev",
      "__ZN8Language7EnglishD2Ev",
      "__ZN8Language7EnglishD0Ev",
      "__ZN8Language18Chinese_SimplifiedD2Ev",
      "__ZN8Language18Chinese_SimplifiedD0Ev",
      "__ZN5boost6detail17sp_counted_impl_pIN4epee10misc_utils14call_befor_dieIZN6crypto13ElectrumWords14words_to_bytesERKNS2_15wipeable_stringERS7_mbRNSt3__212basic_stringIcNSB_11char_traitsIcEENSB_9allocatorIcEEEEE3__0EEED2Ev",
      "__ZN5boost6detail17sp_counted_impl_pIN4epee10misc_utils14call_befor_dieIZN6crypto13ElectrumWords14words_to_bytesERKNS2_15wipeable_stringERS7_mbRNSt3__212basic_stringIcNSB_11char_traitsIcEENSB_9allocatorIcEEEEE3__0EEED0Ev",
      "__ZN5boost6detail17sp_counted_impl_pIN4epee10misc_utils14call_befor_dieIZN6crypto13ElectrumWords14words_to_bytesERKNS2_15wipeable_stringERS7_mbRNSt3__212basic_stringIcNSB_11char_traitsIcEENSB_9allocatorIcEEEEE3__0EEE7disposeEv",
      "__ZN4epee10misc_utils14call_befor_dieIZN6crypto13ElectrumWords14words_to_bytesERKNS_15wipeable_stringERS4_mbRNSt3__212basic_stringIcNS8_11char_traitsIcEENS8_9allocatorIcEEEEE3__0ED2Ev",
      "__ZN4epee10misc_utils14call_befor_dieIZN6crypto13ElectrumWords14words_to_bytesERKNS_15wipeable_stringERS4_mbRNSt3__212basic_stringIcNS8_11char_traitsIcEENS8_9allocatorIcEEEEE3__0ED0Ev",
      "__ZN4epee10misc_utils19call_befor_die_baseD2Ev",
      "__ZN4epee10misc_utils19call_befor_die_baseD0Ev",
      "__ZN5boost6system14error_categoryD2Ev",
      "__ZN5boost6system6detail22generic_error_categoryD0Ev",
      "__ZN5boost6system14error_categoryD0Ev",
      "__ZNSt3__214error_categoryD2Ev",
      "__ZN5boost6system14error_category12std_categoryD0Ev",
      "__ZNSt3__217bad_function_callD2Ev",
      "__ZNSt3__217bad_function_callD0Ev",
      "__ZNSt3__28ios_baseD2Ev",
      "__ZNSt3__28ios_baseD0Ev",
      "__ZNSt3__215basic_streambufIcNS_11char_traitsIcEEED2Ev",
      "__ZNSt3__215basic_streambufIcNS_11char_traitsIcEEED0Ev",
      "__ZNSt3__215basic_streambufIwNS_11char_traitsIwEEED2Ev",
      "__ZNSt3__215basic_streambufIwNS_11char_traitsIwEEED0Ev",
      "__ZNSt3__213basic_istreamIwNS_11char_traitsIwEEED1Ev",
      "__ZNSt3__213basic_istreamIwNS_11char_traitsIwEEED0Ev",
      "__ZTv0_n12_NSt3__213basic_istreamIwNS_11char_traitsIwEEED1Ev",
      "__ZTv0_n12_NSt3__213basic_istreamIwNS_11char_traitsIwEEED0Ev",
      "__ZNSt3__213basic_ostreamIwNS_11char_traitsIwEEED1Ev",
      "__ZNSt3__213basic_ostreamIwNS_11char_traitsIwEEED0Ev",
      "__ZTv0_n12_NSt3__213basic_ostreamIwNS_11char_traitsIwEEED1Ev",
      "__ZTv0_n12_NSt3__213basic_ostreamIwNS_11char_traitsIwEEED0Ev",
      "__ZNSt3__219__iostream_categoryD0Ev",
      "__ZNSt3__28ios_base7failureD2Ev",
      "__ZNSt3__28ios_base7failureD0Ev",
      "__ZNSt3__211__stdoutbufIwED0Ev",
      "__ZNSt3__211__stdoutbufIcED0Ev",
      "__ZNSt3__210__stdinbufIwED0Ev",
      "__ZNSt3__210__stdinbufIcED0Ev",
      "__ZNSt3__27collateIcED2Ev",
      "__ZNSt3__27collateIcED0Ev",
      "__ZNSt3__26locale5facet16__on_zero_sharedEv",
      "__ZNSt3__27collateIwED2Ev",
      "__ZNSt3__27collateIwED0Ev",
      "__ZNSt3__27num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED2Ev",
      "__ZNSt3__27num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev",
      "__ZNSt3__27num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED2Ev",
      "__ZNSt3__27num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev",
      "__ZNSt3__27num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED2Ev",
      "__ZNSt3__27num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev",
      "__ZNSt3__27num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED2Ev",
      "__ZNSt3__27num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev",
      "__ZNSt3__28time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED2Ev",
      "__ZNSt3__28time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev",
      "__ZNSt3__28time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED2Ev",
      "__ZNSt3__28time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev",
      "__ZNSt3__28time_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED2Ev",
      "__ZNSt3__28time_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev",
      "__ZNSt3__28time_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED2Ev",
      "__ZNSt3__28time_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev",
      "__ZNSt3__210moneypunctIcLb0EED2Ev",
      "__ZNSt3__210moneypunctIcLb0EED0Ev",
      "__ZNSt3__210moneypunctIcLb1EED2Ev",
      "__ZNSt3__210moneypunctIcLb1EED0Ev",
      "__ZNSt3__210moneypunctIwLb0EED2Ev",
      "__ZNSt3__210moneypunctIwLb0EED0Ev",
      "__ZNSt3__210moneypunctIwLb1EED2Ev",
      "__ZNSt3__210moneypunctIwLb1EED0Ev",
      "__ZNSt3__29money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED2Ev",
      "__ZNSt3__29money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev",
      "__ZNSt3__29money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED2Ev",
      "__ZNSt3__29money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev",
      "__ZNSt3__29money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED2Ev",
      "__ZNSt3__29money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev",
      "__ZNSt3__29money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED2Ev",
      "__ZNSt3__29money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev",
      "__ZNSt3__28messagesIcED2Ev",
      "__ZNSt3__28messagesIcED0Ev",
      "__ZNSt3__28messagesIwED2Ev",
      "__ZNSt3__28messagesIwED0Ev",
      "__ZNSt3__26locale5facetD2Ev",
      "__ZNSt3__216__narrow_to_utf8ILm32EED0Ev",
      "__ZNSt3__217__widen_from_utf8ILm32EED0Ev",
      "__ZNSt3__27codecvtIwc11__mbstate_tED2Ev",
      "__ZNSt3__27codecvtIwc11__mbstate_tED0Ev",
      "__ZNSt3__26locale5__impD2Ev",
      "__ZNSt3__26locale5__impD0Ev",
      "__ZNSt3__25ctypeIcED2Ev",
      "__ZNSt3__25ctypeIcED0Ev",
      "__ZNSt3__28numpunctIcED2Ev",
      "__ZNSt3__28numpunctIcED0Ev",
      "__ZNSt3__28numpunctIwED2Ev",
      "__ZNSt3__28numpunctIwED0Ev",
      "__ZNSt3__26locale5facetD0Ev",
      "__ZNSt3__25ctypeIwED0Ev",
      "__ZNSt3__27codecvtIcc11__mbstate_tED0Ev",
      "__ZNSt3__27codecvtIDsc11__mbstate_tED0Ev",
      "__ZNSt3__27codecvtIDic11__mbstate_tED0Ev",
      "__ZNSt3__224__generic_error_categoryD0Ev",
      "__ZNSt3__223__system_error_categoryD0Ev",
      "__ZNSt3__212system_errorD2Ev",
      "__ZNSt3__212system_errorD0Ev",
      "__ZN10__cxxabiv116__shim_type_infoD2Ev",
      "__ZN10__cxxabiv117__class_type_infoD0Ev",
      "__ZNK10__cxxabiv116__shim_type_info5noop1Ev",
      "__ZNK10__cxxabiv116__shim_type_info5noop2Ev",
      "__ZN10__cxxabiv120__si_class_type_infoD0Ev",
      "__ZNSt9bad_allocD2Ev",
      "__ZNSt9bad_allocD0Ev",
      "__ZNSt9exceptionD2Ev",
      "__ZNSt9exceptionD0Ev",
      "__ZNSt13bad_exceptionD0Ev",
      "__ZNSt11logic_errorD2Ev",
      "__ZNSt11logic_errorD0Ev",
      "__ZNSt13runtime_errorD2Ev",
      "__ZNSt13runtime_errorD0Ev",
      "__ZNSt16invalid_argumentD0Ev",
      "__ZNSt12length_errorD0Ev",
      "__ZNSt12out_of_rangeD0Ev",
      "__ZNSt11range_errorD0Ev",
      "__ZNSt14overflow_errorD0Ev",
      "__ZNSt8bad_castD2Ev",
      "__ZNSt8bad_castD0Ev",
      "__ZNSt10bad_typeidD2Ev",
      "__ZNSt10bad_typeidD0Ev",
      "__ZN10__cxxabiv123__fundamental_type_infoD0Ev",
      "__ZN10__cxxabiv119__pointer_type_infoD0Ev",
      "__ZN10__cxxabiv120__function_type_infoD0Ev",
      "__ZN10__cxxabiv121__vmi_class_type_infoD0Ev",
      "__ZN18emscr_async_bridge10send_fundsERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN18emscr_async_bridge27send_cb_I__got_unspent_outsERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN18emscr_async_bridge27send_cb_II__got_random_outsERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN18emscr_async_bridge25send_cb_III__submitted_txERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN5boost16exception_detail12refcount_ptrINS0_20error_info_containerEE7releaseEv",
      "__ZN5boost6detail15sp_counted_base7releaseEv",
      "__ZN19serial_bridge_utilsL27ret_json_key__any__err_codeEv",
      "__ZN19serial_bridge_utilsL26ret_json_key__any__err_msgEv",
      "__ZN19serial_bridge_utilsL37ret_json_key__send__spendable_balanceEv",
      "__ZN19serial_bridge_utilsL36ret_json_key__send__required_balanceEv",
      "__ZN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEEC2Ev",
      "__ZN5boost15throw_exceptionINS_16exception_detail19error_info_injectorINS_13property_tree14ptree_bad_pathEEEEEvRKT_",
      "__ZN5boost15throw_exceptionINS_16exception_detail19error_info_injectorINS_13property_tree14ptree_bad_dataEEEEEvRKT_",
      "__ZN19serial_bridge_utilsL28ret_json_key__send__used_feeEv",
      "__ZN19serial_bridge_utilsL30ret_json_key__send__total_sentEv",
      "__ZN19serial_bridge_utilsL25ret_json_key__send__mixinEv",
      "__ZN19serial_bridge_utilsL36ret_json_key__send__final_payment_idEv",
      "__ZN19serial_bridge_utilsL40ret_json_key__send__serialized_signed_txEv",
      "__ZN19serial_bridge_utilsL27ret_json_key__send__tx_hashEv",
      "__ZN19serial_bridge_utilsL26ret_json_key__send__tx_keyEv",
      "__ZN19serial_bridge_utilsL30ret_json_key__send__tx_pub_keyEv",
      "__Z36_delete_and_remove_heap_vals_ptr_forRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__ZN5tools5error15throw_wallet_exINS0_21wallet_internal_errorEJA42_cEEEvONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEDpRKT0_",
      "__ZN5boost15throw_exceptionINS_16exception_detail19error_info_injectorINS_13property_tree11json_parser17json_parser_errorEEEEEvRKT_",
      "__ZNSt3__28ios_base33__set_badbit_and_consider_rethrowEv",
      "__ZN4epee12string_tools9trim_leftERNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE",
      "__ZN4epee12string_tools10trim_rightERNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE",
      "__ZN5tools5error15throw_wallet_exINS0_21wallet_internal_errorEJA56_cEEEvONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEDpRKT0_",
      "__ZN18emscr_async_bridge34_reenterable_construct_and_send_txERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN5tools5error15throw_wallet_exINS0_21wallet_internal_errorEJA22_cEEEvONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEDpRKT0_",
      "__ZN5tools5error15throw_wallet_exINS0_21wallet_internal_errorEJA26_cEEEvONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEDpRKT0_",
      "__ZN5tools5error15throw_wallet_exINS0_21wallet_internal_errorEJA38_cEEEvONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEDpRKT0_",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEm",
      "__ZN5tools5error15throw_wallet_exINS0_21wallet_internal_errorEJA67_cEEEvONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEDpRKT0_",
      "__ZN5boost8optionalINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEaSIRA52_KcEENS_9enable_ifINS_15optional_detail30is_optional_val_init_candidateIS7_T_EERS8_E4typeEOSG_",
      "__ZN5tools5error15throw_wallet_exINS0_16invalid_priorityEJEEEvONSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEDpRKT0_",
      "__ZN5tools5error15throw_wallet_exINS0_21wallet_internal_errorEJA60_cEEEvONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEDpRKT0_",
      "__ZN5tools5error15throw_wallet_exINS0_21wallet_internal_errorEJA28_cEEEvONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEDpRKT0_",
      "__ZN5tools5error15throw_wallet_exINS0_21wallet_internal_errorEJA33_cEEEvONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEDpRKT0_",
      "__ZN5boost7variantIN10cryptonote8txin_genEJNS1_14txin_to_scriptENS1_18txin_to_scripthashENS1_11txin_to_keyEEE22internal_apply_visitorINS_6detail7variant9destroyerEEENT_11result_typeERSB_",
      "__ZN5boost7variantIN10cryptonote15txout_to_scriptEJNS1_19txout_to_scripthashENS1_12txout_to_keyEEE22internal_apply_visitorINS_6detail7variant9destroyerEEENT_11result_typeERSA_",
      "__ZN5boost17value_initializedIN10cryptonote20tx_destination_entryEEC2Ev",
      "__ZN10cryptonote12account_baseC2Ev",
      "__ZN10cryptonote11transactionC2Ev",
      "__ZN5tools5error15throw_wallet_exINS0_21wallet_internal_errorEJA55_cEEEvONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEDpRKT0_",
      "__ZN5boost17enable_error_infoINS_7bad_getEEENS_16exception_detail29enable_error_info_return_typeIT_E4typeERKS4_",
      "__ZN5tools5error15throw_wallet_exINS0_21wallet_internal_errorEJA34_cEEEvONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEDpRKT0_",
      "__ZN5boost8optionalINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEaSIRA34_KcEENS_9enable_ifINS_15optional_detail30is_optional_val_init_candidateIS7_T_EERS8_E4typeEOSG_",
      "__ZN5boost8optionalINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEaSIRA28_KcEENS_9enable_ifINS_15optional_detail30is_optional_val_init_candidateIS7_T_EERS8_E4typeEOSG_",
      "__ZN5boost8optionalINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEaSIRA13_KcEENS_9enable_ifINS_15optional_detail30is_optional_val_init_candidateIS7_T_EERS8_E4typeEOSG_",
      "__ZN5boost8optionalINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEaSIRA20_KcEENS_9enable_ifINS_15optional_detail30is_optional_val_init_candidateIS7_T_EERS8_E4typeEOSG_",
      "__ZN5boost8optionalINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEaSIRA36_KcEENS_9enable_ifINS_15optional_detail30is_optional_val_init_candidateIS7_T_EERS8_E4typeEOSG_",
      "__ZN5boost8optionalINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEaSIRA17_KcEENS_9enable_ifINS_15optional_detail30is_optional_val_init_candidateIS7_T_EERS8_E4typeEOSG_",
      "__ZN5boost8optionalINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEaSIRA31_KcEENS_9enable_ifINS_15optional_detail30is_optional_val_init_candidateIS7_T_EERS8_E4typeEOSG_",
      "__ZN5boost8optionalINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEaSIRA18_KcEENS_9enable_ifINS_15optional_detail30is_optional_val_init_candidateIS7_T_EERS8_E4typeEOSG_",
      "__ZN5boost8optionalINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEaSIRA45_KcEENS_9enable_ifINS_15optional_detail30is_optional_val_init_candidateIS7_T_EERS8_E4typeEOSG_",
      "__ZN19serial_bridge_utilsL26ret_json_key__isSubaddressEv",
      "__ZN19serial_bridge_utilsL32ret_json_key__pub_viewKey_stringEv",
      "__ZN19serial_bridge_utilsL33ret_json_key__pub_spendKey_stringEv",
      "__ZN19serial_bridge_utilsL30ret_json_key__paymentID_stringEv",
      "__ZN19serial_bridge_utilsL28ret_json_key__generic_retValEv",
      "__ZN22monero_paymentID_utils32new_short_plain_paymentID_stringEv",
      "__ZN5tools5error15throw_wallet_exINS0_21wallet_internal_errorEJA35_cEEEvONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEDpRKT0_",
      "__ZN19serial_bridge_utilsL29ret_json_key__mnemonic_stringEv",
      "__ZN19serial_bridge_utilsL31ret_json_key__mnemonic_languageEv",
      "__ZN19serial_bridge_utilsL29ret_json_key__sec_seed_stringEv",
      "__ZN19serial_bridge_utilsL28ret_json_key__address_stringEv",
      "__ZN19serial_bridge_utilsL32ret_json_key__sec_viewKey_stringEv",
      "__ZN19serial_bridge_utilsL33ret_json_key__sec_spendKey_stringEv",
      "__ZN19serial_bridge_utilsL21ret_json_key__isValidEv",
      "__ZN19serial_bridge_utilsL30ret_json_key__isInViewOnlyModeEv",
      "__ZN5tools5error15throw_wallet_exINS0_21wallet_internal_errorEJA19_cEEEvONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEDpRKT0_",
      "__ZN19serial_bridge_utilsL28ret_json_key__decodeRct_maskEv",
      "__ZN19serial_bridge_utilsL30ret_json_key__decodeRct_amountEv",
      "__ZN5boost13property_tree11json_parser6detail6parserINS2_18standard_callbacksINS0_11basic_ptreeINSt3__212basic_stringIcNS6_11char_traitsIcEENS6_9allocatorIcEEEESC_NS6_4lessISC_EEEEEENS2_8encodingIcEENS6_19istreambuf_iteratorIcS9_EESK_E11parse_valueEv",
      "__ZN5boost13property_tree11json_parser6detail6parserINS2_18standard_callbacksINS0_11basic_ptreeINSt3__212basic_stringIcNS6_11char_traitsIcEENS6_9allocatorIcEEEESC_NS6_4lessISC_EEEEEENS2_8encodingIcEENS6_19istreambuf_iteratorIcS9_EESK_E6finishEv",
      "__ZN19serial_bridge_utilsL26ret_json_key__any__err_msgEv_794",
      "__ZN10cryptonote12account_base8set_nullEv",
      "__ZN5boost7variantIN10cryptonote16tx_extra_paddingEJNS1_16tx_extra_pub_keyENS1_14tx_extra_nonceENS1_25tx_extra_merge_mining_tagENS1_28tx_extra_additional_pub_keysENS1_29tx_extra_mysterious_minergateEEE22internal_apply_visitorINS_6detail7variant9destroyerEEENT_11result_typeERSD_",
      "__ZN5boost15throw_exceptionINS_21thread_resource_errorEEEvRKT_",
      "__ZN5boost5mutex6unlockEv",
      "__ZN5boost15throw_exceptionINS_10lock_errorEEEvRKT_",
      "__ZN6cryptoL13random_scalarERNS_9ec_scalarE",
      "__ZN12_GLOBAL__N_111local_abortEPKc",
      "_free",
      "__ZN2hw4core12register_allERNSt3__23mapINS1_12basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEENS1_10unique_ptrINS_6deviceENS1_14default_deleteISA_EEEENS1_4lessIS8_EENS6_INS1_4pairIKS8_SD_EEEEEE",
      "__ZN2hw15device_registryC2Ev",
      "__ZN3rct5skGenERNS_3keyE",
      "__ZN3rct5skGenEv",
      "__ZN4epee15wipeable_string8pop_backEv",
      "__ZN8Language18Chinese_SimplifiedC2Ev",
      "__ZN8Language7EnglishC2Ev",
      "__ZN8Language5DutchC2Ev",
      "__ZN8Language6FrenchC2Ev",
      "__ZN8Language7SpanishC2Ev",
      "__ZN8Language6GermanC2Ev",
      "__ZN8Language7ItalianC2Ev",
      "__ZN8Language10PortugueseC2Ev",
      "__ZN8Language8JapaneseC2Ev",
      "__ZN8Language7RussianC2Ev",
      "__ZN8Language9EsperantoC2Ev",
      "__ZN8Language6LojbanC2Ev",
      "__ZN8Language10EnglishOldC2Ev",
      "__ZZN6logger7do_initEvEN3__08__invokeEi",
      "__ZNSt3__26locale2id6__initEv",
      "__ZNSt3__212__do_nothingEPv",
      "__ZNSt3__221__throw_runtime_errorEPKc",
      "__ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEm",
      "__ZNSt3__26vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lm28EEEE6resizeEm",
      "__ZNSt3__217__call_once_proxyINS_5tupleIJONS_12_GLOBAL__N_111__fake_bindEEEEEEvPv",
      "__ZNSt3__212_GLOBAL__N_112throw_helperISt12out_of_rangeEEvRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__ZNSt3__212_GLOBAL__N_112throw_helperISt16invalid_argumentEEvRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__ZN10__cxxabiv112_GLOBAL__N_19destruct_EPv",
      "__ZN10__cxxabiv112_GLOBAL__N_111string_pairC2ILm22EEERAT__Kc",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0"
    ];
    var debug_table_vii = [
      "0",
      "__ZNSt3__215basic_streambufIcNS_11char_traitsIcEEE5imbueERKNS_6localeE",
      "__ZNKSt3__210__function6__funcIPFbhxENS_9allocatorIS3_EES2_E7__cloneEPNS0_6__baseIS2_EE",
      "__ZNKSt3__210__function6__funcIZN17monero_fork_rules22make_use_fork_rules_fnEhEUlhxE_NS_9allocatorIS3_EEFbhxEE7__cloneEPNS0_6__baseIS6_EE",
      "__ZNK6logger9formatterIJRKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEE6do_logERNS1_13basic_ostreamIcS4_EE",
      "__ZNK6logger9formatterIJPKcS2_S2_EE6do_logERNSt3__213basic_ostreamIcNS4_11char_traitsIcEEEE",
      "__ZNK6logger9formatterIJPKciS2_mS2_iS2_iS2_iS2_S2_S2_EE6do_logERNSt3__213basic_ostreamIcNS4_11char_traitsIcEEEE",
      "__ZNK6logger9formatterIJRKyPKcmS4_EE6do_logERNSt3__213basic_ostreamIcNS6_11char_traitsIcEEEE",
      "__ZNK6logger9formatterIJPKcEE6do_logERNSt3__213basic_ostreamIcNS4_11char_traitsIcEEEE",
      "__ZNK6logger9formatterIJbPKcEE6do_logERNSt3__213basic_ostreamIcNS4_11char_traitsIcEEEE",
      "__ZNK6logger9formatterIJmPKcmS2_EE6do_logERNSt3__213basic_ostreamIcNS4_11char_traitsIcEEEE",
      "__ZNK6logger9formatterIJiPKchS2_EE6do_logERNSt3__213basic_ostreamIcNS4_11char_traitsIcEEEE",
      "__ZNK6logger9formatterIJRKyPKcS2_S4_S2_S4_S2_S4_EE6do_logERNSt3__213basic_ostreamIcNS6_11char_traitsIcEEEE",
      "__ZNK6logger9formatterIJPKcS2_EE6do_logERNSt3__213basic_ostreamIcNS4_11char_traitsIcEEEE",
      "__ZNK6logger9formatterIJPKcRKN4epee7mlockedIN5tools8scrubbedIN6crypto9ec_scalarEEEEES2_RKNS7_10public_keyES2_EE6do_logERNSt3__213basic_ostreamIcNSH_11char_traitsIcEEEE",
      "__ZNK6logger9formatterIJPKcRKyS2_S4_S2_EE6do_logERNSt3__213basic_ostreamIcNS6_11char_traitsIcEEEE",
      "__ZNK6logger9formatterIJRKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEPKcEE6do_logERNS1_13basic_ostreamIcS4_EE",
      "__ZNK6logger9formatterIJPKcmS2_mS2_EE6do_logERNSt3__213basic_ostreamIcNS4_11char_traitsIcEEEE",
      "__ZNK6logger9formatterIJPFRNSt3__213basic_ostreamIcNS1_11char_traitsIcEEEES6_ERKNS1_12basic_stringIcS4_NS1_9allocatorIcEEEES8_RKN6crypto4hashEPKcEE6do_logES6_",
      "__ZNK6logger9formatterIJRKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEPFRNS1_13basic_ostreamIcS4_EESC_ES9_SE_RKN6crypto4hashEPKcEE6do_logESC_",
      "__ZNK6logger9formatterIJRKN6crypto10public_keyEEE6do_logERNSt3__213basic_ostreamIcNS6_11char_traitsIcEEEE",
      "__ZNK6logger9formatterIJRKN6crypto10public_keyEPKcEE6do_logERNSt3__213basic_ostreamIcNS8_11char_traitsIcEEEE",
      "__ZNK6logger9formatterIJRKyPKcEE6do_logERNSt3__213basic_ostreamIcNS6_11char_traitsIcEEEE",
      "__ZNK6logger9formatterIJmPKcRKN6crypto10public_keyES2_EE6do_logERNSt3__213basic_ostreamIcNS8_11char_traitsIcEEEE",
      "__ZNK6logger9formatterIJbPKcRKyS2_EE6do_logERNSt3__213basic_ostreamIcNS6_11char_traitsIcEEEE",
      "__ZNK6logger9formatterIJRKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEPKcPFRNS1_13basic_ostreamIcS4_EESE_ES9_SB_SG_SB_mSB_iSB_EE6do_logESE_",
      "__ZNK6logger9formatterIJRKN6crypto5hash8EPKcEE6do_logERNSt3__213basic_ostreamIcNS8_11char_traitsIcEEEE",
      "__ZNK6logger9formatterIJPKcRKNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEES2_EE6do_logERNS3_13basic_ostreamIcS6_EE",
      "__ZNK2hw4core14device_default8get_nameEv",
      "__ZNK6logger9formatterIJPKcRKN6crypto10public_keyES2_mS2_RKNS3_14key_derivationES2_EE6do_logERNSt3__213basic_ostreamIcNSB_11char_traitsIcEEEE",
      "__ZNK6logger9formatterIJPKcmS2_EE6do_logERNSt3__213basic_ostreamIcNS4_11char_traitsIcEEEE",
      "__ZNK6logger9formatterIJRKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEPKcS9_SB_EE6do_logERNS1_13basic_ostreamIcS4_EE",
      "__ZNK6logger9formatterIJjPKcRKNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEES2_SB_EE6do_logERNS3_13basic_ostreamIcS6_EE",
      "__ZNSt3__215basic_streambufIwNS_11char_traitsIwEEE5imbueERKNS_6localeE",
      "__ZNSt3__211__stdoutbufIwE5imbueERKNS_6localeE",
      "__ZNSt3__211__stdoutbufIcE5imbueERKNS_6localeE",
      "__ZNSt3__210__stdinbufIwE5imbueERKNS_6localeE",
      "__ZNSt3__210__stdinbufIcE5imbueERKNS_6localeE",
      "__ZNKSt3__210moneypunctIcLb0EE11do_groupingEv",
      "__ZNKSt3__210moneypunctIcLb0EE14do_curr_symbolEv",
      "__ZNKSt3__210moneypunctIcLb0EE16do_positive_signEv",
      "__ZNKSt3__210moneypunctIcLb0EE16do_negative_signEv",
      "__ZNKSt3__210moneypunctIcLb0EE13do_pos_formatEv",
      "__ZNKSt3__210moneypunctIcLb0EE13do_neg_formatEv",
      "__ZNKSt3__210moneypunctIcLb1EE11do_groupingEv",
      "__ZNKSt3__210moneypunctIcLb1EE14do_curr_symbolEv",
      "__ZNKSt3__210moneypunctIcLb1EE16do_positive_signEv",
      "__ZNKSt3__210moneypunctIcLb1EE16do_negative_signEv",
      "__ZNKSt3__210moneypunctIcLb1EE13do_pos_formatEv",
      "__ZNKSt3__210moneypunctIcLb1EE13do_neg_formatEv",
      "__ZNKSt3__210moneypunctIwLb0EE11do_groupingEv",
      "__ZNKSt3__210moneypunctIwLb0EE14do_curr_symbolEv",
      "__ZNKSt3__210moneypunctIwLb0EE16do_positive_signEv",
      "__ZNKSt3__210moneypunctIwLb0EE16do_negative_signEv",
      "__ZNKSt3__210moneypunctIwLb0EE13do_pos_formatEv",
      "__ZNKSt3__210moneypunctIwLb0EE13do_neg_formatEv",
      "__ZNKSt3__210moneypunctIwLb1EE11do_groupingEv",
      "__ZNKSt3__210moneypunctIwLb1EE14do_curr_symbolEv",
      "__ZNKSt3__210moneypunctIwLb1EE16do_positive_signEv",
      "__ZNKSt3__210moneypunctIwLb1EE16do_negative_signEv",
      "__ZNKSt3__210moneypunctIwLb1EE13do_pos_formatEv",
      "__ZNKSt3__210moneypunctIwLb1EE13do_neg_formatEv",
      "__ZNKSt3__28messagesIcE8do_closeEl",
      "__ZNKSt3__28messagesIwE8do_closeEl",
      "__ZNKSt3__28numpunctIcE11do_groupingEv",
      "__ZNKSt3__28numpunctIcE11do_truenameEv",
      "__ZNKSt3__28numpunctIcE12do_falsenameEv",
      "__ZNKSt3__28numpunctIwE11do_groupingEv",
      "__ZNKSt3__28numpunctIwE11do_truenameEv",
      "__ZNKSt3__28numpunctIwE12do_falsenameEv",
      "__ZN19serial_bridge_utils27error_ret_json_from_messageERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN13serial_bridge14decode_addressERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN13serial_bridge13is_subaddressERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN13serial_bridge21is_integrated_addressERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN13serial_bridge22new_integrated_addressERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN13serial_bridge14new_payment_idERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN13serial_bridge20newly_created_walletERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN13serial_bridge19are_equal_mnemonicsERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN13serial_bridge26address_and_keys_from_seedERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN13serial_bridge18mnemonic_from_seedERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN13serial_bridge27seed_and_keys_from_mnemonicERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN13serial_bridge29validate_components_for_loginERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN13serial_bridge24estimated_tx_network_feeERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN13serial_bridge20estimate_rct_tx_sizeERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN13serial_bridge18generate_key_imageERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN13serial_bridge23generate_key_derivationERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN13serial_bridge17derive_public_keyERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN13serial_bridge28derive_subaddress_public_keyERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN13serial_bridge20derivation_to_scalarERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN13serial_bridge9decodeRctERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN13serial_bridge15decodeRctSimpleERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN13serial_bridge18encrypt_payment_idERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__Z10send_fundsRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z27send_cb_I__got_unspent_outsRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z27send_cb_II__got_random_outsRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z25send_cb_III__submitted_txRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z14decode_addressRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z13is_subaddressRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z21is_integrated_addressRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z22new_integrated_addressRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z14new_payment_idRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z20newly_created_walletRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z19are_equal_mnemonicsRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z18mnemonic_from_seedRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z27seed_and_keys_from_mnemonicRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z29validate_components_for_loginRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z26address_and_keys_from_seedRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z24estimated_tx_network_feeRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z20estimate_rct_tx_sizeRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z18generate_key_imageRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z23generate_key_derivationRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z17derive_public_keyRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z28derive_subaddress_public_keyRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z9decodeRctRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z15decodeRctSimpleRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z20derivation_to_scalarRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__Z18encrypt_payment_idRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__ZN5boost16exception_detail10clone_implINS0_10bad_alloc_EEC1ERKS2_",
      "__ZN5boost16exception_detail10clone_implINS0_10bad_alloc_EEC1ERKS3_",
      "__ZN5boost10shared_ptrIKNS_16exception_detail10clone_baseEEC2INS1_10clone_implINS1_10bad_alloc_EEEEEPT_",
      "__ZN5boost16exception_detail10clone_implINS0_14bad_exception_EEC1ERKS2_",
      "__ZN5boost16exception_detail10clone_implINS0_14bad_exception_EEC1ERKS3_",
      "__ZN5boost10shared_ptrIKNS_16exception_detail10clone_baseEEC2INS1_10clone_implINS1_14bad_exception_EEEEEPT_",
      "__ZN5boost16exception_detail10bad_alloc_C2ERKS1_",
      "__ZN5boost16exception_detail20copy_boost_exceptionEPNS_9exceptionEPKS1_",
      "__ZN5boost6detail20sp_pointer_constructIKNS_16exception_detail10clone_baseENS2_10clone_implINS2_10bad_alloc_EEEEEvPNS_10shared_ptrIT_EEPT0_RNS0_12shared_countE",
      "__ZN5boost16exception_detail12refcount_ptrINS0_20error_info_containerEEaSERKS3_",
      "__ZN5boost16exception_detail10clone_implINS0_10bad_alloc_EEC1ERKS3_NS3_9clone_tagE",
      "__ZN5boost16exception_detail14bad_exception_C2ERKS1_",
      "__ZN5boost6detail20sp_pointer_constructIKNS_16exception_detail10clone_baseENS2_10clone_implINS2_14bad_exception_EEEEEvPNS_10shared_ptrIT_EEPT0_RNS0_12shared_countE",
      "__ZN5boost16exception_detail10clone_implINS0_14bad_exception_EEC1ERKS3_NS3_9clone_tagE",
      "__ZN18emscr_async_bridge27send_app_handler__error_msgERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEES8_",
      "__ZN18emscr_async_bridge28send_app_handler__error_jsonERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEES8_",
      "__ZN5boost13property_tree11string_pathINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEENS0_13id_translatorIS8_EEEC2ERKS8_cSA_",
      "__ZN21monero_transfer_utilsL41err_msg_from_err_code__create_transactionENS_26CreateTransactionErrorCodeE",
      "__ZN19serial_bridge_utils18ret_json_from_rootERKN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEES9_NS3_4lessIS9_EEEE",
      "__ZN5boost11multi_index21multi_index_containerINSt3__24pairIKNS2_12basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEENS_13property_tree11basic_ptreeIS9_S9_NS2_4lessIS9_EEEEEENS0_10indexed_byINS0_9sequencedINS0_3tagIN4mpl_2naESL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_EEEENS0_18ordered_non_uniqueINSJ_INSF_4subs7by_nameESL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_EENS0_6memberISG_SA_XadL_ZNSG_5firstEEEEESE_EESL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_EENS7_ISG_EEEC2ERKNS_6tuples4consINSY_9null_typeENSZ_INSY_5tupleIST_SE_S10_S10_S10_S10_S10_S10_S10_S10_EES10_EEEERKSW_",
      "__ZNKSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEE3strEv",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEmc",
      "__ZN5boost13property_tree11string_pathINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEENS0_13id_translatorIS8_EEE6reduceEv",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC2ERKS5_",
      "__ZN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEEC2ERKSB_",
      "__ZN5boost13property_tree13id_translatorINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEE9get_valueERKS8_",
      "__ZN5boost11multi_index21multi_index_containerINSt3__24pairIKNS2_12basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEENS_13property_tree11basic_ptreeIS9_S9_NS2_4lessIS9_EEEEEENS0_10indexed_byINS0_9sequencedINS0_3tagIN4mpl_2naESL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_EEEENS0_18ordered_non_uniqueINSJ_INSF_4subs7by_nameESL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_EENS0_6memberISG_SA_XadL_ZNSG_5firstEEEEESE_EESL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_SL_EENS7_ISG_EEEC2ERKSX_",
      "__ZN5boost6detail9allocator9constructINSt3__24pairIKNS3_12basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEENS_13property_tree11basic_ptreeISA_SA_NS3_4lessISA_EEEEEEEEvPvRKT_",
      "__ZN5boost11multi_index6detail8copy_mapINS1_20sequenced_index_nodeINS1_18ordered_index_nodeINS1_19null_augment_policyENS1_15index_node_baseINSt3__24pairIKNS7_12basic_stringIcNS7_11char_traitsIcEENS7_9allocatorIcEEEENS_13property_tree11basic_ptreeISE_SE_NS7_4lessISE_EEEEEENSC_ISL_EEEEEEEESM_E5cloneEPSP_",
      "__ZNSt11logic_errorC2EPKc",
      "__ZN5boost13property_tree11ptree_errorC2ERKNSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEE",
      "__ZN5boost3anyC2INS_13property_tree11string_pathINSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEENS2_13id_translatorISA_EEEEEERKT_",
      "__ZN5boost17enable_error_infoINS_16exception_detail19error_info_injectorINS_13property_tree14ptree_bad_pathEEEEENS1_29enable_error_info_return_typeIT_E4typeERKS7_",
      "__ZN5boost24enable_current_exceptionINS_16exception_detail19error_info_injectorINS_13property_tree14ptree_bad_pathEEEEENS1_10clone_implIT_EERKS7_",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_pathEEEEC1ERKS6_NS6_9clone_tagE",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_pathEEEEC1ERKS6_",
      "__ZN5boost9exceptionC2ERKS0_",
      "__ZN5boost3anyC2ERKS0_",
      "__ZN5boost16exception_detail19error_info_injectorINS_13property_tree14ptree_bad_pathEEC2ERKS4_",
      "__ZNK5boost13property_tree11string_pathINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEENS0_13id_translatorIS8_EEE4dumpEv",
      "__ZN5boost3any6holderINS_13property_tree11string_pathINSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEENS2_13id_translatorISA_EEEEEC2ERKSD_",
      "__ZN5boost17enable_error_infoINS_16exception_detail19error_info_injectorINS_13property_tree14ptree_bad_dataEEEEENS1_29enable_error_info_return_typeIT_E4typeERKS7_",
      "__ZN5boost24enable_current_exceptionINS_16exception_detail19error_info_injectorINS_13property_tree14ptree_bad_dataEEEEENS1_10clone_implIT_EERKS7_",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_dataEEEEC1ERKS6_NS6_9clone_tagE",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree14ptree_bad_dataEEEEC1ERKS6_",
      "__ZN5boost16exception_detail19error_info_injectorINS_13property_tree14ptree_bad_dataEEC2ERKS4_",
      "__ZN5boost13property_tree16customize_streamIcNSt3__211char_traitsIcEEN21monero_transfer_utils26CreateTransactionErrorCodeEvE6insertERNS2_13basic_ostreamIcS4_EERKS6_",
      "__ZN5boost11multi_index6detail15sequenced_indexINS1_9nth_layerILi1ENSt3__24pairIKNS4_12basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEENS_13property_tree11basic_ptreeISB_SB_NS4_4lessISB_EEEEEENS0_10indexed_byINS0_9sequencedINS0_3tagIN4mpl_2naESN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_EEEENS0_18ordered_non_uniqueINSL_INSH_4subs7by_nameESN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_EENS0_6memberISI_SC_XadL_ZNSI_5firstEEEEESG_EESN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_SN_EENS9_ISI_EEEENS_3mpl7vector0ISN_EEEC2ERKNS_6tuples4consINS14_9null_typeENS15_INS14_5tupleISV_SG_S16_S16_S16_S16_S16_S16_S16_S16_EES16_EEEERKSY_",
      "__ZN5boost13property_tree16customize_streamIcNSt3__211char_traitsIcEEmvE6insertERNS2_13basic_ostreamIcS4_EERKm",
      "__ZN5boost13property_tree11string_pathINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEENS0_13id_translatorIS8_EEEC2EPKccSA_",
      "__ZanIJPKcS1_S1_EEvRKN6logger4infoERKNS2_6formatIJDpT_EEE",
      "__ZNSt3__26vectorIN21monero_transfer_utils15SpendableOutputENS_9allocatorIS2_EEEC2ERKS5_",
      "__ZL31send_app_handler__status_updateRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEN19monero_send_routine21SendFunds_ProcessStepE",
      "__ZN5boost13property_tree11json_parser10write_jsonINS0_11basic_ptreeINSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEESA_NS4_4lessISA_EEEEEEvRNS4_13basic_ostreamINT_8key_type10value_typeENS6_ISG_EEEERKSF_b",
      "__ZNK5tools5error17wallet_error_baseISt13runtime_errorE9to_stringEv",
      "__ZanIJRKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEEEEvRKN6logger4infoERKNS9_6formatIJDpT_EEE",
      "__ZNSt3__26vectorIN21monero_transfer_utils15SpendableOutputENS_9allocatorIS2_EEE8allocateEm",
      "__ZNSt3__212__hash_tableINS_17__hash_value_typeINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEP22Send_Task_AsyncContextEENS_22__unordered_map_hasherIS7_SA_NS_4hashIS7_EELb1EEENS_21__unordered_map_equalIS7_SA_NS_8equal_toIS7_EELb1EEENS5_ISA_EEE6rehashEm",
      "__ZN19monero_send_routineL38err_msg_from_err_code__send_funds_stepENS_21SendFunds_ProcessStepE",
      "__ZN5boost13property_tree11json_parser14create_escapesIcEENSt3__212basic_stringIT_NS3_11char_traitsIS5_EENS3_9allocatorIS5_EEEERKSA_",
      "__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE6sentryC2ERS3_",
      "__ZNSt3__28ios_base5clearEj",
      "__ZN5boost3anyC2INSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEEERKT_",
      "__ZN5boost3any6holderINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEEC2ERKS8_",
      "__ZN5boost17enable_error_infoINS_16exception_detail19error_info_injectorINS_13property_tree11json_parser17json_parser_errorEEEEENS1_29enable_error_info_return_typeIT_E4typeERKS8_",
      "__ZN5boost24enable_current_exceptionINS_16exception_detail19error_info_injectorINS_13property_tree11json_parser17json_parser_errorEEEEENS1_10clone_implIT_EERKS8_",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree11json_parser17json_parser_errorEEEEC1ERKS7_NS7_9clone_tagE",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_13property_tree11json_parser17json_parser_errorEEEEC1ERKS7_",
      "__ZN5boost16exception_detail19error_info_injectorINS_13property_tree11json_parser17json_parser_errorEEC2ERKS5_",
      "__ZN5boost13property_tree16customize_streamIcNSt3__211char_traitsIcEEbvE6insertERNS2_13basic_ostreamIcS4_EEb",
      "__ZN5boost13property_tree16customize_streamIcNSt3__211char_traitsIcEEN19monero_send_routine21SendFunds_ProcessStepEvE6insertERNS2_13basic_ostreamIcS4_EERKS6_",
      "__ZN5boost8optionalINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEC2ERKS8_",
      "__ZNSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEE3strERKNS_12basic_stringIcS2_S4_EE",
      "__ZN5boost13property_tree16customize_streamIcNSt3__211char_traitsIcEEbvE7extractERNS2_13basic_istreamIcS4_EERb",
      "__ZNSt3__28functionIFbhxEEC2ERKS2_",
      "__ZN5tools5error15throw_wallet_exINS0_21wallet_internal_errorEJA37_cEEEvONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEDpRKT0_",
      "__ZN19monero_send_routine32new__req_params__get_random_outsERNSt3__26vectorIN21monero_transfer_utils15SpendableOutputENS0_9allocatorIS3_EEEE",
      "__ZN19monero_send_routine32new__parsed_res__get_random_outsERKN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEES9_NS3_4lessIS9_EEEE",
      "__ZN5boost8optionalINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEaSIRS7_EENS_9enable_ifINS_7is_sameIS7_NS_5decayIT_E4typeEEERS8_E4typeEOSE_",
      "__ZN5boost8optionalINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEaSERKS8_",
      "__Z25send_app_handler__successRKNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKN19monero_send_routine25SendFunds_Success_RetValsE",
      "__ZN5boost8optionalINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEaSIRA16_KcEENS_9enable_ifINS_15optional_detail30is_optional_val_init_candidateIS7_T_EERS8_E4typeEOSG_",
      "__ZN4epee12string_tools10pod_to_hexIN6crypto10public_keyEEENSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEERKT_",
      "__ZN4epee12string_tools10pod_to_hexIN6crypto5hash8EEENSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEERKT_",
      "__ZNK5tools5error16invalid_priority9to_stringEv",
      "__ZN5tools5error15throw_wallet_exINS0_21wallet_internal_errorEJA58_cEEEvONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEDpRKT0_",
      "__ZN12_GLOBAL__N_116pop_random_valueIN21monero_transfer_utils15SpendableOutputEEET_RNSt3__26vectorIS3_NS4_9allocatorIS3_EEEE",
      "__ZNSt3__26vectorIN21monero_transfer_utils15SpendableOutputENS_9allocatorIS2_EEE21__push_back_slow_pathIS2_EEvOT_",
      "__ZN10cryptonote32set_payment_id_to_tx_extra_nonceERNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEERKN6crypto4hashE",
      "__ZN10cryptonote42set_encrypted_payment_id_to_tx_extra_nonceERNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEERKN6crypto5hash8E",
      "__ZNSt3__26vectorIN21monero_transfer_utils15SpendableOutputENS_9allocatorIS2_EEE6resizeEm",
      "__ZN5tools5error15throw_wallet_exINS0_21wallet_internal_errorEJA24_cEEEvONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEDpRKT0_",
      "__ZN5tools5error15throw_wallet_exINS0_21wallet_internal_errorEJA25_cEEEvONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEDpRKT0_",
      "__ZN10cryptonote29t_serializable_object_to_blobINS_11transactionEEENSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEERKT_",
      "__ZN10cryptonote20get_transaction_hashERKNS_11transactionE",
      "__ZN4epee12string_tools10pod_to_hexIN6crypto4hashEEENSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEERKT_",
      "__ZN10cryptonote10tx_to_blobERKNS_11transactionE",
      "__ZN4epee12string_tools21buff_to_hex_nodelimerERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE",
      "__ZN4epee12string_tools10pod_to_hexINS_7mlockedIN5tools8scrubbedIN6crypto9ec_scalarEEEEEEENSt3__212basic_stringIcNS9_11char_traitsIcEENS9_9allocatorIcEEEERKT_",
      "__ZN10cryptonote25get_tx_pub_key_from_extraERKNS_11transactionEm",
      "__ZN5boost8optionalIN10cryptonote11transactionEEaSIRS2_EENS_9enable_ifINS_7is_sameIS2_NS_5decayIT_E4typeEEERS3_E4typeEOS9_",
      "__ZNSt3__212__hash_tableINS_17__hash_value_typeIN6crypto10public_keyEN10cryptonote16subaddress_indexEEENS_22__unordered_map_hasherIS3_S6_NS_4hashIS3_EELb1EEENS_21__unordered_map_equalIS3_S6_NS_8equal_toIS3_EELb1EEENS_9allocatorIS6_EEE6rehashEm",
      "__ZN21monero_transfer_utils18RandomAmountOutputC2ERKS0_",
      "__ZanIJPKcEEvRKN6logger4infoERKNS2_6formatIJDpT_EEE",
      "__ZN12_GLOBAL__N_122_rct_hex_to_rct_commitERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEERN3rct3keyE",
      "__ZNSt3__26vectorINS_4pairIyN3rct5ctkeyEEENS_9allocatorIS4_EEE21__push_back_slow_pathIRKS4_EEvOT_",
      "__ZN10cryptonote37get_additional_tx_pub_keys_from_extraERKNSt3__26vectorIhNS0_9allocatorIhEEEE",
      "__ZN10cryptonote15tx_source_entryC2ERKS0_",
      "__ZNSt3__26vectorIN10cryptonote15tx_source_entryENS_9allocatorIS2_EEE21__push_back_slow_pathIRKS2_EEvOT_",
      "__ZN10cryptonote20tx_destination_entryC2ERKS0_",
      "__ZNSt3__26vectorIN10cryptonote20tx_destination_entryENS_9allocatorIS2_EEE21__push_back_slow_pathIRKS2_EEvOT_",
      "__ZNSt3__26vectorIhNS_9allocatorIhEEEC2ERKS3_",
      "__ZanIJbPKcEEvRKN6logger4infoERKNS2_6formatIJDpT_EEE",
      "__ZN5boost8optionalINSt3__26vectorIN4epee7mlockedIN5tools8scrubbedIN6crypto9ec_scalarEEEEENS1_9allocatorISA_EEEEEaSIRSD_EENS_9enable_ifINS_7is_sameISD_NS_5decayIT_E4typeEEERSE_E4typeEOSK_",
      "__ZN10cryptonote29t_serializable_object_to_blobINS_11transactionEEEbRKT_RNSt3__212basic_stringIcNS5_11char_traitsIcEENS5_9allocatorIcEEEE",
      "__ZNSt3__26vectorINS0_IN6crypto9signatureENS_9allocatorIS2_EEEENS3_IS5_EEEC2ERKS7_",
      "__ZN3rct6rctSigC2ERKS0_",
      "__ZNSt3__26vectorIN10cryptonote6tx_outENS_9allocatorIS2_EEEC2ERKS5_",
      "__ZNSt3__26vectorINS0_IN6crypto9signatureENS_9allocatorIS2_EEEENS3_IS5_EEE8allocateEm",
      "__ZN3rct14rctSigPrunableC2ERKS0_",
      "__ZNSt3__26vectorIN3rct3keyENS_9allocatorIS2_EEEC2ERKS5_",
      "__ZNSt3__26vectorIN3rct9ecdhTupleENS_9allocatorIS2_EEEC2ERKS5_",
      "__ZNSt3__26vectorIN3rct5ctkeyENS_9allocatorIS2_EEEC2ERKS5_",
      "__ZNSt3__26vectorIN3rct11BulletproofENS_9allocatorIS2_EEEC2ERKS5_",
      "__ZNSt3__26vectorIN3rct5mgSigENS_9allocatorIS2_EEEC2ERKS5_",
      "__ZNSt3__26vectorIN3rct8rangeSigENS_9allocatorIS2_EEE8allocateEm",
      "__ZNSt3__26vectorIN3rct11BulletproofENS_9allocatorIS2_EEE8allocateEm",
      "__ZNSt3__26vectorIN3rct5mgSigENS_9allocatorIS2_EEE8allocateEm",
      "__ZNSt3__26vectorIN3rct3keyENS_9allocatorIS2_EEE8allocateEm",
      "__ZNSt3__26vectorINS0_IN3rct3keyENS_9allocatorIS2_EEEENS3_IS5_EEE8allocateEm",
      "__ZNSt3__26vectorINS0_IN3rct5ctkeyENS_9allocatorIS2_EEEENS3_IS5_EEE8allocateEm",
      "__ZNSt3__26vectorIN3rct9ecdhTupleENS_9allocatorIS2_EEE8allocateEm",
      "__ZNSt3__26vectorIN3rct5ctkeyENS_9allocatorIS2_EEE8allocateEm",
      "__ZNSt3__26vectorIN6crypto9signatureENS_9allocatorIS2_EEE8allocateEm",
      "__ZNSt3__26vectorIN5boost7variantIN10cryptonote8txin_genEJNS3_14txin_to_scriptENS3_18txin_to_scripthashENS3_11txin_to_keyEEEENS_9allocatorIS8_EEE8allocateEm",
      "__ZNSt3__26vectorIN10cryptonote6tx_outENS_9allocatorIS2_EEE8allocateEm",
      "__ZNSt3__26vectorIhNS_9allocatorIhEEE8allocateEm",
      "__ZNSt3__26vectorIN6crypto10public_keyENS_9allocatorIS2_EEE8allocateEm",
      "__ZNSt3__26vectorIyNS_9allocatorIyEEE8allocateEm",
      "__ZN5boost24enable_current_exceptionINS_16exception_detail19error_info_injectorINS_7bad_getEEEEENS1_10clone_implIT_EERKS6_",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_7bad_getEEEEC1ERKS5_NS5_9clone_tagE",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_7bad_getEEEEC1ERKS5_",
      "__ZN5boost16exception_detail19error_info_injectorINS_7bad_getEEC2ERKS3_",
      "__ZN5tools5error15throw_wallet_exINS0_21wallet_internal_errorEJNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEEEEvOS9_DpRKT0_",
      "__ZZN12_GLOBAL__N_126_rct_hex_to_decrypted_maskERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEERKN4epee7mlockedIN5tools8scrubbedIN6crypto9ec_scalarEEEEERKNSD_10public_keyEyRN3rct3keyEENK3__1clEv",
      "__ZNSt3__26vectorIN6crypto10public_keyENS_9allocatorIS2_EEEC2ERKS5_",
      "__ZNSt3__26vectorIN4epee7mlockedIN5tools8scrubbedIN6crypto9ec_scalarEEEEENS_9allocatorIS8_EEE8allocateEm",
      "__ZNSt3__26vectorINS_4pairIyN3rct5ctkeyEEENS_9allocatorIS4_EEE8allocateEm",
      "__ZN19monero_wallet_utils24WalletDescriptionRetValsaSEOS0_",
      "__ZN4epee15wipeable_stringC2ERKS0_",
      "__ZN5boost8optionalIN19monero_wallet_utils17WalletDescriptionEEaSIS2_EENS_9enable_ifINS_7is_sameIS2_NS_5decayIT_E4typeEEERS3_E4typeEOS8_",
      "__ZN4epee15wipeable_stringC2ERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE",
      "__ZN5tools5error15throw_wallet_exINS0_21wallet_internal_errorEJA45_cEEEvONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEDpRKT0_",
      "__ZN5boost9algorithm8to_lowerINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEEEvRT_RKNS2_6localeE",
      "__ZNSt3__216istream_iteratorINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEcS3_lEC2ERKS7_",
      "__ZN5boost8optionalINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEaSIRA25_KcEENS_9enable_ifINS_15optional_detail30is_optional_val_init_candidateIS7_T_EERS8_E4typeEOSG_",
      "__ZN4epee12string_tools10pod_to_hexIN5tools8scrubbedIN19monero_wallet_utils19ec_nonscalar_16ByteEEEEENSt3__212basic_stringIcNS7_11char_traitsIcEENS7_9allocatorIcEEEERKT_",
      "__ZN5boost8optionalINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEaSIRA47_KcEENS_9enable_ifINS_15optional_detail30is_optional_val_init_candidateIS7_T_EERS8_E4typeEOSG_",
      "__ZN5boost8optionalIN4epee15wipeable_stringEEaSIRS2_EENS_9enable_ifINS_7is_sameIS2_NS_5decayIT_E4typeEEERS3_E4typeEOS9_",
      "__ZN19monero_wallet_utils26ComponentsFromSeed_RetValsaSEOS0_",
      "__ZN5boost8optionalIN19monero_wallet_utils18ComponentsFromSeedEEaSIS2_EENS_9enable_ifINS_7is_sameIS2_NS_5decayIT_E4typeEEERS3_E4typeEOS8_",
      "__ZN5boost8optionalINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEaSIRA32_KcEENS_9enable_ifINS_15optional_detail30is_optional_val_init_candidateIS7_T_EERS8_E4typeEOSG_",
      "__ZN5boost8optionalINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEaSIRA46_KcEENS_9enable_ifINS_15optional_detail30is_optional_val_init_candidateIS7_T_EERS8_E4typeEOSG_",
      "__ZN19monero_wallet_utils17WalletDescriptionC2ERKS0_",
      "__ZN4epee12string_tools10pod_to_hexIN6crypto9key_imageEEENSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEERKT_",
      "__ZNSt3__26vectorIN3rct9ecdhTupleENS_9allocatorIS2_EEE21__push_back_slow_pathIRKS2_EEvOT_",
      "__ZNSt3__26vectorIN3rct5ctkeyENS_9allocatorIS2_EEE21__push_back_slow_pathIRKS2_EEvOT_",
      "__ZN4epee12string_tools10pod_to_hexIN3rct3keyEEENSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEERKT_",
      "__ZN4epee12string_tools10pod_to_hexIN6crypto14key_derivationEEENSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEERKT_",
      "__ZN4epee12string_tools10pod_to_hexIN6crypto9ec_scalarEEENSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEERKT_",
      "__ZN5boost13property_tree16customize_streamIcNSt3__211char_traitsIcEEjvE7extractERNS2_13basic_istreamIcS4_EERj",
      "__ZNSt3__26vectorINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEENS4_IS6_EEE21__push_back_slow_pathIS6_EEvOT_",
      "__ZNSt3__26vectorINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEENS4_IS6_EEEC2ERKS8_",
      "__ZNSt3__26vectorINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEENS4_IS6_EEE8allocateEm",
      "__ZN5boost8optionalINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEC2ERKS7_",
      "__ZN5boost8optionalINSt3__26vectorIN21monero_transfer_utils15SpendableOutputENS1_9allocatorIS4_EEEEEC2ERKS7_",
      "__ZN5boost13property_tree16customize_streamIcNSt3__211char_traitsIcEEhvE7extractERNS2_13basic_istreamIcS4_EERh",
      "__ZNSt3__26vectorIN21monero_transfer_utils18RandomAmountOutputENS_9allocatorIS2_EEE21__push_back_slow_pathIS2_EEvOT_",
      "__ZNSt3__26vectorIN21monero_transfer_utils19RandomAmountOutputsENS_9allocatorIS2_EEE21__push_back_slow_pathIS2_EEvOT_",
      "__ZN5boost8optionalINSt3__26vectorIN21monero_transfer_utils19RandomAmountOutputsENS1_9allocatorIS4_EEEEEC2ERKS7_",
      "__ZNSt3__26vectorIN21monero_transfer_utils19RandomAmountOutputsENS_9allocatorIS2_EEE8allocateEm",
      "__ZNSt3__26vectorIN21monero_transfer_utils18RandomAmountOutputENS_9allocatorIS2_EEE8allocateEm",
      "__ZN5boost13property_tree11json_parser9read_jsonINS0_11basic_ptreeINSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEESA_NS4_4lessISA_EEEEEEvRNS4_13basic_istreamINT_8key_type10value_typeENS6_ISG_EEEERSF_",
      "__ZN5boost13property_tree11json_parser6detail6parserINS2_18standard_callbacksINS0_11basic_ptreeINSt3__212basic_stringIcNS6_11char_traitsIcEENS6_9allocatorIcEEEESC_NS6_4lessISC_EEEEEENS2_8encodingIcEENS6_19istreambuf_iteratorIcS9_EESK_E11parse_errorEPKc",
      "__ZN5boost13property_tree11json_parser6detail18standard_callbacksINS0_11basic_ptreeINSt3__212basic_stringIcNS5_11char_traitsIcEENS5_9allocatorIcEEEESB_NS5_4lessISB_EEEEE12on_code_unitEc",
      "__ZNSt13runtime_errorC2EPKc",
      "__ZN10cryptonote29t_serializable_object_to_blobINS_22account_public_addressEEEbRKT_RNSt3__212basic_stringIcNS5_11char_traitsIcEENS5_9allocatorIcEEEE",
      "__ZN10cryptonote29t_serializable_object_to_blobINS_18integrated_addressEEEbRKT_RNSt3__212basic_stringIcNS5_11char_traitsIcEENS5_9allocatorIcEEEE",
      "__ZanIJRKyPKcS1_S3_S1_S3_S1_S3_EEvRKN6logger4infoERKNS4_6formatIJDpT_EEE",
      "__ZanIJmPKcmS1_EEvRKN6logger4infoERKNS2_6formatIJDpT_EEE",
      "__ZanIJiPKchS1_EEvRKN6logger4infoERKNS2_6formatIJDpT_EEE",
      "__ZN14binary_archiveILb0EEC2ERNSt3__213basic_istreamIcNS1_11char_traitsIcEEEE",
      "__ZN10cryptonote12account_keysaSERKS0_",
      "__ZN13serialization9serializeI14binary_archiveILb1EEN10cryptonote18transaction_prefixEEEbRT_RT0_",
      "__ZN5boost7variantIN10cryptonote15txout_to_scriptEJNS1_19txout_to_scripthashENS1_12txout_to_keyEEE22internal_apply_visitorINS_6detail7variant9move_intoEEENT_11result_typeERSA_",
      "__ZN5boost7variantIN10cryptonote15txout_to_scriptEJNS1_19txout_to_scripthashENS1_12txout_to_keyEEE14variant_assignEOS5_",
      "__ZN5boost7variantIN10cryptonote8txin_genEJNS1_14txin_to_scriptENS1_18txin_to_scripthashENS1_11txin_to_keyEEE22internal_apply_visitorINS_6detail7variant9move_intoEEENT_11result_typeERSB_",
      "__ZanIJPKcRKN4epee7mlockedIN5tools8scrubbedIN6crypto9ec_scalarEEEEES1_RKNS6_10public_keyES1_EEvRKN6logger4infoERKNSF_6formatIJDpT_EEE",
      "__ZNSt3__26vectorIN6crypto14key_derivationENS_9allocatorIS2_EEE21__push_back_slow_pathIRKS2_EEvOT_",
      "__ZN5boost12lexical_castINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEiEET_RKT0_",
      "__ZNSt13runtime_errorC2ERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "__ZN5boost17enable_error_infoINS_16bad_lexical_castEEENS_16exception_detail29enable_error_info_return_typeIT_E4typeERKS4_",
      "__ZN5boost24enable_current_exceptionINS_16exception_detail19error_info_injectorINS_16bad_lexical_castEEEEENS1_10clone_implIT_EERKS6_",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_16bad_lexical_castEEEEC1ERKS5_NS5_9clone_tagE",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_16bad_lexical_castEEEEC1ERKS5_",
      "__ZN5boost16exception_detail19error_info_injectorINS_16bad_lexical_castEEC2ERKS3_",
      "__ZanIJRKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEEPKcEEvRKN6logger4infoERKNSB_6formatIJDpT_EEE",
      "__ZN5boost7variantIN10cryptonote16tx_extra_paddingEJNS1_16tx_extra_pub_keyENS1_14tx_extra_nonceENS1_25tx_extra_merge_mining_tagENS1_28tx_extra_additional_pub_keysENS1_29tx_extra_mysterious_minergateEEEC2ERKS8_",
      "__ZNSt3__26vectorIN5boost7variantIN10cryptonote16tx_extra_paddingEJNS3_16tx_extra_pub_keyENS3_14tx_extra_nonceENS3_25tx_extra_merge_mining_tagENS3_28tx_extra_additional_pub_keysENS3_29tx_extra_mysterious_minergateEEEENS_9allocatorISA_EEE21__push_back_slow_pathIRKSA_EEvOT_",
      "__ZN5boost7variantIN10cryptonote16tx_extra_paddingEJNS1_16tx_extra_pub_keyENS1_14tx_extra_nonceENS1_25tx_extra_merge_mining_tagENS1_28tx_extra_additional_pub_keysENS1_29tx_extra_mysterious_minergateEEE22internal_apply_visitorINS_6detail7variant9move_intoEEENT_11result_typeERSD_",
      "__ZN5boost7variantIN10cryptonote16tx_extra_paddingEJNS1_16tx_extra_pub_keyENS1_14tx_extra_nonceENS1_25tx_extra_merge_mining_tagENS1_28tx_extra_additional_pub_keysENS1_29tx_extra_mysterious_minergateEEEaSIS4_EENS_9enable_ifINS_3mpl3or_INS_7is_sameIT_S8_EENS_6detail7variant29is_variant_constructible_fromIRKSE_NSB_6l_itemIN4mpl_5long_ILl6EEES2_NSL_INSN_ILl5EEES3_NSL_INSN_ILl4EEES4_NSL_INSN_ILl3EEES5_NSL_INSN_ILl2EEES6_NSL_INSN_ILl1EEES7_NSB_5l_endEEEEEEEEEEEEEEENSM_5bool_ILb0EEES13_S13_EERS8_E4typeESK_",
      "__ZN5boost7variantIN10cryptonote16tx_extra_paddingEJNS1_16tx_extra_pub_keyENS1_14tx_extra_nonceENS1_25tx_extra_merge_mining_tagENS1_28tx_extra_additional_pub_keysENS1_29tx_extra_mysterious_minergateEEEaSIS6_EENS_9enable_ifINS_3mpl3or_INS_7is_sameIT_S8_EENS_6detail7variant29is_variant_constructible_fromIRKSE_NSB_6l_itemIN4mpl_5long_ILl6EEES2_NSL_INSN_ILl5EEES3_NSL_INSN_ILl4EEES4_NSL_INSN_ILl3EEES5_NSL_INSN_ILl2EEES6_NSL_INSN_ILl1EEES7_NSB_5l_endEEEEEEEEEEEEEEENSM_5bool_ILb0EEES13_S13_EERS8_E4typeESK_",
      "__ZN5boost7variantIN10cryptonote16tx_extra_paddingEJNS1_16tx_extra_pub_keyENS1_14tx_extra_nonceENS1_25tx_extra_merge_mining_tagENS1_28tx_extra_additional_pub_keysENS1_29tx_extra_mysterious_minergateEEEaSIS7_EENS_9enable_ifINS_3mpl3or_INS_7is_sameIT_S8_EENS_6detail7variant29is_variant_constructible_fromIRKSE_NSB_6l_itemIN4mpl_5long_ILl6EEES2_NSL_INSN_ILl5EEES3_NSL_INSN_ILl4EEES4_NSL_INSN_ILl3EEES5_NSL_INSN_ILl2EEES6_NSL_INSN_ILl1EEES7_NSB_5l_endEEEEEEEEEEEEEEENSM_5bool_ILb0EEES13_S13_EERS8_E4typeESK_",
      "__ZN5boost7variantIN10cryptonote16tx_extra_paddingEJNS1_16tx_extra_pub_keyENS1_14tx_extra_nonceENS1_25tx_extra_merge_mining_tagENS1_28tx_extra_additional_pub_keysENS1_29tx_extra_mysterious_minergateEEE14variant_assignEOS8_",
      "__ZN5boost7variantIN10cryptonote16tx_extra_paddingEJNS1_16tx_extra_pub_keyENS1_14tx_extra_nonceENS1_25tx_extra_merge_mining_tagENS1_28tx_extra_additional_pub_keysENS1_29tx_extra_mysterious_minergateEEEC2IS6_EEOT_PNS_9enable_ifINS_3mpl3or_INSD_4and_INS_19is_rvalue_referenceISB_EENSD_4not_INS_8is_constISA_EEEENSI_INS_7is_sameISA_S8_EEEENS_6detail7variant29is_variant_constructible_fromISB_NSD_6l_itemIN4mpl_5long_ILl6EEES2_NSS_INSU_ILl5EEES3_NSS_INSU_ILl4EEES4_NSS_INSU_ILl3EEES5_NSS_INSU_ILl2EEES6_NSS_INSU_ILl1EEES7_NSD_5l_endEEEEEEEEEEEEEEENST_5bool_ILb1EEEEENSM_ISA_NS_18recursive_variant_EEENS19_ILb0EEES1E_S1E_EEvE4typeE",
      "__ZNSt3__26vectorIhNS_9allocatorIhEEE6resizeEm",
      "__ZNSt3__26vectorIhNS_9allocatorIhEEE7reserveEm",
      "__ZNSt3__26vectorIhNS_9allocatorIhEEE21__push_back_slow_pathIhEEvOT_",
      "__ZN5tools12write_varintINSt3__219ostreambuf_iteratorIcNS1_11char_traitsIcEEEEmEENS1_9enable_ifIXaasr3std11is_integralIT0_EE5valuesr3std11is_unsignedIS7_EE5valueEvE4typeEOT_S7_",
      "__ZN5boost17enable_error_infoINS_10lock_errorEEENS_16exception_detail29enable_error_info_return_typeIT_E4typeERKS4_",
      "__ZN5boost24enable_current_exceptionINS_16exception_detail19error_info_injectorINS_10lock_errorEEEEENS1_10clone_implIT_EERKS6_",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_10lock_errorEEEEC1ERKS5_NS5_9clone_tagE",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_10lock_errorEEEEC1ERKS5_",
      "__ZN5boost16exception_detail19error_info_injectorINS_10lock_errorEEC2ERKS3_",
      "__ZN5boost17enable_error_infoINS_21thread_resource_errorEEENS_16exception_detail29enable_error_info_return_typeIT_E4typeERKS4_",
      "__ZN5boost24enable_current_exceptionINS_16exception_detail19error_info_injectorINS_21thread_resource_errorEEEEENS1_10clone_implIT_EERKS6_",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_21thread_resource_errorEEEEC1ERKS5_NS5_9clone_tagE",
      "__ZN5boost16exception_detail10clone_implINS0_19error_info_injectorINS_21thread_resource_errorEEEEC1ERKS5_",
      "__ZN5boost16exception_detail19error_info_injectorINS_21thread_resource_errorEEC2ERKS3_",
      "__ZNSt3__212__hash_tableIN10cryptonote22account_public_addressENS_4hashIS2_EENS_8equal_toIS2_EENS_9allocatorIS2_EEE6rehashEm",
      "__ZanIJPKcmS1_mS1_EEvRKN6logger4infoERKNS2_6formatIJDpT_EEE",
      "__ZanIJRKN6crypto5hash8EPKcEEvRKN6logger4infoERKNS6_6formatIJDpT_EEE",
      "__ZN10cryptonote26remove_field_from_tx_extraERNSt3__26vectorIhNS0_9allocatorIhEEEERKSt9type_info",
      "__ZNSt3__26vectorIZN10cryptonote24construct_tx_with_tx_keyERKNS1_12account_keysERKNS_13unordered_mapIN6crypto10public_keyENS1_16subaddress_indexENS_4hashIS7_EENS_8equal_toIS7_EENS_9allocatorINS_4pairIKS7_S8_EEEEEERNS0_INS1_15tx_source_entryENSD_ISL_EEEERNS0_INS1_20tx_destination_entryENSD_ISP_EEEERKN5boost8optionalINS1_22account_public_addressEEENS0_IhNSD_IhEEEERNS1_11transactionEyRKN4epee7mlockedIN5tools8scrubbedINS6_9ec_scalarEEEEERKNS0_IS19_NSD_IS19_EEEEbRKN3rct9RCTConfigEPNS1G_12multisig_outEbE29input_generation_context_dataNSD_IS1M_EEE21__push_back_slow_pathIS1M_EEvOT_",
      "__ZanIJRKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEEPKcPFRNS0_13basic_ostreamIcS3_EESD_ES8_SA_SF_SA_mSA_iSA_EEvRKN6logger4infoERKNSG_6formatIJDpT_EEE",
      "__ZanIJbPKcRKyS1_EEvRKN6logger4infoERKNS4_6formatIJDpT_EEE",
      "__ZanIJmPKcRKN6crypto10public_keyES1_EEvRKN6logger4infoERKNS6_6formatIJDpT_EEE",
      "__ZNSt3__26vectorIyNS_9allocatorIyEEE21__push_back_slow_pathIRKyEEvOT_",
      "__ZN10cryptonote35absolute_output_offsets_to_relativeERKNSt3__26vectorIyNS0_9allocatorIyEEEE",
      "__ZN5boost7variantIN10cryptonote8txin_genEJNS1_14txin_to_scriptENS1_18txin_to_scripthashENS1_11txin_to_keyEEEC2IS5_EERT_PNS_9enable_ifINS_3mpl3or_INSB_4and_INSB_4not_INS_8is_constIS8_EEEENSE_INS_7is_sameIS8_S6_EEEENS_6detail7variant29is_variant_constructible_fromIS9_NSB_6l_itemIN4mpl_5long_ILl4EEES2_NSO_INSQ_ILl3EEES3_NSO_INSQ_ILl2EEES4_NSO_INSQ_ILl1EEES5_NSB_5l_endEEEEEEEEEEENSP_5bool_ILb1EEES12_EENSI_IS8_NS_18recursive_variant_EEENS11_ILb0EEES16_S16_EEvE4typeE",
      "__ZNSt3__26vectorIN5boost7variantIN10cryptonote8txin_genEJNS3_14txin_to_scriptENS3_18txin_to_scripthashENS3_11txin_to_keyEEEENS_9allocatorIS8_EEE21__push_back_slow_pathIS8_EEvOT_",
      "__ZNSt3__26vectorImNS_9allocatorImEEEC2Em",
      "__ZNSt3__26vectorImNS_9allocatorImEEEC2ERKS3_",
      "__ZN5tools17apply_permutationIZN10cryptonote24construct_tx_with_tx_keyERKNS1_12account_keysERKNSt3__213unordered_mapIN6crypto10public_keyENS1_16subaddress_indexENS5_4hashIS8_EENS5_8equal_toIS8_EENS5_9allocatorINS5_4pairIKS8_S9_EEEEEERNS5_6vectorINS1_15tx_source_entryENSE_ISN_EEEERNSM_INS1_20tx_destination_entryENSE_ISR_EEEERKN5boost8optionalINS1_22account_public_addressEEENSM_IhNSE_IhEEEERNS1_11transactionEyRKN4epee7mlockedINS_8scrubbedINS7_9ec_scalarEEEEERKNSM_IS1A_NSE_IS1A_EEEEbRKN3rct9RCTConfigEPNS1H_12multisig_outEbE3__1EEvNSM_ImNSE_ImEEEERKT_",
      "__ZN10cryptonote23add_tx_pub_key_to_extraERNS_11transactionERKN6crypto10public_keyE",
      "__ZanIJRKyPKcEEvRKN6logger4infoERKNS4_6formatIJDpT_EEE",
      "__ZN5boost7variantIN10cryptonote15txout_to_scriptEJNS1_19txout_to_scripthashENS1_12txout_to_keyEEEaSIS4_EENS_9enable_ifINS_3mpl3or_INS_7is_sameIT_S5_EENS_6detail7variant29is_variant_constructible_fromIRKSB_NS8_6l_itemIN4mpl_5long_ILl3EEES2_NSI_INSK_ILl2EEES3_NSI_INSK_ILl1EEES4_NS8_5l_endEEEEEEEEENSJ_5bool_ILb0EEESU_SU_EERS5_E4typeESH_",
      "__ZN10cryptonote6tx_outC2ERKS0_",
      "__ZNSt3__26vectorIN10cryptonote6tx_outENS_9allocatorIS2_EEE21__push_back_slow_pathIRKS2_EEvOT_",
      "__ZanIJRKN6crypto10public_keyEPKcEEvRKN6logger4infoERKNS6_6formatIJDpT_EEE",
      "__ZanIJRKN6crypto10public_keyEEEvRKN6logger4infoERKNS4_6formatIJDpT_EEE",
      "__ZN10cryptonote35add_additional_tx_pub_keys_to_extraERNSt3__26vectorIhNS0_9allocatorIhEEEERKNS1_IN6crypto10public_keyENS2_IS7_EEEE",
      "__ZanIJPKcRKyS1_S3_S1_EEvRKN6logger4infoERKNS4_6formatIJDpT_EEE",
      "__ZN10cryptonote27get_transaction_prefix_hashERKNS_18transaction_prefixERN6crypto4hashE",
      "__ZNSt3__26vectorIN6crypto10public_keyENS_9allocatorIS2_EEEC2Em",
      "__ZNSt3__26vectorIPKN6crypto10public_keyENS_9allocatorIS4_EEE21__push_back_slow_pathIS4_EEvOT_",
      "__ZNSt3__26vectorINS0_IN6crypto9signatureENS_9allocatorIS2_EEEENS3_IS5_EEE21__push_back_slow_pathIS5_EEvOT_",
      "__ZNSt3__26vectorIN6crypto9signatureENS_9allocatorIS2_EEE6resizeEm",
      "__ZZN10cryptonote24construct_tx_with_tx_keyERKNS_12account_keysERKNSt3__213unordered_mapIN6crypto10public_keyENS_16subaddress_indexENS3_4hashIS6_EENS3_8equal_toIS6_EENS3_9allocatorINS3_4pairIKS6_S7_EEEEEERNS3_6vectorINS_15tx_source_entryENSC_ISL_EEEERNSK_INS_20tx_destination_entryENSC_ISP_EEEERKN5boost8optionalINS_22account_public_addressEEENSK_IhNSC_IhEEEERNS_11transactionEyRKN4epee7mlockedIN5tools8scrubbedINS5_9ec_scalarEEEEERKNSK_IS19_NSC_IS19_EEEEbRKN3rct9RCTConfigEPNS1G_12multisig_outEbENK3__2clERKNS5_9signatureE",
      "__ZN10cryptonote15obj_to_json_strINS_11transactionEEENSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEERT_",
      "__ZanIJRKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEEPFRNS0_13basic_ostreamIcS3_EESB_ES8_SD_RKN6crypto4hashEPKcEEvRKN6logger4infoERKNSK_6formatIJDpT_EEE",
      "__ZNSt3__26vectorIN3rct5ctkeyENS_9allocatorIS2_EEE7reserveEm",
      "__ZNSt3__26vectorINS0_IN3rct5ctkeyENS_9allocatorIS2_EEEENS3_IS5_EEEC2Em",
      "__ZNSt3__26vectorIjNS_9allocatorIjEEE21__push_back_slow_pathIjEEvOT_",
      "__ZNSt3__26vectorIN3rct14multisig_kLRkiENS_9allocatorIS2_EEE21__push_back_slow_pathIRKS2_EEvOT_",
      "__ZNSt3__26vectorIN3rct3keyENS_9allocatorIS2_EEE21__push_back_slow_pathIRKS2_EEvOT_",
      "__ZNSt3__26vectorIN3rct5ctkeyENS_9allocatorIS2_EEE6resizeEm",
      "__ZNSt3__26vectorIyNS_9allocatorIyEEE21__push_back_slow_pathIyEEvOT_",
      "__ZanIJPFRNSt3__213basic_ostreamIcNS0_11char_traitsIcEEEES5_ERKNS0_12basic_stringIcS3_NS0_9allocatorIcEEEES7_RKN6crypto4hashEPKcEEvRKN6logger4infoERKNSK_6formatIJDpT_EEE",
      "__ZNSt3__26vectorImNS_9allocatorImEEE8allocateEm",
      "__ZN5boost7variantIN10cryptonote8txin_genEJNS1_14txin_to_scriptENS1_18txin_to_scripthashENS1_11txin_to_keyEEE14variant_assignEOS6_",
      "__ZNSt3__26vectorIN4epee7mlockedIN5tools8scrubbedIN6crypto9ec_scalarEEEEENS_9allocatorIS8_EEE21__push_back_slow_pathIS8_EEvOT_",
      "__ZNSt3__26vectorIiNS_9allocatorIiEEE6resizeEmRKi",
      "__ZNSt3__26vectorIaNS_9allocatorIaEEE6resizeEmRKa",
      "__ZN5tools6base586encodeERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE",
      "__ZNSt3__26vectorIcNS_9allocatorIcEEE8allocateEm",
      "__ZN4epee15wipeable_string4growEmm",
      "__ZNSt3__26vectorIcNS_9allocatorIcEEE7reserveEm",
      "__ZNSt3__26vectorIcNS_9allocatorIcEEE6resizeEm",
      "__ZNSt3__26vectorIN4epee15wipeable_stringENS_9allocatorIS2_EEE21__push_back_slow_pathIS2_EEvOT_",
      "__ZNSt3__26vectorIN4epee15wipeable_stringENS_9allocatorIS2_EEE26__swap_out_circular_bufferERNS_14__split_bufferIS2_RS4_EE",
      "__ZanIJPKcRKNSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES1_EEvRKN6logger4infoERKNSB_6formatIJDpT_EEE",
      "__ZNSt3__29to_stringEi",
      "__ZNSt3__26vectorIN6crypto10public_keyENS_9allocatorIS2_EEE7reserveEm",
      "__ZNSt3__26vectorIN6crypto10public_keyENS_9allocatorIS2_EEE21__push_back_slow_pathIRKS2_EEvOT_",
      "__ZanIJPKcRKN6crypto10public_keyES1_mS1_RKNS2_14key_derivationES1_EEvRKN6logger4infoERKNS9_6formatIJDpT_EEE",
      "__ZNSt3__26vectorIN3rct6geDsmpENS_9allocatorIS2_EEEC2Em",
      "__ZNSt3__26vectorIN3rct3keyENS_9allocatorIS2_EEEC2Em",
      "__ZN3rct7precompEP9ge_cachedRKNS_3keyE",
      "__ZN3rct7skpkGenERNS_3keyES1_",
      "__ZN3rct6skvGenEm",
      "__ZNSt3__26vectorIN3rct6geDsmpENS_9allocatorIS2_EEE8allocateEm",
      "__ZNSt3__26vectorIN3rct3keyENS_9allocatorIS2_EEE7reserveEm",
      "__ZNSt3__26vectorIN3rct3keyENS_9allocatorIS2_EEE21__push_back_slow_pathIS2_EEvOT_",
      "__ZNSt3__26vectorIN3rct8rangeSigENS_9allocatorIS2_EEE6resizeEm",
      "__ZNSt3__26vectorIN3rct9ecdhTupleENS_9allocatorIS2_EEE6resizeEm",
      "__ZNSt3__26vectorIN3rct3keyENS_9allocatorIS2_EEE6resizeEm",
      "__ZNSt3__26vectorIN3rct5mgSigENS_9allocatorIS2_EEE21__push_back_slow_pathIS2_EEvOT_",
      "__ZNSt3__26vectorIN3rct11BulletproofENS_9allocatorIS2_EEE21__push_back_slow_pathIS2_EEvOT_",
      "__ZN3rct11scalarmult8ERKNS_3keyE",
      "__ZNSt3__26vectorIyNS_9allocatorIyEEEC2Em",
      "__ZNSt3__26vectorIN3rct5mgSigENS_9allocatorIS2_EEE6resizeEm",
      "__ZN3rctL12get_exponentERKNS_3keyEm",
      "__ZNSt3__26vectorIN3rct12MultiexpDataENS_9allocatorIS2_EEE21__push_back_slow_pathIS2_EEvOT_",
      "__ZanIJPKcmS1_EEvRKN6logger4infoERKNS2_6formatIJDpT_EEE",
      "__ZNSt3__26vectorIN3rct12MultiexpDataENS_9allocatorIS2_EEE7reserveEm",
      "__ZNSt3__26vectorIN3rct12MultiexpDataENS_9allocatorIS2_EEE6resizeEm",
      "__ZN5tools15get_varint_dataImEENSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEERKT_",
      "__ZN3rctL4pow2Em",
      "__ZNK4epee15wipeable_string5splitERNSt3__26vectorIS0_NS1_9allocatorIS0_EEEE",
      "__ZN4epee10misc_utils26create_scope_leave_handlerIZN6crypto13ElectrumWords14words_to_bytesERKNS_15wipeable_stringERS4_mbRNSt3__212basic_stringIcNS8_11char_traitsIcEENS8_9allocatorIcEEEEE3__0EEN5boost10shared_ptrINS0_19call_befor_die_baseEEET_",
      "__ZNSt3__26vectorIN4epee15wipeable_stringENS_9allocatorIS2_EEEC2ERKS5_",
      "__ZN4epee15wipeable_stringpLEc",
      "__ZN4epee15wipeable_stringpLERKS0_",
      "__ZNSt3__26vectorIPN8Language4BaseENS_9allocatorIS3_EEE8allocateEm",
      "__ZNSt3__26vectorIjNS_9allocatorIjEEE7reserveEm",
      "__ZNSt3__26vectorIjNS_9allocatorIjEEE21__push_back_slow_pathIRKjEEvOT_",
      "__ZNSt3__26vectorIN4epee15wipeable_stringENS_9allocatorIS2_EEE8allocateEm",
      "__ZanIJPKcS1_EEvRKN6logger4infoERKNS2_6formatIJDpT_EEE",
      "__ZN8Language13utf8canonicalIN4epee15wipeable_stringEEET_RKS3_",
      "__ZN8Language4Base9set_wordsEPKPKc",
      "__ZN8Language4Base13populate_mapsEj",
      "__ZN4epee15wipeable_stringC2EONSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE",
      "__ZanIJRKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEEPKcS8_SA_EEvRKN6logger4infoERKNSB_6formatIJDpT_EEE",
      "__ZNSt3__212__hash_tableINS_17__hash_value_typeIN4epee15wipeable_stringEjEENS_22__unordered_map_hasherIS3_S4_N8Language8WordHashELb1EEENS_21__unordered_map_equalIS3_S4_NS6_9WordEqualELb1EEENS_9allocatorIS4_EEE6rehashEm",
      "__ZN5boost6detail20sp_pointer_constructIN4epee10misc_utils19call_befor_die_baseENS3_14call_befor_dieIZN6crypto13ElectrumWords14words_to_bytesERKNS2_15wipeable_stringERS8_mbRNSt3__212basic_stringIcNSC_11char_traitsIcEENSC_9allocatorIcEEEEE3__0EEEEvPNS_10shared_ptrIT_EEPT0_RNS0_12shared_countE",
      "__ZN4epee15wipeable_stringpLERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE",
      "__ZN4epee15wipeable_string9push_backEc",
      "__ZNSt3__26vectorIPKN8Language4BaseENS_9allocatorIS4_EEE8allocateEm",
      "__ZN5boost2io20basic_ios_fill_saverIcNSt3__211char_traitsIcEEEC2ERNS2_9basic_iosIcS4_EE",
      "__ZNSt3__28ios_base16__call_callbacksENS0_5eventE",
      "__ZNSt3__28ios_base7failureC2EPKcRKNS_10error_codeE",
      "__ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9push_backEw",
      "__ZNSt11logic_errorC2ERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE",
      "_abort_message",
      "__ZNSt3__26vectorINS0_INS0_IN10__cxxabiv112_GLOBAL__N_111string_pairENS2_11short_allocIS3_Lm4096EEEEENS4_IS6_Lm4096EEEEENS4_IS8_Lm4096EEEE24__emplace_back_slow_pathIJRNS2_5arenaILm4096EEEEEEvDpOT_",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEEN10__cxxabiv112_GLOBAL__N_112malloc_allocIcEEE9push_backEc",
      "__ZN10__cxxabiv112_GLOBAL__N_111string_pair9move_fullEv",
      "__ZNSt3__26vectorINS0_IN10__cxxabiv112_GLOBAL__N_111string_pairENS2_11short_allocIS3_Lm4096EEEEENS4_IS6_Lm4096EEEE21__push_back_slow_pathIS6_EEvOT_",
      "__ZNSt3__26vectorIN10__cxxabiv112_GLOBAL__N_111string_pairENS2_11short_allocIS3_Lm4096EEEE21__push_back_slow_pathIS3_EEvOT_",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEEN10__cxxabiv112_GLOBAL__N_112malloc_allocIcEEEC2ERKS7_",
      "__ZN10__cxxabiv112_GLOBAL__N_111string_pairC2ERKS1_",
      "__ZNSt3__26vectorINS0_INS0_IN10__cxxabiv112_GLOBAL__N_111string_pairENS2_11short_allocIS3_Lm4096EEEEENS4_IS6_Lm4096EEEEENS4_IS8_Lm4096EEEE24__emplace_back_slow_pathIJS5_EEEvDpOT_",
      "__ZNSt3__26vectorINS0_IN10__cxxabiv112_GLOBAL__N_111string_pairENS2_11short_allocIS3_Lm4096EEEEENS4_IS6_Lm4096EEEE24__emplace_back_slow_pathIJS5_EEEvDpOT_",
      "__ZNSt3__26vectorIN10__cxxabiv112_GLOBAL__N_111string_pairENS2_11short_allocIS3_Lm4096EEEE21__push_back_slow_pathIRKS3_EEvOT_",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEEN10__cxxabiv112_GLOBAL__N_112malloc_allocIcEEE6assignEPKc",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEEN10__cxxabiv112_GLOBAL__N_112malloc_allocIcEEEaSERKS7_",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0"
    ];
    var debug_table_viii = [
      "0",
      "__ZNK5boost6system6detail22generic_error_category7messageEi",
      "__ZNK5boost6system14error_category23default_error_conditionEi",
      "__ZNK5boost6system14error_category12std_category23default_error_conditionEi",
      "__ZNK5boost6system14error_category12std_category7messageEi",
      "__ZNKSt3__214error_category23default_error_conditionEi",
      "__ZNKSt3__219__iostream_category7messageEi",
      "__ZNKSt3__224__generic_error_category7messageEi",
      "__ZNKSt3__223__system_error_category23default_error_conditionEi",
      "__ZNKSt3__223__system_error_category7messageEi",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcm",
      "__ZN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE3putIN21monero_transfer_utils26CreateTransactionErrorCodeEEERSB_RKNS0_11string_pathIS8_NS0_13id_translatorIS8_EEEERKT_",
      "__ZN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE3putIS8_EERSB_RKNS0_11string_pathIS8_NS0_13id_translatorIS8_EEEERKT_",
      "__ZN5boost13property_tree14ptree_bad_dataC2INS_3anyEEERKNSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEERKT_",
      "__ZN5boost16exception_detail16throw_exception_INS_13property_tree14ptree_bad_dataEEEvRKT_PKcS8_i",
      "__ZN5boost13property_tree14ptree_bad_pathC2INS0_11string_pathINSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEENS0_13id_translatorISA_EEEEEERKSA_RKT_",
      "___cxa_throw",
      "__ZN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE9put_valueIN21monero_transfer_utils26CreateTransactionErrorCodeENS0_17stream_translatorIcS5_S7_SE_EEEEvRKT_T0_",
      "__ZNSt3__28ios_base5imbueERKNS_6localeE",
      "__ZN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE3putImEERSB_RKNS0_11string_pathIS8_NS0_13id_translatorIS8_EEEERKT_",
      "__ZN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE9put_valueImNS0_17stream_translatorIcS5_S7_mEEEEvRKT_T0_",
      "__ZNK5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE12get_optionalIS8_EENS_8optionalIT_EERKNS0_11string_pathIS8_NS0_13id_translatorIS8_EEEE",
      "__ZNK5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE3getIS8_EET_RKNS0_11string_pathIS8_NS0_13id_translatorIS8_EEEE",
      "__ZN19monero_send_routine33new__req_params__get_unspent_outsENSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEES6_",
      "__ZN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE3putIbEERSB_RKNS0_11string_pathIS8_NS0_13id_translatorIS8_EEEERKT_",
      "__ZN5tools5error21wallet_internal_errorC2EONSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEERKS8_",
      "__ZNSt3__26vectorIN21monero_transfer_utils15SpendableOutputENS_9allocatorIS2_EEE18__construct_at_endIPS2_EENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueEvE4typeES9_S9_m",
      "__ZN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE3putIN19monero_send_routine21SendFunds_ProcessStepEEERSB_RKNS0_11string_pathIS8_NS0_13id_translatorIS8_EEEERKT_",
      "__ZN5boost13property_tree14ptree_bad_dataC2INSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEEERKS9_RKT_",
      "__ZN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE9put_valueIbNS0_17stream_translatorIcS5_S7_bEEEEvRKT_T0_",
      "__ZN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE9put_valueIN19monero_send_routine21SendFunds_ProcessStepENS0_17stream_translatorIcS5_S7_SE_EEEEvRKT_T0_",
      "__ZNK5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE18get_value_optionalIbNS0_17stream_translatorIcS5_S7_bEEEENS_8optionalIT_EET0_",
      "__ZNSt3__213basic_istreamIcNS_11char_traitsIcEEE6sentryC2ERS3_b",
      "__ZN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE9add_childERKNS0_11string_pathIS8_NS0_13id_translatorIS8_EEEERKSB_",
      "__ZN6monero13address_utils14decodedAddressERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEN10cryptonote12network_typeE",
      "__ZN6crypto18generate_key_imageERKNS_10public_keyERKN4epee7mlockedIN5tools8scrubbedINS_9ec_scalarEEEEERNS_9key_imageE",
      "__ZN5tools5error17wallet_error_baseISt11logic_errorEC2EONSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEERKSA_",
      "__ZNSt3__26vectorINS0_IN6crypto9signatureENS_9allocatorIS2_EEEENS3_IS5_EEE18__construct_at_endIPS5_EENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueEvE4typeESB_SB_m",
      "__ZNSt3__26vectorIN3rct11BulletproofENS_9allocatorIS2_EEE18__construct_at_endIPS2_EENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueEvE4typeES9_S9_m",
      "__ZNSt3__26vectorIN3rct5mgSigENS_9allocatorIS2_EEE18__construct_at_endIPS2_EENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueEvE4typeES9_S9_m",
      "__ZNSt3__26vectorINS0_IN3rct3keyENS_9allocatorIS2_EEEENS3_IS5_EEE18__construct_at_endIPS5_EENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueEvE4typeESB_SB_m",
      "__ZNSt3__26vectorINS0_IN3rct5ctkeyENS_9allocatorIS2_EEEENS3_IS5_EEE18__construct_at_endIPS5_EENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueEvE4typeESB_SB_m",
      "__ZNSt3__26vectorIN5boost7variantIN10cryptonote8txin_genEJNS3_14txin_to_scriptENS3_18txin_to_scripthashENS3_11txin_to_keyEEEENS_9allocatorIS8_EEE18__construct_at_endIPS8_EENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueEvE4typeESF_SF_m",
      "__ZNSt3__26vectorIN10cryptonote6tx_outENS_9allocatorIS2_EEE18__construct_at_endIPS2_EENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueEvE4typeES9_S9_m",
      "__ZNSt3__2plIcNS_11char_traitsIcEENS_9allocatorIcEEEENS_12basic_stringIT_T0_T1_EEPKS6_RKS9_",
      "__ZN6crypto20derivation_to_scalarERKNS_14key_derivationEmRNS_9ec_scalarE",
      "__ZNK10cryptonote12account_base22get_public_address_strENS_12network_typeE",
      "__ZN19monero_wallet_utils36mnemonic_string_from_seed_hex_stringERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEES8_",
      "__ZNK5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE12get_optionalIjEENS_8optionalIT_EERKNS0_11string_pathIS8_NS0_13id_translatorIS8_EEEE",
      "__ZNK5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE18get_value_optionalIjNS0_17stream_translatorIcS5_S7_jEEEENS_8optionalIT_EET0_",
      "__ZNSt3__26vectorINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEENS4_IS6_EEE18__construct_at_endIPS6_EENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueEvE4typeESC_SC_m",
      "__Z26_possible_uint64_from_jsonRKN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEEERKS8_",
      "__ZNK5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE12get_optionalIhEENS_8optionalIT_EERKNS0_11string_pathIS8_NS0_13id_translatorIS8_EEEE",
      "__ZNK5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE18get_value_optionalIhNS0_17stream_translatorIcS5_S7_hEEEENS_8optionalIT_EET0_",
      "__ZNSt3__26vectorIN21monero_transfer_utils19RandomAmountOutputsENS_9allocatorIS2_EEE18__construct_at_endIPS2_EENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueEvE4typeES9_S9_m",
      "__ZNSt3__26vectorIN21monero_transfer_utils18RandomAmountOutputENS_9allocatorIS2_EEE18__construct_at_endIPS2_EENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueEvE4typeES9_S9_m",
      "__ZN5boost13property_tree11json_parser6detail18read_json_internalINS0_11basic_ptreeINSt3__212basic_stringIcNS5_11char_traitsIcEENS5_9allocatorIcEEEESB_NS5_4lessISB_EEEEEEvRNS5_13basic_istreamINT_8key_type10value_typeENS7_ISH_EEEERSG_RKSB_",
      "__ZN5boost13property_tree11json_parser6detail6parserINS2_18standard_callbacksINS0_11basic_ptreeINSt3__212basic_stringIcNS6_11char_traitsIcEENS6_9allocatorIcEEEESC_NS6_4lessISC_EEEEEENS2_8encodingIcEENS6_19istreambuf_iteratorIcS9_EESK_E9set_inputINS2_9minirangeISK_SK_EEEEvRKSC_RKT_",
      "__ZN10cryptonoteL14add_public_keyERN6crypto10public_keyERKS1_S4_",
      "__ZN14binary_archiveILb0EE14serialize_blobEPvmPKc",
      "__ZNK5boost6system10error_code7messageEv",
      "__ZN6crypto10crypto_ops18generate_key_imageERKNS_10public_keyERKN4epee7mlockedIN5tools8scrubbedINS_9ec_scalarEEEEERNS_9key_imageE",
      "__ZNSt3__26vectorIhNS_9allocatorIhEEE6assignIPhEENS_9enable_ifIXaasr21__is_forward_iteratorIT_EE5valuesr16is_constructibleIhNS_15iterator_traitsIS7_E9referenceEEE5valueEvE4typeES7_S7_",
      "__ZN10cryptonote28get_destination_view_key_pubERKNSt3__26vectorINS_20tx_destination_entryENS0_9allocatorIS2_EEEERKN5boost8optionalINS_22account_public_addressEEE",
      "__ZNSt3__26__sortIRZN10cryptonote24construct_tx_with_tx_keyERKNS1_12account_keysERKNS_13unordered_mapIN6crypto10public_keyENS1_16subaddress_indexENS_4hashIS7_EENS_8equal_toIS7_EENS_9allocatorINS_4pairIKS7_S8_EEEEEERNS_6vectorINS1_15tx_source_entryENSD_ISM_EEEERNSL_INS1_20tx_destination_entryENSD_ISQ_EEEERKN5boost8optionalINS1_22account_public_addressEEENSL_IhNSD_IhEEEERNS1_11transactionEyRKN4epee7mlockedIN5tools8scrubbedINS6_9ec_scalarEEEEERKNSL_IS1A_NSD_IS1A_EEEEbRKN3rct9RCTConfigEPNS1H_12multisig_outEbE3__0PmEEvT0_S1Q_T_",
      "__ZN2hw6device14scalarmultBaseERKN3rct3keyE",
      "__ZN5tools6base5812_GLOBAL__N_112encode_blockEPKcmPc",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEmc",
      "__ZN3rct7addKeysERKNS_3keyES2_",
      "__ZN3rct13scalarmultKeyERKNS_3keyES2_",
      "__ZNSt3__26__treeINS_12__value_typeINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEENS_10unique_ptrIN2hw6deviceENS_14default_deleteISA_EEEEEENS_19__map_value_compareIS7_SE_NS_4lessIS7_EELb1EEENS5_ISE_EEE21__emplace_unique_implIJNS_4pairIPKcSD_EEEEENSM_INS_15__tree_iteratorISE_PNS_11__tree_nodeISE_PvEElEEbEEDpOT_",
      "__ZNSt3__26vectorIN3rct3keyENS_9allocatorIS2_EEE6assignIPS2_EENS_9enable_ifIXaasr21__is_forward_iteratorIT_EE5valuesr16is_constructibleIS2_NS_15iterator_traitsIS9_E9referenceEEE5valueEvE4typeES9_S9_",
      "__ZNSt3__26vectorINS0_IN3rct3keyENS_9allocatorIS2_EEEENS3_IS5_EEEC2EmRKS5_",
      "__ZN3rct7addKeysERNS_3keyERKS0_S3_",
      "__ZN3rct7subKeysERNS_3keyERKS0_S3_",
      "__ZNSt3__26vectorINS0_IN3rct5ctkeyENS_9allocatorIS2_EEEENS3_IS5_EEE6assignIPS5_EENS_9enable_ifIXaasr21__is_forward_iteratorIT_EE5valuesr16is_constructibleIS5_NS_15iterator_traitsISB_E9referenceEEE5valueEvE4typeESB_SB_",
      "__ZN3rct18get_pre_mlsag_hashERKNS_6rctSigERN2hw6deviceE",
      "__ZNSt3__26vectorIN3rct3keyENS_9allocatorIS2_EEEC2INS_11__wrap_iterIPKS2_EEEET_NS_9enable_ifIXaasr21__is_forward_iteratorISB_EE5valuesr16is_constructibleIS2_NS_15iterator_traitsISB_E9referenceEEE5valueESB_E4typeE",
      "__ZN3rct12MultiexpDataC2ERKNS_3keyES3_",
      "__ZN3rct17straus_init_cacheERKNSt3__26vectorINS_12MultiexpDataENS0_9allocatorIS2_EEEEm",
      "__ZN3rct20pippenger_init_cacheERKNSt3__26vectorINS_12MultiexpDataENS0_9allocatorIS2_EEEEm",
      "__ZNSt3__26vectorIN3rct12MultiexpDataENS_9allocatorIS2_EEE24__emplace_back_slow_pathIJRKNS1_3keyER5ge_p3EEEvDpOT_",
      "__ZN3rctL8multiexpERKNSt3__26vectorINS_12MultiexpDataENS0_9allocatorIS2_EEEEb",
      "__ZN3rct13scalarmultKeyERNS_3keyERKS0_S3_",
      "__ZN3rctL15vector_exponentERKNSt3__26vectorINS_3keyENS0_9allocatorIS2_EEEES7_",
      "__ZN3rctL10vector_dupERKNS_3keyEm",
      "__ZN3rctL15vector_subtractERKNSt3__26vectorINS_3keyENS0_9allocatorIS2_EEEES7_",
      "__ZN3rctL13vector_powersERKNS_3keyEm",
      "__ZN3rctL10vector_addERKNSt3__26vectorINS_3keyENS0_9allocatorIS2_EEEES7_",
      "__ZN3rctL8hadamardERKNSt3__26vectorINS_3keyENS0_9allocatorIS2_EEEES7_",
      "__ZN3rctL13inner_productERKNSt3__26vectorINS_3keyENS0_9allocatorIS2_EEEES7_",
      "__ZN3rctL13vector_scalarERKNSt3__26vectorINS_3keyENS0_9allocatorIS2_EEEERKS2_",
      "__ZN3rctL14vector_scalar2ERKNSt3__26vectorINS_3keyENS0_9allocatorIS2_EEEERKS2_",
      "__ZN3rctL9hadamard2ERKNSt3__26vectorINS_3keyENS0_9allocatorIS2_EEEES7_",
      "__ZN3rct17bulletproof_PROVEERKNSt3__26vectorINS_3keyENS0_9allocatorIS2_EEEES7_",
      "__ZN4epee15wipeable_string6appendEPKcm",
      "__ZN8Language10utf8prefixIN4epee15wipeable_stringEEET_RKS3_m",
      "__ZNSt3__26vectorIN4epee15wipeable_stringENS_9allocatorIS2_EEE18__construct_at_endIPS2_EENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueEvE4typeES9_S9_m",
      "__ZN4epee15wipeable_stringC2EPKcm",
      "__ZN8Language10utf8prefixINSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEEET_RKS8_m",
      "__ZNSt3__219__double_or_nothingIcEEvRNS_10unique_ptrIT_PFvPvEEERPS2_S9_",
      "__ZNSt3__219__double_or_nothingIjEEvRNS_10unique_ptrIT_PFvPvEEERPS2_S9_",
      "__ZNSt3__219__double_or_nothingIwEEvRNS_10unique_ptrIT_PFvPvEEERPS2_S9_",
      "__ZNSt3__212_GLOBAL__N_19as_stringINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPFiPcmPKczEiEET_T0_SD_PKNSD_10value_typeET1_",
      "__ZNSt3__212system_error6__initERKNS_10error_codeENS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__ZNSt3__26vectorIN10__cxxabiv112_GLOBAL__N_111string_pairENS2_11short_allocIS3_Lm4096EEEEC2EmRKS3_RKS5_",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEEN10__cxxabiv112_GLOBAL__N_112malloc_allocIcEEEC2ERKS7_mmRKS6_",
      "__ZNSt3__2plIcNS_11char_traitsIcEEN10__cxxabiv112_GLOBAL__N_112malloc_allocIcEEEENS_12basic_stringIT_T0_T1_EERKSB_PKS8_",
      "__ZNSt3__2plIcNS_11char_traitsIcEEN10__cxxabiv112_GLOBAL__N_112malloc_allocIcEEEENS_12basic_stringIT_T0_T1_EEPKS8_RKSB_",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEEN10__cxxabiv112_GLOBAL__N_112malloc_allocIcEEE6__initIPKcEENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueEvE4typeESC_SC_",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0"
    ];
    var debug_table_viiii = [
      "0",
      "__ZNSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEE7seekposENS_4fposI11__mbstate_tEEj",
      "__ZN2hw4core14device_default31get_subaddress_spend_public_keyERKN10cryptonote12account_keysERKNS2_16subaddress_indexE",
      "__ZN2hw4core14device_default14get_subaddressERKN10cryptonote12account_keysERKNS2_16subaddress_indexE",
      "__ZN2hw4core14device_default25get_subaddress_secret_keyERKN4epee7mlockedIN5tools8scrubbedIN6crypto9ec_scalarEEEEERKN10cryptonote16subaddress_indexE",
      "__ZNSt3__215basic_streambufIcNS_11char_traitsIcEEE7seekposENS_4fposI11__mbstate_tEEj",
      "__ZNSt3__215basic_streambufIwNS_11char_traitsIwEEE7seekposENS_4fposI11__mbstate_tEEj",
      "__ZNKSt3__27collateIcE12do_transformEPKcS3_",
      "__ZNKSt3__27collateIwE12do_transformEPKwS3_",
      "__ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi",
      "__ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi",
      "__ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi",
      "__ZN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE3putIN21monero_transfer_utils26CreateTransactionErrorCodeENS0_17stream_translatorIcS5_S7_SE_EEEERSB_RKNS0_11string_pathIS8_NS0_13id_translatorIS8_EEEERKT_T0_",
      "__ZN5boost16exception_detail16throw_exception_INS_13property_tree14ptree_bad_pathEEEvRKT_PKcS8_i",
      "__ZN5boost11multi_index6detail8copy_mapINS1_20sequenced_index_nodeINS1_18ordered_index_nodeINS1_19null_augment_policyENS1_15index_node_baseINSt3__24pairIKNS7_12basic_stringIcNS7_11char_traitsIcEENS7_9allocatorIcEEEENS_13property_tree11basic_ptreeISE_SE_NS7_4lessISE_EEEEEENSC_ISL_EEEEEEEESM_EC2ERKSM_mPSP_ST_",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcmm",
      "__ZN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE3putImNS0_17stream_translatorIcS5_S7_mEEEERSB_RKNS0_11string_pathIS8_NS0_13id_translatorIS8_EEEERKT_T0_",
      "__ZN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE3putIbNS0_17stream_translatorIcS5_S7_bEEEERSB_RKNS0_11string_pathIS8_NS0_13id_translatorIS8_EEEERKT_T0_",
      "__ZN5boost13property_tree11json_parser19write_json_internalINS0_11basic_ptreeINSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEESA_NS4_4lessISA_EEEEEEvRNS4_13basic_ostreamINT_8key_type10value_typeENS6_ISG_EEEERKSF_RKSA_b",
      "__ZN5boost13property_tree11json_parser17json_parser_errorC2ERKNSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEESB_m",
      "__ZN5boost16exception_detail16throw_exception_INS_13property_tree11json_parser17json_parser_errorEEEvRKT_PKcS9_i",
      "__ZN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEES8_NS2_4lessIS8_EEE3putIN19monero_send_routine21SendFunds_ProcessStepENS0_17stream_translatorIcS5_S7_SE_EEEERSB_RKNS0_11string_pathIS8_NS0_13id_translatorIS8_EEEERKT_T0_",
      "__ZN6crypto17derive_secret_keyERKNS_14key_derivationEmRKN4epee7mlockedIN5tools8scrubbedINS_9ec_scalarEEEEERS9_",
      "__ZNSt3__214__split_bufferINS_4pairIyN3rct5ctkeyEEERNS_9allocatorIS4_EEEC2EmmS7_",
      "__ZN6monero13address_utils29new_integratedAddrFromStdAddrERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEES9_N10cryptonote12network_typeE",
      "___assert_fail",
      "__ZNSt3__212__hash_tableIN10cryptonote22account_public_addressENS_4hashIS2_EENS_8equal_toIS2_EENS_9allocatorIS2_EEE21__construct_node_hashIRKS2_JEEENS_10unique_ptrINS_11__hash_nodeIS2_PvEENS_22__hash_node_destructorINS7_ISG_EEEEEEmOT_DpOT0_",
      "__ZN2hw6device13scalarmultKeyERKN3rct3keyES4_",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC2ERKS5_mmRKS4_",
      "__ZN3rct8addKeys2ERNS_3keyERKS0_S3_S3_",
      "__ZN3rct10proveRangeERNS_3keyES1_RKy",
      "__ZN3rct6strausERKNSt3__26vectorINS_12MultiexpDataENS0_9allocatorIS2_EEEERKNS0_10shared_ptrINS_18straus_cached_dataEEEm",
      "__ZN3rct9pippengerERKNSt3__26vectorINS_12MultiexpDataENS0_9allocatorIS2_EEEERKNS0_10shared_ptrINS_21pippenger_cached_dataEEEm",
      "__ZN3rctL15hash_cache_mashERNS_3keyERKS0_S3_",
      "__ZN3rctL5sliceERKNSt3__26vectorINS_3keyENS0_9allocatorIS2_EEEEmm",
      "__ZNSt3__212system_errorC2ENS_10error_codeEPKc",
      "__ZN10__cxxabiv112_GLOBAL__N_18demangleINS0_2DbEEEvPKcS4_RT_Ri",
      "__ZNSt3__212basic_stringIcNS_11char_traitsIcEEN10__cxxabiv112_GLOBAL__N_112malloc_allocIcEEE6__initEPKcmm",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0"
    ];
    var debug_table_viiiii = [
      "0",
      "__ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib",
      "__ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib",
      "__ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib",
      "__ZN19monero_send_routine33new__parsed_res__get_unspent_outsERKN5boost13property_tree11basic_ptreeINSt3__212basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEES9_NS3_4lessIS9_EEEERKN4epee7mlockedIN5tools8scrubbedIN6crypto9ec_scalarEEEEESO_RKNSJ_10public_keyE",
      "__ZN10cryptonote12account_base8generateERKN4epee7mlockedIN5tools8scrubbedIN6crypto9ec_scalarEEEEEbbb",
      "__ZN5boost13property_tree11json_parser6detail18read_json_internalINSt3__219istreambuf_iteratorIcNS4_11char_traitsIcEEEES8_NS2_8encodingIcEENS2_18standard_callbacksINS0_11basic_ptreeINS4_12basic_stringIcS7_NS4_9allocatorIcEEEESG_NS4_4lessISG_EEEEEEEEvT_T0_RT1_RT2_RKSG_",
      "__ZN6crypto13generate_keysERNS_10public_keyERN4epee7mlockedIN5tools8scrubbedINS_9ec_scalarEEEEERKS8_b",
      "__ZN10cryptonote18classify_addressesERKNSt3__26vectorINS_20tx_destination_entryENS0_9allocatorIS2_EEEERKN5boost8optionalINS_22account_public_addressEEERmSE_RSA_",
      "__ZN3rct8addKeys3ERNS_3keyERKS0_S3_S3_PK9ge_cached",
      "__ZN3rct21proveRangeBulletproofERNSt3__26vectorINS_3keyENS0_9allocatorIS2_EEEES6_RKNS1_IyNS3_IyEEEERKS5_",
      "__ZN3rctL15hash_cache_mashERNS_3keyERKS0_S3_S3_",
      "__ZN3rctL22vector_exponent_customERKNSt3__26vectorINS_3keyENS0_9allocatorIS2_EEEES7_S7_S7_",
      "__ZN8Language4BaseC2EPKcS2_RKNSt3__26vectorINS3_12basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEENS8_ISA_EEEEj",
      "0",
      "0"
    ];
    var debug_table_viiiiii = [
      "0",
      "__ZN2hw4core14device_default32get_subaddress_spend_public_keysERKN10cryptonote12account_keysEjjj",
      "__ZN2hw4core14device_default13generate_keysERN6crypto10public_keyERN4epee7mlockedIN5tools8scrubbedINS2_9ec_scalarEEEEERKSB_b",
      "__ZNKSt3__28messagesIcE6do_getEliiRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE",
      "__ZNKSt3__28messagesIwE6do_getEliiRKNS_12basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEEE",
      "__ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib",
      "__ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib",
      "__ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib",
      "__ZN6crypto23generate_ring_signatureERKNS_4hashERKNS_9key_imageERKNSt3__26vectorIPKNS_10public_keyENS6_9allocatorISA_EEEERKN4epee7mlockedIN5tools8scrubbedINS_9ec_scalarEEEEEmPNS_9signatureE",
      "__ZN3rctL15hash_cache_mashERNS_3keyERKS0_S3_S3_S3_",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0"
    ];
    var debug_table_viiiiiii = [
      "0",
      "__ZN10cryptonote21is_out_to_acc_precompERKNSt3__213unordered_mapIN6crypto10public_keyENS_16subaddress_indexENS0_4hashIS3_EENS0_8equal_toIS3_EENS0_9allocatorINS0_4pairIKS3_S4_EEEEEERSB_RKNS2_14key_derivationERKNS0_6vectorISI_NS9_ISI_EEEEmRN2hw6deviceE",
      "__ZNSt3__29__num_putIcE21__widen_and_group_intEPcS2_S2_S2_RS2_S3_RKNS_6localeE",
      "__ZNSt3__29__num_putIcE23__widen_and_group_floatEPcS2_S2_S2_RS2_S3_RKNS_6localeE",
      "__ZNSt3__29__num_putIwE21__widen_and_group_intEPcS2_S2_PwRS3_S4_RKNS_6localeE",
      "__ZNSt3__29__num_putIwE23__widen_and_group_floatEPcS2_S2_PwRS3_S4_RKNS_6localeE",
      "0",
      "0"
    ];
    var debug_table_viiiiiiiii = [
      "0",
      "__ZN3rct9MLSAG_GenERKNS_3keyERKNSt3__26vectorINS4_IS0_NS3_9allocatorIS0_EEEENS5_IS7_EEEERKS7_PKNS_14multisig_kLRkiEPS0_jmRN2hw6deviceE"
    ];
    var debug_table_viiiiiiiiii = [
      "0",
      "__ZN3rct16proveRctMGSimpleERKNS_3keyERKNSt3__26vectorINS_5ctkeyENS3_9allocatorIS5_EEEERKS5_S2_S2_PKNS_14multisig_kLRkiEPS0_jRN2hw6deviceE",
      "__ZNSt3__211__money_getIcE13__gather_infoEbRKNS_6localeERNS_10money_base7patternERcS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESF_SF_SF_Ri",
      "__ZNSt3__211__money_getIwE13__gather_infoEbRKNS_6localeERNS_10money_base7patternERwS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS9_IwNSA_IwEENSC_IwEEEESJ_SJ_Ri",
      "__ZNSt3__211__money_putIcE13__gather_infoEbbRKNS_6localeERNS_10money_base7patternERcS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESF_SF_Ri",
      "__ZNSt3__211__money_putIwE13__gather_infoEbbRKNS_6localeERNS_10money_base7patternERwS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS9_IwNSA_IwEENSC_IwEEEESJ_Ri",
      "0",
      "0"
    ];
    var debug_table_viiiiiiiiiii = [
      "0",
      "__ZN3rct10proveRctMGERKNS_3keyERKNSt3__26vectorINS4_INS_5ctkeyENS3_9allocatorIS5_EEEENS6_IS8_EEEERKS8_SE_SE_PKNS_14multisig_kLRkiEPS0_jS0_RN2hw6deviceE"
    ];
    var debug_table_viiiiiiiiiiii = [
      "0",
      "__ZN3rct6genRctERKNS_3keyERKNSt3__26vectorINS_5ctkeyENS3_9allocatorIS5_EEEERKNS4_IS0_NS6_IS0_EEEERKNS4_IyNS6_IyEEEERKNS4_IS8_NS6_IS8_EEEESE_PKNS_14multisig_kLRkiEPNS_12multisig_outEjRS8_RKNS_9RCTConfigERN2hw6deviceE"
    ];
    var debug_table_viiiiiiiiiiiii = [
      "0",
      "__ZN3rct11BulletproofC2ERKNSt3__26vectorINS_3keyENS1_9allocatorIS3_EEEERKS3_SA_SA_SA_SA_SA_S8_S8_SA_SA_SA_"
    ];
    var debug_table_viiiiiiiiiiiiiii = [
      "0",
      "__ZNSt3__211__money_putIcE8__formatEPcRS2_S3_jPKcS5_RKNS_5ctypeIcEEbRKNS_10money_base7patternEccRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESL_SL_i",
      "__ZNSt3__211__money_putIwE8__formatEPwRS2_S3_jPKwS5_RKNS_5ctypeIwEEbRKNS_10money_base7patternEwwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKNSE_IwNSF_IwEENSH_IwEEEESQ_i",
      "0"
    ];
    var debug_table_viiiiiijiiiiiiii = [
      "0",
      "__ZN3rct12genRctSimpleERKNS_3keyERKNSt3__26vectorINS_5ctkeyENS3_9allocatorIS5_EEEERKNS4_IS0_NS6_IS0_EEEERKNS4_IyNS6_IyEEEESI_yRKNS4_IS8_NS6_IS8_EEEESE_PKNS4_INS_14multisig_kLRkiENS6_ISN_EEEEPNS_12multisig_outERKNS4_IjNS6_IjEEEERS8_RKNS_9RCTConfigERN2hw6deviceE"
    ];
    var debug_table_viiiiiijjjiiiji = [
      "0",
      "__ZN21monero_transfer_utils31convenience__create_transactionERNS_43Convenience_TransactionConstruction_RetValsERKNSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEESA_SA_SA_RKN5boost8optionalIS8_EEyyyRKNS2_6vectorINS_15SpendableOutputENS6_ISH_EEEERNSG_INS_19RandomAmountOutputsENS6_ISM_EEEENS2_8functionIFbhxEEEyN10cryptonote12network_typeE"
    ];
    var debug_table_viiiiiijjjiijjiiji = [
      "0",
      "__ZN21monero_transfer_utils34send_step2__try_create_transactionERNS_18Send_Step2_RetValsERKNSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEESA_SA_SA_RKN5boost8optionalIS8_EEyyyjRKNS2_6vectorINS_15SpendableOutputENS6_ISH_EEEEyyRNSG_INS_19RandomAmountOutputsENS6_ISM_EEEENS2_8functionIFbhxEEEyN10cryptonote12network_typeE"
    ];
    var debug_table_viiiijjjiiiij = [
      "0",
      "__ZN21monero_transfer_utils18create_transactionERNS_31TransactionConstruction_RetValsERKN10cryptonote12account_keysEjRKNSt3__213unordered_mapIN6crypto10public_keyENS2_16subaddress_indexENS6_4hashIS9_EENS6_8equal_toIS9_EENS6_9allocatorINS6_4pairIKS9_SA_EEEEEERKNS2_18address_parse_infoEyyyRKNS6_6vectorINS_15SpendableOutputENSF_ISR_EEEERNSQ_INS_19RandomAmountOutputsENSF_ISW_EEEERKNSQ_IhNSF_IhEEEENS6_8functionIFbhxEEEybNS2_12network_typeE"
    ];
    var debug_table_viij = ["0", "__ZN3rct4genCERNS_3keyERKS0_y"];
    var debug_table_viijii = [
      "0",
      "__ZNSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEE7seekoffExNS_8ios_base7seekdirEj",
      "__ZNSt3__215basic_streambufIcNS_11char_traitsIcEEE7seekoffExNS_8ios_base7seekdirEj",
      "__ZNSt3__215basic_streambufIwNS_11char_traitsIwEEE7seekoffExNS_8ios_base7seekdirEj"
    ];
    var debug_table_viijiiiijji = [
      "0",
      "__ZN21monero_transfer_utils41send_step1__prepare_params_for_get_decoysERNS_18Send_Step1_RetValsERKN5boost8optionalINSt3__212basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEEEEybjNS4_8functionIFbhxEEERKNS4_6vectorINS_15SpendableOutputENS8_ISI_EEEEyyNS3_IyEE"
    ];
    var debug_table_viijj = [
      "0",
      "__ZN18emscr_async_bridge28send_app_handler__error_codeERKNSt3__212basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEEN21monero_transfer_utils26CreateTransactionErrorCodeEyy"
    ];
    var debug_table_vij = [
      "0",
      "__ZN19serial_bridge_utils18RetVals_Transforms8str_fromEy",
      "__ZN3rct10zeroCommitEy",
      "__ZN5tools12write_varintINSt3__219ostreambuf_iteratorIcNS1_11char_traitsIcEEEEyEENS1_9enable_ifIXaasr3std11is_integralIT0_EE5valuesr3std11is_unsignedIS7_EE5valueEvE4typeEOT_S7_",
      "__ZN6crypto19generate_chacha_keyEPKvmRN4epee7mlockedIN5tools8scrubbedINSt3__25arrayIhLm32EEEEEEEy",
      "0",
      "0",
      "0"
    ];
    var debug_table_viji = [
      "0",
      "__ZN5tools6base5811encode_addrEyRKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE"
    ];
    function nullFunc_i(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'i'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: ii: " +
          debug_table_ii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  v: " +
          debug_table_v[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_ii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'ii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: i: " +
          debug_table_i[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_iii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'iii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: ii: " +
          debug_table_ii[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  v: " +
          debug_table_v[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_iiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'iiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: iii: " +
          debug_table_iii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_iiiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'iiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: iiii: " +
          debug_table_iiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  v: " +
          debug_table_v[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_iiiiid(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'iiiiid'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: iiii: " +
          debug_table_iiii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_iiiiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'iiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: iiii: " +
          debug_table_iiii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_iiiiiid(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'iiiiiid'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: iiii: " +
          debug_table_iiii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_iiiiiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'iiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: iiii: " +
          debug_table_iiii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_iiiiiiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'iiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: iiii: " +
          debug_table_iiii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_iiiiiiiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'iiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: iiii: " +
          debug_table_iiii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_iiiiiiiiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'iiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: iiiii: " +
          debug_table_iiiii[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_iiiiiiiiiiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'iiiiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: iiiii: " +
          debug_table_iiiii[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_iiiiiiiiiiiiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'iiiiiiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: iiiii: " +
          debug_table_iiiii[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_iiiiiiiijiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'iiiiiiiijiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: iiiii: " +
          debug_table_iiiii[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_iiiiiiiijiiiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'iiiiiiiijiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: iiiii: " +
          debug_table_iiiii[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_iiiiij(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'iiiiij'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: iiii: " +
          debug_table_iiii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_iiiiiji(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'iiiiiji'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: iiii: " +
          debug_table_iiii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_iiiij(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'iiiij'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: iiii: " +
          debug_table_iiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  i: " +
          debug_table_i[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_iiiiji(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'iiiiji'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: iiii: " +
          debug_table_iiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_iij(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'iij'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: ii: " +
          debug_table_ii[x] +
          "  i: " +
          debug_table_i[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  v: " +
          debug_table_v[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_ji(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'ji'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: jii: " +
          debug_table_jii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  i: " +
          debug_table_i[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  v: " +
          debug_table_v[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_jii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'jii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: ji: " +
          debug_table_ji[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  i: " +
          debug_table_i[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  v: " +
          debug_table_v[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_jiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'jiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: jii: " +
          debug_table_jii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  i: " +
          debug_table_i[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  v: " +
          debug_table_v[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_jiiiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'jiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: jiii: " +
          debug_table_jiii[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_jiiiiijjj(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'jiiiiijjj'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: jiii: " +
          debug_table_jiii[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  i: " +
          debug_table_i[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_jiijjj(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'jiijjj'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: jii: " +
          debug_table_jii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  v: " +
          debug_table_v[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_jiji(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'jiji'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: ji: " +
          debug_table_ji[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  i: " +
          debug_table_i[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  v: " +
          debug_table_v[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_jjii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'jjii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: jii: " +
          debug_table_jii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  i: " +
          debug_table_i[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  v: " +
          debug_table_v[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_v(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'v'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: vi: " +
          debug_table_vi[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  i: " +
          debug_table_i[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_vi(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'vi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: v: " +
          debug_table_v[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  i: " +
          debug_table_i[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_vii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'vii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: vi: " +
          debug_table_vi[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  i: " +
          debug_table_i[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_viii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'viii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: vii: " +
          debug_table_vii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  i: " +
          debug_table_i[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_viiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'viiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: viii: " +
          debug_table_viii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_viiiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'viiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: viii: " +
          debug_table_viii[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_viiiiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'viiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: viii: " +
          debug_table_viii[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  i: " +
          debug_table_i[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_viiiiiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'viiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: viii: " +
          debug_table_viii[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_viiiiiiiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'viiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: viiii: " +
          debug_table_viiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  i: " +
          debug_table_i[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_viiiiiiiiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'viiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: viiii: " +
          debug_table_viiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  i: " +
          debug_table_i[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_viiiiiiiiiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'viiiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: viiii: " +
          debug_table_viiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_viiiiiiiiiiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'viiiiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: viiii: " +
          debug_table_viiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  i: " +
          debug_table_i[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_viiiiiiiiiiiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'viiiiiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: viiii: " +
          debug_table_viiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  i: " +
          debug_table_i[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_viiiiiiiiiiiiiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'viiiiiiiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: viiii: " +
          debug_table_viiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  v: " +
          debug_table_v[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  i: " +
          debug_table_i[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_viiiiiijiiiiiiii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'viiiiiijiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: viiii: " +
          debug_table_viiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  v: " +
          debug_table_v[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  i: " +
          debug_table_i[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_viiiiiijjjiiiji(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'viiiiiijjjiiiji'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: viiii: " +
          debug_table_viiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  v: " +
          debug_table_v[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  i: " +
          debug_table_i[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_viiiiiijjjiijjiiji(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'viiiiiijjjiijjiiji'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: viiii: " +
          debug_table_viiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  v: " +
          debug_table_v[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  i: " +
          debug_table_i[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_viiiijjjiiiij(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'viiiijjjiiiij'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: viiii: " +
          debug_table_viiii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  v: " +
          debug_table_v[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  i: " +
          debug_table_i[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_viij(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'viij'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: vii: " +
          debug_table_vii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  v: " +
          debug_table_v[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  i: " +
          debug_table_i[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_viijii(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'viijii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: viij: " +
          debug_table_viij[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  v: " +
          debug_table_v[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_viijiiiijji(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'viijiiiijji'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: viij: " +
          debug_table_viij[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  v: " +
          debug_table_v[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_viijj(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'viijj'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: viij: " +
          debug_table_viij[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  v: " +
          debug_table_v[x] +
          "  vij: " +
          debug_table_vij[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  i: " +
          debug_table_i[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_vij(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'vij'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: vi: " +
          debug_table_vi[x] +
          "  viji: " +
          debug_table_viji[x] +
          "  v: " +
          debug_table_v[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  i: " +
          debug_table_i[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    function nullFunc_viji(x) {
      err(
        "Invalid function pointer '" +
          x +
          "' called with signature 'viji'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
      );
      err(
        "This pointer might make sense in another type signature: vij: " +
          debug_table_vij[x] +
          "  vi: " +
          debug_table_vi[x] +
          "  v: " +
          debug_table_v[x] +
          "  vii: " +
          debug_table_vii[x] +
          "  ii: " +
          debug_table_ii[x] +
          "  ji: " +
          debug_table_ji[x] +
          "  jiji: " +
          debug_table_jiji[x] +
          "  viii: " +
          debug_table_viii[x] +
          "  viij: " +
          debug_table_viij[x] +
          "  iij: " +
          debug_table_iij[x] +
          "  iii: " +
          debug_table_iii[x] +
          "  jii: " +
          debug_table_jii[x] +
          "  iiii: " +
          debug_table_iiii[x] +
          "  jiii: " +
          debug_table_jiii[x] +
          "  viiii: " +
          debug_table_viiii[x] +
          "  i: " +
          debug_table_i[x] +
          "  jjii: " +
          debug_table_jjii[x] +
          "  viijj: " +
          debug_table_viijj[x] +
          "  viijii: " +
          debug_table_viijii[x] +
          "  iiiii: " +
          debug_table_iiiii[x] +
          "  iiiij: " +
          debug_table_iiiij[x] +
          "  viiiii: " +
          debug_table_viiiii[x] +
          "  iiiiji: " +
          debug_table_iiiiji[x] +
          "  iiiiid: " +
          debug_table_iiiiid[x] +
          "  iiiiii: " +
          debug_table_iiiiii[x] +
          "  iiiiij: " +
          debug_table_iiiiij[x] +
          "  jiiiii: " +
          debug_table_jiiiii[x] +
          "  jiijjj: " +
          debug_table_jiijjj[x] +
          "  viiiiii: " +
          debug_table_viiiiii[x] +
          "  iiiiiji: " +
          debug_table_iiiiiji[x] +
          "  iiiiiid: " +
          debug_table_iiiiiid[x] +
          "  iiiiiii: " +
          debug_table_iiiiiii[x] +
          "  viiiiiii: " +
          debug_table_viiiiiii[x] +
          "  iiiiiiii: " +
          debug_table_iiiiiiii[x] +
          "  iiiiiiiii: " +
          debug_table_iiiiiiiii[x] +
          "  jiiiiijjj: " +
          debug_table_jiiiiijjj[x] +
          "  viiiiiiiii: " +
          debug_table_viiiiiiiii[x] +
          "  viijiiiijji: " +
          debug_table_viijiiiijji[x] +
          "  iiiiiiiiii: " +
          debug_table_iiiiiiiiii[x] +
          "  viiiiiiiiii: " +
          debug_table_viiiiiiiiii[x] +
          "  viiiiiiiiiii: " +
          debug_table_viiiiiiiiiii[x] +
          "  iiiiiiiijiii: " +
          debug_table_iiiiiiiijiii[x] +
          "  viiiijjjiiiij: " +
          debug_table_viiiijjjiiiij[x] +
          "  iiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiii[x] +
          "  viiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiii[x] +
          "  viiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiii[x] +
          "  iiiiiiiijiiiii: " +
          debug_table_iiiiiiiijiiiii[x] +
          "  viiiiiijjjiiiji: " +
          debug_table_viiiiiijjjiiiji[x] +
          "  iiiiiiiiiiiiii: " +
          debug_table_iiiiiiiiiiiiii[x] +
          "  viiiiiijiiiiiiii: " +
          debug_table_viiiiiijiiiiiiii[x] +
          "  viiiiiiiiiiiiiii: " +
          debug_table_viiiiiiiiiiiiiii[x] +
          "  viiiiiijjjiijjiiji: " +
          debug_table_viiiiiijjjiijjiiji[x] +
          "  "
      );
      abort(x);
    }
    Module["wasmTableSize"] = 2240;
    Module["wasmMaxTableSize"] = 2240;
    function invoke_i(index) {
      var sp = stackSave();
      try {
        return Module["dynCall_i"](index);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_ii(index, a1) {
      var sp = stackSave();
      try {
        return Module["dynCall_ii"](index, a1);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_iii(index, a1, a2) {
      var sp = stackSave();
      try {
        return Module["dynCall_iii"](index, a1, a2);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_iiii(index, a1, a2, a3) {
      var sp = stackSave();
      try {
        return Module["dynCall_iiii"](index, a1, a2, a3);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_iiiii(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        return Module["dynCall_iiiii"](index, a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
      var sp = stackSave();
      try {
        return Module["dynCall_iiiiii"](index, a1, a2, a3, a4, a5);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
        return Module["dynCall_iiiiiii"](index, a1, a2, a3, a4, a5, a6);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
      var sp = stackSave();
      try {
        return Module["dynCall_iiiiiiii"](index, a1, a2, a3, a4, a5, a6, a7);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_iiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
      var sp = stackSave();
      try {
        return Module["dynCall_iiiiiiiii"](
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8
        );
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_iiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
      var sp = stackSave();
      try {
        return Module["dynCall_iiiiiiiiii"](
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9
        );
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_iiiiiiiiiiii(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10,
      a11
    ) {
      var sp = stackSave();
      try {
        return Module["dynCall_iiiiiiiiiiii"](
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9,
          a10,
          a11
        );
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_iiiiiiiiiiiiii(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10,
      a11,
      a12,
      a13
    ) {
      var sp = stackSave();
      try {
        return Module["dynCall_iiiiiiiiiiiiii"](
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9,
          a10,
          a11,
          a12,
          a13
        );
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_iiiiiiiijiii(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10,
      a11,
      a12
    ) {
      var sp = stackSave();
      try {
        return Module["dynCall_iiiiiiiijiii"](
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9,
          a10,
          a11,
          a12
        );
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_iiiiiiiijiiiii(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10,
      a11,
      a12,
      a13,
      a14
    ) {
      var sp = stackSave();
      try {
        return Module["dynCall_iiiiiiiijiiiii"](
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9,
          a10,
          a11,
          a12,
          a13,
          a14
        );
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_iiiiij(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
        return Module["dynCall_iiiiij"](index, a1, a2, a3, a4, a5, a6);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_iiiiiji(index, a1, a2, a3, a4, a5, a6, a7) {
      var sp = stackSave();
      try {
        return Module["dynCall_iiiiiji"](index, a1, a2, a3, a4, a5, a6, a7);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_iiiiji(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
        return Module["dynCall_iiiiji"](index, a1, a2, a3, a4, a5, a6);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_iij(index, a1, a2, a3) {
      var sp = stackSave();
      try {
        return Module["dynCall_iij"](index, a1, a2, a3);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_ji(index, a1) {
      var sp = stackSave();
      try {
        return Module["dynCall_ji"](index, a1);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_jii(index, a1, a2) {
      var sp = stackSave();
      try {
        return Module["dynCall_jii"](index, a1, a2);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_jiii(index, a1, a2, a3) {
      var sp = stackSave();
      try {
        return Module["dynCall_jiii"](index, a1, a2, a3);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_jiiiii(index, a1, a2, a3, a4, a5) {
      var sp = stackSave();
      try {
        return Module["dynCall_jiiiii"](index, a1, a2, a3, a4, a5);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_jiiiiijjj(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10,
      a11
    ) {
      var sp = stackSave();
      try {
        return Module["dynCall_jiiiiijjj"](
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9,
          a10,
          a11
        );
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_jiijjj(index, a1, a2, a3, a4, a5, a6, a7, a8) {
      var sp = stackSave();
      try {
        return Module["dynCall_jiijjj"](index, a1, a2, a3, a4, a5, a6, a7, a8);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_jiji(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        return Module["dynCall_jiji"](index, a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_jjii(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        return Module["dynCall_jjii"](index, a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_v(index) {
      var sp = stackSave();
      try {
        Module["dynCall_v"](index);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_vi(index, a1) {
      var sp = stackSave();
      try {
        Module["dynCall_vi"](index, a1);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_vii(index, a1, a2) {
      var sp = stackSave();
      try {
        Module["dynCall_vii"](index, a1, a2);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_viii(index, a1, a2, a3) {
      var sp = stackSave();
      try {
        Module["dynCall_viii"](index, a1, a2, a3);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_viiii(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        Module["dynCall_viiii"](index, a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_viiiii(index, a1, a2, a3, a4, a5) {
      var sp = stackSave();
      try {
        Module["dynCall_viiiii"](index, a1, a2, a3, a4, a5);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_viiiiii(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
        Module["dynCall_viiiiii"](index, a1, a2, a3, a4, a5, a6);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
      var sp = stackSave();
      try {
        Module["dynCall_viiiiiii"](index, a1, a2, a3, a4, a5, a6, a7);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_viiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
      var sp = stackSave();
      try {
        Module["dynCall_viiiiiiiii"](index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_viiiiiiiiii(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10
    ) {
      var sp = stackSave();
      try {
        Module["dynCall_viiiiiiiiii"](
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9,
          a10
        );
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_viiiiiiiiiii(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10,
      a11
    ) {
      var sp = stackSave();
      try {
        Module["dynCall_viiiiiiiiiii"](
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9,
          a10,
          a11
        );
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_viiiiiiiiiiii(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10,
      a11,
      a12
    ) {
      var sp = stackSave();
      try {
        Module["dynCall_viiiiiiiiiiii"](
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9,
          a10,
          a11,
          a12
        );
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_viiiiiiiiiiiii(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10,
      a11,
      a12,
      a13
    ) {
      var sp = stackSave();
      try {
        Module["dynCall_viiiiiiiiiiiii"](
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9,
          a10,
          a11,
          a12,
          a13
        );
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_viiiiiiiiiiiiiii(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10,
      a11,
      a12,
      a13,
      a14,
      a15
    ) {
      var sp = stackSave();
      try {
        Module["dynCall_viiiiiiiiiiiiiii"](
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9,
          a10,
          a11,
          a12,
          a13,
          a14,
          a15
        );
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_viiiiiijiiiiiiii(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10,
      a11,
      a12,
      a13,
      a14,
      a15,
      a16
    ) {
      var sp = stackSave();
      try {
        Module["dynCall_viiiiiijiiiiiiii"](
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9,
          a10,
          a11,
          a12,
          a13,
          a14,
          a15,
          a16
        );
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_viiiiiijjjiiiji(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10,
      a11,
      a12,
      a13,
      a14,
      a15,
      a16,
      a17,
      a18
    ) {
      var sp = stackSave();
      try {
        Module["dynCall_viiiiiijjjiiiji"](
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9,
          a10,
          a11,
          a12,
          a13,
          a14,
          a15,
          a16,
          a17,
          a18
        );
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_viiiiiijjjiijjiiji(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10,
      a11,
      a12,
      a13,
      a14,
      a15,
      a16,
      a17,
      a18,
      a19,
      a20,
      a21,
      a22,
      a23
    ) {
      var sp = stackSave();
      try {
        Module["dynCall_viiiiiijjjiijjiiji"](
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9,
          a10,
          a11,
          a12,
          a13,
          a14,
          a15,
          a16,
          a17,
          a18,
          a19,
          a20,
          a21,
          a22,
          a23
        );
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_viiiijjjiiiij(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10,
      a11,
      a12,
      a13,
      a14,
      a15,
      a16
    ) {
      var sp = stackSave();
      try {
        Module["dynCall_viiiijjjiiiij"](
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9,
          a10,
          a11,
          a12,
          a13,
          a14,
          a15,
          a16
        );
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_viij(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        Module["dynCall_viij"](index, a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_viijii(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
        Module["dynCall_viijii"](index, a1, a2, a3, a4, a5, a6);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_viijiiiijji(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10,
      a11,
      a12,
      a13
    ) {
      var sp = stackSave();
      try {
        Module["dynCall_viijiiiijji"](
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9,
          a10,
          a11,
          a12,
          a13
        );
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_viijj(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
        Module["dynCall_viijj"](index, a1, a2, a3, a4, a5, a6);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_vij(index, a1, a2, a3) {
      var sp = stackSave();
      try {
        Module["dynCall_vij"](index, a1, a2, a3);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    function invoke_viji(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        Module["dynCall_viji"](index, a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (typeof e !== "number" && e !== "longjmp") throw e;
        Module["setThrew"](1, 0);
      }
    }
    Module.asmGlobalArg = {};
    Module.asmLibraryArg = {
      enlargeMemory: enlargeMemory,
      getTotalMemory: getTotalMemory,
      abortOnCannotGrowMemory: abortOnCannotGrowMemory,
      abortStackOverflow: abortStackOverflow,
      nullFunc_i: nullFunc_i,
      nullFunc_ii: nullFunc_ii,
      nullFunc_iii: nullFunc_iii,
      nullFunc_iiii: nullFunc_iiii,
      nullFunc_iiiii: nullFunc_iiiii,
      nullFunc_iiiiid: nullFunc_iiiiid,
      nullFunc_iiiiii: nullFunc_iiiiii,
      nullFunc_iiiiiid: nullFunc_iiiiiid,
      nullFunc_iiiiiii: nullFunc_iiiiiii,
      nullFunc_iiiiiiii: nullFunc_iiiiiiii,
      nullFunc_iiiiiiiii: nullFunc_iiiiiiiii,
      nullFunc_iiiiiiiiii: nullFunc_iiiiiiiiii,
      nullFunc_iiiiiiiiiiii: nullFunc_iiiiiiiiiiii,
      nullFunc_iiiiiiiiiiiiii: nullFunc_iiiiiiiiiiiiii,
      nullFunc_iiiiiiiijiii: nullFunc_iiiiiiiijiii,
      nullFunc_iiiiiiiijiiiii: nullFunc_iiiiiiiijiiiii,
      nullFunc_iiiiij: nullFunc_iiiiij,
      nullFunc_iiiiiji: nullFunc_iiiiiji,
      nullFunc_iiiij: nullFunc_iiiij,
      nullFunc_iiiiji: nullFunc_iiiiji,
      nullFunc_iij: nullFunc_iij,
      nullFunc_ji: nullFunc_ji,
      nullFunc_jii: nullFunc_jii,
      nullFunc_jiii: nullFunc_jiii,
      nullFunc_jiiiii: nullFunc_jiiiii,
      nullFunc_jiiiiijjj: nullFunc_jiiiiijjj,
      nullFunc_jiijjj: nullFunc_jiijjj,
      nullFunc_jiji: nullFunc_jiji,
      nullFunc_jjii: nullFunc_jjii,
      nullFunc_v: nullFunc_v,
      nullFunc_vi: nullFunc_vi,
      nullFunc_vii: nullFunc_vii,
      nullFunc_viii: nullFunc_viii,
      nullFunc_viiii: nullFunc_viiii,
      nullFunc_viiiii: nullFunc_viiiii,
      nullFunc_viiiiii: nullFunc_viiiiii,
      nullFunc_viiiiiii: nullFunc_viiiiiii,
      nullFunc_viiiiiiiii: nullFunc_viiiiiiiii,
      nullFunc_viiiiiiiiii: nullFunc_viiiiiiiiii,
      nullFunc_viiiiiiiiiii: nullFunc_viiiiiiiiiii,
      nullFunc_viiiiiiiiiiii: nullFunc_viiiiiiiiiiii,
      nullFunc_viiiiiiiiiiiii: nullFunc_viiiiiiiiiiiii,
      nullFunc_viiiiiiiiiiiiiii: nullFunc_viiiiiiiiiiiiiii,
      nullFunc_viiiiiijiiiiiiii: nullFunc_viiiiiijiiiiiiii,
      nullFunc_viiiiiijjjiiiji: nullFunc_viiiiiijjjiiiji,
      nullFunc_viiiiiijjjiijjiiji: nullFunc_viiiiiijjjiijjiiji,
      nullFunc_viiiijjjiiiij: nullFunc_viiiijjjiiiij,
      nullFunc_viij: nullFunc_viij,
      nullFunc_viijii: nullFunc_viijii,
      nullFunc_viijiiiijji: nullFunc_viijiiiijji,
      nullFunc_viijj: nullFunc_viijj,
      nullFunc_vij: nullFunc_vij,
      nullFunc_viji: nullFunc_viji,
      invoke_i: invoke_i,
      invoke_ii: invoke_ii,
      invoke_iii: invoke_iii,
      invoke_iiii: invoke_iiii,
      invoke_iiiii: invoke_iiiii,
      invoke_iiiiii: invoke_iiiiii,
      invoke_iiiiiii: invoke_iiiiiii,
      invoke_iiiiiiii: invoke_iiiiiiii,
      invoke_iiiiiiiii: invoke_iiiiiiiii,
      invoke_iiiiiiiiii: invoke_iiiiiiiiii,
      invoke_iiiiiiiiiiii: invoke_iiiiiiiiiiii,
      invoke_iiiiiiiiiiiiii: invoke_iiiiiiiiiiiiii,
      invoke_iiiiiiiijiii: invoke_iiiiiiiijiii,
      invoke_iiiiiiiijiiiii: invoke_iiiiiiiijiiiii,
      invoke_iiiiij: invoke_iiiiij,
      invoke_iiiiiji: invoke_iiiiiji,
      invoke_iiiiji: invoke_iiiiji,
      invoke_iij: invoke_iij,
      invoke_ji: invoke_ji,
      invoke_jii: invoke_jii,
      invoke_jiii: invoke_jiii,
      invoke_jiiiii: invoke_jiiiii,
      invoke_jiiiiijjj: invoke_jiiiiijjj,
      invoke_jiijjj: invoke_jiijjj,
      invoke_jiji: invoke_jiji,
      invoke_jjii: invoke_jjii,
      invoke_v: invoke_v,
      invoke_vi: invoke_vi,
      invoke_vii: invoke_vii,
      invoke_viii: invoke_viii,
      invoke_viiii: invoke_viiii,
      invoke_viiiii: invoke_viiiii,
      invoke_viiiiii: invoke_viiiiii,
      invoke_viiiiiii: invoke_viiiiiii,
      invoke_viiiiiiiii: invoke_viiiiiiiii,
      invoke_viiiiiiiiii: invoke_viiiiiiiiii,
      invoke_viiiiiiiiiii: invoke_viiiiiiiiiii,
      invoke_viiiiiiiiiiii: invoke_viiiiiiiiiiii,
      invoke_viiiiiiiiiiiii: invoke_viiiiiiiiiiiii,
      invoke_viiiiiiiiiiiiiii: invoke_viiiiiiiiiiiiiii,
      invoke_viiiiiijiiiiiiii: invoke_viiiiiijiiiiiiii,
      invoke_viiiiiijjjiiiji: invoke_viiiiiijjjiiiji,
      invoke_viiiiiijjjiijjiiji: invoke_viiiiiijjjiijjiiji,
      invoke_viiiijjjiiiij: invoke_viiiijjjiiiij,
      invoke_viij: invoke_viij,
      invoke_viijii: invoke_viijii,
      invoke_viijiiiijji: invoke_viijiiiijji,
      invoke_viijj: invoke_viijj,
      invoke_vij: invoke_vij,
      invoke_viji: invoke_viji,
      ___assert_fail: ___assert_fail,
      ___atomic_fetch_add_8: ___atomic_fetch_add_8,
      ___buildEnvironment: ___buildEnvironment,
      ___cxa_allocate_exception: ___cxa_allocate_exception,
      ___cxa_begin_catch: ___cxa_begin_catch,
      ___cxa_end_catch: ___cxa_end_catch,
      ___cxa_find_matching_catch_2: ___cxa_find_matching_catch_2,
      ___cxa_find_matching_catch_3: ___cxa_find_matching_catch_3,
      ___cxa_free_exception: ___cxa_free_exception,
      ___cxa_pure_virtual: ___cxa_pure_virtual,
      ___cxa_rethrow: ___cxa_rethrow,
      ___cxa_throw: ___cxa_throw,
      ___cxa_uncaught_exception: ___cxa_uncaught_exception,
      ___lock: ___lock,
      ___map_file: ___map_file,
      ___resumeException: ___resumeException,
      ___setErrNo: ___setErrNo,
      ___syscall140: ___syscall140,
      ___syscall145: ___syscall145,
      ___syscall146: ___syscall146,
      ___syscall221: ___syscall221,
      ___syscall3: ___syscall3,
      ___syscall5: ___syscall5,
      ___syscall54: ___syscall54,
      ___syscall6: ___syscall6,
      ___syscall91: ___syscall91,
      ___unlock: ___unlock,
      __embind_register_bool: __embind_register_bool,
      __embind_register_emval: __embind_register_emval,
      __embind_register_float: __embind_register_float,
      __embind_register_function: __embind_register_function,
      __embind_register_integer: __embind_register_integer,
      __embind_register_memory_view: __embind_register_memory_view,
      __embind_register_std_string: __embind_register_std_string,
      __embind_register_std_wstring: __embind_register_std_wstring,
      __embind_register_void: __embind_register_void,
      _abort: _abort,
      _atexit: _atexit,
      _emscripten_asm_const_iii: _emscripten_asm_const_iii,
      _emscripten_memcpy_big: _emscripten_memcpy_big,
      _err: _err,
      _errx: _errx,
      _getenv: _getenv,
      _gmtime_r: _gmtime_r,
      _llvm_bswap_i64: _llvm_bswap_i64,
      _llvm_eh_typeid_for: _llvm_eh_typeid_for,
      _llvm_stackrestore: _llvm_stackrestore,
      _llvm_stacksave: _llvm_stacksave,
      _llvm_trap: _llvm_trap,
      _mktime: _mktime,
      _pthread_cond_wait: _pthread_cond_wait,
      _pthread_getspecific: _pthread_getspecific,
      _pthread_key_create: _pthread_key_create,
      _pthread_mutex_init: _pthread_mutex_init,
      _pthread_once: _pthread_once,
      _pthread_setspecific: _pthread_setspecific,
      _signal: _signal,
      _strftime_l: _strftime_l,
      _sysconf: _sysconf,
      _time: _time,
      DYNAMICTOP_PTR: DYNAMICTOP_PTR,
      STACKTOP: STACKTOP,
      STACK_MAX: STACK_MAX
    };
    var asm = Module["asm"](Module.asmGlobalArg, Module.asmLibraryArg, buffer);
    var real___GLOBAL__I_000101 = asm["__GLOBAL__I_000101"];
    asm["__GLOBAL__I_000101"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__I_000101.apply(null, arguments);
    };
    var real___GLOBAL__sub_I_account_cpp = asm["__GLOBAL__sub_I_account_cpp"];
    asm["__GLOBAL__sub_I_account_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_account_cpp.apply(null, arguments);
    };
    var real___GLOBAL__sub_I_base58_cpp = asm["__GLOBAL__sub_I_base58_cpp"];
    asm["__GLOBAL__sub_I_base58_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_base58_cpp.apply(null, arguments);
    };
    var real___GLOBAL__sub_I_bind_cpp = asm["__GLOBAL__sub_I_bind_cpp"];
    asm["__GLOBAL__sub_I_bind_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_bind_cpp.apply(null, arguments);
    };
    var real___GLOBAL__sub_I_bulletproofs_cc =
      asm["__GLOBAL__sub_I_bulletproofs_cc"];
    asm["__GLOBAL__sub_I_bulletproofs_cc"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_bulletproofs_cc.apply(null, arguments);
    };
    var real___GLOBAL__sub_I_crypto_cpp = asm["__GLOBAL__sub_I_crypto_cpp"];
    asm["__GLOBAL__sub_I_crypto_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_crypto_cpp.apply(null, arguments);
    };
    var real___GLOBAL__sub_I_cryptonote_basic_impl_cpp =
      asm["__GLOBAL__sub_I_cryptonote_basic_impl_cpp"];
    asm["__GLOBAL__sub_I_cryptonote_basic_impl_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_cryptonote_basic_impl_cpp.apply(
        null,
        arguments
      );
    };
    var real___GLOBAL__sub_I_cryptonote_format_utils_cpp =
      asm["__GLOBAL__sub_I_cryptonote_format_utils_cpp"];
    asm["__GLOBAL__sub_I_cryptonote_format_utils_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_cryptonote_format_utils_cpp.apply(
        null,
        arguments
      );
    };
    var real___GLOBAL__sub_I_cryptonote_tx_utils_cpp =
      asm["__GLOBAL__sub_I_cryptonote_tx_utils_cpp"];
    asm["__GLOBAL__sub_I_cryptonote_tx_utils_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_cryptonote_tx_utils_cpp.apply(
        null,
        arguments
      );
    };
    var real___GLOBAL__sub_I_device_cpp = asm["__GLOBAL__sub_I_device_cpp"];
    asm["__GLOBAL__sub_I_device_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_device_cpp.apply(null, arguments);
    };
    var real___GLOBAL__sub_I_device_default_cpp =
      asm["__GLOBAL__sub_I_device_default_cpp"];
    asm["__GLOBAL__sub_I_device_default_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_device_default_cpp.apply(null, arguments);
    };
    var real___GLOBAL__sub_I_electrum_words_cpp =
      asm["__GLOBAL__sub_I_electrum_words_cpp"];
    asm["__GLOBAL__sub_I_electrum_words_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_electrum_words_cpp.apply(null, arguments);
    };
    var real___GLOBAL__sub_I_emscr_async_send_bridge_cpp =
      asm["__GLOBAL__sub_I_emscr_async_send_bridge_cpp"];
    asm["__GLOBAL__sub_I_emscr_async_send_bridge_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_emscr_async_send_bridge_cpp.apply(
        null,
        arguments
      );
    };
    var real___GLOBAL__sub_I_hex_cpp = asm["__GLOBAL__sub_I_hex_cpp"];
    asm["__GLOBAL__sub_I_hex_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_hex_cpp.apply(null, arguments);
    };
    var real___GLOBAL__sub_I_index_cpp = asm["__GLOBAL__sub_I_index_cpp"];
    asm["__GLOBAL__sub_I_index_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_index_cpp.apply(null, arguments);
    };
    var real___GLOBAL__sub_I_iostream_cpp = asm["__GLOBAL__sub_I_iostream_cpp"];
    asm["__GLOBAL__sub_I_iostream_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_iostream_cpp.apply(null, arguments);
    };
    var real___GLOBAL__sub_I_logger_cpp = asm["__GLOBAL__sub_I_logger_cpp"];
    asm["__GLOBAL__sub_I_logger_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_logger_cpp.apply(null, arguments);
    };
    var real___GLOBAL__sub_I_monero_address_utils_cpp =
      asm["__GLOBAL__sub_I_monero_address_utils_cpp"];
    asm["__GLOBAL__sub_I_monero_address_utils_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_monero_address_utils_cpp.apply(
        null,
        arguments
      );
    };
    var real___GLOBAL__sub_I_monero_fee_utils_cpp =
      asm["__GLOBAL__sub_I_monero_fee_utils_cpp"];
    asm["__GLOBAL__sub_I_monero_fee_utils_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_monero_fee_utils_cpp.apply(null, arguments);
    };
    var real___GLOBAL__sub_I_monero_key_image_utils_cpp =
      asm["__GLOBAL__sub_I_monero_key_image_utils_cpp"];
    asm["__GLOBAL__sub_I_monero_key_image_utils_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_monero_key_image_utils_cpp.apply(
        null,
        arguments
      );
    };
    var real___GLOBAL__sub_I_monero_paymentID_utils_cpp =
      asm["__GLOBAL__sub_I_monero_paymentID_utils_cpp"];
    asm["__GLOBAL__sub_I_monero_paymentID_utils_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_monero_paymentID_utils_cpp.apply(
        null,
        arguments
      );
    };
    var real___GLOBAL__sub_I_monero_send_routine_cpp =
      asm["__GLOBAL__sub_I_monero_send_routine_cpp"];
    asm["__GLOBAL__sub_I_monero_send_routine_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_monero_send_routine_cpp.apply(
        null,
        arguments
      );
    };
    var real___GLOBAL__sub_I_monero_transfer_utils_cpp =
      asm["__GLOBAL__sub_I_monero_transfer_utils_cpp"];
    asm["__GLOBAL__sub_I_monero_transfer_utils_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_monero_transfer_utils_cpp.apply(
        null,
        arguments
      );
    };
    var real___GLOBAL__sub_I_monero_wallet_utils_cpp =
      asm["__GLOBAL__sub_I_monero_wallet_utils_cpp"];
    asm["__GLOBAL__sub_I_monero_wallet_utils_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_monero_wallet_utils_cpp.apply(
        null,
        arguments
      );
    };
    var real___GLOBAL__sub_I_multiexp_cc = asm["__GLOBAL__sub_I_multiexp_cc"];
    asm["__GLOBAL__sub_I_multiexp_cc"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_multiexp_cc.apply(null, arguments);
    };
    var real___GLOBAL__sub_I_rctOps_cpp = asm["__GLOBAL__sub_I_rctOps_cpp"];
    asm["__GLOBAL__sub_I_rctOps_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_rctOps_cpp.apply(null, arguments);
    };
    var real___GLOBAL__sub_I_rctSigs_cpp = asm["__GLOBAL__sub_I_rctSigs_cpp"];
    asm["__GLOBAL__sub_I_rctSigs_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_rctSigs_cpp.apply(null, arguments);
    };
    var real___GLOBAL__sub_I_rctTypes_cpp = asm["__GLOBAL__sub_I_rctTypes_cpp"];
    asm["__GLOBAL__sub_I_rctTypes_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_rctTypes_cpp.apply(null, arguments);
    };
    var real___GLOBAL__sub_I_serial_bridge_index_cpp =
      asm["__GLOBAL__sub_I_serial_bridge_index_cpp"];
    asm["__GLOBAL__sub_I_serial_bridge_index_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_serial_bridge_index_cpp.apply(
        null,
        arguments
      );
    };
    var real___GLOBAL__sub_I_serial_bridge_utils_cpp =
      asm["__GLOBAL__sub_I_serial_bridge_utils_cpp"];
    asm["__GLOBAL__sub_I_serial_bridge_utils_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_serial_bridge_utils_cpp.apply(
        null,
        arguments
      );
    };
    var real___GLOBAL__sub_I_string_tools_cpp =
      asm["__GLOBAL__sub_I_string_tools_cpp"];
    asm["__GLOBAL__sub_I_string_tools_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_string_tools_cpp.apply(null, arguments);
    };
    var real___GLOBAL__sub_I_threadpool_cpp =
      asm["__GLOBAL__sub_I_threadpool_cpp"];
    asm["__GLOBAL__sub_I_threadpool_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_threadpool_cpp.apply(null, arguments);
    };
    var real___GLOBAL__sub_I_tools__ret_vals_cpp =
      asm["__GLOBAL__sub_I_tools__ret_vals_cpp"];
    asm["__GLOBAL__sub_I_tools__ret_vals_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_tools__ret_vals_cpp.apply(null, arguments);
    };
    var real___GLOBAL__sub_I_util_cpp = asm["__GLOBAL__sub_I_util_cpp"];
    asm["__GLOBAL__sub_I_util_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_util_cpp.apply(null, arguments);
    };
    var real___GLOBAL__sub_I_wipeable_string_cpp =
      asm["__GLOBAL__sub_I_wipeable_string_cpp"];
    asm["__GLOBAL__sub_I_wipeable_string_cpp"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___GLOBAL__sub_I_wipeable_string_cpp.apply(null, arguments);
    };
    var real___ZSt18uncaught_exceptionv = asm["__ZSt18uncaught_exceptionv"];
    asm["__ZSt18uncaught_exceptionv"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___ZSt18uncaught_exceptionv.apply(null, arguments);
    };
    var real____cxa_can_catch = asm["___cxa_can_catch"];
    asm["___cxa_can_catch"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real____cxa_can_catch.apply(null, arguments);
    };
    var real____cxa_demangle = asm["___cxa_demangle"];
    asm["___cxa_demangle"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real____cxa_demangle.apply(null, arguments);
    };
    var real____cxa_is_pointer_type = asm["___cxa_is_pointer_type"];
    asm["___cxa_is_pointer_type"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real____cxa_is_pointer_type.apply(null, arguments);
    };
    var real____cxx_global_var_init_38 = asm["___cxx_global_var_init_38"];
    asm["___cxx_global_var_init_38"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real____cxx_global_var_init_38.apply(null, arguments);
    };
    var real____cxx_global_var_init_39 = asm["___cxx_global_var_init_39"];
    asm["___cxx_global_var_init_39"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real____cxx_global_var_init_39.apply(null, arguments);
    };
    var real____cxx_global_var_init_40 = asm["___cxx_global_var_init_40"];
    asm["___cxx_global_var_init_40"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real____cxx_global_var_init_40.apply(null, arguments);
    };
    var real____emscripten_environ_constructor =
      asm["___emscripten_environ_constructor"];
    asm["___emscripten_environ_constructor"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real____emscripten_environ_constructor.apply(null, arguments);
    };
    var real____errno_location = asm["___errno_location"];
    asm["___errno_location"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real____errno_location.apply(null, arguments);
    };
    var real____getTypeName = asm["___getTypeName"];
    asm["___getTypeName"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real____getTypeName.apply(null, arguments);
    };
    var real___get_daylight = asm["__get_daylight"];
    asm["__get_daylight"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___get_daylight.apply(null, arguments);
    };
    var real___get_timezone = asm["__get_timezone"];
    asm["__get_timezone"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___get_timezone.apply(null, arguments);
    };
    var real___get_tzname = asm["__get_tzname"];
    asm["__get_tzname"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real___get_tzname.apply(null, arguments);
    };
    var real__fflush = asm["_fflush"];
    asm["_fflush"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real__fflush.apply(null, arguments);
    };
    var real__free = asm["_free"];
    asm["_free"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real__free.apply(null, arguments);
    };
    var real__i64Add = asm["_i64Add"];
    asm["_i64Add"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real__i64Add.apply(null, arguments);
    };
    var real__init_random = asm["_init_random"];
    asm["_init_random"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real__init_random.apply(null, arguments);
    };
    var real__llvm_bswap_i32 = asm["_llvm_bswap_i32"];
    asm["_llvm_bswap_i32"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real__llvm_bswap_i32.apply(null, arguments);
    };
    var real__main = asm["_main"];
    asm["_main"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real__main.apply(null, arguments);
    };
    var real__malloc = asm["_malloc"];
    asm["_malloc"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real__malloc.apply(null, arguments);
    };
    var real__memmove = asm["_memmove"];
    asm["_memmove"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real__memmove.apply(null, arguments);
    };
    var real__pthread_cond_broadcast = asm["_pthread_cond_broadcast"];
    asm["_pthread_cond_broadcast"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real__pthread_cond_broadcast.apply(null, arguments);
    };
    var real__pthread_mutex_lock = asm["_pthread_mutex_lock"];
    asm["_pthread_mutex_lock"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real__pthread_mutex_lock.apply(null, arguments);
    };
    var real__pthread_mutex_unlock = asm["_pthread_mutex_unlock"];
    asm["_pthread_mutex_unlock"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real__pthread_mutex_unlock.apply(null, arguments);
    };
    var real__sbrk = asm["_sbrk"];
    asm["_sbrk"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real__sbrk.apply(null, arguments);
    };
    var real_establishStackSpace = asm["establishStackSpace"];
    asm["establishStackSpace"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real_establishStackSpace.apply(null, arguments);
    };
    var real_getTempRet0 = asm["getTempRet0"];
    asm["getTempRet0"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real_getTempRet0.apply(null, arguments);
    };
    var real_setTempRet0 = asm["setTempRet0"];
    asm["setTempRet0"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real_setTempRet0.apply(null, arguments);
    };
    var real_setThrew = asm["setThrew"];
    asm["setThrew"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real_setThrew.apply(null, arguments);
    };
    var real_stackAlloc = asm["stackAlloc"];
    asm["stackAlloc"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real_stackAlloc.apply(null, arguments);
    };
    var real_stackRestore = asm["stackRestore"];
    asm["stackRestore"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real_stackRestore.apply(null, arguments);
    };
    var real_stackSave = asm["stackSave"];
    asm["stackSave"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return real_stackSave.apply(null, arguments);
    };
    Module["asm"] = asm;
    var __GLOBAL__I_000101 = (Module["__GLOBAL__I_000101"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__I_000101"].apply(null, arguments);
    });
    var __GLOBAL__sub_I_account_cpp = (Module[
      "__GLOBAL__sub_I_account_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_account_cpp"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_base58_cpp = (Module[
      "__GLOBAL__sub_I_base58_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_base58_cpp"].apply(null, arguments);
    });
    var __GLOBAL__sub_I_bind_cpp = (Module[
      "__GLOBAL__sub_I_bind_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_bind_cpp"].apply(null, arguments);
    });
    var __GLOBAL__sub_I_bulletproofs_cc = (Module[
      "__GLOBAL__sub_I_bulletproofs_cc"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_bulletproofs_cc"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_crypto_cpp = (Module[
      "__GLOBAL__sub_I_crypto_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_crypto_cpp"].apply(null, arguments);
    });
    var __GLOBAL__sub_I_cryptonote_basic_impl_cpp = (Module[
      "__GLOBAL__sub_I_cryptonote_basic_impl_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_cryptonote_basic_impl_cpp"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_cryptonote_format_utils_cpp = (Module[
      "__GLOBAL__sub_I_cryptonote_format_utils_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_cryptonote_format_utils_cpp"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_cryptonote_tx_utils_cpp = (Module[
      "__GLOBAL__sub_I_cryptonote_tx_utils_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_cryptonote_tx_utils_cpp"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_device_cpp = (Module[
      "__GLOBAL__sub_I_device_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_device_cpp"].apply(null, arguments);
    });
    var __GLOBAL__sub_I_device_default_cpp = (Module[
      "__GLOBAL__sub_I_device_default_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_device_default_cpp"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_electrum_words_cpp = (Module[
      "__GLOBAL__sub_I_electrum_words_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_electrum_words_cpp"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_emscr_async_send_bridge_cpp = (Module[
      "__GLOBAL__sub_I_emscr_async_send_bridge_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_emscr_async_send_bridge_cpp"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_hex_cpp = (Module[
      "__GLOBAL__sub_I_hex_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_hex_cpp"].apply(null, arguments);
    });
    var __GLOBAL__sub_I_index_cpp = (Module[
      "__GLOBAL__sub_I_index_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_index_cpp"].apply(null, arguments);
    });
    var __GLOBAL__sub_I_iostream_cpp = (Module[
      "__GLOBAL__sub_I_iostream_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_iostream_cpp"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_logger_cpp = (Module[
      "__GLOBAL__sub_I_logger_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_logger_cpp"].apply(null, arguments);
    });
    var __GLOBAL__sub_I_monero_address_utils_cpp = (Module[
      "__GLOBAL__sub_I_monero_address_utils_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_monero_address_utils_cpp"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_monero_fee_utils_cpp = (Module[
      "__GLOBAL__sub_I_monero_fee_utils_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_monero_fee_utils_cpp"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_monero_key_image_utils_cpp = (Module[
      "__GLOBAL__sub_I_monero_key_image_utils_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_monero_key_image_utils_cpp"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_monero_paymentID_utils_cpp = (Module[
      "__GLOBAL__sub_I_monero_paymentID_utils_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_monero_paymentID_utils_cpp"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_monero_send_routine_cpp = (Module[
      "__GLOBAL__sub_I_monero_send_routine_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_monero_send_routine_cpp"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_monero_transfer_utils_cpp = (Module[
      "__GLOBAL__sub_I_monero_transfer_utils_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_monero_transfer_utils_cpp"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_monero_wallet_utils_cpp = (Module[
      "__GLOBAL__sub_I_monero_wallet_utils_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_monero_wallet_utils_cpp"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_multiexp_cc = (Module[
      "__GLOBAL__sub_I_multiexp_cc"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_multiexp_cc"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_rctOps_cpp = (Module[
      "__GLOBAL__sub_I_rctOps_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_rctOps_cpp"].apply(null, arguments);
    });
    var __GLOBAL__sub_I_rctSigs_cpp = (Module[
      "__GLOBAL__sub_I_rctSigs_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_rctSigs_cpp"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_rctTypes_cpp = (Module[
      "__GLOBAL__sub_I_rctTypes_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_rctTypes_cpp"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_serial_bridge_index_cpp = (Module[
      "__GLOBAL__sub_I_serial_bridge_index_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_serial_bridge_index_cpp"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_serial_bridge_utils_cpp = (Module[
      "__GLOBAL__sub_I_serial_bridge_utils_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_serial_bridge_utils_cpp"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_string_tools_cpp = (Module[
      "__GLOBAL__sub_I_string_tools_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_string_tools_cpp"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_threadpool_cpp = (Module[
      "__GLOBAL__sub_I_threadpool_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_threadpool_cpp"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_tools__ret_vals_cpp = (Module[
      "__GLOBAL__sub_I_tools__ret_vals_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_tools__ret_vals_cpp"].apply(
        null,
        arguments
      );
    });
    var __GLOBAL__sub_I_util_cpp = (Module[
      "__GLOBAL__sub_I_util_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_util_cpp"].apply(null, arguments);
    });
    var __GLOBAL__sub_I_wipeable_string_cpp = (Module[
      "__GLOBAL__sub_I_wipeable_string_cpp"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__GLOBAL__sub_I_wipeable_string_cpp"].apply(
        null,
        arguments
      );
    });
    var __ZSt18uncaught_exceptionv = (Module[
      "__ZSt18uncaught_exceptionv"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__ZSt18uncaught_exceptionv"].apply(null, arguments);
    });
    var ___cxa_can_catch = (Module["___cxa_can_catch"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["___cxa_can_catch"].apply(null, arguments);
    });
    var ___cxa_demangle = (Module["___cxa_demangle"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["___cxa_demangle"].apply(null, arguments);
    });
    var ___cxa_is_pointer_type = (Module[
      "___cxa_is_pointer_type"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["___cxa_is_pointer_type"].apply(null, arguments);
    });
    var ___cxx_global_var_init_38 = (Module[
      "___cxx_global_var_init_38"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["___cxx_global_var_init_38"].apply(null, arguments);
    });
    var ___cxx_global_var_init_39 = (Module[
      "___cxx_global_var_init_39"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["___cxx_global_var_init_39"].apply(null, arguments);
    });
    var ___cxx_global_var_init_40 = (Module[
      "___cxx_global_var_init_40"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["___cxx_global_var_init_40"].apply(null, arguments);
    });
    var ___emscripten_environ_constructor = (Module[
      "___emscripten_environ_constructor"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["___emscripten_environ_constructor"].apply(
        null,
        arguments
      );
    });
    var ___errno_location = (Module["___errno_location"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["___errno_location"].apply(null, arguments);
    });
    var ___getTypeName = (Module["___getTypeName"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["___getTypeName"].apply(null, arguments);
    });
    var __get_daylight = (Module["__get_daylight"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__get_daylight"].apply(null, arguments);
    });
    var __get_timezone = (Module["__get_timezone"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__get_timezone"].apply(null, arguments);
    });
    var __get_tzname = (Module["__get_tzname"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["__get_tzname"].apply(null, arguments);
    });
    var _emscripten_replace_memory = (Module[
      "_emscripten_replace_memory"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["_emscripten_replace_memory"].apply(null, arguments);
    });
    var _fflush = (Module["_fflush"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["_fflush"].apply(null, arguments);
    });
    var _free = (Module["_free"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["_free"].apply(null, arguments);
    });
    var _i64Add = (Module["_i64Add"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["_i64Add"].apply(null, arguments);
    });
    var _init_random = (Module["_init_random"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["_init_random"].apply(null, arguments);
    });
    var _llvm_bswap_i32 = (Module["_llvm_bswap_i32"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["_llvm_bswap_i32"].apply(null, arguments);
    });
    var _main = (Module["_main"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["_main"].apply(null, arguments);
    });
    var _malloc = (Module["_malloc"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["_malloc"].apply(null, arguments);
    });
    var _memmove = (Module["_memmove"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["_memmove"].apply(null, arguments);
    });
    var _pthread_cond_broadcast = (Module[
      "_pthread_cond_broadcast"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["_pthread_cond_broadcast"].apply(null, arguments);
    });
    var _pthread_mutex_lock = (Module["_pthread_mutex_lock"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["_pthread_mutex_lock"].apply(null, arguments);
    });
    var _pthread_mutex_unlock = (Module["_pthread_mutex_unlock"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["_pthread_mutex_unlock"].apply(null, arguments);
    });
    var _sbrk = (Module["_sbrk"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["_sbrk"].apply(null, arguments);
    });
    var establishStackSpace = (Module["establishStackSpace"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["establishStackSpace"].apply(null, arguments);
    });
    var getTempRet0 = (Module["getTempRet0"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["getTempRet0"].apply(null, arguments);
    });
    var setTempRet0 = (Module["setTempRet0"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["setTempRet0"].apply(null, arguments);
    });
    var setThrew = (Module["setThrew"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["setThrew"].apply(null, arguments);
    });
    var stackAlloc = (Module["stackAlloc"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["stackAlloc"].apply(null, arguments);
    });
    var stackRestore = (Module["stackRestore"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["stackRestore"].apply(null, arguments);
    });
    var stackSave = (Module["stackSave"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["stackSave"].apply(null, arguments);
    });
    var dynCall_i = (Module["dynCall_i"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_i"].apply(null, arguments);
    });
    var dynCall_ii = (Module["dynCall_ii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_ii"].apply(null, arguments);
    });
    var dynCall_iii = (Module["dynCall_iii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_iii"].apply(null, arguments);
    });
    var dynCall_iiii = (Module["dynCall_iiii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_iiii"].apply(null, arguments);
    });
    var dynCall_iiiii = (Module["dynCall_iiiii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_iiiii"].apply(null, arguments);
    });
    var dynCall_iiiiid = (Module["dynCall_iiiiid"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_iiiiid"].apply(null, arguments);
    });
    var dynCall_iiiiii = (Module["dynCall_iiiiii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_iiiiii"].apply(null, arguments);
    });
    var dynCall_iiiiiid = (Module["dynCall_iiiiiid"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_iiiiiid"].apply(null, arguments);
    });
    var dynCall_iiiiiii = (Module["dynCall_iiiiiii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_iiiiiii"].apply(null, arguments);
    });
    var dynCall_iiiiiiii = (Module["dynCall_iiiiiiii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_iiiiiiii"].apply(null, arguments);
    });
    var dynCall_iiiiiiiii = (Module["dynCall_iiiiiiiii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_iiiiiiiii"].apply(null, arguments);
    });
    var dynCall_iiiiiiiiii = (Module["dynCall_iiiiiiiiii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_iiiiiiiiii"].apply(null, arguments);
    });
    var dynCall_iiiiiiiiiiii = (Module["dynCall_iiiiiiiiiiii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_iiiiiiiiiiii"].apply(null, arguments);
    });
    var dynCall_iiiiiiiiiiiiii = (Module[
      "dynCall_iiiiiiiiiiiiii"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_iiiiiiiiiiiiii"].apply(null, arguments);
    });
    var dynCall_iiiiiiiijiii = (Module["dynCall_iiiiiiiijiii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_iiiiiiiijiii"].apply(null, arguments);
    });
    var dynCall_iiiiiiiijiiiii = (Module[
      "dynCall_iiiiiiiijiiiii"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_iiiiiiiijiiiii"].apply(null, arguments);
    });
    var dynCall_iiiiij = (Module["dynCall_iiiiij"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_iiiiij"].apply(null, arguments);
    });
    var dynCall_iiiiiji = (Module["dynCall_iiiiiji"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_iiiiiji"].apply(null, arguments);
    });
    var dynCall_iiiij = (Module["dynCall_iiiij"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_iiiij"].apply(null, arguments);
    });
    var dynCall_iiiiji = (Module["dynCall_iiiiji"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_iiiiji"].apply(null, arguments);
    });
    var dynCall_iij = (Module["dynCall_iij"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_iij"].apply(null, arguments);
    });
    var dynCall_ji = (Module["dynCall_ji"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_ji"].apply(null, arguments);
    });
    var dynCall_jii = (Module["dynCall_jii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_jii"].apply(null, arguments);
    });
    var dynCall_jiii = (Module["dynCall_jiii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_jiii"].apply(null, arguments);
    });
    var dynCall_jiiiii = (Module["dynCall_jiiiii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_jiiiii"].apply(null, arguments);
    });
    var dynCall_jiiiiijjj = (Module["dynCall_jiiiiijjj"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_jiiiiijjj"].apply(null, arguments);
    });
    var dynCall_jiijjj = (Module["dynCall_jiijjj"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_jiijjj"].apply(null, arguments);
    });
    var dynCall_jiji = (Module["dynCall_jiji"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_jiji"].apply(null, arguments);
    });
    var dynCall_jjii = (Module["dynCall_jjii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_jjii"].apply(null, arguments);
    });
    var dynCall_v = (Module["dynCall_v"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_v"].apply(null, arguments);
    });
    var dynCall_vi = (Module["dynCall_vi"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_vi"].apply(null, arguments);
    });
    var dynCall_vii = (Module["dynCall_vii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_vii"].apply(null, arguments);
    });
    var dynCall_viii = (Module["dynCall_viii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_viii"].apply(null, arguments);
    });
    var dynCall_viiii = (Module["dynCall_viiii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_viiii"].apply(null, arguments);
    });
    var dynCall_viiiii = (Module["dynCall_viiiii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_viiiii"].apply(null, arguments);
    });
    var dynCall_viiiiii = (Module["dynCall_viiiiii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_viiiiii"].apply(null, arguments);
    });
    var dynCall_viiiiiii = (Module["dynCall_viiiiiii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_viiiiiii"].apply(null, arguments);
    });
    var dynCall_viiiiiiiii = (Module["dynCall_viiiiiiiii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_viiiiiiiii"].apply(null, arguments);
    });
    var dynCall_viiiiiiiiii = (Module["dynCall_viiiiiiiiii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_viiiiiiiiii"].apply(null, arguments);
    });
    var dynCall_viiiiiiiiiii = (Module["dynCall_viiiiiiiiiii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_viiiiiiiiiii"].apply(null, arguments);
    });
    var dynCall_viiiiiiiiiiii = (Module["dynCall_viiiiiiiiiiii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_viiiiiiiiiiii"].apply(null, arguments);
    });
    var dynCall_viiiiiiiiiiiii = (Module[
      "dynCall_viiiiiiiiiiiii"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_viiiiiiiiiiiii"].apply(null, arguments);
    });
    var dynCall_viiiiiiiiiiiiiii = (Module[
      "dynCall_viiiiiiiiiiiiiii"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_viiiiiiiiiiiiiii"].apply(null, arguments);
    });
    var dynCall_viiiiiijiiiiiiii = (Module[
      "dynCall_viiiiiijiiiiiiii"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_viiiiiijiiiiiiii"].apply(null, arguments);
    });
    var dynCall_viiiiiijjjiiiji = (Module[
      "dynCall_viiiiiijjjiiiji"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_viiiiiijjjiiiji"].apply(null, arguments);
    });
    var dynCall_viiiiiijjjiijjiiji = (Module[
      "dynCall_viiiiiijjjiijjiiji"
    ] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_viiiiiijjjiijjiiji"].apply(null, arguments);
    });
    var dynCall_viiiijjjiiiij = (Module["dynCall_viiiijjjiiiij"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_viiiijjjiiiij"].apply(null, arguments);
    });
    var dynCall_viij = (Module["dynCall_viij"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_viij"].apply(null, arguments);
    });
    var dynCall_viijii = (Module["dynCall_viijii"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_viijii"].apply(null, arguments);
    });
    var dynCall_viijiiiijji = (Module["dynCall_viijiiiijji"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_viijiiiijji"].apply(null, arguments);
    });
    var dynCall_viijj = (Module["dynCall_viijj"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_viijj"].apply(null, arguments);
    });
    var dynCall_vij = (Module["dynCall_vij"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_vij"].apply(null, arguments);
    });
    var dynCall_viji = (Module["dynCall_viji"] = function() {
      assert(
        runtimeInitialized,
        "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"
      );
      assert(
        !runtimeExited,
        "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"
      );
      return Module["asm"]["dynCall_viji"].apply(null, arguments);
    });
    Module["asm"] = asm;
    if (!Module["intArrayFromString"])
      Module["intArrayFromString"] = function() {
        abort(
          "'intArrayFromString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["intArrayToString"])
      Module["intArrayToString"] = function() {
        abort(
          "'intArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["ccall"])
      Module["ccall"] = function() {
        abort(
          "'ccall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["cwrap"])
      Module["cwrap"] = function() {
        abort(
          "'cwrap' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["setValue"])
      Module["setValue"] = function() {
        abort(
          "'setValue' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["getValue"])
      Module["getValue"] = function() {
        abort(
          "'getValue' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["allocate"])
      Module["allocate"] = function() {
        abort(
          "'allocate' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["getMemory"])
      Module["getMemory"] = function() {
        abort(
          "'getMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you"
        );
      };
    if (!Module["Pointer_stringify"])
      Module["Pointer_stringify"] = function() {
        abort(
          "'Pointer_stringify' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["AsciiToString"])
      Module["AsciiToString"] = function() {
        abort(
          "'AsciiToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["stringToAscii"])
      Module["stringToAscii"] = function() {
        abort(
          "'stringToAscii' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["UTF8ArrayToString"])
      Module["UTF8ArrayToString"] = function() {
        abort(
          "'UTF8ArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    Module["UTF8ToString"] = UTF8ToString;
    if (!Module["stringToUTF8Array"])
      Module["stringToUTF8Array"] = function() {
        abort(
          "'stringToUTF8Array' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["stringToUTF8"])
      Module["stringToUTF8"] = function() {
        abort(
          "'stringToUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["lengthBytesUTF8"])
      Module["lengthBytesUTF8"] = function() {
        abort(
          "'lengthBytesUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["UTF16ToString"])
      Module["UTF16ToString"] = function() {
        abort(
          "'UTF16ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["stringToUTF16"])
      Module["stringToUTF16"] = function() {
        abort(
          "'stringToUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["lengthBytesUTF16"])
      Module["lengthBytesUTF16"] = function() {
        abort(
          "'lengthBytesUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["UTF32ToString"])
      Module["UTF32ToString"] = function() {
        abort(
          "'UTF32ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["stringToUTF32"])
      Module["stringToUTF32"] = function() {
        abort(
          "'stringToUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["lengthBytesUTF32"])
      Module["lengthBytesUTF32"] = function() {
        abort(
          "'lengthBytesUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["allocateUTF8"])
      Module["allocateUTF8"] = function() {
        abort(
          "'allocateUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["stackTrace"])
      Module["stackTrace"] = function() {
        abort(
          "'stackTrace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["addOnPreRun"])
      Module["addOnPreRun"] = function() {
        abort(
          "'addOnPreRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["addOnInit"])
      Module["addOnInit"] = function() {
        abort(
          "'addOnInit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["addOnPreMain"])
      Module["addOnPreMain"] = function() {
        abort(
          "'addOnPreMain' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["addOnExit"])
      Module["addOnExit"] = function() {
        abort(
          "'addOnExit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["addOnPostRun"])
      Module["addOnPostRun"] = function() {
        abort(
          "'addOnPostRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["writeStringToMemory"])
      Module["writeStringToMemory"] = function() {
        abort(
          "'writeStringToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["writeArrayToMemory"])
      Module["writeArrayToMemory"] = function() {
        abort(
          "'writeArrayToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["writeAsciiToMemory"])
      Module["writeAsciiToMemory"] = function() {
        abort(
          "'writeAsciiToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["addRunDependency"])
      Module["addRunDependency"] = function() {
        abort(
          "'addRunDependency' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you"
        );
      };
    if (!Module["removeRunDependency"])
      Module["removeRunDependency"] = function() {
        abort(
          "'removeRunDependency' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you"
        );
      };
    if (!Module["ENV"])
      Module["ENV"] = function() {
        abort(
          "'ENV' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["FS"])
      Module["FS"] = function() {
        abort(
          "'FS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["FS_createFolder"])
      Module["FS_createFolder"] = function() {
        abort(
          "'FS_createFolder' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you"
        );
      };
    if (!Module["FS_createPath"])
      Module["FS_createPath"] = function() {
        abort(
          "'FS_createPath' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you"
        );
      };
    if (!Module["FS_createDataFile"])
      Module["FS_createDataFile"] = function() {
        abort(
          "'FS_createDataFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you"
        );
      };
    if (!Module["FS_createPreloadedFile"])
      Module["FS_createPreloadedFile"] = function() {
        abort(
          "'FS_createPreloadedFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you"
        );
      };
    if (!Module["FS_createLazyFile"])
      Module["FS_createLazyFile"] = function() {
        abort(
          "'FS_createLazyFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you"
        );
      };
    if (!Module["FS_createLink"])
      Module["FS_createLink"] = function() {
        abort(
          "'FS_createLink' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you"
        );
      };
    if (!Module["FS_createDevice"])
      Module["FS_createDevice"] = function() {
        abort(
          "'FS_createDevice' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you"
        );
      };
    if (!Module["FS_unlink"])
      Module["FS_unlink"] = function() {
        abort(
          "'FS_unlink' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you"
        );
      };
    if (!Module["GL"])
      Module["GL"] = function() {
        abort(
          "'GL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["staticAlloc"])
      Module["staticAlloc"] = function() {
        abort(
          "'staticAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["dynamicAlloc"])
      Module["dynamicAlloc"] = function() {
        abort(
          "'dynamicAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["warnOnce"])
      Module["warnOnce"] = function() {
        abort(
          "'warnOnce' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["loadDynamicLibrary"])
      Module["loadDynamicLibrary"] = function() {
        abort(
          "'loadDynamicLibrary' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["loadWebAssemblyModule"])
      Module["loadWebAssemblyModule"] = function() {
        abort(
          "'loadWebAssemblyModule' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["getLEB"])
      Module["getLEB"] = function() {
        abort(
          "'getLEB' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["getFunctionTables"])
      Module["getFunctionTables"] = function() {
        abort(
          "'getFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["alignFunctionTables"])
      Module["alignFunctionTables"] = function() {
        abort(
          "'alignFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["registerFunctions"])
      Module["registerFunctions"] = function() {
        abort(
          "'registerFunctions' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["addFunction"])
      Module["addFunction"] = function() {
        abort(
          "'addFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["removeFunction"])
      Module["removeFunction"] = function() {
        abort(
          "'removeFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["getFuncWrapper"])
      Module["getFuncWrapper"] = function() {
        abort(
          "'getFuncWrapper' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["prettyPrint"])
      Module["prettyPrint"] = function() {
        abort(
          "'prettyPrint' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["makeBigInt"])
      Module["makeBigInt"] = function() {
        abort(
          "'makeBigInt' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["dynCall"])
      Module["dynCall"] = function() {
        abort(
          "'dynCall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["getCompilerSetting"])
      Module["getCompilerSetting"] = function() {
        abort(
          "'getCompilerSetting' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["stackSave"])
      Module["stackSave"] = function() {
        abort(
          "'stackSave' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["stackRestore"])
      Module["stackRestore"] = function() {
        abort(
          "'stackRestore' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["stackAlloc"])
      Module["stackAlloc"] = function() {
        abort(
          "'stackAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["establishStackSpace"])
      Module["establishStackSpace"] = function() {
        abort(
          "'establishStackSpace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["print"])
      Module["print"] = function() {
        abort(
          "'print' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["printErr"])
      Module["printErr"] = function() {
        abort(
          "'printErr' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
        );
      };
    if (!Module["ALLOC_NORMAL"])
      Object.defineProperty(Module, "ALLOC_NORMAL", {
        get: function() {
          abort(
            "'ALLOC_NORMAL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
          );
        }
      });
    if (!Module["ALLOC_STACK"])
      Object.defineProperty(Module, "ALLOC_STACK", {
        get: function() {
          abort(
            "'ALLOC_STACK' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
          );
        }
      });
    if (!Module["ALLOC_STATIC"])
      Object.defineProperty(Module, "ALLOC_STATIC", {
        get: function() {
          abort(
            "'ALLOC_STATIC' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
          );
        }
      });
    if (!Module["ALLOC_DYNAMIC"])
      Object.defineProperty(Module, "ALLOC_DYNAMIC", {
        get: function() {
          abort(
            "'ALLOC_DYNAMIC' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
          );
        }
      });
    if (!Module["ALLOC_NONE"])
      Object.defineProperty(Module, "ALLOC_NONE", {
        get: function() {
          abort(
            "'ALLOC_NONE' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)"
          );
        }
      });
    Module["then"] = function(func) {
      if (Module["calledRun"]) {
        func(Module);
      } else {
        var old = Module["onRuntimeInitialized"];
        Module["onRuntimeInitialized"] = function() {
          if (old) old();
          func(Module);
        };
      }
      return Module;
    };
    function ExitStatus(status) {
      this.name = "ExitStatus";
      this.message = "Program terminated with exit(" + status + ")";
      this.status = status;
    }
    ExitStatus.prototype = new Error();
    ExitStatus.prototype.constructor = ExitStatus;
    var initialStackTop;
    var calledMain = false;
    dependenciesFulfilled = function runCaller() {
      if (!Module["calledRun"]) run();
      if (!Module["calledRun"]) dependenciesFulfilled = runCaller;
    };
    Module["callMain"] = function callMain(args) {
      assert(
        runDependencies == 0,
        "cannot call main when async dependencies remain! (listen on __ATMAIN__)"
      );
      assert(
        __ATPRERUN__.length == 0,
        "cannot call main when preRun functions remain to be called"
      );
      args = args || [];
      ensureInitRuntime();
      var argc = args.length + 1;
      var argv = stackAlloc((argc + 1) * 4);
      HEAP32[argv >> 2] = allocateUTF8OnStack(Module["thisProgram"]);
      for (var i = 1; i < argc; i++) {
        HEAP32[(argv >> 2) + i] = allocateUTF8OnStack(args[i - 1]);
      }
      HEAP32[(argv >> 2) + argc] = 0;
      try {
        var ret = Module["_main"](argc, argv, 0);
        exit(ret, true);
      } catch (e) {
        if (e instanceof ExitStatus) {
          return;
        } else if (e == "SimulateInfiniteLoop") {
          Module["noExitRuntime"] = true;
          return;
        } else {
          var toLog = e;
          if (e && typeof e === "object" && e.stack) {
            toLog = [e, e.stack];
          }
          err("exception thrown: " + toLog);
          Module["quit"](1, e);
        }
      } finally {
        calledMain = true;
      }
    };
    function run(args) {
      args = args || Module["arguments"];
      if (runDependencies > 0) {
        return;
      }
      writeStackCookie();
      preRun();
      if (runDependencies > 0) return;
      if (Module["calledRun"]) return;
      function doRun() {
        if (Module["calledRun"]) return;
        Module["calledRun"] = true;
        if (ABORT) return;
        ensureInitRuntime();
        preMain();
        if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
        if (Module["_main"] && shouldRunNow) Module["callMain"](args);
        postRun();
      }
      if (Module["setStatus"]) {
        Module["setStatus"]("Running...");
        setTimeout(function() {
          setTimeout(function() {
            Module["setStatus"]("");
          }, 1);
          doRun();
        }, 1);
      } else {
        doRun();
      }
      checkStackCookie();
    }
    Module["run"] = run;
    function checkUnflushedContent() {
      var print = out;
      var printErr = err;
      var has = false;
      out = err = function(x) {
        has = true;
      };
      try {
        var flush = Module["_fflush"];
        if (flush) flush(0);
        var hasFS = true;
        if (hasFS) {
          ["stdout", "stderr"].forEach(function(name) {
            var info = FS.analyzePath("/dev/" + name);
            if (!info) return;
            var stream = info.object;
            var rdev = stream.rdev;
            var tty = TTY.ttys[rdev];
            if (tty && tty.output && tty.output.length) {
              has = true;
            }
          });
        }
      } catch (e) {}
      out = print;
      err = printErr;
      if (has) {
        warnOnce(
          "stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the FAQ), or make sure to emit a newline when you printf etc."
        );
      }
    }
    function exit(status, implicit) {
      checkUnflushedContent();
      if (implicit && Module["noExitRuntime"] && status === 0) {
        return;
      }
      if (Module["noExitRuntime"]) {
        if (!implicit) {
          err(
            "exit(" +
              status +
              ") called, but EXIT_RUNTIME is not set, so halting execution but not exiting the runtime or preventing further async execution (build with EXIT_RUNTIME=1, if you want a true shutdown)"
          );
        }
      } else {
        ABORT = true;
        EXITSTATUS = status;
        STACKTOP = initialStackTop;
        exitRuntime();
        if (Module["onExit"]) Module["onExit"](status);
      }
      Module["quit"](status, new ExitStatus(status));
    }
    var abortDecorators = [];
    function abort(what) {
      if (Module["onAbort"]) {
        Module["onAbort"](what);
      }
      if (what !== undefined) {
        out(what);
        err(what);
        what = JSON.stringify(what);
      } else {
        what = "";
      }
      ABORT = true;
      EXITSTATUS = 1;
      var extra = "";
      var output = "abort(" + what + ") at " + stackTrace() + extra;
      if (abortDecorators) {
        abortDecorators.forEach(function(decorator) {
          output = decorator(output, what);
        });
      }
      throw output;
    }
    Module["abort"] = abort;
    if (Module["preInit"]) {
      if (typeof Module["preInit"] == "function")
        Module["preInit"] = [Module["preInit"]];
      while (Module["preInit"].length > 0) {
        Module["preInit"].pop()();
      }
    }
    var shouldRunNow = true;
    if (Module["noInitialRun"]) {
      shouldRunNow = false;
    }
    Module["noExitRuntime"] = true;
    run();
    Module["ready"] = new Promise(function(resolve, reject) {
      delete Module["then"];
      Module["onAbort"] = function(what) {
        reject(what);
      };
      addOnPostRun(function() {
        resolve(Module);
      });
    });

    return MyMoneroCoreCpp;
  };
})();
if (typeof exports === "object" && typeof module === "object")
  module.exports = MyMoneroCoreCpp;
else if (typeof define === "function" && define["amd"])
  define([], function() {
    return MyMoneroCoreCpp;
  });
else if (typeof exports === "object")
  exports["MyMoneroCoreCpp"] = MyMoneroCoreCpp;
