
/**
 * @ignore (require)
 * @ignore (fetch)
 */


qx.Class.define("eduAnat2.Quircks", {

	extend : qx.core.Object,

	type : "singleton",

    /**
     * constructor
     */
    construct: function() {

	    this.base(arguments);

		try {

			const electron = require( 'electron' );
			eduAnat2.Quircks.workerSlicer = true;
			eduAnat2.Quircks.appRoot = electron.remote.app.getAppPath() + "/";
			eduAnat2.Quircks.readFile = eduAnat2.Quircks.readFileElectron;
			eduAnat2.Quircks.selectFile = this.__selectFileElectron;
			return;

		} catch ( e ) { }

		let formatButton;

		function updateFormatButtonLabel() {

			if ( !formatButton ) return;
			formatButton.setLabel( eduAnat2.Quircks.anatImagesFormat ?
				"Low Res Anat" : "Hi Res Anat" );

		}

		switch ( desk.Actions.getEngine() ) {

			case "node":

				const root = qx.core.Init.getApplication().getRoot();
				const button = new qx.ui.form.Button( "loop" );
				root.add( button, { right : 0, top : 200 } );
				button.addListener( 'execute', this.__loop, this );
				desk.Actions.getInstance().statifyCode= "home/git/eduAnat2/compiled/build";
				formatButton = new qx.ui.form.Button( "Hi Res Anat" );
				updateFormatButtonLabel();

				formatButton.addListener( 'execute', () => {

					eduAnat2.Quircks.anatImagesFormat = 1 - eduAnat2.Quircks.anatImagesFormat;

					updateFormatButtonLabel();

				} );

				root.add( formatButton, { right : 0, top : 260 } );


			default:

				desk.FileSystem.readFile( eduAnat2.Quircks.formatFile,
					( err, res ) => {

					if ( err ) return;
					eduAnat2.Quircks.anatImagesFormat = JSON.parse( res );
					updateFormatButtonLabel();

				} );

				eduAnat2.Quircks.workerSlicer = false;
				eduAnat2.Quircks.appRoot = "";
				eduAnat2.Quircks.readFile = eduAnat2.Quircks.readFileNode;
				eduAnat2.Quircks.selectFile = this.__selectFileNode;

				break;

		}



    },

    destruct: function() {

    },

    statics : {

		formatFile : "data/format.json",
		getVersion : async function () {

			return JSON.parse( await eduAnat2.Quircks.readFile(
				eduAnat2.Quircks.appRoot + 'package.json' ) ).version

		},

		getBuildDate : async function () {


		},

		selectFile : null,


		readFileElectron : async function( file ) {

			return await require('fs').promises.readFile( file );
			

		},

		readFileNode : async function( file ) {

			return await ( (await fetch( file ) ).text() );			

		},


		getFileURL : function( path ) {

			try {
				require ("electron" )
				return path;
			} catch ( e ) {};

			return encodeURI( desk.FileSystem.getFileURL( path ) );

		},

		appRoot : null,

		flipVolume : async function ( file ) {

			try {

				require( 'electron' );
				return file;

			} catch ( e ) { }

			const flip = await desk.Actions.executeAsync( {

				action : "flipToRAS",
				inputVolume : file,
				outputFileName : "output.nii.gz"

			} );

			return flip.outputDirectory + "output.nii.gz";

		},

		anatImagesFormat : 0,

		capture : async function ( element ) {

			const that = eduAnat2.Quircks.getInstance();

			try {
				require( "electron" );
				
			} catch ( e ) {

				that.__captureWeb( element );
				return;

			}

			that.__captureElectron( element );

		}

	},

	members : {

		__captureWeb : async function ( element ) {
// TODO!
		},

		__captureElectron : async function ( element ) {

			var el = element.getContentElement().getDomElement(); 
			var rect = el.getBoundingClientRect();
			rect.y = rect.top;
			rect.x = rect.left;
			var remote = require('electron').remote;
			var webContents = remote.getCurrentWebContents();
			var image = await webContents.capturePage(rect);
			var dialog = remote.dialog;
			var fn = await dialog.showSaveDialog({
				defaultPath: 'capture.png',
				filters : [{name: 'Image', extensions: ['png']}]
			});

			if ( fn.canceled ) return;
			remote.require('fs').writeFile(fn.filePath, image.toPNG(), function () {});

		},

		__loop : async function () {

			const volumes = [];
			const meshes = [];

			await desk.FileSystem.writeFileAsync( eduAnat2.Quircks.formatFile,
				JSON.stringify( eduAnat2.Quircks.anatImagesFormat ) )

			desk.FileSystem.getFileURL( eduAnat2.Quircks.formatFile );


			await desk.FileSystem.traverseAsync( this.anaPedaRoot, f => {

				if ( f.endsWith( "stl" ) ) meshes.push( f );
				if ( f.endsWith( ".nii.gz" ) ) volumes.push( f );

			} );

//			volumes.length = meshes.length = 3;

			console.log( { volumes, meshes } );
			for ( let mesh of meshes ) desk.FileSystem.getFileURL( mesh );

			const volumeViewer = new desk.VolumeViewer();

			for ( let volume of volumes ) {

				const fixedFile = await eduAnat2.Quircks.flipVolume( volume );
				const format = volume.endsWith( ".fonc.nii.gz" ) ?
					0 : eduAnat2.Quircks.anatImagesFormat;

				await volumeViewer.addVolumeAsync( fixedFile, { format } );
				await new Promise ( res => setTimeout( res, 500 ) );
				volumeViewer.removeAllVolumes();

			}

			alert( 'loop done' );

		},

		anaPedaRoot : "data/AnaPeda",

		__selectFileWindow : null,

		__selectFileNode : async function ( func ) {

			const self = eduAnat2.Quircks.getInstance();

			let win = self.____selectFileWindow;
			if ( !win ) {

				win = new qx.ui.window.Window();
				win.set( { width : 600, height : 500,
					layout : new qx.ui.layout.VBox(),
					showMinimize : false } );

				const fileBrowser = new desk.FileBrowser( self.anaPedaRoot );
				fileBrowser.setContextMenu( new qx.ui.menu.Menu() );
				win.add( fileBrowser, { flex : 1 } );
				self.____selectFileWindow = win;
				win.center();
				fileBrowser.getTree().setHideRoot( true );
				fileBrowser.getTree().setFont( new qx.bom.Font( 20 ) );
				fileBrowser.setFileHandler( () => {} );
				const button = new qx.ui.form.Button( "Ouvrir" );
				button.getChildControl("label").setFont( new qx.bom.Font( 20 ) );
				button.setHeight( 50 );
				win.add( button );

			}


			win.open();

			let closeHandler, buttonHandler, selectionHandler;
			const fileBrowser = win.getChildren()[ 0 ];
			const button = win.getChildren()[ 1 ];
			button.setEnabled( false );

			const filterValue = ( func ? ".fonc" : ".anat")	+ ".nii.gz"
			fileBrowser.getFileFilter().setValue( filterValue );
			const tree = fileBrowser.getTree();
			tree.refresh();

			const caption = func ? "Sélectionnez un calque"
				: "Sélectionnez une image";

			win.setCaption( caption );

			selectionHandler =tree.addListener( 'changeSelection',
				() => {
					button.setEnabled(
						fileBrowser.getSelectedFiles()[ 0 ].endsWith( filterValue ));
				} );

			const result = await Promise.race( [

				new Promise( res => {
					fileBrowser.setFileHandler( file => {

						if ( !file.endsWith( filterValue ) ) return;
						res( { file } );

					} )
				} ),

				new Promise( res => {

					closeHandler = win.addListenerOnce( "close", () => {

						res( { canceled : true } );

					} );

				} ),

				new Promise( res => {

					buttonHandler = button.addListenerOnce( "execute", () => {

						res( { file : fileBrowser.getSelectedFiles()[ 0 ] } );

					} );

				} )

			] );

			tree.removeListenerById( selectionHandler );
			win.removeListenerById( closeHandler );
			button.removeListenerById( buttonHandler );
			fileBrowser.setFileHandler( () => {} );
			win.close();
			return result;

		},

		__selectFileElectron : async function ( func ) {
/// TODO!

			const filters = func ?
				[
					{name: 'Fonc Nifti Image', extensions: ['fonc.nii.gz']},
					{name: 'Nifti Image', extensions: ['nii.gz']},
					{name: 'All Files', extensions: ['*']}

					]
				: [
					{name: 'Anat Nifti Image', extensions: ['anat.nii.gz']},
					{name: 'Nifti Image', extensions: ['nii.gz']},
					{name: 'All Files', extensions: ['*']}

				];

            const dialog = require('electron').remote.dialog;
            const win = await dialog.showOpenDialog({
              filters, properties: [ 'openFile' ] } );

			if ( win.canceled ) return { canceled : true };
			return { file : win.filePaths[ 0 ] };

		}


	}


});
