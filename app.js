var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	twitter = require('ntwitter'),
	terms = require('./modules/terms'),
	credentials = require('./modules/credentials');

// twitter api credentials
var twit = new twitter({
    consumer_key: credentials.consumer_key,
    consumer_secret: credentials.consumer_secret,
    access_token_key: credentials.access_token_key,
    access_token_secret: credentials.access_token_secret
});

// start the server
var port = process.env.PORT || 5000;
server.listen(port);

// static files (js/css/html) server from here
app.use(express.static(__dirname + '/public'));

// main route
app.get('/', function (req, res) {
  res.sendfile('index.html');
});


/**
 * Check if a tweet contains on of th given term, and returns its associated sound.
 * @param tweet {object} - the object representation of the tweet
 * @return {string} the associated sound name
 */
function process(tweet) {
	if (!tweet) return;
	for(var k in terms) {
		if(tweet.indexOf(k) !== -1) return {sound: terms[k]};
	}
}

// when a client connects
io.sockets.on('connection', function (socket) {
	// start the use of the twitter streaming api
	twit.stream(
		// call this api, which lets you do some filtering on the tweets
		'statuses/filter',
		// the filtering is done here by tracking some terms
		{track: terms.keys()},
		// applied to the stream
		function(stream) {
			// when a tweet match a tracked term
	        stream.on('data', function(tweet) {
				// get the sound
				var sound = process(tweet.text);
				// and if the sound is found, emit a websocket message to the client
				if (sound !== undefined) socket.emit('tweet', sound);
	        });
		}
	);
});


