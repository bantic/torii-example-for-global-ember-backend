require('dotenv').load();

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var _request = require('request');
var googleOAuthEndpoint = 'https://www.googleapis.com/oauth2/v3/token';
var googleOAuthUserInfoEndpoint = 'https://www.googleapis.com/oauth2/v2/userinfo';

app.set('port', (process.env.PORT || 5000));

app.use(cors());
app.use(bodyParser.json());

app.get('/', function(request, response) {
  response.send('Hello world');
});

var userDb = require('./src/user-db');

app.post('/sign-in-with-authorization-code', function(request, response) {
  // exchange authorization code for access token
  // read email from access token
  // lookup user with email
  //   -- if user exists, respond with mock user session token
  //   -- else, "create" user entry, respond with mock user session token

  var authorizationCode = request.body.authorizationCode;
  exchangeAuthorizationCode(authorizationCode, function(err, accessTokenData) {
    var accessToken = accessTokenData.access_token;

    getEmailFromAccessToken(accessToken, function(err, email) {
      var user = userDb.findOrCreateByEmail(email);

      response.send(user);
    });
  });
});

app.get('/users/:id', function(request, response) {
  var id = request.params.id;

  var user = userDb.findById(id);
  if (user) {
    response.send(user);
  } else {
    response.status(404).send('not found');
  }
});

app.delete('/users/:id', function(request, response) {
  userDb.removeId(request.params.id);

  response.status(204).send({});
});

app.post('/exchange-authorization-code', function(request, response) {
  var authorizationCode = request.body.authorizationCode;

  exchangeAuthorizationCode(authorizationCode, function(err, accessTokenData) {
    if (err) {
      console.log(err);
    }
    response.send(accessTokenData);
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function exchangeAuthorizationCode(authorizationCode, callback) {
  var clientId = process.env.CLIENT_ID;
  var clientSecret = process.env.CLIENT_SECRET;
  var redirectUri = process.env.REDIRECT_URI;
  var grantType = 'authorization_code';

  _request.post({
    url: googleOAuthEndpoint,
    form: {
      'code':          authorizationCode,
      'client_id':     clientId,
      'client_secret': clientSecret,
      'redirect_uri':  redirectUri,
      'grant_type':    grantType
    }
  }, function(err, httpRes, body) {
    body = JSON.parse(body);

    callback(err, body);
  });
}

function getEmailFromAccessToken(accessToken, callback) {
  var url = googleOAuthUserInfoEndpoint + '?access_token=' + accessToken;

  _request.get(url, function(err, httpResponse, body) {
    console.log('response from user info endpoint', body);
    body = JSON.parse(body);

    callback(err, body.email);
  });
}
