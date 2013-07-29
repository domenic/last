"use strict";

require("mocha-as-promised")();
require("chai").use(require("sinon-chai"));
require("chai").use(require("chai-as-promised"));
require("chai").should();

var sinon = require("sinon");
var Q = require("q");
var last = require("..");

describe("When the operation is only called once and fulfills", function () {
    var wrapped, operation;

    beforeEach(function () {
        operation = sinon.stub().returns(Q("result"));
        wrapped = last(operation);
    });

    it("should fulfill with the same value", function () {
        return wrapped().should.eventually.equal("result");
    });

    it("should call the original function with the same arguments", function () {
        return wrapped(1, 2, 3).then(function () {
            operation.should.have.been.calledWithExactly(1, 2, 3);
        });
    });

    it("should call the original function with the same `this` value", function () {
        var thisValue = { this: "value" };

        return wrapped.call(thisValue).then(function () {
            operation.should.have.been.calledOn(thisValue);
        });
    });
});

describe("When the operation is only called once and rejects", function () {
    var wrapped, operation, error;

    beforeEach(function () {
        error = new Error("reason");
        operation = sinon.stub().returns(Q.reject(error));
        wrapped = last(operation);
    });

    it("should reject with the same reason", function () {
        return wrapped().should.be.rejected.with(error);
    });
});

describe("When the operation is called multiple times", function () {
    function operation(param) {
        if (param === 1) {
            return Q.delay("a", 50);
        }
        if (param === 2) {
            return Q.delay("b", 100);
        }
        if (param === 3) {
            return Q.delay(Q.reject("c"), 100);
        }
    }

    var wrapped = last(operation);

    it("should fulfill the last-created promise, and leave earlier ones pending", function () {
        var try1 = wrapped(1);
        var try2 = wrapped(2);

        return Q.delay(150).then(function () {
            try1.inspect().should.deep.equal({ state: "pending" });
            try2.inspect().should.deep.equal({ state: "fulfilled", value: "b" });
        });
    });

    it("should reject if the last call rejects, even if the first fulfills", function () {
        var try1 = wrapped(1);
        var try2 = wrapped(3);

        return Q.delay(150).then(function () {
            try1.inspect().should.deep.equal({ state: "pending" });
            try2.inspect().should.deep.equal({ state: "rejected", reason: "c" });
        });
    });
});
