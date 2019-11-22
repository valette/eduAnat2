
self.async            = require('async');
self._ = self.lodash  = require('lodash');
self.EventEmitter     = require('events');
self.heap = self.Heap = require('heap');
self.jsSHA            = require("jssha");
self.kdTree           = require('kdt');
self.numeric          = require('numeric');
self.randomJS         = require('random-js');
self.THREE            =	require('three');
	require('three/examples/js/controls/TransformControls.js');
	require('three/examples/js/loaders/STLLoader.js');
	require('./ext/VTKLoader.js');
	require('./ext/TrackballControls2.js');
	require('./ext/CTMLoader.js');

self.bluebird = self.Promise = require('bluebird');
self.chalk            = require('chalk');
self.jstat            = require('jstat');
self.ttest            = require('ttest');
require('./ext/mhdParse.js');

if (typeof importScripts !== 'function') {

	// we are not in a worker
	require( './bundleMain.js');

}

