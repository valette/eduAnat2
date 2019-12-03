'use strict';

const electron = require( 'electron' ),
      fs       = require( 'fs' );

const debug = process.argv[2] === "debug";
electron.app.commandLine.appendSwitch('ignore-gpu-blacklist', 'true');
electron.Menu.setApplicationMenu( null );


electron.app.on('ready', () => {
console.log("HERE!" + electron.app.getAppPath());

const image = electron.nativeImage.createFromPath(
  electron.app.getAppPath() + "/icon.icns");
console.log(image);
	const win = new electron.BrowserWindow( {

		icon: image, //'file://' + __dirname + '/icon.png',
		title:'EduAnat2',
		webPreferences: { nodeIntegration: true },
		show:false

	} );

	const begin = 'file://' + __dirname + '/';
	const url = !fs.existsSync( __dirname + "/compiled" ) ? begin + 'index.html'
		: begin +  ( debug ? 'compiled/source' : 'compiled/build' ) + '/index.html';

	win.loadURL( url );

	const splash = new electron.BrowserWindow( {

		width: 410,
		height: 402,
		resizable:false,
		frame: false,
		alwaysOnTop: true

	} );

	if ( debug ) {

		win.show();
		win.webContents.openDevTools();

	}

	splash.loadURL('file://' + __dirname + '/splash.html');

	require("electron").ipcMain.once('qx-ready', function () {

		win.show();
		splash.destroy();
		setTimeout( win.maximize.bind( win ), 200 );

	} );

} )
.on('window-all-closed', () => {

	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if ( process.platform !== 'darwin' ) electron.app.quit();

} )

