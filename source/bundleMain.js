
import work from 'webworkify-webpack'
import jsWorkerUrl from "url-loader!ace-builds/src-noconflict/worker-javascript.js";
import jsonWorkerUrl from "url-loader!ace-builds/src-noconflict/worker-json.js";
import htmlWorkerUrl from "url-loader!ace-builds/src-noconflict/worker-html.js";

self.GLDetector = require('./ext/WebGL.js');
self.chroma = require( 'chroma-js' );

function getCookie (name) {
  var match = document.cookie.match(new RegExp(name + '=([^;]+)'));
  if (match) return unescape(match[1]);
}

require('operative');
operative.setBaseURL(self.location.protocol + '//' 
	+ self.location.host 
	+ (getCookie("homeURL") || self.location.pathname)
	+ '/');

self.io = require('socket.io-client');
self.d3	= require ('d3');
self.c3 = require ('c3');
	require ('c3/c3.css');

self.ace = require('ace-builds/src-noconflict/ace');
self.ace.config.setModuleUrl( "ace/mode/javascript_worker", jsWorkerUrl );
self.ace.config.setModuleUrl( "ace/mode/json_worker", jsonWorkerUrl );
self.ace.config.setModuleUrl( "ace/mode/html_worker", htmlWorkerUrl );

	require('ace-builds/src-noconflict/mode-c_cpp');
	require('ace-builds/src-noconflict/mode-html');
	require('ace-builds/src-noconflict/mode-javascript');
	require('ace-builds/src-noconflict/mode-json');
	require('ace-builds/src-noconflict/theme-eclipse');
	require('ace-builds/src-noconflict/ext-searchbox');
	require("ace-builds/src-noconflict/ext-language_tools");

THREE.CTMLoader.prototype.createWorker = function () {
	return work(require.resolve('./ext/CTMWorker.js'), { all : true } );
}

THREE.VTKLoader.prototype.createWorker = function () {
	return work(require.resolve('./ext/VTKWorker.js'), { all : true } );
}

self.WorkerSlicer = require( 'source/ext/workerSlicer.class.js' );

if ( !self.require ) self.require = function ( module ) {
	if (module === 'desk-client' ) return self.desk;
	if ( self[ module ] ) return self[ module ];
	throw new Error( 'module ' + module + ' not found!' ).stack;
}


