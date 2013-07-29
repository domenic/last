"use strict";

var pending = { then: function () {} };

module.exports = function (operation) {
    var latestPromise = null;

    return function () {
        var promiseForResult = operation.apply(this, arguments);
        latestPromise = promiseForResult;

        return promiseForResult.then(
            function (value) {
                if (latestPromise === promiseForResult) {
                    return value;
                } else {
                    return pending;
                }
            },
            function (reason) {
                if (latestPromise === promiseForResult) {
                    throw reason;
                } else {
                    return pending;
                }
            }
        );
    };
};
