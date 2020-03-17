
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

			document.getElementById("loading").className = "loading-invisible";

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

			qxRoot.add( container, { width, height : "100%" } );
			const sideViewer = new eduAnat2.Container();
			const mainViewer = new eduAnat2.Container( sideViewer );
			sideViewer.setMainViewer( mainViewer );
			container.add( mainViewer );
			container.add( sideViewer );
			sideViewer.exclude();

			try {
				require( "electron" ).ipcRenderer.send( 'qx-ready' );
			} catch ( e ) {}

		}

	}

} );
