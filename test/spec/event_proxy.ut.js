'use strict';

var proxyquire = require('proxyquire');
var EventEmitter = require('events').EventEmitter;

describe('EventProxy(events)', function() {
    var EventProxy;
    var stubs;

    beforeEach(function() {
        stubs = {
            'events': require('events'),

            '@noCallThru': true
        };

        EventProxy = proxyquire('../../lib/EventProxy', stubs);
    });

    it('should exist', function() {
        expect(EventProxy).toEqual(jasmine.any(Function));
        expect(EventProxy.name).toEqual('EventProxy');
    });

    describe('instance:', function() {
        var events;
        var proxy;

        beforeEach(function() {
            events = [
                'event1',
                'event2',
                'event3'
            ];

            proxy = new EventProxy(events);
        });

        it('should exist', function() {
            expect(proxy).toEqual(jasmine.any(Object));
        });

        describe('properties:', function() {
            describe('events', function() {
                it('should be a copy of the events Array', function() {
                    expect(proxy.events).toEqual(events);
                    expect(proxy.events).not.toBe(events);
                });
            });
        });

        describe('proxying', function() {
            var from, to;
            var event1, event2, event3, foo, bar;

            beforeEach(function() {
                from = new EventEmitter();
                to = new EventEmitter();

                event1 = jasmine.createSpy('event1()');
                event2 = jasmine.createSpy('event2()');
                event3 = jasmine.createSpy('event3()');
                foo = jasmine.createSpy('foo()');
                bar = jasmine.createSpy('bar()');

                to.on('event1', event1).on('event2', event2).on('foo', foo);
            });

            describe('with proxy.from(from).to(to);', function() {
                beforeEach(function() {
                    proxy.from(from).to(to);
                });

                describe('when events are emitted on "from"', function() {
                    beforeEach(function() {
                        from.emit('event1', 1, 2);
                        from.emit('event2', 3, 4);
                        from.emit('event1', true, false);
                    });

                    it('should proxy events', function() {
                        expect(event1).toHaveBeenCalledWith(1, 2);
                        expect(event2).toHaveBeenCalledWith(3, 4);
                        expect(event1).toHaveBeenCalledWith(true, false);

                        expect(event1.calls.count()).toBe(2, 'event1 not called twice.');
                        expect(event2.calls.count()).toBe(1, 'event2 not called once.');
                    });
                });

                describe('when untracked events are emitted on "from"', function() {
                    beforeEach(function() {
                        from.emit('foo', 'hey');
                    });

                    it('should not emit the event', function() {
                        expect(foo).not.toHaveBeenCalled();
                    });
                });

                describe('if a tracked handler is added later', function() {
                    beforeEach(function() {
                        to.on('event3', event3);

                        from.emit('event3');
                    });

                    it('should start proxying that event', function() {
                        expect(event3).toHaveBeenCalledWith();
                    });

                    describe('a second time', function() {
                        beforeEach(function() {
                            event3.calls.reset();
                            to.on('event3', function() {});

                            from.emit('event3');
                        });

                        it('should not add a new handler', function() {
                            expect(event3.calls.count()).toBe(1, 'event3 not called once.');
                        });
                    });
                });

                describe('if an untracked hanlder is added later', function() {
                    beforeEach(function() {
                        to.on('bar', bar);

                        from.emit('bar');
                    });

                    it('should not start proxying that event', function() {
                        expect(bar).not.toHaveBeenCalled();
                    });
                });
            });

            describe('with proxy.to(to).from(from);', function() {
                beforeEach(function() {
                    proxy.to(to).from(from);
                });

                describe('when events are emitted on "from"', function() {
                    beforeEach(function() {
                        from.emit('event1', 1, 2);
                        from.emit('event2', 3, 4);
                        from.emit('event1', true, false);
                    });

                    it('should proxy events', function() {
                        expect(event1).toHaveBeenCalledWith(1, 2);
                        expect(event2).toHaveBeenCalledWith(3, 4);
                        expect(event1).toHaveBeenCalledWith(true, false);

                        expect(event1.calls.count()).toBe(2, 'event1 not called twice.');
                        expect(event2.calls.count()).toBe(1, 'event2 not called once.');
                    });
                });

                describe('when untracked events are emitted on "from"', function() {
                    beforeEach(function() {
                        from.emit('foo', 'hey');
                    });

                    it('should not emit the event', function() {
                        expect(foo).not.toHaveBeenCalled();
                    });
                });

                describe('if a tracked handler is added later', function() {
                    beforeEach(function() {
                        to.on('event3', event3);

                        from.emit('event3');
                    });

                    it('should start proxying that event', function() {
                        expect(event3).toHaveBeenCalledWith();
                    });

                    describe('a second time', function() {
                        beforeEach(function() {
                            event3.calls.reset();
                            to.on('event3', function() {});

                            from.emit('event3');
                        });

                        it('should not add a new handler', function() {
                            expect(event3.calls.count()).toBe(1, 'event3 not called once.');
                        });
                    });
                });

                describe('if an untracked hanlder is added later', function() {
                    beforeEach(function() {
                        to.on('bar', bar);

                        from.emit('bar');
                    });

                    it('should not start proxying that event', function() {
                        expect(bar).not.toHaveBeenCalled();
                    });
                });
            });
        });
    });
});
