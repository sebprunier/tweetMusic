require.config({
	// modules paths
	baseUrl: 'scripts/modules',
	// vendor lib paths
	paths: {
		jquery: '../vendor/jquery/jquery',
		io: '../vendor/socket.io/dist/socket.io',
		webpd: '../vendor/webpd/index'
	}
});

// start the main app logic.
require(['jquery', 'io'],
function($, io) {
	$(function() {
		var patch,sketch, docH,docW;
		docH = $(window).height();
		docW = $(window).width();

		// load pd patch
		$.get('patch/test.pd', function(patchFile) {
			patch = Pd.compat.parse(patchFile);
            console.log('WebPd patch ready');
		    patch.play();
		});
		
		// connect the browser to the server through websocket
		var socket = io.connect(window.location.href);
		// when the 'tweet' message is recieved
		socket.on('tweet', function (data) {
			// send the sound name to the pd patch
			patch.send(data.sound,1);
		});
	});
});