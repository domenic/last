"use strict";

var Q = require("q");

module.exports = function (operation) {
    var latestPromise = null;

    return function () {
        var deferred = Q.defer();
        var promiseForResult = operation.apply(this, arguments);
        latestPromise = promiseForResult;

        promiseForResult.then(
            function (value) {
                if (latestPromise === promiseForResult) {
                    deferred.resolve(value);
                }
            },
            function (reason) {
                if (latestPromise === promiseForResult) {
                    deferred.reject(reason);
                }
            }
        );

        return deferred.promise;
    };
};
