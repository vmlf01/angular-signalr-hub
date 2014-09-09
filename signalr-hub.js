angular.module('SignalR', [])
.constant('$', $)
.factory('Hub', ['$', '$q', function ($, $q) {
    //This will allow same connection to be used for all Hubs
    //It also keeps connection as singleton.
    var globalConnection = null;

    var initGlobalConnection = function (options) {
        if (options && options.rootPath) {
            globalConnection = $.hubConnection(options.rootPath, { useDefaultPath: false });
        } else {
            globalConnection = $.hubConnection();
        }
		
        globalConnection.logging = (options && options.logging ? true : false);
    };

    return function (hubName, options) {
        var Hub = this;
        if (globalConnection === null) {
            initGlobalConnection(options);
        }
        Hub.connection = globalConnection;
        Hub.proxy = Hub.connection.createHubProxy(hubName);

        Hub.on = function (event, fn) {
            Hub.proxy.on(event, fn);
        };
        Hub.invoke = function (method, args) {
            return Hub.proxy.invoke.apply(Hub.proxy, arguments)
        };
        Hub.disconnect = function () {
            Hub.connection.stop();
        };

        // changed connect() to return a promise to make it easier to 
        // handle the connection start in the calling method
        Hub.connect = function () {
            var deferred = $q.defer();

            Hub.connection.start()
                .done(function () { deferred.resolve(Hub); })
                .fail(function (error) { deferred.reject({ reason: error, hub: Hub }); });

            return deferred.promise;
        };

        if (options && options.listeners) {
            angular.forEach(options.listeners, function (fn, event) {
                Hub.on(event, fn);
            });
        }
        if (options && options.methods) {
            angular.forEach(options.methods, function (method) {
                Hub[method] = function () {
                    var args = $.makeArray(arguments);
                    args.unshift(method);
                    return Hub.invoke.apply(Hub, args);
                };
            });
        }
        if (options && options.queryParams) {
            Hub.connection.qs = options.queryParams;
        }
        if (options && options.errorHandler) {
            Hub.connection.error(options.errorHandler);
        }

        // By default, if we are only interested in using one hub connection,
        // we can auto-start it when initializing the hub.
        // Otherwise, you should create all of them first with 
        // autoStart set to false and after that, call connect() 
        // on any one of them to start the shared connection.
        var autoStart = !(options && options.autoStart === false);
        if (autoStart) {
            return Hub.connect();
        }
        else {
            return $q.when(Hub);
        }
	};
}]);