
/* ************************************************************************

   Copyright: CNRS, INSERM, INSA-Lyon

   License: CeCILL B

   Authors: Sebastien Valette

************************************************************************ */

/**
 * @asset(desk/*)
 * @ignore (async)
 * @ignore (async*)
 * @ignore (desk_startup_script)
 * @ignore (desk.auto)
 * @ignore (Promise)
 * @ignore (require)
 * @ignore (Promise.*)
 */

qx.Class.define("eduAnat2.Application",
{
	extend : qx.application.Standalone,

	members :
	{
		/**************************************************************
		 * hack to include qx.ui.list.List in the build
		 **************************************************************/
		main : function() {
			console.log("init?");

			// Call super class
			this.base(arguments);


			// Enable logging in debug variant
			if (qx.core.Environment.get("qx.debug")) {
				// support native logging capabilities, e.g. Firebug for Firefox
				qx.log.appender.Native;
				// support additional cross-browser console. Press F7 to toggle visibility
				qx.log.appender.Console;
			}

			function getParameter( parameterName ) {
				parameterName = parameterName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
				var regex = new RegExp( "[\\?&]" + parameterName + "=([^&#]*)" );
				var results = regex.exec( window.location.href );
				if (results == null) {
					return null;
				} else {
					return results[1];
				}
			}

			this.__promisifyAll();

			var actions = desk.Actions.getInstance()
//			desk.Actions.init(afterActionsInitialized);
			var savedDesk = window.desk;
afterActionsInitialized();
			function afterActionsInitialized () {
				if ( !window.desk.FileSystem ) window.desk = savedDesk; // #BUG this happens whith webpack
				actions.debug("actions initialized!");
				desk.auto = false;
				// first try to automatically launch startup script if it exists
				if (getParameter("noauto")) {
					next();
					return;
				}

				if (typeof desk_startup_script === "string") {
					desk.auto = true;
					desk.FileSystem.executeScript(desk_startup_script);
					return;
				}

				var initScript = 'code/init.js';
				return next();
				desk.FileSystem.exists(initScript, function (err, exists) {
					if (exists) {
						desk.auto = true;
						desk.FileSystem.executeScript(initScript);
					} else {
						next();
					}
				});
			}

			function next() {
				var startupScript = getParameter("script");
				if (startupScript) {
					desk.auto = true;
					desk.FileSystem.executeScript(startupScript);
					return;
				}
				desk.auto = true;
				var qxRoot = qx.core.Init.getApplication().getRoot();
				//qx.locale.Manager.getInstance().setLocale("en");

				if (!WEBGL.isWebGLAvailable()) {
				  console.log("WebGLUnavalable");
					// create the window instance
					var win = new qx.ui.window.Window( qxRoot.tr("Erreur : WebGL non supporté") );
					win.setLayout(new qx.ui.layout.VBox(10));

					win.set({
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
					});


					// label to show the e.g. the alert message
					win.add(new qx.ui.basic.Label(qxRoot.tr("WebGL n'est pas supporté par votre système.")));
					qxRoot.add(win);
					win.open();
					return;
				}

				//var container = new qx.ui.container.Composite(new qx.ui.layout.HBox());
				var container = new qx.ui.splitpane.Pane("horizontal");
				console.log(container);
				container.getChildControl("splitter").setBackgroundColor("#C0C0C0");

				qxRoot.add(container, {width:"100%", height:"100%"});
			//    qxRoot.add(container, {top:0, left:0, bottom:0, right:0, width:"100%", height:"100%"});
				var sideViewer = new eduAnat2.Container();
				var mainViewer = new eduAnat2.Container( sideViewer );

				sideViewer.setMainViewer(mainViewer);

				container.add(mainViewer);
				container.add(sideViewer);
				sideViewer.exclude();
				require("electron").ipcRenderer.send('qx-ready');

				//actions.buildUI();
				//new desk.FileBrowser(getParameter("rootDir"), {standalone : true});
			}
		},

		/**************************************************************
		 * adds promise-based API
		 * @param functions {Array} array of functions to promisify
		 * @param opts {Object} options
		 **************************************************************/
		promisify : function ( functions, opts ) {
			opts = opts || {};
			functions.forEach( function ( func ) {
				var prefixes = func.split('.');
				var name = prefixes.pop();
				var root = prefixes.reduce( function ( previous, current ) {
					return previous[ current ]
				}, window);

				if (!root) {
					console.log("error with " + func);
				}

				if ( opts.members ) {
					root = root.prototype;
				}

				var origin = root[ name ];
				if ( !origin ) {
					console.log( "root : " + root, "name : " + name);
					throw( 'bad function name : ' + func);
				}

				root[ name + "Async" ] = Promise.promisify( origin );
			} );
		},

		/**************************************************************
		 * adds promise-based API : for each function taking a callback as
		 * argument, create a function returning a promise
		 **************************************************************/
		__promisifyAll : function () {

			Promise.promisify = bluebird.promisify;

			var toPromisify = [
				"desk.Actions.execute",
				"desk.Actions.killAction",
				"desk.FileSystem.executeScript",
				"desk.FileSystem.exists",
				"desk.FileSystem.includeScripts",
				"desk.FileSystem.mkdirp",
				"desk.FileSystem.readDir",
				"desk.FileSystem.readFile",
				"desk.FileSystem.readURL",
				"desk.FileSystem.traverse",
				"desk.FileSystem.writeFile",
				"desk.FileSystem.writeCachedFile",
				"desk.FileSystem.writeJSON"
			];

			var membersToPromisify = [
				"desk.MPRContainer.addVolume",
				"desk.SceneContainer.addFile",
				"desk.SceneContainer.addVolume",
				"desk.SceneContainer.loadURL",
				"desk.SliceView.addVolume",
				"desk.MPRContainer.addVolume",
				"desk.ThreeContainer.render"
			];

			this.promisify( toPromisify );
			this.promisify( membersToPromisify, { members : true } );

			desk.SceneContainer.prototype.snapshotAsync = Promise.promisify ( function ( opts, callback ) {
				this.snapshot( Object.assign( {}, opts, { callback : callback } ) );
			} );

			async.mapLimitAsync = function ( arr, limit, iterator ) {
				return new Promise ( function ( resolve, reject ) {
					async.mapLimit( arr, limit, async.asyncify( iterator ), function ( err, res ) {
						if ( err ) {
							reject ( err );
						} else {
							resolve( res );
						}
					});
				});
			};

			async.eachLimitAsync = function ( arr, limit, iterator ) {
				return new Promise ( function ( resolve, reject ) {
					async.eachLimit( arr, limit, async.asyncify( iterator ), function ( err ) {
						if ( err ) {
							reject ( err );
						} else {
							resolve();
						}
					});
				});
			};
		}
	}
});
