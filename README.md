angular-signalr-hub
=======================

A handy wrapper for SignalR Hubs. Just specify the hub name, listening functions, and methods that you're going to use.

##Installation

####Bower
`bower install angular-signalr-hub`

####Nuget
`install-package AngularJs.SignalR.Hub`

####Manually

`<script type="text/javascript" src="js/signalr-hub.js"></script>`

##Usage

1. Include the `signalr-hub.js` script provided by this component into your app
2. add `SignalR` as a module dependency to your app
3. Call new Hub with two parameters
	
			var appHub = null; 
			new Hub('hubname',options)
				.then(function(hub) { appHub = hub });

####Javascript
```javascript
    
	var alertHub = null;
	new Hub('AlertHub', {
			listeners: {
		    	//Client methods
		    	'globalAlert': function (message) {
		      		alert(message);
		      		$rootScope.$apply();
		    	}
			},
		    methods: [],
		    rootPath: '/api',
		    queryParams: {
		    	'token': a.getToken()
			}
		}
    ).then(function(hub) { alertHub = hub; });

```

```javascript

    angular.module('app',['SignalR'])
    .factory('Employees',['$rootScope','Hub', function($rootScope, Hub){
    
    	//declaring the hub connection
		var hubConnection = null;
    	var hubPromise = new Hub('employee', {
    	
    		//client side methods
    		listeners:{
    			'lockEmployee': function (id) {
    				var employee = find(id);
    				employee.Locked = true;
    				$rootScope.$apply();
    			},
    			'unlockEmployee': function (id) {
    				var employee = find(id);
    				employee.Locked = false;
    				$rootScope.$apply();
    			}
    		},
    		
    		//server side methods
    		methods: ['lock','unlock'],
    		
    		//query params sent on initial connection
    		queryParams:{
    			'token': 'exampletoken'
    		},
    
    		//handle connection error
    		errorHandler: function(error){
    			console.error(error);
    		},

			// don't auto start the connection, we will do it later
			autoStart: false
    		
    	});

		// start the hub connection manually
		hubPromise.then(function(hub) { return hub.connect(); })
			.then(function(hub) { hubConnection = hub; });
    
    	var edit = function (employee) {
    		hub.lock(employee.Id); //Calling a server method
    	};
    	var done = function (employee) {
    		hub.unlock(employee.Id); //Calling a server method
    	}
    
    	return {
    		editEmployee: edit,
    		doneWithEmployee: done
    	};
    }]);

````
##Options

* `listeners` client side callbacks
* `methods`  a string array of server side methods which the client can call
* `rootPath` sets the root path for the signalR web service
* `queryParams` object representing additional query params to be sent on connection
* `errorHandler` function(error) to handle hub connection errors
* `logging` enable/disable logging
* `autoStart` a boolean indicating whether to start the base connection when creating the hub, defaults to *true*
 
##Demo

[A simple demo using OData, Signalr, and Angular](https://github.com/JustMaier/signalrgrid)

It's an adaption of [turanuk's great SignalR demo with Knockout](https://github.com/turanuk/signalrgrid).

##Notes

* I would recommend creating a factory or service around the Hub so that you have an easy to use "model handler" that can include SignalR and Web API calls and be easily pulled into any controller
* For an example of Web API, SignalR, and Angular working together check out this [small demo](https://github.com/JustMaier/signalrgrid) I adapted from [turanuk's SignalR demo with Knockout](https://github.com/turanuk/signalrgrid)