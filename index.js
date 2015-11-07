require('dotenv').load();

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var _request = require('request');
var googleOAuthEndpoint = 'https://www.googleapis.com/oauth2/v3/token';

app.set('port', (process.env.PORT || 5000));

app.use(cors());
app.use(bodyParser.json());

app.get('/', function(request, response) {
  response.send('Hello world');
});

app.post('/exchange-authorization-code', function(request, response) {
  var authorizationCode = request.body.authorizationCode;

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
    console.log('err', err);
    console.log('httpRes', httpRes);
    console.log('body', body);
    response.send(body);
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
