'use strict';

var Hapi = require('hapi');
var createStore = require('fixtures/createStore');
var clientRoutes = require('fixtures/routes');
var badClientRoutes = require('fixtures/bad-routes');
var redirectClientRoutes = require('fixtures/redirect-routes');
var layout = require('fixtures/layout');
var badLayout = require('fixtures/bad-layout');

var options = {
  routes: clientRoutes,
  layout: layout,
  config: {
    honeybadger: '1234'
  },
  assets: {
    styles: {},
    scripts: {}
  },
  createStore: createStore
};

var HapiReactRedux = require('plugin/index');

describe('hapi react redux plugin', function () {
  it('can be registered', function (done) {
    var server = new Hapi.Server();
    server.connection();
    server.register(HapiReactRedux, function (err) {
      expect(server).toBeTruthy();
      expect(server.hapiReactRedux).toBeTruthy();
      expect(err).toBeUndefined();
      done();
    });
  });

  it('can set options with the hapiReactRedux method', function (done) {
    var server = new Hapi.Server();
    server.connection();
    server.register(HapiReactRedux, function (err) {
      options.layout = layout;
      options.routes = clientRoutes;
      server.hapiReactRedux(options);
      server.route({
        method: 'GET',
        path: '/',
        handler: function handler(request, reply) {
          return reply.hapiReactReduxRender();
        }
      });
      server.inject({
        method: 'GET',
        url: '/?q=test'
      }, function (res) {
        expect(res.result).toContain('home');
        done();
      });
    });
  });

  it('can have a handler call the hapiReactReduxRender method on reply', function (done) {
    var server = new Hapi.Server();
    server.connection();
    server.register(HapiReactRedux, function (err) {
      options.layout = layout;
      options.routes = clientRoutes;
      server.hapiReactRedux(options);
      server.route({
        method: 'GET',
        path: '/',
        handler: function handler(request, reply) {
          return reply.hapiReactReduxRender();
        }
      });
      server.inject({
        method: 'GET',
        url: '/'
      }, function (res) {
        expect(res.result).toContain('home');
        done();
      });
    });
  });

  it('can use the server handler instead of calling the method directly', function (done) {
    var server = new Hapi.Server();
    server.connection();
    server.register(HapiReactRedux, function (err) {
      options.layout = layout;
      options.routes = clientRoutes;
      server.hapiReactRedux(options);
      server.route({
        method: 'GET',
        path: '/',
        handler: { hapiReactReduxHandler: {} }
      });
      server.inject({
        method: 'GET',
        url: '/'
      }, function (res) {
        expect(res.result).toContain('home');
        done();
      });
    });
  });

  it('can collect data from fetch methods on route handlers to have in the rendered output via route-resolver', function (done) {
    var server = new Hapi.Server();
    server.connection();
    server.register(HapiReactRedux, function (err) {
      options.layout = layout;
      options.routes = clientRoutes;
      server.hapiReactRedux(options);
      server.route({
        method: 'GET',
        path: '/',
        handler: { hapiReactReduxHandler: {} }
      });
      server.inject({
        method: 'GET',
        url: '/'
      }, function (res) {
        expect(res.result).toContain('test-todo-redux');
        done();
      });
    });
  });

  it('can use data sent to the hapiReactReduxRender method on reply', function (done) {
    var server = new Hapi.Server();
    server.connection();
    server.register(HapiReactRedux, function (err) {
      options.layout = layout;
      options.routes = clientRoutes;
      server.hapiReactRedux(options);
      server.route({
        method: 'GET',
        path: '/',
        handler: function handler(request, reply) {
          return reply.hapiReactReduxRender({
            test: 'the test'
          });
        }
      });
      server.inject({
        method: 'GET',
        url: '/'
      }, function (res) {
        expect(res.result).toContain('>the test</p>');
        done();
      });
    });
  });

  it('can use data from route prereqs', function (done) {
    var server = new Hapi.Server();
    server.connection();
    server.register(HapiReactRedux, function (err) {
      options.layout = layout;
      options.routes = clientRoutes;
      server.hapiReactRedux(options);
      server.route({
        method: 'GET',
        path: '/',
        config: {
          pre: [{ method: function method(request, reply) {
              return reply('preTest');
            }, assign: 'preTest' }]
        },
        handler: function handler(request, reply) {
          return reply.hapiReactReduxRender();
        }
      });
      server.inject({
        method: 'GET',
        url: '/'
      }, function (res) {
        expect(res.result).toContain('>preTest</p>');
        done();
      });
    });
  });

  it('can use data from config', function (done) {
    var server = new Hapi.Server();
    server.connection();
    server.register(HapiReactRedux, function (err) {
      options.layout = layout;
      options.routes = clientRoutes;
      server.hapiReactRedux(options);
      server.route({
        method: 'GET',
        path: '/',
        handler: function handler(request, reply) {
          return reply.hapiReactReduxRender();
        }
      });
      server.inject({
        method: 'GET',
        url: '/'
      }, function (res) {
        expect(res.result).toContain('>1234</p>');
        done();
      });
    });
  });

  it('will redirect if RR has a redirect route in it', function (done) {
    var server = new Hapi.Server();
    server.connection();
    server.register(HapiReactRedux, function (err) {
      options.layout = layout;
      options.routes = redirectClientRoutes;
      server.hapiReactRedux(options);
      server.route({
        method: 'GET',
        path: '/{path*}',
        handler: function handler(request, reply) {
          return reply.hapiReactReduxRender();
        }
      });
      server.inject({
        method: 'GET',
        url: '/about'
      }, function (res) {
        expect(res.statusCode).toBe(301);
        done();
      });
    });
  });

  it('will throw error if layout/components are not valid', function (done) {
    var server = new Hapi.Server();
    server.connection();
    server.register(HapiReactRedux, function (err) {
      options.layout = badLayout;
      options.routes = clientRoutes;
      server.hapiReactRedux(options);
      server.route({
        method: 'GET',
        path: '/',
        handler: function handler(request, reply) {
          return reply.hapiReactReduxRender();
        }
      });
      server.inject({
        method: 'GET',
        url: '/'
      }, function (res) {
        expect(res.statusCode).toBe(500);
        done();
      });
    });
  });

  it('will 404 if not found', function (done) {
    var server = new Hapi.Server();
    server.connection();
    server.register(HapiReactRedux, function (err) {
      options.layout = layout;
      options.routes = clientRoutes;
      server.hapiReactRedux(options);
      server.route({
        method: 'GET',
        path: '/{path*}',
        handler: function handler(request, reply) {
          return reply.hapiReactReduxRender();
        }
      });
      server.inject({
        method: 'GET',
        url: '/notfound'
      }, function (res) {
        expect(res.statusCode).toBe(404);
        done();
      });
    });
  });

  it('will throw error if react router throws an err', function (done) {
    var server = new Hapi.Server();
    server.connection();
    server.register(HapiReactRedux, function (err) {
      options.layout = layout;
      options.routes = badClientRoutes;
      server.hapiReactRedux(options);
      server.route({
        method: 'GET',
        path: '/',
        handler: function handler(request, reply) {
          return reply.hapiReactReduxRender();
        }
      });
      server.inject({
        method: 'GET',
        url: '/'
      }, function (res) {
        expect(res.statusCode).toBe(500);
        done();
      });
    });
  });
});
//# sourceMappingURL=index-test.js.map