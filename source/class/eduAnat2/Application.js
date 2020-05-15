
/* ************************************************************************

   Copyright: CNRS, INSERM, INSA-Lyon

   License: CeCILL B

   Authors: Rémi Agier, Sebastien Valette

************************************************************************ */

/**
 * @asset(eduAnat2/*)
 * @asset(desk/img.png)
 * @asset(desk/tris.png)
 * @ignore (require)
 * @ignore (WEBGL.*)
 */

qx.Class.define("eduAnat2.Application", {

	extend : qx.application.Standalone,

	members : {

		main : async function() {

			const waitELement = document.getElementById( "loading" );
			waitELement.innerHTML = "<p>C'est bientôt fini</p>";

			function getParameter( parameterName ) {
				parameterName = parameterName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
				var regex = new RegExp( "[\\?&]" + parameterName + "=([^&#]*)" );
				var results = regex.exec( unescape( window.location.href ) );
				if (results == null) {
					return null;
				} else {
					return results[1];
				}
			}

			// Call super class
			this.base(arguments);

			// Enable logging in debug variant
			if (qx.core.Environment.get("qx.debug")) {
				// support native logging capabilities, e.g. Firebug for Firefox
				qx.log.appender.Native;
				// support additional cross-browser console. Press F7 to toggle visibility
				qx.log.appender.Console;
			}

			desk.AddPromises.getInstance();
			await desk.Actions.initAsync();
			eduAnat2.Quircks.getInstance();

			//desk.auto = true;
			const qxRoot = qx.core.Init.getApplication().getRoot();
			//qx.locale.Manager.getInstance().setLocale("en");

			if ( !WEBGL.isWebGLAvailable() ) {

				console.log("WebGLUnavalable");
				const win = new qx.ui.window.Window( qxRoot.tr("Erreur : WebGL non supporté") );
				win.setLayout( new qx.ui.layout.VBox( 10 ) );

				win.set( {
					width : 400,
					alwaysOnTop : true,
					showMinimize : false,
					showMaximize : false,
					showClose : false,
					centerOnAppear : true,
					modal : true,
					movable : false,
					resizable : false,
					allowClose : false,
					allowMaximize : false,
					allowMinimize : false
				} );

				// label to show the e.g. the alert message
				win.add( new qx.ui.basic.Label(qxRoot.tr("WebGL n'est pas supporté par votre système.") ) );
				qxRoot.add( win );
				win.open();
				return;

			}

			const container = new qx.ui.splitpane.Pane( "horizontal" );
			container.getChildControl("splitter").setBackgroundColor( "#C0C0C0" );

			const width = desk.Actions.getEngine() === "node" ?
				"90%" : "100%";

			waitELement.className = "loading-invisible";
			qxRoot.add( container, { width, height : "100%" } );
			const sideViewer = new eduAnat2.Container();
			const mainViewer = new eduAnat2.Container( sideViewer );
			sideViewer.setMainViewer( mainViewer );
			container.add( mainViewer );
			container.add( sideViewer );
			sideViewer.exclude();
			const toLoad = getParameter( 'fichiers' );

			if ( toLoad ) {

				let anatCount = -1;
				let funcCount = -1;
				const containers = [ mainViewer, sideViewer];
				const allFiles = {};

				await desk.FileSystem.traverseAsync(
					eduAnat2.Quircks.getInstance().anaPedaRoot, f => {
						allFiles[ f.split( "/" ).pop() ] = f;
					} );

				const files = toLoad.split( ',' );

				if ( files.filter( f => f.endsWith( ".anat.nii.gz" ) ).length > 1 ) {

					mainViewer.compareButton.fireEvent( "execute" );

				}

				for ( let file of files ) {

					const path = allFiles[ file ];

					if ( !path ) {

						alert( 'Erreur : fichier ' + file + 'inconnu' );
						continue;

					}

					if ( file.endsWith( ".anat.nii.gz" ) ) {

						anatCount++;
						if ( anatCount > 1 ) {

							alert( "trop d'images à charger!" );
							return;

						}

						funcCount = -1;
						await containers[ anatCount ].addAnatFile( path );

					} else if ( file.endsWith( ".fonc.nii.gz" ) ) {

						funcCount++;
						if ( funcCount > 2 ) {
							alert( "trop de calques functionnels!" );
							return;
						}

						const anatContainer = containers[ anatCount ];
						const funcContainer = anatContainer.funcLayers[ funcCount ];

						await funcContainer.addFuncFile( path, () => {}, () => {},
							containers[ anatCount ].volumeCenter);

						const parent = funcContainer.getLayoutParent();
						try { parent.remove(funcContainer); }
						catch ( e ) {console.log( e )};
						parent.add(funcContainer, {flex:1});
						funcContainer.show();

					}

				}

			}

			try {
				require( "electron" ).ipcRenderer.send( 'qx-ready' );
			} catch ( e ) {}

		}

	}

} );
