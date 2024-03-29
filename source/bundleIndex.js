import work from 'webworkify-webpack'
import { STLLoader } from '../node_modules/three/examples/jsm/loaders/STLLoader.js';
import { TransformControls } from '../node_modules/three/examples/jsm/controls/TransformControls.js';

require( 'desk-ui/source/ext/WebGL.js');
self.chroma = require( 'chroma-js' );
self.bowser = require( 'bowser' );
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
	require('desk-ui/source/ext/CTMLoader.js');
	require('desk-ui/source/ext/VTKLoader.js');
	require('desk-ui/source/ext/TrackballControls2.js');
	require('../node_modules/three/examples/js/utils/BufferGeometryUtils.js');
self.THREE.STLLoader = STLLoader;
self.THREE.TransformControls = TransformControls;

self.Terminal = require( 'xterm' ).Terminal;
require ('xterm/css/xterm.css');
self.bluebird = self.Promise = require('bluebird');
self.numeric = require( 'numeric' );

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
