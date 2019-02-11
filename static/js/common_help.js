/**
 * Browser IE확인
 * Return: Boolean
 * */

export const isIE = () => {
    let ua = navigator.userAgent;
    /* MSIE used to detect old browsers and Trident used to newer ones*/
    let is_ie = ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;

    return is_ie;
}

export const isSafari = () => {

    let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    return isSafari
}

export const isSamsung = () => {
    let isSamsung = navigator.userAgent.match(/SAMSUNG|Samsung|SGH-[I|N|T]|GT-[I|N]|SM-[N|P|T|Z]|SHV-E|SCH-[I|J|R|S]|SPH-L/i)

    return isSamsung
}


/**
 * 가장 최신 배당률 Data 추출
 * */
export const getLatestOdd = odds => {
    let latestOdd = {}

    try {
        odds.some(function(odd) {
            if(odd.latest) {
                latestOdd = odd
                return true
            }
        })
    } catch(e) {
        console.log(e)
    }

    return latestOdd
}

/**
 * 프로토 시간 포멧팅
 * Return: formatDate.date-> MM-dd(D)
 *         formatDate.time-> HH:mm
 * */
export const getFormatDate = (startAt) => {

    function checkTime(i) {
        if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
        return i;
    }

    let formatDate = {
        date: "",
        time: ""
    }

    let now = new Date(startAt)

    let d = checkTime(now.getDate())
    let m = checkTime(now.getMonth() + 1)
    // let yy = now.getFullYear()
    // console.log(typeof yy)
    let hh = checkTime(now.getHours()) //24 Hours
    let mm = checkTime(now.getMinutes())

    let dayOfWeek = ["(일)", "(월)", "(화)", "(수)", "(목)", "(금)", "(토)"]

    formatDate.date = m + "." + d + " " + dayOfWeek[now.getDay()]
    formatDate.time = hh + ":" + mm

    return formatDate
}


export const createPolyFill = () => {
    /**
     * Array.prototype.map
     * Polyfill
     * */
    if (!Array.prototype.map) {

        Array.prototype.map = function(callback/*, thisArg*/) {

            var T, A, k;

            if (this == null) {
                throw new TypeError('this is null or not defined');
            }

            var O = Object(this);
            var len = O.length >>> 0;

            if (typeof callback !== 'function') {
                throw new TypeError(callback + ' is not a function');
            }

            if (arguments.length > 1) {
                T = arguments[1];
            }

            A = new Array(len);

            k = 0;

            while (k < len) {

                var kValue, mappedValue;

                if (k in O) {
                    kValue = O[k];
                    mappedValue = callback.call(T, kValue, k, O);
                    A[k] = mappedValue;
                }
                k++;
            }

            return A;
        };
    }

    /**
     * Array.prototype.filter
     * Polyfill
     * */
    if (!Array.prototype.filter){
        Array.prototype.filter = function(func, thisArg) {
            'use strict';
            if ( ! ((typeof func === 'Function' || typeof func === 'function') && this) )
                throw new TypeError();

            var len = this.length >>> 0,
                res = new Array(len), // preallocate array
                t = this, c = 0, i = -1;
            if (thisArg === undefined){
                while (++i !== len){
                    // checks to see if the key was set
                    if (i in this){
                        if (func(t[i], i, t)){
                            res[c++] = t[i];
                        }
                    }
                }
            }
            else{
                while (++i !== len){
                    // checks to see if the key was set
                    if (i in this){
                        if (func.call(thisArg, t[i], i, t)){
                            res[c++] = t[i];
                        }
                    }
                }
            }

            res.length = c; // shrink down array to proper size
            return res;
        };
    }

    /**
     * Array.prototype.includes()
     * Polyfill
     * */
    if (!Array.prototype.includes) {
        Object.defineProperty(Array.prototype, 'includes', {
            value: function(searchElement, fromIndex) {

                if (this == null) {
                    throw new TypeError('"this" is null or not defined');
                }

                // 1. Let O be ? ToObject(this value).
                var o = Object(this);

                // 2. Let len be ? ToLength(? Get(O, "length")).
                var len = o.length >>> 0;

                // 3. If len is 0, return false.
                if (len === 0) {
                    return false;
                }

                // 4. Let n be ? ToInteger(fromIndex).
                //    (If fromIndex is undefined, this step produces the value 0.)
                var n = fromIndex | 0;

                // 5. If n ≥ 0, then
                //  a. Let k be n.
                // 6. Else n < 0,
                //  a. Let k be len + n.
                //  b. If k < 0, let k be 0.
                var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

                function sameValueZero(x, y) {
                    return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
                }

                // 7. Repeat, while k < len
                while (k < len) {
                    // a. Let elementK be the result of ? Get(O, ! ToString(k)).
                    // b. If SameValueZero(searchElement, elementK) is true, return true.
                    if (sameValueZero(o[k], searchElement)) {
                        return true;
                    }
                    // c. Increase k by 1.
                    k++;
                }

                // 8. Return false
                return false;
            }
        });
    }

    /**
     * NodeList.prototype.forEach
     * Polyfill
     * */
    if (window.NodeList && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = function (callback, thisArg) {
            thisArg = thisArg || window;
            for (var i = 0; i < this.length; i++) {
                callback.call(thisArg, this[i], i, this);
            }
        };
    }

    /**
     * Element.closest()
     * Polyfill
     * */
    if (!Element.prototype.matches)
        Element.prototype.matches = Element.prototype.msMatchesSelector ||
            Element.prototype.webkitMatchesSelector;

    if (!Element.prototype.closest)
        Element.prototype.closest = function(s) {
            var el = this;
            if (!document.documentElement.contains(el)) return null;
            do {
                if (el.matches(s)) return el;
                el = el.parentElement || el.parentNode;
            } while (el !== null && el.nodeType === 1);
            return null;
        };

    /**
     * String.prototype.endsWith
     * Polyfill
     * */
    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function(searchString, position) {
            var subjectString = this.toString();
            if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.indexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        };
    }

    /**
     * Array.prototype.some
     * Polyfill
     * */
    if (!Array.prototype.some) {
        Array.prototype.some = function(fun/*, thisArg*/) {
            'use strict';

            if (this == null) {
                throw new TypeError('Array.prototype.some called on null or undefined');
            }

            if (typeof fun !== 'function') {
                throw new TypeError();
            }

            var t = Object(this);
            var len = t.length >>> 0;

            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0; i < len; i++) {
                if (i in t && fun.call(thisArg, t[i], i, t)) {
                    return true;
                }
            }

            return false;
        };
    }


    /**
     * Object.setPrototypeOf
     * Polyfill
     * */
    (function () {
        if (typeof Object.setPrototypeOf === 'undefined' && typeof Object.getOwnPropertyNames === 'function') {
            var _exclude = ['length', 'name', 'arguments', 'caller', 'prototype'];

            function bindFunction(ctx, fn) {
                return function() {
                    return fn.apply(this, arguments);
                }
            }

            function bindProperty(ctx, prop, parentDescriptor) {
                if (!parentDescriptor) {
                    var defaultValue = ctx.__proto__[prop];
                    parentDescriptor = {
                        get: function () {
                            return ctx['__' + prop] || defaultValue
                        },
                        set: function (val) {
                            ctx['__' + prop] = val;
                        }
                    }
                }
                Object.defineProperty(ctx, prop, {
                    get: parentDescriptor.get ? parentDescriptor.get.bind(ctx) : undefined,
                    set: parentDescriptor.set ? parentDescriptor.set.bind(ctx) : undefined,
                    configurable: true
                });

            }

            function iterateProps(subClass, superClass) {
                var props = Object.getOwnPropertyNames(superClass),
                    proto;

                subClass.__proto__ = superClass;
                for (var i = 0, len = props.length; i < len; i++) {
                    var prop = props[i];
                    if (prop === '__proto__') {
                        proto = superClass[prop];
                    } else if (_exclude.indexOf(i) === -1) {
                        var descriptor = Object.getOwnPropertyDescriptor(subClass, prop);
                        if (!descriptor) {
                            var superDescriptor = Object.getOwnPropertyDescriptor(superClass, prop);
                            if (typeof superDescriptor.get !== 'function' && typeof superClass[prop] === 'function') {
                                subClass[prop] = bindFunction(subClass, superClass[prop]);
                            } else if (typeof superDescriptor.get == 'function') {
                                bindProperty(subClass, prop, superDescriptor);
                            } else {
                                bindProperty(subClass, prop);
                            }
                        }
                    }
                }
                if (proto) {
                    iterateProps(subClass, proto);
                }
            }

            Object.setPrototypeOf = iterateProps;
        }
    })();

}

export const getLocalStorage = (roundCode) => {
    let calcLocalStorageData = JSON.parse(localStorage.getItem(roundCode))

    if(calcLocalStorageData == null) {
        calcLocalStorageData = {}
        calcLocalStorageData.currentCalcEventList = []
        calcLocalStorageData.calcSetList = []
        calcLocalStorageData.lastSetNo = 1
        calcLocalStorageData.betAmount = ""
        calcLocalStorageData.estimatePrice = 0
    } else {
        calcLocalStorageData.calcSetList.some(function(calcSet, index) {
            if(calcSet.isActive == "active") {
                calcLocalStorageData.currentCalcEventList = calcSet.calcSetEventList
                calcLocalStorageData.currentBetAmount = calcSet.betAmount
                calcLocalStorageData.currentEstimatePrice = calcSet.estimatePrice
            }
        })
    }

    return calcLocalStorageData
}

export const updateLocalStorage = (roundCode, calcLocalStorageData) => {
    localStorage.setItem(roundCode, JSON.stringify(calcLocalStorageData))
}

export const roundUp = (num, precision) => {
    precision = Math.pow(10, precision)
    return Math.ceil((num * precision).toFixed(2)) / precision
}

export const roundDown = (num, precision) => {
    precision = Math.pow(10, precision)
    return Math.floor((num * precision).toFixed(2)) / precision
}

export const getNumOnly = value => {

    if(value != "") {
        return value.replace(/[^\d]/,'')
    } else {
        return 0
    }
}

export const getAmtLocale = value => {
    if(value === "") {
        return ""
    } else {
        if(value === undefined || isNaN(value)) {
            return ""
        } else {
            let newValue = value.toString().replace(/[^\d]/,'')
            return newValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    }
}