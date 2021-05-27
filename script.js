'use strict';

const electron = require( 'electron' ),
      fs       = require( 'fs' );

const debug = process.argv[2] === "debug";
electron.app.commandLine.appendSwitch('ignore-gpu-blacklist', 'true');
electron.Menu.setApplicationMenu( null );

const rootPath = 'file://' + __dirname + '/';
const basePath = !fs.existsSync( __dirname + "/compiled" ) ? rootPath
	: rootPath +  ( debug ? 'compiled/source/' : 'compiled/dist/' );

electron.app.on('ready', () => {

	const win = new electron.BrowserWindow( {

		icon: basePath + "resource/eduAnat2/icon.png",
		title:'EduAnat2',
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			contextIsolation: false
		},
		show:false

	} );

	const url = basePath + 'index.html';

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

	splash.loadURL( basePath + 'resource/eduAnat2/splash.html');

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

