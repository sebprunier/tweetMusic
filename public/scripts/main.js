require.config({
	// modules paths
	baseUrl: 'scripts/modules',
	// vendor lib paths
	paths: {
		jquery: '../vendor/jquery/jquery',
		io: '../vendor/socket.io-client/dist/socket.io',
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
			if (data.sound) {
				// send the sound name to the pd patch
				patch.send(data.sound,1);
				// add in the page the text corresponding to the sound
				// TODO manage an image instead of the text !
				// kick -> grosse caisse batterie
				// tom -> betterie normale
				// crash -> symballes
				// clap -> son batterie type bois
				var soundDiv = $('#' + data.sound);
				if (soundDiv.length <= 0) {
					$('#content').append('<div style=\'float:left; width:144px; height: 144px\' id=\''+ data.sound +'\'></div>');
					$('#' + data.sound).append('<img src=\'img/' + data.sound + '.png\'/>');
				}
				$('#' + data.sound + ' img').toggle();
			}
		});
	});
});