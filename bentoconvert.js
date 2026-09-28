// This file's own original code is licensed separately from the rest of
// this Moodle plugin — see LICENSE-JS.md in the repository root.
// Non-commercial use is freely permitted; commercial use requires the
// author's express written permission. (The bundled third-party JSZip
// code below keeps its own MIT/GPLv3 dual license — see its own notice
// further down where it's actually embedded.)

// JSZip, forced onto window regardless of the surrounding script-loading
// environment: its own UMD wrapper below checks `typeof exports` /
// `typeof module` to decide whether it's in a CommonJS context — if
// Moodle's JS pipeline happens to expose module-like globals in this
// script's execution scope, JSZip would attach itself there instead of to
// window, and convertPptx() below would then see "JSZip is not defined".
// Shadowing module/exports/define as LOCAL undefined vars forces JSZip's
// own detection down the plain-browser-global branch, unconditionally.
(function () {
  var module, exports, define;
/*!

JSZip v3.10.1 - A JavaScript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/main/LICENSE
*/

!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).JSZip=e()}}(function(){return function s(a,o,h){function u(r,e){if(!o[r]){if(!a[r]){var t="function"==typeof require&&require;if(!e&&t)return t(r,!0);if(l)return l(r,!0);var n=new Error("Cannot find module '"+r+"'");throw n.code="MODULE_NOT_FOUND",n}var i=o[r]={exports:{}};a[r][0].call(i.exports,function(e){var t=a[r][1][e];return u(t||e)},i,i.exports,s,a,o,h)}return o[r].exports}for(var l="function"==typeof require&&require,e=0;e<h.length;e++)u(h[e]);return u}({1:[function(e,t,r){"use strict";var d=e("./utils"),c=e("./support"),p="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";r.encode=function(e){for(var t,r,n,i,s,a,o,h=[],u=0,l=e.length,f=l,c="string"!==d.getTypeOf(e);u<e.length;)f=l-u,n=c?(t=e[u++],r=u<l?e[u++]:0,u<l?e[u++]:0):(t=e.charCodeAt(u++),r=u<l?e.charCodeAt(u++):0,u<l?e.charCodeAt(u++):0),i=t>>2,s=(3&t)<<4|r>>4,a=1<f?(15&r)<<2|n>>6:64,o=2<f?63&n:64,h.push(p.charAt(i)+p.charAt(s)+p.charAt(a)+p.charAt(o));return h.join("")},r.decode=function(e){var t,r,n,i,s,a,o=0,h=0,u="data:";if(e.substr(0,u.length)===u)throw new Error("Invalid base64 input, it looks like a data url.");var l,f=3*(e=e.replace(/[^A-Za-z0-9+/=]/g,"")).length/4;if(e.charAt(e.length-1)===p.charAt(64)&&f--,e.charAt(e.length-2)===p.charAt(64)&&f--,f%1!=0)throw new Error("Invalid base64 input, bad content length.");for(l=c.uint8array?new Uint8Array(0|f):new Array(0|f);o<e.length;)t=p.indexOf(e.charAt(o++))<<2|(i=p.indexOf(e.charAt(o++)))>>4,r=(15&i)<<4|(s=p.indexOf(e.charAt(o++)))>>2,n=(3&s)<<6|(a=p.indexOf(e.charAt(o++))),l[h++]=t,64!==s&&(l[h++]=r),64!==a&&(l[h++]=n);return l}},{"./support":30,"./utils":32}],2:[function(e,t,r){"use strict";var n=e("./external"),i=e("./stream/DataWorker"),s=e("./stream/Crc32Probe"),a=e("./stream/DataLengthProbe");function o(e,t,r,n,i){this.compressedSize=e,this.uncompressedSize=t,this.crc32=r,this.compression=n,this.compressedContent=i}o.prototype={getContentWorker:function(){var e=new i(n.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")),t=this;return e.on("end",function(){if(this.streamInfo.data_length!==t.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch")}),e},getCompressedWorker:function(){return new i(n.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize",this.compressedSize).withStreamInfo("uncompressedSize",this.uncompressedSize).withStreamInfo("crc32",this.crc32).withStreamInfo("compression",this.compression)}},o.createWorkerFrom=function(e,t,r){return e.pipe(new s).pipe(new a("uncompressedSize")).pipe(t.compressWorker(r)).pipe(new a("compressedSize")).withStreamInfo("compression",t)},t.exports=o},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(e,t,r){"use strict";var n=e("./stream/GenericWorker");r.STORE={magic:"\0\0",compressWorker:function(){return new n("STORE compression")},uncompressWorker:function(){return new n("STORE decompression")}},r.DEFLATE=e("./flate")},{"./flate":7,"./stream/GenericWorker":28}],4:[function(e,t,r){"use strict";var n=e("./utils");var o=function(){for(var e,t=[],r=0;r<256;r++){e=r;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[r]=e}return t}();t.exports=function(e,t){return void 0!==e&&e.length?"string"!==n.getTypeOf(e)?function(e,t,r,n){var i=o,s=n+r;e^=-1;for(var a=n;a<s;a++)e=e>>>8^i[255&(e^t[a])];return-1^e}(0|t,e,e.length,0):function(e,t,r,n){var i=o,s=n+r;e^=-1;for(var a=n;a<s;a++)e=e>>>8^i[255&(e^t.charCodeAt(a))];return-1^e}(0|t,e,e.length,0):0}},{"./utils":32}],5:[function(e,t,r){"use strict";r.base64=!1,r.binary=!1,r.dir=!1,r.createFolders=!0,r.date=null,r.compression=null,r.compressionOptions=null,r.comment=null,r.unixPermissions=null,r.dosPermissions=null},{}],6:[function(e,t,r){"use strict";var n=null;n="undefined"!=typeof Promise?Promise:e("lie"),t.exports={Promise:n}},{lie:37}],7:[function(e,t,r){"use strict";var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array,i=e("pako"),s=e("./utils"),a=e("./stream/GenericWorker"),o=n?"uint8array":"array";function h(e,t){a.call(this,"FlateWorker/"+e),this._pako=null,this._pakoAction=e,this._pakoOptions=t,this.meta={}}r.magic="\b\0",s.inherits(h,a),h.prototype.processChunk=function(e){this.meta=e.meta,null===this._pako&&this._createPako(),this._pako.push(s.transformTo(o,e.data),!1)},h.prototype.flush=function(){a.prototype.flush.call(this),null===this._pako&&this._createPako(),this._pako.push([],!0)},h.prototype.cleanUp=function(){a.prototype.cleanUp.call(this),this._pako=null},h.prototype._createPako=function(){this._pako=new i[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var t=this;this._pako.onData=function(e){t.push({data:e,meta:t.meta})}},r.compressWorker=function(e){return new h("Deflate",e)},r.uncompressWorker=function(){return new h("Inflate",{})}},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(e,t,r){"use strict";function A(e,t){var r,n="";for(r=0;r<t;r++)n+=String.fromCharCode(255&e),e>>>=8;return n}function n(e,t,r,n,i,s){var a,o,h=e.file,u=e.compression,l=s!==O.utf8encode,f=I.transformTo("string",s(h.name)),c=I.transformTo("string",O.utf8encode(h.name)),d=h.comment,p=I.transformTo("string",s(d)),m=I.transformTo("string",O.utf8encode(d)),_=c.length!==h.name.length,g=m.length!==d.length,b="",v="",y="",w=h.dir,k=h.date,x={crc32:0,compressedSize:0,uncompressedSize:0};t&&!r||(x.crc32=e.crc32,x.compressedSize=e.compressedSize,x.uncompressedSize=e.uncompressedSize);var S=0;t&&(S|=8),l||!_&&!g||(S|=2048);var z=0,C=0;w&&(z|=16),"UNIX"===i?(C=798,z|=function(e,t){var r=e;return e||(r=t?16893:33204),(65535&r)<<16}(h.unixPermissions,w)):(C=20,z|=function(e){return 63&(e||0)}(h.dosPermissions)),a=k.getUTCHours(),a<<=6,a|=k.getUTCMinutes(),a<<=5,a|=k.getUTCSeconds()/2,o=k.getUTCFullYear()-1980,o<<=4,o|=k.getUTCMonth()+1,o<<=5,o|=k.getUTCDate(),_&&(v=A(1,1)+A(B(f),4)+c,b+="up"+A(v.length,2)+v),g&&(y=A(1,1)+A(B(p),4)+m,b+="uc"+A(y.length,2)+y);var E="";return E+="\n\0",E+=A(S,2),E+=u.magic,E+=A(a,2),E+=A(o,2),E+=A(x.crc32,4),E+=A(x.compressedSize,4),E+=A(x.uncompressedSize,4),E+=A(f.length,2),E+=A(b.length,2),{fileRecord:R.LOCAL_FILE_HEADER+E+f+b,dirRecord:R.CENTRAL_FILE_HEADER+A(C,2)+E+A(p.length,2)+"\0\0\0\0"+A(z,4)+A(n,4)+f+b+p}}var I=e("../utils"),i=e("../stream/GenericWorker"),O=e("../utf8"),B=e("../crc32"),R=e("../signature");function s(e,t,r,n){i.call(this,"ZipFileWorker"),this.bytesWritten=0,this.zipComment=t,this.zipPlatform=r,this.encodeFileName=n,this.streamFiles=e,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[]}I.inherits(s,i),s.prototype.push=function(e){var t=e.meta.percent||0,r=this.entriesCount,n=this._sources.length;this.accumulate?this.contentBuffer.push(e):(this.bytesWritten+=e.data.length,i.prototype.push.call(this,{data:e.data,meta:{currentFile:this.currentFile,percent:r?(t+100*(r-n-1))/r:100}}))},s.prototype.openedSource=function(e){this.currentSourceOffset=this.bytesWritten,this.currentFile=e.file.name;var t=this.streamFiles&&!e.file.dir;if(t){var r=n(e,t,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:r.fileRecord,meta:{percent:0}})}else this.accumulate=!0},s.prototype.closedSource=function(e){this.accumulate=!1;var t=this.streamFiles&&!e.file.dir,r=n(e,t,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(r.dirRecord),t)this.push({data:function(e){return R.DATA_DESCRIPTOR+A(e.crc32,4)+A(e.compressedSize,4)+A(e.uncompressedSize,4)}(e),meta:{percent:100}});else for(this.push({data:r.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},s.prototype.flush=function(){for(var e=this.bytesWritten,t=0;t<this.dirRecords.length;t++)this.push({data:this.dirRecords[t],meta:{percent:100}});var r=this.bytesWritten-e,n=function(e,t,r,n,i){var s=I.transformTo("string",i(n));return R.CENTRAL_DIRECTORY_END+"\0\0\0\0"+A(e,2)+A(e,2)+A(t,4)+A(r,4)+A(s.length,2)+s}(this.dirRecords.length,r,e,this.zipComment,this.encodeFileName);this.push({data:n,meta:{percent:100}})},s.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},s.prototype.registerPrevious=function(e){this._sources.push(e);var t=this;return e.on("data",function(e){t.processChunk(e)}),e.on("end",function(){t.closedSource(t.previous.streamInfo),t._sources.length?t.prepareNextSource():t.end()}),e.on("error",function(e){t.error(e)}),this},s.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},s.prototype.error=function(e){var t=this._sources;if(!i.prototype.error.call(this,e))return!1;for(var r=0;r<t.length;r++)try{t[r].error(e)}catch(e){}return!0},s.prototype.lock=function(){i.prototype.lock.call(this);for(var e=this._sources,t=0;t<e.length;t++)e[t].lock()},t.exports=s},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(e,t,r){"use strict";var u=e("../compressions"),n=e("./ZipFileWorker");r.generateWorker=function(e,a,t){var o=new n(a.streamFiles,t,a.platform,a.encodeFileName),h=0;try{e.forEach(function(e,t){h++;var r=function(e,t){var r=e||t,n=u[r];if(!n)throw new Error(r+" is not a valid compression method !");return n}(t.options.compression,a.compression),n=t.options.compressionOptions||a.compressionOptions||{},i=t.dir,s=t.date;t._compressWorker(r,n).withStreamInfo("file",{name:e,dir:i,date:s,comment:t.comment||"",unixPermissions:t.unixPermissions,dosPermissions:t.dosPermissions}).pipe(o)}),o.entriesCount=h}catch(e){o.error(e)}return o}},{"../compressions":3,"./ZipFileWorker":8}],10:[function(e,t,r){"use strict";function n(){if(!(this instanceof n))return new n;if(arguments.length)throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");this.files=Object.create(null),this.comment=null,this.root="",this.clone=function(){var e=new n;for(var t in this)"function"!=typeof this[t]&&(e[t]=this[t]);return e}}(n.prototype=e("./object")).loadAsync=e("./load"),n.support=e("./support"),n.defaults=e("./defaults"),n.version="3.10.1",n.loadAsync=function(e,t){return(new n).loadAsync(e,t)},n.external=e("./external"),t.exports=n},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(e,t,r){"use strict";var u=e("./utils"),i=e("./external"),n=e("./utf8"),s=e("./zipEntries"),a=e("./stream/Crc32Probe"),l=e("./nodejsUtils");function f(n){return new i.Promise(function(e,t){var r=n.decompressed.getContentWorker().pipe(new a);r.on("error",function(e){t(e)}).on("end",function(){r.streamInfo.crc32!==n.decompressed.crc32?t(new Error("Corrupted zip : CRC32 mismatch")):e()}).resume()})}t.exports=function(e,o){var h=this;return o=u.extend(o||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:n.utf8decode}),l.isNode&&l.isStream(e)?i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")):u.prepareContent("the loaded zip file",e,!0,o.optimizedBinaryString,o.base64).then(function(e){var t=new s(o);return t.load(e),t}).then(function(e){var t=[i.Promise.resolve(e)],r=e.files;if(o.checkCRC32)for(var n=0;n<r.length;n++)t.push(f(r[n]));return i.Promise.all(t)}).then(function(e){for(var t=e.shift(),r=t.files,n=0;n<r.length;n++){var i=r[n],s=i.fileNameStr,a=u.resolve(i.fileNameStr);h.file(a,i.decompressed,{binary:!0,optimizedBinaryString:!0,date:i.date,dir:i.dir,comment:i.fileCommentStr.length?i.fileCommentStr:null,unixPermissions:i.unixPermissions,dosPermissions:i.dosPermissions,createFolders:o.createFolders}),i.dir||(h.file(a).unsafeOriginalName=s)}return t.zipComment.length&&(h.comment=t.zipComment),h})}},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(e,t,r){"use strict";var n=e("../utils"),i=e("../stream/GenericWorker");function s(e,t){i.call(this,"Nodejs stream input adapter for "+e),this._upstreamEnded=!1,this._bindStream(t)}n.inherits(s,i),s.prototype._bindStream=function(e){var t=this;(this._stream=e).pause(),e.on("data",function(e){t.push({data:e,meta:{percent:0}})}).on("error",function(e){t.isPaused?this.generatedError=e:t.error(e)}).on("end",function(){t.isPaused?t._upstreamEnded=!0:t.end()})},s.prototype.pause=function(){return!!i.prototype.pause.call(this)&&(this._stream.pause(),!0)},s.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},t.exports=s},{"../stream/GenericWorker":28,"../utils":32}],13:[function(e,t,r){"use strict";var i=e("readable-stream").Readable;function n(e,t,r){i.call(this,t),this._helper=e;var n=this;e.on("data",function(e,t){n.push(e)||n._helper.pause(),r&&r(t)}).on("error",function(e){n.emit("error",e)}).on("end",function(){n.push(null)})}e("../utils").inherits(n,i),n.prototype._read=function(){this._helper.resume()},t.exports=n},{"../utils":32,"readable-stream":16}],14:[function(e,t,r){"use strict";t.exports={isNode:"undefined"!=typeof Buffer,newBufferFrom:function(e,t){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(e,t);if("number"==typeof e)throw new Error('The "data" argument must not be a number');return new Buffer(e,t)},allocBuffer:function(e){if(Buffer.alloc)return Buffer.alloc(e);var t=new Buffer(e);return t.fill(0),t},isBuffer:function(e){return Buffer.isBuffer(e)},isStream:function(e){return e&&"function"==typeof e.on&&"function"==typeof e.pause&&"function"==typeof e.resume}}},{}],15:[function(e,t,r){"use strict";function s(e,t,r){var n,i=u.getTypeOf(t),s=u.extend(r||{},f);s.date=s.date||new Date,null!==s.compression&&(s.compression=s.compression.toUpperCase()),"string"==typeof s.unixPermissions&&(s.unixPermissions=parseInt(s.unixPermissions,8)),s.unixPermissions&&16384&s.unixPermissions&&(s.dir=!0),s.dosPermissions&&16&s.dosPermissions&&(s.dir=!0),s.dir&&(e=g(e)),s.createFolders&&(n=_(e))&&b.call(this,n,!0);var a="string"===i&&!1===s.binary&&!1===s.base64;r&&void 0!==r.binary||(s.binary=!a),(t instanceof c&&0===t.uncompressedSize||s.dir||!t||0===t.length)&&(s.base64=!1,s.binary=!0,t="",s.compression="STORE",i="string");var o=null;o=t instanceof c||t instanceof l?t:p.isNode&&p.isStream(t)?new m(e,t):u.prepareContent(e,t,s.binary,s.optimizedBinaryString,s.base64);var h=new d(e,o,s);this.files[e]=h}var i=e("./utf8"),u=e("./utils"),l=e("./stream/GenericWorker"),a=e("./stream/StreamHelper"),f=e("./defaults"),c=e("./compressedObject"),d=e("./zipObject"),o=e("./generate"),p=e("./nodejsUtils"),m=e("./nodejs/NodejsStreamInputAdapter"),_=function(e){"/"===e.slice(-1)&&(e=e.substring(0,e.length-1));var t=e.lastIndexOf("/");return 0<t?e.substring(0,t):""},g=function(e){return"/"!==e.slice(-1)&&(e+="/"),e},b=function(e,t){return t=void 0!==t?t:f.createFolders,e=g(e),this.files[e]||s.call(this,e,null,{dir:!0,createFolders:t}),this.files[e]};function h(e){return"[object RegExp]"===Object.prototype.toString.call(e)}var n={load:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},forEach:function(e){var t,r,n;for(t in this.files)n=this.files[t],(r=t.slice(this.root.length,t.length))&&t.slice(0,this.root.length)===this.root&&e(r,n)},filter:function(r){var n=[];return this.forEach(function(e,t){r(e,t)&&n.push(t)}),n},file:function(e,t,r){if(1!==arguments.length)return e=this.root+e,s.call(this,e,t,r),this;if(h(e)){var n=e;return this.filter(function(e,t){return!t.dir&&n.test(e)})}var i=this.files[this.root+e];return i&&!i.dir?i:null},folder:function(r){if(!r)return this;if(h(r))return this.filter(function(e,t){return t.dir&&r.test(e)});var e=this.root+r,t=b.call(this,e),n=this.clone();return n.root=t.name,n},remove:function(r){r=this.root+r;var e=this.files[r];if(e||("/"!==r.slice(-1)&&(r+="/"),e=this.files[r]),e&&!e.dir)delete this.files[r];else for(var t=this.filter(function(e,t){return t.name.slice(0,r.length)===r}),n=0;n<t.length;n++)delete this.files[t[n].name];return this},generate:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},generateInternalStream:function(e){var t,r={};try{if((r=u.extend(e||{},{streamFiles:!1,compression:"STORE",compressionOptions:null,type:"",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:i.utf8encode})).type=r.type.toLowerCase(),r.compression=r.compression.toUpperCase(),"binarystring"===r.type&&(r.type="string"),!r.type)throw new Error("No output type specified.");u.checkSupport(r.type),"darwin"!==r.platform&&"freebsd"!==r.platform&&"linux"!==r.platform&&"sunos"!==r.platform||(r.platform="UNIX"),"win32"===r.platform&&(r.platform="DOS");var n=r.comment||this.comment||"";t=o.generateWorker(this,r,n)}catch(e){(t=new l("error")).error(e)}return new a(t,r.type||"string",r.mimeType)},generateAsync:function(e,t){return this.generateInternalStream(e).accumulate(t)},generateNodeStream:function(e,t){return(e=e||{}).type||(e.type="nodebuffer"),this.generateInternalStream(e).toNodejsStream(t)}};t.exports=n},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(e,t,r){"use strict";t.exports=e("stream")},{stream:void 0}],17:[function(e,t,r){"use strict";var n=e("./DataReader");function i(e){n.call(this,e);for(var t=0;t<this.data.length;t++)e[t]=255&e[t]}e("../utils").inherits(i,n),i.prototype.byteAt=function(e){return this.data[this.zero+e]},i.prototype.lastIndexOfSignature=function(e){for(var t=e.charCodeAt(0),r=e.charCodeAt(1),n=e.charCodeAt(2),i=e.charCodeAt(3),s=this.length-4;0<=s;--s)if(this.data[s]===t&&this.data[s+1]===r&&this.data[s+2]===n&&this.data[s+3]===i)return s-this.zero;return-1},i.prototype.readAndCheckSignature=function(e){var t=e.charCodeAt(0),r=e.charCodeAt(1),n=e.charCodeAt(2),i=e.charCodeAt(3),s=this.readData(4);return t===s[0]&&r===s[1]&&n===s[2]&&i===s[3]},i.prototype.readData=function(e){if(this.checkOffset(e),0===e)return[];var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./DataReader":18}],18:[function(e,t,r){"use strict";var n=e("../utils");function i(e){this.data=e,this.length=e.length,this.index=0,this.zero=0}i.prototype={checkOffset:function(e){this.checkIndex(this.index+e)},checkIndex:function(e){if(this.length<this.zero+e||e<0)throw new Error("End of data reached (data length = "+this.length+", asked index = "+e+"). Corrupted zip ?")},setIndex:function(e){this.checkIndex(e),this.index=e},skip:function(e){this.setIndex(this.index+e)},byteAt:function(){},readInt:function(e){var t,r=0;for(this.checkOffset(e),t=this.index+e-1;t>=this.index;t--)r=(r<<8)+this.byteAt(t);return this.index+=e,r},readString:function(e){return n.transformTo("string",this.readData(e))},readData:function(){},lastIndexOfSignature:function(){},readAndCheckSignature:function(){},readDate:function(){var e=this.readInt(4);return new Date(Date.UTC(1980+(e>>25&127),(e>>21&15)-1,e>>16&31,e>>11&31,e>>5&63,(31&e)<<1))}},t.exports=i},{"../utils":32}],19:[function(e,t,r){"use strict";var n=e("./Uint8ArrayReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.readData=function(e){this.checkOffset(e);var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(e,t,r){"use strict";var n=e("./DataReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.byteAt=function(e){return this.data.charCodeAt(this.zero+e)},i.prototype.lastIndexOfSignature=function(e){return this.data.lastIndexOf(e)-this.zero},i.prototype.readAndCheckSignature=function(e){return e===this.readData(4)},i.prototype.readData=function(e){this.checkOffset(e);var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./DataReader":18}],21:[function(e,t,r){"use strict";var n=e("./ArrayReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.readData=function(e){if(this.checkOffset(e),0===e)return new Uint8Array(0);var t=this.data.subarray(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./ArrayReader":17}],22:[function(e,t,r){"use strict";var n=e("../utils"),i=e("../support"),s=e("./ArrayReader"),a=e("./StringReader"),o=e("./NodeBufferReader"),h=e("./Uint8ArrayReader");t.exports=function(e){var t=n.getTypeOf(e);return n.checkSupport(t),"string"!==t||i.uint8array?"nodebuffer"===t?new o(e):i.uint8array?new h(n.transformTo("uint8array",e)):new s(n.transformTo("array",e)):new a(e)}},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(e,t,r){"use strict";r.LOCAL_FILE_HEADER="PK",r.CENTRAL_FILE_HEADER="PK",r.CENTRAL_DIRECTORY_END="PK",r.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK",r.ZIP64_CENTRAL_DIRECTORY_END="PK",r.DATA_DESCRIPTOR="PK\b"},{}],24:[function(e,t,r){"use strict";var n=e("./GenericWorker"),i=e("../utils");function s(e){n.call(this,"ConvertWorker to "+e),this.destType=e}i.inherits(s,n),s.prototype.processChunk=function(e){this.push({data:i.transformTo(this.destType,e.data),meta:e.meta})},t.exports=s},{"../utils":32,"./GenericWorker":28}],25:[function(e,t,r){"use strict";var n=e("./GenericWorker"),i=e("../crc32");function s(){n.call(this,"Crc32Probe"),this.withStreamInfo("crc32",0)}e("../utils").inherits(s,n),s.prototype.processChunk=function(e){this.streamInfo.crc32=i(e.data,this.streamInfo.crc32||0),this.push(e)},t.exports=s},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(e,t,r){"use strict";var n=e("../utils"),i=e("./GenericWorker");function s(e){i.call(this,"DataLengthProbe for "+e),this.propName=e,this.withStreamInfo(e,0)}n.inherits(s,i),s.prototype.processChunk=function(e){if(e){var t=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=t+e.data.length}i.prototype.processChunk.call(this,e)},t.exports=s},{"../utils":32,"./GenericWorker":28}],27:[function(e,t,r){"use strict";var n=e("../utils"),i=e("./GenericWorker");function s(e){i.call(this,"DataWorker");var t=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type="",this._tickScheduled=!1,e.then(function(e){t.dataIsReady=!0,t.data=e,t.max=e&&e.length||0,t.type=n.getTypeOf(e),t.isPaused||t._tickAndRepeat()},function(e){t.error(e)})}n.inherits(s,i),s.prototype.cleanUp=function(){i.prototype.cleanUp.call(this),this.data=null},s.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,n.delay(this._tickAndRepeat,[],this)),!0)},s.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(n.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0))},s.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var e=null,t=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":e=this.data.substring(this.index,t);break;case"uint8array":e=this.data.subarray(this.index,t);break;case"array":case"nodebuffer":e=this.data.slice(this.index,t)}return this.index=t,this.push({data:e,meta:{percent:this.max?this.index/this.max*100:0}})},t.exports=s},{"../utils":32,"./GenericWorker":28}],28:[function(e,t,r){"use strict";function n(e){this.name=e||"default",this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null}n.prototype={push:function(e){this.emit("data",e)},end:function(){if(this.isFinished)return!1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0}catch(e){this.emit("error",e)}return!0},error:function(e){return!this.isFinished&&(this.isPaused?this.generatedError=e:(this.isFinished=!0,this.emit("error",e),this.previous&&this.previous.error(e),this.cleanUp()),!0)},on:function(e,t){return this._listeners[e].push(t),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[]},emit:function(e,t){if(this._listeners[e])for(var r=0;r<this._listeners[e].length;r++)this._listeners[e][r].call(this,t)},pipe:function(e){return e.registerPrevious(this)},registerPrevious:function(e){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.streamInfo=e.streamInfo,this.mergeStreamInfo(),this.previous=e;var t=this;return e.on("data",function(e){t.processChunk(e)}),e.on("end",function(){t.end()}),e.on("error",function(e){t.error(e)}),this},pause:function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return!1;var e=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),e=!0),this.previous&&this.previous.resume(),!e},flush:function(){},processChunk:function(e){this.push(e)},withStreamInfo:function(e,t){return this.extraStreamInfo[e]=t,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var e in this.extraStreamInfo)Object.prototype.hasOwnProperty.call(this.extraStreamInfo,e)&&(this.streamInfo[e]=this.extraStreamInfo[e])},lock:function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock()},toString:function(){var e="Worker "+this.name;return this.previous?this.previous+" -> "+e:e}},t.exports=n},{}],29:[function(e,t,r){"use strict";var h=e("../utils"),i=e("./ConvertWorker"),s=e("./GenericWorker"),u=e("../base64"),n=e("../support"),a=e("../external"),o=null;if(n.nodestream)try{o=e("../nodejs/NodejsStreamOutputAdapter")}catch(e){}function l(e,o){return new a.Promise(function(t,r){var n=[],i=e._internalType,s=e._outputType,a=e._mimeType;e.on("data",function(e,t){n.push(e),o&&o(t)}).on("error",function(e){n=[],r(e)}).on("end",function(){try{var e=function(e,t,r){switch(e){case"blob":return h.newBlob(h.transformTo("arraybuffer",t),r);case"base64":return u.encode(t);default:return h.transformTo(e,t)}}(s,function(e,t){var r,n=0,i=null,s=0;for(r=0;r<t.length;r++)s+=t[r].length;switch(e){case"string":return t.join("");case"array":return Array.prototype.concat.apply([],t);case"uint8array":for(i=new Uint8Array(s),r=0;r<t.length;r++)i.set(t[r],n),n+=t[r].length;return i;case"nodebuffer":return Buffer.concat(t);default:throw new Error("concat : unsupported type '"+e+"'")}}(i,n),a);t(e)}catch(e){r(e)}n=[]}).resume()})}function f(e,t,r){var n=t;switch(t){case"blob":case"arraybuffer":n="uint8array";break;case"base64":n="string"}try{this._internalType=n,this._outputType=t,this._mimeType=r,h.checkSupport(n),this._worker=e.pipe(new i(n)),e.lock()}catch(e){this._worker=new s("error"),this._worker.error(e)}}f.prototype={accumulate:function(e){return l(this,e)},on:function(e,t){var r=this;return"data"===e?this._worker.on(e,function(e){t.call(r,e.data,e.meta)}):this._worker.on(e,function(){h.delay(t,arguments,r)}),this},resume:function(){return h.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(e){if(h.checkSupport("nodestream"),"nodebuffer"!==this._outputType)throw new Error(this._outputType+" is not supported by this method");return new o(this,{objectMode:"nodebuffer"!==this._outputType},e)}},t.exports=f},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(e,t,r){"use strict";if(r.base64=!0,r.array=!0,r.string=!0,r.arraybuffer="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof Uint8Array,r.nodebuffer="undefined"!=typeof Buffer,r.uint8array="undefined"!=typeof Uint8Array,"undefined"==typeof ArrayBuffer)r.blob=!1;else{var n=new ArrayBuffer(0);try{r.blob=0===new Blob([n],{type:"application/zip"}).size}catch(e){try{var i=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);i.append(n),r.blob=0===i.getBlob("application/zip").size}catch(e){r.blob=!1}}}try{r.nodestream=!!e("readable-stream").Readable}catch(e){r.nodestream=!1}},{"readable-stream":16}],31:[function(e,t,s){"use strict";for(var o=e("./utils"),h=e("./support"),r=e("./nodejsUtils"),n=e("./stream/GenericWorker"),u=new Array(256),i=0;i<256;i++)u[i]=252<=i?6:248<=i?5:240<=i?4:224<=i?3:192<=i?2:1;u[254]=u[254]=1;function a(){n.call(this,"utf-8 decode"),this.leftOver=null}function l(){n.call(this,"utf-8 encode")}s.utf8encode=function(e){return h.nodebuffer?r.newBufferFrom(e,"utf-8"):function(e){var t,r,n,i,s,a=e.length,o=0;for(i=0;i<a;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),o+=r<128?1:r<2048?2:r<65536?3:4;for(t=h.uint8array?new Uint8Array(o):new Array(o),i=s=0;s<o;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),r<128?t[s++]=r:(r<2048?t[s++]=192|r>>>6:(r<65536?t[s++]=224|r>>>12:(t[s++]=240|r>>>18,t[s++]=128|r>>>12&63),t[s++]=128|r>>>6&63),t[s++]=128|63&r);return t}(e)},s.utf8decode=function(e){return h.nodebuffer?o.transformTo("nodebuffer",e).toString("utf-8"):function(e){var t,r,n,i,s=e.length,a=new Array(2*s);for(t=r=0;t<s;)if((n=e[t++])<128)a[r++]=n;else if(4<(i=u[n]))a[r++]=65533,t+=i-1;else{for(n&=2===i?31:3===i?15:7;1<i&&t<s;)n=n<<6|63&e[t++],i--;1<i?a[r++]=65533:n<65536?a[r++]=n:(n-=65536,a[r++]=55296|n>>10&1023,a[r++]=56320|1023&n)}return a.length!==r&&(a.subarray?a=a.subarray(0,r):a.length=r),o.applyFromCharCode(a)}(e=o.transformTo(h.uint8array?"uint8array":"array",e))},o.inherits(a,n),a.prototype.processChunk=function(e){var t=o.transformTo(h.uint8array?"uint8array":"array",e.data);if(this.leftOver&&this.leftOver.length){if(h.uint8array){var r=t;(t=new Uint8Array(r.length+this.leftOver.length)).set(this.leftOver,0),t.set(r,this.leftOver.length)}else t=this.leftOver.concat(t);this.leftOver=null}var n=function(e,t){var r;for((t=t||e.length)>e.length&&(t=e.length),r=t-1;0<=r&&128==(192&e[r]);)r--;return r<0?t:0===r?t:r+u[e[r]]>t?r:t}(t),i=t;n!==t.length&&(h.uint8array?(i=t.subarray(0,n),this.leftOver=t.subarray(n,t.length)):(i=t.slice(0,n),this.leftOver=t.slice(n,t.length))),this.push({data:s.utf8decode(i),meta:e.meta})},a.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:s.utf8decode(this.leftOver),meta:{}}),this.leftOver=null)},s.Utf8DecodeWorker=a,o.inherits(l,n),l.prototype.processChunk=function(e){this.push({data:s.utf8encode(e.data),meta:e.meta})},s.Utf8EncodeWorker=l},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(e,t,a){"use strict";var o=e("./support"),h=e("./base64"),r=e("./nodejsUtils"),u=e("./external");function n(e){return e}function l(e,t){for(var r=0;r<e.length;++r)t[r]=255&e.charCodeAt(r);return t}e("setimmediate"),a.newBlob=function(t,r){a.checkSupport("blob");try{return new Blob([t],{type:r})}catch(e){try{var n=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return n.append(t),n.getBlob(r)}catch(e){throw new Error("Bug : can't construct the Blob.")}}};var i={stringifyByChunk:function(e,t,r){var n=[],i=0,s=e.length;if(s<=r)return String.fromCharCode.apply(null,e);for(;i<s;)"array"===t||"nodebuffer"===t?n.push(String.fromCharCode.apply(null,e.slice(i,Math.min(i+r,s)))):n.push(String.fromCharCode.apply(null,e.subarray(i,Math.min(i+r,s)))),i+=r;return n.join("")},stringifyByChar:function(e){for(var t="",r=0;r<e.length;r++)t+=String.fromCharCode(e[r]);return t},applyCanBeUsed:{uint8array:function(){try{return o.uint8array&&1===String.fromCharCode.apply(null,new Uint8Array(1)).length}catch(e){return!1}}(),nodebuffer:function(){try{return o.nodebuffer&&1===String.fromCharCode.apply(null,r.allocBuffer(1)).length}catch(e){return!1}}()}};function s(e){var t=65536,r=a.getTypeOf(e),n=!0;if("uint8array"===r?n=i.applyCanBeUsed.uint8array:"nodebuffer"===r&&(n=i.applyCanBeUsed.nodebuffer),n)for(;1<t;)try{return i.stringifyByChunk(e,r,t)}catch(e){t=Math.floor(t/2)}return i.stringifyByChar(e)}function f(e,t){for(var r=0;r<e.length;r++)t[r]=e[r];return t}a.applyFromCharCode=s;var c={};c.string={string:n,array:function(e){return l(e,new Array(e.length))},arraybuffer:function(e){return c.string.uint8array(e).buffer},uint8array:function(e){return l(e,new Uint8Array(e.length))},nodebuffer:function(e){return l(e,r.allocBuffer(e.length))}},c.array={string:s,array:n,arraybuffer:function(e){return new Uint8Array(e).buffer},uint8array:function(e){return new Uint8Array(e)},nodebuffer:function(e){return r.newBufferFrom(e)}},c.arraybuffer={string:function(e){return s(new Uint8Array(e))},array:function(e){return f(new Uint8Array(e),new Array(e.byteLength))},arraybuffer:n,uint8array:function(e){return new Uint8Array(e)},nodebuffer:function(e){return r.newBufferFrom(new Uint8Array(e))}},c.uint8array={string:s,array:function(e){return f(e,new Array(e.length))},arraybuffer:function(e){return e.buffer},uint8array:n,nodebuffer:function(e){return r.newBufferFrom(e)}},c.nodebuffer={string:s,array:function(e){return f(e,new Array(e.length))},arraybuffer:function(e){return c.nodebuffer.uint8array(e).buffer},uint8array:function(e){return f(e,new Uint8Array(e.length))},nodebuffer:n},a.transformTo=function(e,t){if(t=t||"",!e)return t;a.checkSupport(e);var r=a.getTypeOf(t);return c[r][e](t)},a.resolve=function(e){for(var t=e.split("/"),r=[],n=0;n<t.length;n++){var i=t[n];"."===i||""===i&&0!==n&&n!==t.length-1||(".."===i?r.pop():r.push(i))}return r.join("/")},a.getTypeOf=function(e){return"string"==typeof e?"string":"[object Array]"===Object.prototype.toString.call(e)?"array":o.nodebuffer&&r.isBuffer(e)?"nodebuffer":o.uint8array&&e instanceof Uint8Array?"uint8array":o.arraybuffer&&e instanceof ArrayBuffer?"arraybuffer":void 0},a.checkSupport=function(e){if(!o[e.toLowerCase()])throw new Error(e+" is not supported by this platform")},a.MAX_VALUE_16BITS=65535,a.MAX_VALUE_32BITS=-1,a.pretty=function(e){var t,r,n="";for(r=0;r<(e||"").length;r++)n+="\\x"+((t=e.charCodeAt(r))<16?"0":"")+t.toString(16).toUpperCase();return n},a.delay=function(e,t,r){setImmediate(function(){e.apply(r||null,t||[])})},a.inherits=function(e,t){function r(){}r.prototype=t.prototype,e.prototype=new r},a.extend=function(){var e,t,r={};for(e=0;e<arguments.length;e++)for(t in arguments[e])Object.prototype.hasOwnProperty.call(arguments[e],t)&&void 0===r[t]&&(r[t]=arguments[e][t]);return r},a.prepareContent=function(r,e,n,i,s){return u.Promise.resolve(e).then(function(n){return o.blob&&(n instanceof Blob||-1!==["[object File]","[object Blob]"].indexOf(Object.prototype.toString.call(n)))&&"undefined"!=typeof FileReader?new u.Promise(function(t,r){var e=new FileReader;e.onload=function(e){t(e.target.result)},e.onerror=function(e){r(e.target.error)},e.readAsArrayBuffer(n)}):n}).then(function(e){var t=a.getTypeOf(e);return t?("arraybuffer"===t?e=a.transformTo("uint8array",e):"string"===t&&(s?e=h.decode(e):n&&!0!==i&&(e=function(e){return l(e,o.uint8array?new Uint8Array(e.length):new Array(e.length))}(e))),e):u.Promise.reject(new Error("Can't read the data of '"+r+"'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"))})}},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,setimmediate:54}],33:[function(e,t,r){"use strict";var n=e("./reader/readerFor"),i=e("./utils"),s=e("./signature"),a=e("./zipEntry"),o=e("./support");function h(e){this.files=[],this.loadOptions=e}h.prototype={checkSignature:function(e){if(!this.reader.readAndCheckSignature(e)){this.reader.index-=4;var t=this.reader.readString(4);throw new Error("Corrupted zip or bug: unexpected signature ("+i.pretty(t)+", expected "+i.pretty(e)+")")}},isSignature:function(e,t){var r=this.reader.index;this.reader.setIndex(e);var n=this.reader.readString(4)===t;return this.reader.setIndex(r),n},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var e=this.reader.readData(this.zipCommentLength),t=o.uint8array?"uint8array":"array",r=i.transformTo(t,e);this.zipComment=this.loadOptions.decodeFileName(r)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var e,t,r,n=this.zip64EndOfCentralSize-44;0<n;)e=this.reader.readInt(2),t=this.reader.readInt(4),r=this.reader.readData(t),this.zip64ExtensibleData[e]={id:e,length:t,value:r}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var e,t;for(e=0;e<this.files.length;e++)t=this.files[e],this.reader.setIndex(t.localHeaderOffset),this.checkSignature(s.LOCAL_FILE_HEADER),t.readLocalPart(this.reader),t.handleUTF8(),t.processAttributes()},readCentralDir:function(){var e;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER);)(e=new a({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(e);if(this.centralDirRecords!==this.files.length&&0!==this.centralDirRecords&&0===this.files.length)throw new Error("Corrupted zip or bug: expected "+this.centralDirRecords+" records in central dir, got "+this.files.length)},readEndOfCentral:function(){var e=this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);if(e<0)throw!this.isSignature(0,s.LOCAL_FILE_HEADER)?new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html"):new Error("Corrupted zip: can't find end of central directory");this.reader.setIndex(e);var t=e;if(this.checkSignature(s.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===i.MAX_VALUE_16BITS||this.diskWithCentralDirStart===i.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===i.MAX_VALUE_16BITS||this.centralDirRecords===i.MAX_VALUE_16BITS||this.centralDirSize===i.MAX_VALUE_32BITS||this.centralDirOffset===i.MAX_VALUE_32BITS){if(this.zip64=!0,(e=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");if(this.reader.setIndex(e),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,s.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}var r=this.centralDirOffset+this.centralDirSize;this.zip64&&(r+=20,r+=12+this.zip64EndOfCentralSize);var n=t-r;if(0<n)this.isSignature(t,s.CENTRAL_FILE_HEADER)||(this.reader.zero=n);else if(n<0)throw new Error("Corrupted zip: missing "+Math.abs(n)+" bytes.")},prepareReader:function(e){this.reader=n(e)},load:function(e){this.prepareReader(e),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},t.exports=h},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utils":32,"./zipEntry":34}],34:[function(e,t,r){"use strict";var n=e("./reader/readerFor"),s=e("./utils"),i=e("./compressedObject"),a=e("./crc32"),o=e("./utf8"),h=e("./compressions"),u=e("./support");function l(e,t){this.options=e,this.loadOptions=t}l.prototype={isEncrypted:function(){return 1==(1&this.bitFlag)},useUTF8:function(){return 2048==(2048&this.bitFlag)},readLocalPart:function(e){var t,r;if(e.skip(22),this.fileNameLength=e.readInt(2),r=e.readInt(2),this.fileName=e.readData(this.fileNameLength),e.skip(r),-1===this.compressedSize||-1===this.uncompressedSize)throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");if(null===(t=function(e){for(var t in h)if(Object.prototype.hasOwnProperty.call(h,t)&&h[t].magic===e)return h[t];return null}(this.compressionMethod)))throw new Error("Corrupted zip : compression "+s.pretty(this.compressionMethod)+" unknown (inner file : "+s.transformTo("string",this.fileName)+")");this.decompressed=new i(this.compressedSize,this.uncompressedSize,this.crc32,t,e.readData(this.compressedSize))},readCentralPart:function(e){this.versionMadeBy=e.readInt(2),e.skip(2),this.bitFlag=e.readInt(2),this.compressionMethod=e.readString(2),this.date=e.readDate(),this.crc32=e.readInt(4),this.compressedSize=e.readInt(4),this.uncompressedSize=e.readInt(4);var t=e.readInt(2);if(this.extraFieldsLength=e.readInt(2),this.fileCommentLength=e.readInt(2),this.diskNumberStart=e.readInt(2),this.internalFileAttributes=e.readInt(2),this.externalFileAttributes=e.readInt(4),this.localHeaderOffset=e.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");e.skip(t),this.readExtraFields(e),this.parseZIP64ExtraField(e),this.fileComment=e.readData(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var e=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),0==e&&(this.dosPermissions=63&this.externalFileAttributes),3==e&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||"/"!==this.fileNameStr.slice(-1)||(this.dir=!0)},parseZIP64ExtraField:function(){if(this.extraFields[1]){var e=n(this.extraFields[1].value);this.uncompressedSize===s.MAX_VALUE_32BITS&&(this.uncompressedSize=e.readInt(8)),this.compressedSize===s.MAX_VALUE_32BITS&&(this.compressedSize=e.readInt(8)),this.localHeaderOffset===s.MAX_VALUE_32BITS&&(this.localHeaderOffset=e.readInt(8)),this.diskNumberStart===s.MAX_VALUE_32BITS&&(this.diskNumberStart=e.readInt(4))}},readExtraFields:function(e){var t,r,n,i=e.index+this.extraFieldsLength;for(this.extraFields||(this.extraFields={});e.index+4<i;)t=e.readInt(2),r=e.readInt(2),n=e.readData(r),this.extraFields[t]={id:t,length:r,value:n};e.setIndex(i)},handleUTF8:function(){var e=u.uint8array?"uint8array":"array";if(this.useUTF8())this.fileNameStr=o.utf8decode(this.fileName),this.fileCommentStr=o.utf8decode(this.fileComment);else{var t=this.findExtraFieldUnicodePath();if(null!==t)this.fileNameStr=t;else{var r=s.transformTo(e,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(r)}var n=this.findExtraFieldUnicodeComment();if(null!==n)this.fileCommentStr=n;else{var i=s.transformTo(e,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(i)}}},findExtraFieldUnicodePath:function(){var e=this.extraFields[28789];if(e){var t=n(e.value);return 1!==t.readInt(1)?null:a(this.fileName)!==t.readInt(4)?null:o.utf8decode(t.readData(e.length-5))}return null},findExtraFieldUnicodeComment:function(){var e=this.extraFields[25461];if(e){var t=n(e.value);return 1!==t.readInt(1)?null:a(this.fileComment)!==t.readInt(4)?null:o.utf8decode(t.readData(e.length-5))}return null}},t.exports=l},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(e,t,r){"use strict";function n(e,t,r){this.name=e,this.dir=r.dir,this.date=r.date,this.comment=r.comment,this.unixPermissions=r.unixPermissions,this.dosPermissions=r.dosPermissions,this._data=t,this._dataBinary=r.binary,this.options={compression:r.compression,compressionOptions:r.compressionOptions}}var s=e("./stream/StreamHelper"),i=e("./stream/DataWorker"),a=e("./utf8"),o=e("./compressedObject"),h=e("./stream/GenericWorker");n.prototype={internalStream:function(e){var t=null,r="string";try{if(!e)throw new Error("No output type specified.");var n="string"===(r=e.toLowerCase())||"text"===r;"binarystring"!==r&&"text"!==r||(r="string"),t=this._decompressWorker();var i=!this._dataBinary;i&&!n&&(t=t.pipe(new a.Utf8EncodeWorker)),!i&&n&&(t=t.pipe(new a.Utf8DecodeWorker))}catch(e){(t=new h("error")).error(e)}return new s(t,r,"")},async:function(e,t){return this.internalStream(e).accumulate(t)},nodeStream:function(e,t){return this.internalStream(e||"nodebuffer").toNodejsStream(t)},_compressWorker:function(e,t){if(this._data instanceof o&&this._data.compression.magic===e.magic)return this._data.getCompressedWorker();var r=this._decompressWorker();return this._dataBinary||(r=r.pipe(new a.Utf8EncodeWorker)),o.createWorkerFrom(r,e,t)},_decompressWorker:function(){return this._data instanceof o?this._data.getContentWorker():this._data instanceof h?this._data:new i(this._data)}};for(var u=["asText","asBinary","asNodeBuffer","asUint8Array","asArrayBuffer"],l=function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},f=0;f<u.length;f++)n.prototype[u[f]]=l;t.exports=n},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(e,l,t){(function(t){"use strict";var r,n,e=t.MutationObserver||t.WebKitMutationObserver;if(e){var i=0,s=new e(u),a=t.document.createTextNode("");s.observe(a,{characterData:!0}),r=function(){a.data=i=++i%2}}else if(t.setImmediate||void 0===t.MessageChannel)r="document"in t&&"onreadystatechange"in t.document.createElement("script")?function(){var e=t.document.createElement("script");e.onreadystatechange=function(){u(),e.onreadystatechange=null,e.parentNode.removeChild(e),e=null},t.document.documentElement.appendChild(e)}:function(){setTimeout(u,0)};else{var o=new t.MessageChannel;o.port1.onmessage=u,r=function(){o.port2.postMessage(0)}}var h=[];function u(){var e,t;n=!0;for(var r=h.length;r;){for(t=h,h=[],e=-1;++e<r;)t[e]();r=h.length}n=!1}l.exports=function(e){1!==h.push(e)||n||r()}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],37:[function(e,t,r){"use strict";var i=e("immediate");function u(){}var l={},s=["REJECTED"],a=["FULFILLED"],n=["PENDING"];function o(e){if("function"!=typeof e)throw new TypeError("resolver must be a function");this.state=n,this.queue=[],this.outcome=void 0,e!==u&&d(this,e)}function h(e,t,r){this.promise=e,"function"==typeof t&&(this.onFulfilled=t,this.callFulfilled=this.otherCallFulfilled),"function"==typeof r&&(this.onRejected=r,this.callRejected=this.otherCallRejected)}function f(t,r,n){i(function(){var e;try{e=r(n)}catch(e){return l.reject(t,e)}e===t?l.reject(t,new TypeError("Cannot resolve promise with itself")):l.resolve(t,e)})}function c(e){var t=e&&e.then;if(e&&("object"==typeof e||"function"==typeof e)&&"function"==typeof t)return function(){t.apply(e,arguments)}}function d(t,e){var r=!1;function n(e){r||(r=!0,l.reject(t,e))}function i(e){r||(r=!0,l.resolve(t,e))}var s=p(function(){e(i,n)});"error"===s.status&&n(s.value)}function p(e,t){var r={};try{r.value=e(t),r.status="success"}catch(e){r.status="error",r.value=e}return r}(t.exports=o).prototype.finally=function(t){if("function"!=typeof t)return this;var r=this.constructor;return this.then(function(e){return r.resolve(t()).then(function(){return e})},function(e){return r.resolve(t()).then(function(){throw e})})},o.prototype.catch=function(e){return this.then(null,e)},o.prototype.then=function(e,t){if("function"!=typeof e&&this.state===a||"function"!=typeof t&&this.state===s)return this;var r=new this.constructor(u);this.state!==n?f(r,this.state===a?e:t,this.outcome):this.queue.push(new h(r,e,t));return r},h.prototype.callFulfilled=function(e){l.resolve(this.promise,e)},h.prototype.otherCallFulfilled=function(e){f(this.promise,this.onFulfilled,e)},h.prototype.callRejected=function(e){l.reject(this.promise,e)},h.prototype.otherCallRejected=function(e){f(this.promise,this.onRejected,e)},l.resolve=function(e,t){var r=p(c,t);if("error"===r.status)return l.reject(e,r.value);var n=r.value;if(n)d(e,n);else{e.state=a,e.outcome=t;for(var i=-1,s=e.queue.length;++i<s;)e.queue[i].callFulfilled(t)}return e},l.reject=function(e,t){e.state=s,e.outcome=t;for(var r=-1,n=e.queue.length;++r<n;)e.queue[r].callRejected(t);return e},o.resolve=function(e){if(e instanceof this)return e;return l.resolve(new this(u),e)},o.reject=function(e){var t=new this(u);return l.reject(t,e)},o.all=function(e){var r=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var n=e.length,i=!1;if(!n)return this.resolve([]);var s=new Array(n),a=0,t=-1,o=new this(u);for(;++t<n;)h(e[t],t);return o;function h(e,t){r.resolve(e).then(function(e){s[t]=e,++a!==n||i||(i=!0,l.resolve(o,s))},function(e){i||(i=!0,l.reject(o,e))})}},o.race=function(e){var t=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var r=e.length,n=!1;if(!r)return this.resolve([]);var i=-1,s=new this(u);for(;++i<r;)a=e[i],t.resolve(a).then(function(e){n||(n=!0,l.resolve(s,e))},function(e){n||(n=!0,l.reject(s,e))});var a;return s}},{immediate:36}],38:[function(e,t,r){"use strict";var n={};(0,e("./lib/utils/common").assign)(n,e("./lib/deflate"),e("./lib/inflate"),e("./lib/zlib/constants")),t.exports=n},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(e,t,r){"use strict";var a=e("./zlib/deflate"),o=e("./utils/common"),h=e("./utils/strings"),i=e("./zlib/messages"),s=e("./zlib/zstream"),u=Object.prototype.toString,l=0,f=-1,c=0,d=8;function p(e){if(!(this instanceof p))return new p(e);this.options=o.assign({level:f,method:d,chunkSize:16384,windowBits:15,memLevel:8,strategy:c,to:""},e||{});var t=this.options;t.raw&&0<t.windowBits?t.windowBits=-t.windowBits:t.gzip&&0<t.windowBits&&t.windowBits<16&&(t.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new s,this.strm.avail_out=0;var r=a.deflateInit2(this.strm,t.level,t.method,t.windowBits,t.memLevel,t.strategy);if(r!==l)throw new Error(i[r]);if(t.header&&a.deflateSetHeader(this.strm,t.header),t.dictionary){var n;if(n="string"==typeof t.dictionary?h.string2buf(t.dictionary):"[object ArrayBuffer]"===u.call(t.dictionary)?new Uint8Array(t.dictionary):t.dictionary,(r=a.deflateSetDictionary(this.strm,n))!==l)throw new Error(i[r]);this._dict_set=!0}}function n(e,t){var r=new p(t);if(r.push(e,!0),r.err)throw r.msg||i[r.err];return r.result}p.prototype.push=function(e,t){var r,n,i=this.strm,s=this.options.chunkSize;if(this.ended)return!1;n=t===~~t?t:!0===t?4:0,"string"==typeof e?i.input=h.string2buf(e):"[object ArrayBuffer]"===u.call(e)?i.input=new Uint8Array(e):i.input=e,i.next_in=0,i.avail_in=i.input.length;do{if(0===i.avail_out&&(i.output=new o.Buf8(s),i.next_out=0,i.avail_out=s),1!==(r=a.deflate(i,n))&&r!==l)return this.onEnd(r),!(this.ended=!0);0!==i.avail_out&&(0!==i.avail_in||4!==n&&2!==n)||("string"===this.options.to?this.onData(h.buf2binstring(o.shrinkBuf(i.output,i.next_out))):this.onData(o.shrinkBuf(i.output,i.next_out)))}while((0<i.avail_in||0===i.avail_out)&&1!==r);return 4===n?(r=a.deflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===l):2!==n||(this.onEnd(l),!(i.avail_out=0))},p.prototype.onData=function(e){this.chunks.push(e)},p.prototype.onEnd=function(e){e===l&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=o.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg},r.Deflate=p,r.deflate=n,r.deflateRaw=function(e,t){return(t=t||{}).raw=!0,n(e,t)},r.gzip=function(e,t){return(t=t||{}).gzip=!0,n(e,t)}},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(e,t,r){"use strict";var c=e("./zlib/inflate"),d=e("./utils/common"),p=e("./utils/strings"),m=e("./zlib/constants"),n=e("./zlib/messages"),i=e("./zlib/zstream"),s=e("./zlib/gzheader"),_=Object.prototype.toString;function a(e){if(!(this instanceof a))return new a(e);this.options=d.assign({chunkSize:16384,windowBits:0,to:""},e||{});var t=this.options;t.raw&&0<=t.windowBits&&t.windowBits<16&&(t.windowBits=-t.windowBits,0===t.windowBits&&(t.windowBits=-15)),!(0<=t.windowBits&&t.windowBits<16)||e&&e.windowBits||(t.windowBits+=32),15<t.windowBits&&t.windowBits<48&&0==(15&t.windowBits)&&(t.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new i,this.strm.avail_out=0;var r=c.inflateInit2(this.strm,t.windowBits);if(r!==m.Z_OK)throw new Error(n[r]);this.header=new s,c.inflateGetHeader(this.strm,this.header)}function o(e,t){var r=new a(t);if(r.push(e,!0),r.err)throw r.msg||n[r.err];return r.result}a.prototype.push=function(e,t){var r,n,i,s,a,o,h=this.strm,u=this.options.chunkSize,l=this.options.dictionary,f=!1;if(this.ended)return!1;n=t===~~t?t:!0===t?m.Z_FINISH:m.Z_NO_FLUSH,"string"==typeof e?h.input=p.binstring2buf(e):"[object ArrayBuffer]"===_.call(e)?h.input=new Uint8Array(e):h.input=e,h.next_in=0,h.avail_in=h.input.length;do{if(0===h.avail_out&&(h.output=new d.Buf8(u),h.next_out=0,h.avail_out=u),(r=c.inflate(h,m.Z_NO_FLUSH))===m.Z_NEED_DICT&&l&&(o="string"==typeof l?p.string2buf(l):"[object ArrayBuffer]"===_.call(l)?new Uint8Array(l):l,r=c.inflateSetDictionary(this.strm,o)),r===m.Z_BUF_ERROR&&!0===f&&(r=m.Z_OK,f=!1),r!==m.Z_STREAM_END&&r!==m.Z_OK)return this.onEnd(r),!(this.ended=!0);h.next_out&&(0!==h.avail_out&&r!==m.Z_STREAM_END&&(0!==h.avail_in||n!==m.Z_FINISH&&n!==m.Z_SYNC_FLUSH)||("string"===this.options.to?(i=p.utf8border(h.output,h.next_out),s=h.next_out-i,a=p.buf2string(h.output,i),h.next_out=s,h.avail_out=u-s,s&&d.arraySet(h.output,h.output,i,s,0),this.onData(a)):this.onData(d.shrinkBuf(h.output,h.next_out)))),0===h.avail_in&&0===h.avail_out&&(f=!0)}while((0<h.avail_in||0===h.avail_out)&&r!==m.Z_STREAM_END);return r===m.Z_STREAM_END&&(n=m.Z_FINISH),n===m.Z_FINISH?(r=c.inflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===m.Z_OK):n!==m.Z_SYNC_FLUSH||(this.onEnd(m.Z_OK),!(h.avail_out=0))},a.prototype.onData=function(e){this.chunks.push(e)},a.prototype.onEnd=function(e){e===m.Z_OK&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=d.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg},r.Inflate=a,r.inflate=o,r.inflateRaw=function(e,t){return(t=t||{}).raw=!0,o(e,t)},r.ungzip=o},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(e,t,r){"use strict";var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;r.assign=function(e){for(var t=Array.prototype.slice.call(arguments,1);t.length;){var r=t.shift();if(r){if("object"!=typeof r)throw new TypeError(r+"must be non-object");for(var n in r)r.hasOwnProperty(n)&&(e[n]=r[n])}}return e},r.shrinkBuf=function(e,t){return e.length===t?e:e.subarray?e.subarray(0,t):(e.length=t,e)};var i={arraySet:function(e,t,r,n,i){if(t.subarray&&e.subarray)e.set(t.subarray(r,r+n),i);else for(var s=0;s<n;s++)e[i+s]=t[r+s]},flattenChunks:function(e){var t,r,n,i,s,a;for(t=n=0,r=e.length;t<r;t++)n+=e[t].length;for(a=new Uint8Array(n),t=i=0,r=e.length;t<r;t++)s=e[t],a.set(s,i),i+=s.length;return a}},s={arraySet:function(e,t,r,n,i){for(var s=0;s<n;s++)e[i+s]=t[r+s]},flattenChunks:function(e){return[].concat.apply([],e)}};r.setTyped=function(e){e?(r.Buf8=Uint8Array,r.Buf16=Uint16Array,r.Buf32=Int32Array,r.assign(r,i)):(r.Buf8=Array,r.Buf16=Array,r.Buf32=Array,r.assign(r,s))},r.setTyped(n)},{}],42:[function(e,t,r){"use strict";var h=e("./common"),i=!0,s=!0;try{String.fromCharCode.apply(null,[0])}catch(e){i=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(e){s=!1}for(var u=new h.Buf8(256),n=0;n<256;n++)u[n]=252<=n?6:248<=n?5:240<=n?4:224<=n?3:192<=n?2:1;function l(e,t){if(t<65537&&(e.subarray&&s||!e.subarray&&i))return String.fromCharCode.apply(null,h.shrinkBuf(e,t));for(var r="",n=0;n<t;n++)r+=String.fromCharCode(e[n]);return r}u[254]=u[254]=1,r.string2buf=function(e){var t,r,n,i,s,a=e.length,o=0;for(i=0;i<a;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),o+=r<128?1:r<2048?2:r<65536?3:4;for(t=new h.Buf8(o),i=s=0;s<o;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),r<128?t[s++]=r:(r<2048?t[s++]=192|r>>>6:(r<65536?t[s++]=224|r>>>12:(t[s++]=240|r>>>18,t[s++]=128|r>>>12&63),t[s++]=128|r>>>6&63),t[s++]=128|63&r);return t},r.buf2binstring=function(e){return l(e,e.length)},r.binstring2buf=function(e){for(var t=new h.Buf8(e.length),r=0,n=t.length;r<n;r++)t[r]=e.charCodeAt(r);return t},r.buf2string=function(e,t){var r,n,i,s,a=t||e.length,o=new Array(2*a);for(r=n=0;r<a;)if((i=e[r++])<128)o[n++]=i;else if(4<(s=u[i]))o[n++]=65533,r+=s-1;else{for(i&=2===s?31:3===s?15:7;1<s&&r<a;)i=i<<6|63&e[r++],s--;1<s?o[n++]=65533:i<65536?o[n++]=i:(i-=65536,o[n++]=55296|i>>10&1023,o[n++]=56320|1023&i)}return l(o,n)},r.utf8border=function(e,t){var r;for((t=t||e.length)>e.length&&(t=e.length),r=t-1;0<=r&&128==(192&e[r]);)r--;return r<0?t:0===r?t:r+u[e[r]]>t?r:t}},{"./common":41}],43:[function(e,t,r){"use strict";t.exports=function(e,t,r,n){for(var i=65535&e|0,s=e>>>16&65535|0,a=0;0!==r;){for(r-=a=2e3<r?2e3:r;s=s+(i=i+t[n++]|0)|0,--a;);i%=65521,s%=65521}return i|s<<16|0}},{}],44:[function(e,t,r){"use strict";t.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],45:[function(e,t,r){"use strict";var o=function(){for(var e,t=[],r=0;r<256;r++){e=r;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[r]=e}return t}();t.exports=function(e,t,r,n){var i=o,s=n+r;e^=-1;for(var a=n;a<s;a++)e=e>>>8^i[255&(e^t[a])];return-1^e}},{}],46:[function(e,t,r){"use strict";var h,c=e("../utils/common"),u=e("./trees"),d=e("./adler32"),p=e("./crc32"),n=e("./messages"),l=0,f=4,m=0,_=-2,g=-1,b=4,i=2,v=8,y=9,s=286,a=30,o=19,w=2*s+1,k=15,x=3,S=258,z=S+x+1,C=42,E=113,A=1,I=2,O=3,B=4;function R(e,t){return e.msg=n[t],t}function T(e){return(e<<1)-(4<e?9:0)}function D(e){for(var t=e.length;0<=--t;)e[t]=0}function F(e){var t=e.state,r=t.pending;r>e.avail_out&&(r=e.avail_out),0!==r&&(c.arraySet(e.output,t.pending_buf,t.pending_out,r,e.next_out),e.next_out+=r,t.pending_out+=r,e.total_out+=r,e.avail_out-=r,t.pending-=r,0===t.pending&&(t.pending_out=0))}function N(e,t){u._tr_flush_block(e,0<=e.block_start?e.block_start:-1,e.strstart-e.block_start,t),e.block_start=e.strstart,F(e.strm)}function U(e,t){e.pending_buf[e.pending++]=t}function P(e,t){e.pending_buf[e.pending++]=t>>>8&255,e.pending_buf[e.pending++]=255&t}function L(e,t){var r,n,i=e.max_chain_length,s=e.strstart,a=e.prev_length,o=e.nice_match,h=e.strstart>e.w_size-z?e.strstart-(e.w_size-z):0,u=e.window,l=e.w_mask,f=e.prev,c=e.strstart+S,d=u[s+a-1],p=u[s+a];e.prev_length>=e.good_match&&(i>>=2),o>e.lookahead&&(o=e.lookahead);do{if(u[(r=t)+a]===p&&u[r+a-1]===d&&u[r]===u[s]&&u[++r]===u[s+1]){s+=2,r++;do{}while(u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&s<c);if(n=S-(c-s),s=c-S,a<n){if(e.match_start=t,o<=(a=n))break;d=u[s+a-1],p=u[s+a]}}}while((t=f[t&l])>h&&0!=--i);return a<=e.lookahead?a:e.lookahead}function j(e){var t,r,n,i,s,a,o,h,u,l,f=e.w_size;do{if(i=e.window_size-e.lookahead-e.strstart,e.strstart>=f+(f-z)){for(c.arraySet(e.window,e.window,f,f,0),e.match_start-=f,e.strstart-=f,e.block_start-=f,t=r=e.hash_size;n=e.head[--t],e.head[t]=f<=n?n-f:0,--r;);for(t=r=f;n=e.prev[--t],e.prev[t]=f<=n?n-f:0,--r;);i+=f}if(0===e.strm.avail_in)break;if(a=e.strm,o=e.window,h=e.strstart+e.lookahead,u=i,l=void 0,l=a.avail_in,u<l&&(l=u),r=0===l?0:(a.avail_in-=l,c.arraySet(o,a.input,a.next_in,l,h),1===a.state.wrap?a.adler=d(a.adler,o,l,h):2===a.state.wrap&&(a.adler=p(a.adler,o,l,h)),a.next_in+=l,a.total_in+=l,l),e.lookahead+=r,e.lookahead+e.insert>=x)for(s=e.strstart-e.insert,e.ins_h=e.window[s],e.ins_h=(e.ins_h<<e.hash_shift^e.window[s+1])&e.hash_mask;e.insert&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[s+x-1])&e.hash_mask,e.prev[s&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=s,s++,e.insert--,!(e.lookahead+e.insert<x)););}while(e.lookahead<z&&0!==e.strm.avail_in)}function Z(e,t){for(var r,n;;){if(e.lookahead<z){if(j(e),e.lookahead<z&&t===l)return A;if(0===e.lookahead)break}if(r=0,e.lookahead>=x&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),0!==r&&e.strstart-r<=e.w_size-z&&(e.match_length=L(e,r)),e.match_length>=x)if(n=u._tr_tally(e,e.strstart-e.match_start,e.match_length-x),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=x){for(e.match_length--;e.strstart++,e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart,0!=--e.match_length;);e.strstart++}else e.strstart+=e.match_length,e.match_length=0,e.ins_h=e.window[e.strstart],e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+1])&e.hash_mask;else n=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(n&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=e.strstart<x-1?e.strstart:x-1,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}function W(e,t){for(var r,n,i;;){if(e.lookahead<z){if(j(e),e.lookahead<z&&t===l)return A;if(0===e.lookahead)break}if(r=0,e.lookahead>=x&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=x-1,0!==r&&e.prev_length<e.max_lazy_match&&e.strstart-r<=e.w_size-z&&(e.match_length=L(e,r),e.match_length<=5&&(1===e.strategy||e.match_length===x&&4096<e.strstart-e.match_start)&&(e.match_length=x-1)),e.prev_length>=x&&e.match_length<=e.prev_length){for(i=e.strstart+e.lookahead-x,n=u._tr_tally(e,e.strstart-1-e.prev_match,e.prev_length-x),e.lookahead-=e.prev_length-1,e.prev_length-=2;++e.strstart<=i&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),0!=--e.prev_length;);if(e.match_available=0,e.match_length=x-1,e.strstart++,n&&(N(e,!1),0===e.strm.avail_out))return A}else if(e.match_available){if((n=u._tr_tally(e,0,e.window[e.strstart-1]))&&N(e,!1),e.strstart++,e.lookahead--,0===e.strm.avail_out)return A}else e.match_available=1,e.strstart++,e.lookahead--}return e.match_available&&(n=u._tr_tally(e,0,e.window[e.strstart-1]),e.match_available=0),e.insert=e.strstart<x-1?e.strstart:x-1,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}function M(e,t,r,n,i){this.good_length=e,this.max_lazy=t,this.nice_length=r,this.max_chain=n,this.func=i}function H(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=v,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new c.Buf16(2*w),this.dyn_dtree=new c.Buf16(2*(2*a+1)),this.bl_tree=new c.Buf16(2*(2*o+1)),D(this.dyn_ltree),D(this.dyn_dtree),D(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new c.Buf16(k+1),this.heap=new c.Buf16(2*s+1),D(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new c.Buf16(2*s+1),D(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function G(e){var t;return e&&e.state?(e.total_in=e.total_out=0,e.data_type=i,(t=e.state).pending=0,t.pending_out=0,t.wrap<0&&(t.wrap=-t.wrap),t.status=t.wrap?C:E,e.adler=2===t.wrap?0:1,t.last_flush=l,u._tr_init(t),m):R(e,_)}function K(e){var t=G(e);return t===m&&function(e){e.window_size=2*e.w_size,D(e.head),e.max_lazy_match=h[e.level].max_lazy,e.good_match=h[e.level].good_length,e.nice_match=h[e.level].nice_length,e.max_chain_length=h[e.level].max_chain,e.strstart=0,e.block_start=0,e.lookahead=0,e.insert=0,e.match_length=e.prev_length=x-1,e.match_available=0,e.ins_h=0}(e.state),t}function Y(e,t,r,n,i,s){if(!e)return _;var a=1;if(t===g&&(t=6),n<0?(a=0,n=-n):15<n&&(a=2,n-=16),i<1||y<i||r!==v||n<8||15<n||t<0||9<t||s<0||b<s)return R(e,_);8===n&&(n=9);var o=new H;return(e.state=o).strm=e,o.wrap=a,o.gzhead=null,o.w_bits=n,o.w_size=1<<o.w_bits,o.w_mask=o.w_size-1,o.hash_bits=i+7,o.hash_size=1<<o.hash_bits,o.hash_mask=o.hash_size-1,o.hash_shift=~~((o.hash_bits+x-1)/x),o.window=new c.Buf8(2*o.w_size),o.head=new c.Buf16(o.hash_size),o.prev=new c.Buf16(o.w_size),o.lit_bufsize=1<<i+6,o.pending_buf_size=4*o.lit_bufsize,o.pending_buf=new c.Buf8(o.pending_buf_size),o.d_buf=1*o.lit_bufsize,o.l_buf=3*o.lit_bufsize,o.level=t,o.strategy=s,o.method=r,K(e)}h=[new M(0,0,0,0,function(e,t){var r=65535;for(r>e.pending_buf_size-5&&(r=e.pending_buf_size-5);;){if(e.lookahead<=1){if(j(e),0===e.lookahead&&t===l)return A;if(0===e.lookahead)break}e.strstart+=e.lookahead,e.lookahead=0;var n=e.block_start+r;if((0===e.strstart||e.strstart>=n)&&(e.lookahead=e.strstart-n,e.strstart=n,N(e,!1),0===e.strm.avail_out))return A;if(e.strstart-e.block_start>=e.w_size-z&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=0,t===f?(N(e,!0),0===e.strm.avail_out?O:B):(e.strstart>e.block_start&&(N(e,!1),e.strm.avail_out),A)}),new M(4,4,8,4,Z),new M(4,5,16,8,Z),new M(4,6,32,32,Z),new M(4,4,16,16,W),new M(8,16,32,32,W),new M(8,16,128,128,W),new M(8,32,128,256,W),new M(32,128,258,1024,W),new M(32,258,258,4096,W)],r.deflateInit=function(e,t){return Y(e,t,v,15,8,0)},r.deflateInit2=Y,r.deflateReset=K,r.deflateResetKeep=G,r.deflateSetHeader=function(e,t){return e&&e.state?2!==e.state.wrap?_:(e.state.gzhead=t,m):_},r.deflate=function(e,t){var r,n,i,s;if(!e||!e.state||5<t||t<0)return e?R(e,_):_;if(n=e.state,!e.output||!e.input&&0!==e.avail_in||666===n.status&&t!==f)return R(e,0===e.avail_out?-5:_);if(n.strm=e,r=n.last_flush,n.last_flush=t,n.status===C)if(2===n.wrap)e.adler=0,U(n,31),U(n,139),U(n,8),n.gzhead?(U(n,(n.gzhead.text?1:0)+(n.gzhead.hcrc?2:0)+(n.gzhead.extra?4:0)+(n.gzhead.name?8:0)+(n.gzhead.comment?16:0)),U(n,255&n.gzhead.time),U(n,n.gzhead.time>>8&255),U(n,n.gzhead.time>>16&255),U(n,n.gzhead.time>>24&255),U(n,9===n.level?2:2<=n.strategy||n.level<2?4:0),U(n,255&n.gzhead.os),n.gzhead.extra&&n.gzhead.extra.length&&(U(n,255&n.gzhead.extra.length),U(n,n.gzhead.extra.length>>8&255)),n.gzhead.hcrc&&(e.adler=p(e.adler,n.pending_buf,n.pending,0)),n.gzindex=0,n.status=69):(U(n,0),U(n,0),U(n,0),U(n,0),U(n,0),U(n,9===n.level?2:2<=n.strategy||n.level<2?4:0),U(n,3),n.status=E);else{var a=v+(n.w_bits-8<<4)<<8;a|=(2<=n.strategy||n.level<2?0:n.level<6?1:6===n.level?2:3)<<6,0!==n.strstart&&(a|=32),a+=31-a%31,n.status=E,P(n,a),0!==n.strstart&&(P(n,e.adler>>>16),P(n,65535&e.adler)),e.adler=1}if(69===n.status)if(n.gzhead.extra){for(i=n.pending;n.gzindex<(65535&n.gzhead.extra.length)&&(n.pending!==n.pending_buf_size||(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),F(e),i=n.pending,n.pending!==n.pending_buf_size));)U(n,255&n.gzhead.extra[n.gzindex]),n.gzindex++;n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),n.gzindex===n.gzhead.extra.length&&(n.gzindex=0,n.status=73)}else n.status=73;if(73===n.status)if(n.gzhead.name){i=n.pending;do{if(n.pending===n.pending_buf_size&&(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),F(e),i=n.pending,n.pending===n.pending_buf_size)){s=1;break}s=n.gzindex<n.gzhead.name.length?255&n.gzhead.name.charCodeAt(n.gzindex++):0,U(n,s)}while(0!==s);n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),0===s&&(n.gzindex=0,n.status=91)}else n.status=91;if(91===n.status)if(n.gzhead.comment){i=n.pending;do{if(n.pending===n.pending_buf_size&&(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),F(e),i=n.pending,n.pending===n.pending_buf_size)){s=1;break}s=n.gzindex<n.gzhead.comment.length?255&n.gzhead.comment.charCodeAt(n.gzindex++):0,U(n,s)}while(0!==s);n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),0===s&&(n.status=103)}else n.status=103;if(103===n.status&&(n.gzhead.hcrc?(n.pending+2>n.pending_buf_size&&F(e),n.pending+2<=n.pending_buf_size&&(U(n,255&e.adler),U(n,e.adler>>8&255),e.adler=0,n.status=E)):n.status=E),0!==n.pending){if(F(e),0===e.avail_out)return n.last_flush=-1,m}else if(0===e.avail_in&&T(t)<=T(r)&&t!==f)return R(e,-5);if(666===n.status&&0!==e.avail_in)return R(e,-5);if(0!==e.avail_in||0!==n.lookahead||t!==l&&666!==n.status){var o=2===n.strategy?function(e,t){for(var r;;){if(0===e.lookahead&&(j(e),0===e.lookahead)){if(t===l)return A;break}if(e.match_length=0,r=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++,r&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=0,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}(n,t):3===n.strategy?function(e,t){for(var r,n,i,s,a=e.window;;){if(e.lookahead<=S){if(j(e),e.lookahead<=S&&t===l)return A;if(0===e.lookahead)break}if(e.match_length=0,e.lookahead>=x&&0<e.strstart&&(n=a[i=e.strstart-1])===a[++i]&&n===a[++i]&&n===a[++i]){s=e.strstart+S;do{}while(n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&i<s);e.match_length=S-(s-i),e.match_length>e.lookahead&&(e.match_length=e.lookahead)}if(e.match_length>=x?(r=u._tr_tally(e,1,e.match_length-x),e.lookahead-=e.match_length,e.strstart+=e.match_length,e.match_length=0):(r=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++),r&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=0,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}(n,t):h[n.level].func(n,t);if(o!==O&&o!==B||(n.status=666),o===A||o===O)return 0===e.avail_out&&(n.last_flush=-1),m;if(o===I&&(1===t?u._tr_align(n):5!==t&&(u._tr_stored_block(n,0,0,!1),3===t&&(D(n.head),0===n.lookahead&&(n.strstart=0,n.block_start=0,n.insert=0))),F(e),0===e.avail_out))return n.last_flush=-1,m}return t!==f?m:n.wrap<=0?1:(2===n.wrap?(U(n,255&e.adler),U(n,e.adler>>8&255),U(n,e.adler>>16&255),U(n,e.adler>>24&255),U(n,255&e.total_in),U(n,e.total_in>>8&255),U(n,e.total_in>>16&255),U(n,e.total_in>>24&255)):(P(n,e.adler>>>16),P(n,65535&e.adler)),F(e),0<n.wrap&&(n.wrap=-n.wrap),0!==n.pending?m:1)},r.deflateEnd=function(e){var t;return e&&e.state?(t=e.state.status)!==C&&69!==t&&73!==t&&91!==t&&103!==t&&t!==E&&666!==t?R(e,_):(e.state=null,t===E?R(e,-3):m):_},r.deflateSetDictionary=function(e,t){var r,n,i,s,a,o,h,u,l=t.length;if(!e||!e.state)return _;if(2===(s=(r=e.state).wrap)||1===s&&r.status!==C||r.lookahead)return _;for(1===s&&(e.adler=d(e.adler,t,l,0)),r.wrap=0,l>=r.w_size&&(0===s&&(D(r.head),r.strstart=0,r.block_start=0,r.insert=0),u=new c.Buf8(r.w_size),c.arraySet(u,t,l-r.w_size,r.w_size,0),t=u,l=r.w_size),a=e.avail_in,o=e.next_in,h=e.input,e.avail_in=l,e.next_in=0,e.input=t,j(r);r.lookahead>=x;){for(n=r.strstart,i=r.lookahead-(x-1);r.ins_h=(r.ins_h<<r.hash_shift^r.window[n+x-1])&r.hash_mask,r.prev[n&r.w_mask]=r.head[r.ins_h],r.head[r.ins_h]=n,n++,--i;);r.strstart=n,r.lookahead=x-1,j(r)}return r.strstart+=r.lookahead,r.block_start=r.strstart,r.insert=r.lookahead,r.lookahead=0,r.match_length=r.prev_length=x-1,r.match_available=0,e.next_in=o,e.input=h,e.avail_in=a,r.wrap=s,m},r.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(e,t,r){"use strict";t.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},{}],48:[function(e,t,r){"use strict";t.exports=function(e,t){var r,n,i,s,a,o,h,u,l,f,c,d,p,m,_,g,b,v,y,w,k,x,S,z,C;r=e.state,n=e.next_in,z=e.input,i=n+(e.avail_in-5),s=e.next_out,C=e.output,a=s-(t-e.avail_out),o=s+(e.avail_out-257),h=r.dmax,u=r.wsize,l=r.whave,f=r.wnext,c=r.window,d=r.hold,p=r.bits,m=r.lencode,_=r.distcode,g=(1<<r.lenbits)-1,b=(1<<r.distbits)-1;e:do{p<15&&(d+=z[n++]<<p,p+=8,d+=z[n++]<<p,p+=8),v=m[d&g];t:for(;;){if(d>>>=y=v>>>24,p-=y,0===(y=v>>>16&255))C[s++]=65535&v;else{if(!(16&y)){if(0==(64&y)){v=m[(65535&v)+(d&(1<<y)-1)];continue t}if(32&y){r.mode=12;break e}e.msg="invalid literal/length code",r.mode=30;break e}w=65535&v,(y&=15)&&(p<y&&(d+=z[n++]<<p,p+=8),w+=d&(1<<y)-1,d>>>=y,p-=y),p<15&&(d+=z[n++]<<p,p+=8,d+=z[n++]<<p,p+=8),v=_[d&b];r:for(;;){if(d>>>=y=v>>>24,p-=y,!(16&(y=v>>>16&255))){if(0==(64&y)){v=_[(65535&v)+(d&(1<<y)-1)];continue r}e.msg="invalid distance code",r.mode=30;break e}if(k=65535&v,p<(y&=15)&&(d+=z[n++]<<p,(p+=8)<y&&(d+=z[n++]<<p,p+=8)),h<(k+=d&(1<<y)-1)){e.msg="invalid distance too far back",r.mode=30;break e}if(d>>>=y,p-=y,(y=s-a)<k){if(l<(y=k-y)&&r.sane){e.msg="invalid distance too far back",r.mode=30;break e}if(S=c,(x=0)===f){if(x+=u-y,y<w){for(w-=y;C[s++]=c[x++],--y;);x=s-k,S=C}}else if(f<y){if(x+=u+f-y,(y-=f)<w){for(w-=y;C[s++]=c[x++],--y;);if(x=0,f<w){for(w-=y=f;C[s++]=c[x++],--y;);x=s-k,S=C}}}else if(x+=f-y,y<w){for(w-=y;C[s++]=c[x++],--y;);x=s-k,S=C}for(;2<w;)C[s++]=S[x++],C[s++]=S[x++],C[s++]=S[x++],w-=3;w&&(C[s++]=S[x++],1<w&&(C[s++]=S[x++]))}else{for(x=s-k;C[s++]=C[x++],C[s++]=C[x++],C[s++]=C[x++],2<(w-=3););w&&(C[s++]=C[x++],1<w&&(C[s++]=C[x++]))}break}}break}}while(n<i&&s<o);n-=w=p>>3,d&=(1<<(p-=w<<3))-1,e.next_in=n,e.next_out=s,e.avail_in=n<i?i-n+5:5-(n-i),e.avail_out=s<o?o-s+257:257-(s-o),r.hold=d,r.bits=p}},{}],49:[function(e,t,r){"use strict";var I=e("../utils/common"),O=e("./adler32"),B=e("./crc32"),R=e("./inffast"),T=e("./inftrees"),D=1,F=2,N=0,U=-2,P=1,n=852,i=592;function L(e){return(e>>>24&255)+(e>>>8&65280)+((65280&e)<<8)+((255&e)<<24)}function s(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new I.Buf16(320),this.work=new I.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function a(e){var t;return e&&e.state?(t=e.state,e.total_in=e.total_out=t.total=0,e.msg="",t.wrap&&(e.adler=1&t.wrap),t.mode=P,t.last=0,t.havedict=0,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new I.Buf32(n),t.distcode=t.distdyn=new I.Buf32(i),t.sane=1,t.back=-1,N):U}function o(e){var t;return e&&e.state?((t=e.state).wsize=0,t.whave=0,t.wnext=0,a(e)):U}function h(e,t){var r,n;return e&&e.state?(n=e.state,t<0?(r=0,t=-t):(r=1+(t>>4),t<48&&(t&=15)),t&&(t<8||15<t)?U:(null!==n.window&&n.wbits!==t&&(n.window=null),n.wrap=r,n.wbits=t,o(e))):U}function u(e,t){var r,n;return e?(n=new s,(e.state=n).window=null,(r=h(e,t))!==N&&(e.state=null),r):U}var l,f,c=!0;function j(e){if(c){var t;for(l=new I.Buf32(512),f=new I.Buf32(32),t=0;t<144;)e.lens[t++]=8;for(;t<256;)e.lens[t++]=9;for(;t<280;)e.lens[t++]=7;for(;t<288;)e.lens[t++]=8;for(T(D,e.lens,0,288,l,0,e.work,{bits:9}),t=0;t<32;)e.lens[t++]=5;T(F,e.lens,0,32,f,0,e.work,{bits:5}),c=!1}e.lencode=l,e.lenbits=9,e.distcode=f,e.distbits=5}function Z(e,t,r,n){var i,s=e.state;return null===s.window&&(s.wsize=1<<s.wbits,s.wnext=0,s.whave=0,s.window=new I.Buf8(s.wsize)),n>=s.wsize?(I.arraySet(s.window,t,r-s.wsize,s.wsize,0),s.wnext=0,s.whave=s.wsize):(n<(i=s.wsize-s.wnext)&&(i=n),I.arraySet(s.window,t,r-n,i,s.wnext),(n-=i)?(I.arraySet(s.window,t,r-n,n,0),s.wnext=n,s.whave=s.wsize):(s.wnext+=i,s.wnext===s.wsize&&(s.wnext=0),s.whave<s.wsize&&(s.whave+=i))),0}r.inflateReset=o,r.inflateReset2=h,r.inflateResetKeep=a,r.inflateInit=function(e){return u(e,15)},r.inflateInit2=u,r.inflate=function(e,t){var r,n,i,s,a,o,h,u,l,f,c,d,p,m,_,g,b,v,y,w,k,x,S,z,C=0,E=new I.Buf8(4),A=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!e||!e.state||!e.output||!e.input&&0!==e.avail_in)return U;12===(r=e.state).mode&&(r.mode=13),a=e.next_out,i=e.output,h=e.avail_out,s=e.next_in,n=e.input,o=e.avail_in,u=r.hold,l=r.bits,f=o,c=h,x=N;e:for(;;)switch(r.mode){case P:if(0===r.wrap){r.mode=13;break}for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(2&r.wrap&&35615===u){E[r.check=0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0),l=u=0,r.mode=2;break}if(r.flags=0,r.head&&(r.head.done=!1),!(1&r.wrap)||(((255&u)<<8)+(u>>8))%31){e.msg="incorrect header check",r.mode=30;break}if(8!=(15&u)){e.msg="unknown compression method",r.mode=30;break}if(l-=4,k=8+(15&(u>>>=4)),0===r.wbits)r.wbits=k;else if(k>r.wbits){e.msg="invalid window size",r.mode=30;break}r.dmax=1<<k,e.adler=r.check=1,r.mode=512&u?10:12,l=u=0;break;case 2:for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(r.flags=u,8!=(255&r.flags)){e.msg="unknown compression method",r.mode=30;break}if(57344&r.flags){e.msg="unknown header flags set",r.mode=30;break}r.head&&(r.head.text=u>>8&1),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0,r.mode=3;case 3:for(;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.head&&(r.head.time=u),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,E[2]=u>>>16&255,E[3]=u>>>24&255,r.check=B(r.check,E,4,0)),l=u=0,r.mode=4;case 4:for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.head&&(r.head.xflags=255&u,r.head.os=u>>8),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0,r.mode=5;case 5:if(1024&r.flags){for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.length=u,r.head&&(r.head.extra_len=u),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0}else r.head&&(r.head.extra=null);r.mode=6;case 6:if(1024&r.flags&&(o<(d=r.length)&&(d=o),d&&(r.head&&(k=r.head.extra_len-r.length,r.head.extra||(r.head.extra=new Array(r.head.extra_len)),I.arraySet(r.head.extra,n,s,d,k)),512&r.flags&&(r.check=B(r.check,n,d,s)),o-=d,s+=d,r.length-=d),r.length))break e;r.length=0,r.mode=7;case 7:if(2048&r.flags){if(0===o)break e;for(d=0;k=n[s+d++],r.head&&k&&r.length<65536&&(r.head.name+=String.fromCharCode(k)),k&&d<o;);if(512&r.flags&&(r.check=B(r.check,n,d,s)),o-=d,s+=d,k)break e}else r.head&&(r.head.name=null);r.length=0,r.mode=8;case 8:if(4096&r.flags){if(0===o)break e;for(d=0;k=n[s+d++],r.head&&k&&r.length<65536&&(r.head.comment+=String.fromCharCode(k)),k&&d<o;);if(512&r.flags&&(r.check=B(r.check,n,d,s)),o-=d,s+=d,k)break e}else r.head&&(r.head.comment=null);r.mode=9;case 9:if(512&r.flags){for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(u!==(65535&r.check)){e.msg="header crc mismatch",r.mode=30;break}l=u=0}r.head&&(r.head.hcrc=r.flags>>9&1,r.head.done=!0),e.adler=r.check=0,r.mode=12;break;case 10:for(;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}e.adler=r.check=L(u),l=u=0,r.mode=11;case 11:if(0===r.havedict)return e.next_out=a,e.avail_out=h,e.next_in=s,e.avail_in=o,r.hold=u,r.bits=l,2;e.adler=r.check=1,r.mode=12;case 12:if(5===t||6===t)break e;case 13:if(r.last){u>>>=7&l,l-=7&l,r.mode=27;break}for(;l<3;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}switch(r.last=1&u,l-=1,3&(u>>>=1)){case 0:r.mode=14;break;case 1:if(j(r),r.mode=20,6!==t)break;u>>>=2,l-=2;break e;case 2:r.mode=17;break;case 3:e.msg="invalid block type",r.mode=30}u>>>=2,l-=2;break;case 14:for(u>>>=7&l,l-=7&l;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if((65535&u)!=(u>>>16^65535)){e.msg="invalid stored block lengths",r.mode=30;break}if(r.length=65535&u,l=u=0,r.mode=15,6===t)break e;case 15:r.mode=16;case 16:if(d=r.length){if(o<d&&(d=o),h<d&&(d=h),0===d)break e;I.arraySet(i,n,s,d,a),o-=d,s+=d,h-=d,a+=d,r.length-=d;break}r.mode=12;break;case 17:for(;l<14;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(r.nlen=257+(31&u),u>>>=5,l-=5,r.ndist=1+(31&u),u>>>=5,l-=5,r.ncode=4+(15&u),u>>>=4,l-=4,286<r.nlen||30<r.ndist){e.msg="too many length or distance symbols",r.mode=30;break}r.have=0,r.mode=18;case 18:for(;r.have<r.ncode;){for(;l<3;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.lens[A[r.have++]]=7&u,u>>>=3,l-=3}for(;r.have<19;)r.lens[A[r.have++]]=0;if(r.lencode=r.lendyn,r.lenbits=7,S={bits:r.lenbits},x=T(0,r.lens,0,19,r.lencode,0,r.work,S),r.lenbits=S.bits,x){e.msg="invalid code lengths set",r.mode=30;break}r.have=0,r.mode=19;case 19:for(;r.have<r.nlen+r.ndist;){for(;g=(C=r.lencode[u&(1<<r.lenbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(b<16)u>>>=_,l-=_,r.lens[r.have++]=b;else{if(16===b){for(z=_+2;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(u>>>=_,l-=_,0===r.have){e.msg="invalid bit length repeat",r.mode=30;break}k=r.lens[r.have-1],d=3+(3&u),u>>>=2,l-=2}else if(17===b){for(z=_+3;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}l-=_,k=0,d=3+(7&(u>>>=_)),u>>>=3,l-=3}else{for(z=_+7;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}l-=_,k=0,d=11+(127&(u>>>=_)),u>>>=7,l-=7}if(r.have+d>r.nlen+r.ndist){e.msg="invalid bit length repeat",r.mode=30;break}for(;d--;)r.lens[r.have++]=k}}if(30===r.mode)break;if(0===r.lens[256]){e.msg="invalid code -- missing end-of-block",r.mode=30;break}if(r.lenbits=9,S={bits:r.lenbits},x=T(D,r.lens,0,r.nlen,r.lencode,0,r.work,S),r.lenbits=S.bits,x){e.msg="invalid literal/lengths set",r.mode=30;break}if(r.distbits=6,r.distcode=r.distdyn,S={bits:r.distbits},x=T(F,r.lens,r.nlen,r.ndist,r.distcode,0,r.work,S),r.distbits=S.bits,x){e.msg="invalid distances set",r.mode=30;break}if(r.mode=20,6===t)break e;case 20:r.mode=21;case 21:if(6<=o&&258<=h){e.next_out=a,e.avail_out=h,e.next_in=s,e.avail_in=o,r.hold=u,r.bits=l,R(e,c),a=e.next_out,i=e.output,h=e.avail_out,s=e.next_in,n=e.input,o=e.avail_in,u=r.hold,l=r.bits,12===r.mode&&(r.back=-1);break}for(r.back=0;g=(C=r.lencode[u&(1<<r.lenbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(g&&0==(240&g)){for(v=_,y=g,w=b;g=(C=r.lencode[w+((u&(1<<v+y)-1)>>v)])>>>16&255,b=65535&C,!(v+(_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}u>>>=v,l-=v,r.back+=v}if(u>>>=_,l-=_,r.back+=_,r.length=b,0===g){r.mode=26;break}if(32&g){r.back=-1,r.mode=12;break}if(64&g){e.msg="invalid literal/length code",r.mode=30;break}r.extra=15&g,r.mode=22;case 22:if(r.extra){for(z=r.extra;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.length+=u&(1<<r.extra)-1,u>>>=r.extra,l-=r.extra,r.back+=r.extra}r.was=r.length,r.mode=23;case 23:for(;g=(C=r.distcode[u&(1<<r.distbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(0==(240&g)){for(v=_,y=g,w=b;g=(C=r.distcode[w+((u&(1<<v+y)-1)>>v)])>>>16&255,b=65535&C,!(v+(_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}u>>>=v,l-=v,r.back+=v}if(u>>>=_,l-=_,r.back+=_,64&g){e.msg="invalid distance code",r.mode=30;break}r.offset=b,r.extra=15&g,r.mode=24;case 24:if(r.extra){for(z=r.extra;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.offset+=u&(1<<r.extra)-1,u>>>=r.extra,l-=r.extra,r.back+=r.extra}if(r.offset>r.dmax){e.msg="invalid distance too far back",r.mode=30;break}r.mode=25;case 25:if(0===h)break e;if(d=c-h,r.offset>d){if((d=r.offset-d)>r.whave&&r.sane){e.msg="invalid distance too far back",r.mode=30;break}p=d>r.wnext?(d-=r.wnext,r.wsize-d):r.wnext-d,d>r.length&&(d=r.length),m=r.window}else m=i,p=a-r.offset,d=r.length;for(h<d&&(d=h),h-=d,r.length-=d;i[a++]=m[p++],--d;);0===r.length&&(r.mode=21);break;case 26:if(0===h)break e;i[a++]=r.length,h--,r.mode=21;break;case 27:if(r.wrap){for(;l<32;){if(0===o)break e;o--,u|=n[s++]<<l,l+=8}if(c-=h,e.total_out+=c,r.total+=c,c&&(e.adler=r.check=r.flags?B(r.check,i,c,a-c):O(r.check,i,c,a-c)),c=h,(r.flags?u:L(u))!==r.check){e.msg="incorrect data check",r.mode=30;break}l=u=0}r.mode=28;case 28:if(r.wrap&&r.flags){for(;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(u!==(4294967295&r.total)){e.msg="incorrect length check",r.mode=30;break}l=u=0}r.mode=29;case 29:x=1;break e;case 30:x=-3;break e;case 31:return-4;case 32:default:return U}return e.next_out=a,e.avail_out=h,e.next_in=s,e.avail_in=o,r.hold=u,r.bits=l,(r.wsize||c!==e.avail_out&&r.mode<30&&(r.mode<27||4!==t))&&Z(e,e.output,e.next_out,c-e.avail_out)?(r.mode=31,-4):(f-=e.avail_in,c-=e.avail_out,e.total_in+=f,e.total_out+=c,r.total+=c,r.wrap&&c&&(e.adler=r.check=r.flags?B(r.check,i,c,e.next_out-c):O(r.check,i,c,e.next_out-c)),e.data_type=r.bits+(r.last?64:0)+(12===r.mode?128:0)+(20===r.mode||15===r.mode?256:0),(0==f&&0===c||4===t)&&x===N&&(x=-5),x)},r.inflateEnd=function(e){if(!e||!e.state)return U;var t=e.state;return t.window&&(t.window=null),e.state=null,N},r.inflateGetHeader=function(e,t){var r;return e&&e.state?0==(2&(r=e.state).wrap)?U:((r.head=t).done=!1,N):U},r.inflateSetDictionary=function(e,t){var r,n=t.length;return e&&e.state?0!==(r=e.state).wrap&&11!==r.mode?U:11===r.mode&&O(1,t,n,0)!==r.check?-3:Z(e,t,n,n)?(r.mode=31,-4):(r.havedict=1,N):U},r.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(e,t,r){"use strict";var D=e("../utils/common"),F=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],N=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],U=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],P=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];t.exports=function(e,t,r,n,i,s,a,o){var h,u,l,f,c,d,p,m,_,g=o.bits,b=0,v=0,y=0,w=0,k=0,x=0,S=0,z=0,C=0,E=0,A=null,I=0,O=new D.Buf16(16),B=new D.Buf16(16),R=null,T=0;for(b=0;b<=15;b++)O[b]=0;for(v=0;v<n;v++)O[t[r+v]]++;for(k=g,w=15;1<=w&&0===O[w];w--);if(w<k&&(k=w),0===w)return i[s++]=20971520,i[s++]=20971520,o.bits=1,0;for(y=1;y<w&&0===O[y];y++);for(k<y&&(k=y),b=z=1;b<=15;b++)if(z<<=1,(z-=O[b])<0)return-1;if(0<z&&(0===e||1!==w))return-1;for(B[1]=0,b=1;b<15;b++)B[b+1]=B[b]+O[b];for(v=0;v<n;v++)0!==t[r+v]&&(a[B[t[r+v]]++]=v);if(d=0===e?(A=R=a,19):1===e?(A=F,I-=257,R=N,T-=257,256):(A=U,R=P,-1),b=y,c=s,S=v=E=0,l=-1,f=(C=1<<(x=k))-1,1===e&&852<C||2===e&&592<C)return 1;for(;;){for(p=b-S,_=a[v]<d?(m=0,a[v]):a[v]>d?(m=R[T+a[v]],A[I+a[v]]):(m=96,0),h=1<<b-S,y=u=1<<x;i[c+(E>>S)+(u-=h)]=p<<24|m<<16|_|0,0!==u;);for(h=1<<b-1;E&h;)h>>=1;if(0!==h?(E&=h-1,E+=h):E=0,v++,0==--O[b]){if(b===w)break;b=t[r+a[v]]}if(k<b&&(E&f)!==l){for(0===S&&(S=k),c+=y,z=1<<(x=b-S);x+S<w&&!((z-=O[x+S])<=0);)x++,z<<=1;if(C+=1<<x,1===e&&852<C||2===e&&592<C)return 1;i[l=E&f]=k<<24|x<<16|c-s|0}}return 0!==E&&(i[c+E]=b-S<<24|64<<16|0),o.bits=k,0}},{"../utils/common":41}],51:[function(e,t,r){"use strict";t.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],52:[function(e,t,r){"use strict";var i=e("../utils/common"),o=0,h=1;function n(e){for(var t=e.length;0<=--t;)e[t]=0}var s=0,a=29,u=256,l=u+1+a,f=30,c=19,_=2*l+1,g=15,d=16,p=7,m=256,b=16,v=17,y=18,w=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],k=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],x=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],S=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],z=new Array(2*(l+2));n(z);var C=new Array(2*f);n(C);var E=new Array(512);n(E);var A=new Array(256);n(A);var I=new Array(a);n(I);var O,B,R,T=new Array(f);function D(e,t,r,n,i){this.static_tree=e,this.extra_bits=t,this.extra_base=r,this.elems=n,this.max_length=i,this.has_stree=e&&e.length}function F(e,t){this.dyn_tree=e,this.max_code=0,this.stat_desc=t}function N(e){return e<256?E[e]:E[256+(e>>>7)]}function U(e,t){e.pending_buf[e.pending++]=255&t,e.pending_buf[e.pending++]=t>>>8&255}function P(e,t,r){e.bi_valid>d-r?(e.bi_buf|=t<<e.bi_valid&65535,U(e,e.bi_buf),e.bi_buf=t>>d-e.bi_valid,e.bi_valid+=r-d):(e.bi_buf|=t<<e.bi_valid&65535,e.bi_valid+=r)}function L(e,t,r){P(e,r[2*t],r[2*t+1])}function j(e,t){for(var r=0;r|=1&e,e>>>=1,r<<=1,0<--t;);return r>>>1}function Z(e,t,r){var n,i,s=new Array(g+1),a=0;for(n=1;n<=g;n++)s[n]=a=a+r[n-1]<<1;for(i=0;i<=t;i++){var o=e[2*i+1];0!==o&&(e[2*i]=j(s[o]++,o))}}function W(e){var t;for(t=0;t<l;t++)e.dyn_ltree[2*t]=0;for(t=0;t<f;t++)e.dyn_dtree[2*t]=0;for(t=0;t<c;t++)e.bl_tree[2*t]=0;e.dyn_ltree[2*m]=1,e.opt_len=e.static_len=0,e.last_lit=e.matches=0}function M(e){8<e.bi_valid?U(e,e.bi_buf):0<e.bi_valid&&(e.pending_buf[e.pending++]=e.bi_buf),e.bi_buf=0,e.bi_valid=0}function H(e,t,r,n){var i=2*t,s=2*r;return e[i]<e[s]||e[i]===e[s]&&n[t]<=n[r]}function G(e,t,r){for(var n=e.heap[r],i=r<<1;i<=e.heap_len&&(i<e.heap_len&&H(t,e.heap[i+1],e.heap[i],e.depth)&&i++,!H(t,n,e.heap[i],e.depth));)e.heap[r]=e.heap[i],r=i,i<<=1;e.heap[r]=n}function K(e,t,r){var n,i,s,a,o=0;if(0!==e.last_lit)for(;n=e.pending_buf[e.d_buf+2*o]<<8|e.pending_buf[e.d_buf+2*o+1],i=e.pending_buf[e.l_buf+o],o++,0===n?L(e,i,t):(L(e,(s=A[i])+u+1,t),0!==(a=w[s])&&P(e,i-=I[s],a),L(e,s=N(--n),r),0!==(a=k[s])&&P(e,n-=T[s],a)),o<e.last_lit;);L(e,m,t)}function Y(e,t){var r,n,i,s=t.dyn_tree,a=t.stat_desc.static_tree,o=t.stat_desc.has_stree,h=t.stat_desc.elems,u=-1;for(e.heap_len=0,e.heap_max=_,r=0;r<h;r++)0!==s[2*r]?(e.heap[++e.heap_len]=u=r,e.depth[r]=0):s[2*r+1]=0;for(;e.heap_len<2;)s[2*(i=e.heap[++e.heap_len]=u<2?++u:0)]=1,e.depth[i]=0,e.opt_len--,o&&(e.static_len-=a[2*i+1]);for(t.max_code=u,r=e.heap_len>>1;1<=r;r--)G(e,s,r);for(i=h;r=e.heap[1],e.heap[1]=e.heap[e.heap_len--],G(e,s,1),n=e.heap[1],e.heap[--e.heap_max]=r,e.heap[--e.heap_max]=n,s[2*i]=s[2*r]+s[2*n],e.depth[i]=(e.depth[r]>=e.depth[n]?e.depth[r]:e.depth[n])+1,s[2*r+1]=s[2*n+1]=i,e.heap[1]=i++,G(e,s,1),2<=e.heap_len;);e.heap[--e.heap_max]=e.heap[1],function(e,t){var r,n,i,s,a,o,h=t.dyn_tree,u=t.max_code,l=t.stat_desc.static_tree,f=t.stat_desc.has_stree,c=t.stat_desc.extra_bits,d=t.stat_desc.extra_base,p=t.stat_desc.max_length,m=0;for(s=0;s<=g;s++)e.bl_count[s]=0;for(h[2*e.heap[e.heap_max]+1]=0,r=e.heap_max+1;r<_;r++)p<(s=h[2*h[2*(n=e.heap[r])+1]+1]+1)&&(s=p,m++),h[2*n+1]=s,u<n||(e.bl_count[s]++,a=0,d<=n&&(a=c[n-d]),o=h[2*n],e.opt_len+=o*(s+a),f&&(e.static_len+=o*(l[2*n+1]+a)));if(0!==m){do{for(s=p-1;0===e.bl_count[s];)s--;e.bl_count[s]--,e.bl_count[s+1]+=2,e.bl_count[p]--,m-=2}while(0<m);for(s=p;0!==s;s--)for(n=e.bl_count[s];0!==n;)u<(i=e.heap[--r])||(h[2*i+1]!==s&&(e.opt_len+=(s-h[2*i+1])*h[2*i],h[2*i+1]=s),n--)}}(e,t),Z(s,u,e.bl_count)}function X(e,t,r){var n,i,s=-1,a=t[1],o=0,h=7,u=4;for(0===a&&(h=138,u=3),t[2*(r+1)+1]=65535,n=0;n<=r;n++)i=a,a=t[2*(n+1)+1],++o<h&&i===a||(o<u?e.bl_tree[2*i]+=o:0!==i?(i!==s&&e.bl_tree[2*i]++,e.bl_tree[2*b]++):o<=10?e.bl_tree[2*v]++:e.bl_tree[2*y]++,s=i,u=(o=0)===a?(h=138,3):i===a?(h=6,3):(h=7,4))}function V(e,t,r){var n,i,s=-1,a=t[1],o=0,h=7,u=4;for(0===a&&(h=138,u=3),n=0;n<=r;n++)if(i=a,a=t[2*(n+1)+1],!(++o<h&&i===a)){if(o<u)for(;L(e,i,e.bl_tree),0!=--o;);else 0!==i?(i!==s&&(L(e,i,e.bl_tree),o--),L(e,b,e.bl_tree),P(e,o-3,2)):o<=10?(L(e,v,e.bl_tree),P(e,o-3,3)):(L(e,y,e.bl_tree),P(e,o-11,7));s=i,u=(o=0)===a?(h=138,3):i===a?(h=6,3):(h=7,4)}}n(T);var q=!1;function J(e,t,r,n){P(e,(s<<1)+(n?1:0),3),function(e,t,r,n){M(e),n&&(U(e,r),U(e,~r)),i.arraySet(e.pending_buf,e.window,t,r,e.pending),e.pending+=r}(e,t,r,!0)}r._tr_init=function(e){q||(function(){var e,t,r,n,i,s=new Array(g+1);for(n=r=0;n<a-1;n++)for(I[n]=r,e=0;e<1<<w[n];e++)A[r++]=n;for(A[r-1]=n,n=i=0;n<16;n++)for(T[n]=i,e=0;e<1<<k[n];e++)E[i++]=n;for(i>>=7;n<f;n++)for(T[n]=i<<7,e=0;e<1<<k[n]-7;e++)E[256+i++]=n;for(t=0;t<=g;t++)s[t]=0;for(e=0;e<=143;)z[2*e+1]=8,e++,s[8]++;for(;e<=255;)z[2*e+1]=9,e++,s[9]++;for(;e<=279;)z[2*e+1]=7,e++,s[7]++;for(;e<=287;)z[2*e+1]=8,e++,s[8]++;for(Z(z,l+1,s),e=0;e<f;e++)C[2*e+1]=5,C[2*e]=j(e,5);O=new D(z,w,u+1,l,g),B=new D(C,k,0,f,g),R=new D(new Array(0),x,0,c,p)}(),q=!0),e.l_desc=new F(e.dyn_ltree,O),e.d_desc=new F(e.dyn_dtree,B),e.bl_desc=new F(e.bl_tree,R),e.bi_buf=0,e.bi_valid=0,W(e)},r._tr_stored_block=J,r._tr_flush_block=function(e,t,r,n){var i,s,a=0;0<e.level?(2===e.strm.data_type&&(e.strm.data_type=function(e){var t,r=4093624447;for(t=0;t<=31;t++,r>>>=1)if(1&r&&0!==e.dyn_ltree[2*t])return o;if(0!==e.dyn_ltree[18]||0!==e.dyn_ltree[20]||0!==e.dyn_ltree[26])return h;for(t=32;t<u;t++)if(0!==e.dyn_ltree[2*t])return h;return o}(e)),Y(e,e.l_desc),Y(e,e.d_desc),a=function(e){var t;for(X(e,e.dyn_ltree,e.l_desc.max_code),X(e,e.dyn_dtree,e.d_desc.max_code),Y(e,e.bl_desc),t=c-1;3<=t&&0===e.bl_tree[2*S[t]+1];t--);return e.opt_len+=3*(t+1)+5+5+4,t}(e),i=e.opt_len+3+7>>>3,(s=e.static_len+3+7>>>3)<=i&&(i=s)):i=s=r+5,r+4<=i&&-1!==t?J(e,t,r,n):4===e.strategy||s===i?(P(e,2+(n?1:0),3),K(e,z,C)):(P(e,4+(n?1:0),3),function(e,t,r,n){var i;for(P(e,t-257,5),P(e,r-1,5),P(e,n-4,4),i=0;i<n;i++)P(e,e.bl_tree[2*S[i]+1],3);V(e,e.dyn_ltree,t-1),V(e,e.dyn_dtree,r-1)}(e,e.l_desc.max_code+1,e.d_desc.max_code+1,a+1),K(e,e.dyn_ltree,e.dyn_dtree)),W(e),n&&M(e)},r._tr_tally=function(e,t,r){return e.pending_buf[e.d_buf+2*e.last_lit]=t>>>8&255,e.pending_buf[e.d_buf+2*e.last_lit+1]=255&t,e.pending_buf[e.l_buf+e.last_lit]=255&r,e.last_lit++,0===t?e.dyn_ltree[2*r]++:(e.matches++,t--,e.dyn_ltree[2*(A[r]+u+1)]++,e.dyn_dtree[2*N(t)]++),e.last_lit===e.lit_bufsize-1},r._tr_align=function(e){P(e,2,3),L(e,m,z),function(e){16===e.bi_valid?(U(e,e.bi_buf),e.bi_buf=0,e.bi_valid=0):8<=e.bi_valid&&(e.pending_buf[e.pending++]=255&e.bi_buf,e.bi_buf>>=8,e.bi_valid-=8)}(e)}},{"../utils/common":41}],53:[function(e,t,r){"use strict";t.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],54:[function(e,t,r){(function(e){!function(r,n){"use strict";if(!r.setImmediate){var i,s,t,a,o=1,h={},u=!1,l=r.document,e=Object.getPrototypeOf&&Object.getPrototypeOf(r);e=e&&e.setTimeout?e:r,i="[object process]"==={}.toString.call(r.process)?function(e){process.nextTick(function(){c(e)})}:function(){if(r.postMessage&&!r.importScripts){var e=!0,t=r.onmessage;return r.onmessage=function(){e=!1},r.postMessage("","*"),r.onmessage=t,e}}()?(a="setImmediate$"+Math.random()+"$",r.addEventListener?r.addEventListener("message",d,!1):r.attachEvent("onmessage",d),function(e){r.postMessage(a+e,"*")}):r.MessageChannel?((t=new MessageChannel).port1.onmessage=function(e){c(e.data)},function(e){t.port2.postMessage(e)}):l&&"onreadystatechange"in l.createElement("script")?(s=l.documentElement,function(e){var t=l.createElement("script");t.onreadystatechange=function(){c(e),t.onreadystatechange=null,s.removeChild(t),t=null},s.appendChild(t)}):function(e){setTimeout(c,0,e)},e.setImmediate=function(e){"function"!=typeof e&&(e=new Function(""+e));for(var t=new Array(arguments.length-1),r=0;r<t.length;r++)t[r]=arguments[r+1];var n={callback:e,args:t};return h[o]=n,i(o),o++},e.clearImmediate=f}function f(e){delete h[e]}function c(e){if(u)setTimeout(c,0,e);else{var t=h[e];if(t){u=!0;try{!function(e){var t=e.callback,r=e.args;switch(r.length){case 0:t();break;case 1:t(r[0]);break;case 2:t(r[0],r[1]);break;case 3:t(r[0],r[1],r[2]);break;default:t.apply(n,r)}}(t)}finally{f(e),u=!1}}}}function d(e){e.source===r&&"string"==typeof e.data&&0===e.data.indexOf(a)&&c(+e.data.slice(a.length))}}("undefined"==typeof self?void 0===e?this:e:self)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[10])(10)});
})();
const EMU_PER_PX = 9525; // 96 dpi
const emuToPx = v => Math.round((v||0) / EMU_PER_PX);
const ptToPx = pt => Math.round(pt * (96/72));
const rotToDeg = rot => rot ? Math.round(parseInt(rot,10) / 60000) : 0;

function esc(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function uuid(){
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random()*16|0, v = c==='x'?r:(r&0x3|0x8);
    return v.toString(16);
  });
}

// ---- XML helpers (prefixed tag names work fine via getElementsByTagName in browsers) ----
function first(el, tag){ const l = el.getElementsByTagName(tag); return l.length ? l[0] : null; }
function all(el, tag){ return Array.from(el.getElementsByTagName(tag)); }

// Direct children only. first()/all() search the WHOLE subtree, which is
// wrong for anything with nested look-alikes: "the first a:solidFill under
// p:spPr" is the OUTLINE colour when the shape itself has no fill of its own
// (a:ln/a:solidFill is a descendant of spPr too) — that exact mix-up painted
// outlined-but-unfilled shapes in their line colour.
function kid(el, tag){
  if (!el) return null;
  for (const c of el.children) if (c.tagName === tag) return c;
  return null;
}
function kids(el, tag){ return el ? Array.from(el.children).filter(c => !tag || c.tagName === tag) : []; }
function intAttr(el, name, dflt){
  const v = el ? el.getAttribute(name) : null;
  const n = v == null ? NaN : parseInt(v, 10);
  return Number.isFinite(n) ? n : dflt;
}
function parseXml(text){ return new DOMParser().parseFromString(text, 'application/xml'); }
const clamp01 = v => Math.max(0, Math.min(1, v));

function parseThemeColors(themeXmlDoc){
  const map = {};
  if (!themeXmlDoc) return map;
  const scheme = first(themeXmlDoc, 'a:clrScheme');
  if (!scheme) return map;
  const slots = ['dk1','lt1','dk2','lt2','accent1','accent2','accent3','accent4','accent5','accent6','hlink','folHlink'];
  for (const slot of slots){
    const node = first(scheme, 'a:'+slot);
    if (!node) continue;
    const srgb = first(node, 'a:srgbClr');
    const sys = first(node, 'a:sysClr');
    if (srgb) map[slot] = '#'+srgb.getAttribute('val');
    else if (sys) map[slot] = '#'+(sys.getAttribute('lastClr') || (sys.getAttribute('val') === 'window' ? 'FFFFFF' : '000000'));
  }
  return map;
}

// A run's own <a:latin typeface="…"/> very often isn't a real font name at
// all — it's a theme PLACEHOLDER ("+mj-lt"/"+mn-lt", "major"/"minor" latin),
// meaning "whatever this theme's own major/minor font is". Most real-world
// text never sets an explicit typeface per run at all — it just inherits
// the theme's own default, which is exactly this placeholder path.
function parseThemeFonts(themeXmlDoc){
  const map = { major: null, minor: null };
  if (!themeXmlDoc) return map;
  const scheme = first(themeXmlDoc, 'a:fontScheme');
  if (!scheme) return map;
  const majorFont = first(scheme, 'a:majorFont');
  const minorFont = first(scheme, 'a:minorFont');
  const majorLatin = majorFont ? first(majorFont, 'a:latin') : null;
  const minorLatin = minorFont ? first(minorFont, 'a:latin') : null;
  if (majorLatin && majorLatin.getAttribute('typeface')) map.major = majorLatin.getAttribute('typeface');
  if (minorLatin && minorLatin.getAttribute('typeface')) map.minor = minorLatin.getAttribute('typeface');
  return map;
}

// The theme's format scheme: the fill/line/background style lists that
// p:style's fillRef/lnRef and p:bgRef point INTO by index. Without them a
// "shape style" shape could only ever take the ref's bare colour, never the
// gradient or tint the style actually paints.
function parseTheme(themeXmlDoc){
  const fmt = themeXmlDoc ? first(themeXmlDoc, 'a:fmtScheme') : null;
  const lst = name => { const l = fmt ? kid(fmt, name) : null; return l ? kids(l) : []; };
  return {
    colors: parseThemeColors(themeXmlDoc),
    fonts: parseThemeFonts(themeXmlDoc),
    fillStyles: lst('a:fillStyleLst'),
    lnStyles: lst('a:lnStyleLst'),
    bgFillStyles: lst('a:bgFillStyleLst'),
  };
}

// Resolves a raw typeface value against the theme's own major/minor fonts.
// Returns null (not the generic fallback) when nothing usable was found,
// so the CALLER decides what a sensible final fallback looks like.
function resolveFontFamily(raw, themeFonts){
  if (!raw) return null;
  if (/^\+mj-/.test(raw)) return themeFonts.major || null;
  if (/^\+mn-/.test(raw)) return themeFonts.minor || null;
  return raw;
}
// A lone family name falls back to the BROWSER default when it is missing
// (usually a serif Times) — a generic tail keeps the look close.
function fontStack(name){
  if (!name) return 'system-ui, sans-serif';
  if (/,/.test(name)) return name;
  if (!/^[a-zA-Z0-9 '"-]+$/.test(name)) return 'system-ui, sans-serif';
  const serif = /(times|georgia|garamond|cambria|palatino|book|serif|minion|baskerville)/i.test(name) && !/sans/i.test(name);
  return name + (serif ? ', serif' : ', sans-serif');
}

function rgbToHsl(r, g, b){
  r/=255; g/=255; b/=255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h=0, s=0; const l=(max+min)/2;
  const d = max-min;
  if (d !== 0){
    s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    if (max===r) h=((g-b)/d + (g<b?6:0));
    else if (max===g) h=(b-r)/d + 2;
    else h=(r-g)/d + 4;
    h/=6;
  }
  return [h,s,l];
}
function hslToRgb(h,s,l){
  if (s===0){ const v=Math.round(l*255); return [v,v,v]; }
  const hue2rgb=(p,q,t)=>{ if(t<0)t+=1; if(t>1)t-=1; if(t<1/6)return p+(q-p)*6*t; if(t<1/2)return q; if(t<2/3)return p+(q-p)*(2/3-t)*6; return p; };
  const q = l < 0.5 ? l*(1+s) : l+s-l*s;
  const p = 2*l-q;
  return [Math.round(hue2rgb(p,q,h+1/3)*255), Math.round(hue2rgb(p,q,h)*255), Math.round(hue2rgb(p,q,h-1/3)*255)];
}
function hexToRgb(hex){
  const h = hex.replace('#','');
  return [parseInt(h.substr(0,2),16), parseInt(h.substr(2,2),16), parseInt(h.substr(4,2),16)];
}
function rgbToHex(r,g,b){
  const c = v => Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0');
  return ('#'+c(r)+c(g)+c(b)).toUpperCase();
}
const srgbToLin = c => { c /= 255; return c <= 0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); };
const linToSrgb = v => { v = clamp01(v); return 255 * (v <= 0.0031308 ? v*12.92 : 1.055*Math.pow(v, 1/2.4) - 0.055); };

const PRESET_COLORS = {
  black:'000000', white:'FFFFFF', red:'FF0000', green:'008000', blue:'0000FF', yellow:'FFFF00',
  cyan:'00FFFF', magenta:'FF00FF', gray:'808080', grey:'808080', dkGray:'A9A9A9', darkGray:'A9A9A9',
  ltGray:'D3D3D3', lightGray:'D3D3D3', silver:'C0C0C0', orange:'FFA500', purple:'800080',
  navy:'000080', maroon:'800000', olive:'808000', teal:'008080', lime:'00FF00', brown:'A52A2A',
  pink:'FFC0CB', gold:'FFD700', dkBlue:'00008B', dkRed:'8B0000', dkGreen:'006400', ltBlue:'ADD8E6',
  ltGreen:'90EE90', ltYellow:'FFFFE0',
};
const COLOR_TAGS = new Set(['a:srgbClr','a:schemeClr','a:sysClr','a:prstClr','a:scrgbClr','a:hslClr']);
function colorChild(container){
  if (!container) return null;
  for (const c of container.children) if (COLOR_TAGS.has(c.tagName)) return c;
  return null;
}

// The slide's colour map (p:clrMap on the master, optionally overridden by
// the layout's / slide's p:clrMapOvr) is what turns the ROLE names text and
// backgrounds use — tx1/bg1/tx2/bg2 — into actual theme slots. A dark
// template maps tx1→lt1 and bg1→dk1; the old hard-wired tx1→dk1 painted
// every inherited text colour of such a deck dark-on-dark.
const DEFAULT_CLR_MAP = { bg1:'lt1', tx1:'dk1', bg2:'lt2', tx2:'dk2' };
function clrMapFrom(el, base){
  const m = Object.assign({}, base || DEFAULT_CLR_MAP);
  if (el) for (const a of Array.from(el.attributes)) if (!a.name.includes(':')) m[a.name] = a.value;
  return m;
}
function clrMapOverride(root, base){
  const ovr = root ? first(root, 'p:clrMapOvr') : null;
  const o = ovr ? kid(ovr, 'a:overrideClrMapping') : null;
  return o ? clrMapFrom(o, base) : base;
}

// One colour node → { rgb:[r,g,b], a } (or null when it doesn't resolve).
// Transforms apply IN DOCUMENT ORDER, as PowerPoint does: shade/tint in
// linear light (the sRGB version came out visibly too dark/too washed),
// lumMod/lumOff/satMod in HSL. `phClr` is the placeholder colour a theme
// style (fillRef/lnRef/bgRef) was invoked with.
function resolveClr(node, pal, phClr){
  if (!node) return null;
  let rgb = null, a = 1;
  const val = node.getAttribute('val');
  switch (node.tagName){
    case 'a:srgbClr': if (/^[0-9a-f]{6}$/i.test(val || '')) rgb = hexToRgb(val); break;
    case 'a:sysClr': {
      const lc = node.getAttribute('lastClr');
      rgb = hexToRgb(lc && /^[0-9a-f]{6}$/i.test(lc) ? lc : (/^(window|highlightText|btnHighlight)$/.test(val || '') ? 'FFFFFF' : '000000'));
      break;
    }
    case 'a:prstClr': if (PRESET_COLORS[val]) rgb = hexToRgb(PRESET_COLORS[val]); break;
    case 'a:scrgbClr': rgb = ['r','g','b'].map(k => linToSrgb(intAttr(node, k, 0) / 100000)); break;
    case 'a:hslClr': rgb = hslToRgb(intAttr(node, 'hue', 0) / 21600000, clamp01(intAttr(node, 'sat', 0) / 100000), clamp01(intAttr(node, 'lum', 0) / 100000)); break;
    case 'a:schemeClr': {
      if (val === 'phClr'){ if (phClr){ rgb = phClr.rgb.slice(); a = phClr.a; } break; }
      const key = (pal.map && pal.map[val]) || val;
      const hex = pal.colors[key];
      if (hex) rgb = hexToRgb(hex);
      break;
    }
  }
  if (!rgb) return null;
  let [r, g, b] = rgb;
  for (const m of node.children){
    const f = intAttr(m, 'val', 0) / 100000;
    switch (m.tagName){
      case 'a:alpha': a = f; break;
      case 'a:alphaMod': a *= f; break;
      case 'a:alphaOff': a += f; break;
      case 'a:shade': [r, g, b] = [r, g, b].map(c => linToSrgb(srgbToLin(c) * f)); break;
      case 'a:tint': [r, g, b] = [r, g, b].map(c => linToSrgb(srgbToLin(c) * f + (1 - f))); break;
      case 'a:inv': [r, g, b] = [255 - r, 255 - g, 255 - b]; break;
      case 'a:gray': { const y = 0.2126*r + 0.7152*g + 0.0722*b; r = g = b = y; break; }
      case 'a:lumMod': case 'a:lumOff': case 'a:satMod': case 'a:satOff': case 'a:hueOff': case 'a:hueMod': {
        let [h, s, l] = rgbToHsl(r, g, b);
        if (m.tagName === 'a:lumMod') l *= f;
        else if (m.tagName === 'a:lumOff') l += f;
        else if (m.tagName === 'a:satMod') s *= f;
        else if (m.tagName === 'a:satOff') s += f;
        else if (m.tagName === 'a:hueOff') h += intAttr(m, 'val', 0) / 21600000;
        else h *= f;
        [r, g, b] = hslToRgb(((h % 1) + 1) % 1, clamp01(s), clamp01(l));
        break;
      }
    }
  }
  return { rgb: [r, g, b], a: clamp01(a) };
}
function clrCss(c){
  if (!c) return null;
  if (c.a >= 0.995) return rgbToHex(c.rgb[0], c.rgb[1], c.rgb[2]);
  const [r, g, b] = c.rgb.map(v => Math.max(0, Math.min(255, Math.round(v))));
  return 'rgba(' + r + ',' + g + ',' + b + ',' + (Math.round(c.a * 1000) / 1000) + ')';
}
// A colour ROLE (tx1, bg1, accent2…) through the slide's colour map.
function roleColor(pal, role){
  const hex = pal.colors[(pal.map && pal.map[role]) || role];
  return hex ? rgbToHex(...hexToRgb(hex)) : null;
}
function colorIn(container, pal, phClr){ return resolveClr(colorChild(container), pal, phClr); }

// A fill declaration → null (this level says nothing) | {kind:'none'} |
// {kind:'solid', color} | {kind:'grad', color, grad} | {kind:'blip', el} |
// {kind:'grp'}. `color` on a gradient is its first stop — the solid
// fallback bento keeps beside every gradient.
function fillNode(c, pal, phClr){
  switch (c.tagName){
    case 'a:noFill': return { kind: 'none' };
    case 'a:solidFill': { const col = colorIn(c, pal, phClr); return col ? { kind: 'solid', color: col } : null; }
    case 'a:gradFill': { const g = gradOf(c, pal, phClr); return g ? { kind: 'grad', color: g.first, grad: g.grad } : null; }
    case 'a:pattFill': { const col = colorIn(kid(c, 'a:fgClr'), pal, phClr) || colorIn(kid(c, 'a:bgClr'), pal, phClr); return col ? { kind: 'solid', color: col } : null; }
    case 'a:blipFill': return { kind: 'blip', el: c };
    case 'a:grpFill': return { kind: 'grp' };
  }
  return undefined;
}
function fillOf(parent, pal, phClr){
  if (!parent) return null;
  for (const c of parent.children){
    const f = fillNode(c, pal, phClr);
    if (f !== undefined) return f;
  }
  return null;
}
function gradOf(gradFill, pal, phClr){
  const lst = kid(gradFill, 'a:gsLst');
  if (!lst) return null;
  const stops = kids(lst, 'a:gs')
    .map(gs => ({ at: clamp01(intAttr(gs, 'pos', 0) / 100000), c: colorIn(gs, pal, phClr) }))
    .filter(s => s.c)
    .sort((x, y) => x.at - y.at);
  if (!stops.length) return null;
  // DrawingML a:lin ang: 0 = left→right, clockwise, in 60000ths of a degree.
  // CSS: 90deg = left→right. Radial/path gradients have no bento counterpart
  // and read closest as top→bottom.
  const lin = kid(gradFill, 'a:lin');
  const angle = lin ? Math.round(((intAttr(lin, 'ang', 0) / 60000) + 90) % 360) : 180;
  return { first: stops[0].c, grad: { angle, stops: stops.map(s => ({ at: Math.round(s.at * 1000) / 1000, color: clrCss(s.c) })) } };
}
// p:style's fillRef / p:bgRef: an index into the theme's style lists,
// invoked with the ref's own colour as phClr. idx 0 = no fill; 1..999 =
// fillStyleLst; 1001+ = bgFillStyleLst.
function themeFillRef(ref, theme, pal){
  if (!ref) return null;
  const idx = intAttr(ref, 'idx', 0);
  if (!idx) return { kind: 'none' };
  const phClr = colorIn(ref, pal, null);
  const styleEl = idx >= 1001 ? theme.bgFillStyles[idx - 1001] : theme.fillStyles[idx - 1];
  const f = styleEl ? fillNode(styleEl, pal, phClr) : null;
  if (f && f.kind !== 'blip' && f.kind !== 'grp') return f;
  return phClr ? { kind: 'solid', color: phClr } : null;
}
function styleRef(node, name){
  const st = kid(node, 'p:style');
  return st ? kid(st, name) : null;
}
// Outline: the shape's own a:ln speaks first (per aspect), p:style's lnRef
// (theme lnStyleLst entry) fills in what it leaves out.
function lineOf(spPr, node, theme, pal){
  const ln = kid(spPr, 'a:ln');
  const ref = styleRef(node, 'a:lnRef');
  const refIdx = ref ? intAttr(ref, 'idx', 0) : 0;
  const refLn = refIdx > 0 ? (theme.lnStyles[refIdx - 1] || null) : null;
  const phClr = ref ? colorIn(ref, pal, null) : null;
  let f = ln ? fillOf(ln, pal, phClr) : null;
  if (!f && refIdx > 0) f = (refLn && fillOf(refLn, pal, phClr)) || (phClr ? { kind: 'solid', color: phClr } : null);
  if (!f || f.kind === 'none' || !f.color) return null;
  const wEmu = (ln && ln.getAttribute('w')) ? intAttr(ln, 'w', 12700) : intAttr(refLn, 'w', 12700);
  const dashEl = (ln && kid(ln, 'a:prstDash')) || (refLn && kid(refLn, 'a:prstDash'));
  const dv = dashEl ? (dashEl.getAttribute('val') || 'solid') : 'solid';
  const dash = dv === 'solid' ? null : (/dot/i.test(dv) && !/dash/i.test(dv) ? 'dotted' : 'dashed');
  const end = tag => {
    const e = ln ? kid(ln, tag) : null;
    const t = e ? e.getAttribute('type') : null;
    return !t || t === 'none' ? null : (t === 'oval' ? 'dot' : 'arrow');
  };
  return { color: clrCss(f.color), width: Math.max(1, Math.round(wEmu / EMU_PER_PX * 10) / 10), dash, head: end('a:headEnd'), tail: end('a:tailEnd') };
}

// PowerPoint's own group-to-child coordinate mapping (off/ext = the
// group's own slide-absolute position; chOff/chExt = the coordinate
// space its children's own off/ext values are expressed in) — see
// ECMA-376 Part 1, §20.1.7.6 (xfrm).
function extractGroupXfrm(grpSpEl){
  const grpSpPr = kid(grpSpEl, 'p:grpSpPr');
  const xfrm = grpSpPr ? kid(grpSpPr, 'a:xfrm') : null;
  if (!xfrm) return null;
  const off = kid(xfrm, 'a:off'), ext = kid(xfrm, 'a:ext');
  const chOff = kid(xfrm, 'a:chOff'), chExt = kid(xfrm, 'a:chExt');
  if (!off || !ext || !chOff || !chExt) return null;
  return {
    offX: intAttr(off, 'x', 0), offY: intAttr(off, 'y', 0),
    extW: intAttr(ext, 'cx', 0), extH: intAttr(ext, 'cy', 0),
    chOffX: intAttr(chOff, 'x', 0), chOffY: intAttr(chOff, 'y', 0),
    chExtW: intAttr(chExt, 'cx', 0), chExtH: intAttr(chExt, 'cy', 0),
    rot: intAttr(xfrm, 'rot', 0),
  };
}

// Rewrites ONE descendant's own xfrm from group-relative EMU coordinates to
// slide-absolute EMU coordinates, in place — after this, extractFrame()
// reads exactly the same attributes it always has, just already carrying
// the group's own transform baked in.
function xfrmElOf(el){
  const spPr = kid(el, 'p:spPr') || kid(el, 'p:grpSpPr');
  return spPr ? kid(spPr, 'a:xfrm') : kid(el, 'p:xfrm');
}
function applyGroupXfrmToChild(childEl, g){ applyGroupToXfrm(xfrmElOf(childEl), g); }
function applyGroupToXfrm(xfrm, g){
  if (!xfrm) return;
  const off = kid(xfrm, 'a:off'), ext = kid(xfrm, 'a:ext');
  if (!off || !ext) return;
  const scaleX = g.chExtW ? g.extW / g.chExtW : 1;
  const scaleY = g.chExtH ? g.extH / g.chExtH : 1;
  const childX = intAttr(off, 'x', 0), childY = intAttr(off, 'y', 0);
  const childW = intAttr(ext, 'cx', 0), childH = intAttr(ext, 'cy', 0);
  off.setAttribute('x', Math.round(g.offX + (childX - g.chOffX) * scaleX));
  off.setAttribute('y', Math.round(g.offY + (childY - g.chOffY) * scaleY));
  ext.setAttribute('cx', Math.round(childW * scaleX));
  ext.setAttribute('cy', Math.round(childH * scaleY));
  if (g.rot) xfrm.setAttribute('rot', String(intAttr(xfrm, 'rot', 0) + g.rot));
}

const SHAPE_TAGS = ['p:sp','p:pic','p:graphicFrame','p:cxnSp'];
function cNvPrOf(node){
  for (const c of node.children){ const cnv = kid(c, 'p:cNvPr'); if (cnv) return cnv; }
  return null;
}
// Recursively flattens any nesting depth of p:grpSp into one flat,
// document-ordered list — each descendant comes out with slide-absolute
// coordinates already baked in. Every leaf remembers the ids of the groups
// around it (`__grpIds`: an animation can target a whole group) and its
// nearest group's properties (`__grpSpPr`, for a:grpFill). mc:AlternateContent
// (newer-feature wrappers) takes its Fallback — the flat rendering every
// consumer is guaranteed to understand.
function flattenGroupedShapes(nodes, grpIds, grpSpPr){
  grpIds = grpIds || [];
  const out = [];
  for (const node of nodes){
    if (node.nodeType !== 1) continue;
    if (node.tagName === 'mc:AlternateContent'){
      const alt = kid(node, 'mc:Fallback') || kid(node, 'mc:Choice');
      if (alt) out.push(...flattenGroupedShapes(Array.from(alt.children), grpIds, grpSpPr));
      continue;
    }
    if (node.tagName === 'p:grpSp'){
      const cnv = cNvPrOf(node);
      if (cnv && cnv.getAttribute('hidden') === '1') continue;
      const g = extractGroupXfrm(node);
      const children = Array.from(node.children).filter(n =>
        [...SHAPE_TAGS, 'p:grpSp', 'mc:AlternateContent'].includes(n.tagName));
      // layout/master XML is parsed once and reused for every slide — bake
      // the group transform in only the first time, or it compounds
      if (g && !node.__baked) children.forEach(child => applyGroupXfrmToChild(child, g));
      node.__baked = true;
      const gid = cnv ? cnv.getAttribute('id') : null;
      out.push(...flattenGroupedShapes(children, gid ? [...grpIds, gid] : grpIds, kid(node, 'p:grpSpPr') || grpSpPr));
      continue;
    }
    if (SHAPE_TAGS.includes(node.tagName)){
      node.__grpIds = grpIds;
      node.__grpSpPr = grpSpPr || null;
      out.push(node);
    }
  }
  return out;
}

function extractFrame(spEl){ return frameOfXfrm(xfrmElOf(spEl)); }
function frameOfXfrm(xfrm){
  if (!xfrm) return null;
  const off = kid(xfrm, 'a:off');
  const ext = kid(xfrm, 'a:ext');
  if (!off || !ext) return null;
  return {
    x: emuToPx(intAttr(off, 'x', 0)),
    y: emuToPx(intAttr(off, 'y', 0)),
    w: emuToPx(intAttr(ext, 'cx', 0)),
    h: emuToPx(intAttr(ext, 'cy', 0)),
    rotation: rotToDeg(xfrm.getAttribute('rot')),
    flipH: xfrm.getAttribute('flipH') === '1',
    flipV: xfrm.getAttribute('flipV') === '1',
  };
}

function fallbackFrame(phType, slideW, slideH){
  const margin = 64;
  if (phType === 'title' || phType === 'ctrTitle'){
    return { x: margin, y: 48, w: slideW - margin*2, h: 140, rotation: 0 };
  }
  if (phType === 'subTitle'){
    return { x: margin, y: 200, w: slideW - margin*2, h: 80, rotation: 0 };
  }
  return { x: margin, y: 200, w: slideW - margin*2, h: Math.max(120, slideH - 260), rotation: 0 };
}

// ---- placeholder inheritance: slide shape → layout placeholder → master placeholder ----
function phOf(node){
  for (const c of node.children){
    const nv = kid(c, 'p:nvPr');
    if (nv) return kid(nv, 'p:ph');
  }
  return null;
}
const normPhType = t => (!t || t === 'body' || t === 'obj') ? 'body' : (t === 'ctrTitle' ? 'title' : t);
function phCandidates(root){
  if (!root) return [];
  if (!root.__phc){
    root.__phc = Array.from(root.getElementsByTagName('*'))
      .filter(e => e.tagName === 'p:sp' || e.tagName === 'p:pic' || e.tagName === 'p:graphicFrame')
      .map(el => ({ el, ph: phOf(el) }))
      .filter(c => c.ph);
  }
  return root.__phc;
}
function matchPh(root, want){
  const cands = phCandidates(root);
  const idx = want.getAttribute('idx') || '0';
  for (const c of cands) if ((c.ph.getAttribute('idx') || '0') === idx) return c;
  const t = normPhType(want.getAttribute('type'));
  for (const c of cands) if (normPhType(c.ph.getAttribute('type')) === t) return c;
  return null;
}
// The shape itself, then the layout's matching placeholder, then the
// master's (matched against the LAYOUT's ph when found — that is where the
// type actually lives).
function chainFor(node, ctx){
  if (node.__chain) return node.__chain;
  const own = phOf(node);
  const out = [{ el: node, ph: own }];
  if (own && ctx.layer === 'slide'){
    let want = own;
    const l = ctx.layoutRoot ? matchPh(ctx.layoutRoot, want) : null;
    if (l){ out.push(l); want = l.ph; }
    const m = ctx.masterRoot ? matchPh(ctx.masterRoot, want) : null;
    if (m) out.push(m);
  }
  node.__chain = out;
  return out;
}
function effectivePhType(node, ctx){
  const chain = chainFor(node, ctx);
  if (!chain[0].ph) return '';
  for (const c of chain){ const t = c.ph && c.ph.getAttribute('type'); if (t) return t; }
  return 'body';
}
function frameFromChain(node, ctx){
  for (const c of chainFor(node, ctx)){ const f = extractFrame(c.el); if (f && (f.w || f.h)) return f; }
  return null;
}

// Where a paragraph's defaults come from, nearest first: the shape's own
// a:lstStyle, its p:style fontRef colour, the layout's and master's
// matching placeholder lstStyles, then the master's p:txStyles
// (titleStyle / bodyStyle / otherStyle) — or, for ordinary text boxes, the
// presentation's defaultTextStyle. Each property takes the FIRST source
// that speaks; levels never borrow from other levels.
function textSources(node, ctx, lvl, phType){
  const name = 'a:lvl' + (Math.min(Math.max(lvl, 0), 8) + 1) + 'pPr';
  const out = [];
  const lvlOf = root => { const p = root ? kid(root, name) : null; if (p) out.push({ pPr: p }); };
  chainFor(node, ctx).forEach((c, i) => {
    const tb = kid(c.el, 'p:txBody');
    lvlOf(tb ? kid(tb, 'a:lstStyle') : null);
    if (i === 0){
      const fr = styleRef(node, 'a:fontRef');
      const col = fr ? colorIn(fr, ctx.pal, null) : null;
      if (col) out.push({ color: col });
      if (fr && fr.getAttribute('idx')) out.push({ fontIdx: fr.getAttribute('idx') });
    }
  });
  const styles = ctx.masterRoot ? first(ctx.masterRoot, 'p:txStyles') : null;
  const table = phType === 'title' || phType === 'ctrTitle' ? 'p:titleStyle'
    : (!phType || ['dt','ftr','sldNum','hdr'].includes(phType)) ? 'p:otherStyle' : 'p:bodyStyle';
  if (!phType) lvlOf(ctx.defaultTextStyle);
  lvlOf(styles ? kid(styles, table) : null);
  return out;
}

const WINGDINGS = { 'l':'●', 'n':'■', 'q':'❑', 'u':'◆', 'v':'❖', 'w':'⬥', 'Ø':'➢', 'ü':'✔', '§':'▪', 'Ÿ':'•', 'o':'○', 'p':'□', 'à':'➔', 'è':'➜', 'ð':'⇨', 'ß':'⇦', 'F':'☞', 'J':'☺', 'L':'☹', '¨':'◻', 'm':'❍', 'r':'❒', 's':'⬧', 't':'⧫', 'x':'⌧' };
// Symbol-font code points (legacy decks type ≥, ±, →, Greek … through the
// Symbol font, often as private-use U+F0xx) → real Unicode.
const SYMBOL_FONT = {
  0x22:'∀', 0x24:'∃', 0x27:'∋', 0x2A:'∗', 0x2D:'−', 0x40:'≅', 0x5E:'⊥', 0x60:'‾',
  0xA1:'ϒ', 0xA2:'′', 0xA3:'≤', 0xA4:'⁄', 0xA5:'∞', 0xA6:'ƒ', 0xA7:'♣', 0xA8:'♦', 0xA9:'♥', 0xAA:'♠',
  0xAB:'↔', 0xAC:'←', 0xAD:'↑', 0xAE:'→', 0xAF:'↓', 0xB0:'°', 0xB1:'±', 0xB2:'″', 0xB3:'≥', 0xB4:'×',
  0xB5:'∝', 0xB6:'∂', 0xB7:'•', 0xB8:'÷', 0xB9:'≠', 0xBA:'≡', 0xBB:'≈', 0xBC:'…', 0xC4:'⊗', 0xC5:'⊕',
  0xC6:'∅', 0xC7:'∩', 0xC8:'∪', 0xC9:'⊃', 0xCA:'⊇', 0xCB:'⊄', 0xCC:'⊂', 0xCD:'⊆', 0xCE:'∈', 0xCF:'∉',
  0xD0:'∠', 0xD1:'∇', 0xD5:'∏', 0xD6:'√', 0xD7:'⋅', 0xD8:'¬', 0xD9:'∧', 0xDA:'∨', 0xDB:'⇔', 0xDC:'⇐',
  0xDD:'⇑', 0xDE:'⇒', 0xDF:'⇓', 0xE0:'◊', 0xE5:'∑', 0xF2:'∫',
};
const GREEK = 'ΑΒΧΔΕΦΓΗΙϑΚΛΜΝΟΠΘΡΣΤΥςΩΞΨΖ', greek = 'αβχδεφγηιϕκλμνοπθρστυϖωξψζ';
function symbolChar(ch, font){
  const code = ch.charCodeAt(0);
  const pua = code >= 0xF020 && code <= 0xF0FF;
  if (!pua && !/^symbol$|wingdings/i.test(font || '')) return ch;
  const c = pua ? code - 0xF000 : code;
  if (/wingdings/i.test(font || '')) return WINGDINGS[String.fromCharCode(c)] || (pua ? '•' : ch);
  if (SYMBOL_FONT[c]) return SYMBOL_FONT[c];
  if (c >= 0x41 && c <= 0x5A) return GREEK[c - 0x41];
  if (c >= 0x61 && c <= 0x7A) return greek[c - 0x61];
  return String.fromCharCode(c);
}
function bulletText(bu, counter){
  if (!bu || bu.kind === 'none') return '';
  if (bu.kind === 'char'){
    const ch = bu.char || '•';
    return (/wingdings|symbol/i.test(bu.font || '') ? (WINGDINGS[ch] || '•') : ch);
  }
  const n = counter;
  const scheme = bu.scheme || 'arabicPeriod';
  const alpha = k => { let s = ''; k--; do { s = String.fromCharCode(97 + (k % 26)) + s; k = Math.floor(k / 26) - 1; } while (k >= 0); return s; };
  const roman = k => { const t = [[1000,'m'],[900,'cm'],[500,'d'],[400,'cd'],[100,'c'],[90,'xc'],[50,'l'],[40,'xl'],[10,'x'],[9,'ix'],[5,'v'],[4,'iv'],[1,'i']]; let s = ''; for (const [v, r] of t) while (k >= v){ s += r; k -= v; } return s; };
  let core = /^alphaLc/.test(scheme) ? alpha(n) : /^alphaUc/.test(scheme) ? alpha(n).toUpperCase()
    : /^romanLc/.test(scheme) ? roman(n) : /^romanUc/.test(scheme) ? roman(n).toUpperCase() : String(n);
  if (/ParenBoth$/.test(scheme)) return '(' + core + ')';
  if (/ParenR$/.test(scheme)) return core + ')';
  if (/Plain$/.test(scheme)) return core;
  return core + '.';
}
function bulletOf(pPr){
  if (!pPr) return null;
  if (kid(pPr, 'a:buNone')) return { kind: 'none' };
  const auto = kid(pPr, 'a:buAutoNum');
  if (auto) return { kind: 'auto', scheme: auto.getAttribute('type') || 'arabicPeriod', start: intAttr(auto, 'startAt', 1) };
  const ch = kid(pPr, 'a:buChar');
  if (ch){ const bf = kid(pPr, 'a:buFont'); return { kind: 'char', char: ch.getAttribute('char') || '•', font: bf ? bf.getAttribute('typeface') : '' }; }
  return null;
}

// Text body → paragraphs of inline html + the box's dominant style. bento
// carries ONE style per text element, so the style that covers the most
// characters becomes the box's; runs that deviate keep their own colour /
// size / font as an inline <span style> (the editor's own partial-selection
// formatting, so it round-trips through its sanitizer). Bullets become
// literal characters (the text model has no list type).
//   opts: { sources(lvl) → [{pPr}|{color}], fallbackColor, fonts, pal, rels, scale }
function extractTextBody(txBody, opts){
  const paras = kids(txBody, 'a:p');
  if (!paras.length) return null;
  const bodyPr = kid(txBody, 'a:bodyPr');
  const autofit = bodyPr ? kid(bodyPr, 'a:normAutofit') : null;
  const scale = (autofit ? intAttr(autofit, 'fontScale', 100000) / 100000 : 1) * (opts.scale || 1);
  const counters = [];
  const out = [];
  const allRuns = [];
  let algnFirst = null, lnFirst = null, any = false;

  for (const p of paras){
    const pPr = kid(p, 'a:pPr');
    const lvl = intAttr(pPr, 'lvl', 0);
    const srcs = opts.sources(lvl);
    const fromSrc = get => { for (const s of srcs) if (s.pPr){ const v = get(s.pPr); if (v != null) return v; } return null; };
    const defR = pp => kid(pp, 'a:defRPr');
    const algnRaw = (pPr && pPr.getAttribute('algn')) || fromSrc(pp => pp.getAttribute('algn'));
    const lnSpcEl = (pPr && kid(pPr, 'a:lnSpc')) || fromSrc(pp => kid(pp, 'a:lnSpc'));
    const pct = lnSpcEl ? kid(lnSpcEl, 'a:spcPct') : null;

    const runs = [];
    for (const r of p.children){
      if (r.tagName === 'a:br'){ runs.push({ br: true }); continue; }
      if (r.tagName !== 'a:r' && r.tagName !== 'a:fld') continue;
      const tEl = kid(r, 'a:t');
      let text = tEl ? tEl.textContent : '';
      if (!text) continue;
      const rPr = kid(r, 'a:rPr');
      const attrOf = name => (rPr && rPr.getAttribute(name)) || fromSrc(pp => { const d = defR(pp); return d ? d.getAttribute(name) : null; });
      const sz = parseInt(attrOf('sz') || '1800', 10);
      const hl = rPr ? kid(rPr, 'a:hlinkClick') : null;
      let color = rPr ? colorIn(kid(rPr, 'a:solidFill'), opts.pal, null) : null;
      if (!color && hl && opts.pal.colors.hlink) color = { rgb: hexToRgb(opts.pal.colors.hlink), a: 1 };
      if (!color) for (const s of srcs){
        if (s.color){ color = s.color; break; }
        const d = s.pPr ? defR(s.pPr) : null;
        const c = d ? colorIn(kid(d, 'a:solidFill'), opts.pal, null) : null;
        if (c){ color = c; break; }
      }
      const latin = (rPr && kid(rPr, 'a:latin')) || fromSrc(pp => { const d = defR(pp); return d ? kid(d, 'a:latin') : null; });
      const fontIdx = srcs.find(s => s.fontIdx);
      const rawFace = latin ? latin.getAttribute('typeface') : (fontIdx && fontIdx.fontIdx === 'major' ? '+mj-lt' : null);
      const font = resolveFontFamily(rawFace, opts.fonts) || opts.fonts.minor || null;
      const fldType = r.tagName === 'a:fld' ? (r.getAttribute('type') || '') : '';
      if (fldType === 'slidenum') text = '{{page}}';
      else if (/^datetime/.test(fldType)) text = '{{date}}';
      let href = null;
      if (hl && opts.rels){ const tgt = opts.rels[hl.getAttribute('r:id')]; if (tgt && /^https?:\/\//i.test(tgt)) href = tgt; }
      const run = {
        text, href,
        size: Math.max(1, ptToPx(sz / 100 * scale)),
        color: clrCss(color) || opts.fallbackColor,
        font,
        bold: attrOf('b') === '1' || attrOf('b') === 'true',
        italic: attrOf('i') === '1' || attrOf('i') === 'true',
        underline: (attrOf('u') || 'none') !== 'none',
        strike: (attrOf('strike') || 'noStrike') !== 'noStrike',
      };
      runs.push(run);
      allRuns.push(run);
    }
    const plain = runs.map(r => r.br ? '\n' : r.text).join('');
    let bullet = '';
    if (plain.trim()){
      any = true;
      if (algnFirst === null) algnFirst = algnRaw || 'l';
      if (lnFirst === null && pct) lnFirst = intAttr(pct, 'val', 100000) / 100000;
      const bu = bulletOf(pPr) || fromSrc(bulletOf);
      counters.length = lvl + 1;
      if (bu && bu.kind === 'auto'){ counters[lvl] = (counters[lvl] || (bu.start - 1)) + 1; }
      else counters[lvl] = 0;
      bullet = bulletText(bu, counters[lvl]);
    }
    out.push({ runs, plain, bullet, lvl });
  }
  if (!any) return null;
  return assembleTextInfo(out, allRuns, algnFirst, lnFirst);
}

// Paragraphs of runs → the box's dominant style + inline html. Shared by
// the PPTX (DrawingML) and the legacy .ppt text readers.
//   out: [{ runs:[{text,href,size,color,font,bold,italic,underline,strike}|{br}], plain, bullet, lvl }]
//   algnFirst: DrawingML alignment key ('l'|'ctr'|'r'|'just') · lnFirst: line spacing factor (1 = single)
function assembleTextInfo(out, allRuns, algnFirst, lnFirst){
  // dominant style = the one covering the most characters
  const weight = new Map();
  for (const r of allRuns){
    const k = [r.size, r.color, r.font, r.bold ? 1 : 0].join('|');
    weight.set(k, (weight.get(k) || 0) + r.text.length);
  }
  let best = null, bestW = -1;
  for (const [k, w] of weight) if (w > bestW){ best = k; bestW = w; }
  const [dSize, dColor, dFont, dBold] = best.split('|');
  const style = {
    fontSize: parseInt(dSize, 10), color: dColor, fontFamily: dFont || null, bold: dBold === '1',
    align: algnFirst === 'ctr' ? 'center' : algnFirst === 'r' ? 'right' : algnFirst === 'just' || algnFirst === 'dist' ? 'justify' : 'left',
    lineHeight: lnFirst ? Math.round(Math.max(0.8, Math.min(3, lnFirst * 1.2)) * 100) / 100 : 1.2,
  };
  const safeFont = f => /^[a-zA-Z0-9 ,'"-]+$/.test(f || '');
  const htmlParas = out.map(p => {
    let line = '';
    for (const r of p.runs){
      if (r.br){ line += '<br>'; continue; }
      let seg = esc(r.text);
      if (r.bold && !style.bold) seg = '<b>' + seg + '</b>';
      if (r.italic) seg = '<i>' + seg + '</i>';
      if (r.underline) seg = '<u>' + seg + '</u>';
      if (r.strike) seg = '<s>' + seg + '</s>';
      const css = [];
      if (r.color && r.color !== style.color) css.push('color:' + r.color);
      if (r.size !== style.fontSize) css.push('font-size:' + r.size + 'px');
      if (r.font && r.font !== style.fontFamily && safeFont(r.font)) css.push('font-family:' + r.font);
      if (!r.bold && style.bold) css.push('font-weight:normal');
      if (css.length) seg = '<span style="' + css.join(';') + '">' + seg + '</span>';
      if (r.href) seg = '<a href="' + esc(r.href).replace(/"/g, '&quot;') + '">' + seg + '</a>';
      line += seg;
    }
    if (p.bullet) line = ' '.repeat(p.lvl * 4) + esc(p.bullet) + ' ' + line;
    return { html: line, plain: p.plain, bullet: p.bullet };
  });
  // Leading/trailing EMPTY paragraphs are spacing PowerPoint sizes by their
  // end-of-paragraph mark (often tiny); at the box's full size they push the
  // real text out of its frame. The paragraph list itself stays complete —
  // animation paragraph indices count them.
  let a = 0, b = htmlParas.length - 1;
  while (a < b && !htmlParas[a].plain.trim()) a++;
  while (b > a && !htmlParas[b].plain.trim()) b--;
  // Same for line breaks typed before/after the text (a spacing hack).
  const html = htmlParas.slice(a, b + 1).map(p => p.html).join('<br>').replace(/^(<br>)+|(<br>)+$/g, '');
  return { paras: htmlParas, html, style };
}

// bodyPr insets (per attribute, walked up the chain) and vertical anchor.
// Defaults per OOXML: 91440 EMU left/right, 45720 top/bottom — ignoring them
// makes every box ~19px wider than PowerPoint's, which moves every wrap point.
function bodyLayout(node, ctx){
  const bodies = chainFor(node, ctx).map(c => { const tb = kid(c.el, 'p:txBody'); return tb ? kid(tb, 'a:bodyPr') : null; }).filter(Boolean);
  const pick = (name, dflt) => { for (const b of bodies){ const v = b.getAttribute(name); if (v != null) return v; } return dflt; };
  const anchor = pick('anchor', 't');
  return {
    l: emuToPx(parseInt(pick('lIns', '91440'), 10)), r: emuToPx(parseInt(pick('rIns', '91440'), 10)),
    t: emuToPx(parseInt(pick('tIns', '45720'), 10)), b: emuToPx(parseInt(pick('bIns', '45720'), 10)),
    valign: anchor === 'ctr' ? 'middle' : anchor === 'b' ? 'bottom' : 'top',
  };
}

const GEOM_MAP = {
  ellipse: 'ellipse', flowChartConnector: 'ellipse',
  triangle: 'triangle',
  roundRect: 'rect', rect: 'rect', flowChartProcess: 'rect', flowChartAlternateProcess: 'rect',
  snip1Rect: 'rect', round1Rect: 'rect', round2SameRect: 'rect',
  rightArrow: 'arrow', leftArrow: 'arrow', upArrow: 'arrow', downArrow: 'arrow',
  chevron: 'arrow', homePlate: 'arrow',
  diamond: 'polygon', flowChartDecision: 'polygon', pentagon: 'polygon', hexagon: 'polygon',
  heptagon: 'polygon', octagon: 'polygon', decagon: 'polygon', dodecagon: 'polygon',
};
const POLYGON_SIDES = { diamond: 4, flowChartDecision: 4, pentagon: 5, hexagon: 6, heptagon: 7, octagon: 8, decagon: 10, dodecagon: 12 };
const LINE_GEOMS = /^(line|straightConnector1|bentConnector[2-5]|curvedConnector[2-5])$/;
// Extra rotation (degrees, added to the shape's own rotation) and whether
// w/h need swapping first: bento's arrow always points right.
const ARROW_ORIENTATION = {
  rightArrow: { extraRotation: 0, swapWH: false },
  leftArrow: { extraRotation: 180, swapWH: false },
  upArrow: { extraRotation: 270, swapWH: true },
  downArrow: { extraRotation: 90, swapWH: true },
  chevron: { extraRotation: 0, swapWH: false },
  homePlate: { extraRotation: 0, swapWH: false },
  // bento's polygons start at a top vertex; PowerPoint's hexagon has flat
  // top and bottom edges
  hexagon: { extraRotation: 90, swapWH: true },
};

function resolvePartPath(dir, target){
  if (!target) return null;
  if (target.charAt(0) === '/') return target.slice(1);
  const stack = [];
  for (const part of (dir + '/' + target).split('/')){
    if (part === '..') stack.pop();
    else if (part === '.' || part === '') continue;
    else stack.push(part);
  }
  return stack.join('/');
}

async function loadImageAsset(zip, embedId, relsMap, slideDir, assets, assetCounter, pathToKey){
  const target = relsMap[embedId];
  if (!target || /^https?:/i.test(target)) return null;
  const path = resolvePartPath(slideDir, target);
  // Same underlying file already loaded once (a logo/background reused
  // across several slides is common) — reuse the existing key.
  if (pathToKey.has(path)) return pathToKey.get(path);
  const file = zip.file(path);
  if (!file) return null;
  const ext = (path.split('.').pop()||'png').toLowerCase();
  const mimeMap = { png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', gif:'image/gif', bmp:'image/bmp', svg:'image/svg+xml', webp:'image/webp', tif:'image/tiff', tiff:'image/tiff' };
  const mime = mimeMap[ext];
  if (!mime) return null; // WMF/EMF and other legacy vector formats — skip embedding
  const base64 = await file.async('base64');
  const key = 'img' + (assetCounter.n++);
  assets[key] = 'data:'+mime+';base64,'+base64;
  pathToKey.set(path, key);
  return key;
}

function parseRels(relsXmlText){
  const map = {};
  if (!relsXmlText) return map;
  const doc = parseXml(relsXmlText);
  for (const r of Array.from(doc.getElementsByTagName('Relationship'))){
    map[r.getAttribute('Id')] = r.getAttribute('Target');
  }
  // Non-enumerable, so callers iterating the plain id→target map never see it.
  Object.defineProperty(map, '__types', { value: Object.fromEntries(Array.from(doc.getElementsByTagName('Relationship')).map(r => [r.getAttribute('Id'), r.getAttribute('Type') || ''])) });
  return map;
}
function relOfType(rels, suffix){
  const types = rels.__types || {};
  for (const id of Object.keys(types)) if (types[id].endsWith(suffix)) return rels[id];
  return null;
}

// ---- charts (ppt/charts/chartN.xml → bento chart option) ----
// The chart part carries a CACHE of its data beside every reference into the
// embedded workbook (c:strCache / c:numCache) — exactly what PowerPoint
// itself draws from, so the workbook never needs opening.
function chartCache(el){
  if (!el) return null;
  for (const tag of ['c:strCache','c:numCache','c:strLit','c:numLit','c:multiLvlStrCache']){
    const c = first(el, tag);
    if (!c) continue;
    const src = tag === 'c:multiLvlStrCache' ? (kid(c, 'c:lvl') || c) : c;
    const count = intAttr(kid(c, 'c:ptCount'), 'val', 0);
    const pts = kids(src, 'c:pt');
    const n = Math.max(count, ...pts.map(p => intAttr(p, 'idx', 0) + 1), 0);
    const vals = new Array(n).fill(null);
    for (const p of pts){ const v = kid(p, 'c:v'); vals[intAttr(p, 'idx', 0)] = v ? v.textContent : null; }
    const fc = kid(c, 'c:formatCode');
    return { vals, format: fc ? fc.textContent : '' };
  }
  const v = kid(el, 'c:v');
  return v ? { vals: [v.textContent], format: '' } : null;
}
function richText(el){
  if (!el) return '';
  return all(el, 'a:p').map(p => all(p, 'a:t').map(t => t.textContent).join('')).filter(Boolean).join(' ').trim();
}
const CHART_GROUPS = {
  'c:barChart': 'bar', 'c:bar3DChart': 'bar', 'c:lineChart': 'line', 'c:line3DChart': 'line',
  'c:areaChart': 'area', 'c:area3DChart': 'area', 'c:radarChart': 'line', 'c:stockChart': 'line',
  'c:pieChart': 'pie', 'c:pie3DChart': 'pie', 'c:doughnutChart': 'doughnut', 'c:ofPieChart': 'pie',
  'c:scatterChart': 'scatter', 'c:bubbleChart': 'scatter',
};
function convertChartXml(chartDoc, pal, warn){
  const chart = first(chartDoc, 'c:chart');
  const plot = chart ? kid(chart, 'c:plotArea') : null;
  if (!plot) return null;
  const accents = ['accent1','accent2','accent3','accent4','accent5','accent6'].map(k => pal.colors[k]).filter(Boolean);
  const groups = kids(plot).filter(g => CHART_GROUPS[g.tagName]);
  if (!groups.length) return null;
  const valAxes = kids(plot, 'c:valAx');
  const primaryAx = groups[0] ? kids(groups[0], 'c:axId').map(a => a.getAttribute('val')) : [];
  let categories = null, pct = false, isPie = false, pieSeries = null, pieColors = null, scatter = false;
  const series = [];
  let si = 0;
  for (const g of groups){
    const kind = CHART_GROUPS[g.tagName];
    const barDir = kid(g, 'c:barDir');
    if (barDir && barDir.getAttribute('val') === 'bar') warn('Liegende Balkendiagramme werden als Säulen dargestellt.');
    const grouping = kid(g, 'c:grouping');
    if (grouping && /stacked/i.test(grouping.getAttribute('val') || '')) warn('Gestapelte Diagramme werden nebeneinander dargestellt (Stapeln kennt Bento nicht).');
    const secondary = groups.length > 1 && g !== groups[0] && valAxes.length > 1
      && kids(g, 'c:axId').some(a => !primaryAx.includes(a.getAttribute('val')));
    for (const ser of kids(g, 'c:ser')){
      const nameCache = chartCache(kid(ser, 'c:tx'));
      const name = (nameCache && nameCache.vals.filter(Boolean).join(' ')) || ('Reihe ' + (si + 1));
      const valEl = kid(ser, 'c:val') || kid(ser, 'c:yVal');
      const valCache = chartCache(valEl);
      if (!valCache) continue;
      if (/%/.test(valCache.format)) pct = true;
      const nums = valCache.vals.map(v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; });
      const catCache = chartCache(kid(ser, 'c:cat') || kid(ser, 'c:xVal'));
      if (!categories && catCache && kind !== 'scatter') categories = catCache.vals.map(v => v == null ? '' : String(v));
      const spPr = kid(ser, 'c:spPr');
      const isLine = kind === 'line' || kind === 'scatter';
      const f = isLine ? (fillOf(kid(spPr, 'a:ln'), pal, null) || fillOf(spPr, pal, null)) : (fillOf(spPr, pal, null) || fillOf(kid(spPr, 'a:ln'), pal, null));
      const color = (f && f.color) ? clrCss(f.color) : accents[si % Math.max(1, accents.length)] || null;
      if (kind === 'pie' || kind === 'doughnut'){
        if (!pieSeries){
          isPie = true;
          const labels = (catCache ? catCache.vals : nums.map((_, j) => String(j + 1))).map(v => v == null ? '' : String(v));
          pieColors = nums.map((_, j) => accents[j % Math.max(1, accents.length)]);
          for (const dPt of kids(ser, 'c:dPt')){
            const pf = fillOf(kid(dPt, 'c:spPr'), pal, null);
            if (pf && pf.color) pieColors[intAttr(kid(dPt, 'c:idx'), 'val', 0)] = clrCss(pf.color);
          }
          const hole = intAttr(kid(g, 'c:holeSize'), 'val', 50);
          pieSeries = {
            type: 'pie', name,
            radius: kind === 'doughnut' ? [Math.round(hole * 0.7) + '%', '70%'] : '70%',
            label: { formatter: '{b}: {d}%' },
            data: labels.map((l, j) => ({ name: l, value: Math.max(0, nums[j] || 0) })),
          };
        }
        si++;
        continue;
      }
      if (kind === 'scatter'){
        scatter = true;
        const xs = catCache ? catCache.vals.map(v => parseFloat(v) || 0) : nums.map((_, j) => j + 1);
        series.push({ type: 'scatter', name, symbolSize: 10, itemStyle: color ? { color } : undefined, data: nums.map((y, j) => [xs[j] || 0, y]) });
        si++;
        continue;
      }
      const s = { type: kind === 'area' ? 'line' : kind, name, data: nums };
      if (kind === 'bar'){ if (color) s.itemStyle = { color }; }
      else {
        if (color){ s.lineStyle = { color }; s.itemStyle = { color }; }
        if (kind === 'area') s.areaStyle = {};
        const sm = kid(ser, 'c:smooth');
        if (sm && sm.getAttribute('val') !== '0') s.smooth = true;
      }
      if (secondary) s.yAxisIndex = 1;
      series.push(s);
      si++;
    }
  }
  if (pct){
    const up = v => Math.round(v * 100 * 10000) / 10000;
    series.forEach(s => { s.data = s.data.map(v => Array.isArray(v) ? [v[0], up(v[1])] : up(v)); });
    if (pieSeries) pieSeries.data.forEach(d => { d.value = up(d.value); });
  }
  const legendEl = kid(chart, 'c:legend');
  const legendPosEl = legendEl ? kid(legendEl, 'c:legendPos') : null;
  const legendPos = legendPosEl ? legendPosEl.getAttribute('val') : 'r';
  const legend = legendEl ? (legendPos === 't' ? { top: 0 } : { bottom: 0 }) : null;
  const titleEl = kid(chart, 'c:title');
  const autoDel = kid(chart, 'c:autoTitleDeleted');
  let title = titleEl ? richText(kid(titleEl, 'c:tx')) : '';
  if (!title && titleEl && !(autoDel && autoDel.getAttribute('val') === '1')){
    const only = isPie ? pieSeries : (series.length === 1 ? series[0] : null);
    if (only) title = only.name;
  }

  let option;
  if (isPie){
    option = { tooltip: { trigger: 'item' }, color: pieColors, series: [pieSeries] };
    if (legend) option.legend = legend;
  } else {
    if (!series.length) return null;
    const axisOf = ax => {
      const a = { type: 'value' };
      const sc = ax ? kid(ax, 'c:scaling') : null;
      const mn = sc ? kid(sc, 'c:min') : null, mx = sc ? kid(sc, 'c:max') : null;
      const k = pct ? 100 : 1;
      if (mn) a.min = parseFloat(mn.getAttribute('val')) * k;
      if (mx) a.max = parseFloat(mx.getAttribute('val')) * k;
      if (pct) a.axisLabel = { formatter: '{value}%' };
      return a;
    };
    const twoAxes = series.some(s => s.yAxisIndex === 1);
    const primaryVal = valAxes.find(a => primaryAx.includes(intAttr(kid(a, 'c:axId'), 'val', -1) + '')) || valAxes[0];
    const secondVal = valAxes.find(a => a !== primaryVal);
    option = {
      tooltip: { trigger: scatter ? 'item' : 'axis' },
      grid: { left: 56, right: twoAxes ? 56 : 20, top: 24, bottom: legend && !legend.top ? 56 : 40 },
      xAxis: scatter ? { type: 'value' } : { type: 'category', data: categories || series[0].data.map((_, j) => String(j + 1)) },
      yAxis: twoAxes ? [axisOf(primaryVal), axisOf(secondVal)] : axisOf(primaryVal),
      color: series.map((s, j) => (s.itemStyle && s.itemStyle.color) || accents[j % Math.max(1, accents.length)]).filter(Boolean),
      series: series.map(s => { if (!s.itemStyle) delete s.itemStyle; return s; }),
    };
    if (legend) option.legend = legend;
  }
  if (!option.color || !option.color.length) delete option.color;
  const hasTable = !!kid(plot, 'c:dTable') && !isPie && !scatter;
  return {
    option, title, preset: isPie ? 'pie' : scatter ? 'scatter' : (series[0].type === 'line' ? 'line' : 'bar'),
    table: hasTable ? { categories: option.xAxis.data, series: series.map(s => ({ name: s.name, data: s.data })) } : null,
  };
}

// ---- tables (a:tbl → bento table) ----
function modHex(hex, mods){
  let c = { rgb: hexToRgb(hex), a: 1 };
  for (const [kind, f] of mods){
    if (kind === 'tint') c.rgb = c.rgb.map(v => linToSrgb(srgbToLin(v) * f + (1 - f)));
  }
  return clrCss(c);
}
// Table style part (wholeTbl / firstRow / band1H / …) → { fill, color, bold }.
// Styles PowerPoint only references by GUID without writing them into
// tableStyles.xml fall back to "Medium Style 2 – Accent 1", the default
// every new PowerPoint table gets (accent header, tinted bands, white rules).
function tableStylePart(styleEl, name, ctx){
  if (styleEl){
    const part = kid(styleEl, 'a:' + name);
    if (!part) return null;
    const tcStyle = kid(part, 'a:tcStyle');
    const fillWrap = tcStyle ? kid(tcStyle, 'a:fill') : null;
    let fill = fillWrap ? fillOf(fillWrap, ctx.pal, null) : null;
    if (!fill && tcStyle && kid(tcStyle, 'a:fillRef')) fill = themeFillRef(kid(tcStyle, 'a:fillRef'), ctx.theme, ctx.pal);
    const tx = kid(part, 'a:tcTxStyle');
    const col = tx ? colorIn(tx, ctx.pal, null) : null;
    return {
      fill: fill && fill.kind !== 'none' && fill.color ? clrCss(fill.color) : (fill && fill.kind === 'none' ? 'transparent' : null),
      color: col ? clrCss(col) : null,
      bold: tx ? tx.getAttribute('b') === 'on' : false,
    };
  }
  const acc = ctx.pal.colors.accent1 || '#4472C4';
  const lt = ctx.pal.colors[ctx.pal.map.bg1 || 'lt1'] || '#FFFFFF';
  const dk = ctx.pal.colors[ctx.pal.map.tx1 || 'dk1'] || '#000000';
  if (name === 'wholeTbl') return { fill: modHex(acc, [['tint', 0.2]]), color: dk, bold: false };
  if (name === 'band1H') return { fill: modHex(acc, [['tint', 0.4]]), color: null, bold: false };
  if (name === 'firstRow' || name === 'lastRow') return { fill: acc, color: lt, bold: true };
  if (name === 'firstCol' || name === 'lastCol') return { fill: acc, color: lt, bold: true };
  return null;
}
// The style's inner rules (wholeTbl → tcBdr → insideH, else an outer edge).
function styleBorder(styleEl, ctx){
  const whole = styleEl ? kid(styleEl, 'a:wholeTbl') : null;
  const tcStyle = whole ? kid(whole, 'a:tcStyle') : null;
  const bdr = tcStyle ? kid(tcStyle, 'a:tcBdr') : null;
  if (!bdr) return null;
  for (const edge of ['a:insideH', 'a:bottom', 'a:top', 'a:left']){
    const e = kid(bdr, edge);
    const ln = e ? kid(e, 'a:ln') : null;
    const f = ln ? fillOf(ln, ctx.pal, null) : null;
    if (f && f.color) return { color: clrCss(f.color), width: Math.max(1, emuToPx(intAttr(ln, 'w', 12700))) };
  }
  return null;
}
function convertTableXml(tbl, frame, ctx, elId){
  const tblPr = kid(tbl, 'a:tblPr');
  const flag = n => !!tblPr && (tblPr.getAttribute(n) === '1' || tblPr.getAttribute(n) === 'true');
  const styleIdEl = tblPr ? kid(tblPr, 'a:tableStyleId') : null;
  const styleId = styleIdEl ? styleIdEl.textContent.trim() : '';
  const styleEl = styleId ? (ctx.tableStyles[styleId] || null) : null;
  const useBuiltin = !!styleId && !styleEl;
  const part = name => (styleEl || useBuiltin) ? tableStylePart(styleEl, name, ctx) : null;
  const whole = part('wholeTbl'), headP = flag('firstRow') ? part('firstRow') : null;
  const band = flag('bandRow') ? part('band1H') : null;
  const lastP = flag('lastRow') ? part('lastRow') : null;
  const firstColP = flag('firstCol') ? part('firstCol') : null;
  const ink = roleColor(ctx.pal, 'tx1') || '#000000';

  const gridCols = kids(kid(tbl, 'a:tblGrid'), 'a:gridCol').map(g => intAttr(g, 'w', 1));
  const total = gridCols.reduce((a, b) => a + b, 0) || 1;
  const trs = kids(tbl, 'a:tr');
  const nCols = Math.max(gridCols.length, ...trs.map(tr => kids(tr, 'a:tc').length));
  const sizes = new Map();
  const lt = roleColor(ctx.pal, 'bg1') || '#FFFFFF';
  const bodyColor = (whole && whole.color) || ink;
  // a style without a firstRow part (e.g. "No Style, Table Grid") keeps the
  // header in body ink — only the built-in fallback has a coloured header
  const headColor = (headP && headP.color) || (useBuiltin ? lt : bodyColor);
  let padX = 10, padY = 5, border = styleBorder(styleEl, ctx) || (useBuiltin ? { color: lt, width: 1 } : null);
  const rows = trs.map((tr, r) => {
    const isHead = r === 0 && flag('firstRow');
    const isLast = r === trs.length - 1 && flag('lastRow') && trs.length > 1;
    const cells = kids(tr, 'a:tc').map((tc, c) => {
      const tcPr = kid(tc, 'a:tcPr');
      if (r === 0 && c === 0 && tcPr){
        padX = emuToPx(intAttr(tcPr, 'marL', 91440)); padY = emuToPx(intAttr(tcPr, 'marT', 45720));
        const lnB = kid(tcPr, 'a:lnB');
        const bf = lnB ? fillOf(lnB, ctx.pal, null) : null;
        if (bf && bf.color) border = { color: clrCss(bf.color), width: Math.max(1, emuToPx(intAttr(lnB, 'w', 12700))) };
        else if (bf && bf.kind === 'none' && !border) border = { color: 'transparent', width: 0 };
      }
      const merged = tc.getAttribute('hMerge') === '1' || tc.getAttribute('vMerge') === '1';
      const partHere = isHead ? headP : isLast ? lastP : (c === 0 && firstColP) ? firstColP
        : (band && ((r - (flag('firstRow') ? 1 : 0)) % 2 === 0)) ? band : null;
      const defColor = (partHere && partHere.color) || (isHead ? headColor : bodyColor);
      const own = tcPr ? fillOf(tcPr, ctx.pal, null) : null;
      const bg = own ? (own.kind === 'none' ? 'transparent' : (own.color ? clrCss(own.color) : null))
        : ((partHere && partHere.fill) || (whole && whole.fill) || null);
      const tb = kid(tc, 'a:txBody');
      const info = (!merged && tb) ? extractTextBody(tb, {
        sources: () => [], fallbackColor: defColor, fonts: ctx.fonts, pal: ctx.pal, rels: ctx.rels,
      }) : null;
      const cell = { html: info ? info.html : '' };
      if (info){
        sizes.set(info.style.fontSize, (sizes.get(info.style.fontSize) || 0) + 1);
        if (info.style.color && info.style.color !== (isHead ? headColor : bodyColor)) cell.color = info.style.color;
        if (info.style.bold && !isHead) cell.bold = true;
        if (info.style.align !== 'left' && info.style.align !== 'justify') cell.align = info.style.align;
        cell.__size = info.style.fontSize;
      }
      if (bg && !(isHead && headP && bg === headP.fill)) cell.bg = bg;
      return cell;
    });
    while (cells.length < nCols) cells.push({ html: '' });
    return { cells };
  });
  let fontSize = 24, bestN = -1;
  for (const [sz, n] of sizes) if (n > bestN){ fontSize = sz; bestN = n; }
  rows.forEach(row => row.cells.forEach(cell => {
    if (cell.__size && cell.__size !== fontSize && cell.html) cell.html = '<span style="font-size:' + cell.__size + 'px">' + cell.html + '</span>';
    delete cell.__size;
  }));
  return {
    id: elId, type: 'table',
    x: frame.x, y: frame.y, w: frame.w, h: frame.h, rotation: 0, opacity: 1,
    header: flag('firstRow'),
    columns: (gridCols.length ? gridCols : new Array(nCols).fill(1)).map(w => ({ w: Math.round(w / total * 1000) / 1000 })),
    rows,
    style: {
      headerBg: (headP && headP.fill && headP.fill !== 'transparent') ? headP.fill : 'transparent',
      headerColor: headColor,
      borderColor: border ? border.color : 'rgba(0,0,0,0.18)',
      borderWidth: border ? border.width : 1,
      cellPadX: padX, cellPadY: padY,
      fontSize,
      fontFamily: fontStack(ctx.fonts.minor),
      color: bodyColor,
      radius: 0,
    },
  };
}

// ---- click animations (p:timing main sequence → bento reveal steps) ----
function enterKindFor(presetID, sub){
  if (presetID === 1) return null; // Appear: a plain reveal
  if (presetID === 2 || presetID === 7 || presetID === 12){ // Fly In / Crawl In / Peek In
    if (sub & 4) return 'slide-up';
    if (sub & 1) return 'slide-down';
    if (sub & 8) return 'slide-right';
    if (sub & 2) return 'slide-left';
    return 'slide-up';
  }
  if (presetID === 37 || presetID === 42) return 'fade-up'; // Rise Up / Ascend
  if (presetID === 47) return 'fade-down'; // Descend
  return 'fade';
}
// Every entrance effect of the main sequence, in order: a "on click" effect
// opens the next step, "with/after previous" join the current one (step 0 =
// runs by itself when the slide appears). Paragraph builds (bullet by
// bullet) target a paragraph range of a shape and are kept per paragraph.
function parseTiming(sldRoot){
  const res = { shapes: new Map(), paras: new Map(), dropped: new Set() };
  const timing = kid(sldRoot, 'p:timing');
  if (!timing) return res;
  const mainSeq = Array.from(timing.getElementsByTagName('p:cTn')).find(c => c.getAttribute('nodeType') === 'mainSeq');
  if (!mainSeq) return res;
  let step = 0, order = 0;
  for (const eff of Array.from(mainSeq.getElementsByTagName('p:cTn')).filter(c => c.getAttribute('presetClass'))){
    const nt = eff.getAttribute('nodeType');
    if (nt === 'clickEffect'){ step++; order = 0; }
    else if (nt === 'afterEffect') order++;
    const cls = eff.getAttribute('presetClass');
    if (cls !== 'entr'){ res.dropped.add(cls); continue; }
    const tgt = eff.getElementsByTagName('p:spTgt')[0];
    if (!tgt) continue;
    const spid = tgt.getAttribute('spid');
    let dur = 0;
    for (const c of Array.from(eff.getElementsByTagName('p:cTn'))){ const d = parseInt(c.getAttribute('dur'), 10); if (d > dur) dur = d; }
    const fx = { step, order, enter: enterKindFor(intAttr(eff, 'presetID', 0), intAttr(eff, 'presetSubtype', 0)), dur };
    const pRg = tgt.getElementsByTagName('p:pRg')[0];
    if (pRg){
      let m = res.paras.get(spid);
      if (!m){ m = new Map(); res.paras.set(spid, m); }
      const st = intAttr(pRg, 'st', 0), en = intAttr(pRg, 'end', st);
      for (let k = st; k <= en; k++) if (!m.has(k)) m.set(k, fx);
    } else if (!res.shapes.has(spid)) res.shapes.set(spid, fx);
  }
  return res;
}
function bentoFx(a){
  if (!a) return null;
  const fx = {};
  if (a.step > 0) fx.step = a.step;
  if (a.enter){
    fx.enter = a.enter;
    if (a.dur) fx.enterDur = Math.round(Math.max(0.2, Math.min(3, a.dur / 1000)) * 100) / 100;
  }
  if (a.order && (fx.step || fx.enter)) fx.order = a.order;
  return Object.keys(fx).length ? fx : null;
}

// ---- slide transitions ----
function transitionOf(sldRoot){
  const trs = Array.from(sldRoot.getElementsByTagName('p:transition'));
  if (!trs.length) return 'none';
  // mc:AlternateContent carries the morph in its Choice and a fade in its
  // Fallback: take the morph whenever one is there.
  if (trs.some(t => Array.from(t.children).some(c => c.localName === 'morph'))) return 'morph';
  const kind = trs[0].children[0] ? trs[0].children[0].localName : '';
  if (!kind) return 'none';
  if (kind === 'cut') return 'none';
  if (/^(fade|dissolve)$/.test(kind)) return 'fade';
  if (/^(zoom|newsflash|flythrough|vortex|ripple|warp|glitter|shred|prism|doors|window|honeycomb|flash)$/.test(kind)) return 'zoom';
  if (/^(push|wipe|cover|pull|split|reveal|conveyor|pan|gallery|ferris|switch|flip|uncover|randomBar|strips|blinds|comb|checker|wheel|wedge|circle|diamond|plus)$/.test(kind)) return 'slide';
  return 'fade';
}

// ---- speaker notes ----
function notesTextOf(notesRoot){
  const tree = notesRoot ? first(notesRoot, 'p:spTree') : null;
  if (!tree) return '';
  const out = [];
  for (const sp of kids(tree, 'p:sp')){
    const ph = phOf(sp);
    if (!ph || ph.getAttribute('type') !== 'body') continue;
    const tb = kid(sp, 'p:txBody');
    if (!tb) continue;
    const text = kids(tb, 'a:p').map(p => Array.from(p.children).map(r => r.tagName === 'a:br' ? '\n' : ((kid(r, 'a:t') || {}).textContent || '')).join('')).join('\n').trim();
    if (text) out.push(text);
  }
  return out.join('\n');
}

// ---- element builders ----
const rnd = v => Math.round(v);

// PowerPoint draws a line from one corner of its box to the opposite one
// (flipH/flipV pick which); bento draws a horizontal line across the middle
// of its box and rotates it. Endpoints → centre, length and angle. The
// renderer insets the endpoints for tip markers, so the box grows by that
// inset to keep the tips where PowerPoint had them.
function lineElement(frame, ln, elId){
  let x1 = frame.flipH ? frame.x + frame.w : frame.x, y1 = frame.flipV ? frame.y + frame.h : frame.y;
  let x2 = frame.flipH ? frame.x : frame.x + frame.w, y2 = frame.flipV ? frame.y : frame.y + frame.h;
  if (frame.rotation){
    const cx = frame.x + frame.w / 2, cy = frame.y + frame.h / 2, a = frame.rotation * Math.PI / 180;
    const rot = (x, y) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)];
    [x1, y1] = rot(x1, y1); [x2, y2] = rot(x2, y2);
  }
  const L = Math.hypot(x2 - x1, y2 - y1);
  if (L < 1) return null;
  const ux = (x2 - x1) / L, uy = (y2 - y1) / L;
  const lw = Math.max(ln.width, 2);
  const ps = ln.head ? lw * 2.6 : 0, pe = ln.tail ? lw * 2.6 : 0;
  const w = L + ps + pe;
  const cx = x1 + ux * (w / 2 - ps), cy = y1 + uy * (w / 2 - ps);
  const h = Math.max(10, Math.ceil(lw * 4));
  const el = {
    id: elId, type: 'shape', shape: 'line',
    x: rnd(cx - w / 2), y: rnd(cy - h / 2), w: rnd(w), h,
    rotation: Math.round(Math.atan2(uy, ux) * 1800 / Math.PI) / 10, opacity: 1,
    fill: ln.color, stroke: 'transparent', strokeWidth: ln.width, radius: 0,
  };
  if (ln.dash) el.strokeStyle = ln.dash;
  if (ln.head) el.lineStart = ln.head;
  if (ln.tail) el.lineEnd = ln.tail;
  return el;
}

// A picture fill (p:pic, a picture-filled shape, a picture background) →
// image element. a:srcRect is PowerPoint's crop (1/1000 %, per edge) —
// bento's crop is the same idea in fractions.
async function blipImage(blipFill, ctx, frame, elId){
  const blip = blipFill ? kid(blipFill, 'a:blip') : null;
  const embed = blip ? blip.getAttribute('r:embed') : null;
  if (!embed) return null;
  const key = await loadImageAsset(ctx.zip, embed, ctx.rels, ctx.dir, ctx.assets, ctx.assetCounter, ctx.imagePathToKey);
  if (!key){
    ctx.warn('Ein Bild in einem nicht unterstützten Format (z.B. WMF/EMF) wurde übersprungen.');
    return null;
  }
  const el = {
    id: elId, type: 'image',
    x: frame.x, y: frame.y, w: frame.w, h: frame.h,
    rotation: frame.rotation || 0, opacity: 1,
    src: 'asset:' + key, fit: 'cover', radius: 0,
  };
  const amf = blip ? kid(blip, 'a:alphaModFix') : null;
  if (amf) el.opacity = Math.round(clamp01(intAttr(amf, 'amt', 100000) / 100000) * 100) / 100;
  const sr = kid(blipFill, 'a:srcRect');
  if (sr){
    const [l, t, r, b] = ['l','t','r','b'].map(k => intAttr(sr, k, 0) / 100000);
    if (l >= 0 && t >= 0 && r >= 0 && b >= 0 && (l || t || r || b) && l + r < 1 && t + b < 1)
      el.crop = { x: l, y: t, w: Math.round((1 - l - r) * 10000) / 10000, h: Math.round((1 - t - b) * 10000) / 10000 };
  }
  // Frames using the SAME picture share one morph identity, so a logo or
  // recurring picture glides across a morph instead of cross-fading.
  const firstId = ctx.imageKeyToMorphId.get(key);
  if (!firstId) ctx.imageKeyToMorphId.set(key, elId);
  else if (firstId !== elId) el.morphId = firstId;
  return el;
}

function textElement(id, box, info, valign){
  return {
    id, type: 'text',
    x: rnd(box.x), y: rnd(box.y), w: rnd(box.w), h: rnd(box.h),
    rotation: box.rotation || 0, opacity: 1,
    html: info.html,
    fontSize: info.style.fontSize,
    fontFamily: fontStack(info.style.fontFamily),
    fontWeight: info.style.bold ? 700 : 400,
    color: info.style.color,
    align: info.style.align,
    valign,
    lineHeight: info.style.lineHeight,
  };
}
// A bullet-by-bullet build reveals single paragraphs; bento reveals whole
// elements — so such a text box is split into one element per paragraph,
// stacked by an estimated height (≈0.5em per character, wrapped to the box).
function paragraphElements(baseId, box, info, valign, paraAnim, shapeFx){
  const fs = info.style.fontSize, lh = info.style.lineHeight;
  const est = info.paras.map(p => {
    const lines = (p.plain || ' ').split('\n').reduce((n, seg) => n + Math.max(1, Math.ceil((seg.length + (p.bullet ? 2 : 0)) * fs * 0.5 / Math.max(40, box.w))), 0);
    return lines * fs * lh;
  });
  const total = est.reduce((a, b) => a + b, 0);
  let y = valign === 'middle' ? box.y + (box.h - total) / 2 : valign === 'bottom' ? box.y + box.h - total : box.y;
  const out = [];
  info.paras.forEach((p, k) => {
    const h = est[k];
    if (p.plain.trim()){
      const el = textElement(baseId + 'p' + (k + 1), { x: box.x, y, w: box.w, h, rotation: box.rotation }, { html: p.html, style: info.style }, 'top');
      const fx = bentoFx(paraAnim.get(k)) || shapeFx;
      if (fx) el.fx = fx;
      out.push(el);
    }
    y += h;
  });
  return out;
}

function shapeKind(geom){ return GEOM_MAP[geom] || 'rect'; }

// Freeform geometry (a:custGeom) → one svg path in a 1000×1000 box (the
// renderer stretches pathBox onto the element, like PowerPoint stretches
// each a:path's own w×h). null when there is nothing drawable or it uses
// guide formulas we don't evaluate.
const PATH_BOX = 1000;
// DrawingML shape-guide formulas (a:gd fmla="*/ w 1 2" …) over the shape's
// size in EMU; returns name → value, including the built-in names.
function shapeGuides(cg, w, h){
  const g = new Map();
  const ss = Math.min(w, h), ls = Math.max(w, h);
  Object.entries({ w, h, l: 0, t: 0, r: w, b: h, hc: w / 2, vc: h / 2, ss, ls,
    wd2: w / 2, wd3: w / 3, wd4: w / 4, wd5: w / 5, wd6: w / 6, wd8: w / 8, wd10: w / 10, wd32: w / 32,
    hd2: h / 2, hd3: h / 3, hd4: h / 4, hd5: h / 5, hd6: h / 6, hd8: h / 8, hd10: h / 10, hd32: h / 32,
    ssd2: ss / 2, ssd4: ss / 4, ssd6: ss / 6, ssd8: ss / 8, ssd16: ss / 16, ssd32: ss / 32,
    cd2: 10800000, cd4: 5400000, cd8: 2700000, '3cd4': 16200000, '3cd8': 8100000, '5cd8': 13500000, '7cd8': 18900000,
  }).forEach(([k, v]) => g.set(k, v));
  const val = t => { const n = parseFloat(t); return Number.isFinite(n) && /^-?[\d.]+$/.test(t) ? n : (g.has(t) ? g.get(t) : NaN); };
  const rad = a => a / 60000 * Math.PI / 180;
  const run = gd => {
    const [op, ...args] = (gd.getAttribute('fmla') || '').trim().split(/\s+/);
    const [x, y, z] = args.map(val);
    switch (op){
      case 'val': return x;
      case '*/': return x * y / z;
      case '+-': return x + y - z;
      case '+/': return (x + y) / z;
      case '?:': return x > 0 ? y : z;
      case 'abs': return Math.abs(x);
      case 'sqrt': return Math.sqrt(x);
      case 'max': return Math.max(x, y);
      case 'min': return Math.min(x, y);
      case 'mod': return Math.sqrt(x * x + y * y + z * z);
      case 'pin': return y < x ? x : y > z ? z : y;
      case 'sin': return x * Math.sin(rad(y));
      case 'cos': return x * Math.cos(rad(y));
      case 'tan': return x * Math.tan(rad(y));
      case 'at2': return Math.atan2(y, x) * 180 / Math.PI * 60000;
      case 'cat2': return x * Math.cos(Math.atan2(z, y));
      case 'sat2': return x * Math.sin(Math.atan2(z, y));
    }
    return NaN;
  };
  for (const list of [kid(cg, 'a:avLst'), kid(cg, 'a:gdLst')]) for (const gd of kids(list, 'a:gd')) g.set(gd.getAttribute('name'), run(gd));
  return g;
}
function custGeomPath(spPr, wEmu, hEmu){
  const cg = spPr ? kid(spPr, 'a:custGeom') : null;
  const lst = cg ? kid(cg, 'a:pathLst') : null;
  if (!lst) return null;
  const guides = shapeGuides(cg, wEmu || 1, hEmu || 1);
  const num = t => { const n = parseFloat(t); return /^-?[\d.]+$/.test(t || '') ? n : (guides.has(t) ? guides.get(t) : NaN); };
  const f = n => Math.round(n * 100) / 100;
  let d = '', filled = false;
  for (const path of kids(lst, 'a:path')){
    const w = intAttr(path, 'w', 0) || PATH_BOX, h = intAttr(path, 'h', 0) || PATH_BOX;
    if (path.getAttribute('fill') !== 'none') filled = true;
    const sx = PATH_BOX / w, sy = PATH_BOX / h;
    let cx = 0, cy = 0, bad = false;
    const pt = el => {
      const x = num(el.getAttribute('x')), y = num(el.getAttribute('y'));
      if (!Number.isFinite(x) || !Number.isFinite(y)) { bad = true; return [0, 0]; }
      return [x * sx, y * sy];
    };
    for (const c of path.children){
      const pts = kids(c, 'a:pt').map(pt);
      if (c.tagName === 'a:moveTo' && pts[0]){ [cx, cy] = pts[0]; d += 'M' + f(cx) + ' ' + f(cy); }
      else if (c.tagName === 'a:lnTo' && pts[0]){ [cx, cy] = pts[0]; d += 'L' + f(cx) + ' ' + f(cy); }
      else if (c.tagName === 'a:cubicBezTo' && pts.length === 3){ d += 'C' + pts.map(q => f(q[0]) + ' ' + f(q[1])).join(' '); [cx, cy] = pts[2]; }
      else if (c.tagName === 'a:quadBezTo' && pts.length === 2){ d += 'Q' + pts.map(q => f(q[0]) + ' ' + f(q[1])).join(' '); [cx, cy] = pts[1]; }
      else if (c.tagName === 'a:close') d += 'Z';
      else if (c.tagName === 'a:arcTo'){
        const wR = num(c.getAttribute('wR')) * sx, hR = num(c.getAttribute('hR')) * sy;
        const st = num(c.getAttribute('stAng')) / 60000 * Math.PI / 180, sw = num(c.getAttribute('swAng')) / 60000 * Math.PI / 180;
        if (![wR, hR, st, sw].every(Number.isFinite)) { bad = true; break; }
        const ox = cx - wR * Math.cos(st), oy = cy - hR * Math.sin(st);
        cx = ox + wR * Math.cos(st + sw); cy = oy + hR * Math.sin(st + sw);
        d += 'A' + f(wR) + ' ' + f(hR) + ' 0 ' + (Math.abs(sw) > Math.PI ? 1 : 0) + ' ' + (sw > 0 ? 1 : 0) + ' ' + f(cx) + ' ' + f(cy);
      }
    }
    if (bad) return null;
  }
  return d ? { d, box: [0, 0, PATH_BOX, PATH_BOX], filled } : null;
}
function adjOf(spPr, dflt){
  const geom = spPr ? kid(spPr, 'a:prstGeom') : null;
  const av = geom ? kid(geom, 'a:avLst') : null;
  const gd = av ? kids(av, 'a:gd').find(g => /^adj1?$/.test(g.getAttribute('name') || '')) : null;
  const m = gd ? /val\s+(-?\d+)/.exec(gd.getAttribute('fmla') || '') : null;
  return m ? parseInt(m[1], 10) / 100000 : dflt;
}

async function convertNode(node, ctx, elId){
  const tag = node.tagName;
  const out = [];
  const pal = ctx.pal, theme = ctx.theme;
  const cnv = cNvPrOf(node);
  const spid = cnv ? cnv.getAttribute('id') : null;
  const anim = ctx.anim;
  const shapeAnim = anim ? (anim.shapes.get(spid) || (node.__grpIds || []).slice().reverse().map(g => anim.shapes.get(g)).find(Boolean)) : null;
  const paraAnim = anim ? anim.paras.get(spid) : null;
  const firstPara = paraAnim ? Array.from(paraAnim.values()).sort((a, b) => a.step - b.step)[0] : null;
  const fxShape = bentoFx(shapeAnim || firstPara);
  const phType = effectivePhType(node, ctx);
  const withFx = el => { if (el && fxShape) el.fx = Object.assign({}, fxShape); return el; };

  if (tag === 'p:sp' || tag === 'p:cxnSp'){
    const frame = frameFromChain(node, ctx) || fallbackFrame(phType, ctx.slideW, ctx.slideH);
    const spPr = kid(node, 'p:spPr');
    const prst = spPr ? kid(spPr, 'a:prstGeom') : null;
    const geom = prst ? prst.getAttribute('prst') : null;
    let fill = spPr ? fillOf(spPr, pal, null) : null;
    if (fill && fill.kind === 'grp') fill = fillOf(node.__grpSpPr, pal, null);
    if (!fill) fill = themeFillRef(styleRef(node, 'a:fillRef'), theme, pal);
    if (!fill && phType) for (const c of chainFor(node, ctx).slice(1)){ const f = fillOf(kid(c.el, 'p:spPr'), pal, null); if (f){ fill = f; break; } }
    const line = spPr ? lineOf(spPr, node, theme, pal) : null;

    if ((geom && LINE_GEOMS.test(geom)) || (tag === 'p:cxnSp' && !geom)){
      if (line) out.push(withFx(lineElement(frame, line, elId)));
      return out.filter(Boolean);
    }
    if (fill && fill.kind === 'blip'){
      out.push(withFx(await blipImage(fill.el, ctx, frame, elId + 'i')));
      fill = null;
    }
    const xf = spPr ? kid(spPr, 'a:xfrm') : null, ext = xf ? kid(xf, 'a:ext') : null;
    const custom = geom ? null : custGeomPath(spPr, intAttr(ext, 'cx', 0), intAttr(ext, 'cy', 0));
    const hasFill = !!fill && (fill.kind === 'solid' || fill.kind === 'grad') && (!custom || custom.filled);
    const emitsShape = hasFill || !!line;
    if (emitsShape){
      const orient = ARROW_ORIENTATION[geom];
      const shapeW = (orient && orient.swapWH) ? frame.h : frame.w;
      const shapeH = (orient && orient.swapWH) ? frame.w : frame.h;
      // keep the same visual centre when the box's own w/h swap
      const el = {
        id: elId, type: 'shape', shape: shapeKind(geom),
        x: (orient && orient.swapWH) ? rnd(frame.x + (frame.w - shapeW) / 2) : frame.x,
        y: (orient && orient.swapWH) ? rnd(frame.y + (frame.h - shapeH) / 2) : frame.y,
        w: shapeW, h: shapeH,
        rotation: frame.rotation + (orient ? orient.extraRotation : 0), opacity: 1,
        fill: hasFill ? clrCss(fill.color) : 'transparent',
        stroke: line ? line.color : 'none', strokeWidth: line ? line.width : 0,
        radius: 0,
      };
      if (hasFill && fill.kind === 'grad') el.fillGradient = fill.grad;
      if (line && line.dash) el.strokeStyle = line.dash;
      if (el.shape === 'polygon') el.sides = POLYGON_SIDES[geom] || 6;
      if (custom){ el.shape = 'path'; el.d = custom.d; el.pathBox = custom.box; }
      if (/^(roundRect|round1Rect|round2SameRect|flowChartAlternateProcess)$/.test(geom || ''))
        el.radius = rnd(Math.min(frame.w, frame.h) * Math.max(0, Math.min(0.5, adjOf(spPr, 0.16667))));
      out.push(withFx(el));
    }

    const txBody = kid(node, 'p:txBody');
    const info = txBody ? extractTextBody(txBody, {
      sources: lvl => textSources(node, ctx, lvl, phType),
      fallbackColor: roleColor(pal, 'tx1') || '#000000',
      fonts: ctx.fonts, pal, rels: ctx.rels,
    }) : null;
    if (info){
      const bl = bodyLayout(node, ctx);
      const txFrame = frameOfXfrm(kid(node, 'p:txXfrm')) || frame;
      const box = { x: txFrame.x + bl.l, y: txFrame.y + bl.t, w: Math.max(8, txFrame.w - bl.l - bl.r), h: Math.max(8, txFrame.h - bl.t - bl.b), rotation: frame.rotation };
      const textId = emitsShape ? elId + 't' : elId;
      if (paraAnim && info.paras.length > 1) out.push(...paragraphElements(textId, box, info, bl.valign, paraAnim, shapeAnim ? bentoFx(shapeAnim) : null));
      else out.push(withFx(textElement(textId, box, info, bl.valign)));
    }
    return out.filter(Boolean);
  }

  if (tag === 'p:pic'){
    const frame = frameFromChain(node, ctx) || fallbackFrame(null, ctx.slideW, ctx.slideH);
    const img = await blipImage(kid(node, 'p:blipFill'), ctx, frame, elId);
    if (img){
      // PowerPoint's alt text ("Beschreibung", falling back to the title);
      // a picture marked decorative stays empty on purpose.
      const decorative = cnv && Array.from(cnv.getElementsByTagName('*')).some(e => e.localName === 'decorative' && e.getAttribute('val') === '1');
      const alt = cnv ? ((cnv.getAttribute('descr') || '').trim() || (cnv.getAttribute('title') || '').trim()) : '';
      if (alt && !decorative) img.alt = alt.replace(/\s+/g, ' ');
      out.push(withFx(img));
    }
    return out;
  }

  if (tag === 'p:graphicFrame'){
    const frame = frameFromChain(node, ctx) || fallbackFrame(null, ctx.slideW, ctx.slideH);
    const gd = first(node, 'a:graphicData');
    const uri = gd ? (gd.getAttribute('uri') || '') : '';
    try {
      if (/\/chart$/.test(uri)){
        const c = first(gd, 'c:chart');
        const path = c ? resolvePartPath(ctx.dir, ctx.rels[c.getAttribute('r:id')]) : null;
        const chartDoc = path ? await ctx.xmlOf(path) : null;
        const res = chartDoc ? convertChartXml(chartDoc, pal, ctx.warn) : null;
        if (res){
          const ink = roleColor(pal, 'tx1') || '#000000';
          let y = frame.y, h = frame.h;
          if (res.title && h > 160){
            out.push(withFx({
              id: elId + 'h', type: 'text', x: frame.x, y, w: frame.w, h: 44, rotation: 0, opacity: 1,
              html: esc(res.title), fontSize: 24, fontFamily: fontStack(ctx.fonts.minor), fontWeight: 600,
              color: ink, align: 'center', valign: 'middle', lineHeight: 1.2,
            }));
            y += 48; h -= 48;
          }
          let tableEl = null, chartH = h;
          if (res.table){
            // the chart's data table: bento's own layout for a linked table
            // (labels down the first column, one column per series), so
            // editing a number redraws the chart
            const nRows = res.table.categories.length + 1;
            const tH = Math.min(Math.round(h * 0.45), nRows * 34);
            chartH = h - tH - 8;
            const fsz = Math.max(10, Math.min(18, Math.floor(tH / nRows / 1.8)));
            const fmtNum = v => String(Math.round(v * 1000) / 1000);
            tableEl = {
              id: elId + 'd', type: 'table', x: frame.x, y: y + chartH + 8, w: frame.w, h: tH, rotation: 0, opacity: 1,
              header: true,
              columns: [{ w: 1.4 }, ...res.table.series.map(() => ({ w: 1 }))],
              rows: [
                { cells: [{ html: '' }, ...res.table.series.map(s => ({ html: esc(s.name) }))] },
                ...res.table.categories.map((cat, j) => ({ cells: [{ html: esc(cat) }, ...res.table.series.map(s => ({ html: fmtNum(s.data[j] || 0), align: 'right' }))] })),
              ],
              style: {
                headerBg: pal.colors.accent1 || '#1E2A3A', headerColor: '#FFFFFF', borderColor: 'rgba(0,0,0,0.15)', borderWidth: 1,
                cellPadX: 8, cellPadY: Math.max(2, Math.round(fsz * 0.25)), fontSize: fsz, fontFamily: fontStack(ctx.fonts.minor), color: ink, radius: 0,
              },
            };
          }
          const chartEl = { id: elId, type: 'chart', x: frame.x, y, w: frame.w, h: Math.max(60, chartH), rotation: 0, opacity: 1, preset: res.preset, option: res.option };
          if (tableEl) chartEl.source = { tableId: tableEl.id };
          out.push(withFx(chartEl));
          if (tableEl) out.push(withFx(tableEl));
          return out;
        }
      } else if (/\/table$/.test(uri)){
        const tbl = first(gd, 'a:tbl');
        if (tbl) return [withFx(convertTableXml(tbl, frame, ctx, elId))];
      } else if (/\/ole$/.test(uri)){
        // an embedded object (Excel sheet, equation, …): newer files carry
        // its preview picture inline — the closest thing to the object
        const pic = first(gd, 'p:pic');
        const img = pic ? await blipImage(kid(pic, 'p:blipFill'), ctx, frame, elId) : null;
        if (img) return [withFx(img)];
      } else if (/\/diagram$/.test(uri)){
        // SmartArt: PowerPoint stores a pre-drawn copy of the layout
        // (ppt/diagrams/drawingN.xml) — ordinary shapes, positioned
        // relative to the frame. Converted like any other shapes.
        const relIds = first(gd, 'dgm:relIds');
        const dmPath = relIds ? resolvePartPath(ctx.dir, ctx.rels[relIds.getAttribute('r:dm')]) : null;
        const dataDoc = dmPath ? await ctx.xmlOf(dmPath) : null;
        const ext = dataDoc ? first(dataDoc, 'dsp:dataModelExt') : null;
        const drawPath = ext ? resolvePartPath(ctx.dir, ctx.rels[ext.getAttribute('relId')]) : null;
        const drawFile = drawPath ? ctx.zip.file(drawPath) : null;
        if (drawFile){
          const text = (await drawFile.async('string')).replace(/<(\/?)dsp:/g, '<$1p:').replace(/xmlns:dsp=/g, 'xmlns:p=');
          const drawDoc = parseXml(text);
          const tree = first(drawDoc, 'p:spTree');
          if (tree){
            const xf = kid(node, 'p:xfrm'), off = xf ? kid(xf, 'a:off') : null;
            const g = { offX: intAttr(off, 'x', 0), offY: intAttr(off, 'y', 0), extW: 1, extH: 1, chOffX: 0, chOffY: 0, chExtW: 1, chExtH: 1, rot: 0 };
            const shapes = flattenGroupedShapes(Array.from(tree.children));
            const drawRels = await ctx.relsOf(drawPath);
            const sub = Object.assign({}, ctx, { rels: drawRels, dir: drawPath.substring(0, drawPath.lastIndexOf('/')), anim: null });
            let k = 1;
            for (const s of shapes){
              applyGroupXfrmToChild(s, g);
              applyGroupToXfrm(kid(s, 'p:txXfrm'), g);
              out.push(...(await convertNode(s, sub, elId + 'g' + (k++))).map(withFx));
            }
            if (out.length) return out;
          }
        }
      }
    } catch (e){
      console.warn('graphicFrame nicht übernommen:', e);
    }
    ctx.warn('Ein eingebettetes Objekt (OLE/Sonderformat) konnte nicht übernommen werden — als Platzhalter markiert.');
    return [{
      id: elId, type: 'text',
      x: frame.x, y: frame.y, w: frame.w, h: frame.h,
      rotation: frame.rotation, opacity: 1,
      html: '[Objekt aus PowerPoint — manuell nachbauen]',
      fontSize: Math.max(10, Math.min(20, Math.round(frame.h / 5), Math.round(frame.w / 12))), fontFamily: 'system-ui, sans-serif', fontWeight: 500,
      color: '#999999', align: 'left', valign: 'top', lineHeight: 1.3,
    }];
  }
  return out;
}

async function convertTree(root, ctx){
  const cSld = root ? kid(root, 'p:cSld') : null;
  const spTree = cSld ? kid(cSld, 'p:spTree') : null;
  if (!spTree) return [];
  const nodes = flattenGroupedShapes(Array.from(spTree.children));
  const out = [];
  let n = 1;
  for (const node of nodes){
    // a layout's / master's placeholders are PROMPTS ("Click to add
    // title"), not content — only its own artwork and logos carry over
    if (ctx.layer !== 'slide' && phOf(node)) continue;
    const cnv = cNvPrOf(node);
    if (cnv && cnv.getAttribute('hidden') === '1') continue;
    const made = await convertNode(node, ctx, ctx.idPrefix + 'e' + (n++));
    const name = cnv ? (cnv.getAttribute('name') || '') : '';
    made.forEach((el, k) => { el.__name = name ? name + '#' + k : ''; });
    out.push(...made);
  }
  return out;
}

// Background: the FIRST level (slide → layout → master) that declares a p:bg
// settles it — p:bgPr directly, or p:bgRef into the theme's background
// styles. Gradients keep the gradient; a picture becomes a full-slide image
// behind everything.
function backgroundOf(levels, ctx){
  const dflt = roleColor(ctx.pal, 'bg1') || '#FFFFFF';
  for (const lv of levels){
    const cSld = lv.root ? kid(lv.root, 'p:cSld') : null;
    const bg = cSld ? kid(cSld, 'p:bg') : null;
    if (!bg) continue;
    const bgPr = kid(bg, 'p:bgPr');
    const f = bgPr ? fillOf(bgPr, ctx.pal, null) : themeFillRef(kid(bg, 'p:bgRef'), ctx.theme, ctx.pal);
    if (!f || f.kind === 'none' || f.kind === 'grp') return { color: dflt };
    if (f.kind === 'solid') return { color: clrCss(f.color) };
    if (f.kind === 'grad') return { color: clrCss(f.color), grad: f.grad };
    if (f.kind === 'blip') return { color: dflt, blip: f.el, level: lv };
  }
  return { color: dflt };
}

async function convertPptx(file, log){
  const zip = await JSZip.loadAsync(file);
  const xmlCache = new Map(), relsCache = new Map();
  const xmlOf = async path => {
    if (!path) return null;
    if (!xmlCache.has(path)){ const f = zip.file(path); xmlCache.set(path, f ? parseXml(await f.async('string')) : null); }
    return xmlCache.get(path);
  };
  const relsOf = async partPath => {
    if (!partPath) return parseRels('');
    if (!relsCache.has(partPath)){
      const dir = partPath.substring(0, partPath.lastIndexOf('/')), name = partPath.substring(partPath.lastIndexOf('/') + 1);
      const f = zip.file(dir + '/_rels/' + name + '.rels');
      relsCache.set(partPath, parseRels(f ? await f.async('string') : ''));
    }
    return relsCache.get(partPath);
  };
  const dirOf = p => p ? p.substring(0, p.lastIndexOf('/')) : 'ppt';

  const presDoc = await xmlOf('ppt/presentation.xml');
  const sldSzEl = first(presDoc, 'p:sldSz');
  const slideW = sldSzEl ? emuToPx(intAttr(sldSzEl, 'cx', 12192000)) : 1280;
  const slideH = sldSzEl ? emuToPx(intAttr(sldSzEl, 'cy', 6858000)) : 720;
  const presRels = await relsOf('ppt/presentation.xml');
  const slidePaths = all(presDoc, 'p:sldId').map(el => resolvePartPath('ppt', presRels[el.getAttribute('r:id')])).filter(Boolean);
  const defaultTextStyle = first(presDoc, 'p:defaultTextStyle');

  const tableStyles = {};
  const tsDoc = await xmlOf('ppt/tableStyles.xml');
  if (tsDoc) for (const s of all(tsDoc, 'a:tblStyle')) tableStyles[s.getAttribute('styleId')] = s;

  // title from core properties
  let title = file.name.replace(/\.pptx$/i, '');
  const coreDoc = await xmlOf('docProps/core.xml');
  if (coreDoc){
    const dcTitle = coreDoc.getElementsByTagName('dc:title')[0];
    if (dcTitle && dcTitle.textContent.trim()) title = dcTitle.textContent.trim();
  }

  const themeCache = new Map();
  const themeFor = async path => {
    if (!themeCache.has(path)) themeCache.set(path, parseTheme(await xmlOf(path)));
    return themeCache.get(path);
  };
  const fallbackThemePath = (zip.file(/ppt\/theme\/theme1\.xml/i)[0] || {}).name || null;
  const partIndex = new Map();
  const indexOf = path => { if (!partIndex.has(path)) partIndex.set(path, partIndex.size + 1); return partIndex.get(path); };

  const shared = {
    zip, xmlOf, relsOf, slideW, slideH, defaultTextStyle, tableStyles,
    assets: {}, assetCounter: { n: 1 },
    // Shared across every slide: a logo or recurring background referenced
    // from several slides is recognised as "the same picture".
    imagePathToKey: new Map(),
    imageKeyToMorphId: new Map(),
  };
  const warnings = new Set();
  shared.warn = msg => warnings.add(msg);
  const slides = [];
  let docTheme = null;

  for (let i = 0; i < slidePaths.length; i++){
    const slidePath = slidePaths[i];
    const sldDoc = await xmlOf(slidePath);
    if (!sldDoc) continue;
    const sldRoot = sldDoc.documentElement;
    const slideDir = dirOf(slidePath);
    const rels = await relsOf(slidePath);
    const layoutPath = resolvePartPath(slideDir, relOfType(rels, '/slideLayout'));
    const layoutDoc = await xmlOf(layoutPath);
    const layoutRels = await relsOf(layoutPath);
    const masterPath = layoutPath ? resolvePartPath(dirOf(layoutPath), relOfType(layoutRels, '/slideMaster')) : null;
    const masterDoc = await xmlOf(masterPath);
    const masterRels = await relsOf(masterPath);
    const themePath = masterPath ? (resolvePartPath(dirOf(masterPath), relOfType(masterRels, '/theme')) || fallbackThemePath) : fallbackThemePath;
    const theme = await themeFor(themePath);
    const layoutRoot = layoutDoc ? layoutDoc.documentElement : null;
    const masterRoot = masterDoc ? masterDoc.documentElement : null;
    const masterMap = clrMapFrom(masterRoot ? kid(masterRoot, 'p:clrMap') : null);
    const pal = { colors: theme.colors, map: clrMapOverride(sldRoot, clrMapOverride(layoutRoot, masterMap)) };
    const base = Object.assign({}, shared, { pal, theme, fonts: theme.fonts, layoutRoot, masterRoot });
    if (!docTheme) docTheme = { pal, fonts: theme.fonts };

    const levels = [
      { root: sldRoot, rels, dir: slideDir, prefix: 's' + (i + 1) + '_' },
      { root: layoutRoot, rels: layoutRels, dir: dirOf(layoutPath), prefix: 'l' + indexOf(layoutPath) + '_' },
      { root: masterRoot, rels: masterRels, dir: dirOf(masterPath), prefix: 'm' + indexOf(masterPath) + '_' },
    ];
    const bg = backgroundOf(levels, base);
    const elements = [];
    if (bg.blip){
      const img = await blipImage(bg.blip, Object.assign({}, base, { rels: bg.level.rels, dir: bg.level.dir }),
        { x: 0, y: 0, w: slideW, h: slideH, rotation: 0 }, bg.level.prefix + 'bg');
      if (img) elements.push(img);
    }
    // the master's and layout's own artwork (logos, bands, frames) shows on
    // every slide that doesn't switch it off — same ids on every slide, so it
    // simply stays put across transitions
    if (sldRoot.getAttribute('showMasterSp') !== '0'){
      if (masterRoot && (!layoutRoot || layoutRoot.getAttribute('showMasterSp') !== '0'))
        elements.push(...await convertTree(masterRoot, Object.assign({}, base, { layer: 'master', rels: masterRels, dir: dirOf(masterPath), idPrefix: levels[2].prefix })));
      if (layoutRoot)
        elements.push(...await convertTree(layoutRoot, Object.assign({}, base, { layer: 'layout', rels: layoutRels, dir: dirOf(layoutPath), idPrefix: levels[1].prefix })));
    }
    const anim = parseTiming(sldRoot);
    if ([...anim.dropped].some(c => c !== 'entr'))
      warnings.add('Nur Eingangsanimationen werden übernommen (als Klickschritte) — Hervorhebungs-, Ausgangs- und Pfadanimationen entfallen.');
    elements.push(...await convertTree(sldRoot, Object.assign({}, base, { layer: 'slide', rels, dir: slideDir, idPrefix: levels[0].prefix, anim })));

    const notesPath = resolvePartPath(slideDir, relOfType(rels, '/notesSlide'));
    const notesDoc = notesPath ? await xmlOf(notesPath) : null;

    const slide = {
      id: 's' + (i + 1),
      background: bg.color,
      transition: transitionOf(sldRoot),
      elements,
      notes: notesDoc ? notesTextOf(notesDoc.documentElement) : '',
    };
    if (bg.grad) slide.backgroundGradient = bg.grad;
    if (sldRoot.getAttribute('show') === '0') slide.hidden = true;
    slides.push(slide);
  }

  // Morph: PowerPoint pairs objects across a morph by NAME (the duplicate-
  // a-slide idiom keeps names; "!!name" forces a pair). bento pairs by
  // morph key — so a same-named element on the next slide adopts the key of
  // its namesake. Names that repeat on one slide are ambiguous and skipped.
  for (let i = 1; i < slides.length; i++){
    if (slides[i].transition !== 'morph') continue;
    const prevBy = new Map(), dup = new Set();
    for (const e of slides[i - 1].elements) if (e.__name){
      if (prevBy.has(e.__name)) dup.add(e.__name);
      prevBy.set(e.__name, e.morphId || e.id);
    }
    for (const e of slides[i].elements){
      if (!e.__name || dup.has(e.__name) || !prevBy.has(e.__name)) continue;
      const k = prevBy.get(e.__name);
      if (k !== e.id) e.morphId = k;
    }
  }
  // Two elements with the same morph key on ONE slide break the pairing.
  for (const s of slides){
    const seen = new Set();
    for (const e of s.elements){
      let k = e.morphId || e.id;
      if (seen.has(k) && e.morphId){ delete e.morphId; k = e.id; }
      seen.add(k);
      delete e.__name;
    }
  }

  if (!slides.length){
    slides.push({
      id: 's1', background: '#101418', transition: 'none', notes: '',
      elements: [{ id:'t1', type:'text', x:96, y:260, w: slideW-192, h:160, rotation:0, opacity:1,
        html:'(Keine Folien gefunden)', fontSize:48, fontFamily:'system-ui, sans-serif', fontWeight:700,
        color:'#ffffff', align:'left', valign:'top', lineHeight:1.1 }]
    });
  }

  const tp = docTheme ? docTheme.pal : { colors: {}, map: DEFAULT_CLR_MAP };
  const doc = {
    format: 'bento/slides',
    version: 1,
    docId: uuid(),
    title,
    size: { width: slideW, height: slideH },
    theme: {
      background: roleColor(tp, 'bg1') || '#FFFFFF',
      color: roleColor(tp, 'tx1') || '#111111',
      accent: roleColor(tp, 'accent1') || '#FF9E5E',
      fontFamily: fontStack(docTheme && docTheme.fonts.minor),
    },
    slides,
    modified: new Date().toISOString()
  };
  if (Object.keys(shared.assets).length) doc.assets = shared.assets;

  return { doc, warnings: Array.from(warnings), slideCount: slides.length };
}

// ================= Legacy .ppt (PowerPoint 97–2003 binary) =================
// The old format is an OLE2 compound file ("CFB", a small FAT file system)
// holding a "PowerPoint Document" stream of binary records [MS-PPT], whose
// drawings are Office Art records [MS-ODRAW], plus a "Pictures" stream with
// the images. Read here directly — no server, no LibreOffice — and mapped
// onto the same bento elements the PPTX path produces.

// ---- CFB reader: file bytes → Map(root-level stream name → bytes) ----
function cfbStreams(buf){
  const u8 = new Uint8Array(buf), dv = new DataView(buf);
  const SIG = [0xD0,0xCF,0x11,0xE0,0xA1,0xB1,0x1A,0xE1];
  if (u8.length < 512 || !SIG.every((b, i) => u8[i] === b))
    throw new Error('Keine PowerPoint-97–2003-Datei (kein OLE-Container).');
  const END = 0xFFFFFFFA; // ≥ this: end of chain / free / FAT / DIFAT markers
  const secSize = 1 << dv.getUint16(0x1E, true);
  const miniSize = 1 << dv.getUint16(0x20, true);
  const nFat = dv.getUint32(0x2C, true);
  const dirStart = dv.getUint32(0x30, true);
  const miniCutoff = dv.getUint32(0x38, true) || 4096;
  const miniFatStart = dv.getUint32(0x3C, true);
  let difat = dv.getUint32(0x44, true);
  const nDifat = dv.getUint32(0x48, true);
  const secOff = s => (s + 1) * secSize; // the header fills sector "-1"

  const fatSecs = [];
  for (let i = 0; i < 109 && fatSecs.length < nFat; i++){ const s = dv.getUint32(0x4C + i * 4, true); if (s < END) fatSecs.push(s); }
  for (let k = 0; k < nDifat && difat < END && secOff(difat) < u8.length; k++){
    const o = secOff(difat), per = secSize / 4 - 1;
    for (let i = 0; i < per && fatSecs.length < nFat; i++){ const s = dv.getUint32(o + i * 4, true); if (s < END) fatSecs.push(s); }
    difat = dv.getUint32(o + per * 4, true);
  }
  const perSec = secSize / 4;
  const fat = new Uint32Array(fatSecs.length * perSec).fill(0xFFFFFFFE);
  fatSecs.forEach((s, i) => {
    const o = secOff(s);
    for (let j = 0; j < perSec && o + j * 4 + 4 <= u8.length; j++) fat[i * perSec + j] = dv.getUint32(o + j * 4, true);
  });
  const chain = (start, table) => {
    const out = [];
    for (let s = start, n = 0; s < END && s < table.length && n <= table.length; s = table[s], n++) out.push(s);
    return out;
  };
  const readChain = (start, size) => {
    const secs = chain(start, fat);
    const out = new Uint8Array(secs.length * secSize);
    secs.forEach((s, i) => out.set(u8.subarray(secOff(s), secOff(s) + secSize), i * secSize));
    return size == null ? out : out.subarray(0, Math.min(size, out.length));
  };

  const dir = readChain(dirStart);
  const ddv = new DataView(dir.buffer, dir.byteOffset, dir.byteLength);
  const entries = [];
  for (let o = 0; o + 128 <= dir.length; o += 128){
    const type = dir[o + 0x42];
    if (!type){ entries.push(null); continue; }
    const nameLen = ddv.getUint16(o + 0x40, true);
    let name = '';
    for (let i = 0; i < Math.max(0, nameLen / 2 - 1) && i < 32; i++) name += String.fromCharCode(ddv.getUint16(o + i * 2, true));
    entries.push({
      name, type,
      left: ddv.getUint32(o + 0x44, true), right: ddv.getUint32(o + 0x48, true), child: ddv.getUint32(o + 0x4C, true),
      start: ddv.getUint32(o + 0x74, true), size: ddv.getUint32(o + 0x78, true),
    });
  }
  const root = entries[0];
  if (!root) throw new Error('Beschädigte .ppt-Datei (kein Stammverzeichnis).');
  const miniFatBytes = miniFatStart < END ? readChain(miniFatStart) : new Uint8Array(0);
  const mdv = new DataView(miniFatBytes.buffer, miniFatBytes.byteOffset, miniFatBytes.byteLength);
  const miniFat = new Uint32Array(miniFatBytes.length >> 2);
  for (let i = 0; i < miniFat.length; i++) miniFat[i] = mdv.getUint32(i * 4, true);
  const miniStream = root.start < END ? readChain(root.start, root.size) : new Uint8Array(0);

  // only the root storage's own streams (embedded OLE objects carry storages
  // of their own, sometimes with same-named streams)
  const top = [], seen = new Set();
  const walk = i => {
    if (i >= END || !entries[i] || seen.has(i)) return;
    seen.add(i);
    walk(entries[i].left); top.push(entries[i]); walk(entries[i].right);
  };
  walk(root.child);
  const streams = new Map();
  for (const e of top){
    if (e.type !== 2) continue;
    let data;
    if (e.size < miniCutoff){
      const secs = chain(e.start, miniFat);
      data = new Uint8Array(secs.length * miniSize);
      secs.forEach((s, i) => data.set(miniStream.subarray(s * miniSize, (s + 1) * miniSize), i * miniSize));
      data = data.subarray(0, e.size);
    } else data = readChain(e.start, e.size);
    streams.set(e.name, data);
  }
  return streams;
}

// ---- record primitives ----
function pptReader(u8){ return { u8, dv: new DataView(u8.buffer, u8.byteOffset, u8.byteLength) }; }
function pptRec(R, off){
  if (off == null || off < 0 || off + 8 > R.u8.length) return null;
  const vi = R.dv.getUint16(off, true);
  const len = R.dv.getUint32(off + 4, true);
  return { ver: vi & 0xF, inst: vi >> 4, type: R.dv.getUint16(off + 2, true), len: Math.min(len, R.u8.length - off - 8), off, body: off + 8 };
}
function pptKids(R, rec){
  const out = [];
  if (!rec) return out;
  let o = rec.body;
  const end = rec.body + rec.len;
  while (o + 8 <= end){
    const r = pptRec(R, o);
    if (!r) break;
    out.push(r);
    o = r.body + r.len;
  }
  return out;
}
const pptKid = (R, rec, type) => pptKids(R, rec).find(r => r.type === type) || null;
function pptFind(R, rec, type, depth){ // depth-first search through containers
  if (!rec || depth > 12) return null;
  for (const k of pptKids(R, rec)){
    if (k.type === type) return k;
    if (k.ver === 0xF){ const f = pptFind(R, k, type, (depth || 0) + 1); if (f) return f; }
  }
  return null;
}
function pptUtf16(R, off, len){
  let s = '';
  for (let i = 0; i + 1 < len; i += 2){ const c = R.dv.getUint16(off + i, true); if (!c) break; s += String.fromCharCode(c); }
  return s;
}

// ---- persist directory: persist id → record offset (newest edit wins) ----
function pptPersist(R, currentUser){
  let editOff = null;
  if (currentUser && currentUser.length >= 20){
    const cdv = new DataView(currentUser.buffer, currentUser.byteOffset, currentUser.byteLength);
    if (cdv.getUint32(12, true) === 0xF3D1C4DF) throw new Error('Passwortgeschützte .ppt-Dateien können nicht gelesen werden — bitte ohne Kennwort speichern.');
    editOff = cdv.getUint32(16, true);
  }
  let r = pptRec(R, editOff);
  if (!r || r.type !== 0x0FF5){ // broken pointer: take the last UserEditAtom in the stream
    let o = 0, last = null;
    for (let n = 0; o + 8 <= R.u8.length && n < 200000; n++){ const x = pptRec(R, o); if (!x) break; if (x.type === 0x0FF5) last = o; o = x.body + x.len; }
    editOff = last;
  }
  const persist = new Map();
  let docRef = null;
  const seen = new Set();
  for (let off = editOff; off != null && !seen.has(off);){
    seen.add(off);
    const ue = pptRec(R, off);
    if (!ue || ue.type !== 0x0FF5) break;
    if (docRef == null) docRef = R.dv.getUint32(ue.body + 16, true);
    const pd = pptRec(R, R.dv.getUint32(ue.body + 12, true));
    if (pd && pd.type === 0x1772){
      for (let o = pd.body, end = pd.body + pd.len; o + 4 <= end;){
        const w = R.dv.getUint32(o, true); o += 4;
        const pid = w & 0xFFFFF, n = w >>> 20;
        for (let k = 0; k < n && o + 4 <= end; k++, o += 4) if (!persist.has(pid + k)) persist.set(pid + k, R.dv.getUint32(o, true));
      }
    }
    const prev = R.dv.getUint32(ue.body + 8, true);
    off = prev ? prev : null;
  }
  return { persist, docRef };
}

// ---- text properties (StyleTextPropAtom / TextMasterStyleAtom) ----
function pptPF(dv, o){
  const m = dv.getUint32(o, true); o += 4;
  const p = { mask: m };
  if (m & 0xF){ const f = dv.getUint16(o, true); o += 2; if (m & 1) p.hasBullet = !!(f & 1); if (m & 2) p.bulletHasFont = !!(f & 2); }
  if (m & 0x80){ p.bulletChar = dv.getUint16(o, true); o += 2; }
  if (m & 0x10){ p.bulletFont = dv.getUint16(o, true); o += 2; }
  if (m & 0x40){ o += 2; }
  if (m & 0x20){ p.bulletColor = dv.getUint32(o, true); o += 4; }
  if (m & 0x800){ p.align = dv.getUint16(o, true); o += 2; }
  if (m & 0x1000){ p.lineSpacing = dv.getInt16(o, true); o += 2; }
  if (m & 0x2000){ o += 2; }
  if (m & 0x4000){ o += 2; }
  if (m & 0x100){ o += 2; }
  if (m & 0x400){ o += 2; }
  if (m & 0x8000){ o += 2; }
  if (m & 0x100000){ const n = dv.getUint16(o, true); o += 2 + n * 4; }
  if (m & 0x10000){ o += 2; }
  if (m & 0xE0000){ o += 2; }
  if (m & 0x200000){ o += 2; }
  return { props: p, next: o };
}
function pptCF(dv, o){
  const m = dv.getUint32(o, true); o += 4;
  const p = {};
  if (m & 0x3EB7){
    const s = dv.getUint16(o, true); o += 2;
    if (m & 1) p.bold = !!(s & 1);
    if (m & 2) p.italic = !!(s & 2);
    if (m & 4) p.underline = !!(s & 4);
  }
  if (m & 0x10000){ p.font = dv.getUint16(o, true); o += 2; }
  if (m & 0x200000){ o += 2; }
  if (m & 0x400000){ o += 2; }
  if (m & 0x800000){ o += 2; }
  if (m & 0x20000){ p.size = dv.getUint16(o, true); o += 2; }
  if (m & 0x40000){ p.color = dv.getUint32(o, true); o += 4; }
  if (m & 0x80000){ o += 2; }
  return { props: p, next: o };
}
function pptStyleRuns(R, rec, textLen){
  const dv = R.dv, end = rec.body + rec.len;
  let o = rec.body;
  const pf = [], cf = [];
  try {
    for (let total = 0; total < textLen + 1 && o + 6 <= end;){
      const count = dv.getUint32(o, true), indent = dv.getUint16(o + 4, true);
      const r = pptPF(dv, o + 6); o = r.next;
      pf.push({ count, indent, props: r.props });
      total += count;
      if (!count) break;
    }
    for (let total = 0; total < textLen + 1 && o + 4 <= end;){
      const count = dv.getUint32(o, true);
      const r = pptCF(dv, o + 4); o = r.next;
      cf.push({ count, props: r.props });
      total += count;
      if (!count) break;
    }
  } catch (e){ /* truncated property run — keep what was read */ }
  return { pf, cf };
}
function pptMasterStyle(R, rec){
  const dv = R.dv;
  const levels = [];
  try {
    const n = dv.getUint16(rec.body, true);
    let o = rec.body + 2;
    for (let i = 0; i < Math.min(n, 5); i++){
      if (rec.inst >= 5) o += 2;
      const pf = pptPF(dv, o); o = pf.next;
      const cf = pptCF(dv, o); o = cf.next;
      levels.push({ pf: pf.props, cf: cf.props });
    }
  } catch (e){ /* keep the levels read so far */ }
  return levels;
}

// ---- Office Art (drawing) ----
function pptFopt(R, rec, into){
  const n = rec.inst;
  let cx = rec.body + n * 6;
  for (let i = 0, o = rec.body; i < n && o + 6 <= rec.body + rec.len; i++, o += 6){
    const opid = R.dv.getUint16(o, true), val = R.dv.getInt32(o + 2, true);
    const e = { val };
    if (opid & 0x8000){
      const len = Math.max(0, Math.min(val >>> 0, rec.body + rec.len - cx));
      e.data = { off: cx, len };
      cx += len;
    }
    const id = opid & 0x3FFF, prev = into.get(id);
    // Boolean sets (ids ending in 0x3F) are split between the primary and
    // tertiary tables (the newer bits live in the latter): merge, don't replace.
    if ((id & 0x3F) === 0x3F && prev && !prev.data && !e.data && into.__own) e.val = (prev.val | e.val) >>> 0;
    into.set(id, e);
  }
}
// OfficeArtCOLORREF (fill/line colours): scheme index, or plain RGB.
function pptColorRef(v, scheme){
  if (v == null) return null;
  const r = v & 0xFF, g = (v >>> 8) & 0xFF, b = (v >>> 16) & 0xFF, flags = (v >>> 24) & 0xFF;
  if (flags & 0x08) return scheme[r] || null;
  if (flags & 0x10) return null; // system / "same as fill" colours: no fixed value
  return rgbToHex(r, g, b);
}
// ColorIndexStruct (text colours): index 0xFE = RGB, 0–7 = scheme slot.
function pptTextColor(v, scheme){
  if (v == null) return null;
  const idx = (v >>> 24) & 0xFF;
  if (idx === 0xFE) return rgbToHex(v & 0xFF, (v >>> 8) & 0xFF, (v >>> 16) & 0xFF);
  if (idx < 8) return scheme[idx] || null;
  return null;
}
// A boolean property set: `bit` is the value, `bit << 16` says it's set.
// Walks the lookup chain per bit; a set without any "set" markers is from
// an older writer and counts as fully specified.
function pptBoolIn(maps, id, bit, dflt){
  for (const m of maps){
    const e = m.get(id);
    if (!e) continue;
    const v = e.val >>> 0;
    if (v & (bit << 16)) return !!(v & bit);
    if (!(v >>> 16)) return !!(v & bit);
  }
  return dflt;
}
function pptFixed(props, id, dflt){ const e = props.get(id); return e ? e.val / 65536 : dflt; }

// Walk a drawing (OfficeArtDgContainer) → flat, slide-absolute shape list
// plus the background shape. Group children are mapped from the group's
// own coordinate space (FSPGR) onto its anchor.
function pptShapes(R, dgRec, defaults){
  const shapes = [];
  let background = null;
  const MU = 1 / 6; // master units (576 dpi) → px (96 dpi)
  const readSp = (sp, map) => {
    const own = new Map();
    own.__own = true;
    const s = { type: 0, flags: 0, own, anchor: null, child: null, spgr: null, textbox: null, clientData: null, grpIds: [] };
    for (const k of pptKids(R, sp)){
      switch (k.type){
        case 0xF00A: s.type = k.inst; s.spid = R.dv.getUint32(k.body, true); s.flags = R.dv.getUint32(k.body + 4, true); break;
        case 0xF00B: case 0xF122: pptFopt(R, k, s.own); break;
        case 0xF009: s.spgr = [0, 4, 8, 12].map(d => R.dv.getInt32(k.body + d, true)); break;
        case 0xF00F: s.child = [0, 4, 8, 12].map(d => R.dv.getInt32(k.body + d, true)); break; // left, top, right, bottom
        case 0xF010:
          // [top, left, right, bottom]: RectStruct (int32) or SmallRectStruct (int16)
          if (k.len >= 16) s.anchor = [0, 4, 8, 12].map(d => R.dv.getInt32(k.body + d, true));
          else if (k.len >= 8) s.anchor = [0, 2, 4, 6].map(d => R.dv.getInt16(k.body + d, true));
          break;
        case 0xF011: s.clientData = k; break;
        case 0xF00D: s.textbox = k; break;
      }
    }
    // [left, top, right, bottom] in slide master units
    let rect = s.anchor ? [s.anchor[1], s.anchor[0], s.anchor[2], s.anchor[3]] : null;
    if (s.child && map) rect = map(s.child);
    s.rect = rect;
    if (rect) s.frame = { x: rnd(rect[0] * MU), y: rnd(rect[1] * MU), w: rnd((rect[2] - rect[0]) * MU), h: rnd((rect[3] - rect[1]) * MU) };
    return s;
  };
  const walkGroup = (grp, map, grpIds) => {
    const kids = pptKids(R, grp);
    let own = null, inner = map;
    kids.forEach((k, i) => {
      if (i === 0 && k.type === 0xF004){
        own = readSp(k, map);
        if (own.spgr && own.rect && !(own.flags & 0x4)){ // a real (non-patriarch) group: child space → its anchor
          const [gl, gt, gr, gb] = own.spgr, [al, at, ar, ab] = own.rect;
          const sx = gr !== gl ? (ar - al) / (gr - gl) : 1, sy = gb !== gt ? (ab - at) / (gb - gt) : 1;
          inner = c => [al + (c[0] - gl) * sx, at + (c[1] - gt) * sy, al + (c[2] - gl) * sx, at + (c[3] - gt) * sy];
        }
        return;
      }
      const ids = own && own.spid && !(own.flags & 0x4) ? [...grpIds, own.spid] : grpIds;
      if (k.type === 0xF003) walkGroup(k, inner, ids);
      else if (k.type === 0xF004){
        const s = readSp(k, inner);
        s.grpIds = ids;
        if (!(s.flags & 0x8)) shapes.push(s); // fDeleted
      }
    });
  };
  for (const k of pptKids(R, dgRec)){
    if (k.type === 0xF003) walkGroup(k, null, []);
    else if (k.type === 0xF004){ const s = readSp(k, null); if (s.flags & 0x400) background = s; }
  }
  return { shapes, background };
}

// ---- pictures: BStore entry → bento asset key ----
function pptBlipBytes(R, off){
  const r = pptRec(R, off);
  if (!r) return null;
  const uids = 1 + (r.inst & 1);
  let mime = null;
  switch (r.type){
    case 0xF01D: case 0xF02A: mime = 'image/jpeg'; break;
    case 0xF01E: mime = 'image/png'; break;
    case 0xF01F: mime = 'image/bmp'; break;
    case 0xF029: mime = 'image/tiff'; break;
    default: return { unsupported: true }; // EMF / WMF / PICT
  }
  let data = R.u8.subarray(r.body + 16 * uids + 1, r.body + r.len);
  if (mime === 'image/bmp' && data.length > 40){
    // a DIB lacks the 14-byte BITMAPFILEHEADER browsers need
    const ddv = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const hdr = ddv.getUint32(0, true), bits = ddv.getUint16(14, true), used = ddv.getUint32(32, true);
    const pal = bits <= 8 ? (used || (1 << bits)) * 4 : (ddv.getUint32(16, true) === 3 ? 12 : 0);
    const out = new Uint8Array(14 + data.length);
    const odv = new DataView(out.buffer);
    out[0] = 0x42; out[1] = 0x4D;
    odv.setUint32(2, out.length, true);
    odv.setUint32(10, 14 + hdr + pal, true);
    out.set(data, 14);
    data = out;
  }
  return { mime, data };
}
function bytesToBase64(u8){
  let s = '';
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(s);
}

// Freeform geometry of a legacy shape: pVertices (0x145) + pSegmentInfo
// (0x146) in the geoLeft/Top/Right/Bottom space (0x140–0x143, default
// 21600²) → an svg path. Guide-computed points and arc escapes are not
// evaluated — null, and the caller keeps a plain box.
function pptCustomPath(R, own){
  const arr = id => {
    const e = own.get(id);
    if (!e || !e.data || e.data.len < 6) return null;
    const o = e.data.off, n = R.dv.getUint16(o, true), cb = R.dv.getUint16(o + 4, true);
    return { o: o + 6, n, cb, end: e.data.off + e.data.len };
  };
  const V = arr(0x0145);
  if (!V || !V.n) return null;
  const pts = [];
  const size = V.cb === 0xFFF0 ? 4 : V.cb;
  if (size !== 4 && size !== 8) return null;
  for (let i = 0; i < V.n; i++){
    const o = V.o + i * size;
    if (o + size > V.end + 6) return null;
    if (size === 4){
      const x = R.dv.getUint16(o, true), y = R.dv.getUint16(o + 2, true);
      if (V.cb === 0xFFF0 && ((x & 0xFFF0) === 0x8000 || (y & 0xFFF0) === 0x8000)) return null; // guide reference
      pts.push([R.dv.getInt16(o, true), R.dv.getInt16(o + 2, true)]);
    } else pts.push([R.dv.getInt32(o, true), R.dv.getInt32(o + 4, true)]);
  }
  const gv = (id, d) => own.has(id) ? own.get(id).val : d;
  const gl = gv(0x0140, 0), gt = gv(0x0141, 0), gr = gv(0x0142, 21600), gb = gv(0x0143, 21600);
  if (gr === gl || gb === gt) return null;
  const f = n => Math.round(n * 100) / 100;
  const P = ([x, y]) => f((x - gl) * PATH_BOX / (gr - gl)) + ' ' + f((y - gt) * PATH_BOX / (gb - gt));
  let d = '', k = 0, filled = true;
  const S = arr(0x0146);
  if (!S){ d = 'M' + P(pts[0]) + pts.slice(1).map(q => 'L' + P(q)).join(''); }
  else for (let i = 0; i < S.n; i++){
    const w = R.dv.getUint16(S.o + i * 2, true), type = w >>> 13;
    const count = type === 5 ? (w & 0xFF) : (w & 0x1FFF);
    if (type === 0){ for (let c = 0; c < Math.max(1, count); c++){ if (!pts[k]) return null; d += 'L' + P(pts[k++]); } }
    else if (type === 1){ for (let c = 0; c < Math.max(1, count); c++){ if (!pts[k + 2]) return null; d += 'C' + P(pts[k]) + ' ' + P(pts[k + 1]) + ' ' + P(pts[k + 2]); k += 3; } }
    else if (type === 2){ if (!pts[k]) return null; d += 'M' + P(pts[k++]); }
    else if (type === 3) d += 'Z';
    else if (type === 4) continue;
    else if (type === 5){
      const esc = (w >>> 8) & 0x1F;
      if (esc === 10) filled = false;
      else if (esc === 9){ for (let c = 0; c < count; c++){ if (!pts[k + 1]) return null; d += 'Q' + P(pts[k]) + ' ' + P(pts[k + 1]); k += 2; } }
      else if (esc === 7 || esc === 8){ for (let c = 0; c < count; c++){ if (!pts[k]) return null; d += 'L' + P(pts[k++]); } }
      else if (esc >= 11) continue;
      else return null; // arcs and other escapes
    }
    else return null;
  }
  return d ? { d, box: [0, 0, PATH_BOX, PATH_BOX], filled } : null;
}

// PowerPoint's MSOSPT shape types → the DrawingML preset names the PPTX
// path already maps (GEOM_MAP / LINE_GEOMS / ARROW_ORIENTATION).
const SPT_PRST = {
  1: 'rect', 2: 'roundRect', 3: 'ellipse', 4: 'diamond', 5: 'triangle', 9: 'hexagon', 10: 'octagon',
  13: 'rightArrow', 15: 'homePlate', 20: 'line', 32: 'straightConnector1', 33: 'bentConnector2',
  34: 'bentConnector3', 35: 'bentConnector4', 36: 'bentConnector5', 37: 'curvedConnector2',
  38: 'curvedConnector3', 39: 'curvedConnector4', 40: 'curvedConnector5', 55: 'chevron', 56: 'pentagon',
  66: 'leftArrow', 67: 'downArrow', 68: 'upArrow', 109: 'flowChartProcess', 110: 'flowChartDecision',
  116: 'flowChartAlternateProcess', 120: 'flowChartConnector',
};
// Text types (TextHeaderAtom) and which master style they fall back to.
const PPT_TEXT_BASE = { 5: 1, 6: 0, 7: 1, 8: 1 };

// PowerPoint 2002+ keeps its animation timeline as a binary copy of the
// PPTX p:timing tree inside the slide's "___PPT10" programmable tag:
// ExtTimeNodeContainer (0xF144) nodes whose TimeVariant properties carry the
// same presetID (0x09), presetSubtype (0x0A), presetClass (0x0B, 1 = entr)
// and node type (0x14: 1 click, 2 with, 3 after previous). Files written by
// other programs (LibreOffice …) only have this form, not the 97-style
// AnimationInfo — so it's read first. Targets: VisualShapeAtom (0x2AFB),
// a shape id, or a character range of its text.
function pptTiming10(R, slideRec){
  const tags = pptKid(R, slideRec, 0x1388);
  let root = null;
  for (const c of pptKids(R, tags)){
    if (c.type !== 0x138A) continue;
    const name = pptKid(R, c, 0x0FBA);
    if (!name || pptUtf16(R, name.body, name.len) !== '___PPT10') continue;
    const blob = pptKid(R, c, 0x138B);
    root = blob ? pptKid(R, blob, 0xF144) : null;
  }
  if (!root) return null;
  const res = { shapes: new Map(), ranges: new Map(), dropped: new Set() };
  const propsOf = node => {
    const out = {};
    for (const v of pptKids(R, pptKid(R, node, 0xF13D))){
      if (v.type !== 0xF142) continue;
      const t = R.u8[v.body];
      out[v.inst] = t === 1 ? R.dv.getInt32(v.body + 1, true) : t === 0 ? R.u8[v.body + 1] : t === 2 ? R.dv.getFloat32(v.body + 1, true) : null;
    }
    return out;
  };
  let step = 0, order = 0, inMain = false;
  const walk = (node, depth) => {
    if (depth > 40) return;
    const p = propsOf(node);
    if (p[0x14] === 4) inMain = true;
    if (inMain && p[0x0B] != null && [1, 2, 3].includes(p[0x14])){
      if (p[0x14] === 1){ step++; order = 0; } else if (p[0x14] === 3) order++;
      if (p[0x0B] !== 1){ res.dropped.add(p[0x0B]); return; }
      let target = null, dur = 0;
      const scan = (r, d) => {
        for (const k of pptKids(R, r)){
          if (k.type === 0xF127 && k.len >= 28){ const du = R.dv.getInt32(k.body + 24, true); if (du > dur) dur = du; }
          if (k.type === 0x2AFB && !target) target = { type: R.dv.getUint32(k.body, true), id: R.dv.getUint32(k.body + 8, true), start: R.dv.getInt32(k.body + 12, true) };
          if (k.ver === 0xF && d < 30) scan(k, d + 1);
        }
      };
      scan(node, 0);
      if (!target) return;
      const fx = { step, order, enter: enterKindFor(p[0x09] || 0, p[0x0A] || 0), dur };
      if (target.type === 2){
        let m = res.ranges.get(target.id);
        if (!m){ m = new Map(); res.ranges.set(target.id, m); }
        if (!m.has(target.start)) m.set(target.start, fx);
      } else if (!res.shapes.has(target.id)) res.shapes.set(target.id, fx);
      return;
    }
    for (const k of pptKids(R, node)) if (k.type === 0xF144) walk(k, depth + 1);
  };
  walk(root, 0);
  return res;
}

async function convertPpt(file){
  const streams = cfbStreams(await file.arrayBuffer());
  if (streams.has('EncryptedSummary')) throw new Error('Passwortgeschützte .ppt-Dateien können nicht gelesen werden — bitte ohne Kennwort speichern.');
  const docStream = streams.get('PowerPoint Document');
  if (!docStream) throw new Error('Keine PowerPoint-Präsentation (Stream „PowerPoint Document“ fehlt).');
  const R = pptReader(docStream);
  const P = streams.get('Pictures') ? pptReader(streams.get('Pictures')) : null;
  const { persist, docRef } = pptPersist(R, streams.get('Current User'));
  const at = id => pptRec(R, persist.get(id));
  const docRec = at(docRef);
  if (!docRec || docRec.type !== 0x03E8) throw new Error('Beschädigte .ppt-Datei (Dokument nicht gefunden).');
  const warnings = new Set();
  const warn = m => warnings.add(m);

  // document-wide parts
  let slideW = 960, slideH = 720;
  const fonts = [];
  const envStyles = {};
  const lists = { 0: [], 1: [], 2: [] };
  let bstore = [], defaults = new Map();
  for (const k of pptKids(R, docRec)){
    if (k.type === 0x03E9){ slideW = rnd(R.dv.getInt32(k.body, true) / 6); slideH = rnd(R.dv.getInt32(k.body + 4, true) / 6); }
    else if (k.type === 0x03F2){
      const fc = pptKid(R, k, 0x07D5);
      for (const f of pptKids(R, fc)) if (f.type === 0x0FB7) fonts[f.inst] = pptUtf16(R, f.body, 64);
      for (const t of pptKids(R, k)) if (t.type === 0x0FA3) envStyles[t.inst] = pptMasterStyle(R, t);
    } else if (k.type === 0x040B){
      const dgg = pptKid(R, k, 0xF000);
      const bs = pptKid(R, dgg, 0xF001);
      bstore = pptKids(R, bs).filter(r => r.type === 0xF007);
      const opt = pptKid(R, dgg, 0xF00B);
      if (opt) pptFopt(R, opt, defaults);
    } else if (k.type === 0x0FF0 && lists[k.inst]){
      // slide list: a SlidePersistAtom, then the texts of that slide's
      // placeholders (older files keep placeholder text here, not in the shape)
      let cur = null;
      for (const r of pptKids(R, k)){
        if (r.type === 0x03F3){ cur = { persistId: R.dv.getUint32(r.body, true), slideId: R.dv.getUint32(r.body + 12, true), texts: [] }; lists[k.inst].push(cur); }
        else if (cur && r.type === 0x0F9F) cur.texts.push({ type: R.dv.getUint32(r.body, true), recs: [] });
        else if (cur && cur.texts.length) cur.texts[cur.texts.length - 1].recs.push(r);
      }
    }
  }
  const bySlideId = inst => new Map(lists[inst].map(e => [e.slideId, e]));
  const masters = bySlideId(1), notesById = bySlideId(2);

  const assets = {};
  let assetN = 1;
  const pibKey = new Map();
  const blipAsset = pib => {
    if (!pib || pib < 1 || pib > bstore.length) return null;
    if (pibKey.has(pib)) return pibKey.get(pib);
    const fbse = bstore[pib - 1];
    const cbName = R.u8[fbse.body + 33];
    const foDelay = R.dv.getUint32(fbse.body + 28, true);
    let blip = null;
    if (fbse.len > 36 + cbName) blip = pptBlipBytes(R, fbse.body + 36 + cbName);
    else if (P) blip = pptBlipBytes(P, foDelay);
    let key = null;
    if (blip && blip.data){ key = 'img' + (assetN++); assets[key] = 'data:' + blip.mime + ';base64,' + bytesToBase64(blip.data); }
    else warn('Ein Bild in einem nicht unterstützten Format (z.B. WMF/EMF) wurde übersprungen.');
    pibKey.set(pib, key);
    return key;
  };
  const keyFirstId = new Map();

  // a slide/master container → the parts the converter needs
  const partOf = rec => {
    const out = { rec, atom: null, drawing: null, scheme: null, styles: {}, transition: null };
    for (const k of pptKids(R, rec)){
      if (k.type === 0x03EF) out.atom = {
        masterId: R.dv.getUint32(k.body + 12, true), notesId: R.dv.getUint32(k.body + 16, true),
        flags: R.dv.getUint16(k.body + 20, true),
      };
      else if (k.type === 0x040C) out.drawing = pptKid(R, k, 0xF002);
      else if (k.type === 0x07F0 && (k.inst === 1 || !out.scheme)){
        out.scheme = [];
        for (let i = 0; i < 8; i++) out.scheme.push(rgbToHex(R.u8[k.body + i * 4], R.u8[k.body + i * 4 + 1], R.u8[k.body + i * 4 + 2]));
      }
      else if (k.type === 0x0FA3) out.styles[k.inst] = pptMasterStyle(R, k);
      else if (k.type === 0x03F9) out.transition = {
        effectDir: R.u8[k.body + 8], effect: R.u8[k.body + 9], flags: R.dv.getUint16(k.body + 10, true),
      };
    }
    return out;
  };
  const masterCache = new Map();
  const masterPart = id => {
    if (!masterCache.has(id)){
      const e = masters.get(id);
      const rec = e ? at(e.persistId) : null;
      const part = rec ? partOf(rec) : null;
      if (part){
        part.entry = e;
        // a title master is itself based on the main master
        if (rec.type !== 0x03F8 && part.atom && part.atom.masterId && part.atom.masterId !== id) part.parent = masterPart(part.atom.masterId);
      }
      masterCache.set(id, part);
    }
    return masterCache.get(id);
  };
  const DEFAULT_SCHEME = ['#FFFFFF', '#000000', '#808080', '#000000', '#BBE0E3', '#333399', '#009999', '#99CC00'];

  // text of one shape: its own records, or the slide list's entry it points at
  const textOf = (sp, entry) => {
    if (!sp.textbox) return null;
    const kids = pptKids(R, sp.textbox);
    let recs = kids, type = 4;
    const hdr = kids.find(r => r.type === 0x0F9F);
    if (hdr) type = R.dv.getUint32(hdr.body, true);
    const ref = kids.find(r => r.type === 0x0F9E);
    if (ref && entry){
      const t = entry.texts[R.dv.getInt32(ref.body, true)];
      if (!t) return null;
      recs = t.recs; type = t.type;
    }
    let text = null;
    const chars = recs.find(r => r.type === 0x0FA0), bytes = recs.find(r => r.type === 0x0FA8);
    if (chars){ text = ''; for (let i = 0; i + 1 < chars.len; i += 2) text += String.fromCharCode(R.dv.getUint16(chars.body + i, true)); }
    else if (bytes){ text = ''; for (let i = 0; i < bytes.len; i++) text += String.fromCharCode(R.u8[bytes.body + i]); }
    if (text == null) return null;
    const style = recs.find(r => r.type === 0x0FA1);
    const fields = new Map();
    for (const r of recs){
      if (r.type === 0x0FD8) fields.set(R.dv.getInt32(r.body, true), '{{page}}');
      else if (r.type === 0x0FF7 || r.type === 0x0FF8) fields.set(R.dv.getInt32(r.body, true), '{{date}}');
    }
    return { text, type, runs: style ? pptStyleRuns(R, style, text.length) : { pf: [], cf: [] }, fields };
  };

  // one text body → the {paras, html, style} shape assembleTextInfo builds
  const textInfo = (t, master, scheme) => {
    const styleFor = (type, lvl) => {
      const pick = src => { const s = src && (src[type] || (PPT_TEXT_BASE[type] != null ? src[PPT_TEXT_BASE[type]] : null)); return s && (s[lvl] || s[0]); };
      const chain = [];
      // a master level stores only what differs from the level below it
      const levels = st => { const out = []; if (st) for (let k = Math.min(lvl, st.length - 1); k >= 0; k--) out.push(st[k]); return out; };
      for (let m = master; m; m = m.parent){
        chain.push(...levels(m.styles[type]));
        if (PPT_TEXT_BASE[type] != null) chain.push(...levels(m.styles[PPT_TEXT_BASE[type]]));
      }
      const env = pick(envStyles) || (envStyles[4] && envStyles[4][0]);
      if (env) chain.push(env);
      return chain.filter(Boolean);
    };
    const firstOf = (list, get) => { for (const x of list){ const v = get(x); if (v != null) return v; } return null; };
    const len = t.text.length;
    const pfAt = [], cfAt = [];
    let i = 0;
    for (const r of t.runs.pf){ for (let k = 0; k < r.count && i <= len; k++) pfAt[i++] = r; }
    i = 0;
    for (const r of t.runs.cf){ for (let k = 0; k < r.count && i <= len; k++) cfAt[i++] = r.props; }
    const out = [], allRuns = [];
    let algnFirst = null, lnFirst = null;
    let start = 0;
    const counters = [];
    const paraTexts = t.text.split('\r');
    for (const ptext of paraTexts){
      const pr = pfAt[start] || { indent: 0, props: {} };
      const lvl = Math.min(4, pr.indent || 0);
      const ms = styleFor(t.type, lvl);
      const pfp = [pr.props, ...ms.map(m => m.pf)];
      const align = firstOf(pfp, p => p.align);
      const runs = [];
      let cur = null;
      for (let k = 0; k < ptext.length; k++){
        const ci = start + k;
        const ch = ptext[k];
        if (ch === '\x0B'){ runs.push({ br: true }); cur = null; continue; }
        const cfp = [cfAt[ci] || {}, ...ms.map(m => m.cf)];
        const sz = firstOf(cfp, c => c.size) || 18;
        const col = pptTextColor(firstOf(cfp, c => c.color), scheme) || scheme[1] || '#000000';
        const fi = firstOf(cfp, c => c.font);
        const run = {
          size: Math.max(1, ptToPx(sz)), color: col, font: fonts[fi || 0] || null,
          bold: !!firstOf(cfp, c => c.bold), italic: !!firstOf(cfp, c => c.italic), underline: !!firstOf(cfp, c => c.underline), strike: false,
        };
        const piece = t.fields.has(ci) ? t.fields.get(ci) : (ch === '\t' ? '\u00A0\u00A0\u00A0\u00A0' : symbolChar(ch, run.font));
        const same = cur && ['size', 'color', 'font', 'bold', 'italic', 'underline'].every(p => cur[p] === run[p]);
        if (same) cur.text += piece;
        else { cur = Object.assign(run, { text: piece }); runs.push(cur); allRuns.push(cur); }
      }
      const plain = runs.map(r => r.br ? '\n' : r.text).join('');
      let bullet = '';
      if (plain.trim()){
        if (algnFirst === null) algnFirst = ['l', 'ctr', 'r', 'just'][align || 0] || 'l';
        const ls = firstOf(pfp, p => p.lineSpacing);
        if (lnFirst === null && ls > 0) lnFirst = ls / 100;
        counters.length = lvl + 1;
        counters[lvl] = 0;
        if (firstOf(pfp, p => p.hasBullet)){
          const code = firstOf(pfp, p => p.bulletChar);
          const bf = firstOf(pfp, p => p.bulletHasFont ? p.bulletFont : null);
          // map symbol-font bullets to real characters here; bulletText gets no font
          bullet = bulletText({ kind: 'char', char: code ? symbolChar(String.fromCharCode(code), bf != null ? fonts[bf] : '') : '•' }, 0);
        }
      }
      out.push({ runs, plain, bullet, lvl });
      start += ptext.length + 1;
    }
    if (!allRuns.some(r => r.text.trim())) return null;
    return assembleTextInfo(out, allRuns, algnFirst, lnFirst);
  };

  // one shape → bento elements
  const convertShape = (sp, ctx, elId) => {
    const out = [];
    if (!sp.frame) return out;
    const scheme = ctx.scheme;
    const ph = (() => { const pa = ctx.clientKids(sp).find(r => r.type === 0x0BC3); return pa ? R.u8[pa.body + 4] : 0; })();
    // Property lookup chain. A placeholder takes what it doesn't set itself
    // from the master's placeholder (whose defaults are "no fill, no line");
    // any other shape from the drawing defaults. Boolean sets are resolved
    // PER BIT — a shape that only sets two unrelated bits of the fill set
    // still inherits "filled" from further up.
    const mph = ph ? ctx.masterPh(ph) : null;
    const chain = ph ? [sp.own, mph ? mph.own : null].filter(Boolean) : [sp.own, defaults];
    const pv = (id, d) => { for (const m of chain) if (m.has(id)) return m.get(id).val; return d; };
    const pfix = (id, d) => { const v = pv(id, null); return v == null ? d : v / 65536; };
    const pbool = (id, bit, d) => pptBoolIn(chain, id, bit, d);
    const rot = pfix(0x0004, 0);
    let frame = Object.assign({ rotation: Math.round(rot * 10) / 10, flipH: !!(sp.flags & 0x40), flipV: !!(sp.flags & 0x80) }, sp.frame);
    // shapes turned 45–135° / 225–315° store their bounds pre-rotated
    const nr = ((rot % 360) + 360) % 360;
    if ((nr >= 45 && nr < 135) || (nr >= 225 && nr < 315)){
      const cx = frame.x + frame.w / 2, cy = frame.y + frame.h / 2;
      frame = Object.assign({}, frame, { x: rnd(cx - frame.h / 2), y: rnd(cy - frame.w / 2), w: frame.h, h: frame.w });
    }
    if (pbool(0x03BF, 0x2, false)) return out; // hidden
    const anim = ctx.animOf(sp);
    const fx = anim ? bentoFx(anim) : null;
    const withFx = el => { if (el && fx) el.fx = Object.assign({}, fx); return el; };
    const prst = SPT_PRST[sp.type] || 'rect';

    // pictures (picture frames, OLE previews) and picture fills
    const pib = sp.own.has(0x0104) ? sp.own.get(0x0104).val : 0;
    const fillType = pv(0x0180, 0);
    const blipPib = pib || ((fillType === 2 || fillType === 3) ? pv(0x0186, 0) : 0);
    if (blipPib){
      const key = blipAsset(blipPib);
      if (key){
        // a picture FILL may still get an outline shape with elId below
        const el = { id: pib ? elId : elId + 'i', type: 'image', x: frame.x, y: frame.y, w: frame.w, h: frame.h, rotation: frame.rotation, opacity: 1, src: 'asset:' + key, fit: 'cover', radius: 0 };
        if (pib){
          const [t, b, l, r] = [0x0100, 0x0101, 0x0102, 0x0103].map(id => pfix(id, 0));
          if (t >= 0 && b >= 0 && l >= 0 && r >= 0 && (t || b || l || r) && l + r < 1 && t + b < 1)
            el.crop = { x: Math.round(l * 10000) / 10000, y: Math.round(t * 10000) / 10000, w: Math.round((1 - l - r) * 10000) / 10000, h: Math.round((1 - t - b) * 10000) / 10000 };
          const d = sp.own.get(0x0381);
          const alt = d && d.data ? pptUtf16(R, d.data.off, d.data.len).trim() : '';
          if (alt) el.alt = alt.replace(/\s+/g, ' ');
        }
        const first = keyFirstId.get(key);
        if (!first) keyFirstId.set(key, el.id); else if (first !== el.id) el.morphId = first;
        out.push(withFx(el));
      } else if (sp.flags & 0x10){
        ctx.warn('Ein eingebettetes Objekt (OLE, z.B. ein MS-Graph-Diagramm) hatte nur ein WMF/EMF-Vorschaubild — als Platzhalter markiert.');
        out.push({ id: elId, type: 'text', x: frame.x, y: frame.y, w: frame.w, h: frame.h, rotation: 0, opacity: 1,
          html: '[Objekt aus PowerPoint — manuell nachbauen]', fontSize: Math.max(10, Math.min(20, rnd(frame.h / 5), rnd(frame.w / 12))),
          fontFamily: 'system-ui, sans-serif', fontWeight: 500, color: '#999999', align: 'left', valign: 'top', lineHeight: 1.3 });
      }
      if (pib) return out;
    }

    const lineOn = pbool(0x01FF, 0x8, !ph);
    const lineColor = lineOn ? pptColorRef(pv(0x01C0, 0), scheme) : null;
    const dashV = pv(0x01CE, 0);
    const arrow = id => { const v = pv(id, 0); return !v ? null : (v === 4 ? 'dot' : 'arrow'); };
    const line = lineColor ? {
      color: lineColor,
      width: Math.max(1, Math.round(pv(0x01CB, 9525) / EMU_PER_PX * 10) / 10),
      dash: !dashV ? null : (dashV === 2 || dashV === 5 ? 'dotted' : 'dashed'),
      head: arrow(0x01D0), tail: arrow(0x01D1),
    } : null;
    if (LINE_GEOMS.test(prst) || (sp.flags & 0x100)){
      if (line) out.push(withFx(lineElement(frame, line, elId)));
      return out.filter(Boolean);
    }

    const custom = sp.type === 0 ? pptCustomPath(R, sp.own) : null;
    const filled = pbool(0x01BF, 0x10, !ph && sp.type !== 202 && sp.type !== 0) && (!custom || custom.filled);
    let fill = null;
    if (filled && !blipPib){
      const c1 = pptColorRef(pv(0x0181, 0xFFFFFF), scheme) || '#FFFFFF';
      const op = pfix(0x0182, 1);
      const withA = (hex, a) => a >= 0.995 ? hex : clrCss({ rgb: hexToRgb(hex), a });
      fill = { color: withA(c1, op) };
      if (fillType >= 4 && fillType <= 8){
        const c2 = pptColorRef(pv(0x0183, 0xFFFFFF), scheme) || '#FFFFFF';
        const focus = pv(0x018C, 0);
        const a = pfix(0x018B, 0);
        const angle = Math.round((((180 - a) % 360) + 360) % 360);
        const stops = focus === 50 || focus === -50
          ? [{ at: 0, color: withA(c1, op) }, { at: 0.5, color: withA(c2, pfix(0x0184, 1)) }, { at: 1, color: withA(c1, op) }]
          : focus === 100 || focus === -100
            ? [{ at: 0, color: withA(c2, pfix(0x0184, 1)) }, { at: 1, color: withA(c1, op) }]
            : [{ at: 0, color: withA(c1, op) }, { at: 1, color: withA(c2, pfix(0x0184, 1)) }];
        fill.grad = { angle, stops };
      }
    }
    const t = textOf(sp, ctx.entry);
    const info = t ? textInfo(t, ctx.master, scheme) : null;
    // an empty placeholder paints nothing (its fill/outline come from the master's prompt)
    if (ph && !info) return out;
    if (fill || line){
      const orient = ARROW_ORIENTATION[prst];
      const shapeW = (orient && orient.swapWH) ? frame.h : frame.w;
      const shapeH = (orient && orient.swapWH) ? frame.w : frame.h;
      const el = {
        id: elId, type: 'shape', shape: GEOM_MAP[prst] || 'rect',
        x: (orient && orient.swapWH) ? rnd(frame.x + (frame.w - shapeW) / 2) : frame.x,
        y: (orient && orient.swapWH) ? rnd(frame.y + (frame.h - shapeH) / 2) : frame.y,
        w: shapeW, h: shapeH,
        rotation: frame.rotation + (orient ? orient.extraRotation : 0), opacity: 1,
        fill: fill ? fill.color : 'transparent',
        stroke: line ? line.color : 'none', strokeWidth: line ? line.width : 0, radius: 0,
      };
      if (fill && fill.grad) el.fillGradient = fill.grad;
      if (line && line.dash) el.strokeStyle = line.dash;
      if (el.shape === 'polygon') el.sides = POLYGON_SIDES[prst] || 6;
      if (custom){ el.shape = 'path'; el.d = custom.d; el.pathBox = custom.box; }
      if (prst === 'roundRect' || prst === 'flowChartAlternateProcess'){
        const adj = pv(0x0147, 3600);
        el.radius = rnd(Math.min(frame.w, frame.h) * Math.max(0, Math.min(0.5, adj / 21600)));
      }
      out.push(withFx(el));
    }
    if (info){
      // text anchor + insets (a placeholder's come from the master's)
      const ins = id => pv(id, id === 0x0081 || id === 0x0083 ? 91440 : 45720) / EMU_PER_PX;
      const [l, tp, r, b] = [ins(0x0081), ins(0x0082), ins(0x0083), ins(0x0084)];
      const anchor = pv(0x0087, 0);
      const valign = [0, 3, 6, 8].includes(anchor) ? 'top' : [1, 4, 7, 9].includes(anchor) ? 'middle' : 'bottom';
      const box = { x: frame.x + l, y: frame.y + tp, w: Math.max(8, frame.w - l - r), h: Math.max(8, frame.h - tp - b), rotation: frame.rotation };
      const textId = (fill || line) ? elId + 't' : elId;
      if (anim && anim.byPara && info.paras.length > 1) out.push(...paragraphElements(textId, box, info, valign, anim.byPara, fx));
      else out.push(withFx(textElement(textId, box, info, valign)));
    }
    return out;
  };

  // background: the drawing's background shape (own, or the master's)
  const backgroundOf = (bgSp, part, scheme) => {
    if (!bgSp) return { color: scheme[0] || '#FFFFFF' };
    // only the background shape's OWN properties: the drawing defaults are
    // for new shapes, and the format default fill is white
    const props = bgSp.own;
    if (!pptBoolIn([props], 0x01BF, 0x10, true)) return { color: '#FFFFFF' };
    const ft = props.has(0x0180) ? props.get(0x0180).val : 0;
    const c1 = pptColorRef(props.has(0x0181) ? props.get(0x0181).val : 0xFFFFFF, scheme) || '#FFFFFF';
    if ((ft === 2 || ft === 3) && props.get(0x0186)){
      const key = blipAsset(props.get(0x0186).val);
      if (key) return { color: c1, image: key };
    }
    if (ft >= 4 && ft <= 8){
      const c2 = pptColorRef(props.has(0x0183) ? props.get(0x0183).val : 0xFFFFFF, scheme) || '#FFFFFF';
      const a = pptFixed(props, 0x018B, 0);
      const focus = props.has(0x018C) ? props.get(0x018C).val : 0;
      const [s0, s1] = focus === 100 || focus === -100 ? [c2, c1] : [c1, c2];
      const stops = focus === 50 || focus === -50 ? [{ at: 0, color: c1 }, { at: 0.5, color: c2 }, { at: 1, color: c1 }] : [{ at: 0, color: s0 }, { at: 1, color: s1 }];
      return { color: stops[0].color, grad: { angle: Math.round((((180 - a) % 360) + 360) % 360), stops } };
    }
    return { color: c1 };
  };

  // old-style (97-compatible) animation info, kept by every PowerPoint version
  const animOfFactory = () => {
    const list = [];
    return {
      collect: (sp, clientKids) => {
        const ac = clientKids(sp).find(r => r.type === 0x1014);
        const a = ac ? pptKid(R, ac, 0x0FF1) : null;
        if (!a || a.len < 24) return;
        list.push({ sp, flags: R.dv.getUint16(a.body + 4, true), order: R.dv.getUint16(a.body + 14, true),
          build: R.u8[a.body + 18], effect: R.u8[a.body + 19], dir: R.u8[a.body + 20] });
      },
      resolve: () => {
        const map = new Map();
        let step = 0, order = 0;
        list.sort((x, y) => x.order - y.order);
        for (const a of list){
          if (a.flags & 0x4){ order++; } else { step++; order = 0; }
          const enter = a.effect === 0 ? null : a.effect === 12
            ? ({ 0: 'slide-right', 1: 'slide-down', 2: 'slide-left', 3: 'slide-up' }[a.dir] || 'slide-up')
            : 'fade';
          const fx = { step, order, enter, dur: 0 };
          if (a.build >= 1){
            // text build by paragraph: each further paragraph is one more click
            const byPara = new Map();
            const t = textOf(a.sp, null);
            const n = t ? t.text.split('\r').length : 1;
            for (let k = 0; k < n; k++){
              if (k > 0 && !(a.flags & 0x4)) step++;
              byPara.set(k, { step, order, enter, dur: 0 });
            }
            fx.byPara = byPara;
          }
          map.set(a.sp, fx);
        }
        return map;
      },
    };
  };

  const slides = [];
  const clientKids = sp => sp.clientData ? pptKids(R, sp.clientData) : [];
  // a slide placeholder's counterpart on the master (title ↔ master title, …)
  const PH_MASTER = { 13: [1], 15: [3, 1], 14: [2], 18: [2], 19: [2], 16: [4, 2] };
  const masterShapes = m => { if (!m.shapesCache) m.shapesCache = m.drawing ? pptShapes(R, m.drawing, defaults).shapes : []; return m.shapesCache; };
  const masterPhOf = (master, type) => {
    for (const want of PH_MASTER[type] || []){
      for (let m = master; m; m = m.parent){
        const hit = masterShapes(m).find(sp => { const pa = clientKids(sp).find(r => r.type === 0x0BC3); return pa && R.u8[pa.body + 4] === want; });
        if (hit) return hit;
      }
    }
    return null;
  };
  let docScheme = null, firstFont = fonts[0] || null;
  const masterElements = new Map();

  for (let i = 0; i < lists[0].length; i++){
    const entry = lists[0][i];
    const rec = at(entry.persistId);
    if (!rec || rec.type !== 0x03EE) continue;
    const part = partOf(rec);
    const master = part.atom ? masterPart(part.atom.masterId) : null;
    const mainMaster = master && master.parent ? master.parent : master;
    const flags = part.atom ? part.atom.flags : 0x7;
    const scheme = ((flags & 0x2) || !part.scheme ? (master && master.scheme) || (mainMaster && mainMaster.scheme) : part.scheme) || DEFAULT_SCHEME;
    if (!docScheme) docScheme = scheme;
    const ctx = { scheme, master, entry, warn, clientKids, animOf: () => null, masterPh: t => masterPhOf(master, t) };
    const elements = [];

    const own = part.drawing ? pptShapes(R, part.drawing, defaults) : { shapes: [], background: null };
    let bgSp = own.background, bgPart = part;
    if ((flags & 0x4) || !bgSp){
      for (const m of [master, mainMaster]){
        if (!m || !m.drawing) continue;
        const ms = pptShapes(R, m.drawing, defaults);
        if (ms.background){ bgSp = ms.background; bgPart = m; break; }
      }
    }
    const bg = backgroundOf(bgSp, bgPart, scheme);
    if (bg.image) elements.push({ id: 'bg_' + bg.image, type: 'image', x: 0, y: 0, w: slideW, h: slideH, rotation: 0, opacity: 1, src: 'asset:' + bg.image, fit: 'cover', radius: 0 });

    // master artwork (logos, bands) — same ids on every slide
    if (flags & 0x1){
      for (const m of [mainMaster, master !== mainMaster ? master : null]){
        if (!m || !m.drawing) continue;
        const mctx = Object.assign({}, ctx, { master: m, entry: null });
        const prefix = 'm' + m.entry.slideId + '_';
        let n = 1;
        for (const sp of pptShapes(R, m.drawing, defaults).shapes){
          if (clientKids(sp).some(r => r.type === 0x0BC3)) continue; // placeholder prompts
          elements.push(...convertShape(sp, mctx, prefix + 'e' + (n++)));
        }
      }
    }
    const t10 = pptTiming10(R, rec);
    let anims;
    if (t10 && (t10.shapes.size || t10.ranges.size || t10.dropped.size)){
      anims = new Map();
      for (const sp of own.shapes){
        const ids = [sp.spid, ...sp.grpIds.slice().reverse()];
        const hit = ids.map(id => t10.shapes.get(id)).find(Boolean);
        const ranges = t10.ranges.get(sp.spid);
        let byPara = null;
        if (ranges){
          // character offsets → paragraph indices of this shape's text
          const t = textOf(sp, entry);
          const starts = [];
          if (t) t.text.split('\r').reduce((o, para) => { starts.push(o); return o + para.length + 1; }, 0);
          byPara = new Map();
          for (const [off, fx] of ranges){
            let k = 0;
            while (k + 1 < starts.length && starts[k + 1] <= off) k++;
            if (!byPara.has(k)) byPara.set(k, fx);
          }
        }
        if (hit || byPara){
          const first = byPara ? Array.from(byPara.values()).sort((a, b) => a.step - b.step)[0] : null;
          anims.set(sp, Object.assign({}, hit || first, byPara ? { byPara } : {}));
        }
      }
      if ([...t10.dropped].length) warn('Nur Eingangsanimationen werden übernommen (als Klickschritte) — Hervorhebungs-, Ausgangs- und Pfadanimationen entfallen.');
    } else {
      const animCol = animOfFactory();
      own.shapes.forEach(sp => animCol.collect(sp, clientKids));
      anims = animCol.resolve();
    }
    ctx.animOf = sp => anims.get(sp) || null;
    let n = 1;
    for (const sp of own.shapes) elements.push(...convertShape(sp, ctx, 's' + (i + 1) + '_e' + (n++)));

    // speaker notes
    let notes = '';
    const ne = part.atom && part.atom.notesId ? notesById.get(part.atom.notesId) : null;
    const nrec = ne ? at(ne.persistId) : null;
    if (nrec){
      const npart = partOf(nrec);
      const texts = [];
      for (const sp of (npart.drawing ? pptShapes(R, npart.drawing, defaults).shapes : [])){
        const t = textOf(sp, ne);
        if (t && t.type === 2 && t.text.trim()) texts.push(t.text.replace(/\r/g, '\n').replace(/\x0B/g, '\n').trim());
      }
      notes = texts.join('\n');
    }

    const tr = part.transition;
    const EFFECTS_SLIDE = [2, 3, 4, 7, 9, 10, 13, 20, 21];
    const transition = !tr ? 'none'
      : tr.effect === 0 ? 'none'
      : [5, 6, 23].includes(tr.effect) ? 'fade'
      : EFFECTS_SLIDE.includes(tr.effect) ? 'slide'
      : [11, 22].includes(tr.effect) ? 'zoom' : 'fade';
    const slide = { id: 's' + (i + 1), background: bg.color, transition, elements, notes };
    if (bg.grad) slide.backgroundGradient = bg.grad;
    if (tr && (tr.flags & 0x4)) slide.hidden = true;
    slides.push(slide);
  }

  // Two elements with the same morph key on one slide break pairing.
  for (const s of slides){
    const seen = new Set();
    for (const e of s.elements){
      let k = e.morphId || e.id;
      if (seen.has(k) && e.morphId){ delete e.morphId; k = e.id; }
      seen.add(k);
    }
  }
  if (!slides.length) slides.push({
    id: 's1', background: '#FFFFFF', transition: 'none', notes: '',
    elements: [{ id: 't1', type: 'text', x: 96, y: rnd(slideH / 2 - 80), w: slideW - 192, h: 160, rotation: 0, opacity: 1,
      html: '(Keine Folien gefunden)', fontSize: 48, fontFamily: 'system-ui, sans-serif', fontWeight: 700,
      color: '#111111', align: 'left', valign: 'top', lineHeight: 1.1 }],
  });

  const sc = docScheme || DEFAULT_SCHEME;
  let title = file.name.replace(/\.ppt$/i, '');
  const doc = {
    format: 'bento/slides', version: 1, docId: uuid(), title,
    size: { width: slideW, height: slideH },
    theme: { background: sc[0], color: sc[1], accent: sc[5] || '#FF9E5E', fontFamily: fontStack(firstFont) },
    slides, modified: new Date().toISOString(),
  };
  if (Object.keys(assets).length) doc.assets = assets;
  warn('Aus dem alten .ppt-Format übernommen: Texte, Formen, Bilder, Hintergründe, Klick-Animationen, Übergänge und Notizen. Diagramme/Tabellen aus alten Dateien kommen als Einzelformen oder Platzhalter.');
  return { doc, warnings: Array.from(warnings), slideCount: slides.length };
}

// ---------------- Bento shell fetch + splice ----------------

// Primary source: the base64 blob embedded above (#bento-shell-b64) — a self-built
// v1.0.11 release of Bento_Slides.bento.html with an added image-crop feature
// (see the "Crop image…" button this patch adds to the Image properties panel),
// bundled 2026-08-01. This makes conversion work fully offline / independent of
// bento.page uptime, and gives you crop even before it's upstreamed.
// These URLs are only a fallback, used if the embedded copy is ever missing or
// corrupt (e.g. someone stripped it while editing this file). They point at the
// OFFICIAL nyblnet/bento build — no crop patch — so falling back here still works,
// just without the "Crop image…" button until the embedded copy is restored.
const SHELL_URLS = [
  'https://bento.page/releases/slides/Bento_Slides.bento.html',
  'https://bento.page/slides',
  'https://github.com/nyblnet/bento/releases/latest/download/Bento_Slides.bento.html',
  'https://github.com/nyblnet/bento/releases/download/v1.0.7/Bento_Slides.bento.html'
];
let shellCache = null;
let shellCacheError = null;

async function getShell(){
  if (shellCache) return shellCache;
  if (shellCacheError) throw shellCacheError;

  // 1) Bundled copy — embedded in this file, works fully offline.
  try{
    const el = document.getElementById('bento-shell-b64');
    if (el && el.textContent.trim()){
      const clean = el.textContent.replace(/\s+/g, '');
      const text = atob(clean);
      if (/id=["']bento-doc["']/.test(text)){
        shellCache = text;
        return text;
      }
    }
  } catch(e){ console.warn('Eingebettete Bento-Hülle unlesbar, versuche Netzwerk:', e); }

  // 2) Fallback — only reached if the bundled copy is missing or corrupt.
  let lastErr = null;
  for (const url of SHELL_URLS){
    try{
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) { lastErr = new Error('HTTP ' + res.status + ' von ' + url); continue; }
      const text = await res.text();
      if (!/id=["']bento-doc["']/.test(text)) { lastErr = new Error('Antwort von ' + url + ' enthält keinen bento-doc-Block'); continue; }
      shellCache = text;
      return text;
    } catch(e){ lastErr = e; }
  }
  shellCacheError = lastErr || new Error('Keine Bento-Hülle verfügbar (weder eingebettet noch per Netzwerk)');
  throw shellCacheError;
}

function spliceDoc(shellHtml, doc){
  const jsonStr = JSON.stringify(doc).replace(/</g, '\\u003c');
  const re = /(<script[^>]*id=["']bento-doc["'][^>]*>)([\s\S]*?)(<\/script>)/;
  if (!re.test(shellHtml)) throw new Error('bento-doc-Block nicht in der Hülle gefunden');
  return shellHtml.replace(re, (m, open, _old, close) => open + '\n' + jsonStr + '\n' + close);
}

async function buildBentoHtml(doc, filenameBase){
  const shell = await getShell();
  const html = spliceDoc(shell, doc);
  return { filename: filenameBase + '.bento.html', html };
}


// Port of bento's own findUsedAssetAndFontKeys (slides/src/model.ts) — same
// element-type coverage, since this file can't import that TypeScript
// module directly. Used by the split-into-parts feature below so each
// resulting part only carries the assets/fonts it actually references,
// not a full copy of everything in the original document.
function bentoFindUsedAssetAndFontKeys(doc) {
  var assetKeys = {};
  var fontFamiliesInUse = {};
  if (doc.theme && doc.theme.fontFamily) fontFamiliesInUse[doc.theme.fontFamily] = true;
  function assetKeyFrom(value) {
    return (typeof value === 'string' && value.indexOf('asset:') === 0) ? value.slice('asset:'.length) : null;
  }
  function visitElement(el) {
    if (!el || !el.type) return;
    if (el.type === 'image') {
      var src = assetKeyFrom(el.src); if (src) assetKeys[src] = true;
      var mask = assetKeyFrom(el.mask); if (mask) assetKeys[mask] = true;
    } else if (el.type === 'svg') {
      if (el.asset) assetKeys[el.asset] = true;
    } else if (el.type === 'media') {
      var msrc = assetKeyFrom(el.src); if (msrc) assetKeys[msrc] = true;
      var poster = assetKeyFrom(el.poster); if (poster) assetKeys[poster] = true;
    } else if (el.type === 'text') {
      if (el.fontFamily) fontFamiliesInUse[el.fontFamily] = true;
    } else if (el.type === 'table') {
      if (el.style && el.style.fontFamily) fontFamiliesInUse[el.style.fontFamily] = true;
    } else if (el.type === 'chart') {
      var m, re = /asset:([a-zA-Z0-9_-]+)/g, str = JSON.stringify(el.option || {});
      while ((m = re.exec(str))) assetKeys[m[1]] = true;
    }
  }
  function visitSlide(s) {
    (s.elements || []).forEach(visitElement);
  }
  (doc.slides || []).forEach(visitSlide);
  (doc.layouts || []).forEach(visitSlide);
  var fontKeys = {};
  (doc.fonts || []).forEach(function (f) {
    if (fontFamiliesInUse[f.family]) { fontKeys[f.asset] = true; assetKeys[f.asset] = true; }
  });
  return { assetKeys: assetKeys, fontKeys: fontKeys };
}

// Builds a standalone document from a contiguous slice of doc.slides,
// carrying over only the assets/fonts that slice actually references
// (via bentoFindUsedAssetAndFontKeys above) — this is the calculation the
// split-into-parts modal needs: each part should be a genuinely small,
// self-contained file, not a full copy of the original's every embedded
// image, most of which the part would never use.
function bentoBuildSplitDoc(doc, startIdx, endIdx) {
  var part = JSON.parse(JSON.stringify(doc));
  part.slides = (doc.slides || []).slice(startIdx, endIdx);
  var used = bentoFindUsedAssetAndFontKeys(part);
  if (part.assets) {
    Object.keys(part.assets).forEach(function (k) { if (!used.assetKeys[k]) delete part.assets[k]; });
  }
  if (part.fonts) {
    part.fonts = part.fonts.filter(function (f) { return used.fontKeys[f.asset]; });
  }
  return part;
}

/** Walks an arbitrary doc/slide/element subtree, replacing any
 *  "asset:<oldKey>" string reference found in keyMap with
 *  "asset:<keyMap[oldKey]>" — used wherever asset keys get renamed or
 *  merged onto an existing key (mergeDocs' own dedup-by-content below, and
 *  the shrink-assets modal's own duplicate removal). */
function bentoRemapAssetRefs(node, keyMap) {
  if (typeof node === 'string') {
    var m = /^asset:(.+)$/.exec(node);
    return (m && keyMap[m[1]]) ? 'asset:' + keyMap[m[1]] : node;
  }
  if (Array.isArray(node)) return node.map(function (n) { return bentoRemapAssetRefs(n, keyMap); });
  if (node && typeof node === 'object') {
    var out = {};
    for (var k in node) out[k] = bentoRemapAssetRefs(node[k], keyMap);
    return out;
  }
  return node;
}

function mergeDocs(docA, docB){
  const merged = JSON.parse(JSON.stringify(docA));
  merged.assets = merged.assets || {};
  const assetsB = docB.assets || {};
  // Reverse index (content -> existing key) so a content match reuses the
  // SAME key regardless of what docB happened to call it — this is the
  // actual dedup step; the collision loop below only ever renamed on a
  // key clash with a DIFFERENT value, never noticed a same-content asset
  // sitting under an unrelated key.
  const valueToKey = {};
  for (const [k, v] of Object.entries(merged.assets)) valueToKey[v] = k;
  const keyMap = {}; // key in B -> key in merged (set whenever B's own key isn't what ends up being used, whether from a rename or a content-dedup reuse)
  for (const [key, val] of Object.entries(assetsB)){
    if (Object.prototype.hasOwnProperty.call(valueToKey, val)) {
      // Identical content already present under some key — reuse it,
      // store nothing new.
      if (valueToKey[val] !== key) keyMap[key] = valueToKey[val];
      continue;
    }
    let newKey = key;
    if (Object.prototype.hasOwnProperty.call(merged.assets, newKey)){
      let i = 1;
      while (Object.prototype.hasOwnProperty.call(merged.assets, key + '_' + i)) i++;
      newKey = key + '_' + i;
    }
    merged.assets[newKey] = val;
    valueToKey[val] = newKey;
    if (newKey !== key) keyMap[key] = newKey;
  }

  const slidesB = JSON.parse(JSON.stringify(docB.slides || []));
  const usedIds = new Set(merged.slides.map(s => s.id));
  const idMap = {};
  for (const slide of slidesB){
    let newId = slide.id;
    let i = 1;
    while (usedIds.has(newId)) newId = slide.id + '_' + (i++);
    usedIds.add(newId);
    idMap[slide.id] = newId;
  }
  const remapAssetRefs = (node) => bentoRemapAssetRefs(node, keyMap);
  for (const slide of slidesB){
    slide.id = idMap[slide.id] || slide.id;
    if (slide.stateOf && idMap[slide.stateOf]) slide.stateOf = idMap[slide.stateOf];
  }
  merged.slides.push(...slidesB.map(remapAssetRefs));
  merged.title = (docA.title || 'Deck') + ' + ' + (docB.title || 'Deck');
  merged.docId = (crypto.randomUUID ? crypto.randomUUID() : 'merged-' + Date.now());
  merged.modified = new Date().toISOString();
  return merged;
}
// Wires the always-available import/merge widget in mod_form.php: drop one
// or more .pptx/.json/.bento.html files, drag to reorder, ✚ between cards to
// merge (same mergeDocs() as the standalone converter tool, bentoconvert.js),
// remove a card outright. Whatever's left in the list becomes the hidden
// `document` field's value — auto-merged in order at save time regardless
// of whether every ✚ was clicked manually (see syncDocField/
// computeCombinedDoc), so nothing left un-merged is ever silently dropped.
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var drop = document.getElementById('mod-bento-drop');
    var fileInput = document.getElementById('mod-bento-file');
    var itemsEl = document.getElementById('mod-bento-items');
    var bentoCmId = (function () {
      var el = document.getElementById('mod-bento-importer');
      var v = el && parseInt(el.dataset.cmid, 10);
      return v ? v : 0;
    })();
    var bentoSaveTimeoutMs = (function () {
      var el = document.getElementById('mod-bento-importer');
      var v = el && parseInt(el.dataset.savetimeout, 10);
      return (v && v > 0 ? v : 600) * 1000;
    })();
    var bentoMaxBytes = (function () {
      var el = document.getElementById('mod-bento-importer');
      var v = el && parseInt(el.dataset.maxbytes, 10);
      return (v && v > 0) ? v : 20 * 1024 * 1024;
    })();
    var bentoImageMaxDim = (function () {
      var el = document.getElementById('mod-bento-importer');
      var v = el && parseInt(el.dataset.imagemaxdim, 10);
      return (v && v > 0) ? v : 1920;
    })();
    var bentoImageQuality = (function () {
      var el = document.getElementById('mod-bento-importer');
      var v = el && parseInt(el.dataset.imagequality, 10);
      return (v && v > 0) ? v / 100 : 0.85;
    })();
    // Mutable (not const) — updated in place whenever the eye-icon toggle
    // below actually succeeds, so re-rendering the cards afterward shows
    // the new state immediately without needing a full page reload.
    var bentoDocumentVisible = (function () {
      var el = document.getElementById('mod-bento-importer');
      var v = el ? parseInt(el.dataset.documentvisible, 10) : 1;
      return isNaN(v) ? 1 : v;
    })();
    // Global save-in-flight lock — defense in depth against two save/
    // promote operations on this page (Speichern, the eye toggle, the
    // whole-form AJAX-first submit) running concurrently and colliding
    // with each other. bentoWithSaveLock() below is what every one of
    // them should go through.
    var bentoSaveInFlight = false;
    /** Runs `task()` (a function returning a Promise) only if no other
     *  save/promote is currently in flight — otherwise alerts and
     *  returns a rejected Promise immediately, without ever starting
     *  `task()` at all. */
    function bentoWithSaveLock(task) {
      if (bentoSaveInFlight) {
        alert('Es läuft bereits ein anderer Speichervorgang — bitte kurz warten und erneut versuchen.');
        return Promise.reject(new Error('save already in flight'));
      }
      bentoSaveInFlight = true;
      return task().finally(function () { bentoSaveInFlight = false; });
    }
    // Draft decks (bento_decks, saved independently of the published
    // document) need mod/bento:edit — only true on mod_form.php's own
    // importer. submission_new.php's own students only ever have
    // mod/bento:submit, one row (bento_submissions), no drafts concept at
    // all — every card's own Speichern there just saves it AS the
    // submission directly, regardless of its position in the list.
    var bentoCanDeck = (function () {
      var el = document.getElementById('mod-bento-importer');
      return !!(el && el.dataset.candeck === '1');
    })();
    /** Checked before Demo/Import/Paste can actually do anything — makes
     *  more sense to ask for agreement right here, at the point someone is
     *  about to bring content in, rather than only at whatever page they'd
     *  eventually land on afterward (which used to be the only place this
     *  was ever checked, meaning someone could import/paste content
     *  entirely, THEN get asked to agree only once trying to open the
     *  result). Redirects to terms.php with a returnurl back to exactly
     *  this page, so nothing already filled in on the activity form itself
     *  is lost — they land right back here once they've agreed. */
    function bentoGuardTerms() {
      var el = document.getElementById('mod-bento-importer');
      if (!el || el.dataset.termsagreed === '1') return true;
      window.location.href = M.cfg.wwwroot + '/mod/bento/terms.php?returnurl=' + encodeURIComponent(location.pathname + location.search + location.hash);
      return false;
    }
    var docField = document.getElementById('id_document');
    var existingScript = document.getElementById('mod-bento-existing-doc');
    if (!drop || !fileInput || !itemsEl || !docField) return;

    var items = [];
    var draggedItem = null;

    /** Same request shape as the Bento editor's own moodle.ts saveToMoodle()
     *  — calling the SAME mod_bento_save_document web service directly,
     *  since this page (mod_form.php/submission_new.php) isn't running the
     *  actual Bento app at all, just this importer widget. Which record it
     *  writes to (the shared master document, or the caller's own
     *  submission) is decided entirely server-side from the caller's own
     *  capabilities — see that webservice's own doc comment.
     *
     *  Uses XMLHttpRequest rather than fetch() — same reasoning as moodle.
     *  ts's own saveToMoodle(): fetch() has no way to report upload
     *  progress at all, while XHR's own upload.onprogress event gives real
     *  loaded/total byte counts as the request actually streams out.
     *  onProgress (optional) is called repeatedly with a 0..1 fraction. */
    /** Lazily fetches a card's own full document (images/assets and all) —
     *  bento_render_importer() (lib.php) now only ever embeds lightweight
     *  metadata (title, slide count, byte size) per card at page load, not
     *  every card's own full content regardless of whether it's ever
     *  opened. This is what an action that genuinely needs the full
     *  document (download, split-into-parts) calls first; a no-op
     *  resolving immediately once it.doc is already loaded (every
     *  freshly-imported/pasted, not-yet-saved card always has it from the
     *  start, and this stays a safe no-op after the first successful
     *  lazy-load too). */
    function ensureDocLoaded(it) {
      if (it.doc) return Promise.resolve(it.doc);
      var url = M.cfg.wwwroot + '/mod/bento/lazydoc.php?id=' + bentoCmId + '&deckid=' + (it.existing ? 0 : it.deckid);
      return fetch(url, { credentials: 'same-origin' }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      }).then(function (doc) {
        it.doc = doc;
        return doc;
      });
    }

    function callBentoWebservice(methodname, args, onProgress) {
      var url = M.cfg.wwwroot + '/lib/ajax/service.php?sesskey=' + encodeURIComponent(M.cfg.sesskey) + '&info=' + methodname;
      var body = [{ index: 0, methodname: methodname, args: args }];
      return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.timeout = bentoSaveTimeoutMs;
        xhr.upload.onprogress = function (ev) {
          if (onProgress && ev.lengthComputable) onProgress(ev.loaded / ev.total);
        };
        xhr.onload = function () {
          var raw = xhr.responseText;
          var data;
          try { data = JSON.parse(raw); } catch (e) { reject(new Error('Moodle antwortete nicht mit JSON (HTTP ' + xhr.status + '): ' + raw.slice(0, 200))); return; }
          if (xhr.status < 200 || xhr.status >= 300) { reject(new Error('HTTP ' + xhr.status + ': ' + JSON.stringify(data))); return; }
          if (!Array.isArray(data)) { reject(new Error((data && (data.message || data.error)) || 'Anfrage fehlgeschlagen (unerwartete Antwort)')); return; }
          if (data[0] && data[0].error) { reject(new Error(data[0].message || (data[0].exception && data[0].exception.message) || 'Anfrage fehlgeschlagen')); return; }
          resolve(data[0] && data[0].data);
        };
        xhr.onerror = function () { reject(new Error('Netzwerkfehler bei der Anfrage — bitte erneut versuchen.')); };
        xhr.ontimeout = function () { reject(new Error('Zeitüberschreitung beim Speichern — bitte erneut versuchen.')); };
        xhr.send(JSON.stringify(body));
      });
    }
    function saveDocToMoodle(cmid, doc, onProgress) {
      return callBentoWebservice('mod_bento_save_document', { cmid: cmid, document: JSON.stringify(doc) }, onProgress);
    }
    function saveDeckToMoodle(cmid, deckid, name, doc, onProgress) {
      return callBentoWebservice('mod_bento_save_deck', { cmid: cmid, deckid: deckid || 0, name: name || '', document: JSON.stringify(doc) }, onProgress);
    }
    /** Allocates a real, empty draft deck server-side (no document content
     *  sent) — used by the ✎ edit button on a not-yet-saved item, to get a
     *  genuine deckid to write into before opening the editor at all, so a
     *  save from inside that session can never fall through to deckid=0
     *  (the shared MASTER document — see edit.php's own doc comment). */
    function createEmptyDeckOnMoodle(cmid) {
      return callBentoWebservice('mod_bento_create_empty_deck', { cmid: cmid });
    }
    /** Must match bento/slides/src/editor/moodle.ts's own HANDOFF_DB/
     *  HANDOFF_STORE constants exactly — see this function's own doc
     *  comment above. Stashes the JSON STRING (not the parsed object) so
     *  the read side can reuse parseDoc()'s own validation directly. */
    function stashUnsavedDocForBento(deckid, doc) {
      return new Promise(function (resolve, reject) {
        if (!('indexedDB' in window)) { reject(new Error('IndexedDB nicht verfügbar in diesem Browser.')); return; }
        var openReq = indexedDB.open('bento-moodle-handoff', 1);
        openReq.onupgradeneeded = function () { openReq.result.createObjectStore('docs'); };
        openReq.onerror = function () { reject(openReq.error || new Error('IndexedDB konnte nicht geöffnet werden.')); };
        openReq.onsuccess = function () {
          var db = openReq.result;
          var tx = db.transaction('docs', 'readwrite');
          tx.objectStore('docs').put(JSON.stringify(doc), deckid);
          tx.oncomplete = function () { db.close(); resolve(); };
          tx.onerror = function () { db.close(); reject(tx.error || new Error('IndexedDB-Schreibvorgang fehlgeschlagen.')); };
        };
      });
    }
    function deleteDeckFromMoodle(cmid, deckid) {
      return callBentoWebservice('mod_bento_delete_deck', { cmid: cmid, deckid: deckid });
    }
    function promoteDeckToMoodle(cmid, deckid) {
      return callBentoWebservice('mod_bento_promote_deck', { cmid: cmid, deckid: deckid });
    }
    function setDocumentVisible(cmid, visible) {
      return callBentoWebservice('mod_bento_set_document_visible', { cmid: cmid, visible: visible });
    }
    function setDeckVisible(cmid, deckid, visible) {
      return callBentoWebservice('mod_bento_set_deck_visible', { cmid: cmid, deckid: deckid, visible: visible });
    }
    function setDeckOrder(cmid, deckids) {
      return callBentoWebservice('mod_bento_set_deck_order', { cmid: cmid, deckids: deckids });
    }
    /** Sends the CURRENT local order of every persisted deck to the
     *  server, in one call — shared by the ⇧ button and drag-and-drop
     *  reordering below, so neither leaves the server's own sortorder
     *  stale (drag-and-drop previously never persisted anything at all).
     *  Silently skipped if there's nothing to persist yet (no cmid, or
     *  fewer than two persisted decks — reordering only matters when
     *  something could actually move relative to something else). */
    function bentoPersistDeckOrder() {
      if (!bentoCmId) return;
      var deckids = items.filter(function (i) { return i.deckid > 0; }).map(function (i) { return i.deckid; });
      if (deckids.length < 2) return;
      bentoWithSaveLock(function () {
        return setDeckOrder(bentoCmId, deckids);
      }).catch(function (e) {
        console.error(e);
        if (e.message !== 'save already in flight') alert('Konnte die Reihenfolge nicht speichern: ' + (e.message || e));
      });
    }
    function toastMsg(msg) {
      var t = document.createElement('div');
      t.className = 'mod-bento-toast';
      t.textContent = msg;
      document.body.appendChild(t);
      setTimeout(function () { t.classList.add('show'); }, 10);
      setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 300); }, 2500);
    }

    function slideLabel(slide, idx) {
      // Best-effort short label — the first non-empty text content found
      // on the slide, falling back to a plain slide number.
      var found = null;
      (function walk(node) {
        if (found || !node || typeof node !== 'object') return;
        if (Array.isArray(node)) { node.forEach(walk); return; }
        if (typeof node.text === 'string' && node.text.trim()) { found = node.text.trim(); return; }
        if (typeof node.content === 'string' && node.content.trim()) { found = node.content.trim(); return; }
        for (var k in node) walk(node[k]);
      })(slide.elements || []);
      var text = found ? found.slice(0, 40) + (found.length > 40 ? '…' : '') : '(ohne Text)';
      return 'Folie ' + (idx + 1) + ' — ' + text;
    }

    var thumbnailQueue = [];
    var thumbnailQueueRunning = false;
    function pumpThumbnailQueue() {
      if (thumbnailQueueRunning || !thumbnailQueue.length) return;
      thumbnailQueueRunning = true;
      var job = thumbnailQueue.shift();
      var done = function () { thumbnailQueueRunning = false; pumpThumbnailQueue(); };
      job(done);
    }

    function buildSlideThumbnail(doc, idx) {
      var wrap = document.createElement('div');
      wrap.className = 'mod-bento-split-thumb';
      var placeholder = document.createElement('button');
      placeholder.type = 'button';
      placeholder.className = 'mod-bento-split-thumb-placeholder';
      placeholder.textContent = '▶';
      placeholder.title = 'Vorschau laden';
      wrap.appendChild(placeholder);
      var loaded = false;
      function load() {
        if (loaded) return;
        loaded = true;
        placeholder.remove();
        var spinner = document.createElement('div');
        spinner.className = 'mod-bento-split-thumb-spinner';
        wrap.appendChild(spinner);
        var w = (doc.size && doc.size.width) || 1280;
        var h = (doc.size && doc.size.height) || 720;
        var iframe = document.createElement('iframe');
        iframe.className = 'mod-bento-split-thumb-frame';
        iframe.style.width = w + 'px';
        iframe.style.height = h + 'px';
        var scale = 120 / w;
        iframe.style.transform = 'scale(' + scale + ')';
        iframe.setAttribute('tabindex', '-1');
        iframe.setAttribute('aria-hidden', 'true');
        // No allow-same-origin: this iframe gets its own opaque origin, with
        // zero script-level access back into this page — a preview render
        // has no legitimate reason to ever touch the parent window at all.
        iframe.setAttribute('sandbox', 'allow-scripts');
        wrap.appendChild(iframe);
        // Queued rather than started immediately — building all of these at
        // once made the whole modal feel unresponsive (every iframe fighting
        // for the main thread simultaneously). One loads, THEN the next.
        thumbnailQueue.push(function (done) {
          var finish = function () { spinner.remove(); done(); };
          getShell().then(function (shell) {
            var slideDoc = {
              format: doc.format, version: doc.version || 1,
              docId: 'thumb-' + idx, title: doc.title || '',
              size: doc.size || { width: 1280, height: 720 },
              theme: doc.theme || { background: '#FFFFFF', color: '#111111', accent: '#FF9E5E', fontFamily: 'system-ui, sans-serif' },
              assets: doc.assets, slides: [doc.slides[idx]],
              readonly: true, // minimal "present"-only render, not the full editor — this is the actual fix for how long thumbnails took
            };
            var html = spliceDoc(shell, slideDoc);
            iframe.addEventListener('load', finish, { once: true });
            iframe.srcdoc = html;
          }).catch(function (e) {
            console.warn('Thumbnail konnte nicht geladen werden:', e);
            finish();
          });
        });
        pumpThumbnailQueue();
      }
      placeholder.addEventListener('click', load);
      return { el: wrap, load: load };
    }

    function openSplitModal(it) {
      var slides = it.doc.slides || [];
      var breakAfter = new Array(slides.length - 1).fill(false); // breakAfter[i] = true means a new part starts after slide i
      var customNames = []; // index = part number (0-based) -> user-typed name, if any

      var overlay = document.createElement('div');
      overlay.className = 'mod-bento-modal-overlay';
      var box = document.createElement('div');
      box.className = 'mod-bento-modal-box';
      box.innerHTML =
        '<h3>In Teile aufteilen</h3>' +
        '<p class="form-text text-muted">Zwischen zwei Folien klicken, um dort eine Trennung einzufügen. Jeder entstehende Teil bekommt nur die Assets, die seine eigenen Folien tatsächlich verwenden.</p>' +
        '<button type="button" class="btn btn-secondary mod-bento-split-load-all">Alle Thumbnails öffnen</button>' +
        '<div class="mod-bento-split-list"></div>' +
        '<div class="mod-bento-split-names"></div>' +
        '<div class="mod-bento-split-actions">' +
          '<button type="button" class="btn btn-secondary mod-bento-split-cancel">Abbrechen</button>' +
          '<button type="button" class="btn btn-primary mod-bento-split-confirm">Aufteilen</button>' +
        '</div>';
      overlay.appendChild(box);
      document.body.appendChild(overlay);

      var listEl = box.querySelector('.mod-bento-split-list');
      var namesEl = box.querySelector('.mod-bento-split-names');
      var confirmBtn = box.querySelector('.mod-bento-split-confirm');
      var breakBtns = [];
      var thumbLoaders = [];

      function computeGroups() {
        var groups = [];
        var current = [];
        slides.forEach(function (_, idx) {
          current.push(idx);
          if (breakAfter[idx]) { groups.push(current); current = []; }
        });
        if (current.length) groups.push(current);
        return groups;
      }

      function renderNameInputs() {
        var groups = computeGroups();
        namesEl.innerHTML = '';
        if (groups.length <= 1) return; // nothing to name yet — no split defined
        groups.forEach(function (g, partNum) {
          var row = document.createElement('label');
          row.className = 'mod-bento-split-name-row';
          var span = document.createElement('span');
          span.textContent = 'Teil ' + (partNum + 1) + ' (' + g.length + ' Folie' + (g.length === 1 ? '' : 'n') + ')';
          var input = document.createElement('input');
          input.type = 'text';
          input.className = 'mod-bento-split-name-input';
          input.value = customNames[partNum] || ((it.doc.title || 'Deck') + ' — Teil ' + (partNum + 1));
          input.addEventListener('input', function () { customNames[partNum] = input.value; });
          row.append(span, input);
          namesEl.appendChild(row);
        });
      }

      function updateConfirmState() {
        var partCount = breakAfter.filter(Boolean).length + 1;
        confirmBtn.textContent = partCount > 1 ? ('In ' + partCount + ' Teile aufteilen') : 'Keine Trennung gewählt';
        confirmBtn.disabled = partCount <= 1;
        renderNameInputs();
      }

      // Built ONCE — each thumbnail is a real iframe render, expensive
      // enough that rebuilding the whole list on every break-point toggle
      // (as a naive full re-render would) would reload every one of them
      // needlessly. Toggling only ever updates that one break button below.
      slides.forEach(function (slide, idx) {
        var row = document.createElement('div');
        row.className = 'mod-bento-split-row';
        var thumb = buildSlideThumbnail(it.doc, idx);
        thumbLoaders.push(thumb.load);
        row.appendChild(thumb.el);
        var label = document.createElement('div');
        label.className = 'mod-bento-split-label';
        label.textContent = slideLabel(slide, idx);
        row.appendChild(label);
        listEl.appendChild(row);
        if (idx < slides.length - 1) {
          var brk = document.createElement('button');
          brk.type = 'button';
          brk.className = 'mod-bento-split-break';
          (function (i) {
            brk.addEventListener('click', function () {
              breakAfter[i] = !breakAfter[i];
              brk.className = 'mod-bento-split-break' + (breakAfter[i] ? ' active' : '');
              brk.textContent = breakAfter[i] ? '✂ Trennung hier — klicken zum Entfernen' : '+ Trennung hier einfügen';
              updateConfirmState();
            });
          })(idx);
          brk.textContent = '+ Trennung hier einfügen';
          breakBtns.push(brk);
          listEl.appendChild(brk);
        }
      });
      updateConfirmState();
      box.querySelector('.mod-bento-split-load-all').addEventListener('click', function () {
        thumbLoaders.forEach(function (load) { load(); });
      });

      function close() { overlay.remove(); }
      box.querySelector('.mod-bento-split-cancel').addEventListener('click', close);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
      confirmBtn.addEventListener('click', function () {
        var groups = computeGroups();
        var i = items.indexOf(it);
        var newItems = groups.map(function (g, partNum) {
          var partDoc = bentoBuildSplitDoc(it.doc, g[0], g[g.length - 1] + 1);
          var name = (customNames[partNum] || '').trim() || ((it.doc.title || 'Deck') + ' — Teil ' + (partNum + 1));
          partDoc.title = name;
          partDoc.docId = (crypto.randomUUID ? crypto.randomUUID() : 'part-' + Date.now() + '-' + partNum);
          return { baseName: name, doc: partDoc, slideCount: partDoc.slides.length, warnings: [], existing: false, deckid: 0, visible: 0 };
        });
        if (i >= 0) items.splice.apply(items, [i, 1].concat(newItems));
        else items.push.apply(items, newItems);
        close();
        renderItems();
        toastMsg('In ' + newItems.length + ' Teile aufgeteilt — noch nicht gespeichert.');
      });
    }

    function openShrinkAssetsModal(it) {
      var assets = it.doc.assets || {};
      var imageEntries = Object.keys(assets)
        .map(function (key) { return { key: key, value: assets[key], bytes: bentoDataUriByteSize(assets[key]) }; })
        .filter(function (e) { return e.value.indexOf('data:image/') === 0; })
        .sort(function (a, b) { return b.bytes - a.bytes; });

      if (imageEntries.length === 0) {
        alert('Keine eingebetteten Bilder in dieser Präsentation.');
        return;
      }

      // Duplicate detection: identical data URI VALUE under different keys
      // — the simplest, unambiguous definition (near-duplicates, e.g. the
      // same photo resaved at a different size, are deliberately NOT
      // caught here to avoid a false-positive removal of two genuinely
      // different images).
      var byValue = {};
      imageEntries.forEach(function (e) { (byValue[e.value] = byValue[e.value] || []).push(e.key); });
      var dupCount = 0;
      Object.keys(byValue).forEach(function (v) { if (byValue[v].length > 1) dupCount += byValue[v].length - 1; });

      var overlay = document.createElement('div');
      overlay.className = 'mod-bento-modal-overlay';
      var box = document.createElement('div');
      box.className = 'mod-bento-modal-box';
      box.innerHTML =
        '<h3>Medien verkleinern</h3>' +
        '<p class="form-text text-muted">Ausgewählte Bilder werden auf die angegebene Kantenlänge verkleinert und neu komprimiert (PNG bleibt PNG, alles andere wird JPEG).</p>' +
        '<div class="mod-bento-shrink-settings">' +
          '<label>Max. Kantenlänge (px)<input type="number" class="mod-bento-shrink-maxdim" min="200" max="8000" value="' + bentoImageMaxDim + '"></label>' +
          '<label>Qualität (%)<input type="number" class="mod-bento-shrink-quality" min="10" max="100" value="' + Math.round(bentoImageQuality * 100) + '"></label>' +
        '</div>' +
        (dupCount > 0
          ? '<label class="mod-bento-shrink-dupes"><input type="checkbox" class="mod-bento-shrink-dedupe" checked> ' + dupCount + ' doppelte Bilder gefunden — entfernen</label>'
          : '') +
        '<div class="mod-bento-shrink-list"></div>' +
        '<div class="mod-bento-split-actions">' +
          '<button type="button" class="btn btn-secondary mod-bento-shrink-cancel">Abbrechen</button>' +
          '<button type="button" class="btn btn-primary mod-bento-shrink-confirm">Anwenden</button>' +
        '</div>';
      overlay.appendChild(box);
      document.body.appendChild(overlay);

      var listEl = box.querySelector('.mod-bento-shrink-list');
      var maxDimInput = box.querySelector('.mod-bento-shrink-maxdim');
      var qualityInput = box.querySelector('.mod-bento-shrink-quality');
      var dedupeCb = box.querySelector('.mod-bento-shrink-dedupe');
      var rows = [];
      imageEntries.forEach(function (e) {
        var row = document.createElement('div');
        row.className = 'mod-bento-shrink-row';
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = true;
        row.appendChild(cb);
        var thumb = document.createElement('img');
        thumb.className = 'mod-bento-shrink-thumb';
        thumb.src = e.value;
        thumb.loading = 'lazy';
        row.appendChild(thumb);
        var sizeEl = document.createElement('span');
        sizeEl.className = 'mod-bento-shrink-size';
        sizeEl.textContent = bentoFormatBytes(e.bytes);
        row.appendChild(sizeEl);
        listEl.appendChild(row);
        rows.push({ entry: e, checkbox: cb });
      });

      function close() { overlay.remove(); }
      box.querySelector('.mod-bento-shrink-cancel').addEventListener('click', close);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

      var confirmBtn = box.querySelector('.mod-bento-shrink-confirm');
      confirmBtn.addEventListener('click', function () {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Wird verarbeitet…';
        var maxDim = parseInt(maxDimInput.value, 10) || bentoImageMaxDim;
        var quality = (parseInt(qualityInput.value, 10) || Math.round(bentoImageQuality * 100)) / 100;
        var toShrink = rows.filter(function (r) { return r.checkbox.checked; });
        Promise.all(toShrink.map(function (r) {
          return bentoDownscaleImageDataUrl(r.entry.value, maxDim, quality).then(function (shrunk) {
            it.doc.assets[r.entry.key] = shrunk;
          });
        })).then(function () {
          if (dedupeCb && dedupeCb.checked) {
            var byValue2 = {};
            var keyMap = {};
            Object.keys(it.doc.assets).forEach(function (key) {
              var val = it.doc.assets[key];
              if (Object.prototype.hasOwnProperty.call(byValue2, val)) keyMap[key] = byValue2[val];
              else byValue2[val] = key;
            });
            Object.keys(keyMap).forEach(function (oldKey) { delete it.doc.assets[oldKey]; });
            it.doc.slides = bentoRemapAssetRefs(it.doc.slides, keyMap);
            if (it.doc.fonts) {
              it.doc.fonts = it.doc.fonts.map(function (f) {
                return keyMap[f.asset] ? Object.assign({}, f, { asset: keyMap[f.asset] }) : f;
              });
            }
          }
          close();
          renderItems();
          toastMsg('Medien verkleinert — noch nicht gespeichert.');
        });
      });
    }

    if (existingScript) {
      try {
        var existingDoc = JSON.parse(existingScript.textContent);
        if (existingDoc && existingDoc.format === 'bento/slides') {
          items.push({
            baseName: 'Aktuell gespeichert',
            title: existingDoc.title || '',
            doc: existingDoc,
            slideCount: (existingDoc.slides || []).length,
            byteSize: existingScript.textContent.length,
            warnings: [],
            existing: true,
            deckid: 0,
            visible: bentoDocumentVisible,
          });
        }
      } catch (e) { console.warn('mod_bento: could not parse the existing document', e); }
    } else {
      var existingMetaScript = document.getElementById('mod-bento-existing-doc-meta');
      if (existingMetaScript) {
        try {
          var meta = JSON.parse(existingMetaScript.textContent);
          items.push({
            baseName: 'Aktuell gespeichert',
            title: meta.title || '',
            doc: null, // lazy-loaded on demand — see ensureDocLoaded()
            slideCount: meta.slideCount || 0,
            byteSize: meta.byteSize || 0,
            warnings: [],
            existing: true,
            deckid: 0,
            visible: bentoDocumentVisible,
          });
        } catch (e) { console.warn('mod_bento: could not parse the existing document metadata', e); }
      }
    }
    var bentoOriginalMainDocItem = items.length ? items[0] : null;

    // Existing drafts (bento_decks) — each its OWN separate item, carrying
    // the real deckid so buildItemCard's own Speichern/Entfernen/Nach-oben
    // actions know which database row to act on, rather than being force-
    // merged into the item above.
    Array.prototype.forEach.call(document.querySelectorAll('.mod-bento-deck-seed'), function (el) {
      var text = el.textContent.trim();
      if (text) {
        // mod_form.php's own full-content seeding — never lazy here.
        try {
          var deckDoc = JSON.parse(text);
          if (!deckDoc || deckDoc.format !== 'bento/slides') return;
          items.push({
            baseName: el.dataset.name || 'Entwurf',
            title: deckDoc.title || '',
            doc: deckDoc,
            slideCount: (deckDoc.slides || []).length,
            byteSize: text.length,
            warnings: [],
            existing: false,
            deckid: parseInt(el.dataset.deckid, 10) || 0,
            visible: parseInt(el.dataset.visible, 10) || 0,
          });
        } catch (e) { console.warn('mod_bento: could not parse a draft deck', e); }
        return;
      }
      // manage.php's own lazyload mode — metadata only, doc fetched on
      // demand later by whichever action actually needs it.
      items.push({
        baseName: el.dataset.name || 'Entwurf',
        title: el.dataset.title || '',
        doc: null, // lazy-loaded on demand — see ensureDocLoaded()
        slideCount: parseInt(el.dataset.slidecount, 10) || 0,
        byteSize: parseInt(el.dataset.bytesize, 10) || 0,
        warnings: [],
        existing: false,
        deckid: parseInt(el.dataset.deckid, 10) || 0,
        visible: parseInt(el.dataset.visible, 10) || 0,
      });
    });

function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    /** Whatever's currently in `items` becomes the ONE saved document —
     *  auto-merges everything left, in order, exactly like clicking every
     *  ✚ connector manually would. Without this, saving right after an
     *  import (which leaves TWO cards — the existing saved doc plus the
     *  new import — connected by a ✚ the person hasn't clicked yet) would
     *  silently keep using items[0] (the OLD existing doc) and discard the
     *  newly imported one entirely; auto-merging means the newest import
     *  is never lost just because someone saved before manually merging. */
    /** Whatever's currently in `items`, combined into ONE doc — auto-
     *  merges everything left, in order, exactly like clicking every ✚
     *  connector manually would. Shared by syncDocField() (what actually
     *  gets saved) and the New/Play tile's own preview (so what "Play"
     *  shows always matches what saving would actually produce, not just
     *  the first card). */
    /** Backs the Moodle FORM's own "Speichern und anzeigen" button — the
     *  hidden document field always mirrors items[0] (the top/published
     *  position), nothing merged in from anywhere else. Each card ALSO has
     *  its own explicit Speichern/Veröffentlichen button (buildItemCard)
     *  that saves it directly via AJAX, independent of this — this is
     *  just what makes the WHOLE-FORM submit button do the right thing
     *  too, for anyone who never touches a per-card button at all. */
    function syncDocField() {
      if (items.length && items[0].doc) docField.value = JSON.stringify(items[0].doc);
      else if (!items.length) docField.value = '';
    }

    /** German-formatted size string (comma decimal, matching the rest of
     *  this app) — MB above 1000 KB, KB below that, matching the style
     *  mod_bento's own PHP-side formatBytesMB() already uses elsewhere. */
    function bentoFormatBytes(bytes) {
      if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1).replace('.', ',') + ' MB';
      return Math.round(bytes / 1024) + ' KB';
    }

    /** Must match bento/slides/src/model.ts's own dataUriByteSize() exactly
     *  — real decoded byte size (base64's ~4/3 expansion + padding), not
     *  the raw string length. */
    function bentoDataUriByteSize(dataUri) {
      var comma = dataUri.indexOf(',');
      if (comma < 0) return dataUri.length;
      var payload = dataUri.slice(comma + 1);
      if (!/;base64$/.test(dataUri.slice(0, comma))) return payload.length;
      var padding = payload.slice(-2) === '==' ? 2 : payload.slice(-1) === '=' ? 1 : 0;
      return Math.floor((payload.length * 3) / 4) - padding;
    }

    /** Must match bento/slides/src/model.ts's own downscaleImageDataUrl()
     *  exactly — see that function's own doc comment for the reasoning
     *  (PNG stays PNG for transparency, everything else becomes JPEG;
     *  resolves to the original unchanged if already small enough or on
     *  any decode failure). Duplicated here rather than shared since this
     *  file is plain JS with no build step / no access to bento's own TS
     *  modules — this codebase's own README explains why. */
    function bentoDownscaleImageDataUrl(dataUrl, maxDim, quality) {
      return new Promise(function (resolve) {
        var img = new Image();
        img.onload = function () {
          var scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
          if (scale >= 1) { resolve(dataUrl); return; }
          var canvas = document.createElement('canvas');
          canvas.width = Math.round(img.naturalWidth * scale);
          canvas.height = Math.round(img.naturalHeight * scale);
          var ctx = canvas.getContext('2d');
          if (!ctx) { resolve(dataUrl); return; }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          var isPng = dataUrl.indexOf('data:image/png') === 0;
          resolve(canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', quality));
        };
        img.onerror = function () { resolve(dataUrl); };
        img.src = dataUrl;
      });
    }

    function buildItemCard(it) {
      var card = document.createElement('div');
      var isTop = items[0] === it;
      var isPersisted = it.existing || it.deckid > 0;
      var visState = it.visible | 0; // 0 = hidden, 1 = visible to everyone, 2 = teacher-only
      var cardStateClass = !isPersisted ? 'unsaved' : (visState === 1 ? 'saved-visible' : (visState === 2 ? 'teacher-only' : 'hidden-item'));
      card.className = 'mod-bento-item ' + cardStateClass;
      card.draggable = true;
      var eyeOpenSvg = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>';
      var eyeClosedSvg = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 13c2.5-3 6-5 10-5s7.5 2 10 5"/><path d="M6 16.5l1-1.8M18 16.5l-1-1.8M12 18l0-2"/></svg>';
      // A stylized figure presenting at a board — the third eye state
      // ("visible only when a teacher is presenting"), matching the
      // reference icon this was modeled on.
      var teacherSvg = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="13" height="9" rx="1"/><path d="M4 6.5h7M4 9h5"/><circle cx="19" cy="8" r="2.3"/><path d="M15.5 21v-4.2c0-1.9 1.6-3.3 3.5-3.3s3.5 1.4 3.5 3.3V21"/></svg>';
      var eyeSvg = visState === 1 ? eyeOpenSvg : (visState === 2 ? teacherSvg : eyeClosedSvg);
      var eyeTitle = visState === 1 ? 'Sichtbar für alle — klicken für „nur bei Lehrer-Präsentation“'
        : (visState === 2 ? 'Nur sichtbar, wenn ein Lehrer präsentiert — klicken zum Ausblenden' : 'Nicht sichtbar — klicken, um sie für alle zu zeigen');
      var byteSize = it.doc ? JSON.stringify(it.doc).length : it.byteSize;
      var sizeWarnings = [];
      if (byteSize >= bentoMaxBytes) {
        sizeWarnings.push('Zu groß zum Speichern (' + bentoFormatBytes(byteSize) + ' von maximal ' + bentoFormatBytes(bentoMaxBytes) + ') — vorher verkleinern (z.B. Bilder, Videos).');
      } else if (byteSize >= bentoMaxBytes * 0.9) {
        sizeWarnings.push('Fast am Größenlimit (' + bentoFormatBytes(byteSize) + ' von maximal ' + bentoFormatBytes(bentoMaxBytes) + ').');
      }
      var allWarnings = sizeWarnings.concat(it.warnings || []);
      card.innerHTML =
        '<span class="mod-bento-item-grip" title="Ziehen zum Sortieren">⠿</span>' +
        '<div class="mod-bento-item-info">' +
          '<div class="mod-bento-item-name">' +
            '<button type="button" class="mod-bento-item-eye' + (visState ? ' open' : '') + '" title="' + eyeTitle + '">' + eyeSvg + '</button> ' +
            '<span class="mod-bento-item-title" title="Doppelklick zum Umbenennen">' + escapeHtml((it.doc && it.doc.title) || it.title || it.baseName) + '</span>' +
            '</div>' +
          '<div class="mod-bento-item-meta' + (sizeWarnings.length ? ' mod-bento-item-meta-oversize' : '') + '">' + it.slideCount + ' Folie' + (it.slideCount === 1 ? '' : 'n') + ' · ' + bentoFormatBytes(byteSize) + '</div>' +
          (allWarnings.length ? '<ul class="mod-bento-item-warnings">' + allWarnings.map(function (w) { return '<li>' + escapeHtml(w) + '</li>'; }).join('') + '</ul>' : '') +
        '</div>' +
        (isPersisted
          ? '<span class="mod-bento-item-saved-check" title="Gespeichert — nichts zu tun">✓</span>'
          : '<button type="button" class="mod-bento-item-save" title="Diese Karte einzeln speichern"><span class="mod-bento-item-save-progress"></span><span>Speichern</span></button>') +
        ('<button type="button" class="mod-bento-item-edit' + (isPersisted ? '' : ' unsaved-edit') + '" title="' + (isPersisted ? 'Bearbeiten (im vollen Editor, mit Speichern)' : 'Bearbeiten (im vollen Editor) — z.B. um die Präsentation vorher zu verkleinern, ohne sie erst zu speichern') + '"><span class="mod-bento-item-save-progress"></span><span>✎</span></button>') +
        '<button type="button" class="mod-bento-item-play" title="Präsentation starten (kann danach bearbeitet werden)"><span class="mod-bento-item-save-progress"></span><span>▶</span></button>' +
        '<button type="button" class="mod-bento-item-download" title="Als .bento.html herunterladen">&#8681;</button>' +
        (it.slideCount > 1 ? '<button type="button" class="mod-bento-item-split" title="In mehrere Teile aufteilen"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg></button>' : '') +
        '<button type="button" class="mod-bento-item-shrink" title="Medien verkleinern">\u{1F5DC}</button>' +
        '<button type="button" class="mod-bento-item-remove" title="Entfernen">✕</button>';

      card.querySelector('.mod-bento-item-remove').addEventListener('click', function () {
        var doRemove = function () {
          var i = items.indexOf(it);
          if (i >= 0) items.splice(i, 1);
          renderItems();
        };
        if (it.existing) {
          if (!confirm('Das Hauptdokument wird dabei geleert und ausgeblendet (es gibt kein „Löschen“ dafür, nur „Leeren“). Fortfahren?')) return;
          var blankMainDoc = { format: 'bento/slides', title: '', size: { width: 1280, height: 720 }, theme: { background: '#FFFFFF', color: '#111111', accent: '#FF9E5E', fontFamily: 'system-ui, sans-serif' }, slides: [{ id: 's1', background: '#FFFFFF', transition: 'none', elements: [], notes: '' }] };
          bentoWithSaveLock(function () {
            return saveDocToMoodle(bentoCmId, blankMainDoc).then(function () {
              return setDocumentVisible(bentoCmId, 0);
            });
          }).then(doRemove).catch(function (e) {
            console.error(e);
            if (e.message !== 'save already in flight') alert('Konnte das Hauptdokument nicht leeren: ' + (e.message || e));
          });
          return;
        }
        if (it.deckid > 0) {
          if (!confirm('Dieser gespeicherte Entwurf wird dabei endgültig gelöscht. Fortfahren?')) return;
          deleteDeckFromMoodle(bentoCmId, it.deckid).then(doRemove).catch(function (e) {
            console.error(e);
            alert('Konnte den Entwurf nicht löschen: ' + (e.message || e));
          });
        } else {
          doRemove();
        }
      });

      var saveBtn = card.querySelector('.mod-bento-item-save');
      if (saveBtn) {
        var saveProgressEl = saveBtn.querySelector('.mod-bento-item-save-progress');
        saveBtn.addEventListener('click', function () {
          if (!bentoCmId) { alert('Erst die Aktivität selbst anlegen (unten „Speichern und anzeigen“), bevor einzelne Karten gespeichert werden können.'); return; }
          saveBtn.disabled = true;
          if (saveProgressEl) saveProgressEl.classList.add('active');
          var onProgress = function (fraction) {
            if (saveProgressEl) saveProgressEl.style.width = Math.round(fraction * 100) + '%';
          };
          var nowTop = items[0] === it; // re-check at click time — order may have changed since the card was built
          bentoWithSaveLock(function () {
            return ensureDocLoaded(it).then(function () {
              return (!bentoCanDeck || nowTop)
                ? saveDocToMoodle(bentoCmId, it.doc, onProgress)
                : saveDeckToMoodle(bentoCmId, it.deckid || 0, it.baseName, it.doc, onProgress).then(function (res) { it.deckid = res.deckid; });
            });
          }).then(function () {
            if (!bentoCanDeck || nowTop) it.existing = true;
            toastMsg((!bentoCanDeck || nowTop) ? 'Gespeichert.' : 'Entwurf gespeichert.');
            renderItems();
          }).catch(function (e) {
            console.error(e);
            if (e.message !== 'save already in flight') alert('Konnte nicht speichern: ' + (e.message || e));
          }).finally(function () {
            saveBtn.disabled = false;
            if (saveProgressEl) { saveProgressEl.classList.remove('active'); saveProgressEl.style.width = '0'; }
          });
        });
      }

      var eyeBtn = card.querySelector('.mod-bento-item-eye');
      if (eyeBtn && bentoCmId) {
        eyeBtn.addEventListener('click', function (ev) {
          ev.stopPropagation();
          if (!isPersisted) {
            alert('Diese Karte muss erst gespeichert werden, bevor sie sichtbar gemacht werden kann.');
            return;
          }
          eyeBtn.disabled = true;
          var newVisible = (visState + 1) % 3;
          bentoWithSaveLock(function () {
            return it.existing
              ? setDocumentVisible(bentoCmId, newVisible)
              : setDeckVisible(bentoCmId, it.deckid, newVisible);
          }).then(function () {
            it.visible = newVisible;
            renderItems();
          }).catch(function (e) {
            console.error(e);
            if (e.message !== 'save already in flight') alert('Konnte die Sichtbarkeit nicht ändern: ' + (e.message || e));
            eyeBtn.disabled = false;
          });
        });
      }

      var titleSpan = card.querySelector('.mod-bento-item-title')
      if (titleSpan) {
        titleSpan.addEventListener('click', function (ev) { ev.stopPropagation(); });
        titleSpan.addEventListener('dblclick', function (ev) {
          ev.stopPropagation();
          var input = document.createElement('input');
          input.type = 'text';
          input.className = 'mod-bento-item-title-input';
          input.value = (it.doc && it.doc.title) || it.title || it.baseName;
          card.draggable = false;
          titleSpan.replaceWith(input);
          input.focus();
          input.select();
          var committing = false;
          function commit(save) {
            if (committing) return;
            committing = true;
            card.draggable = true;
            var next = input.value.trim();
            if (!save || !next) { renderItems(); return; }
            it.title = next;
            it.baseName = next;
            if (!isPersisted) {
              if (it.doc) it.doc.title = next;
              renderItems();
              return;
            }
            input.disabled = true;
            bentoWithSaveLock(function () {
              return ensureDocLoaded(it).then(function (doc) {
                doc.title = next;
                return it.existing
                  ? saveDocToMoodle(bentoCmId, doc)
                  : saveDeckToMoodle(bentoCmId, it.deckid, next, doc);
              });
            }).then(function () {
              renderItems();
            }).catch(function (e) {
              console.error(e);
              if (e.message !== 'save already in flight') alert('Konnte den Namen nicht speichern: ' + (e.message || e));
              renderItems();
            });
          }
          input.addEventListener('keydown', function (kev) {
            if (kev.key === 'Enter') { kev.preventDefault(); commit(true); }
            else if (kev.key === 'Escape') { kev.preventDefault(); commit(false); }
          });
          input.addEventListener('blur', function () { commit(true); });
        });
      }

      var playBtn = card.querySelector('.mod-bento-item-play');
      var titleEl = card.querySelector('.mod-bento-item-name');
      /** A plain, non-destructive preview — never saves anything, ever.
       *  Each card's own explicit Speichern button (or the eye toggle) is
       *  what actually persists it — this must never ALSO trigger a save
       *  as a side effect of just wanting to look at something, since
       *  that risks colliding with an unrelated save/promote already in
       *  flight from another action on the page (a real incident this
       *  fixed: saving-before-open here running concurrently with the
       *  eye toggle's own save/promote elsewhere on the page). */
      var saveThenGoTo = function (btn, progressEl, hash) {
        var nowTop = items[0] === it;
        var goTo = function (deckidForUrl) {
          var url = M.cfg.wwwroot + '/mod/bento/edit.php?id=' + bentoCmId
            + (bentoCanDeck && !nowTop ? '&deckid=' + deckidForUrl : '')
            + '&returnurl=' + encodeURIComponent(location.pathname + location.search + location.hash)
            + (hash ? '#' + hash : '');
          window.location.href = url;
        };
        if (isPersisted) { btn.classList.add('mod-bento-btn-loading'); goTo(it.deckid); return; }
        // Not yet saved anywhere — save it first (transparently, the
        // button's own tooltip already says so), then open it for real.
        btn.disabled = true;
        if (progressEl) progressEl.classList.add('active');
        var onProgress = function (fraction) {
          if (progressEl) progressEl.style.width = Math.round(fraction * 100) + '%';
        };
        bentoWithSaveLock(function () {
          return ensureDocLoaded(it).then(function () {
            return (!bentoCanDeck || nowTop)
              ? saveDocToMoodle(bentoCmId, it.doc, onProgress)
              : saveDeckToMoodle(bentoCmId, 0, it.baseName, it.doc, onProgress);
          });
        }).then(function (res) {
          if (!bentoCanDeck || nowTop) { it.existing = true; goTo(0); return; }
          it.deckid = res.deckid;
          goTo(res.deckid);
        }).catch(function (e) {
          console.error(e);
          if (e.message !== 'save already in flight') alert('Konnte nicht speichern: ' + (e.message || e));
          btn.disabled = false;
          if (progressEl) { progressEl.classList.remove('active'); progressEl.style.width = '0'; }
        });
      };
      var playProgressEl = playBtn.querySelector('.mod-bento-item-save-progress');
      var playAction = function () {
        if (bentoCmId) { saveThenGoTo(playBtn, playProgressEl, 'present'); return; }
        // No real activity to navigate to at all (mod_form.php's own
        // importer, before the activity exists to save into) — the only
        // case left with nowhere real to open, so fall back to a plain,
        // disconnected local preview.
        var win = window.open('', '_blank');
        if (!win) { alert('Popup blockiert — bitte Popups für diese Seite erlauben'); return; }
        win.document.write('<!doctype html><meta charset="utf-8"><title>Bento wird geladen…</title>' +
          '<body style="font-family:system-ui,sans-serif;padding:2.5rem;color:#667">Bento wird geladen…</body>');
        playBtn.disabled = true;
        getShell().then(function (shell) {
          var html = spliceDoc(shell, it.doc);
          win.document.open();
          win.document.write(html);
          win.document.close();
        }).catch(function (e) {
          console.error(e);
          win.close();
          alert('Konnte die Präsentation nicht öffnen: ' + (e.message || e));
        }).finally(function () { playBtn.disabled = false; });
      };
      playBtn.addEventListener('click', playAction);
      if (titleEl) {
        titleEl.classList.add('mod-bento-item-name-clickable');
        titleEl.title = 'Ansehen';
        titleEl.addEventListener('click', playAction);
      }
      var editBtn = card.querySelector('.mod-bento-item-edit');
      if (editBtn && bentoCmId) {
        var editProgressEl = editBtn.querySelector('.mod-bento-item-save-progress');
        editBtn.addEventListener('click', function () {
          if (isPersisted) { saveThenGoTo(editBtn, editProgressEl, null); return; }
          editBtn.disabled = true;
          bentoWithSaveLock(function () {
            return Promise.all([ensureDocLoaded(it), createEmptyDeckOnMoodle(bentoCmId)]);
          }).then(function (results) {
            var deckid = results[1].deckid;
            return stashUnsavedDocForBento(deckid, it.doc).then(function () {
              var url = M.cfg.wwwroot + '/mod/bento/edit.php?id=' + bentoCmId + '&deckid=' + deckid
                + '&returnurl=' + encodeURIComponent(location.pathname + location.search + location.hash);
              window.location.href = url;
            });
          }).catch(function (e) {
            console.error(e);
            if (e.message !== 'save already in flight') alert('Konnte nicht öffnen: ' + (e.message || e));
            editBtn.disabled = false;
          });
        });
      }
      card.querySelector('.mod-bento-item-download').addEventListener('click', function () {
        var btn = card.querySelector('.mod-bento-item-download');
        btn.disabled = true;
        Promise.all([getShell(), ensureDocLoaded(it)]).then(function (results) {
          var shell = results[0], doc = results[1];
          var html = spliceDoc(shell, doc);
          var blob = new Blob([html], { type: 'text/html' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          var rawname = doc.title || it.baseName;
          var safename = rawname.replace(/[^\w\d-]+/g, '_').replace(/^_+|_+$/g, '') || 'Untitled';
          a.download = safename + '.bento.html';
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
        }).catch(function (e) {
          console.error(e);
          alert('Konnte die Datei nicht erzeugen: ' + (e.message || e));
        }).finally(function () { btn.disabled = false; });
      });
      var splitBtn = card.querySelector('.mod-bento-item-split');
      if (splitBtn) {
        splitBtn.addEventListener('click', function () {
          splitBtn.disabled = true;
          ensureDocLoaded(it).then(function () {
            splitBtn.disabled = false;
            openSplitModal(it);
          }).catch(function (e) {
            console.error(e);
            splitBtn.disabled = false;
            alert('Konnte die Präsentation nicht laden: ' + (e.message || e));
          });
        });
      }
      var shrinkBtn = card.querySelector('.mod-bento-item-shrink');
      if (shrinkBtn) {
        shrinkBtn.addEventListener('click', function () {
          shrinkBtn.disabled = true;
          ensureDocLoaded(it).then(function () {
            shrinkBtn.disabled = false;
            openShrinkAssetsModal(it);
          }).catch(function (e) {
            console.error(e);
            shrinkBtn.disabled = false;
            alert('Konnte die Präsentation nicht laden: ' + (e.message || e));
          });
        });
      }
      card.addEventListener('dragstart', function () { draggedItem = it; card.classList.add('dragging'); });
      card.addEventListener('dragend', function () { card.classList.remove('dragging'); draggedItem = null; });
      card.addEventListener('dragover', function (e) { e.preventDefault(); });
      card.addEventListener('drop', function (e) {
        e.preventDefault();
        if (!draggedItem || draggedItem === it) return;
        var fromIdx = items.indexOf(draggedItem);
        if (fromIdx < 0) return;
        items.splice(fromIdx, 1);
        var rect = card.getBoundingClientRect();
        var above = (e.clientY - rect.top) < rect.height / 2;
        var targetIdx = items.indexOf(it);
        items.splice(above ? targetIdx : targetIdx + 1, 0, draggedItem);
        renderItems();
        bentoPersistDeckOrder();
      });
      return card;
    }

    function mergeItems(i, j, btn) {
      var a = items[i];
      var b = items[j];
      if (btn) btn.disabled = true;
      Promise.all([ensureDocLoaded(a), ensureDocLoaded(b)]).then(function () {
        var merged;
        try {
          merged = mergeDocs(a.doc, b.doc);
        } catch (e) {
          console.error(e);
          alert('Verbinden fehlgeschlagen: ' + (e.message || e));
          return;
        }
        items.splice(i, 2, {
          baseName: a.baseName + ' + ' + b.baseName,
          doc: merged,
          slideCount: merged.slides.length,
          warnings: (a.warnings || []).concat(b.warnings || []),
          existing: false,
          deckid: 0,
        });
        renderItems();
      }).catch(function (e) {
        console.error(e);
        alert('Verbinden fehlgeschlagen: ' + (e.message || e));
        if (btn) btn.disabled = false;
      });
    }

    function renderItems() {
      itemsEl.innerHTML = '';
      items.forEach(function (it, idx) {
        itemsEl.appendChild(buildItemCard(it));
        if (idx < items.length - 1) {
          var connector = document.createElement('div');
          connector.className = 'mod-bento-connector';
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'mod-bento-connector-btn';
          btn.textContent = '✚';
          btn.title = 'Verbinden';
          (function (idxCopy) {
            btn.addEventListener('click', function () { mergeItems(idxCopy, idxCopy + 1, btn); });
          })(idx);
          connector.appendChild(btn);
          var bothDecks = items[idx].deckid > 0 && items[idx + 1].deckid > 0;
          var mainAndDeck = (items[idx].existing && items[idx + 1].deckid > 0) || (items[idx].deckid > 0 && items[idx + 1].existing);
          if (bothDecks || mainAndDeck) {
            var swapBtn = document.createElement('button');
            swapBtn.type = 'button';
            swapBtn.className = 'mod-bento-connector-btn mod-bento-connector-swap';
            swapBtn.textContent = '\u2B0D';
            swapBtn.title = 'Reihenfolge tauschen';
            (function (idxCopy) {
              swapBtn.addEventListener('click', function () {
                if (bothDecks) {
                  var tmp = items[idxCopy];
                  items[idxCopy] = items[idxCopy + 1];
                  items[idxCopy + 1] = tmp;
                  renderItems();
                  bentoPersistDeckOrder();
                  return;
                }
                // One side is the main document — swap CONTENT via the
                // same promote mechanism the visibility model used
                // before, not a position swap (the main document has no
                // sortorder to swap in the first place).
                swapBtn.disabled = true;
                var mainItem = items[idxCopy].existing ? items[idxCopy] : items[idxCopy + 1];
                var deckItem = items[idxCopy].existing ? items[idxCopy + 1] : items[idxCopy];
                bentoWithSaveLock(function () {
                  return promoteDeckToMoodle(bentoCmId, deckItem.deckid);
                }).then(function () {
                  location.reload();
                }).catch(function (e) {
                  console.error(e);
                  if (e.message !== 'save already in flight') alert('Konnte nicht tauschen: ' + (e.message || e));
                  swapBtn.disabled = false;
                });
              });
            })(idx);
            connector.appendChild(swapBtn);
          }
          itemsEl.appendChild(connector);
        }
      });

      var existingWarn = document.getElementById('mod-bento-multi-warn');
      if (existingWarn) existingWarn.remove();
      if (items.length > 1) {
        var w = document.createElement('p');
        w.id = 'mod-bento-multi-warn';
        w.className = 'mod-bento-warn';
        w.textContent = 'Das Sichtbarkeitssymbol vor dem Titel entscheidet, ob das Element ausgeblendet wird, nur in der Lehrerpräsentation oder auch für die Schüler sichtbar ist.';
        itemsEl.parentNode.insertBefore(w, itemsEl.nextSibling);
      }

      syncDocField();

      // Keep the New/Ansehen tile's label in sync — it can only ever DO
      // one of the two things at a time (start fresh vs. open what's
      // already there), so it relabels in place rather than showing both
      // always. When there's a real document, its own title (doc.title —
      // the same field editable top-left in the editor) becomes the main
      // label instead of the generic "Ansehen", so the tile shows WHICH
      // presentation this is.
      var newBtnEl = document.getElementById('mod-bento-newbtn');
      if (newBtnEl) {
        var hasDoc = items.length > 0;
        newBtnEl.dataset.hasdoc = hasDoc ? '1' : '0';
        var subEl = document.getElementById('mod-bento-newbtn-sub');
        if (subEl) {
          var visibleNames = items.filter(function (i) { return i.visible; }).map(function (i) { return (i.doc && i.doc.title) || i.title || i.baseName; });
          if (hasDoc && visibleNames.length) {
            subEl.innerHTML = visibleNames.map(function (n, idx) { return (idx > 0 ? '→ ' : '') + escapeHtml(n); }).join('<br>');
          } else {
            subEl.textContent = hasDoc ? M.util.get_string('playtilesub', 'mod_bento') : M.util.get_string('newtilesub', 'mod_bento');
          }
        }
      }
    }

    async function handleFile(file) {
      var isPptx = /\.pptx$/i.test(file.name);
      var isPpt = /\.ppt$/i.test(file.name);
      var isJson = /\.json$/i.test(file.name);
      var isHtml = /\.html?$/i.test(file.name);
      if (!isPptx && !isPpt && !isJson && !isHtml) {
        alert('Nicht unterstützt: ' + file.name);
        return;
      }
      try {
        var doc, slideCount, warnings = [], baseName;
        if (isPptx) {
          var res = await convertPptx(file);
          doc = res.doc; warnings = res.warnings; slideCount = res.slideCount;
          baseName = file.name.replace(/\.pptx$/i, '');
        } else if (isPpt) {
          var resPpt = await convertPpt(file);
          doc = resPpt.doc; warnings = resPpt.warnings; slideCount = resPpt.slideCount;
          baseName = file.name.replace(/\.ppt$/i, '');
        } else if (isHtml) {
          var text = await file.text();
          var m = /<script[^>]*id=["']bento-doc["'][^>]*>([\s\S]*?)<\/script>/.exec(text);
          if (!m || !m[1].trim()) throw new Error('Keine eingebettete bento/slides-JSON gefunden (kein #bento-doc-Inhalt).');
          doc = JSON.parse(m[1].trim());
          if (doc.format !== 'bento/slides') throw new Error('Kein bento/slides-Dokument in dieser Datei.');
          slideCount = (doc.slides || []).length;
          baseName = file.name.replace(/\.bento\.html$/i, '').replace(/\.html?$/i, '');
        } else {
          var text2 = await file.text();
          doc = JSON.parse(text2);
          if (doc.format !== 'bento/slides') throw new Error('Keine bento/slides-JSON-Datei (Feld "format" fehlt oder falsch).');
          slideCount = (doc.slides || []).length;
          baseName = file.name.replace(/\.bento\.json$/i, '').replace(/\.json$/i, '');
        }
        items.push({ baseName: baseName, doc: doc, slideCount: slideCount, warnings: warnings, existing: false, deckid: 0, visible: 0 });
        renderItems();
      } catch (e) {
        console.error(e);
        alert('Fehler bei der Umwandlung von ' + file.name + ': ' + (e.message || e));
      }
    }

    function handleFiles(fileList) {
      Array.prototype.slice.call(fileList).forEach(handleFile);
    }

    // ---- Demo tile: opens the bundled feature-tour deck directly in
    // present mode, in a new tab — never touches this form's own items/
    // document at all, purely a "look, don't touch" preview. ----
    var newPartBtn = document.getElementById('mod-bento-newpart-btn');
    if (newPartBtn) {
      var newPartProgressEl = document.createElement('span');
      newPartProgressEl.className = 'mod-bento-item-save-progress';
      newPartBtn.insertBefore(newPartProgressEl, newPartBtn.firstChild);
      newPartBtn.addEventListener('click', function () {
        var blankDoc = { format: 'bento/slides', title: '', size: { width: 1280, height: 720 }, theme: { background: '#FFFFFF', color: '#111111', accent: '#FF9E5E', fontFamily: 'system-ui, sans-serif' }, slides: [{ id: 's1', background: '#FFFFFF', transition: 'none', elements: [], notes: '' }] };
        if (!bentoCmId) {
          items.push({ baseName: 'Neuer-Teil', doc: blankDoc, slideCount: 1, warnings: [], existing: false, deckid: 0, visible: 0 });
          renderItems();
          return;
        }
        newPartBtn.disabled = true;
        newPartProgressEl.classList.add('active');
        bentoWithSaveLock(function () {
          return saveDeckToMoodle(bentoCmId, 0, 'Neuer-Teil', blankDoc, function (fraction) {
            newPartProgressEl.style.width = Math.round(fraction * 100) + '%';
          });
        }).then(function (res) {
          var url = M.cfg.wwwroot + '/mod/bento/edit.php?id=' + bentoCmId + '&deckid=' + res.deckid
            + '&returnurl=' + encodeURIComponent(location.pathname + location.search + location.hash);
          window.location.href = url;
        }).catch(function (e) {
          console.error(e);
          if (e.message !== 'save already in flight') alert('Konnte nicht speichern: ' + (e.message || e));
          newPartBtn.disabled = false;
          newPartProgressEl.classList.remove('active');
          newPartProgressEl.style.width = '0';
        });
      });
    }
    var demoBtn = document.getElementById('mod-bento-demobtn');
    if (demoBtn) {
      demoBtn.addEventListener('click', function () {
        var win = window.open('', '_blank');
        if (!win) { alert('Popup blockiert — bitte Popups für diese Seite erlauben'); return; }
        win.document.write('<!doctype html><meta charset="utf-8"><title>Bento wird geladen…</title>' +
          '<body style="font-family:system-ui,sans-serif;padding:2.5rem;color:#667">Bento wird geladen…</body>');
        demoBtn.disabled = true;
        Promise.all([
          getShell(),
          fetch(M.cfg.wwwroot + '/mod/bento/asset/demo-doc.json').then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
          }),
        ]).then(function (results) {
          var html = spliceDoc(results[0], results[1]);
          win.document.open();
          win.document.write(html);
          win.document.close();
        }).catch(function (e) {
          console.error(e);
          win.close();
          alert('Konnte die Demo nicht öffnen: ' + (e.message || e));
        }).finally(function () { demoBtn.disabled = false; });
      });
    }

    /** Saves `doc` via the SAME AJAX path every per-card Save button
     *  already uses, then navigates to `pathAndQuery` (relative to
     *  M.cfg.wwwroot) on success — shared by the "Ansehen" tile (target
     *  view.php) and the "Bearbeiten" tile (target edit.php), which
     *  otherwise do exactly the same thing. Disables `btn` for the
     *  duration, re-enables it on failure (a successful save navigates
     *  away, so there's nothing left to re-enable). */
    function bentoSaveThenOpen(btn, doc, pathAndQuery) {
      btn.disabled = true;
      btn.classList.add('mod-bento-tile-loading');
      bentoWithSaveLock(function () {
        return saveDocToMoodle(bentoCmId, doc);
      }).then(function () {
        window.location.href = M.cfg.wwwroot + pathAndQuery + '&returnurl=' + encodeURIComponent(location.pathname + location.search + location.hash);
      }).catch(function (e) {
        console.error(e);
        if (e.message !== 'save already in flight') alert('Konnte nicht in Moodle speichern: ' + (e.message || e));
        btn.disabled = false;
        btn.classList.remove('mod-bento-tile-loading');
      });
    }

    // ---- New/View tile: a blank presentation when there's nothing saved
    // yet, otherwise saves whatever's currently merged into items[0] and
    // opens it in view.php (present mode) — never both at once, so
    // relabelling in place (rather than two separate always-visible
    // buttons) matches what the tile can actually do at any given moment.
    // A separate "Bearbeiten" tile (below) does the same save, but opens
    // edit.php instead — both share bentoSaveThenOpen() for the actual
    // save-then-navigate mechanics. ----
    var newBtn = document.getElementById('mod-bento-newbtn');
    if (newBtn) {
      newBtn.addEventListener('click', function () {
        if (newBtn.dataset.hasdoc === '1') {
          if (!items.length) return;
          if (bentoCmId && items[0] === bentoOriginalMainDocItem) {
            // Nothing changed since load — the server already has exactly
            // this content, so skip straight to navigating, synchronously,
            // right here in the click handler's own gesture context (see
            // this block's own doc comment for why that matters).
            newBtn.classList.add('mod-bento-tile-loading');
            window.location.href = M.cfg.wwwroot + '/mod/bento/view.php?id=' + bentoCmId + '&master=1'
              + '&returnurl=' + encodeURIComponent(location.pathname + location.search + location.hash);
            return;
          }
          ensureDocLoaded(items[0]).then(function (docToShow) {
          if (bentoCmId) {
            bentoSaveThenOpen(newBtn, docToShow, '/mod/bento/view.php?id=' + bentoCmId + '&master=1');
            return;
          }
          var win = window.open('', '_blank');
          if (!win) { alert('Popup blockiert — bitte Popups für diese Seite erlauben'); return; }
          win.document.write('<!doctype html><meta charset="utf-8"><title>Bento wird geladen…</title>' +
            '<body style="font-family:system-ui,sans-serif;padding:2.5rem;color:#667">Bento wird geladen…</body>');
          newBtn.disabled = true;
          newBtn.classList.add('mod-bento-tile-loading');
          getShell().then(function (shell) {
            var html = spliceDoc(shell, docToShow);
            win.document.open();
            win.document.write(html);
            win.document.close();
          }).catch(function (e) {
            console.error(e);
            win.close();
            alert('Konnte die Präsentation nicht öffnen: ' + (e.message || e));
          }).finally(function () { newBtn.disabled = false; newBtn.classList.remove('mod-bento-tile-loading'); });
          }).catch(function (e) {
            console.error(e);
            alert('Konnte die Präsentation nicht laden: ' + (e.message || e));
          });
        } else {
          var blankDoc;
          try { blankDoc = JSON.parse(docField.value); } catch (e) { blankDoc = null; }
          if (!blankDoc || blankDoc.format !== 'bento/slides') return; // shouldn't happen — data_preprocessing() always seeds a blank doc server-side
          items.push({ baseName: 'Neue-Praesentation', doc: blankDoc, slideCount: (blankDoc.slides || []).length, warnings: [], existing: false, deckid: 0, visible: 0 });
          renderItems();
        }
      });
    }

    // ---- Bearbeiten tile: only rendered when there's a genuine existing
    // document (see bento_render_importer()'s own $isrealdoc guard) —
    // saves whatever's currently merged into items[0], same as the
    // Ansehen tile above, but opens edit.php instead of view.php. ----
    var editBtn = document.getElementById('mod-bento-editbtn');
    if (editBtn) {
      editBtn.addEventListener('click', function () {
        if (!items.length || !bentoCmId) return;
        if (items[0] === bentoOriginalMainDocItem) {
          editBtn.classList.add('mod-bento-tile-loading');
          window.location.href = M.cfg.wwwroot + '/mod/bento/edit.php?id=' + bentoCmId
            + '&returnurl=' + encodeURIComponent(location.pathname + location.search + location.hash);
          return;
        }
        ensureDocLoaded(items[0]).then(function (docToEdit) {
          bentoSaveThenOpen(editBtn, docToEdit, '/mod/bento/edit.php?id=' + bentoCmId);
        }).catch(function (e) {
          console.error(e);
          alert('Konnte die Präsentation nicht laden: ' + (e.message || e));
        });
      });
    }

    drop.addEventListener('click', function () { if (bentoGuardTerms()) fileInput.click(); });
    drop.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && bentoGuardTerms()) fileInput.click(); });
    fileInput.addEventListener('change', function (e) { if (bentoGuardTerms()) handleFiles(e.target.files); fileInput.value = ''; });
    drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('drag'); });
    drop.addEventListener('dragleave', function () { drop.classList.remove('drag'); });
    drop.addEventListener('drop', function (e) {
      e.preventDefault();
      drop.classList.remove('drag');
      if (bentoGuardTerms()) handleFiles(e.dataTransfer.files);
    });

    renderItems(); // paint the seeded "Aktuell gespeichert" card (if any) immediately

    /** Builds and inserts a thin progress-bar track right under the
     *  form's own Save/Cancel button row (Moodle's own standard
     *  moodleform_mod convention wraps those in .form-buttons) — same
     *  visual language as the live editor's own Save-button progress bar
     *  (dark-blue fill displacing an orange track) for consistency across
     *  both save paths. Falls back to right after the form itself if that
     *  specific class isn't found, since a theme's own markup could
     *  differ; this is a defensive fallback; not the expected path.
     *  Returns the FILL element itself (set its own .style.width as
     *  progress comes in) — the caller removes the whole track once the
     *  save settles either way. */
    function bentoShowSaveProgressBar(form) {
      var track = document.createElement('div')
      track.style.cssText = 'height:6px;border-radius:3px;overflow:hidden;background:#f7a600;margin:10px 0;'
      var fill = document.createElement('div')
      fill.style.cssText = 'height:100%;width:0;background:#5b8def;transition:width .15s linear;'
      track.appendChild(fill)
      // Wraps the fill in a getter/setter-free object so callers can just
      // do progressBar.style.width — but the actual DOM node styled is
      // the inner fill, not the track itself (which stays the orange
      // "not yet uploaded" base color throughout).
      var proxy = { style: fill.style, remove: function () { track.remove() } }
      var buttonsRow = form.querySelector('.form-buttons')
      if (buttonsRow) {
        buttonsRow.insertAdjacentElement('afterend', track)
      } else {
        form.insertAdjacentElement('afterend', track)
      }
      return proxy
    }

    var form = docField.closest('form');
    if (form) {
      var bentoDocAlreadySaved = false;
      form.addEventListener('submit', function (ev) {
        // Second safety net, on top of the remove-button's own confirm():
        // if every card is gone by the time of actually saving (however
        // that happened) and there WAS a saved presentation before this
        // page loaded, one more chance to back out rather than silently
        // clearing it.
        if (items.length === 0 && existingScript) {
          if (!confirm('Es ist keine Präsentation mehr vorhanden — beim Speichern würde die ursprüngliche, bereits gespeicherte Präsentation entfernt. Trotzdem speichern?')) {
            ev.preventDefault();
            return;
          }
        }
        // The published document used to be written into docField (a
        // visually-hidden but otherwise perfectly normal <textarea>) and
        // carried along inside this SAME standard HTML form submission —
        // meaning a large, image-heavy presentation (tens of megabytes
        // once base64-embedded images are counted) got embedded a SECOND
        // time in the page right as the person hit Save (on top of the
        // separate <script id="mod-bento-existing-doc"> copy the card
        // display itself already reads from), then sent as part of one
        // enormous synchronous POST alongside every other field on this
        // page. For a large enough presentation this froze the tab
        // outright — even simple JS evaluation in it stopped responding —
        // and could fail the underlying request itself with a
        // NetworkError rather than a clean server response.
        //
        // Every card already has its own explicit Speichern button that
        // saves it directly via the mod_bento_save_document/mod_bento_
        // save_deck web services (see saveDocToMoodle/saveDeckToMoodle
        // above) — reusing that SAME path here means the document never
        // has to travel through this form's own POST body at all. Skips
        // straight to the normal submit when there's no cmid yet (a
        // brand-new activity being created for the first time has
        // nothing to save a document AGAINST yet), nothing to save, or
        // this is the second pass after already saving (below).
        if (!bentoDocAlreadySaved && bentoCmId && items.length && items[0].doc) {
          ev.preventDefault()
          // A specific sentinel, not '' — an actually-empty value is a
          // real, distinct case too (every slide deliberately removed,
          // confirmed above), and lib.php's own bento_update_instance()
          // needs to tell "leave the stored document alone, it's already
          // saved" apart from "this document really is meant to be blank
          // now."
          docField.value = '__bento_saved_via_ajax__'
          var progressBar = bentoShowSaveProgressBar(form)
          bentoWithSaveLock(function () {
            return saveDocToMoodle(bentoCmId, items[0].doc, function (fraction) {
              if (progressBar) progressBar.style.width = Math.round(fraction * 100) + '%'
            })
          }).then(function () {
            bentoDocAlreadySaved = true
            if (progressBar) progressBar.remove()
            // requestSubmit() (not submit()) re-triggers this SAME handler
            // — but the flag above makes that second pass fall through to
            // the plain syncDocField()+submit path below instead of
            // trying to AJAX-save a second time. Deliberately NOT
            // submit(), which would skip the browser's own native
            // validation (required fields etc.) entirely.
            form.requestSubmit()
          }, function (err) {
            if (progressBar) progressBar.remove()
            alert('Konnte die Präsentation nicht speichern: ' + (err && err.message ? err.message : err) + '\n\nDie übrigen Einstellungen wurden noch nicht gespeichert — bitte erneut versuchen.')
          })
          return
        }
        // The flagged second pass (after a successful AJAX save above)
        // must NOT reach syncDocField() — that would refill this field
        // with the full document again right before the real submit,
        // undoing the entire point of saving it via AJAX in the first
        // place. The sentinel set above is already exactly what should go
        // out on that submit, untouched.
        if (bentoDocAlreadySaved) return
        syncDocField()
      });
    }

    // Minimal public surface for bentopaste.js (a separate script, loaded
    // AFTER this one — see mod_form.php/submission_new.php) to add its own
    // generated deck into this SAME merge-with-✚ list, instead of keeping
    // a second, disconnected list of pending decks. Deliberately just
    // these two functions — nothing about HOW items/renderItems work
    // internally is exposed, only "add one more, then repaint". guardTerms
    // shares the SAME terms-agreement check the Demo/Import tiles above
    // use, so bentopaste.js's own Paste tile is gated identically rather
    // than duplicating this logic in a second file.
    window.bentoConvertApi = {
      addItem: function (item) { items.push(item); renderItems(); },
      guardTerms: bentoGuardTerms,
    };
  });
})();
