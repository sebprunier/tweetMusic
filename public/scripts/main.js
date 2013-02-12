require.config({
	// modules paths
	baseUrl: 'scripts/modules',
	// vendor lib paths
	paths: {
		box2d: '../vendor/Box2d.min/index',
		requestAnimationFrame: '../vendor/raf/raf',
		jquery: '../vendor/jquery/jquery',
		io: '../vendor/socket.io/dist/socket.io',
		stats: '../vendor/stats/index',
		webpd: '../vendor/webpd/index'
	},
	shim: {
		// box2d web shim
		'box2d': {
			exports: 'Box2D'
		},
		'stats': {
			exports: 'Stats'
		}
	}
});

// start the main app logic.
require(['jquery', 'io', 'scene'],
function($, io, Scene) {
	$(function() {
		console.log(Pd);
		var patch,sketch, docH,docW;
		docH = $(window).height();
		docW = $(window).width();
		$.get('test.pd', function(patchFile) {
			patch = Pd.compat.parse(patchFile);
            console.log('WebPd patch ready');
		    patch.play();
		});
		
		// connect the browser to the server through websocket
		var socket = io.connect('http://localhost:8080');
		// when the 'tweet' message is recieved
		socket.on('tweet', function (data) {
			console.log(data);
			patch.send(data.sound,1);
		});
	});
});