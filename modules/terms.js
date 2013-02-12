// tracked terms and the mapped sound
var terms = {};
terms.fun = 'crash';
terms.cool = 'clap';
terms.nice = 'tom';
terms.good = 'kick';

// get the keys
terms.keys = function() {
	var keyList = [];
	for(var k in this) keyList.push(k);
	return keyList;
};

module.exports = terms;