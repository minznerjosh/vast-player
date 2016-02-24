'use strict';

function proxy(event, source, target) {
    source.on(event, function emit(/*...args*/) {
        var args = [], length = arguments.length;
        while (length--) { args[length] = arguments[length]; }

        target.emit.apply(target, [event].concat(args));
    });
}

function init(source, target, events) {
    events.forEach(function(event) {
        if (target.listeners(event).length > 0) {
            proxy(event, source, target);
        }
    });

    target.on('newListener', function handleNewListener(type) {
        if (events.indexOf(type) > -1 && target.listeners(type).length < 1) {
            proxy(type, source, target);
        }
    });
}

function EventProxy(events) {
    this.events = events.slice();

    this.__private__ = {
        target: null,
        source: null
    };
}

EventProxy.prototype.from = function from(source) {
    this.__private__.source = source;

    if (this.__private__.target) {
        init(source, this.__private__.target, this.events);
    }

    return this;
};

EventProxy.prototype.to = function to(target) {
    this.__private__.target = target;

    if (this.__private__.source) {
        init(this.__private__.source, target, this.events);
    }

    return this;
};

module.exports = EventProxy;
