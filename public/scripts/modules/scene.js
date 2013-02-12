define(['box2d', 'requestAnimationFrame', 'stats'], function(Box2D, requestAnimationFrame, Stats) {

	// global classnames from Box2d namespace
	var b2Vec2 = Box2D.Common.Math.b2Vec2,
		b2BodyDef = Box2D.Dynamics.b2BodyDef,
		b2Body = Box2D.Dynamics.b2Body,
		b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
		b2World = Box2D.Dynamics.b2World,
		b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
		b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
		b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

	// x, y gravity : here it means 10m/s2 almost earth gravity
	var gravity = new b2Vec2(0, 10);
	
	// fixture shared between the ball and the floor
	var fixDef = new b2FixtureDef();
	fixDef.density = 1.0;
	fixDef.friction = 0.2;
	fixDef.restitution = 0.1;
	
	// time to live for bodies in seconds
	var TTL = 30;
	
	// scaling factor : 1 in box2d equals 30 pixels
	var SCALE = 30;
	
	// private fields
	var width, 
		height,
		world,
		canvas,
		debugCanvas,
		debugDraw,
		stats;
	
	/**
	 * Constructor of the scene
	 */
	function Scene(renderingCanvas, debugC ,debug) {
		// creation of the box2d world
		world = new b2World(gravity, true);
		// the rendering canvas
		canvas = renderingCanvas;
		debugCanvas = debugC;
		width = canvas.width;
		height = canvas.height;
		// if debug, turn on the debug canvas and stats
		if (debug) {
			setUpDebug();
			initStats();
		}
		// add a floor
		addFloor();
		// finaly render the scene
		requestAnimationFrame(loop);
	}
	
	/**
	 * Add a tweet to the scene
	 * @param tweet {String} the tweet
	 */
	Scene.prototype.addTweet = function (tweet) {
		// create a new body in the world
		var bodyDef = new b2BodyDef();
		bodyDef.type = b2Body.b2_dynamicBody;
		// position
		bodyDef.position.x = Math.random()*width/SCALE;
		bodyDef.position.y = Math.random()*20/SCALE;
		// let the body carry some user data that will be useful later
		bodyDef.userData = {
			tweet : tweet,
			color : randomColor(),
			ttl : TTL*60
		};
		// create the fixture's shape associated to the tweet
		fixDef.shape = new b2PolygonShape();
		var size = pixelSize(tweet);
		fixDef.shape.SetAsBox(size.width/2/SCALE,size.height/2/SCALE); // ie. a size of 1*1 so 30*30pixels
		// add the body to the b2web world
		return world.CreateBody(bodyDef).CreateFixture(fixDef);
	};
	
	
	/**
	 * Add a floor to the scene
	 */
	function addFloor() {
		// creation of the floor body
		var bodyDef = new b2BodyDef();
		// make it static
		bodyDef.type = b2Body.b2_staticBody;
		// set the position of the body
		bodyDef.position.x = width/2/SCALE;
		bodyDef.position.y = (height-1)/SCALE;
		// creation of the shape governed by the fixture
		fixDef.shape = new b2PolygonShape();
		fixDef.shape.SetAsBox(width/2/SCALE, 1/SCALE);
		// add the ground body and its fixture to the world		
		return world.CreateBody(bodyDef).CreateFixture(fixDef);
	}
	
	/**
	 * Loop that will draw each animation frame of the box2d world.
	 */
	function loop() {
		// stats
		stats.begin();
		// update the box2d world
		world.Step(1/60, 10, 10);
		world.ClearForces();
		// draw in the receiving canvas
		var context = canvas.getContext('2d');
		context.clearRect(0, 0, width, height);
		for (var b = world.GetBodyList(); b; b = b.GetNext()) {
			// draw each box2d bodies if it's a dynamic one (i.e. not the ground)
			if (b.GetType() == b2Body.b2_dynamicBody) {
				if (b.GetUserData().ttl === 0) {
					// if TTL is has ended, destroy the tweet body
					world.DestroyBody(b);
				}
				else {
					// decrement the TTL
					b.GetUserData().ttl--;
					// get the new position in order to draw the body
					var pos = b.GetPosition();
					context.save();
					context.translate(pos.x*SCALE, pos.y*SCALE);
					context.rotate(b.GetAngle());
					// use a custom font and color
					context.font = 'bold 14px Lemon';
					context.fillStyle = b.GetUserData().color;
					context.fillText(b.GetUserData().tweet, 0, 0);
					context.restore();
				}
			}
		}
		if (debugDraw) {
			//world.DrawDebugData();
		}
		// stats
		stats.end();
		// request the next frame
		requestAnimationFrame(loop);
	}
	
	/**
	 * Set up the debug draw in the given DOM canvas element.
	 * @param {Object} debugCanvas the canvas where debug will be output
	 */
	function setUpDebug() {
		debugDraw = new b2DebugDraw();
		debugDraw.SetSprite(canvas.getContext("2d"));
		debugDraw.SetDrawScale(SCALE);
		debugDraw.SetFillAlpha(0.3);
		debugDraw.SetLineThickness(1);
		debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
		world.SetDebugDraw(debugDraw);
	}
	
	/**
	 * Generates a random hexadecimal color
	 * @return {string} the string representing the hexadecimal color.
	 */
	function randomColor() {
		return '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
	}
	
	/**
	 * Stats
	 */
	function initStats() {
		stats = new Stats();
		stats.setMode(0);
		// Align top-left
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.top = '0px';

		document.body.appendChild(stats.domElement);
	}
	
	function pixelSize(tweet) {
		var ruler = document.getElementById('ruler');
		ruler.innerHTML = tweet;
		var x = ruler.offsetWidth;
		var y = ruler.offsetHeight;
		return {width:x,height:y};
	}
	
	// return the scene class
	return Scene;
});