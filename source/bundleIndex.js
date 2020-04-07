import work from 'webworkify-webpack'

require( 'desk-ui/source/ext/WebGL.js');
self.chroma = require( 'chroma-js' );
require( 'desk-ui/source/ext/workerSlicer.worker.js' );

function getCookie (name) {
  var match = document.cookie.match(new RegExp(name + '=([^;]+)'));
  if (match) return unescape(match[1]);
}

self.io = require('socket.io-client');
self.async            = require('async');
self._ = self.lodash  = require('lodash');
self.EventEmitter     = require('events');
self.jsSHA            = require("jssha");
self.randomJS         = require('random-js');
self.THREE            =	require('three');
	require('three/examples/js/controls/TransformControls.js');
	require('three/examples/js/loaders/STLLoader.js');
	require('desk-ui/source/ext/CTMLoader.js');
	require('desk-ui/source/ext/VTKLoader.js');
	require('desk-ui/source/ext/TrackballControls2.js');

self.Terminal = require( 'xterm' ).Terminal;
require ('xterm/css/xterm.css');
self.bluebird = self.Promise = require('bluebird');

// replace chalk.js hack with simple function
self.chalk = {
	Instance : function () {

		this.keyword = function ( color ) {

			return ( msg => msg );

		};

	}
}

THREE.CTMLoader.prototype.createWorker = function () {
	return work(require.resolve('desk-ui/source/ext/CTMWorker.js'), { all : true } );
}

THREE.VTKLoader.prototype.createWorker = function () {
	return work(require.resolve('desk-ui/source//ext/VTKWorker.js'), { all : true } );
}

if ( !self.require ) self.require = function (module) {
	if (module === 'desk-client' ) return self.desk;
	if ( self[ module ] ) return self[ module ];
	throw new Error( 'module ' + module + ' not found!' ).stack;
}
