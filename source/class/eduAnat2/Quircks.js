
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

		switch ( desk.Actions.getEngine() ) {

			case "electron":
				console.log( "Not Tested" );
				eduAnat2.Quircks.workerSlicer = true;
				eduAnat2.Quircks.appRoot = require( 'electron' ).remote.app.getAppPath() + "/";
				eduAnat2.Quircks.readFile = eduAnat2.Quircks.readFileElectron;
				break;

			case "node":

				const root = qx.core.Init.getApplication().getRoot();
				const button = new qx.ui.form.Button( "loop" );
				root.add( button, { right : 0, top : 200 } );
				button.addListener( 'execute', this.__loop, this );
				desk.Actions.getInstance().statifyCode= "home/git/eduAnat2/compiled/build";


			default:
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

			if ( desk.Actions.getEngine() === "electron" ) return path;
			return encodeURI( desk.FileSystem.getFileURL( path ) );

		},

		appRoot : null

	},

	members : {

		__loop : async function () {

			const volumes = [];
			const meshes = [];

			await desk.FileSystem.traverseAsync( this.__anaPedaRoot, f => {

				if ( f.endsWith( "stl" ) ) meshes.push( f );
				if ( f.endsWith( ".nii.gz" ) ) volumes.push( f );

			} );

//			volumes.length = meshes.length = 3;

			console.log( { volumes, meshes } );

			for ( let mesh of meshes ) {

				desk.FileSystem.getFileURL( mesh );

			}

			const volumeViewer = new desk.VolumeViewer();
			for ( let volume of volumes ) {

				await volumeViewer.addVolumeAsync( volume,
					{ format : 0 } );
				await new Promise ( res => setTimeout( res, 500 ) );
				volumeViewer.removeAllVolumes();

			}

		},

		__anaPedaRoot : "data/AnaPeda",

		__selectFileWindow : null,

		__selectFileNode : async function () {

			const self = eduAnat2.Quircks.getInstance();

			let win = self.____selectFileWindow;
			if ( !win ) {

				win = new qx.ui.window.Window();
				win.set( { width : 600, height : 500,
					layout : new qx.ui.layout.VBox() } );

				const fileBrowser = new desk.FileBrowser( self.__anaPedaRoot );
				fileBrowser.setContextMenu( new qx.ui.menu.Menu() );
				win.add( fileBrowser, { flex : 1 } );
				self.____selectFileWindow = win;
				win.center();
				fileBrowser.setFileHandler( () => {} );

			}


			win.open();

			let closeHandler;
			const fileBrowser = win.getChildren()[ 0 ];

			const result = await Promise.race( [

				new Promise( res => {
					fileBrowser.setFileHandler( file => {

						if ( closeHandler ) win.removeListenerById( closeHandler );
						res( { file } );

					} )
				} ),

				new Promise( res => {

					closeHandler = win.addListenerOnce( "close", () => {

						closeHandler = null;
						res ( { canceled : true } );

					} );

				} )

			] );

			fileBrowser.setFileHandler( () => {} );
			win.close();
			return result;


		},

		__selectFileElectron : async function () {
/// TODO!
            var dialog = require('electron').remote.dialog;
            var win = await dialog.showOpenDialog({
              filters : [
                {name: 'Anat Nifti Image', extensions: ['anat.nii.gz']},
                {name: 'Nifti Image', extensions: ['nii.gz']},
                {name: 'All Files', extensions: ['*']}

              ],
              properties: ['openFile']
            });

			if ( win.canceled ) return;

		}


	}


});