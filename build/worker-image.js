!function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){this.console&&this.console.log?(this._Worker=Worker,Object.defineProperty(this,"Worker",{writable:!0}),this.Worker=function(a){var b=new _Worker("WorkerConsole.js#"+a),c=new MessageChannel;return b.postMessage("console",[c.port2]),c.port1.onmessage=function(b){var c=b.data;c.unshift(a+": "),console.log.apply(console,c)},b}):self.onmessage=function(a){if("console"===a.data){self.console={_port:a.ports[0],log:function(){var a=Array.prototype.slice.call(arguments);console._port.postMessage(a)}},onmessage=null;var b=location.hash.substring(1);importScripts(b)}}},{}],2:[function(a,b,c){var d=c.PromisePool=a("./lib/PromisePool");c.create=function(a){return new d(a)}},{"./lib/PromisePool":4}],3:[function(a,b,c){function d(a){this._size=Math.max(parseInt(a,10)||0,1),this._slots=[],this._total=null;for(var b=0;b<this._size;++b)this._slots.push([])}d.prototype={get length(){if(null===this._total){this._total=0;for(var a=0;a<this._size;++a)this._total+=this._slots[a].length}return this._total}},d.prototype.enqueue=function(a,b){b=Math.min(this._size-1,Math.max(0,parseInt(b,10)||0)),this._total=null,this._slots[b].push(a)},d.prototype.dequeue=function(){this._total=null;for(var a=0;a<this._size;++a)if(this._slots[a].length)return this._slots[a].shift()},b.exports=d},{}],4:[function(a,b,c){(function(c){function d(a){this._opts={name:a.name||"pool",idleTimeoutMillis:a.idleTimeoutMillis||3e4,reapInterval:a.reapIntervalMillis||1e3,drainCheckInterval:a.drainCheckIntervalMillis||100,refreshIdle:"refreshIdle"in a?a.refreshIdle:!0,returnToHead:a.returnToHead||!1,max:parseInt(a.max,10),min:parseInt(a.min,10),create:a.create,destroy:a.destroy,validate:a.validate||function(){return!0}},this._availableObjects=[],this._waitingClients=new m(a.priorityRange||1),this._count=0,this._removeIdleScheduled=!1,this._removeIdleTimer=null,this._draining=!1,a.log instanceof Function?this._log=a.log:a.log?this._log=e.bind(this):this._log=function(){},this._validate=a.validate||function(){return!0},this._opts.max=Math.max(isNaN(this._opts.max)?1:this._opts.max,1),this._opts.min=Math.min(isNaN(this._opts.min)?0:this._opts.min,this._opts.max-1),f.call(this)}function e(a,b){console.log(b.toUpperCase()+" pool "+this._opts.name+" - "+a)}function f(){if(this._draining)return Promise.resolve();for(var a=this._opts.min-this._count,b=[],c=0;a>c;++c)b.push(this.acquire(function(a){return Promise.resolve()}));return Promise.all(b).then(function(){})}function g(){return this._log(l.format("PromisePool._createResource() - creating client - count=%d min=%d max=%d",this._count,this._opts.min,this._opts.max),"verbose"),Promise.resolve(this._opts.create())}function h(){var a=[],b=Date.now();this._removeIdleScheduled=!1;for(var c=this._count-this._opts.min,d=this._opts.refreshIdle,e=0;e<this._availableObjects.length&&(d||c>a.length);++e){var f=this._availableObjects[e].timeout;b>=f&&(this._log("removeIdle() destroying obj - now:"+b+" timeout:"+f,"verbose"),a.push(this.destroy(this._availableObjects[e].obj)),--e)}return this._availableObjects.length>0?(this._log("availableObjects.length="+this._availableObjects.length,"verbose"),i.call(this)):this._log("removeIdle() all objects removed","verbose"),Promise.all(a)}function i(){this._removeIdleScheduled||(this._removeIdleScheduled=!0,this._removeIdleTimer=setTimeout(h.bind(this),this._opts.reapInterval))}function j(){var a=this._waitingClients.length;if(this._log("dispense() clients="+a+" available="+this._availableObjects.length,"info"),a>0){for(;this._availableObjects.length>0;){this._log("dispense() - reusing obj","verbose");var b=this._availableObjects[0];{if(this._opts.validate(b.obj))return this._availableObjects.shift(),void this._waitingClients.dequeue().resolve(b.obj);this.destroy(b.obj)}}if(this._count<this._opts.max){var c=this;++this._count,g.call(this).then(function(a){c._waitingClients.dequeue().resolve(a)},function(a){--c._count,c._waitingClients.dequeue().reject(a)})}}}function k(a,b){return function(c){return b?a===c.obj:a!==c.obj}}var l=a("util"),m=a("./PriorityQueue");d.prototype.acquire=function(a,b){if(this._draining)throw new Error("Pool is draining and cannot accept work");var d=this,e={};return e.promise=new Promise(function(a,b){e.resolve=a,e.reject=b}).then(function(b){return new Promise(function(c,e){try{return a(b).then(function(a){d.release(b),c(a)},function(a){d.release(b),e(a)})}catch(f){d.release(b),e(f)}})}),this._waitingClients.enqueue(e,b),c.nextTick(j.bind(this)),e.promise},d.prototype.release=function(a){if(this._availableObjects.some(k(a,!0)))return void this._log("release called twice for the same resource: "+(new Error).stack,"error");if(a.__promisePool_destroyed)this._log("Released resource is destroyed, not returning to pool.","info");else{var b={obj:a,timeout:Date.now()+this._opts.idleTimeoutMillis};this._opts.returnToHead?this._availableObjects.unshift(b):this._availableObjects.push(b),this._log("timeout: "+b.timeout,"verbose")}c.nextTick(j.bind(this)),i.call(this)},d.prototype.destroy=function(a){this._log("Destroying object, count="+this._count,"verbose"),--this._count,this._availableObjects=this._availableObjects.filter(k(a,!1));var b=this;return Promise.resolve(this._opts.destroy(a)).then(function(){return a.__promisePool_destroyed=!0,f.call(b)})},d.prototype.drain=function(){this._log("draining","info"),this._draining=!0;var a=this;return new Promise(function(b,c){function d(){if(a._waitingClients.length>0)a._log("Delaying drain, "+a._waitingClients.length+" clients in queue.","verbose"),setTimeout(d,a._opts.drainCheckInterval);else if(a._availableObjects.length<a._count){var e=a._count-a._availableObjects.length;a._log("Delaying drain, "+e+" items need to be released.","verbose"),setTimeout(d,a._opts.drainCheckInterval)}else a.destroyAllNow().then(b,c)}d()})},d.prototype.destroyAllNow=function(){this._log("force destroying all objects","info"),this._removeIdleScheduled=!1,clearTimeout(this._removeIdleTimer);for(var a=[];this._availableObjects.length>0;)a.push(this.destroy(this._availableObjects[0].obj));return Promise.all(a).then(function(){})},d.prototype.pooled=function(a,b){var c=this,d=Array.prototype.slice;return function(){var e=d.call(arguments),f=this;return c.acquire(function(b){return e.unshift(b),a.apply(f,e)},b)}},Object.defineProperty(d.prototype,"length",{get:function(){return this._count},enumerable:!0}),Object.defineProperty(d.prototype,"name",{get:function(){return this._opts.name},enumerable:!0}),Object.defineProperty(d.prototype,"availableLength",{get:function(){return this._availableObjects.length},enumerable:!0}),Object.defineProperty(d.prototype,"waitingClientLength",{get:function(){return this._waitingClients.length},enumerable:!0}),Object.defineProperty(d.prototype,"max",{get:function(){return this._opts.max},enumerable:!0}),Object.defineProperty(d.prototype,"min",{get:function(){return this._opts.min},enumerable:!0}),b.exports=d}).call(this,a("_process"))},{"./PriorityQueue":3,_process:14,util:16}],5:[function(a,b,c){a("buffer").Buffer;a("3rdParty/WorkerConsole");var d=a("yttro/lib/webp-decode"),e=a("yttro/lib/ajax"),f=a("generic-promise-pool"),g={_workerImagePool:function(){return this.__workerImagePool=this.__workerImagePool||f.create({name:"worker-image",max:5,min:2,create:function(){return new Worker("build/worker-image.js")},destroy:function(a){a.terminate()}})},browserSupportsWebP:function(){return Promise.reject("asdf")},_maybeConvertWebP2PNG:function(a){return/\/webp$/.test(a.mimeType)?this.browserSupportsWebP().then(function(){return a})["catch"](function(){var b=d(a.bytes);return{bytes:b,width:b.width,height:b.height}}):Promise.resolve(a)},_bytesAndMimeType2Image:function(a){if(a.mimeType){var b=new Blob([a.bytes],{type:a.mimeType}),c=self.URL||self.webkitURL||self,d=c.createObjectURL(b);return this._getBasic(d).then(function(a){return c.revokeObjectURL(d),a})["catch"](function(b){console.log(b,a)})}return a.width&&a.height?new Promise(function(b,c){var d=a.bytes;d instanceof Uint8ClampedArray||(d=new Uint8ClampedArray(d));var e=new ImageData(d,a.width,a.height),f=document.createElement("canvas");f.width=e.width,f.height=e.height;var g=f.getContext("2d");g.putImageData(e,0,0),b(f)}):Promise.reject(a)},_getBasic:function(a){var b=new Image;return new Promise(function(c,d){b.onload=function(){c(b)},b.onerror=d,b.src=a})},getBytesAndMimeType:function(a){a=a||{};!self.Window;return e.getRawBytesAndMimeType(a).then(this._maybeConvertWebP2PNG.bind(this))},get:function(a){return a=a||{},this.getBytesAndMimeType(a).then(this._bytesAndMimeType2Image.bind(this))}};b.exports=g},{"3rdParty/WorkerConsole":1,buffer:9,"generic-promise-pool":2,"yttro/lib/ajax":6,"yttro/lib/webp-decode":7}],6:[function(a,b,c){var d=a("generic-promise-pool");b.exports={get:function(a){return a=_.merge({dataType:"json",type:"GET"},a),new Promise(function(b,c){req=$.ajax(a),req.then(b),req.fail(c)})},post:function(a){return a=_.merge({dataType:"json",type:"POST"},a),new Promise(function(b,c){req=$.ajax(a),req.then(b),req.fail(c)})},_xhrPool:function(){return this.__xhrPool=this.__xhrPool||d.create({name:"xhr",max:5,min:2,create:function(){return new XMLHttpRequest},destroy:function(a){}})},getRawBytesAndMimeType:function(a){if(a=a||{},!a.url)throw console.error(a),new Error("URL required");return this._xhrPool().acquire(function(b){a.onProgress&&b.addEventListener("progress",a.onProgress),b.onloadend=function(){this._xhrPool().release(b)}.bind(this);var c=new Promise(function(c,d){b.onload=function(){var a=b.response,d=b.getResponseHeader("content-type");c({bytes:a,mimeType:d})},b.onerror=function(c){console.log("rejecting",a.url,b,b.statusText),d(c)},b.onabort=function(c){console.log("aborted",a.url,b,b.statusText,b.readyState),d(c)},b.onloadend=function(a){},b.ontimeout=function(a){},b.onreadystatechange=function(a){4==b.readyState&&200!=b.status&&d(a)}});return b.open("GET",a.url,!0),b.responseType=a.responseType||"arraybuffer",b.send(null),c}.bind(this))}}},{"generic-promise-pool":2}],7:[function(a,b,c){var d;b.exports=function(a){var b=new Uint8Array(a);d=d||new WebPDecoder;var c=d.WebPDecoderConfig.j,e=d.WebPDecoderConfig.input;if(!d.WebPInitDecoderConfig(d.WebPDecoderConfig))throw new Error("Library version mismatch!");if(status=d.WebPGetFeatures(b,b.length,e),0!=status)throw new Error("Error getting features: "+status);if(c.J=4,status=d.WebPDecode(b,b.length,d.WebPDecoderConfig),0!=status)throw new Error("Error decoding: "+status);var f=c.c.RGBA.ma;if(!f)throw new Error("Error decoding bytes");for(var g=c.height,h=c.width,i=0;g>i;i++)for(var j=0;h>j;j++){var k=4*j+4*h*i,l=f[0+k];f[0+k]=f[1+k],f[1+k]=f[2+k],f[2+k]=f[3+k],f[3+k]=l}var a=new Uint8ClampedArray(f).buffer;return a.width=h,a.height=g,a}},{}],8:[function(a,b,c){window=self,a("3rdParty/WorkerConsole"),importScripts("../lodash.js/3.10.1/lodash.min.js");var d=a("yttro/lib/ajax-image");null!=self.window;onmessage=function(a){var b=a.data.functionName,c=a.data.arguments;d[b].apply(d,c).then(function(){postMessage(arguments[0])})}},{"3rdParty/WorkerConsole":1,"yttro/lib/ajax-image":5}],9:[function(a,b,c){function d(){return e.TYPED_ARRAY_SUPPORT?2147483647:1073741823}function e(a){return this instanceof e?(this.length=0,this.parent=void 0,"number"==typeof a?f(this,a):"string"==typeof a?g(this,a,arguments.length>1?arguments[1]:"utf8"):h(this,a)):arguments.length>1?new e(a,arguments[1]):new e(a)}function f(a,b){if(a=o(a,0>b?0:0|p(b)),!e.TYPED_ARRAY_SUPPORT)for(var c=0;b>c;c++)a[c]=0;return a}function g(a,b,c){("string"!=typeof c||""===c)&&(c="utf8");var d=0|r(b,c);return a=o(a,d),a.write(b,c),a}function h(a,b){if(e.isBuffer(b))return i(a,b);if(W(b))return j(a,b);if(null==b)throw new TypeError("must start with number, buffer, array or string");if("undefined"!=typeof ArrayBuffer){if(b.buffer instanceof ArrayBuffer)return k(a,b);if(b instanceof ArrayBuffer)return l(a,b)}return b.length?m(a,b):n(a,b)}function i(a,b){var c=0|p(b.length);return a=o(a,c),b.copy(a,0,0,c),a}function j(a,b){var c=0|p(b.length);a=o(a,c);for(var d=0;c>d;d+=1)a[d]=255&b[d];return a}function k(a,b){var c=0|p(b.length);a=o(a,c);for(var d=0;c>d;d+=1)a[d]=255&b[d];return a}function l(a,b){return e.TYPED_ARRAY_SUPPORT?(b.byteLength,a=e._augment(new Uint8Array(b))):a=k(a,new Uint8Array(b)),a}function m(a,b){var c=0|p(b.length);a=o(a,c);for(var d=0;c>d;d+=1)a[d]=255&b[d];return a}function n(a,b){var c,d=0;"Buffer"===b.type&&W(b.data)&&(c=b.data,d=0|p(c.length)),a=o(a,d);for(var e=0;d>e;e+=1)a[e]=255&c[e];return a}function o(a,b){e.TYPED_ARRAY_SUPPORT?a=e._augment(new Uint8Array(b)):(a.length=b,a._isBuffer=!0);var c=0!==b&&b<=e.poolSize>>>1;return c&&(a.parent=X),a}function p(a){if(a>=d())throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+d().toString(16)+" bytes");return 0|a}function q(a,b){if(!(this instanceof q))return new q(a,b);var c=new e(a,b);return delete c.parent,c}function r(a,b){"string"!=typeof a&&(a=""+a);var c=a.length;if(0===c)return 0;for(var d=!1;;)switch(b){case"ascii":case"binary":case"raw":case"raws":return c;case"utf8":case"utf-8":return P(a).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*c;case"hex":return c>>>1;case"base64":return S(a).length;default:if(d)return P(a).length;b=(""+b).toLowerCase(),d=!0}}function s(a,b,c){var d=!1;if(b=0|b,c=void 0===c||c===1/0?this.length:0|c,a||(a="utf8"),0>b&&(b=0),c>this.length&&(c=this.length),b>=c)return"";for(;;)switch(a){case"hex":return D(this,b,c);case"utf8":case"utf-8":return A(this,b,c);case"ascii":return B(this,b,c);case"binary":return C(this,b,c);case"base64":return z(this,b,c);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return E(this,b,c);default:if(d)throw new TypeError("Unknown encoding: "+a);a=(a+"").toLowerCase(),d=!0}}function t(a,b,c,d){c=Number(c)||0;var e=a.length-c;d?(d=Number(d),d>e&&(d=e)):d=e;var f=b.length;if(f%2!==0)throw new Error("Invalid hex string");d>f/2&&(d=f/2);for(var g=0;d>g;g++){var h=parseInt(b.substr(2*g,2),16);if(isNaN(h))throw new Error("Invalid hex string");a[c+g]=h}return g}function u(a,b,c,d){return T(P(b,a.length-c),a,c,d)}function v(a,b,c,d){return T(Q(b),a,c,d)}function w(a,b,c,d){return v(a,b,c,d)}function x(a,b,c,d){return T(S(b),a,c,d)}function y(a,b,c,d){return T(R(b,a.length-c),a,c,d)}function z(a,b,c){return 0===b&&c===a.length?U.fromByteArray(a):U.fromByteArray(a.slice(b,c))}function A(a,b,c){c=Math.min(a.length,c);for(var d,e,f,g,h,i,j,k=[],l=b;c>l;l+=h){if(d=a[l],j=65533,h=d>239?4:d>223?3:d>191?2:1,c>=l+h)switch(h){case 1:128>d&&(j=d);break;case 2:e=a[l+1],128===(192&e)&&(i=(31&d)<<6|63&e,i>127&&(j=i));break;case 3:e=a[l+1],f=a[l+2],128===(192&e)&&128===(192&f)&&(i=(15&d)<<12|(63&e)<<6|63&f,i>2047&&(55296>i||i>57343)&&(j=i));break;case 4:e=a[l+1],f=a[l+2],g=a[l+3],128===(192&e)&&128===(192&f)&&128===(192&g)&&(i=(15&d)<<18|(63&e)<<12|(63&f)<<6|63&g,i>65535&&1114112>i&&(j=i))}65533===j?h=1:j>65535&&(j-=65536,k.push(j>>>10&1023|55296),j=56320|1023&j),k.push(j)}return String.fromCharCode.apply(String,k)}function B(a,b,c){var d="";c=Math.min(a.length,c);for(var e=b;c>e;e++)d+=String.fromCharCode(127&a[e]);return d}function C(a,b,c){var d="";c=Math.min(a.length,c);for(var e=b;c>e;e++)d+=String.fromCharCode(a[e]);return d}function D(a,b,c){var d=a.length;(!b||0>b)&&(b=0),(!c||0>c||c>d)&&(c=d);for(var e="",f=b;c>f;f++)e+=O(a[f]);return e}function E(a,b,c){for(var d=a.slice(b,c),e="",f=0;f<d.length;f+=2)e+=String.fromCharCode(d[f]+256*d[f+1]);return e}function F(a,b,c){if(a%1!==0||0>a)throw new RangeError("offset is not uint");if(a+b>c)throw new RangeError("Trying to access beyond buffer length")}function G(a,b,c,d,f,g){if(!e.isBuffer(a))throw new TypeError("buffer must be a Buffer instance");if(b>f||g>b)throw new RangeError("value is out of bounds");if(c+d>a.length)throw new RangeError("index out of range")}function H(a,b,c,d){0>b&&(b=65535+b+1);for(var e=0,f=Math.min(a.length-c,2);f>e;e++)a[c+e]=(b&255<<8*(d?e:1-e))>>>8*(d?e:1-e)}function I(a,b,c,d){0>b&&(b=4294967295+b+1);for(var e=0,f=Math.min(a.length-c,4);f>e;e++)a[c+e]=b>>>8*(d?e:3-e)&255}function J(a,b,c,d,e,f){if(b>e||f>b)throw new RangeError("value is out of bounds");if(c+d>a.length)throw new RangeError("index out of range");if(0>c)throw new RangeError("index out of range")}function K(a,b,c,d,e){return e||J(a,b,c,4,3.4028234663852886e38,-3.4028234663852886e38),V.write(a,b,c,d,23,4),c+4}function L(a,b,c,d,e){return e||J(a,b,c,8,1.7976931348623157e308,-1.7976931348623157e308),V.write(a,b,c,d,52,8),c+8}function M(a){if(a=N(a).replace(Z,""),a.length<2)return"";for(;a.length%4!==0;)a+="=";return a}function N(a){return a.trim?a.trim():a.replace(/^\s+|\s+$/g,"")}function O(a){return 16>a?"0"+a.toString(16):a.toString(16)}function P(a,b){b=b||1/0;for(var c,d=a.length,e=null,f=[],g=0;d>g;g++){if(c=a.charCodeAt(g),c>55295&&57344>c){if(!e){if(c>56319){(b-=3)>-1&&f.push(239,191,189);continue}if(g+1===d){(b-=3)>-1&&f.push(239,191,189);continue}e=c;continue}if(56320>c){(b-=3)>-1&&f.push(239,191,189),e=c;continue}c=e-55296<<10|c-56320|65536}else e&&(b-=3)>-1&&f.push(239,191,189);if(e=null,128>c){if((b-=1)<0)break;f.push(c)}else if(2048>c){if((b-=2)<0)break;f.push(c>>6|192,63&c|128)}else if(65536>c){if((b-=3)<0)break;f.push(c>>12|224,c>>6&63|128,63&c|128)}else{if(!(1114112>c))throw new Error("Invalid code point");if((b-=4)<0)break;f.push(c>>18|240,c>>12&63|128,c>>6&63|128,63&c|128)}}return f}function Q(a){for(var b=[],c=0;c<a.length;c++)b.push(255&a.charCodeAt(c));return b}function R(a,b){for(var c,d,e,f=[],g=0;g<a.length&&!((b-=2)<0);g++)c=a.charCodeAt(g),d=c>>8,e=c%256,f.push(e),f.push(d);return f}function S(a){return U.toByteArray(M(a))}function T(a,b,c,d){for(var e=0;d>e&&!(e+c>=b.length||e>=a.length);e++)b[e+c]=a[e];return e}var U=a("base64-js"),V=a("ieee754"),W=a("is-array");c.Buffer=e,c.SlowBuffer=q,c.INSPECT_MAX_BYTES=50,e.poolSize=8192;var X={};e.TYPED_ARRAY_SUPPORT=function(){function a(){}try{var b=new Uint8Array(1);return b.foo=function(){return 42},b.constructor=a,42===b.foo()&&b.constructor===a&&"function"==typeof b.subarray&&0===b.subarray(1,1).byteLength}catch(c){return!1}}(),e.isBuffer=function(a){return!(null==a||!a._isBuffer)},e.compare=function(a,b){if(!e.isBuffer(a)||!e.isBuffer(b))throw new TypeError("Arguments must be Buffers");if(a===b)return 0;for(var c=a.length,d=b.length,f=0,g=Math.min(c,d);g>f&&a[f]===b[f];)++f;return f!==g&&(c=a[f],d=b[f]),d>c?-1:c>d?1:0},e.isEncoding=function(a){switch(String(a).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"raw":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},e.concat=function(a,b){if(!W(a))throw new TypeError("list argument must be an Array of Buffers.");if(0===a.length)return new e(0);var c;if(void 0===b)for(b=0,c=0;c<a.length;c++)b+=a[c].length;var d=new e(b),f=0;for(c=0;c<a.length;c++){var g=a[c];g.copy(d,f),f+=g.length}return d},e.byteLength=r,e.prototype.length=void 0,e.prototype.parent=void 0,e.prototype.toString=function(){var a=0|this.length;return 0===a?"":0===arguments.length?A(this,0,a):s.apply(this,arguments)},e.prototype.equals=function(a){if(!e.isBuffer(a))throw new TypeError("Argument must be a Buffer");return this===a?!0:0===e.compare(this,a)},e.prototype.inspect=function(){var a="",b=c.INSPECT_MAX_BYTES;return this.length>0&&(a=this.toString("hex",0,b).match(/.{2}/g).join(" "),this.length>b&&(a+=" ... ")),"<Buffer "+a+">"},e.prototype.compare=function(a){if(!e.isBuffer(a))throw new TypeError("Argument must be a Buffer");return this===a?0:e.compare(this,a)},e.prototype.indexOf=function(a,b){function c(a,b,c){for(var d=-1,e=0;c+e<a.length;e++)if(a[c+e]===b[-1===d?0:e-d]){if(-1===d&&(d=e),e-d+1===b.length)return c+d}else d=-1;return-1}if(b>2147483647?b=2147483647:-2147483648>b&&(b=-2147483648),b>>=0,0===this.length)return-1;if(b>=this.length)return-1;if(0>b&&(b=Math.max(this.length+b,0)),"string"==typeof a)return 0===a.length?-1:String.prototype.indexOf.call(this,a,b);if(e.isBuffer(a))return c(this,a,b);if("number"==typeof a)return e.TYPED_ARRAY_SUPPORT&&"function"===Uint8Array.prototype.indexOf?Uint8Array.prototype.indexOf.call(this,a,b):c(this,[a],b);throw new TypeError("val must be string, number or Buffer")},e.prototype.get=function(a){return console.log(".get() is deprecated. Access using array indexes instead."),this.readUInt8(a)},e.prototype.set=function(a,b){return console.log(".set() is deprecated. Access using array indexes instead."),this.writeUInt8(a,b)},e.prototype.write=function(a,b,c,d){if(void 0===b)d="utf8",c=this.length,b=0;else if(void 0===c&&"string"==typeof b)d=b,c=this.length,b=0;else if(isFinite(b))b=0|b,isFinite(c)?(c=0|c,void 0===d&&(d="utf8")):(d=c,c=void 0);else{var e=d;d=b,b=0|c,c=e}var f=this.length-b;if((void 0===c||c>f)&&(c=f),a.length>0&&(0>c||0>b)||b>this.length)throw new RangeError("attempt to write outside buffer bounds");d||(d="utf8");for(var g=!1;;)switch(d){case"hex":return t(this,a,b,c);case"utf8":case"utf-8":return u(this,a,b,c);case"ascii":return v(this,a,b,c);case"binary":return w(this,a,b,c);case"base64":return x(this,a,b,c);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return y(this,a,b,c);default:if(g)throw new TypeError("Unknown encoding: "+d);d=(""+d).toLowerCase(),g=!0}},e.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}},e.prototype.slice=function(a,b){var c=this.length;a=~~a,b=void 0===b?c:~~b,0>a?(a+=c,0>a&&(a=0)):a>c&&(a=c),0>b?(b+=c,0>b&&(b=0)):b>c&&(b=c),a>b&&(b=a);var d;if(e.TYPED_ARRAY_SUPPORT)d=e._augment(this.subarray(a,b));else{var f=b-a;d=new e(f,void 0);for(var g=0;f>g;g++)d[g]=this[g+a]}return d.length&&(d.parent=this.parent||this),d},e.prototype.readUIntLE=function(a,b,c){a=0|a,b=0|b,c||F(a,b,this.length);for(var d=this[a],e=1,f=0;++f<b&&(e*=256);)d+=this[a+f]*e;return d},e.prototype.readUIntBE=function(a,b,c){a=0|a,b=0|b,c||F(a,b,this.length);for(var d=this[a+--b],e=1;b>0&&(e*=256);)d+=this[a+--b]*e;return d},e.prototype.readUInt8=function(a,b){return b||F(a,1,this.length),this[a]},e.prototype.readUInt16LE=function(a,b){return b||F(a,2,this.length),this[a]|this[a+1]<<8},e.prototype.readUInt16BE=function(a,b){return b||F(a,2,this.length),this[a]<<8|this[a+1]},e.prototype.readUInt32LE=function(a,b){return b||F(a,4,this.length),(this[a]|this[a+1]<<8|this[a+2]<<16)+16777216*this[a+3]},e.prototype.readUInt32BE=function(a,b){return b||F(a,4,this.length),16777216*this[a]+(this[a+1]<<16|this[a+2]<<8|this[a+3])},e.prototype.readIntLE=function(a,b,c){a=0|a,b=0|b,c||F(a,b,this.length);for(var d=this[a],e=1,f=0;++f<b&&(e*=256);)d+=this[a+f]*e;return e*=128,d>=e&&(d-=Math.pow(2,8*b)),d},e.prototype.readIntBE=function(a,b,c){a=0|a,b=0|b,c||F(a,b,this.length);for(var d=b,e=1,f=this[a+--d];d>0&&(e*=256);)f+=this[a+--d]*e;return e*=128,f>=e&&(f-=Math.pow(2,8*b)),f},e.prototype.readInt8=function(a,b){return b||F(a,1,this.length),128&this[a]?-1*(255-this[a]+1):this[a]},e.prototype.readInt16LE=function(a,b){b||F(a,2,this.length);var c=this[a]|this[a+1]<<8;return 32768&c?4294901760|c:c},e.prototype.readInt16BE=function(a,b){b||F(a,2,this.length);var c=this[a+1]|this[a]<<8;return 32768&c?4294901760|c:c},e.prototype.readInt32LE=function(a,b){return b||F(a,4,this.length),this[a]|this[a+1]<<8|this[a+2]<<16|this[a+3]<<24},e.prototype.readInt32BE=function(a,b){return b||F(a,4,this.length),this[a]<<24|this[a+1]<<16|this[a+2]<<8|this[a+3]},e.prototype.readFloatLE=function(a,b){return b||F(a,4,this.length),V.read(this,a,!0,23,4)},e.prototype.readFloatBE=function(a,b){return b||F(a,4,this.length),V.read(this,a,!1,23,4)},e.prototype.readDoubleLE=function(a,b){return b||F(a,8,this.length),V.read(this,a,!0,52,8)},e.prototype.readDoubleBE=function(a,b){return b||F(a,8,this.length),V.read(this,a,!1,52,8)},e.prototype.writeUIntLE=function(a,b,c,d){a=+a,b=0|b,c=0|c,d||G(this,a,b,c,Math.pow(2,8*c),0);var e=1,f=0;for(this[b]=255&a;++f<c&&(e*=256);)this[b+f]=a/e&255;return b+c},e.prototype.writeUIntBE=function(a,b,c,d){a=+a,b=0|b,c=0|c,d||G(this,a,b,c,Math.pow(2,8*c),0);var e=c-1,f=1;for(this[b+e]=255&a;--e>=0&&(f*=256);)this[b+e]=a/f&255;return b+c},e.prototype.writeUInt8=function(a,b,c){return a=+a,b=0|b,c||G(this,a,b,1,255,0),e.TYPED_ARRAY_SUPPORT||(a=Math.floor(a)),this[b]=a,b+1},e.prototype.writeUInt16LE=function(a,b,c){return a=+a,b=0|b,c||G(this,a,b,2,65535,0),e.TYPED_ARRAY_SUPPORT?(this[b]=a,this[b+1]=a>>>8):H(this,a,b,!0),b+2},e.prototype.writeUInt16BE=function(a,b,c){return a=+a,b=0|b,c||G(this,a,b,2,65535,0),e.TYPED_ARRAY_SUPPORT?(this[b]=a>>>8,this[b+1]=a):H(this,a,b,!1),b+2},e.prototype.writeUInt32LE=function(a,b,c){return a=+a,b=0|b,c||G(this,a,b,4,4294967295,0),e.TYPED_ARRAY_SUPPORT?(this[b+3]=a>>>24,this[b+2]=a>>>16,this[b+1]=a>>>8,this[b]=a):I(this,a,b,!0),b+4},e.prototype.writeUInt32BE=function(a,b,c){return a=+a,b=0|b,c||G(this,a,b,4,4294967295,0),e.TYPED_ARRAY_SUPPORT?(this[b]=a>>>24,this[b+1]=a>>>16,this[b+2]=a>>>8,this[b+3]=a):I(this,a,b,!1),b+4},e.prototype.writeIntLE=function(a,b,c,d){if(a=+a,b=0|b,!d){var e=Math.pow(2,8*c-1);G(this,a,b,c,e-1,-e)}var f=0,g=1,h=0>a?1:0;for(this[b]=255&a;++f<c&&(g*=256);)this[b+f]=(a/g>>0)-h&255;return b+c},e.prototype.writeIntBE=function(a,b,c,d){if(a=+a,b=0|b,!d){var e=Math.pow(2,8*c-1);G(this,a,b,c,e-1,-e)}var f=c-1,g=1,h=0>a?1:0;for(this[b+f]=255&a;--f>=0&&(g*=256);)this[b+f]=(a/g>>0)-h&255;return b+c},e.prototype.writeInt8=function(a,b,c){return a=+a,b=0|b,c||G(this,a,b,1,127,-128),e.TYPED_ARRAY_SUPPORT||(a=Math.floor(a)),0>a&&(a=255+a+1),this[b]=a,b+1},e.prototype.writeInt16LE=function(a,b,c){return a=+a,b=0|b,c||G(this,a,b,2,32767,-32768),e.TYPED_ARRAY_SUPPORT?(this[b]=a,this[b+1]=a>>>8):H(this,a,b,!0),b+2},e.prototype.writeInt16BE=function(a,b,c){return a=+a,b=0|b,c||G(this,a,b,2,32767,-32768),e.TYPED_ARRAY_SUPPORT?(this[b]=a>>>8,this[b+1]=a):H(this,a,b,!1),b+2},e.prototype.writeInt32LE=function(a,b,c){return a=+a,b=0|b,c||G(this,a,b,4,2147483647,-2147483648),e.TYPED_ARRAY_SUPPORT?(this[b]=a,this[b+1]=a>>>8,this[b+2]=a>>>16,this[b+3]=a>>>24):I(this,a,b,!0),b+4},e.prototype.writeInt32BE=function(a,b,c){return a=+a,b=0|b,c||G(this,a,b,4,2147483647,-2147483648),0>a&&(a=4294967295+a+1),e.TYPED_ARRAY_SUPPORT?(this[b]=a>>>24,this[b+1]=a>>>16,this[b+2]=a>>>8,this[b+3]=a):I(this,a,b,!1),b+4},e.prototype.writeFloatLE=function(a,b,c){return K(this,a,b,!0,c)},e.prototype.writeFloatBE=function(a,b,c){return K(this,a,b,!1,c)},e.prototype.writeDoubleLE=function(a,b,c){return L(this,a,b,!0,c)},e.prototype.writeDoubleBE=function(a,b,c){return L(this,a,b,!1,c)},e.prototype.copy=function(a,b,c,d){if(c||(c=0),d||0===d||(d=this.length),b>=a.length&&(b=a.length),b||(b=0),d>0&&c>d&&(d=c),d===c)return 0;if(0===a.length||0===this.length)return 0;if(0>b)throw new RangeError("targetStart out of bounds");if(0>c||c>=this.length)throw new RangeError("sourceStart out of bounds");if(0>d)throw new RangeError("sourceEnd out of bounds");d>this.length&&(d=this.length),a.length-b<d-c&&(d=a.length-b+c);var f,g=d-c;if(this===a&&b>c&&d>b)for(f=g-1;f>=0;f--)a[f+b]=this[f+c];else if(1e3>g||!e.TYPED_ARRAY_SUPPORT)for(f=0;g>f;f++)a[f+b]=this[f+c];else a._set(this.subarray(c,c+g),b);return g},e.prototype.fill=function(a,b,c){if(a||(a=0),b||(b=0),c||(c=this.length),b>c)throw new RangeError("end < start");if(c!==b&&0!==this.length){if(0>b||b>=this.length)throw new RangeError("start out of bounds");if(0>c||c>this.length)throw new RangeError("end out of bounds");var d;if("number"==typeof a)for(d=b;c>d;d++)this[d]=a;else{var e=P(a.toString()),f=e.length;for(d=b;c>d;d++)this[d]=e[d%f]}return this}},e.prototype.toArrayBuffer=function(){if("undefined"!=typeof Uint8Array){if(e.TYPED_ARRAY_SUPPORT)return new e(this).buffer;for(var a=new Uint8Array(this.length),b=0,c=a.length;c>b;b+=1)a[b]=this[b];return a.buffer}throw new TypeError("Buffer.toArrayBuffer not supported in this browser")};var Y=e.prototype;e._augment=function(a){return a.constructor=e,a._isBuffer=!0,a._set=a.set,a.get=Y.get,a.set=Y.set,a.write=Y.write,a.toString=Y.toString,a.toLocaleString=Y.toString,a.toJSON=Y.toJSON,a.equals=Y.equals,a.compare=Y.compare,a.indexOf=Y.indexOf,a.copy=Y.copy,a.slice=Y.slice,a.readUIntLE=Y.readUIntLE,a.readUIntBE=Y.readUIntBE,a.readUInt8=Y.readUInt8,a.readUInt16LE=Y.readUInt16LE,a.readUInt16BE=Y.readUInt16BE,a.readUInt32LE=Y.readUInt32LE,a.readUInt32BE=Y.readUInt32BE,a.readIntLE=Y.readIntLE,a.readIntBE=Y.readIntBE,a.readInt8=Y.readInt8,a.readInt16LE=Y.readInt16LE,a.readInt16BE=Y.readInt16BE,a.readInt32LE=Y.readInt32LE,a.readInt32BE=Y.readInt32BE,a.readFloatLE=Y.readFloatLE,a.readFloatBE=Y.readFloatBE,a.readDoubleLE=Y.readDoubleLE,a.readDoubleBE=Y.readDoubleBE,a.writeUInt8=Y.writeUInt8,a.writeUIntLE=Y.writeUIntLE,a.writeUIntBE=Y.writeUIntBE,a.writeUInt16LE=Y.writeUInt16LE,a.writeUInt16BE=Y.writeUInt16BE,a.writeUInt32LE=Y.writeUInt32LE,a.writeUInt32BE=Y.writeUInt32BE,a.writeIntLE=Y.writeIntLE,a.writeIntBE=Y.writeIntBE,a.writeInt8=Y.writeInt8,a.writeInt16LE=Y.writeInt16LE,a.writeInt16BE=Y.writeInt16BE,a.writeInt32LE=Y.writeInt32LE,a.writeInt32BE=Y.writeInt32BE,a.writeFloatLE=Y.writeFloatLE,a.writeFloatBE=Y.writeFloatBE,a.writeDoubleLE=Y.writeDoubleLE,a.writeDoubleBE=Y.writeDoubleBE,a.fill=Y.fill,a.inspect=Y.inspect,a.toArrayBuffer=Y.toArrayBuffer,a};var Z=/[^+\/0-9A-Za-z-_]/g},{"base64-js":10,ieee754:11,"is-array":12}],10:[function(a,b,c){var d="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";!function(a){"use strict";function b(a){var b=a.charCodeAt(0);return b===g||b===l?62:b===h||b===m?63:i>b?-1:i+10>b?b-i+26+26:k+26>b?b-k:j+26>b?b-j+26:void 0}function c(a){function c(a){j[l++]=a}var d,e,g,h,i,j;if(a.length%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var k=a.length;i="="===a.charAt(k-2)?2:"="===a.charAt(k-1)?1:0,j=new f(3*a.length/4-i),g=i>0?a.length-4:a.length;var l=0;for(d=0,e=0;g>d;d+=4,e+=3)h=b(a.charAt(d))<<18|b(a.charAt(d+1))<<12|b(a.charAt(d+2))<<6|b(a.charAt(d+3)),c((16711680&h)>>16),c((65280&h)>>8),c(255&h);return 2===i?(h=b(a.charAt(d))<<2|b(a.charAt(d+1))>>4,c(255&h)):1===i&&(h=b(a.charAt(d))<<10|b(a.charAt(d+1))<<4|b(a.charAt(d+2))>>2,c(h>>8&255),c(255&h)),j}function e(a){function b(a){return d.charAt(a)}function c(a){return b(a>>18&63)+b(a>>12&63)+b(a>>6&63)+b(63&a)}var e,f,g,h=a.length%3,i="";for(e=0,g=a.length-h;g>e;e+=3)f=(a[e]<<16)+(a[e+1]<<8)+a[e+2],i+=c(f);switch(h){case 1:f=a[a.length-1],i+=b(f>>2),i+=b(f<<4&63),i+="==";break;case 2:f=(a[a.length-2]<<8)+a[a.length-1],i+=b(f>>10),i+=b(f>>4&63),i+=b(f<<2&63),i+="="}return i}var f="undefined"!=typeof Uint8Array?Uint8Array:Array,g="+".charCodeAt(0),h="/".charCodeAt(0),i="0".charCodeAt(0),j="a".charCodeAt(0),k="A".charCodeAt(0),l="-".charCodeAt(0),m="_".charCodeAt(0);a.toByteArray=c,a.fromByteArray=e}("undefined"==typeof c?this.base64js={}:c)},{}],11:[function(a,b,c){c.read=function(a,b,c,d,e){var f,g,h=8*e-d-1,i=(1<<h)-1,j=i>>1,k=-7,l=c?e-1:0,m=c?-1:1,n=a[b+l];for(l+=m,f=n&(1<<-k)-1,n>>=-k,k+=h;k>0;f=256*f+a[b+l],l+=m,k-=8);for(g=f&(1<<-k)-1,f>>=-k,k+=d;k>0;g=256*g+a[b+l],l+=m,k-=8);if(0===f)f=1-j;else{if(f===i)return g?NaN:(n?-1:1)*(1/0);g+=Math.pow(2,d),f-=j}return(n?-1:1)*g*Math.pow(2,f-d)},c.write=function(a,b,c,d,e,f){var g,h,i,j=8*f-e-1,k=(1<<j)-1,l=k>>1,m=23===e?Math.pow(2,-24)-Math.pow(2,-77):0,n=d?0:f-1,o=d?1:-1,p=0>b||0===b&&0>1/b?1:0;for(b=Math.abs(b),isNaN(b)||b===1/0?(h=isNaN(b)?1:0,g=k):(g=Math.floor(Math.log(b)/Math.LN2),b*(i=Math.pow(2,-g))<1&&(g--,i*=2),b+=g+l>=1?m/i:m*Math.pow(2,1-l),b*i>=2&&(g++,i/=2),g+l>=k?(h=0,g=k):g+l>=1?(h=(b*i-1)*Math.pow(2,e),g+=l):(h=b*Math.pow(2,l-1)*Math.pow(2,e),g=0));e>=8;a[c+n]=255&h,
n+=o,h/=256,e-=8);for(g=g<<e|h,j+=e;j>0;a[c+n]=255&g,n+=o,g/=256,j-=8);a[c+n-o]|=128*p}},{}],12:[function(a,b,c){var d=Array.isArray,e=Object.prototype.toString;b.exports=d||function(a){return!!a&&"[object Array]"==e.call(a)}},{}],13:[function(a,b,c){"function"==typeof Object.create?b.exports=function(a,b){a.super_=b,a.prototype=Object.create(b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}})}:b.exports=function(a,b){a.super_=b;var c=function(){};c.prototype=b.prototype,a.prototype=new c,a.prototype.constructor=a}},{}],14:[function(a,b,c){function d(){k=!1,h.length?j=h.concat(j):l=-1,j.length&&e()}function e(){if(!k){var a=setTimeout(d);k=!0;for(var b=j.length;b;){for(h=j,j=[];++l<b;)h[l].run();l=-1,b=j.length}h=null,k=!1,clearTimeout(a)}}function f(a,b){this.fun=a,this.array=b}function g(){}var h,i=b.exports={},j=[],k=!1,l=-1;i.nextTick=function(a){var b=new Array(arguments.length-1);if(arguments.length>1)for(var c=1;c<arguments.length;c++)b[c-1]=arguments[c];j.push(new f(a,b)),1!==j.length||k||setTimeout(e,0)},f.prototype.run=function(){this.fun.apply(null,this.array)},i.title="browser",i.browser=!0,i.env={},i.argv=[],i.version="",i.versions={},i.on=g,i.addListener=g,i.once=g,i.off=g,i.removeListener=g,i.removeAllListeners=g,i.emit=g,i.binding=function(a){throw new Error("process.binding is not supported")},i.cwd=function(){return"/"},i.chdir=function(a){throw new Error("process.chdir is not supported")},i.umask=function(){return 0}},{}],15:[function(a,b,c){b.exports=function(a){return a&&"object"==typeof a&&"function"==typeof a.copy&&"function"==typeof a.fill&&"function"==typeof a.readUInt8}},{}],16:[function(a,b,c){(function(b,d){function e(a,b){var d={seen:[],stylize:g};return arguments.length>=3&&(d.depth=arguments[2]),arguments.length>=4&&(d.colors=arguments[3]),p(b)?d.showHidden=b:b&&c._extend(d,b),v(d.showHidden)&&(d.showHidden=!1),v(d.depth)&&(d.depth=2),v(d.colors)&&(d.colors=!1),v(d.customInspect)&&(d.customInspect=!0),d.colors&&(d.stylize=f),i(d,a,d.depth)}function f(a,b){var c=e.styles[b];return c?"["+e.colors[c][0]+"m"+a+"["+e.colors[c][1]+"m":a}function g(a,b){return a}function h(a){var b={};return a.forEach(function(a,c){b[a]=!0}),b}function i(a,b,d){if(a.customInspect&&b&&A(b.inspect)&&b.inspect!==c.inspect&&(!b.constructor||b.constructor.prototype!==b)){var e=b.inspect(d,a);return t(e)||(e=i(a,e,d)),e}var f=j(a,b);if(f)return f;var g=Object.keys(b),p=h(g);if(a.showHidden&&(g=Object.getOwnPropertyNames(b)),z(b)&&(g.indexOf("message")>=0||g.indexOf("description")>=0))return k(b);if(0===g.length){if(A(b)){var q=b.name?": "+b.name:"";return a.stylize("[Function"+q+"]","special")}if(w(b))return a.stylize(RegExp.prototype.toString.call(b),"regexp");if(y(b))return a.stylize(Date.prototype.toString.call(b),"date");if(z(b))return k(b)}var r="",s=!1,u=["{","}"];if(o(b)&&(s=!0,u=["[","]"]),A(b)){var v=b.name?": "+b.name:"";r=" [Function"+v+"]"}if(w(b)&&(r=" "+RegExp.prototype.toString.call(b)),y(b)&&(r=" "+Date.prototype.toUTCString.call(b)),z(b)&&(r=" "+k(b)),0===g.length&&(!s||0==b.length))return u[0]+r+u[1];if(0>d)return w(b)?a.stylize(RegExp.prototype.toString.call(b),"regexp"):a.stylize("[Object]","special");a.seen.push(b);var x;return x=s?l(a,b,d,p,g):g.map(function(c){return m(a,b,d,p,c,s)}),a.seen.pop(),n(x,r,u)}function j(a,b){if(v(b))return a.stylize("undefined","undefined");if(t(b)){var c="'"+JSON.stringify(b).replace(/^"|"$/g,"").replace(/'/g,"\\'").replace(/\\"/g,'"')+"'";return a.stylize(c,"string")}return s(b)?a.stylize(""+b,"number"):p(b)?a.stylize(""+b,"boolean"):q(b)?a.stylize("null","null"):void 0}function k(a){return"["+Error.prototype.toString.call(a)+"]"}function l(a,b,c,d,e){for(var f=[],g=0,h=b.length;h>g;++g)F(b,String(g))?f.push(m(a,b,c,d,String(g),!0)):f.push("");return e.forEach(function(e){e.match(/^\d+$/)||f.push(m(a,b,c,d,e,!0))}),f}function m(a,b,c,d,e,f){var g,h,j;if(j=Object.getOwnPropertyDescriptor(b,e)||{value:b[e]},j.get?h=j.set?a.stylize("[Getter/Setter]","special"):a.stylize("[Getter]","special"):j.set&&(h=a.stylize("[Setter]","special")),F(d,e)||(g="["+e+"]"),h||(a.seen.indexOf(j.value)<0?(h=q(c)?i(a,j.value,null):i(a,j.value,c-1),h.indexOf("\n")>-1&&(h=f?h.split("\n").map(function(a){return"  "+a}).join("\n").substr(2):"\n"+h.split("\n").map(function(a){return"   "+a}).join("\n"))):h=a.stylize("[Circular]","special")),v(g)){if(f&&e.match(/^\d+$/))return h;g=JSON.stringify(""+e),g.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)?(g=g.substr(1,g.length-2),g=a.stylize(g,"name")):(g=g.replace(/'/g,"\\'").replace(/\\"/g,'"').replace(/(^"|"$)/g,"'"),g=a.stylize(g,"string"))}return g+": "+h}function n(a,b,c){var d=0,e=a.reduce(function(a,b){return d++,b.indexOf("\n")>=0&&d++,a+b.replace(/\u001b\[\d\d?m/g,"").length+1},0);return e>60?c[0]+(""===b?"":b+"\n ")+" "+a.join(",\n  ")+" "+c[1]:c[0]+b+" "+a.join(", ")+" "+c[1]}function o(a){return Array.isArray(a)}function p(a){return"boolean"==typeof a}function q(a){return null===a}function r(a){return null==a}function s(a){return"number"==typeof a}function t(a){return"string"==typeof a}function u(a){return"symbol"==typeof a}function v(a){return void 0===a}function w(a){return x(a)&&"[object RegExp]"===C(a)}function x(a){return"object"==typeof a&&null!==a}function y(a){return x(a)&&"[object Date]"===C(a)}function z(a){return x(a)&&("[object Error]"===C(a)||a instanceof Error)}function A(a){return"function"==typeof a}function B(a){return null===a||"boolean"==typeof a||"number"==typeof a||"string"==typeof a||"symbol"==typeof a||"undefined"==typeof a}function C(a){return Object.prototype.toString.call(a)}function D(a){return 10>a?"0"+a.toString(10):a.toString(10)}function E(){var a=new Date,b=[D(a.getHours()),D(a.getMinutes()),D(a.getSeconds())].join(":");return[a.getDate(),J[a.getMonth()],b].join(" ")}function F(a,b){return Object.prototype.hasOwnProperty.call(a,b)}var G=/%[sdj%]/g;c.format=function(a){if(!t(a)){for(var b=[],c=0;c<arguments.length;c++)b.push(e(arguments[c]));return b.join(" ")}for(var c=1,d=arguments,f=d.length,g=String(a).replace(G,function(a){if("%%"===a)return"%";if(c>=f)return a;switch(a){case"%s":return String(d[c++]);case"%d":return Number(d[c++]);case"%j":try{return JSON.stringify(d[c++])}catch(b){return"[Circular]"}default:return a}}),h=d[c];f>c;h=d[++c])g+=q(h)||!x(h)?" "+h:" "+e(h);return g},c.deprecate=function(a,e){function f(){if(!g){if(b.throwDeprecation)throw new Error(e);b.traceDeprecation?console.trace(e):console.error(e),g=!0}return a.apply(this,arguments)}if(v(d.process))return function(){return c.deprecate(a,e).apply(this,arguments)};if(b.noDeprecation===!0)return a;var g=!1;return f};var H,I={};c.debuglog=function(a){if(v(H)&&(H=b.env.NODE_DEBUG||""),a=a.toUpperCase(),!I[a])if(new RegExp("\\b"+a+"\\b","i").test(H)){var d=b.pid;I[a]=function(){var b=c.format.apply(c,arguments);console.error("%s %d: %s",a,d,b)}}else I[a]=function(){};return I[a]},c.inspect=e,e.colors={bold:[1,22],italic:[3,23],underline:[4,24],inverse:[7,27],white:[37,39],grey:[90,39],black:[30,39],blue:[34,39],cyan:[36,39],green:[32,39],magenta:[35,39],red:[31,39],yellow:[33,39]},e.styles={special:"cyan",number:"yellow","boolean":"yellow",undefined:"grey","null":"bold",string:"green",date:"magenta",regexp:"red"},c.isArray=o,c.isBoolean=p,c.isNull=q,c.isNullOrUndefined=r,c.isNumber=s,c.isString=t,c.isSymbol=u,c.isUndefined=v,c.isRegExp=w,c.isObject=x,c.isDate=y,c.isError=z,c.isFunction=A,c.isPrimitive=B,c.isBuffer=a("./support/isBuffer");var J=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];c.log=function(){console.log("%s - %s",E(),c.format.apply(c,arguments))},c.inherits=a("inherits"),c._extend=function(a,b){if(!b||!x(b))return a;for(var c=Object.keys(b),d=c.length;d--;)a[c[d]]=b[c[d]];return a}}).call(this,a("_process"),"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./support/isBuffer":15,_process:14,inherits:13}]},{},[8]);