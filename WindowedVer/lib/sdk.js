(function(){

var _$r0 = (function () {
    var eventHandlerStorage = {};
    var idIndex = 0;
    var EventDispatcher = function () {
        this._eid = 'eid' + ++idIndex;
        eventHandlerStorage[this._eid] = {};
    };
    EventDispatcher.prototype = {
        getEvents: function (evt) {
            if (!this.hasOwnProperty('_eid')) {
                this._eid = 'eid' + ++idIndex;
                eventHandlerStorage[this._eid] = {};
            }
            if (evt && !eventHandlerStorage[this._eid][evt]) {
                return null;
            }
            return evt ? eventHandlerStorage[this._eid][evt] : eventHandlerStorage[this._eid];
        },
        on: function (evt, handler) {
            if (!this.hasOwnProperty('_eid')) {
                this._eid = 'eid' + ++idIndex;
                eventHandlerStorage[this._eid] = {};
            }
            var handlers = eventHandlerStorage[this._eid];
            if (!handlers[evt]) {
                handlers[evt] = [];
            }
            handlers[evt].push(handler);
            return handler;
        },
        off: function (evt, handler) {
            var es = this.getEvents();
            if (!es || !es[evt]) {
                return;
            }
            es = es[evt];
            for (var i = 0, n = es.length; i < n; i++) {
                if (es[i] === handler) {
                    es.splice(i, 1);
                    break;
                }
            }
        },
        fire: function (evt, args, context) {
            if (this['on_' + evt]) {
                this['on_' + evt].apply(this, args);
            }
            var es = this.getEvents();
            if (!es || !es[evt]) {
                return;
            }
            es = es[evt];
            for (var i = 0, n = es.length; i < n; i++) {
                if (es[i].apply(context || this, args) === true) {
                    this.off(evt, es[i]);
                    i--;
                    n--;
                }
            }
        },
        destory: function () {
            eventHandlerStorage[this._eid] = {};
        }
    };
    return EventDispatcher;
}());


var _$r1 = (function () {
    var EMPTY = function () {
    };
    var getWarningHandler = function (text) {
        return function () {
            console.error(text);
        };
    };
    var XObject = function () {
        this.protocol = {};
    };
    var setProtocol = function (protocol) {
        for (var k in protocol) {
            var isRequired = protocol[k]();
            if (isRequired === true) {
                this.prototype[k] = getWarningHandler(k);
            } else {
                this.prototype[k] = EMPTY;
            }
        }
        this.protocol = protocol;
        return this;
    };
    var extend = function (prorotypeObj) {
        for (var k in prorotypeObj) {
            this.prototype[k] = prorotypeObj[k];
        }
    };
    XObject.prototype.delegate = function (delegateImplements) {
        var protocol = this.constructor.protocol;
        for (var property in delegateImplements) {
            if (protocol[property]) {
                this[property] = delegateImplements[property];
            }
        }
        return this;
    };
    XObject.inherit = function (constructorHandler) {
        var F = function () {
        };
        F.prototype = this.prototype;
        constructorHandler.prototype = new F();
        constructorHandler.prototype.constructor = constructorHandler;
        constructorHandler.setProtocol = setProtocol;
        constructorHandler.extend = extend;
        return constructorHandler;
    };
    return XObject;
}());


var _$r2 = (function () {
    var XObject = _$r1;
    var messagingIframe = null;
    var sendUrl = function (urlString) {
        if (!messagingIframe) {
            messagingIframe = document.createElement('iframe');
            messagingIframe.style.display = 'none';
            messagingIframe.src = urlString;
            document.documentElement.appendChild(messagingIframe);
        } else {
            messagingIframe.src = urlString;
        }
    };
    var getBridgeSandbox = function (instance) {
        var bridge = instance;
        return {
            getMessage: function (channel) {
                isSending = false;
                var messageQueueString = bridge.shouldSendMessage();
                if (channel === 'consoleLog') {
                    console.log(messageQueueString);
                } else if (channel === 'url') {
                    sendUrl(bridge.getChannelCommand() + encodeURI(messageQueueString));
                }
                return messageQueueString;
            },
            notify: function (messageString) {
                bridge.onReceiveMessage(messageString);
            }
        };
    };
    var JsBridge = XObject.inherit(function () {
        });
    JsBridge.prototype.init = function () {
        window[this.getBridgeGlobalName()] = getBridgeSandbox(this);
    };
    var isSending = false;
    JsBridge.prototype.sendNotifyRequest = function () {
        if (isSending) {
            return;
        }
        isSending = true;
        var self = this;
        sendUrl(self.getFireCommand());
    };
    JsBridge.setProtocol({
        getBridgeGlobalName: function () {
            return true;
        },
        getFireCommand: function () {
            return true;
        },
        getChannelCommand: function () {
            return true;
        },
        shouldSendMessage: function () {
            return true;
        },
        onReceiveMessage: function (message) {
            return true;
        }
    });
    return JsBridge;
}());


var _$r3 = (function () {
    var ostring = Object.prototype.toString;
    var util = {
            fill: function (obj, defaultObj) {
                if (!obj) {
                    return defaultObj;
                }
                var result = {};
                for (var k in defaultObj) {
                    result[k] = k in obj ? obj[k] : defaultObj[k];
                }
                return result;
            },
            mix: function () {
                var result = {};
                for (var i = 0, n = arguments.length; i < n; i++) {
                    for (var k in arguments[i]) {
                        result[k] = arguments[i][k];
                    }
                }
                return result;
            },
            getRandomKey: function () {
                var n = 0;
                return function () {
                    return '_$@r' + n++;
                };
            }(),
            platform: function () {
                var testers = {};
                [
                    'isIPhone',
                    'isAndroid',
                    'isIPad',
                    'isPC',
                    'isMac'
                ].forEach(function (name) {
                    testers[name] = function () {
                        return false;
                    };
                });
                var ua = window.navigator.userAgent.toLowerCase();
                if (/iphone/.test(ua)) {
                    testers.isIPhone = function () {
                        return 'iphone';
                    };
                } else if (/ipad/.test(ua)) {
                    testers.isIPad = function () {
                        return 'ipad';
                    };
                } else if (/mac/.test(ua)) {
                    testers.isMac = function () {
                        return 'mac';
                    };
                } else if (/android/.test(ua)) {
                    testers.isAndroid = function () {
                        return 'android';
                    };
                } else {
                    testers.isPC = function () {
                        return true;
                    };
                }
                testers.getType = function () {
                    return this.isAndroid() || this.isIPhone() || this.isIPad() || this.isPC() || this.isMac();
                };
                return testers;
            }(),
            isArray: function (it) {
                return ostring.call(it) === '[object Array]';
            },
            isObject: function (it) {
                return ostring.call(it) === '[object Object]';
            },
            isString: function (it) {
                return ostring.call(it) === '[object String]';
            },
            isNumber: function (it) {
                return ostring.call(it) === '[object Number]';
            },
            isDom: function (it) {
                return ostring.call(it) === '[object HTMLDivElement]';
            },
            isFunction: function (it) {
                return ostring.call(it) === '[object Function]';
            },
            isEqual: function (a, b) {
                if (ostring.call(a) !== ostring.call(b)) {
                    return false;
                }
                try {
                    if (JSON.stringify(a) === JSON.stringify(b)) {
                        return true;
                    }
                    return false;
                } catch (e) {
                    return false;
                }
            },
            nextFrame: function () {
                return function (cb) {
                    return setTimeout(cb, 16);
                };
            }(),
            getExtname: function (path) {
                return path.indexOf('.') > -1 ? path.split('.').pop() : '';
            },
            inherit: function (superClass, extend) {
                var initialize = extend.initialize;
                delete extend.initialize;
                var child = function () {
                    superClass.apply(this, arguments);
                    initialize && initialize.apply(this, arguments);
                };
                var F = function () {
                };
                F.prototype = superClass.prototype;
                child.prototype = new F();
                for (var key in extend) {
                    if (extend.hasOwnProperty(key)) {
                        child.prototype[key] = extend[key];
                    }
                }
                child.prototype.constructor = child;
                return child;
            }
        };
    return util;
}());


var _$r4 = (function () {
    var JsBridge = _$r2;
    var EventDispatcher = _$r0;
    var util = _$r3;
    var MESSAGE_SCHEME = 'bdscheme://';
    var MESSAGE_SEMAPHORE = '_MESSAGE_SEMAPHORE_';
    var MESSAGE_QUEUE = '_MESSAGE_QUEUE_';
    var MESSAGE_SEPARATOR = '_MESSAGE_SEPERATOR_';
    var COM_BRIDGE_NAMESPACE = 'BMapComBridge';
    var kernel = new JsBridge();
    var dispatcher = new EventDispatcher();
    var sendMessageQueue = [];
    kernel.delegate({
        getBridgeGlobalName: function () {
            return COM_BRIDGE_NAMESPACE;
        },
        getFireCommand: function () {
            return MESSAGE_SCHEME + MESSAGE_SEMAPHORE;
        },
        getChannelCommand: function () {
            return MESSAGE_SCHEME + MESSAGE_QUEUE;
        },
        shouldSendMessage: function () {
            var messageString = sendMessageQueue.join(MESSAGE_SEPARATOR);
            sendMessageQueue = [];
            return messageString;
        },
        onReceiveMessage: function (message) {
            var message = util.isString(message) ? JSON.parse(message) : message;
            var eventName = message.invokeEvent || message.callbackEvent;
            var param = message.param || message.responseData || {};
            if (eventName == 'entranceParam') {
                BMapCom.config('version', param.pageParam && param.pageParam.da_mversion || '');
                BMapCom.config('uid', param.pageParam && param.pageParam.uid || '');
            }
            dispatcher.fire(eventName, [param]);
        }
    });
    kernel.init();
    var KernelInterface = {
            remove: function (listener) {
                return dispatcher.off(listener);
            },
            listen: function (eventName, callback) {
                return dispatcher.on(eventName, callback);
            },
            notify: function (invokeEvent, param, callback) {
                var callbackEvent = '';
                if (util.isString(callback)) {
                    callbackEvent = callback;
                    callback = null;
                } else {
                    callbackEvent = 'ce_' + util.getRandomKey();
                }
                if (callback) {
                    dispatcher.on(callbackEvent, function () {
                        callback && callback.apply(null, arguments);
                        dispatcher.off(callbackEvent, arguments.callee);
                        return true;
                    });
                }
                var message = {
                        'invokeEvent': invokeEvent,
                        'callbackEvent': callbackEvent,
                        'param': param
                    };
                sendMessageQueue.push(JSON.stringify(message));
                kernel.sendNotifyRequest();
            },
            fetchData: function (callback) {
                this.fetch = function (result, type, sendTime, startTime) {
                    if (typeof result == 'string' && result == 'failed') {
                        BMapCom.Stat.sendOffline('com_getdata_error', {
                            'desc': 'Fail to get data',
                            'src_name': type
                        }, true);
                        return;
                    }
                    callback && callback(result, sendTime, startTime);
                };
                callback && this.notify('funCallReady');
            }
        };
    return KernelInterface;
}());


var _$r5 = (function () {
    var Kernel = _$r4;
    var exports = {
            NETWORK_TYPE: {
                NETWORK_NOT_CONNECTED: -1,
                NETWORK_UNKNOWN: 0,
                NETWORK_WIFI: 1,
                NETWORK_2G: 2,
                NETWORK_3G: 3,
                NETWORK_4G: 4,
                NETWORK_TELECOM_2G: 5,
                NETWORK_MOBILE_UNICOM_2G: 6,
                NETWORK_TELECOM_3G: 7,
                NETWORK_MOBILE_3G: 8,
                NETWORK_UNICOM_3G: 9,
                NETWORK_4G_UNKNOWN: 10
            },
            RUNTIME_INFO_TYPE: {
                LOCATION: 'Location',
                BDUSS: 'Bduss',
                CITY_ID: 'CityId',
                VIEWPORT: 'Viewport'
            },
            SYSTEM_INFO_TYPE: {
                OS_NAME: 'OsName',
                OS_VERSION: 'OsVersion',
                APP_VERSION: 'AppVersion',
                OEM: 'Oem',
                CHANNEL: 'Channel',
                SCREEN_WIDTH: 'ScreenWidth',
                SCREEN_HEIGHT: 'ScreenHeight',
                SCREEN_XDPI: 'ScreenXDpi',
                SCREEN_YDPI: 'ScreenYDpi',
                NETWORK_AVAILABLE: 'NetworkAvailable',
                WIFI_CONNECTED: 'WifiConnected',
                NETWORK_TYPE: 'NetworkType',
                CUID: 'Cuid',
                RESID: 'Resid'
            },
            onNativeInvoke: function (invokeEvent, callback) {
                Kernel.listen(invokeEvent, callback);
            },
            poiSearch: function (param, callback) {
                var requestParam = {
                        'category': 'Searcher',
                        'method': 'query',
                        'param': param
                    };
                Kernel.notify('request', requestParam, callback);
            },
            getRuntimeInfo: function (infos, callback) {
                if (typeof infos == 'string') {
                    var type = infos;
                    var callbackInternel = function (infoData) {
                        if (infoData) {
                            callback && callback.apply(null, [infoData[type]]);
                        }
                    };
                    Kernel.notify('getRuntimeInfo', [infos], callbackInternel);
                } else {
                    Kernel.notify('getRuntimeInfo', infos, callback);
                }
            },
            getSystemInfo: function (infos, callback) {
                var callbackInternel;
                var cachedSystemInfo = function (arg) {
                    var cached = {}, cr;
                    arg = typeof arg == 'string' ? [arg] : arg;
                    if (arg.constructor == Array) {
                        for (var i = 0; i < arg.length; i++) {
                            cr = BMapCom.config(arg[i]);
                            if (!cr)
                                return false;
                            cached[arg[i]] = cr;
                        }
                        return cached;
                    } else {
                        if (arg.constructor == Object) {
                            for (var obj in arg)
                                BMapCom.config(obj, arg[obj]);
                        }
                    }
                    return false;
                };
                var cached = cachedSystemInfo(infos);
                if (typeof infos == 'string') {
                    var type = infos;
                    if (cached) {
                        callback && callback.apply(null, [cached[type]]);
                        return;
                    }
                    callbackInternel = function (infoData) {
                        if (infoData) {
                            BMapCom.config(type, infoData[type]);
                            callback && callback.apply(null, [infoData[type]]);
                        }
                    };
                    Kernel.notify('getSystemInfo', [infos], callbackInternel);
                } else {
                    if (cached) {
                        callback && callback.apply(null, [cached]);
                        return;
                    }
                    callbackInternel = function (infoData) {
                        if (infoData) {
                            BMapCom.config(infoData);
                            callback && callback.apply(null, [infoData]);
                        }
                    };
                    Kernel.notify('getSystemInfo', infos, callbackInternel);
                }
            },
            getOsName: function (callback) {
                this.getSystemInfo(this.SYSTEM_INFO_TYPE.OS_NAME, callback);
            },
            getOsVersion: function (callback) {
                this.getSystemInfo(this.SYSTEM_INFO_TYPE.OS_VERSION, callback);
            },
            getAppVersion: function (callback) {
                this.getSystemInfo(this.SYSTEM_INFO_TYPE.APP_VERSION, callback);
            },
            getOem: function (callback) {
                this.getSystemInfo(this.SYSTEM_INFO_TYPE.OEM, callback);
            },
            getChannel: function (callback) {
                this.getSystemInfo(this.SYSTEM_INFO_TYPE.CHANNEL, callback);
            },
            getScreenWidth: function (callback) {
                this.getSystemInfo(this.SYSTEM_INFO_TYPE.SCREEN_WIDTH, callback);
            },
            getScreenHeight: function (callback) {
                this.getSystemInfo(this.SYSTEM_INFO_TYPE.SCREEN_HEIGHT, callback);
            },
            getScreenXDpi: function (callback) {
                this.getSystemInfo(this.SYSTEM_INFO_TYPE.SCREEN_XDPI, callback);
            },
            getScreenYDpi: function (callback) {
                this.getSystemInfo(this.SYSTEM_INFO_TYPE.SCREEN_YDPI, callback);
            },
            isNetworkAvailable: function (callback) {
                this.getSystemInfo(this.SYSTEM_INFO_TYPE.NETWORK_AVAILABLE, function (isAvailable) {
                    callback && callback(!!isAvailable);
                });
            },
            isWifiConnected: function (callback) {
                var NETWORK_TYPE = this.NETWORK_TYPE;
                this.getNetworkType(function (type) {
                    callback && callback(type !== NETWORK_TYPE.NETWORK_WIFI);
                });
            },
            getNetworkType: function (callback) {
                this.getSystemInfo(this.SYSTEM_INFO_TYPE.NETWORK_TYPE, callback);
            },
            getCuid: function (callback) {
                this.getSystemInfo(this.SYSTEM_INFO_TYPE.CUID, callback);
            },
            tel: function (phoneNumber) {
                Kernel.notify('tel', phoneNumber);
            }
        };
    return exports;
}());


var _$r6 = (function () {
    'use strict';
    if (window.Promise) {
    }
    var Promise = function (fn) {
        if (!(this instanceof Promise))
            return new Promise(fn);
        if (typeof fn !== 'function')
            throw new TypeError('not a function');
        var state = null;
        var delegating = false;
        var value = null;
        var deferreds = [];
        var self = this;
        this.then = function (onFulfilled, onRejected) {
            return new Promise(function (resolve, reject) {
                handle(new Handler(onFulfilled, onRejected, resolve, reject));
            });
        };
        function handle(deferred) {
            if (state === null) {
                deferreds.push(deferred);
                return;
            }
            var cb = state ? deferred.onFulfilled : deferred.onRejected;
            if (cb === null) {
                (state ? deferred.resolve : deferred.reject)(value);
                return;
            }
            var ret;
            try {
                ret = cb(value);
            } catch (e) {
                deferred.reject(e);
                throw new Error(e);
                return;
            }
            deferred.resolve(ret);
        }
        var resolve = this.resolve = function (newValue) {
                if (delegating)
                    return;
                resolve_(newValue);
            };
        function resolve_(newValue) {
            if (state !== null)
                return;
            try {
                if (newValue === self)
                    throw new TypeError('A promise cannot be resolved with itself.');
                if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
                    var then = newValue.then;
                    if (typeof then === 'function') {
                        delegating = true;
                        then.call(newValue, resolve_, reject_);
                        return;
                    }
                }
                state = true;
                value = newValue;
                finale();
            } catch (e) {
                reject_(e);
                throw new Error(e);
            }
        }
        var reject = this.reject = function (newValue) {
                if (delegating)
                    return;
                reject_(newValue);
            };
        function reject_(newValue) {
            if (state !== null)
                return;
            state = false;
            value = newValue;
            finale();
        }
        function finale() {
            for (var i = 0, len = deferreds.length; i < len; i++)
                handle(deferreds[i]);
            deferreds = null;
        }
        try {
            fn(resolve, reject);
        } catch (e) {
            reject(e);
            throw new Error(e);
        }
    };
    function Handler(onFulfilled, onRejected, resolve, reject) {
        this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
        this.onRejected = typeof onRejected === 'function' ? onRejected : null;
        this.resolve = resolve;
        this.reject = reject;
    }
    Promise.all = function (promiseArray) {
        var remaining = promiseArray.length;
        var allPromise = new Promise(function (resolve, reject) {
            });
        var results = new Array(promiseArray.length);
        promiseArray.forEach(function (p, index) {
            p.then(function (i) {
                return function (value) {
                    results[i] = value;
                    --remaining || allPromise.resolve(results);
                };
            }(index));
        });
        return allPromise;
    };
    return Promise;
}());


var _$r7 = (function () {
    'use strict';
    var EventPrototype = _$r0;
    var Promise = _$r6;
    var SysApi = _$r5;
    var ERROR_CODE = 'connect error';
    var TYPE = {
            IMG: 0,
            SCRIPT: 1,
            JSONP: 2
        };
    var MAX_CONNECTING = 3;
    var isType = function (type) {
        return function (obj) {
            return Object.prototype.toString.call(obj) === '[object ' + type + ']';
        };
    };
    var isObject = isType('Object');
    var isString = isType('String');
    var isArray = Array.isArray || isType('Array');
    var count = 0;
    var loadScript = function (src, callback) {
        var script = document.createElement('script');
        script.src = src;
        script.onload = function () {
            document.body.removeChild(script);
            script = null;
            callback(null, src);
        };
        script.onerror = function () {
            callback(ERROR_CODE);
        };
        document.body.appendChild(script);
    };
    var loadJsonp = function (src, callback) {
        var cbName, url, script, isDebug, param = {}, paramArray = [];
        cbName = '_cbid' + count++;
        param.cb = cbName;
        param.callback = cbName;
        isDebug = BMapCom.config('templateHtmlMode');
        var p = new Promise(function (resolve) {
                if (isDebug) {
                    resolve(null);
                } else {
                    var queryStr = src.substr(src.indexOf('?') + 1);
                    var queryArr = queryStr.split('&');
                    var alreadyKeys = {};
                    queryArr.forEach(function (item) {
                        var key = item.split('=')[0].toLowerCase();
                        alreadyKeys[key] = true;
                    });
                    var infos = [
                            SysApi.SYSTEM_INFO_TYPE.RESID,
                            SysApi.SYSTEM_INFO_TYPE.OS_NAME,
                            SysApi.SYSTEM_INFO_TYPE.OS_VERSION,
                            SysApi.SYSTEM_INFO_TYPE.APP_VERSION,
                            SysApi.SYSTEM_INFO_TYPE.CHANNEL,
                            SysApi.SYSTEM_INFO_TYPE.CUID
                        ];
                    var filterInfo = [];
                    infos.forEach(function (item) {
                        if (!alreadyKeys[item.toLowerCase()]) {
                            if (item != SysApi.SYSTEM_INFO_TYPE.OS_VERSION || !alreadyKeys[SysApi.SYSTEM_INFO_TYPE.OS_NAME.toLowerCase()])
                                filterInfo.push(item);
                        }
                    });
                    SysApi.getSystemInfo(filterInfo, function (result) {
                        for (var r in result) {
                            if (r == SysApi.SYSTEM_INFO_TYPE.OS_VERSION)
                                continue;
                            if (r == SysApi.SYSTEM_INFO_TYPE.OS_NAME)
                                param[r.toLowerCase()] = result[r] + result[SysApi.SYSTEM_INFO_TYPE.OS_VERSION];
                            else
                                param[r.toLowerCase()] = result[r];
                        }
                        resolve(null);
                    });
                }
            }).then(function () {
                for (var key in param) {
                    if (param[key]) {
                        paramArray.push(key + '=' + param[key]);
                    }
                }
                url = src + '&' + paramArray.join('&');
                script = document.createElement('script');
                script.src = url;
                script.onerror = function () {
                    window[cbName](ERROR_CODE);
                };
                window[cbName] = function (data) {
                    document.body.removeChild(script);
                    delete window[cbName];
                    cbName = null;
                    script = null;
                    callback(null, src, data);
                };
                document.body.appendChild(script);
            });
    };
    var loadImg = function (src, callback) {
        var img = new Image();
        img.onload = function () {
            callback && callback(null, src, this);
        };
        img.src = src;
    };
    var loader = function (type, src, callback) {
        switch (type) {
        case TYPE.SCRIPT:
            loadScript(src, callback);
            break;
        case TYPE.JSONP:
            loadJsonp(src, callback);
            break;
        case TYPE.IMG:
            loadImg(src, callback);
            break;
        }
    };
    var LoaderPromise = function (queue, type, callback) {
        var self = this;
        if (isArray(queue)) {
            var promises = [];
            while (queue.length) {
                var promise = new Promise(function (resolve, reject) {
                        loader(type, queue.pop(), function (errorCode, src, data) {
                            if (errorCode === ERROR_CODE) {
                                reject('fail');
                            } else {
                                if (self.progressHandler) {
                                    self.progressHandler(data);
                                }
                                resolve({
                                    'src': src,
                                    'data': data
                                });
                            }
                        });
                    });
                promises.push(promise);
            }
            this.promise = Promise.all(promises);
        } else {
            var promise = this.promise = new Promise(function (resolve, reject) {
                    loader(type, queue, function (errorCode, src, data) {
                        if (errorCode === ERROR_CODE) {
                            reject('fail');
                        } else {
                            callback && callback(data);
                            resolve({
                                'src': src,
                                'data': data
                            });
                        }
                    });
                });
        }
    };
    LoaderPromise.prototype = {
        ok: function (handler) {
            this.promise.then(function () {
                handler.apply(null, arguments);
            });
            return this;
        },
        error: function (handler) {
            this.promise.then(null, function () {
                handler.apply(null, arguments);
            });
            return this;
        },
        progress: function (handler) {
            this.progressHandler = function () {
                handler.apply(null, arguments);
            };
            return this;
        }
    };
    var $ = {
            script: function (queue, callback) {
                return new LoaderPromise(queue, TYPE.SCRIPT, callback);
            },
            jsonp: function (queue, callback) {
                return new LoaderPromise(queue, TYPE.JSONP, callback);
            },
            img: function (queue, callback) {
                return new LoaderPromise(queue, TYPE.IMG, callback);
            },
            css: function (queue) {
                queue = isArray(queue) ? queue : [queue];
                while (queue.length) {
                    var one = queue.pop();
                    var s = document.createElement('link');
                    s.type = 'text/css';
                    s.rel = 'stylesheet';
                    s.href = one;
                    document.body.appendChild(s);
                }
            }
        };
    return $;
}());


var _$r8 = (function () {
    var Kernel = _$r4;
    var SysApi = _$r5;
    var Loader = _$r7;
    var Util = _$r3;
    var timeline = [];
    var supportList = { 'scenery': 1 };
    var Stat = {
            begin: function () {
            },
            timePoint: function (key) {
            },
            finish: function () {
            },
            log: function (action, param) {
            },
            sendRealTime: function (action, param) {
                var statParam = {
                        'type': 'realTime',
                        'action': action,
                        'param': param
                    };
                Kernel.notify('statistic', statParam);
            },
            sendOffline: function (action, param, type) {
                var statParam = {
                        'type': 'offline',
                        'action': action,
                        'param': param
                    };
                type && (statParam['monitor'] = '1');
                Kernel.notify('statistic', statParam);
            },
            sendMonitor: function (step, param) {
                var result = {
                        'type': step,
                        'src_name': BMapCom.config('src_name')
                    };
                if (param && typeof param == 'object') {
                    for (var k in param) {
                        result[k] = param[k];
                    }
                }
                var statParam = {
                        'type': 'offline',
                        'action': 'baseframe_monitor_step',
                        'param': result,
                        'monitor': '1'
                    };
                Kernel.notify('statistic', statParam);
            },
            config: function (category, uid) {
                if (supportList[category]) {
                    BMapCom.config('category', category);
                    BMapCom.config('supported', true);
                    var os = Util.platform.isAndroid() ? 'android' : 'iphone';
                    var comId = 'map.' + os + '.baidu.' + category;
                    BMapCom.config('src_name', comId);
                    BMapCom.config('uid', uid || '');
                }
            },
            sendOnline: function (param) {
                var statUrl = 'http://client.map.baidu.com/place/v5/img/transparent_gif?';
                var infos = [
                        SysApi.SYSTEM_INFO_TYPE.RESID,
                        SysApi.SYSTEM_INFO_TYPE.OS_NAME,
                        SysApi.SYSTEM_INFO_TYPE.OS_VERSION,
                        SysApi.SYSTEM_INFO_TYPE.APP_VERSION,
                        SysApi.SYSTEM_INFO_TYPE.CHANNEL,
                        SysApi.SYSTEM_INFO_TYPE.CUID
                    ];
                SysApi.getSystemInfo(infos, function (result) {
                    param.resid = result[SysApi.SYSTEM_INFO_TYPE.RESID];
                    param.os = result[SysApi.SYSTEM_INFO_TYPE.OS_NAME] + result[SysApi.SYSTEM_INFO_TYPE.OS_VERSION];
                    param.sv = result[SysApi.SYSTEM_INFO_TYPE.APP_VERSION];
                    param.channel = result[SysApi.SYSTEM_INFO_TYPE.CHANNEL];
                    param.cuid = result[SysApi.SYSTEM_INFO_TYPE.CUID];
                    param.da_mversion = BMapCom.config('version') || '';
                    param.t = new Date().getTime();
                    var paramArray = [];
                    for (var key in param) {
                        if (param[key]) {
                            paramArray.push(key + '=' + param[key]);
                        }
                    }
                    var queryString = paramArray.join('&');
                    Loader.img(statUrl + queryString);
                });
            }
        };
    Stat.begin();
    return Stat;
}());


var _$r9 = (function () {
    var LOCAL_STORAGE_DEFAULT_EXPIRE_TIME = 5;
    var storage = {
            getLocalStorage: function (key) {
                var value = window.localStorage[key];
                if (value) {
                    var currentTime = new Date().getTime();
                    var expireTime = value.substring(0, value.indexOf('_'));
                    if (currentTime - expireTime > 0) {
                        window.localStorage.removeItem(key);
                        return null;
                    } else {
                        var result = JSON.parse(value.substring(value.indexOf('_') + 1, value.length));
                        return result;
                    }
                }
            },
            setLocalStorage: function (key, value, expire) {
                if (!key || !value) {
                    return;
                }
                var currentTime = new Date().getTime();
                var expireTime = (expire ? parseInt(expire) : LOCAL_STORAGE_DEFAULT_EXPIRE_TIME) * 60 * 1000;
                try {
                    window.localStorage[key] = currentTime + expireTime + '_' + JSON.stringify(value);
                } catch (e) {
                    window.localStorage.clear();
                    window.localStorage[key] = currentTime + expireTime + '_' + JSON.stringify(value);
                }
            }
        };
    return storage;
}());


var _$r10 = (function () {
    var util = _$r3;
    var THUMB_DOMAIN = 'http://map.baidu.com/maps/services/thumbnails';
    var comUtil = {
            getThumbUrl: function (src, width, height, align) {
                return [
                    THUMB_DOMAIN + '?src=' + src,
                    'width=' + (width || 100),
                    'height=' + (height || 100),
                    'align=' + (align || 'center')
                ].join('&');
            },
            platform: function () {
                var testers = {};
                [
                    'isIPhone',
                    'isAndroid',
                    'isIPad',
                    'isPC',
                    'isMac'
                ].forEach(function (name) {
                    testers[name] = function () {
                        return false;
                    };
                });
                var ua = window.navigator.userAgent.toLowerCase();
                if (/iphone/.test(ua)) {
                    testers.isIPhone = function () {
                        return 'iphone';
                    };
                } else if (/ipad/.test(ua)) {
                    testers.isIPad = function () {
                        return 'ipad';
                    };
                } else if (/mac/.test(ua)) {
                    testers.isMac = function () {
                        return 'mac';
                    };
                } else if (/android/.test(ua)) {
                    testers.isAndroid = function () {
                        return 'android';
                    };
                } else {
                    testers.isPC = function () {
                        return true;
                    };
                }
                testers.getType = function () {
                    return this.isAndroid() || this.isIPhone() || this.isIPad() || this.isPC() || this.isMac();
                };
                return testers;
            }(),
            $nth: function (elem, result, dir) {
                result = result || 1;
                var num = 0;
                for (; elem; elem = elem[dir]) {
                    if (elem.nodeType === 1 && ++num === result) {
                        break;
                    }
                }
                return elem;
            },
            $nextNode: function (elem) {
                return this.$nth(elem, 2, 'nextSibling');
            },
            $prevNode: function (elem) {
                return this.$nth(elem, 2, 'previousSibling');
            }
        };
    return comUtil;
}());


var _$r11 = (function () {
    var global = window;
    'use strict';
    var template = function (id, content) {
        return template[typeof content === 'string' ? 'compile' : 'render'].apply(template, arguments);
    };
    template.version = '2.0.2';
    template.openTag = '<%';
    template.closeTag = '%>';
    template.isEscape = true;
    template.isCompress = false;
    template.parser = null;
    template.render = function (id, data) {
        var cache = template.get(id) || _debug({
                id: id,
                name: 'Render Error',
                message: 'No Template'
            });
        return cache(data);
    };
    template.compile = function (id, source) {
        var params = arguments;
        var isDebug = params[2];
        var anonymous = 'anonymous';
        if (typeof source !== 'string') {
            isDebug = params[1];
            source = params[0];
            id = anonymous;
        }
        try {
            var Render = _compile(id, source, isDebug);
        } catch (e) {
            e.id = id || source;
            e.name = 'Syntax Error';
            return _debug(e);
        }
        function render(data) {
            try {
                return new Render(data, id) + '';
            } catch (e) {
                if (!isDebug) {
                    return template.compile(id, source, true)(data);
                }
                return _debug(e)();
            }
        }
        render.prototype = Render.prototype;
        render.toString = function () {
            return Render.toString();
        };
        if (id !== anonymous) {
            _cache[id] = render;
        }
        return render;
    };
    var _cache = template.cache = {};
    var _helpers = template.helpers = function () {
            var toString = function (value, type) {
                if (typeof value !== 'string') {
                    type = typeof value;
                    if (type === 'number') {
                        value += '';
                    } else if (type === 'function') {
                        value = toString(value.call(value));
                    } else {
                        value = '';
                    }
                }
                return value;
            };
            var escapeMap = {
                    '<': '&#60;',
                    '>': '&#62;',
                    '"': '&#34;',
                    '\'': '&#39;',
                    '&': '&#38;'
                };
            var escapeHTML = function (content) {
                return toString(content).replace(/&(?![\w#]+;)|[<>"']/g, function (s) {
                    return escapeMap[s];
                });
            };
            var isArray = Array.isArray || function (obj) {
                    return {}.toString.call(obj) === '[object Array]';
                };
            var each = function (data, callback) {
                if (isArray(data)) {
                    for (var i = 0, len = data.length; i < len; i++) {
                        callback.call(data, data[i], i, data);
                    }
                } else {
                    for (i in data) {
                        callback.call(data, data[i], i);
                    }
                }
            };
            return {
                $include: template.render,
                $string: toString,
                $escape: escapeHTML,
                $each: each
            };
        }();
    template.helper = function (name, helper) {
        _helpers[name] = helper;
    };
    template.onerror = function (e) {
        var message = 'Template Error\n\n';
        for (var name in e) {
            message += '<' + name + '>\n' + e[name] + '\n\n';
        }
        if (global.console) {
            console.error(message);
        }
    };
    template.get = function (id) {
        var cache;
        if (_cache.hasOwnProperty(id)) {
            cache = _cache[id];
        } else if ('document' in global) {
            var elem = document.getElementById(id);
            if (elem) {
                var source = elem.value || elem.innerHTML;
                cache = template.compile(id, source.replace(/^\s*|\s*$/g, ''));
            }
        }
        return cache;
    };
    var _debug = function (e) {
        template.onerror(e);
        return function () {
            return '{Template Error}';
        };
    };
    var _compile = function () {
            var forEach = _helpers.$each;
            var KEYWORDS = 'break,case,catch,continue,debugger,default,delete,do,else,false' + ',finally,for,function,if,in,instanceof,new,null,return,switch,this' + ',throw,true,try,typeof,var,void,while,with' + ',abstract,boolean,byte,char,class,const,double,enum,export,extends' + ',final,float,goto,implements,import,int,interface,long,native' + ',package,private,protected,public,short,static,super,synchronized' + ',throws,transient,volatile' + ',arguments,let,yield' + ',undefined';
            var REMOVE_RE = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|[\s\t\n]*\.[\s\t\n]*[$\w\.]+/g;
            var SPLIT_RE = /[^\w$]+/g;
            var KEYWORDS_RE = new RegExp(['\\b' + KEYWORDS.replace(/,/g, '\\b|\\b') + '\\b'].join('|'), 'g');
            var NUMBER_RE = /^\d[^,]*|,\d[^,]*/g;
            var BOUNDARY_RE = /^,+|,+$/g;
            var getVariable = function (code) {
                return code.replace(REMOVE_RE, '').replace(SPLIT_RE, ',').replace(KEYWORDS_RE, '').replace(NUMBER_RE, '').replace(BOUNDARY_RE, '').split(/^$|,+/);
            };
            return function (id, source, isDebug) {
                var openTag = template.openTag;
                var closeTag = template.closeTag;
                var parser = template.parser;
                var code = source;
                var tempCode = '';
                var line = 1;
                var uniq = {
                        $data: 1,
                        $id: 1,
                        $helpers: 1,
                        $out: 1,
                        $line: 1
                    };
                var prototype = {};
                var variables = 'var $helpers=this,' + (isDebug ? '$line=0,' : '');
                var isNewEngine = ''.trim;
                var replaces = isNewEngine ? [
                        '$out=\'\';',
                        '$out+=',
                        ';',
                        '$out'
                    ] : [
                        '$out=[];',
                        '$out.push(',
                        ');',
                        '$out.join(\'\')'
                    ];
                var concat = isNewEngine ? 'if(content!==undefined){$out+=content;return content;}' : '$out.push(content);';
                var print = 'function(content){' + concat + '}';
                var include = 'function(id,data){' + 'data=data||$data;' + 'var content=$helpers.$include(id,data,$id);' + concat + '}';
                forEach(code.split(openTag), function (code, i) {
                    code = code.split(closeTag);
                    var $0 = code[0];
                    var $1 = code[1];
                    if (code.length === 1) {
                        tempCode += html($0);
                    } else {
                        tempCode += logic($0);
                        if ($1) {
                            tempCode += html($1);
                        }
                    }
                });
                code = tempCode;
                if (isDebug) {
                    code = 'try{' + code + '}catch(e){' + 'throw {' + 'id:$id,' + 'name:\'Render Error\',' + 'message:e.message,' + 'line:$line,' + 'source:' + stringify(source) + '.split(/\\n/)[$line-1].replace(/^[\\s\\t]+/,\'\')' + '};' + '}';
                }
                code = variables + replaces[0] + code + 'return new String(' + replaces[3] + ');';
                try {
                    var Render = new Function('$data', '$id', code);
                    Render.prototype = prototype;
                    return Render;
                } catch (e) {
                    e.temp = 'function anonymous($data,$id) {' + code + '}';
                    throw e;
                }
                function html(code) {
                    line += code.split(/\n/).length - 1;
                    if (template.isCompress) {
                        code = code.replace(/[\n\r\t\s]+/g, ' ').replace(/<!--.*?-->/g, '');
                    }
                    if (code) {
                        code = replaces[1] + stringify(code) + replaces[2] + '\n';
                    }
                    return code;
                }
                function logic(code) {
                    var thisLine = line;
                    if (parser) {
                        code = parser(code);
                    } else if (isDebug) {
                        code = code.replace(/\n/g, function () {
                            line++;
                            return '$line=' + line + ';';
                        });
                    }
                    if (code.indexOf('=') === 0) {
                        var isEscape = code.indexOf('==') !== 0;
                        code = code.replace(/^=*|[\s;]*$/g, '');
                        if (isEscape && template.isEscape) {
                            var name = code.replace(/\s*\([^\)]+\)/, '');
                            if (!_helpers.hasOwnProperty(name) && !/^(include|print)$/.test(name)) {
                                code = '$escape(' + code + ')';
                            }
                        } else {
                            code = '$string(' + code + ')';
                        }
                        code = replaces[1] + code + replaces[2];
                    }
                    if (isDebug) {
                        code = '$line=' + thisLine + ';' + code;
                    }
                    getKey(code);
                    return code + '\n';
                }
                function getKey(code) {
                    code = getVariable(code);
                    forEach(code, function (name) {
                        if (!uniq.hasOwnProperty(name)) {
                            setValue(name);
                            uniq[name] = true;
                        }
                    });
                }
                function setValue(name) {
                    var value;
                    if (name === 'print') {
                        value = print;
                    } else if (name === 'include') {
                        prototype['$include'] = _helpers['$include'];
                        value = include;
                    } else {
                        value = '$data.' + name;
                        if (_helpers.hasOwnProperty(name)) {
                            prototype[name] = _helpers[name];
                            if (name.indexOf('$') === 0) {
                                value = '$helpers.' + name;
                            } else {
                                value = value + '===undefined?$helpers.' + name + ':' + value;
                            }
                        }
                    }
                    variables += name + '=' + value + ',';
                }
                function stringify(code) {
                    return '\'' + code.replace(/('|\\)/g, '\\$1').replace(/\r/g, '\\r').replace(/\n/g, '\\n') + '\'';
                }
            };
        }();
    if (typeof exports !== 'undefined') {
        module.exports = template;
    }
    return template;
}());


var _$r12 = (function () {
    var cfg = {
            'phpuiDomain': 'http://client.map.baidu.com/phpui2/',
            'controllerPath': 'controller/{%id%}',
            'templatePath': 'template/{%id%}',
            'pluginPath': 'plugin/{%id%}',
            'templateHtmlMode': false
        };
    var config = function (key, value) {
        var n = arguments.length;
        if (n === 1) {
            if (typeof key === 'string') {
                return cfg[key];
            } else {
                for (var k in key) {
                    cfg[k] = key[k];
                }
            }
        } else if (n === 2) {
            cfg[key] = value;
        }
    };
    return config;
}());


var _$r13 = (function () {
    var util = _$r3;
    var artTemplate = _$r11;
    var Loader = _$r7;
    var config = _$r12;
    var CODER = 'var obj={};[].forEach.call(document.getElementsByTagName("script"),function(e){e.id&&(obj[e.id]=encodeURIComponent(e.innerHTML.trim()))});if(parent){var message=JSON.stringify({templateID:"<%templateid%>",template:obj});parent.postMessage(message,"*")}';
    var templates = {};
    var callbacks = {};
    var ifrHash = {};
    window.addEventListener('message', function (message) {
        var data = JSON.parse(message.data);
        var className = data.templateID;
        var extname = util.getExtname(data.templateID);
        if (extname === 'html') {
            className = data.templateID.substring(data.templateID.lastIndexOf('/') + 1).replace('.html', '');
        }
        var ifrs = document.body.querySelectorAll('.' + className);
        if ((ifrHash[className] = ifrHash[className] - 1) == 0) {
            [].slice.call(ifrs, 0).forEach(function (item, idx) {
                item.parentNode.removeChild(item);
            });
        }
        var templateHandlers = {};
        for (var tName in data.template) {
            templateHandlers[tName] = artTemplate.compile(decodeURIComponent(data.template[tName]));
        }
        var callback = callbacks[data.templateID];
        templates[data.templateID] = templateHandlers;
        if (callback) {
            callback(templateHandlers);
        }
    });
    var Template = {};
    Template.create = function (templateID, templateHandlers) {
        templates[templateID] = templateHandlers;
    };
    Template.load = function (templateID, callback) {
        if (templates[templateID]) {
            callback && callback(templates[templateID]);
            return;
        }
        if (config('templateHtmlMode')) {
            var ifm = document.createElement('iframe');
            callbacks[templateID] = callback;
            var ifmClass = templateID;
            ifm.className = ifmClass;
            var hash = '#' + encodeURIComponent(CODER.replace('<%templateid%>', templateID));
            var extname = util.getExtname(templateID);
            if (extname === 'html') {
                ifm.className = ifmClass.substring(ifmClass.lastIndexOf('/') + 1).replace('.html', '');
                ifmClass = ifm.className;
                ifm.src = templateID + hash;
            } else {
                ifm.src = config('templatePath').replace('{%id%}', templateID) + '.html' + hash;
            }
            ifrHash[ifmClass] = ifrHash[ifmClass] ? ifrHash[ifmClass] + 1 : 1;
            ifm.style.cssText = 'display:none;position:absolute;width:1px;height:1px;';
            document.body.appendChild(ifm);
        } else {
            var templatePath = config('templatePath').replace('{%id%}', templateID) + '.js';
            Loader.script(templatePath).ok(function () {
                callback && callback(templates[templateID]);
            });
        }
    };
    Template.getLoadedTemplate = function () {
        return templates;
    };
    Template.helpers = artTemplate.helpers;
    return Template;
}());


var _$r14 = (function () {
    var EventDispatcher = _$r0;
    var Event = {};
    var dispatcher = new EventDispatcher();
    var touch = {
            'pageX': 0,
            'pageY': 0,
            't': 0
        };
    var DIR = {
            NONE: 0,
            LEFT: 'left',
            RIGHT: 'right',
            TOP: 'top',
            BOTTOM: 'bottom'
        };
    var getDistance = function (p1, p2) {
        return Math.pow(Math.pow(p1.pageX - p2.pageX, 2) + Math.pow(p1.pageY - p2.pageY, 2), 0.5);
    };
    var getDirectionFromXY = function (dx, dy) {
        if (dx === 0 || dy === 0) {
            if (dx > 0) {
                return DIR.RIGHT;
            } else if (dx < 0) {
                return DIR.LEFT;
            } else if (dy > 0) {
                return DIR.BOTTOM;
            } else if (dy < 0) {
                return DIR.TOP;
            }
        }
        if (dx > 0 && dy > 0) {
            if (dx > dy) {
                return DIR.RIGHT;
            } else {
                return DIR.BOTTOM;
            }
        } else if (dx < 0 && dy < 0) {
            if (dx > dy) {
                return DIR.TOP;
            } else {
                return DIR.LEFT;
            }
        } else if (dx > 0 && dy < 0) {
            if (dx > -dy) {
                return DIR.RIGHT;
            } else {
                return DIR.TOP;
            }
        } else {
            if (-dx > dy) {
                return DIR.LEFT;
            } else {
                return DIR.BOTTOM;
            }
        }
    };
    var trackHanlder = {
            start: function (e) {
                var t = e.touches[0];
                touch = {
                    'pageX': t.pageX,
                    'pageY': t.pageY,
                    't': Date.now()
                };
                dispatcher.fire('touchstart', [e]);
            },
            move: function (e) {
            },
            end: function (e) {
                touch = {
                    'pageX': 0,
                    'pageY': 0,
                    't': 0
                };
                dispatcher.fire('touchend', [e]);
            }
        };
    var _fixEvent = null;
    var getFixEvent = function (baseEvent) {
        _fixEvent = {};
        var t = baseEvent.changedTouches ? baseEvent.changedTouches[0] : baseEvent.touches[0];
        _fixEvent.dx = t.pageX - touch.pageX;
        _fixEvent.dy = t.pageY - touch.pageY;
        _fixEvent.time = Date.now() - touch.t + 1;
        _fixEvent.xSpeed = _fixEvent.dx / _fixEvent.time;
        _fixEvent.ySpeed = _fixEvent.dy / _fixEvent.time;
        return _fixEvent;
    };
    var isTracking = false;
    var startTrack = function () {
        if (isTracking) {
            return;
        }
        document.body.addEventListener('touchstart', trackHanlder.start, false);
        document.body.addEventListener('touchend', trackHanlder.end, false);
        isTracking = true;
    };
    var stopTrack = function () {
        if (!isTracking) {
            return;
        }
        document.body.removeEventListener('touchstart', trackHanlder.start);
        document.body.removeEventListener('touchend', trackHanlder.end);
        isTracking = false;
    };
    Event.on = function (elem, eventName, handler) {
        if (Event[eventName]) {
            return Event[eventName](elem, handler);
        }
        var listener = function (e) {
            var fixEvent = getFixEvent(e);
            handler.apply(this, [
                e,
                fixEvent
            ]);
        };
        elem.addEventListener(eventName, listener);
        return listener;
    };
    Event.off = function (elem, eventName, handler) {
        elem.removeEventListener(eventName, handler);
    };
    Event.tap = function (elem, handler) {
        elem.addEventListener('click', function (e) {
            handler.apply(this, arguments);
        });
        return;
        startTrack();
        this.on(elem, 'touchend', function (e, fixEvent) {
            if (Math.abs(fixEvent.dx) < 50 && Math.abs(fixEvent.dy) < 50 && fixEvent.time > 30 && fixEvent.time < 150) {
                handler.apply(this, arguments);
            }
            ;
        });
        return dispatcher.on('tap', handler);
    };
    Event.swipe = function (elem, handler) {
        startTrack();
        var isFired = false;
        var swipDir = DIR.NONE;
        dispatcher.on('touchstart', function () {
            isFired = false;
        });
        this.on(elem, 'touchmove', function (e, fixEvent) {
            if (isFired || Math.abs(fixEvent.xSpeed) < 1 && Math.abs(fixEvent.ySpeed) < 1) {
                return;
            }
            fixEvent.direction = getDirectionFromXY(fixEvent.dx, fixEvent.dy);
            handler.apply(this, arguments);
            isFired = true;
        });
    };
    Event.swipeLeft = function (elem, handler) {
        this.swipe(elem, function (e, fixEvent) {
            if (fixEvent.direction === DIR.LEFT) {
                handler.apply(this, arguments);
            }
        });
    };
    Event.swipeRight = function (elem, handler) {
        this.swipe(elem, function (e, fixEvent) {
            if (fixEvent.direction === DIR.RIGHT) {
                handler.apply(this, arguments);
            }
        });
    };
    Event.swipeTop = function (elem, handler) {
        this.swipe(elem, function (e, fixEvent) {
            if (fixEvent.direction === DIR.TOP) {
                handler.apply(this, arguments);
            }
        });
    };
    Event.swipeBottom = function (elem, handler) {
        this.swipe(elem, function (e, fixEvent) {
            if (fixEvent.direction === DIR.BOTTOM) {
                handler.apply(this, arguments);
            }
        });
    };
    return Event;
}());


var _$r15 = (function () {
    var event = _$r14;
    var E = {
            FOCUS: 'focus',
            BLUR: 'blur'
        };
    var EventDelegater = function (container, option) {
        if (!option)
            option = {};
        this._opt = { 'evtAttr': option.evtAttr || 'data-ek' };
        this._container = container;
        this._events = {};
        this._eventsCount = {};
        this._listeners = {};
        var contains = function () {
                return document.body.contains ? function (p, c) {
                    return p.contains(c);
                } : function (p, c) {
                    return !!(p.compareDocumentPosition(c) & 16);
                };
            }();
        this._checkers = {
            'mouseover': function (fromElement, toElement, fireElem) {
                if (!fromElement) {
                    return true;
                }
                return !contains(fireElem, fromElement);
            },
            'mouseout': function (fromElement, toElement, fireElem) {
                if (!toElement) {
                    return true;
                }
                return !contains(fireElem, toElement);
            }
        };
        var c = 0;
        this._getRnd = function () {
            return 'eID' + c++;
        };
    };
    EventDelegater.prototype = {
        _bind: function () {
            return event.on;
        }(),
        _unbind: function () {
            var e = document.createElement('div');
            if (e.removeEventListener) {
                return function (elem, eventType, eventHandler) {
                    var cap = eventType == E.FOCUS || eventType == E.BLUR ? true : false;
                    elem.removeEventListener(eventType, eventHandler, cap);
                };
            } else if (e.detachEvent) {
                return function (elem, eventType, eventHandler) {
                    if (eventType == E.FOCUS) {
                        eventType = 'focusin';
                    }
                    if (eventType == E.BLUR) {
                        eventType = 'focusout';
                    }
                    elem.detachEvent('on' + eventType, eventHandler);
                };
            }
        }(),
        _fire: function (target, evtType, evt, deepness, stopSign) {
            var elem = target;
            var isStop = false;
            var attr = this._opt.evtAttr;
            var eventsByType = this._events[evtType];
            if (!eventsByType || !elem) {
                return;
            }
            var returnValue = true;
            var visited = stopSign;
            var ek = elem.getAttribute(attr);
            if (ek) {
                var eventsByKey = eventsByType[ek];
                if (eventsByKey) {
                    for (var i in eventsByKey) {
                        var eItem = eventsByKey[i];
                        if (eItem.self === false || deepness === 0) {
                            if (!this._checkers[evtType] || this._checkers[evtType](evt.fromElement, evt.toElement, elem)) {
                                if (!eItem.specialEvent || eItem.specialEvent == 'submit' && evt.keyCode === 13) {
                                    returnValue = eItem.handler.call(elem, evt);
                                    function find(o, key) {
                                        var attr = o.getAttribute(key);
                                        if (attr == 'pageView') {
                                            return o.getAttribute('controller');
                                        }
                                        return find(o.parentNode, key);
                                    }
                                    var page = find(elem, 'data-role');
                                    if (ek && page && !stopSign) {
                                        visited = true;
                                    }
                                    if (eItem.isStopPropagation === true) {
                                        isStop = true;
                                    }
                                    if (eItem.isPreventDefault === true) {
                                        evt.returnValue = false;
                                        evt.preventDefault && evt.preventDefault();
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (!isStop && elem && elem !== this._container && elem !== document.body) {
                returnValue = this._fire(elem.parentNode, evtType, evt, ++deepness, visited);
            }
            return returnValue;
        },
        on: function (listnerCommand, handler) {
            if (listnerCommand.indexOf(';') > -1) {
                var listeners = [];
                var lists = listnerCommand.split(';');
                for (var i = 0, n = lists.length; i < n; i++) {
                    listeners.push(this.on(lists[i], handler));
                }
                return listeners;
            }
            var command = listnerCommand.match(/([^:]*):([\w]*)\/?(.*)/);
            if (command.length == 0) {
                throw new Error('wrong command format, must be evtKey:evtType/config1/config2....');
            }
            var evtKey = command[1];
            var evtType = command[2];
            var config = command[3];
            var specialEvent = null;
            if (evtType == 'submit') {
                evtType = 'keypress';
                specialEvent = 'submit';
            }
            var events = this._events;
            if (!events[evtType]) {
                events[evtType] = {};
                this._eventsCount[evtType] = 0;
                var self = this;
                this._listeners[evtType] = this._bind(this._container, evtType, function (evt) {
                    var t = self._fire(evt.target, evtType, evt, 0);
                    return t;
                });
            }
            if (!events[evtType][evtKey]) {
                events[evtType][evtKey] = [];
            }
            var eID = this._getRnd();
            events[evtType][evtKey][eID] = {
                'specialEvent': specialEvent,
                'self': config.indexOf('self') > -1,
                'isStopPropagation': config.indexOf('stopPropagation') > -1,
                'isPreventDefault': config.indexOf('preventDefault') > -1,
                'handler': handler
            };
            this._eventsCount[evtType]++;
            return evtKey + ':' + evtType + '/' + eID;
        },
        off: function (listnerCommand) {
            var command = listnerCommand.match(/([^:]*):([\w|*]*)\/?(.*)/);
            var evtKey = command[1];
            var evtType = command[2];
            var eID = command[3];
            if (eID && this._events[evtType] && this._events[evtType][evtKey] && this._events[evtType][evtKey][eID]) {
                delete this._events[evtType][evtKey][eID];
                this._eventsCount[evtType]--;
            } else if (evtType === '*') {
                for (var _evtType in this._events) {
                    if (this._events[_evtType].hasOwnProperty(evtKey)) {
                        delete this._events[_evtType][evtKey];
                        this._eventsCount[_evtType]--;
                    }
                }
            } else {
                var eventsByType = this._events[evtType];
                if (eventsByType[evtKey]) {
                    delete eventsByType[evtKey];
                    this._eventsCount[evtType]--;
                }
            }
            for (var k in this._eventsCount) {
                if (this._eventsCount[k] <= 0) {
                    this._unbind(this._container, k, this._listeners[k]);
                    delete this._events[k];
                    delete this._eventsCount[evtType];
                }
            }
        },
        trigger: function (evtKey, evtType, args) {
            var eventsByType = this._events[evtType] || {};
            var eventsByKey = eventsByType[evtKey];
            if (!eventsByKey) {
                return;
            }
            var returnValue = true;
            args = args || [];
            args.unshift(null);
            for (var i in eventsByKey) {
                returnValue = eventsByKey[i].handler.apply(null, args);
            }
            return returnValue;
        },
        clear: function () {
            for (var evtType in this._listeners) {
                this._unbind(this._container, evtType, this._listeners[evtType]);
                delete this._events[evtType];
                delete this._listeners[evtType];
                delete this._eventsCount[evtType];
            }
        }
    };
    return EventDelegater;
}());


var _$r16 = (function () {
    var config = _$r12;
    var Loader = _$r7;
    var modules = {};
    var Controller = {};
    var loadStack = [];
    Controller.create = function (factory) {
        loadStack.push(factory);
    };
    Controller.use = function (moduleName, callback) {
        var m = modules[moduleName];
        if (m) {
            setTimeout(function () {
                callback(m);
            }, 16);
            return;
        }
        var src = config('controllerPath').replace('{%id%}', moduleName) + '.js';
        Loader.script(src).ok(function () {
            var exports = loadStack.pop()();
            modules[moduleName] = exports;
            callback && callback(exports);
        });
    };
    return Controller;
}());


var _$r17 = (function () {
    var dom = {
            $: function (id) {
                return document.getElementById(id);
            },
            setStyles: function (elem, styles) {
                for (var k in styles) {
                    elem.style[k] = styles[k];
                }
                return elem;
            },
            clearNode: function (node) {
                node.textContent = '';
                while (node.lastChild) {
                    node.removeChild(node.lastChild);
                }
                return node;
            },
            getScreenSize: function () {
                return {
                    width: document.body.clientWidth,
                    height: document.body.clientHeight
                };
            },
            createNode: function (tag, cssObject) {
                var elem = document.createElement(tag);
                var a = [];
                if (cssObject) {
                    for (var k in cssObject) {
                        a.push(k + ':' + cssObject[k]);
                    }
                    elem.style.cssText = a.join(';');
                }
                return elem;
            },
            isContains: function (root, el) {
                if (root.compareDocumentPosition)
                    return root === el || !!(root.compareDocumentPosition(el) & 16);
                if (root.contains && el.nodeType === 1) {
                    return root.contains(el) && root !== el;
                }
                while (el = el.parentNode)
                    if (el === root)
                        return true;
                return false;
            },
            getAttr: function (elem, attr, isProxy, untilElem) {
                if (!isProxy) {
                    return {
                        'value': elem.getAttribute(attr),
                        'elem': elem
                    };
                } else {
                    untilElem = untilElem || document.body;
                    var value = undefined;
                    while (elem && elem !== untilElem) {
                        value = elem.getAttribute(attr);
                        if (value !== null) {
                            return {
                                'value': value,
                                'elem': elem
                            };
                        }
                        elem = elem.parentNode;
                    }
                    return null;
                }
            },
            nth: function (elem, result, dir) {
                result = result || 1;
                var num = 0;
                for (; elem; elem = elem[dir]) {
                    if (elem.nodeType === 1 && ++num === result) {
                        break;
                    }
                }
                return elem;
            },
            nextNode: function (elem) {
                return this.$nth(elem, 2, 'nextSibling');
            },
            prevNode: function (elem) {
                return this.$nth(elem, 2, 'previousSibling');
            },
            getPosition: function (elem) {
                var pos = {
                        'top': 0,
                        'left': 0
                    };
                if (elem.offsetParent) {
                    while (elem.offsetParent) {
                        pos.top += elem.offsetTop;
                        pos.left += elem.offsetLeft;
                        elem = elem.offsetParent;
                    }
                } else if (elem.x) {
                    pos.left += elem.x;
                } else if (elem.x) {
                    pos.top += elem.y;
                }
                return pos;
            }
        };
    return dom;
}());


var _$r18 = (function () {
    var XObject = _$r1;
    var dom = _$r17;
    var util = _$r3;
    var NAV_HEIGHT = 50;
    var NavigationView = XObject.inherit(function (pageView) {
            var pageContainer = pageView.getContainer();
            this.container = dom.createNode('div', {
                'z-index': '100',
                'width': '100%',
                'position': 'absolute',
                'height': NAV_HEIGHT + 'px',
                'background-color': '#F3F3F3'
            });
            this.titleText = dom.createNode('div', {
                'line-height': NAV_HEIGHT + 'px',
                'color': '#333',
                'text-align': 'center',
                'font-weight': 'bold',
                'font-size': '18px'
            });
            this.container.appendChild(this.titleText);
            if (pageContainer.firstChild) {
                pageContainer.insertBefore(this.container, pageContainer.firstChild);
            } else {
                pageContainer.appendChild(this.container);
            }
            var b = pageView.$('body');
            dom.setStyles(b, {
                'top': NAV_HEIGHT + 'px',
                'height': dom.getScreenSize().height - NAV_HEIGHT + 'px'
            });
            var shadowDom = dom.createNode('div', {
                    'width': '100%',
                    'height': '5px',
                    'background-image': '-webkit-gradient(linear, left top, left bottom, from(rgba(200, 200, 200, 0.7)), to(rgba(200, 200, 200, 0)))'
                });
            this.container.appendChild(shadowDom);
        });
    NavigationView.extend({
        setTitle: function (text, position) {
            this.titleText.innerHTML = text;
        },
        addBackButtonWithClassName: function (className, pageInstance) {
            if (this.backButton) {
                return;
            }
            var btn = this.backButton = dom.createNode('div', {
                    'position': 'absolute',
                    'left': '0',
                    'top': '0',
                    'height': NAV_HEIGHT + 'px',
                    'width': NAV_HEIGHT + 'px',
                    'line-height': NAV_HEIGHT + 'px',
                    'text-align': 'center',
                    'font-size': '20px',
                    'color': 'rgb(90,90,90)'
                });
            btn.className = className || '';
            this.container.appendChild(btn);
            btn.addEventListener('touchend', function () {
                pageInstance.back();
            });
        }
    });
    return NavigationView;
}());


var _$r19 = (function () {
    var util = _$r3;
    var renders = {};
    var Watcher = function (attr, listener) {
        this.value = undefined;
        this.listener = listener;
        this.attr = attr;
    };
    Watcher.prototype = {
        setValue: function (value) {
            if (value !== this.value) {
                this.listener(value);
                this.value = value;
            }
        }
    };
    var ViewRender = function (watchers) {
        this._renderID = util.getRandomKey();
        var saveWatchers = renders[this._renderID] = {};
        for (var attr in watchers) {
            saveWatchers[attr] = new Watcher(attr, watchers[attr]);
        }
    };
    ViewRender.prototype = {
        redraw: function () {
            var render = renders[this._renderID];
            if (render) {
                for (var attr in render) {
                    if (this.hasOwnProperty(attr)) {
                        render[attr].setValue(this[attr]);
                    }
                }
            }
        }
    };
    ViewRender.prototype.constructor = ViewRender;
    return ViewRender;
}());


var _$r20 = (function () {
    return {
        'UNLOAD': 1,
        'LOADING': 2,
        'WAKEUP': 3,
        'SLEEP': 4
    };
}());


var _$r21 = (function () {
    var NavigationView = _$r18;
    var XObject = _$r1;
    var dom = _$r17;
    var util = _$r3;
    var ViewRender = _$r19;
    var PageStatus = _$r20;
    var storage = _$r9;
    var SysApi = _$r5;
    var Kernel = _$r4;
    var LOCAL_STORAGE_KEY_IS_ANDROID30 = 'lsk-is-android30';
    var getNavigationBar = function (pageInstance) {
        if (!pageInstance.navigationBar) {
            pageInstance.navigationBar = new NavigationView(pageInstance);
        }
        return pageInstance.navigationBar;
    };
    var PageView = XObject.inherit(function (pageContainer) {
            if (util.isString(pageContainer)) {
                pageContainer = dom.$(pageContainer);
            }
            this.templatePath = pageContainer.getAttribute('template');
            this.pageContainer = pageContainer;
            this.pageBody = pageContainer.querySelectorAll('[data-role="pageBody"]')[0];
            this.status = PageStatus.UNLOAD;
            this.scrollTop = 0;
            this.domCache = [];
            this.inited = false;
            var size = dom.getScreenSize();
            dom.setStyles(pageContainer, {
                'position': 'absolute',
                'left': '0',
                'top': '0',
                'width': size.width + 'px'
            });
            dom.setStyles(this.pageBody, {
                'position': 'absolute',
                'left': '0',
                'top': '0',
                'width': size.width + 'px',
                'overflow': 'auto'
            });
            this.view = new ViewRender({
                'border': function (value) {
                    pageContainer.style.border = value;
                },
                'backgroundColor': function (value) {
                    pageContainer.style.backgroundColor = value;
                }
            });
        });
    PageView.extend({
        $: function (query) {
            if (query === 'body') {
                return this.pageBody;
            }
            return this.pageBody.querySelectorAll(query);
        },
        bind: function (controller, templateAndMore) {
            var args = [].slice.call(arguments, 0);
            var controller = args[0];
            args[0] = this;
            controller.initWithPage.apply(controller, args);
            this.inited = true;
            return this;
        },
        show: function () {
            var self = this, body = document.body, html = document.documentElement;
            var height = Math.max(window.innerHeight, body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
            this.pageContainer.style.display = 'block';
            var resize = function (width, height) {
                self.pageContainer.style.width = self.pageBody.style.width = width + 'px';
                self.pageContainer.style.height = self.pageBody.style.height = height + 'px';
                var isAndroid30 = storage.getLocalStorage(LOCAL_STORAGE_KEY_IS_ANDROID30);
                if (isAndroid30 || document.documentElement.clientHeight === 0) {
                    if (document.documentElement.clientHeight === 0) {
                        storage.setLocalStorage(LOCAL_STORAGE_KEY_IS_ANDROID30, true, 60);
                    }
                    self.pageContainer.style.height = 'auto';
                    self.pageBody.style.height = 'auto';
                }
                if (util.platform.isIPhone()) {
                    self.pageContainer.style.position = 'relative';
                    self.pageBody.style.position = 'relative';
                    self.pageContainer.style.height = self.pageBody.style.height = '';
                }
            };
            window.addEventListener('orientationchange', function (e) {
                SysApi.getRuntimeInfo(SysApi.RUNTIME_INFO_TYPE.VIEWPORT, function (viewport) {
                    resize(viewport.width, viewport.height);
                });
            });
            Kernel.listen('resize', function () {
                SysApi.getRuntimeInfo(SysApi.RUNTIME_INFO_TYPE.VIEWPORT, function (viewport) {
                    resize(viewport.width, viewport.height);
                });
            });
            resize(document.documentElement.clientWidth, height);
            while (this.domCache.length > 0) {
                var child = this.domCache.pop();
                this.pageContainer.appendChild(child);
            }
            return this;
        },
        hide: function () {
            this.pageContainer.style.display = 'none';
            while (this.pageContainer.lastChild) {
                this.domCache.push(this.pageContainer.lastChild);
                this.pageContainer.removeChild(this.pageContainer.lastChild);
            }
            return this;
        },
        destoryDomCache: function () {
            while (this.domCache.length > 0) {
                var child = this.domCache.pop();
                dom.clearNode(child);
            }
            return this;
        },
        getContainer: function () {
            return this.pageContainer;
        },
        getBody: function () {
            return this.pageBody;
        },
        append: function (domOrHtmlString) {
            var domElem = null;
            if (util.isDom(domOrHtmlString)) {
                domElem = domOrHtmlString;
            } else if (util.isString(domOrHtmlString)) {
                domElem = dom.createNode('div');
                domElem.innerHTML = domOrHtmlString;
            }
            this.pageBody.appendChild(domElem);
            return this;
        },
        setNavigationBarTitle: function (text, position) {
            getNavigationBar(this).setTitle(text, position);
            return this;
        },
        addBackButtonWithClassName: function (className) {
            getNavigationBar(this).addBackButtonWithClassName(className || 'nav-bar-back-btn', this);
            return this;
        },
        redraw: function () {
            this.view.redraw();
            return this;
        }
    });
    PageView.setProtocol({
        shouldWaiting: function () {
        },
        back: function () {
        },
        onCreate: function () {
        },
        onDestory: function () {
        },
        onWillEnterForeground: function () {
        },
        onDidEnterForeground: function () {
        },
        onWillEnterBackground: function () {
        },
        onDidEnterBackground: function () {
        }
    });
    return PageView;
}());


var _$r22 = (function () {
    var EventDispatcher = _$r0;
    var dispatcher = new EventDispatcher();
    var ComError = {
            'throw': function (e) {
                dispatcher.fire('error', [e]);
            },
            on: function (listener) {
                dispatcher.on('error', listener);
            }
        };
    ComError.on(function (e) {
        console.error(e.message);
    });
    window.onerror = function (e) {
        BMapCom.Stat.sendOffline('com_jsError', {
            'desc': e.toString(),
            'src_name': BMapCom.config('src_name'),
            'uid': BMapCom.config('uid')
        }, true);
        if (!window.onerror.sign && BMapCom.config('supported')) {
            BMapCom.Stat.sendOffline('com_js_error', {
                'desc': e.toString(),
                'src_name': BMapCom.config('src_name')
            }, true);
            window.onerror.sign = true;
        }
    };
    return ComError;
}());


var _$r23 = (function () {
    var Kernel = _$r4;
    var PageView = _$r21;
    var util = _$r3;
    var ComError = _$r22;
    var PageStatus = _$r20;
    var dom = _$r17;
    var pages = {};
    var TRANSITION = {
            'slideLeftIn': 1,
            'slideRightI': 2,
            'slideLeftOut': 3,
            'slideRightOut': 4,
            'none': 5
        };
    var pageStack = [];
    var TRANSITION_TIMING = 300;
    var pageList = document.querySelectorAll('[data-role="pageView"]');
    [].forEach.call(pageList, function (pageContainer) {
        var pageInstance = new PageView(pageContainer);
        dom.setStyles(pageContainer, {
            'display': 'none',
            'position': 'absolute',
            '-webkit-transition': '-webkit-transform ' + TRANSITION_TIMING + 'ms',
            '-webkit-transform': 'scale(1)'
        });
        pageInstance.delegate({
            back: function () {
                PageController.back();
            }
        });
        pages[pageContainer.id] = pageInstance;
    });
    var createAnimByType = function (showBody, hideBody, transition, endHandler) {
        var play = function () {
        };
        switch (transition) {
        case TRANSITION.none:
            play = function () {
                showBody.style.zIndex = '10';
                hideBody.style.zIndex = '1';
                endHandler && endHandler();
            };
            break;
        case TRANSITION.slideRightOut:
            play = function () {
                var pos = dom.getScreenSize().width;
                showBody.style.zIndex = '1';
                hideBody.style.zIndex = '10';
                util.nextFrame(function () {
                    showBody.style.webkitTransform = 'translateX(0px) scale(1)';
                    hideBody.style.webkitTransform = 'translateX(' + pos + 'px) scale(1)';
                });
                if (endHandler) {
                    var onEnd = function (e) {
                        endHandler();
                        hideBody.removeEventListener('webkitTransitionEnd', onEnd, false);
                    };
                    hideBody.addEventListener('webkitTransitionEnd', onEnd, false);
                }
            };
            break;
        case TRANSITION.slideRightIn:
        default:
            play = function () {
                var pos = dom.getScreenSize().width;
                showBody.style.webkitTransitionDuration = '0ms';
                showBody.style.webkitTransform = 'translateX(' + pos + 'px) scale(1)';
                showBody.style.zIndex = '10';
                hideBody.style.zIndex = '1';
                hideBody.style.webkitTransform = 'scale(0.7)';
                if (endHandler) {
                    var onEnd = function (e) {
                        endHandler();
                        showBody.removeEventListener('webkitTransitionEnd', onEnd, false);
                    };
                    showBody.addEventListener('webkitTransitionEnd', onEnd, false);
                }
                util.nextFrame(function () {
                    showBody.style.webkitTransitionDuration = TRANSITION_TIMING + 'ms';
                    showBody.style.webkitTransform = 'translateX(0px) scale(1)';
                });
            };
            break;
        }
        return { 'play': play };
    };
    var maskElem = null;
    var createMask = function () {
        var me = dom.createNode('div', {
                'position': 'absolute',
                'top': '0px',
                'bottom': '0px',
                'left': '0px',
                'right': '0px',
                'background-color': 'rgba(0,0,0,0.2)',
                'z-index': '999'
            });
        var sh = dom.getScreenSize();
        var loadingTextCssText = [
                'width:50%',
                'padding:0 10px',
                'height:50px',
                'line-height:50px',
                'margin:' + (sh.height - 50) / 2 + 'px auto 0',
                'text-align:center',
                'background-color:rgba(255, 255, 255, 0.9)',
                'box-shadow:0 0 8px rgb(10,10,10)',
                'border-radius:4px'
            ].join(';');
        me.innerHTML = [
            '<div style="' + loadingTextCssText + '">',
            '<span>\u6b63\u5728\u641c\u7d22....</span>',
            '</div>'
        ].join('');
        document.body.appendChild(me);
        return me;
    };
    var currentPageID = null;
    var PageController = {
            getPage: function (pageID) {
                return pages[pageID];
            },
            showLoading: function () {
                if (!maskElem) {
                    maskElem = createMask();
                }
                maskElem.style.display = 'block';
            },
            hideLoading: function () {
                if (maskElem) {
                    maskElem.style.display = 'none';
                }
            },
            transitionTo: function (pageID, args, options) {
                options = options || {};
                var isBack = options.isBack;
                var toPage = pages[pageID];
                var currentPage = pages[currentPageID];
                if (!toPage) {
                    throw new Error(pageID + ' not exist');
                }
                if (!currentPageID) {
                    currentPageID = pageID;
                    toPage.onCreate(args, function () {
                    });
                    toPage.onWillEnterForeground(args);
                    toPage.show();
                    toPage.onDidEnterForeground(args);
                    return;
                } else if (currentPageID === pageID) {
                    return;
                }
                var slideAnim = createAnimByType(toPage.getContainer(), currentPage.getContainer(), options.transition, function () {
                        currentPage.hide();
                        if (options.isBack) {
                            currentPage.onDestory();
                            currentPage.status = PageStatus.UNLOAD;
                        } else {
                            pageStack.push(currentPageID);
                            currentPage.status = PageStatus.SLEEP;
                        }
                        toPage.status = PageStatus.WAKEUP;
                        currentPageID = pageID;
                        currentPage.onDidEnterBackground(args);
                        toPage.onDidEnterForeground(args);
                    });
                var self = this;
                var isWaiting = isBack == true ? false : toPage.shouldWaiting();
                var doTransition = isWaiting ? function () {
                        self.hideLoading();
                        toPage.show();
                        toPage.onWillEnterForeground(args);
                        slideAnim.play();
                    } : function () {
                    };
                if (isBack) {
                    toPage.onWillEnterForeground(args, doTransition);
                } else {
                    toPage.onCreate(args, doTransition);
                    currentPage.onWillEnterBackground(args);
                }
                toPage.status = PageStatus.LOADING;
                if (isWaiting) {
                    this.showLoading();
                } else {
                    toPage.show();
                    toPage.onWillEnterForeground(args);
                    slideAnim.play();
                }
            },
            back: function () {
                if (pageStack.length == 0) {
                    Kernel.notify('finishPage');
                    return;
                }
                this.transitionTo(pageStack.pop(), {}, {
                    'transition': TRANSITION.slideRightOut,
                    'isBack': true
                });
            }
        };
    return PageController;
}());


var _$r24 = (function () {
    var EventDispatcher = _$r0;
    var Kernel = _$r4;
    var PageController = _$r23;
    var Controller = _$r16;
    var Template = _$r13;
    var util = _$r3;
    var Promise = _$r6;
    var dispatcher = new EventDispatcher();
    var isReady = false;
    var entityParamter = {};
    var AppCore = {
            notify: function (eventName, param) {
                dispatcher.fire(eventName, param);
            },
            listen: function (eventName, callback) {
                return dispatcher.on(eventName, callback);
            },
            removeListener: function (eventName, listener) {
                return dispatcher.off(listener);
            },
            ready: function (handler) {
                if (isReady) {
                    handler(entityParamter);
                } else {
                    Kernel.listen('entranceParam', function (ep) {
                        isReady = true;
                        entityParamter = ep;
                        handler && handler(entityParamter);
                    });
                }
            },
            changePage: function (pageID, args, options) {
                var toPage = this.getPage(pageID);
                if (toPage && !toPage.inited) {
                    var ps = [];
                    var p1 = new Promise(function (resolve) {
                            Controller.use(pageID, function (pageModule) {
                                resolve(pageModule);
                            });
                        });
                    ps.push(p1);
                    if (toPage.templatePath) {
                        var templateIDs = toPage.templatePath.split(' ');
                        templateIDs.forEach(function (templateID) {
                            var tp = new Promise(function (resolve) {
                                    Template.load(templateID, function (template) {
                                        resolve(template);
                                    });
                                });
                            ps.push(tp);
                        });
                    }
                    Promise.all(ps).then(function (results) {
                        toPage.bind.apply(toPage, results);
                        PageController.transitionTo(pageID, args, options);
                    });
                } else {
                    PageController.transitionTo(pageID, args, options);
                }
            },
            backPage: function () {
                PageController.back();
            },
            getComStatus: function (comIDList, callback) {
            },
            queryComsCloudSwitch: function (categoryList, callback) {
                Kernel.notify('queryComsCloudSwitch', categoryList, callback);
                return this;
            },
            getPage: function (pageID) {
                return PageController.getPage(pageID);
            },
            finish: function () {
                Kernel.notify('finishPage');
            }
        };
    return AppCore;
}());


var _$r25 = (function () {
    var Promise = _$r6;
    var config = _$r12;
    var Loader = _$r7;
    var XObject = _$r1;
    var Template = _$r13;
    var EventDispatcher = _$r0;
    var BasePlugin = XObject.inherit(function (config) {
            this.hasTemplate = config.hasTemplate;
            this.hasCSS = config.hasCSS;
        });
    BasePlugin.setProtocol({
        onInstantiate: function () {
            return true;
        }
    });
    BasePlugin.extend({
        instantiate: function () {
            var r = this.onInstantiate.apply(this, arguments);
            return r !== undefined && r !== null ? r : this;
        }
    });
    var PluginBuilder = {
            create: function (config) {
                return new BasePlugin(config);
            }
        };
    var installedPlugins = {};
    var loadedPluginFactory = null;
    var pluginInterface = {
            define: function (factory) {
                loadedPluginFactory = factory;
            },
            preLoadCurrentPlugin: function (pluginID, cssPath) {
                var plg = loadedPluginFactory(PluginBuilder);
                if (cssPath) {
                    Loader.css(cssPath);
                }
                var tpls = Template.getLoadedTemplate();
                plg['template'] = tpls[pluginID + 'Tpl'];
                installedPlugins[pluginID] = plg;
            },
            use: function (pluginID) {
                return new Promise(function (resolve, reject) {
                    var isCustomPath = false;
                    if (pluginID.substr(0, 1) === '!') {
                        pluginID = pluginID.substr(1);
                        isCustomPath = true;
                    }
                    if (installedPlugins[pluginID]) {
                        resolve(installedPlugins[pluginID]);
                        return;
                    }
                    var path = isCustomPath ? pluginID : config('webSDKPath') + 'plugin/' + pluginID + '/' + pluginID;
                    Loader.script(path + '.js').ok(function () {
                        if (!loadedPluginFactory) {
                            reject({ message: 'no plugin named ' + pluginID });
                            return;
                        }
                        var temp_plg = loadedPluginFactory(PluginBuilder);
                        var fireHandler = function (plg) {
                            plg._ID = pluginID;
                            if (plg.hasCSS) {
                                Loader.css(path + '.css');
                            }
                            if (plg.hasTemplate) {
                                if (config('templateHtmlMode')) {
                                    Template.load(path + '.html', function (template) {
                                        plg['template'] = template;
                                        installedPlugins[pluginID] = plg;
                                        resolve(plg);
                                    });
                                } else {
                                    var tpls = Template.getLoadedTemplate();
                                    plg['template'] = tpls[pluginID + 'Tpl'];
                                    installedPlugins[pluginID] = plg;
                                    resolve(plg);
                                }
                            }
                        };
                        if (temp_plg && typeof temp_plg.then == 'function') {
                            temp_plg.then(fireHandler);
                        } else {
                            fireHandler(temp_plg);
                        }
                    }).error(function () {
                        reject({ message: 'no plugin in ' + src });
                    });
                });
            }
        };
    return pluginInterface;
}());


var _$r26 = (function () {
    return {
        'QUERY': 'QUERY',
        'DISPATCH': 'DISPATCH',
        'INVOKE': 'INVOKE'
    };
}());


var _$r27 = (function () {
    var getTime = Date.now ? function () {
            return Date.now();
        } : function () {
            return new Date().getTIme();
        };
    var isExpired = function (startTime, exprire) {
        return getTime() - startTime >= exprire;
    };
    var StackCache = function (options) {
        this._maxSize = options.cacheSize || 5;
        this._usedSize = 0;
        this._cacheData = {};
        this._cacheStack = [];
    };
    StackCache.prototype.setter = function (key, value) {
        if (this._usedSize >= this._maxSize) {
            var delKey = this._cacheStack.shift();
            if (delKey in this._cacheData) {
                delete this._cacheData[delKey];
            }
            this._usedSize--;
        }
        this._cacheStack.push(key);
        this._cacheData[key] = { 'value': value };
        this._usedSize++;
    };
    StackCache.prototype.getter = function (key) {
        return this._cacheData[key] && this._cacheData[key].value;
    };
    StackCache.prototype.clear = function (key) {
        this._cacheData = {};
        this._cacheStack = [];
        this._usedSize = 0;
    };
    var DEFAULT_EXPIRE_TIME = 300000;
    var LocalStorageCache = {
            setter: function (key, value, exprire) {
                exprire = exprire !== undefined ? exprire : DEFAULT_EXPIRE_TIME;
                var setOne = {
                        'value': value,
                        'time': getTime(),
                        'exprire': exprire
                    };
                window.localStorage.setItem(key, JSON.stringify(setOne));
            },
            getter: function (key) {
                var getOne = window.localStorage.getItem(key);
                getOne = getOne ? JSON.parse(getOne) : null;
                if (!getOne || isExpired(getOne.time, getOne.exprire)) {
                    return null;
                }
                return getOne.value;
            },
            clear: function () {
                window.localStorage.clear();
            }
        };
    var TYPE = {
            LOCAL_STORAGE: 1,
            STACK: 2
        };
    var DataCache = function (type, options) {
        options = options || {};
        switch (type) {
        case TYPE.LOCAL_STORAGE:
            this._data = LocalStorageCache;
            break;
        case TYPE.STACK:
        default:
            this._data = new StackCache(options);
            break;
        }
    };
    DataCache.TYPE = TYPE;
    DataCache.prototype.set = function () {
        return this._data.setter.apply(this._data, arguments);
    };
    DataCache.prototype.get = function (key) {
        return this._data.getter(key);
    };
    DataCache.prototype.clear = function () {
        return this._data.clear();
    };
    return DataCache;
}());


var _$r28 = (function () {
    var Kernel = _$r4;
    var Loader = _$r7;
    var ComRequestMethod = _$r26;
    var DataCache = _$r27;
    var config = _$r12;
    var POI_SEARCH_DOMAIN = 'http://map.baidu.com/?qt=s';
    var detailCache = new DataCache(DataCache.TYPE.LOCAL_STORAGE, { cacheSize: 10 });
    var getPoiSearchUrl = function (keyword, city, pn) {
        var url = [
                POI_SEARCH_DOMAIN,
                'wd=' + encodeURIComponent(keyword),
                'ie=utf-8',
                'tn=B_NORMAL_MAP',
                'b=(12938640.97,4812019.72;12977680.97,4839795.72)',
                'nn=' + (pn || 0),
                'c=' + city
            ].join('&');
        return url;
    };
    var getDetailSearchUrl = function (uid) {
        var url = [
                config('phpuiDomain') + '?t=' + Date.now(),
                'qt=ninf',
                'from=webview',
                'resid=01',
                'uid=' + uid
            ].join('&');
        return url;
    };
    var poiSearchDelegate = {
            search: function (keyword, city, pn) {
                var self = this;
                var param = {
                        'reqdata': {
                            'searchtype': 1,
                            'ReqUrl': {
                                'wd': keyword,
                                'c': '131'
                            },
                            'ReqParam': { 'rp_format': 'pb' }
                        },
                        'querytype': 1,
                        'datatype': 2
                    };
                var requestParam = {
                        'category': 'searchapi',
                        'method': ComRequestMethod.QUERY,
                        'param': param
                    };
                var url = getPoiSearchUrl(keyword, 131, pn);
                return Loader.jsonp(url).ok(function (result) {
                    self.onSourceLoadFinish(result);
                }).error(function () {
                    self.onSourceLoadFailed();
                });
            },
            detailSearch: function (uid) {
                var self = this;
                var cache = detailCache.get(uid);
                if (cache) {
                    setTimeout(function () {
                        self.onSourceLoadFinish(cache);
                    }, 0);
                    return;
                }
                var url = getDetailSearchUrl(uid);
                return Loader.jsonp(url).ok(function (result) {
                    detailCache.set(uid, result.data);
                    self.onSourceLoadFinish(result.data);
                }).error(function () {
                    self.onSourceLoadFailed();
                });
            }
        };
    return poiSearchDelegate;
}());


var _$r29 = (function () {
    var Kernel = _$r4;
    var Loader = _$r7;
    var config = _$r12;
    var getCommentSearchUrl = function (uid) {
        var url = [
                config('phpuiDomain') + '?t=' + Date.now(),
                'qt=allcom',
                'from=webview',
                'resid=01',
                'uid=' + uid
            ].join('&');
        return url;
    };
    var commentDelegate = {
            search: function (uid) {
                var self = this;
                var url = getCommentSearchUrl(uid);
                return Loader.jsonp(url).ok(function (result) {
                    if (result.data.errorNo === 0) {
                        self.onSourceLoadFinish(result.data.review);
                    } else {
                        self.onSourceLoadFailed();
                    }
                }).error(function () {
                    self.onSourceLoadFailed();
                });
            }
        };
    return commentDelegate;
}());


var _$r30 = (function () {
    var XObject = _$r1;
    var Loader = _$r7;
    var DataSource = XObject.inherit(function (options) {
            options = options || {};
            this._view = [];
        });
    DataSource.setProtocol({
        onSourceLoadFinish: function () {
        },
        onSourceLoadFailed: function () {
        },
        startSourceLoad: function () {
        },
        search: function () {
        },
        detailSearch: function () {
        }
    });
    DataSource.prototype.update = function (args) {
        this.startSourceLoad(args);
    };
    DataSource.prototype.bind = function (view) {
        this._view.push(view);
    };
    DataSource.prototype.updateView = function (result) {
        this._view.forEach(function (view) {
            view.onSouceChanged(result);
        });
    };
    return DataSource;
}());


var _$r31 = (function () {
    var _fun = {
            ios: function () {
                var regular_result = navigator.userAgent.match(/.*OS\s([\d_]+)/), os_boolean = !!regular_result;
                if (!this._version_value && os_boolean) {
                    this._version_value = regular_result[1].replace(/_/g, '.');
                }
                this.ios = function () {
                    return os_boolean;
                };
                return os_boolean;
            },
            version: function () {
                return this._version_value;
            },
            clone: function (object) {
                function f() {
                }
                f.prototype = object;
                return new f();
            }
        };
    var slipjs = {
            _refreshCommon: function (wide_high, parent_wide_high) {
                var that = this;
                that.wide_high = wide_high || that.core[that.offset] - that.up_range;
                that.parent_wide_high = parent_wide_high || that.core.parentNode[that.offset];
                that._getCoreWidthSubtractShellWidth();
            },
            _initCommon: function (core, param) {
                var that = this;
                that.core = core;
                that.startFun = param.startFun;
                that.moveFun = param.moveFun;
                that.touchEndFun = param.touchEndFun;
                that.endFun = param.endFun;
                that.direction = param.direction;
                that.up_range = param.up_range || 0;
                that.down_range = param.down_range || 0;
                if (that.direction == 'x') {
                    that.offset = 'offsetWidth';
                    that._pos = that.__posX;
                } else {
                    that.offset = 'offsetHeight';
                    that._pos = that.__posY;
                }
                that.wide_high = param.wide_high || that.core[that.offset] - that.up_range;
                that.parent_wide_high = param.parent_wide_high || that.core.parentNode[that.offset];
                that._getCoreWidthSubtractShellWidth();
                that._bind('touchstart');
                that._bind('touchmove');
                that._bind('touchend');
                that._bind('webkitTransitionEnd');
                that.xy = 0;
                that.y = 0;
                that._pos(-that.up_range);
            },
            _getCoreWidthSubtractShellWidth: function () {
                var that = this;
                that.width_cut_coreWidth = that.parent_wide_high - that.wide_high;
                that.coreWidth_cut_width = that.wide_high - that.parent_wide_high;
            },
            handleEvent: function (e) {
                switch (e.type) {
                case 'touchstart':
                    this._start(e);
                    break;
                case 'touchmove':
                    this._move(e);
                    break;
                case 'touchend':
                case 'touchcancel':
                    this._end(e);
                    break;
                case 'webkitTransitionEnd':
                    this._transitionEnd(e);
                    break;
                }
            },
            _bind: function (type, boole) {
                this.core.addEventListener(type, this, !!boole);
            },
            _unBind: function (type, boole) {
                this.core.removeEventListener(type, this, !!boole);
            },
            __posX: function (x) {
                this.xy = x;
                this.core.style['webkitTransform'] = 'translate3d(' + x + 'px, 0px, 0px)';
            },
            __posY: function (x) {
                this.xy = x;
                this.core.style['webkitTransform'] = 'translate3d(0px, ' + x + 'px, 0px)';
            },
            _posTime: function (x, time) {
                this.core.style.webkitTransitionDuration = '' + time + 'ms';
                this._pos(x);
            }
        };
    var SlipPage = _fun.clone(slipjs);
    SlipPage._init = function (core, param) {
        var that = this;
        that._initCommon(core, param);
        that.num = param.num;
        that.page = 0;
        that.change_time = param.change_time;
        that.lastPageFun = param.lastPageFun;
        that.firstPageFun = param.firstPageFun;
        param.change_time && that._autoChange();
        param.no_follow ? (that._move = that._moveNoMove, that.next_time = 500) : that.next_time = 300;
    };
    SlipPage._start = function (e) {
        var that = this, e = e.touches[0];
        that._abrupt_x = 0;
        that._abrupt_x_abs = 0;
        that._start_x = that._start_x_clone = e.pageX;
        that._start_y = e.pageY;
        that._movestart = undefined;
        that.change_time && that._stop();
        that.startFun && that.startFun(e);
    };
    SlipPage._move = function (evt) {
        var that = this;
        that._moveShare(evt);
        if (!that._movestart) {
            var e = evt.touches[0];
            evt.preventDefault();
            that.offset_x = that.xy > 0 || that.xy < that.width_cut_coreWidth ? that._dis_x / 2 + that.xy : that._dis_x + that.xy;
            that._start_x = e.pageX;
            if (that._abrupt_x_abs < 6) {
                that._abrupt_x += that._dis_x;
                that._abrupt_x_abs = Math.abs(that._abrupt_x);
                return;
            }
            that._pos(that.offset_x);
            that.moveFun && that.moveFun(e);
        }
    };
    SlipPage._moveNoMove = function (evt) {
        var that = this;
        that._moveShare(evt);
        if (!that._movestart) {
            evt.preventDefault();
            that.moveFun && that.moveFun(e);
        }
    };
    SlipPage._moveShare = function (evt) {
        var that = this, e = evt.touches[0];
        that._dis_x = e.pageX - that._start_x;
        that._dis_y = e.pageY - that._start_y;
        typeof that._movestart == 'undefined' && (that._movestart = !!(that._movestart || Math.abs(that._dis_x) < Math.abs(that._dis_y)));
    };
    SlipPage._end = function (e) {
        if (!this._movestart) {
            var that = this;
            that._end_x = e.changedTouches[0].pageX;
            that._range = that._end_x - that._start_x_clone;
            if (that._range > 35) {
                that.page != 0 ? that.page -= 1 : that.firstPageFun && that.firstPageFun(e);
            } else if (Math.abs(that._range) > 35) {
                that.page != that.num - 1 ? that.page += 1 : that.lastPageFun && that.lastPageFun(e);
            }
            that.toPage(that.page, that.next_time);
            that.touchEndFun && that.touchEndFun(e);
        }
    };
    SlipPage._transitionEnd = function (e) {
        var that = this;
        e.stopPropagation();
        that.core.style.webkitTransitionDuration = '0';
        that._stop_ing && that._autoChange(), that._stop_ing = false;
        that.endFun && that.endFun();
    };
    SlipPage.toPage = function (num, time) {
        this._posTime(-this.parent_wide_high * num, time || 0);
        this.page = num;
    };
    SlipPage._stop = function () {
        clearInterval(this._autoChangeSet);
        this._stop_ing = true;
    };
    SlipPage._autoChange = function () {
        var that = this;
        that._autoChangeSet = setInterval(function () {
            that.page != that.num - 1 ? that.page += 1 : that.page = 0;
            that.toPage(that.page, that.next_time);
        }, that.change_time);
    };
    SlipPage.refresh = function (wide_high, parent_wide_high) {
        this._refreshCommon(wide_high, parent_wide_high);
    };
    var SlipPx = _fun.clone(slipjs);
    SlipPx._init = function (core, param) {
        var that = this;
        that._initCommon(core, param);
        that.perfect = param.perfect;
        that.bar_no_hide = param.bar_no_hide;
        if (that.direction == 'x') {
            that.page_x = 'pageX';
            that.page_y = 'pageY';
            that.width_or_height = 'width';
            that._real = that._realX;
            that._posBar = that.__posBarX;
        } else {
            that.page_x = 'pageY';
            that.page_y = 'pageX';
            that.width_or_height = 'height';
            that._real = that._realY;
            that._posBar = that.__posBarY;
        }
        if (that.perfect) {
            that._transitionEnd = function () {
            };
            that._stop = that._stopPerfect;
            that._slipBar = that._slipBarPerfect;
            that._posTime = that._posTimePerfect;
            that._bar_upRange = that.up_range;
            that.no_bar = false;
            that._slipBarTime = function () {
            };
        } else {
            that.no_bar = param.no_bar;
            that.core.style.webkitTransitionTimingFunction = 'cubic-bezier(0.33, 0.66, 0.66, 1)';
        }
        if (that.bar_no_hide) {
            that._hideBar = function () {
            };
            that._showBar = function () {
            };
        }
        if (_fun.ios()) {
            that.radius = 11;
        } else {
            that.radius = 0;
        }
        if (!that.no_bar) {
            that._insertSlipBar(param);
            if (that.coreWidth_cut_width <= 0) {
                that._bar_shell_opacity = 0;
                that._showBarStorage = that._showBar;
                that._showBar = function () {
                };
            }
        } else {
            that._hideBar = function () {
            };
            that._showBar = function () {
            };
        }
    };
    SlipPx._start = function (e) {
        var that = this, e = e.touches[0];
        that._animating = false;
        that._steps = [];
        that._abrupt_x = 0;
        that._abrupt_x_abs = 0;
        that._start_x = that._start_x_clone = e[that.page_x];
        that._start_y = e[that.page_y];
        that._start_time = e.timeStamp || Date.now();
        that._movestart = undefined;
        !that.perfect && that._need_stop && that._stop();
        that.core.style.webkitTransitionDuration = '0';
        that.startFun && that.startFun(e);
    };
    SlipPx._move = function (evt) {
        var that = this, e = evt.touches[0], _e_page = e[that.page_x], _e_page_other = e[that.page_y], that_x = that.xy;
        that._dis_x = _e_page - that._start_x;
        that._dis_y = _e_page_other - that._start_y;
        that.direction == 'x' && typeof that._movestart == 'undefined' && (that._movestart = !!(that._movestart || Math.abs(that._dis_x) < Math.abs(that._dis_y)));
        if (!that._movestart) {
            evt.preventDefault();
            that._move_time = e.timeStamp || Date.now();
            that.offset_x = that_x > 0 || that_x < that.width_cut_coreWidth - that.up_range ? that._dis_x / 2 + that_x : that._dis_x + that_x;
            that._start_x = _e_page;
            that._start_y = _e_page_other;
            that._showBar();
            if (that._abrupt_x_abs < 6) {
                that._abrupt_x += that._dis_x;
                that._abrupt_x_abs = Math.abs(that._abrupt_x);
                return;
            }
            that._pos(that.offset_x);
            that.no_bar || that._slipBar();
            if (that._move_time - that._start_time > 300) {
                that._start_time = that._move_time;
                that._start_x_clone = _e_page;
            }
            that.moveFun && that.moveFun(e);
        }
    };
    SlipPx._end = function (e) {
        if (!this._movestart) {
            var that = this, e = e.changedTouches[0], duration = (e.timeStamp || Date.now()) - that._start_time, fast_dist_x = e[that.page_x] - that._start_x_clone;
            that._need_stop = true;
            if (duration < 300 && Math.abs(fast_dist_x) > 10) {
                if (that.xy > -that.up_range || that.xy < that.width_cut_coreWidth) {
                    that._rebound();
                } else {
                    var _momentum = that._momentum(fast_dist_x, duration, -that.xy - that.up_range, that.coreWidth_cut_width + that.xy, that.parent_wide_high);
                    that._posTime(that.xy + _momentum.dist, _momentum.time);
                    that.no_bar || that._slipBarTime(_momentum.time);
                }
            } else {
                that._rebound();
            }
            that.touchEndFun && that.touchEndFun(e);
        }
    };
    SlipPx._transitionEnd = function (e) {
        var that = this;
        if (e.target != that.core)
            return;
        that._rebound();
        that._need_stop = false;
    };
    SlipPx._rebound = function (time) {
        var that = this, _reset = that.coreWidth_cut_width <= 0 ? 0 : that.xy >= -that.up_range ? -that.up_range : that.xy <= that.width_cut_coreWidth - that.up_range ? that.width_cut_coreWidth - that.up_range : that.xy;
        if (_reset == that.xy) {
            that.endFun && that.endFun();
            that._hideBar();
            return;
        }
        that._posTime(_reset, time || 400);
        that.no_bar || that._slipBarTime(time);
    };
    SlipPx._insertSlipBar = function (param) {
        var that = this;
        that._bar = document.createElement('div');
        that._bar_shell = document.createElement('div');
        if (that.direction == 'x') {
            var _bar_css = 'height: 5px; position: absolute;z-index: 10; pointer-events: none;';
            var _bar_shell_css = 'opacity: ' + that._bar_shell_opacity + '; left:2px; bottom: 2px; right: 2px; height: 5px; position: absolute; z-index: 10; pointer-events: none;';
        } else {
            var _bar_css = 'width: 5px; position: absolute;z-index: 10; pointer-events: none;';
            var _bar_shell_css = 'opacity: ' + that._bar_shell_opacity + '; top:2px; bottom: 2px; right: 2px; width: 5px; position: absolute; z-index: 10; pointer-events: none; ';
        }
        var _default_bar_css = ' background-color: rgba(0, 0, 0, 0.5); border-radius: ' + that.radius + 'px; -webkit-transition: cubic-bezier(0.33, 0.66, 0.66, 1);';
        var _bar_css = _bar_css + _default_bar_css + param.bar_css;
        that._bar.style.cssText = _bar_css;
        that._bar_shell.style.cssText = _bar_shell_css;
        that._countAboutBar();
        that._countBarSize();
        that._setBarSize();
        that._countWidthCutBarSize();
        that._bar_shell.appendChild(that._bar);
        that.core.parentNode.appendChild(that._bar_shell);
        setTimeout(function () {
            that._hideBar();
        }, 500);
    };
    SlipPx._posBar = function (pos) {
    };
    SlipPx.__posBarX = function (pos) {
        var that = this;
        that._bar.style['webkitTransform'] = 'translate3d(' + pos + 'px, 0px, 0px)';
    };
    SlipPx.__posBarY = function (pos) {
        var that = this;
        that._bar.style['webkitTransform'] = 'translate3d(0px, ' + pos + 'px, 0px)';
    };
    SlipPx._slipBar = function () {
        var that = this;
        var pos = that._about_bar * (that.xy + that.up_range);
        if (pos <= 0) {
            pos = 0;
        } else if (pos >= that._width_cut_barSize) {
            pos = Math.round(that._width_cut_barSize);
        }
        that._posBar(pos);
        that._showBar();
    };
    SlipPx._slipBarPerfect = function () {
        var that = this;
        var pos = that._about_bar * (that.xy + that._bar_upRange);
        that._bar.style[that.width_or_height] = that._bar_size + 'px';
        if (pos < 0) {
            var size = that._bar_size + pos * 3;
            that._bar.style[that.width_or_height] = Math.round(Math.max(size, 5)) + 'px';
            pos = 0;
        } else if (pos >= that._width_cut_barSize) {
            var size = that._bar_size - (pos - that._width_cut_barSize) * 3;
            if (size < 5) {
                size = 5;
            }
            that._bar.style[that.width_or_height] = Math.round(size) + 'px';
            pos = Math.round(that._width_cut_barSize + that._bar_size - size);
        }
        that._posBar(pos);
    };
    SlipPx._slipBarTime = function (time) {
        this._bar.style.webkitTransitionDuration = '' + time + 'ms';
        this._slipBar();
    };
    SlipPx._stop = function () {
        var that = this, _real_x = that._real();
        that._pos(_real_x);
        if (!that.no_bar) {
            that._bar.style.webkitTransitionDuration = '0';
            that._posBar(that._about_bar * _real_x);
        }
    };
    SlipPx._stopPerfect = function () {
        clearTimeout(this._aniTime);
        this._animating = false;
    };
    SlipPx._realX = function () {
        var _real_xy = getComputedStyle(this.core, null)['webkitTransform'].replace(/[^0-9-.,]/g, '').split(',');
        return _real_xy[4] * 1;
    };
    SlipPx._realY = function () {
        var _real_xy = getComputedStyle(this.core, null)['webkitTransform'].replace(/[^0-9-.,]/g, '').split(',');
        return _real_xy[5] * 1;
    };
    SlipPx._countBarSize = function () {
        this._bar_size = Math.round(Math.max(this.parent_wide_high * this.parent_wide_high / this.wide_high, 5));
    };
    SlipPx._setBarSize = function () {
        this._bar.style[this.width_or_height] = this._bar_size + 'px';
    };
    SlipPx._countAboutBar = function () {
        this._about_bar = (this.parent_wide_high - 4 - (this.parent_wide_high - 4) * this.parent_wide_high / this.wide_high) / this.width_cut_coreWidth;
    };
    SlipPx._countWidthCutBarSize = function () {
        this._width_cut_barSize = this.parent_wide_high - 4 - this._bar_size;
    };
    SlipPx.refresh = function (wide_high, parent_wide_high) {
        var that = this;
        that._refreshCommon(wide_high, parent_wide_high);
        if (!that.no_bar) {
            if (that.coreWidth_cut_width <= 0) {
                that._bar_shell_opacity = 0;
                that._showBar = function () {
                };
            } else {
                that._showBar = that._showBarStorage || that._showBar;
                that._countAboutBar();
                that._countBarSize();
                that._setBarSize();
                that._countWidthCutBarSize();
            }
        }
        that._rebound(0);
    };
    SlipPx._posTimePerfect = function (x, time) {
        var that = this, step = x, i, l;
        that._steps.push({
            x: x,
            time: time || 0
        });
        that._startAni();
    };
    SlipPx._startAni = function () {
        var that = this, startX = that.xy, startTime = Date.now(), step, easeOut, animate;
        if (that._animating)
            return;
        if (!that._steps.length) {
            that._rebound();
            return;
        }
        step = that._steps.shift();
        if (step.x == startX)
            step.time = 0;
        that._animating = true;
        animate = function () {
            var now = Date.now(), newX;
            if (now >= startTime + step.time) {
                that._pos(step.x);
                that._animating = false;
                that._startAni();
                return;
            }
            now = (now - startTime) / step.time - 1;
            easeOut = Math.sqrt(1 - now * now);
            newX = (step.x - startX) * easeOut + startX;
            that._pos(newX);
            if (that._animating) {
                that._slipBar();
                that._aniTime = setTimeout(animate, 1);
            }
        };
        animate();
    };
    SlipPx._momentum = function (dist, time, maxDistUpper, maxDistLower, size) {
        var deceleration = 0.001, speed = Math.abs(dist) / time, newDist = speed * speed / (2 * deceleration), newTime = 0, outsideDist = 0;
        if (dist > 0 && newDist > maxDistUpper) {
            outsideDist = size / (6 / (newDist / speed * deceleration));
            maxDistUpper = maxDistUpper + outsideDist;
            speed = speed * maxDistUpper / newDist;
            newDist = maxDistUpper;
        } else if (dist < 0 && newDist > maxDistLower) {
            outsideDist = size / (6 / (newDist / speed * deceleration));
            maxDistLower = maxDistLower + outsideDist;
            speed = speed * maxDistLower / newDist;
            newDist = maxDistLower;
        }
        newDist = newDist * (dist < 0 ? -1 : 1);
        newTime = speed / deceleration;
        return {
            dist: newDist,
            time: newTime
        };
    };
    SlipPx._showBar = function () {
        var that = this;
        that._bar_shell.style.webkitTransitionDelay = '0ms';
        that._bar_shell.style.webkitTransitionDuration = '0ms';
        that._bar_shell.style.opacity = '1';
    };
    SlipPx._hideBar = function () {
        var that = this;
        that._bar_shell.style.opacity = '0';
        that._bar_shell.style.webkitTransitionDelay = '300ms';
        that._bar_shell.style.webkitTransitionDuration = '300ms';
    };
    function slip(state, core, param) {
        param || (param = {});
        if (_fun.ios() && (parseInt(_fun.version()) >= 5 && param.direction == 'x') && param.wit) {
            core.parentNode.style.cssText += 'overflow:scroll; -webkit-overflow-scrolling:touch;';
        } else {
            switch (state) {
            case 'page':
                param.direction = 'x';
                if (!this.SlipPage) {
                    this.SlipPage = true;
                    SlipPage._init(core, param);
                    return SlipPage;
                } else {
                    var page = _fun.clone(SlipPage);
                    page._init(core, param);
                    return page;
                }
                break;
            case 'px':
                if (!this.SlipPx) {
                    this.SlipPx = true;
                    SlipPx._init(core, param);
                    return SlipPx;
                } else {
                    var Px = _fun.clone(SlipPx);
                    Px._init(core, param);
                    return Px;
                }
                break;
            default:
                break;
            }
        }
    }
    return slip;
}());


var _$r32 = (function () {
    var XObject = _$r1;
    var dom = _$r17;
    var util = _$r3;
    var Scroll = _$r31;
    var TableView = XObject.inherit(function () {
            this.container = dom.createNode('div');
            this.wapper = dom.createNode('div');
            this.listContainer = dom.createNode('div', {});
            this.titleContainer = dom.createNode('div');
            this.wapper.appendChild(this.listContainer);
            window.xxxx = this.scrollView = Scroll('px', this.listContainer);
            this.container.appendChild(this.titleContainer);
            this.container.appendChild(this.wapper);
        });
    TableView.setProtocol({
        getTitleContent: function (source) {
        },
        getRowNumber: function (source) {
            return true;
        },
        getRowContent: function (index, source) {
        },
        getHeight: function () {
        },
        getWidth: function () {
        },
        getNoResultContent: function () {
        },
        onDidRenderFinish: function () {
        },
        onRowClick: function (index, source) {
        }
    });
    TableView.prototype.reset = function () {
        dom.clearNode(this.titleContainer);
        dom.clearNode(this.listContainer);
    };
    TableView.prototype.onSouceChanged = function (source) {
        var n = this.getRowNumber(source);
        var listContainer = this.listContainer;
        if (n == 0) {
            var noResultContent = this.getNoResultContent();
            if (util.isDom(noResultContent)) {
                listContainer.appendChild(noResultContent);
            } else if (util.isString(noResultContent)) {
                var noNode = dom.createNode('div');
                noNode.innerHTML = noResultContent;
                listContainer.appendChild(noNode);
            }
        } else {
            for (var i = 0; i < n; i++) {
                var item = this.getRowContent(i, source);
                if (util.isDom(item)) {
                    listContainer.appendChild(item);
                } else if (util.isString(item)) {
                    var itemNode = dom.createNode('div');
                    itemNode.innerHTML = item;
                    listContainer.appendChild(itemNode);
                }
            }
        }
        var titleContent = this.getTitleContent(source);
        if (util.isDom(titleContent)) {
            this.titleContainer.appendChild(titleContent);
        } else if (util.isString(titleContent)) {
            var titleNode = dom.createNode('div');
            titleNode.innerHTML = titleContent;
            this.titleContainer.appendChild(titleNode);
        }
        var h = this.getHeight();
        var w = this.getWidth();
        if (util.isString(h)) {
            this.wapper.style.height = h;
        } else if (util.isNumber(h)) {
            this.wapper.style.height = h + 'px';
        }
        if (util.isString(w)) {
            this.wapper.style.width = w;
        } else if (util.isNumber(w)) {
            this.wapper.style.width = w + 'px';
        }
        this.onDidRenderFinish();
    };
    TableView.prototype.refresh = function () {
        this.scrollView.refresh();
    };
    TableView.prototype.appendTo = function (context) {
        context.appendChild(this.container);
    };
    return TableView;
}());


var _$r33 = (function () {
    var util = _$r3;
    var dom = _$r17;
    var EventDispatcher = _$r0;
    var DEFAULT_CONFIG = {
            tabs: [],
            tabClassName: '',
            tabSelectedClassName: '',
            contentClassName: '',
            containerClassName: ''
        };
    var TabsView = util.inherit(EventDispatcher, {
            initialize: function (config) {
                config = util.fill(config, DEFAULT_CONFIG);
                var container = this.container = dom.createNode('div');
                container.className = config.containerClassName;
                this.tabs = [];
                this.container.setAttribute('date-role', 'TabControlView');
                this.tabContainer = dom.createNode('div', {
                    'overflow': 'hidden',
                    'position': 'relative',
                    'height': '44px'
                });
                this.container.appendChild(this.tabContainer);
                this.contentContainer = dom.createNode('div');
                this.container.appendChild(this.contentContainer);
                this.config = config;
                var self = this;
                if (config.tabs) {
                    config.tabs.forEach(function (tabConfig) {
                        self.addTab(tabConfig);
                    });
                }
                setTimeout(function () {
                    if (self.tabs.length === 0) {
                        return;
                    }
                    var containerWidth = self.tabContainer.offsetWidth;
                    var tabsWidth = 0;
                    self.tabs.forEach(function (item) {
                        tabsWidth += item.tab.offsetWidth;
                    });
                    if (containerWidth < tabsWidth) {
                        var lastTabWidth = self.tabs[self.tabs.length - 1].tab.offsetWidth;
                        var lastTab = self.tabs[self.tabs.length - 1].tab;
                        var widthValue = lastTab.style.width;
                        if (widthValue.substr(widthValue.length - 1, 1) === '%') {
                            lastTab.style.width = parseInt(widthValue.substr(0, widthValue.length - 1)) - 1 + '%';
                        } else if (widthValue.substr(widthValue.length - 2, 2) === 'px') {
                            lastTab.style.width = lastTabWidth - (tabsWidth - containerWidth) + 'px';
                        }
                    }
                }, 2000);
            },
            addTab: function (tabConfig) {
                var tabText = tabConfig.text;
                var events = tabConfig.events;
                var tabELem = dom.createNode('div', this.config.tabStyle);
                tabELem.style.width = tabConfig.tabWidth + (typeof tabConfig.tabWidth == 'number' ? 'px' : '');
                tabELem.className = this.config.tabClassName;
                tabELem.innerHTML = tabText;
                this.tabContainer.appendChild(tabELem);
                if (this.tabs.length == 0) {
                    tabELem.style.borderLeft = 'none';
                }
                var self = this;
                var currectIndex = this.tabs.length;
                tabELem.setAttribute('data-ek', 'tabs');
                var tabsEle = new BMapCom.EventDelegater(tabELem);
                tabsEle.on('tabs:tap', function (e) {
                    self.setIndex(currectIndex);
                    self.fire('tab_changed', [currectIndex]);
                });
                var tabContentELem = dom.createNode('div', { 'display': 'none' });
                tabContentELem.className = this.config.contentClassName;
                tabContentELem.innerHTML = tabConfig.content;
                this.contentContainer.appendChild(tabContentELem);
                this.tabs.push({
                    'tab': tabELem,
                    'content': tabContentELem
                });
            },
            setIndex: function (index) {
                if (index === this._showIndex) {
                    return;
                }
                if (this.tabs[this._showIndex]) {
                    var unselected = this.tabs[this._showIndex];
                    unselected.tab.className = this.config.tabClassName;
                    unselected.content.style.display = 'none';
                }
                if (this.tabs[index]) {
                    var selected = this.tabs[index];
                    selected.tab.className = this.config.tabSelectedClassName;
                    selected.content.style.display = '';
                    this._showIndex = index;
                }
            },
            setTabText: function (index, tabText) {
                var tabelems = this.tabContainer.getElementsByTagName('div');
                if (tabelems && tabelems[index]) {
                    tabelems[index].innerHTML = tabText;
                }
            },
            clear: function () {
                this.tabs = [];
                var c = this.contentContainer;
                while (c.lastChild) {
                    c.removeChild(c.lastChild);
                }
                c = this.tabContainer;
                while (c.lastChild) {
                    c.removeChild(c.lastChild);
                }
            },
            appendTo: function (context) {
                context.appendChild(this.container);
            }
        });
    return TabsView;
}());


var _$r34 = (function () {
    var exports = {};
    exports['EventDispatcher'] = _$r0;
    exports['Stat'] = _$r8;
    exports['storage'] = _$r9;
    exports['util'] = _$r10;
    exports['Template'] = _$r13;
    exports['EventDelegater'] = _$r15;
    exports['Controller'] = _$r16;
    exports['Kernel'] = _$r4;
    exports['SysApi'] = _$r5;
    exports['AppCore'] = _$r24;
    exports['Loader'] = _$r7;
    exports['config'] = _$r12;
    exports['event'] = _$r14;
    exports['Plugin'] = _$r25;
    exports['ComError'] = _$r22;
    exports['Promise'] = _$r6;
    exports['ComRequestMethod'] = _$r26;
    exports['poiSearchDelegate'] = _$r28;
    exports['commentSearchDelegate'] = _$r29;
    exports['DataSource'] = _$r30;
    exports['DataCache'] = _$r27;
    exports['Promise'] = _$r6;
    exports['PageStatus'] = _$r20;
    exports['PageView'] = _$r21;
    exports['TableView'] = _$r32;
    exports['TabsView'] = _$r33;
    var globalName = 'BMapCom';
    window[globalName] = exports;
    return exports;
}());

})();