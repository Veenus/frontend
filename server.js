// server.js

	// set up ========================
	var express  = require('express');
	var app      = express(); 								// create our app w/ express
	// var mongoose = require('mongoose'); 					// mongoose for mongodb

	var stormpath = require('stormpath');

	var homeDir = process.env[(process.platform === 'win32' ? 'USERPROFILE' : 'HOME')];
	var apiKeyFilePath = homeDir + '/.stormpath/apiKey.properties';

	var client = null; //available after the ApiKey is loaded from disk (api key is needed to instantiate the client).
    
    var app_href = 'https://api.stormpath.com/v1/applications/67gmih1IqaWGuox8kGasf9';
	stormpath.loadApiKey(apiKeyFilePath, function (err, apiKey) {
	  if (err) throw err;

	  client = new stormpath.Client({apiKey: apiKey});
	});

	function unique(aString) {
	  return aString + '-' + require('node-uuid').v4().toString();
    }

	// configuration =================

	// mongoose.connect('mongodb://node:node@mongo.onmodulus.net:27017/uwO3mypu'); 	// connect to mongoDB database on modulus.io

	app.configure(function() {
		app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
		app.use(express.logger('dev')); 						// log every request to the console
		app.use(express.bodyParser()); 							// pull information from html in POST
		app.use(express.methodOverride()); 						// simulate DELETE and PUT
	});

	// // define model =================
	// var Todo = mongoose.model('Todo', {
	// 	text : String
	// });

	// routes ======================================================================

	// api --------------------------------------------------------------------

	// register user
	app.post('/api/v1/register', function(req, res) {
		client.getApplication(app_href, function (err, application) {
		  	if (err) {
		  	    console.log(err); 
		  		res.send(400,err);
		  	}
		  	console.log(application);
		  	console.log(req.body);
		  	var acct = req.body;
		  	application.createAccount(acct, function(err_acct, createdAccount) {
		    if (err_acct) {
		    	console.log(err_acct);
		    	res.send(400,err_acct);
		    }
		    account = createdAccount;
		    console.log('Created account:');
		    console.log(account);
		    return res.json(account);
		  });
	    });
	});

    // authenticate user
	app.post('/api/v1/login', function(req, res) {
		client.getApplication(app_href, function (err, application) {
		  	if (err) {
		  	    console.log(err); 
		  		res.send(400,err);
		  	}
		  	var authcRequest = req.body;
		  	application.authenticateAccount(authcRequest, function onAuthcResult(err, result) {
				if (err) {
			  	    console.log(err); 
			  		res.send(400,err);
			  	}
			  	else {
			  		client.getAccount(result.account.href, {expand:'customData'},function (err, account){
				  		if(err) {
				  			console.log(err); 
				  		    res.send(400,err);
				  		}
				  		else {
				  			console.log(account.customData);
							res.json(account);
					  	}
				  	});
				}
            });
	    });
	});

    // verify user with provide linkedin/salesforce
	app.post('/api/v1/account', function(req, res) {
		  	account_href = req.body.account_href;
		  	provider = req.body.provider;
		  	client.getAccount(account_href, {expand:'customData'},function (err, account){
		  		if(err) {
		  			console.log(err); 
		  		    res.send(400,err);
		  		}
		  		else {
		  			account.getCustomData(function(err, cd) {
		  				if(err) {
				  			console.log(err); 
				  		    res.send(400,err);
				  		}
				  		else {
			  				cd[provider] = req.body.provider_details;
			  				cd.save(function(err,cd) {
			  					if(err) {
						  			console.log(err); 
						  		    res.send(400,err);
						  		}
						  		else{
								    console.log(cd);
							        res.send(200); 
						  		}
			  				});
			  			}
		  			});
			  	}
		  	});
	    });


	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});


	// listen (start app with node server.js) ======================================
	app.listen(8080);
	console.log("App listening on port 8080")