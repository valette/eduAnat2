
/* ************************************************************************

   Copyright: CNRS, INSERM, INSA-Lyon

   License: CeCILL B

   Authors: Rémi Agier, Sebastien Valette

************************************************************************ */

/**
 * @asset(eduAnat2/*)
 * @ignore (require)
 * @ignore (WEBGL.*)
 */

qx.Class.define("eduAnat2.Application", {

	extend : qx.application.Standalone,

	members : {

		main : function() {

			// Call super class
			this.base(arguments);

			// Enable logging in debug variant
			if (qx.core.Environment.get("qx.debug")) {
				// support native logging capabilities, e.g. Firebug for Firefox
				qx.log.appender.Native;
				// support additional cross-browser console. Press F7 to toggle visibility
				qx.log.appender.Console;
			}

			var actions = desk.Actions.getInstance()
			desk.Actions.init( afterActionsInitialized );

			function afterActionsInitialized () {

				//desk.auto = true;
				var qxRoot = qx.core.Init.getApplication().getRoot();
				//qx.locale.Manager.getInstance().setLocale("en");

				if ( !WEBGL.isWebGLAvailable() ) {

					console.log("WebGLUnavalable");
					var win = new qx.ui.window.Window( qxRoot.tr("Erreur : WebGL non supporté") );
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

				var container = new qx.ui.splitpane.Pane( "horizontal" );
				container.getChildControl("splitter").setBackgroundColor( "#C0C0C0" );
				qxRoot.add( container, { width : "100%", height : "100%" } );
				var sideViewer = new eduAnat2.Container();
				var mainViewer = new eduAnat2.Container( sideViewer );
				sideViewer.setMainViewer( mainViewer );
				container.add( mainViewer );
				container.add( sideViewer );
				sideViewer.exclude();
				require( "electron" ).ipcRenderer.send( 'qx-ready' );

			}

		}

	}

} );
