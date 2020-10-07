
/**
 * @ignore (chroma.*)
 * @ignore (fetch)
 * @ignore (performance.*)
 * @ignore (process.*)
 * @ignore (require)
 * @ignore (THREE.*)
  * @ignore (_*)
 */


qx.Class.define("eduAnat2.Container", {
    extend: qx.ui.container.Composite,

    /**
     * constructor
     */
    construct: function(sideViewer) {
	    this.base(arguments);

	    //hack to include
	    new desk.ProgressBar();

	    this.__sideViewer = sideViewer;
	    
	    //if (sideViewer) {
	    ///  this.__backgroundColor = "rgb(248, 252, 247)";
	    //} else {
	    //  this.__backgroundColor = "rgb(252, 247, 248)";
	    //}


	    this.__backgroundColor = "rgb(249, 250, 248)";
	      
	      
	    var layout = new qx.ui.layout.HBox();
        layout.setSpacing(1);

        this.setLayout(layout);

        this.createUI();
        this.removeAll();
    },

    destruct: function() {

    },

    events: {

    },

    properties: {
		  mainViewer : { init : null}
    },

    members: {
        __MPR: null,
        __meshViewer: null,
        __backgroundColor : "white",

        __volumeAnat: null,
        __mesh3DModel : null,

		__aboutWindow : null,

        __buttonOpenAnat: null,
        __buttonOpenFunc: null,
        __buttonCloseAll : null,

        __menu : null,
        __burger:null,
        __subMenuAnat: null,
        __subMenuFunc: null,
        __subMenuButtons : null,

        __collapseButton : null,

        __IRMAnatName : null,
        __anatButtonMeta : null,

        __contrastSlider : null,
        __brightnessSlider : null,

        __colors : null,
        __widthMenu : 220,

        __sideViewer : null,

        /**
         * create UI
         */
        createUI: function() {
            var that = this;
            var MPR = this.createMPR();
			const scroll = this.__scroll = new qx.ui.container.Scroll();
            var menu = this.__menu = this.createMenu();
            scroll.add( menu );
            this.add(scroll, { flex:0 });

            //this.__collapseButton = this.createCollapseButton();
            //this.add(this.__collapseButton, { flex: 0 });

            this.add(MPR, { flex: 6 });

            this.__buttonOpenFunc.addListener("execute", function () {
                var target = _.find(that.__subMenuFunc, function (o) { return !o.volumeFunc;});
                
                if (target === undefined) {
                    var index = require('electron').remote.dialog.showMessageBox({
                      type : "warning",
                      title : "Echec de l'ouverture d'un nouveau calque",
                      message : "3 calques sont déjà ouverts, supprimer un calque afin de pouvoir en ouvrir un autre.",
                      buttons : ['Ok']
                    });
                } else {
                  target.selectFuncFile(function () {
                      //Before
                    window.setTimeout(function() {
                        that.__buttonOpenAnat.setEnabled(false);
                        that.__buttonOpenFunc.setEnabled(false);
                    }, 1);

                  }, function() {
                        //Show and move to the end
                      var parent = target.$$parent;
                      parent.remove(target);
                      parent.add(target, {flex:1});
                      target.show();
                  
                      //After
                      that.__buttonOpenFunc.setEnabled(true);
                      that.__buttonOpenAnat.setEnabled(true);
                      that.__buttonCloseAll.setEnabled(true);
                  }, that.volumeCenter);
                }
                
                /*

                if (!that.__subMenuFunc[0].volumeFunc && !that.__subMenuFunc[1].volumeFunc) {
                    //Aucun calque ouvert
                    target = that.__subMenuFunc[0];
                }
                var dialog = require('electron').remote.dialog;

                if (that.__subMenuFunc[0].volumeFunc && !that.__subMenuFunc[1].volumeFunc) {
                    //Calque ouvert sur le 1er slot
                    var index = dialog.showMessageBox({
                      type : "question",
                      title : "Ouverture d'un calque fonctionnel",
                      message : "Ajouter un second calque ou remplacer l'actuel?",
                      buttons : ['Ajouter', 'Remplacer','Annuler'],
                      defaultId : 2
                    });

                    if (index == 2) return;

                    if (index == 1) target = that.__subMenuFunc[0];
                      else target = that.__subMenuFunc[1];
                }

                if (!that.__subMenuFunc[0].volumeFunc && that.__subMenuFunc[1].volumeFunc) {
                    //Calque ouvert sur le 1er slot
                    var index = dialog.showMessageBox({
                      type : "question",
                      title : "Ouverture d'un calque fonctionnel",
                      message : "Ajouter un second calque ou remplacer l'actuel?",
                      buttons : ['Ajouter', 'Remplacer','Annuler'],
                      defaultId : 2
                    });

                    if (index == 2) return;

                    if (index == 1) target = that.__subMenuFunc[1];
                      else target = that.__subMenuFunc[0];
                }

                if (that.__subMenuFunc[0].volumeFunc && that.__subMenuFunc[1].volumeFunc) {
                  //Calque ouvert sur le 1er slot
                  var index = dialog.showMessageBox({
                    type : "question",
                    title : "Ouverture d'un calque fonctionnel",
                    message : "Remplacer quel calque fonctionnel?",
                    buttons : ['Remplacer le 1er', 'Remplacer le 2ème','Annuler'],
                    defaultId : 2
                  });

                  if (index == 2) return;

                  if (index == 1) target = that.__subMenuFunc[1];
                    else target = that.__subMenuFunc[0];
                }

  */
            });
        },

        createMenu: function() {

            var that = this;
            //Menu container
            var layout = new qx.ui.layout.VBox();
            layout.setSpacing(10);
            var container = new qx.ui.container.Composite(layout);
            
            
            container.set({
                width: this.__widthMenu+50,
                backgroundColor: this.__backgroundColor
            })
            container.setPadding(5);
            //container.setPaddingRight(0);

            //container.add(new qx.ui.core.Widget().set({height:1, backgroundColor:"gray"}));
            
            var burger = this.__burger = new qx.ui.basic.Image("eduAnat2/menu_left.png");
            burger.setAlignX("right");
            burger.setCursor("pointer");
            var tooltip = new qx.ui.tooltip.ToolTip("Réduire le menu");
            burger.setToolTip(tooltip);
            
            container.add(burger);
            var menuVisible = true;
            var phantom = new qx.ui.core.Widget();
            
            phantom.setHeight(32);
            
            //that.__sideViewer.isVisible()
            
            burger.addListener("click", function () {
                if (menuVisible) 
                { //Hide menu
                  menuVisible = false;
                  burger.getToolTip().setLabel("Afficher le menu");
                  
                  if (that.__sideViewer.isVisible())
                  { //compare mode
                    burger.setSource("eduAnat2/menu_top.png");
                    that.__scroll.exclude();
                    that.__sideViewer.getChildren()[1].exclude();
                    that.add(burger);
                    that.__sideViewer.add(phantom);
                  }
                  else 
                  { //single mode
                    burger.setSource("eduAnat2/menu_right.png");  
                    that.__scroll.exclude();
                    that.addAt(burger, 0); 
                  }
                }
                else 
                { // Show menu
                  menuVisible = true;
                  burger.getToolTip().setLabel("Réduire le menu");
                  if (that.__sideViewer.isVisible())
                  { //compare mode
                    burger.setSource("eduAnat2/menu_bottom.png");
                    that.__scroll.show();
                    that.remove(burger);
                    that.__menu.add(burger);
                    that.__sideViewer.getChildren()[1].show();
                    that.__sideViewer.remove(phantom);
                  }
                  else
                  { //single mode
                    burger.setSource("eduAnat2/menu_left.png");
                    that.__scroll.show();
                    that.remove(burger);
                    that.__menu.addAt(burger, 0);
                  }
                }
                
                
                
            });
            
            
            
            
            
            
            
            /*
            
            
            burger.addListener("click", function () {
                if (menuVisible) {
                    burger.getToolTip().setLabel("Afficher le menu");
                    if (!that.__sideViewer) {
                      that.getChildren()[1].exclude();
                      that.add(burger);
                      that.getMainViewer().getChildren()[1].exclude();
                      burger.setSource("resource/eduAnat2/menu_top.png");                      
                      that.getMainViewer().add(phantom);
                      
                    } else {
                      burger.setSource("resource/eduAnat2/menu_right.png");                      
                      that.__menu.exclude();
                      that.addAt(burger, 0);
                    }
                    burger.setPadding(5);
                    menuVisible = false;
                } else {
                    menuVisible = true;
                    burger.getToolTip().setLabel("Réduire le menu");
                    if (!that.__sideViewer) {
                      burger.setSource("resource/eduAnat2/menu_bottom.png");
                      that.getChildren()[1].show();
                      that.remove(burger);
                      that.getChildren()[1].add(burger);
                      that.getMainViewer().getChildren()[1].show();
                      that.getMainViewer().remove(phantom);
                    } else {
                      burger.setSource("resource/eduAnat2/menu_left.png");
                      that.__menu.show();
                      that.remove(burger);
                      that.__menu.addAt(burger, 0);
                    }
                    burger.setPadding(0);
                }
            });
            
            */
            
            container.add(new qx.ui.core.Spacer(), {flex: 1});

            this.__subMenuButtons = this.createSubMenuButtons();
            container.add(this.__subMenuButtons);

            container.add(new qx.ui.core.Spacer(), {flex: 1});
              
            var scroll = new qx.ui.container.Scroll();
            var target = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({spacing:20}));
            scroll.add(target);
            
            this.__subMenuAnat = this.createSubMenuAnat();
            target.add(this.__subMenuAnat);
            
            
            this.__subMenuFunc = this.funcLayers = [];
            this.__subMenuFunc[0] = new eduAnat2.FuncLayer(this.__MPR, this.__meshViewer);
            target.add(this.__subMenuFunc[0], {flex: 1});
            this.__subMenuFunc[1] = new eduAnat2.FuncLayer(this.__MPR, this.__meshViewer);
            target.add(this.__subMenuFunc[1], {flex: 1});
            this.__subMenuFunc[2] = new eduAnat2.FuncLayer(this.__MPR, this.__meshViewer);
            target.add(this.__subMenuFunc[2], {flex: 1});
            
            container.add(scroll);
            
            container.add(new qx.ui.core.Spacer(), {flex: 1});

            if (that.__sideViewer) {
                container.add(this.createAbout());
            }

            return container;
        },


        alert : function (message, title, option) {
            // create the window instance
            var root = qx.core.Init.getApplication().getRoot();

            if (title === undefined) title = this.tr("Erreur : type de fichier");

            var win = new qx.ui.window.Window( title );
            win.setLayout(new qx.ui.layout.VBox(10));

            win.set({
                width : option.width || 400,
                alwaysOnTop : true,
                showMinimize : false,
                showMaximize : false,
                centerOnAppear : true,
                modal : true,
                movable : false,
                resizable : false,
                allowMaximize : false,
                allowMinimize : false
            });

            var label = new qx.ui.basic.Label(message);

            label.set({rich: true, wrap : true});

            // label to show the e.g. the alert message
            
            var scroll = new qx.ui.container.Scroll().set({maxHeight:600});
            
            win.add(scroll);
             
            scroll.add(label);

            // "ok" button to close the window
            var alertBtn = new qx.ui.form.Button("OK");

            root.add(win);

            alertBtn.addListener("execute", win.close.bind(win));

            win.add(alertBtn);

            alertBtn.setMarginLeft(100);
            alertBtn.setMarginRight(100);

            win.open();

        },

		getAboutWindow : async function () {

			if ( this.__aboutWindow ) return this.__aboutWindow;
			const version = await eduAnat2.Quircks.getVersion();
			const buildDate = await ( await fetch( 'resource/eduAnat2/buildDate.txt' ) ).text();

			var txt = this.tr( "A propos de " )	+ " EduAnat2 v" + version;
            var win = this.__aboutWindow = new qx.ui.window.Window( txt );

            win.set({
                width : 750,
                height : 600,
                alwaysOnTop : true,
                showMinimize : false,
                showMaximize : false,
                centerOnAppear : true,
                //modal : true,
                movable : false,
                allowMaximize : false,
                allowMinimize : false,
                allowClose : true,
                resizable : false

            });

            win.setLayout(new qx.ui.layout.VBox(10));

            var scroll = new qx.ui.container.Scroll().set({maxHeight:500});
            var scrollContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({spacing:20}));
            scroll.add(scrollContainer);
            win.add(scroll);

            scrollContainer.add( new qx.ui.basic.Label([
                "<h3>EduAnat2</h3><em>Version " + version + " " + buildDate + "</em><br>",
                "EduAnat2 est un visualiseur 3D conçu pour enseigner les neurosciences et l’anatomie. EduAnat2 utilise la banque d’images AnaPeda spécialement développée pour des usages pédagogiques.",
                "",
                "<u>Avertissement :</u> ",
                "EduAnat2 est uniquement destiné à un usage pédagogique. Il n’est pas destiné à un usage médical ou auto médical. Nous déclinons toute responsabilité en cas d'utilisation incorrecte du logiciel.",
                "",
                "<u>Contributeurs :</u> ",
                "Rémi Agier",
                "Sandrine Beaudin",
                "Julien Cartier",
                "Philippe Cosentino",
                "Philippe Daubias",
                "Françoise Morel-Deville",
                "Emmanuel Seiglan",
                "Catherine Simand",
                "Sébastien Valette",
                "",
                "<u>Soutiens :</u>",
                "EduAnat2 a reçu le soutien financier  des LabEx Cortex et LabEx Primes de l’Université de Lyon, de l’Institut français de l’éducation et de l’Ecole normale supérieure de Lyon.",
                "",
                "<u>Information de licence :</u>",
                "Eduanat2 est basé sur l'infrastructure DESK (<a href=\"https://www.creatis.insa-lyon.fr/~valette/desk.html\">https://www.creatis.insa-lyon.fr/~valette/desk.html</a>) dont le code source est distribué sous licence CeCILL-B (BSD-compatible).",
                "",
                "<a>Informations pédagogiques :</a>",
                "<a href=\"http://acces.ens-lyon.fr/acces/thematiques/neurosciences/outils-numeriques\">http://acces.ens-lyon.fr/acces/thematiques/neurosciences/outils-numeriques",
                "",
              ].join('<br>') ).set({
                rich : true
            }) );
            
            var layout = new qx.ui.layout.HBox();
            layout.setSpacing(5);
            var logos = new qx.ui.container.Composite(layout);

            //logos.add(new qx.ui.core.Spacer(), {flex: 1});
            var im = new qx.ui.basic.Image("eduAnat2/logo/ife.jpg");
            im.set({scale:true});
            logos.add(  im);
            
            im = new qx.ui.basic.Image("eduAnat2/logo/ens.jpg");
            im.set({scale:true});
            logos.add(  im);
            
            im = new qx.ui.basic.Image("eduAnat2/logo/labexCortex.png");
            im.set({scale:true});
            logos.add(  im);
            
            
            im = new qx.ui.basic.Image("eduAnat2/logo/labexPrimes.png");
            im.set({scale:true});
            logos.add( im);
            scrollContainer.add(logos);
            // "ok" button to close the window
            var alertBtn = new qx.ui.form.Button("OK");
            alertBtn.addListener("execute", win.close.bind(win));
            win.add( alertBtn );
            qx.core.Init.getApplication().getRoot().add(win, {left:20, top:20});
			return win;

		},

        createAbout : function () {

			var txt = this.tr( "A propos de " )	+ " EduAnat2";

			const button = new qx.ui.form.Button( txt, "eduAnat2/about.png" )
				.set( { decorator: null } );

			eduAnat2.Quircks.getVersion().then( v =>
				button.setLabel( txt + " v " + v ) );

            button.addListener("execute", async () => {

				( await this.getAboutWindow() ).open();

			});

            return button;
        },


        profiling : function (volume) {
                var slicer = volume.getUserData("slicer").slicer;
                var prop = volume.getUserData("slicer").properties;
                console.log(prop);
                var dir = 0;
                var slice = 0;


                var t0 = performance.now();
                var sum = 0;

              function prof(dir) {
                slicer.generateSlice([slice, dir], function () {
                  slice++;
                  if (slice < prop.dimensions[dir])
                    this.profiling(dir, slice);
                  else {
                    var t1 = performance.now() - t0;
                    slice = 0;
                    t0 = performance.now();
                    sum +=t1;
                    console.log("PERFORMANCE " + dir + " (ns) : ", 1000*1000*t1/prop.dimensions[dir]/ prop.dimensions[(dir+1)%3]/ prop.dimensions[(dir+2)%3]);

                    console.log("PERFORMANCE " + dir + " (ms) : ", t1/prop.dimensions[dir]);
                    if (dir < 2) prof(dir+1);
                    else
                      console.log("end, total : ", sum);
                  }

                });
              }

              setTimeout(function () {
                  prof(0);
              }, 5000);

        },

		selectAnatFile : async function() {

			try {

				const selection = await eduAnat2.Quircks.selectFile();
				if ( selection.canceled ) return;
				await this.addAnatFile( selection.file );

			} catch ( e ) {

				console.warn ( e );

			}

		},

        addAnatFile: async function( file ) {

			let local;
			let fileName = file;

			if ( file.name ) {

				fileName = file.name;
				local = file;

			}

            const name = fileName.split( '/' ).pop();
			console.log( name );

            if (name.substr(name.length -7) !== ".nii.gz") {


					alert( "Erreur : ne sont acceptés que les fichiers Nifti compressés (.nii.gz)." );

/*                dialog.showMessageBox({
                  type : "error",
                  title : "Erreur : type de fichier",
                  message : "Ne sont acceptés que les fichiers Nifti compressés (.nii.gz).",
                  buttons : ['Ok']
                });
*/
                return;
            }

            this.removeAll();
            this.openedFile = name;

            window.setTimeout( () =>  this.__buttonOpenAnat.setEnabled(false) , 1);

			let fixedFile = file;

			let opts = {
                slicer: true,
                worker: false,
                linearFilter : true
            };

			if ( !local ) {

				const flip = await eduAnat2.Quircks.flipVolume( fileName );
				fixedFile = flip.file;
				opts = Object.assign( opts, flip.opts );
				opts.slicer = eduAnat2.Quircks.slicer;
				opts.format = eduAnat2.Quircks.anatImagesFormat;

			}

            const volume = await this.__MPR.addVolumeAsync( fixedFile, opts );
			this.__volumeAnat = volume;
			volume.setUserData("path", fileName );
/*
			that.__anatButtonMeta.exclude();
			that.loadMeta(volume, function (err, meta) {
			  if (err === null) { //show info button
				that.__anatButtonMeta.show();
			  }
			  else { //show info button
				that.__anatButtonMeta.exclude();
			  }
			});
*/

			var volSlice = this.__MPR.getVolumeSlices(volume);
			var meshes = this.__meshViewer.attachVolumeSlices(volSlice);

			this.__IRMAnatName.setValue(name.split(".")[0]);
			this.__buttonOpenFunc.setEnabled(true);
			this.__buttonOpenAnat.setEnabled(true);
			this.__subMenuAnat.show();

			this.__buttonCloseAll.setEnabled(true);
			var bbox = new THREE.Box3();
			meshes.forEach( mesh => bbox.expandByObject( mesh ) );
			this.volumeCenter = bbox.getCenter( new THREE.Vector3() ).toArray();

			this.resetMeshView();
			var group = new THREE.Group();
			this.__meshViewer.addMesh(group);

			var center = bbox.getCenter( new THREE.Vector3() );
			var l = new THREE.Vector3().copy(bbox.max).sub(bbox.min);
			var maxSize = Math.max(l.x, l.y, l.z);

			//var size = 25;
			var size = 0.2*maxSize;
			var sSize = 0.5 * size;

			group.add( this.createSprite("droite", sSize, new THREE.Vector3(bbox.max.x+size, center.y, center.z)) );
			group.add( this.createSprite("gauche", sSize, new THREE.Vector3(bbox.min.x-size, center.y, center.z)) );
			group.add( this.createSprite("ventre", sSize, new THREE.Vector3(center.x, bbox.max.y+size, center.z)) );
			group.add( this.createSprite("dos",    sSize, new THREE.Vector3(center.x, bbox.min.y-size, center.z)) );
			group.add( this.createSprite("avant",  sSize, new THREE.Vector3(center.x, center.y, bbox.max.z+size)) );
			group.add( this.createSprite("arrière",sSize, new THREE.Vector3(center.x, center.y, bbox.min.z-size)) );

			//Update Zoom Limite
			this.__MPR.getViewers().concat(this.__meshViewer).forEach(function (viewer) {
			  viewer.getControls().setMinZoom(0.05*maxSize);
			  viewer.getControls().setMaxZoom(10*maxSize);
			});

			let meshPath;
			if ( local ) return;

			if (name.substr(name.length -12) == ".anat.nii.gz") {
				meshPath = fileName.substr(0, fileName.length-12) + ".stl";
			}
			else if (name.substr(name.length -7) == ".nii.gz") {
			    meshPath = fileName.substr(0, fileName.length-7) + ".stl";
			}

			var oReq = new XMLHttpRequest();
			oReq.responseType = "arraybuffer";
			oReq.onload = res => {
			   if ( oReq.status != 200 ) return;
			   this.addMesh(oReq.response, volume);
			};
			oReq.open("get", eduAnat2.Quircks.getFileURL( meshPath ), true);
			oReq.send();

        },



        addMeshFile: function(evt) {

            var file = evt.getData();
            var name = file.getBrowserObject().name;

            if (name.substr(name.length -4) !== ".stl") {
                require('electron').remote.dialog.showMessageBox({
                  type : "error",
                  title : "Erreur : type de fichier",
                  message : "Ne sont acceptés que les maillages au format .stl",
                  buttons : ['Ok']
                });

                return;
            }

            this.removeMesh();

            var reader = new FileReader();
            reader.onload = e => this.addMesh( e.target.result );
            reader.readAsArrayBuffer(file.getBrowserObject());

        },

        addMesh : function (arrayBuffer, volume) {

            var loader = new THREE.STLLoader();
            var geometry = loader.parse( arrayBuffer );

            //https://stackoverflow.com/questions/35843167/three-js-smoothing-normals-using-mergevertices
            var tempGeo = new THREE.Geometry().fromBufferGeometry(geometry);
            tempGeo.mergeVertices();
            // after only mergeVertices my textrues were turning black so this fixed normals issues
            tempGeo.computeVertexNormals();
            tempGeo.computeFaceNormals();
            geometry = new THREE.BufferGeometry().fromGeometry(tempGeo);

            //Rendering BackSide & Scale -1 pour être raccord avec les vues (hack : inversion des normales)
            var material = new THREE.MeshPhongMaterial( {
                  color: 0xff5533,
                  specular: 0x111111,
                  shininess: 50,
                  transparent : true,
                  opacity : 0.7,
                  side: THREE.FrontSide } );

            var mesh = new THREE.Mesh( geometry, material );
            mesh.renderOrder = 4;

            mesh.scale.set(-1, 1, 1);

            var slicer = this.__volumeAnat.getUserData('slicer');
            if ( slicer ) {
				const prop = slicer.properties
				var offsetX = prop.dimensions[0] * prop.spacing[0];
				mesh.position.set(offsetX, 0, 0);
		} else {

			const volumeSlice = this.__MPR.getVolumeSlices( volume )[ 0 ];
			const spacing = volumeSlice.getSpacing();
			const dimensions = volumeSlice.getDimensions();
			const origin = volumeSlice.getOrigin();
			mesh.geometry.computeBoundingBox();
			const meshCenter = mesh.geometry.boundingBox.getCenter( new THREE.Vector3() ).toArray();

			for ( let i = 0; i < 3; i++ ) {

				const center = origin[ i ] +	spacing[ i ] * 0.5 * dimensions[ i ];
				const length = spacing[ i ] * dimensions[ i ];
				const diff = Math.round( 2 * ( center - meshCenter[ i ] ) / length );
				mesh.position.setComponent( i, 0.5 * length * diff );

			}

			mesh.position.x += ( dimensions[ 0 ]*spacing[ 0 ] );

			const finalBox = new THREE.Box3().expandByObject( mesh );
			for ( let i = 0; i < 3; i++ ) {

				const boxMin = finalBox.min.getComponent( i );
				const boxMax = finalBox.max.getComponent( i );
				const meshCoord = mesh.position.getComponent( i );
				const max = origin[ i ] + spacing[ i ] * dimensions[ i ];

				if ( boxMin < origin[ i ] ) {

					mesh.position.setComponent( i, meshCoord
						+ origin[ i ] - boxMin );

				}

				if ( boxMax > max ) {

					mesh.position.setComponent( i, meshCoord
						+ max - boxMax );

				}


			}

		}


            //mesh.flipSided = true;
            //flip every vertex normal in mesh by multiplying normal by -1
          //  for(var i = 0; i<mesh.geometry.attributes.normal.array.length; i++) {
          //      mesh.geometry.attributes.normal.array[i] = -mesh.geometry.attributes.normal.array[i];
          //  }

            mesh.material.needsUpdate = true;

            mesh.geometry.attributes.normal.needsUpdate = true; // required after the first render
            mesh.geometry.normalsNeedUpdate = true;

            this.__meshViewer.addMesh( mesh );
            this.__mesh3DModel = mesh;
            this.resetMeshView();
            this.__buttonCloseAll.setEnabled(true);
        },

        removeMesh : function () {
            /* TODO : remove mesh from viewer and dispose memory */
            if (this.__mesh3DModel) {
                this.__meshViewer.removeMesh(this.__mesh3DModel);
                this.__mesh3DModel = undefined;
            }
        },

        createCollapseButton: function() {
            var button = new qx.ui.basic.Image("eduAnat2/left.png");
            button.set({
                width: 16,
                scale:true
            });
            var layout = new qx.ui.layout.VBox();
            layout.setAlignY("middle");
            var container = new qx.ui.container.Composite(layout);
            container.add(button);
            var that = this;
            button.addListener("click", function() {
                var target = that.getChildren()[0];
                if (target.isVisible()) {
                    target.exclude();
                    button.setSource("eduAnat2/right.png");
                } else {
                    target.show();
                    button.setSource("eduAnat2/left.png");
                }
            });
            return container;
        },

		createMPR: function() {

			//MPR container
			var options = {
				slicer: true,
				alwaysDisplaySlider: true,
				zoomOnWheel: true,
				maxZoom:2000,
				minZoom:30
			};

			var MPR = new desk.MPRContainer(null, options);

			for ( let sliceView of MPR.getViewers() )
				sliceView.getRightContainer().getChildren()[1].setOpacity( 1 ) ;

			var meshViewer = this.__meshViewer = new desk.SceneContainer({
				noOpts:true,
				sliceOnWheel:false,
				maxZoom:2000,
				minZoom:30,
				cameraFov : 35});

			var button = new qx.ui.form.Button(null, "eduAnat2/reset.png").set({decorator: null});
			meshViewer.add (button, {right : 3, bottom : 3});

			button.addListener( "execute", function () {
				this.resetMeshView();
			}, this );


			MPR.setCustomContainer(meshViewer);
			// screenShot for sliceView;
			var sButton = 0;

			try { // create snapshot button only for electron version for now...

				require( 'electron' );
				// screenshot button for mesh viewer;
				var screenshot = new qx.ui.form.Button(null, "eduAnat2/screenshot.png").set({decorator: null});
				meshViewer.add (screenshot, {right : 38, bottom : 3});

				screenshot.addListener("execute", async function () {
					eduAnat2.Quircks.capture( MPR );
				});

				MPR.addListener( "switchFullScreen", function ( e ) {

					var sliceView = e.getData();
					if ( !sliceView ) {

						if ( sButton ) sButton.destroy();
						return;

					}

					sButton = new qx.ui.form.Button(null, "eduAnat2/screenshot.png");
					sButton.set({opacity: 0.75, padding: 2});
					sliceView.getRightContainer().addAt(sButton, 2);

					sButton.addListener("execute", function () {
						eduAnat2.Quircks.capture( sliceView );
					});

				} );


			} catch ( e ) {};

			this.__MPR = MPR;
			return MPR;

        },

        link : function (target) {
            this.__MPR.link(target.__MPR);
            this.__meshViewer.link(target.__meshViewer);
        },

        unlink : function () {
            this.__MPR.__viewers.forEach (function (viewer) {
                viewer.unlink();
            });
            this.__meshViewer.unlink();
        },


        createSubMenuButtons: function() {
            var that = this;

            var layout = new qx.ui.layout.VBox();
            var container = new qx.ui.container.Composite(layout);

            layout.setSpacing(10);
            container.setPadding(10);
            container.setPaddingRight(0);

            /* Button Open Anat */

            var buttonOpenAnat = this.__buttonOpenAnat = new qx.ui.form.Button(this.tr("Ouvrir une image anatomique"), 'eduAnat2/anat.png');

            buttonOpenAnat.getChildControl("label").setAllowGrowX(true);
            buttonOpenAnat.getChildControl("label").setTextAlign("left");

            buttonOpenAnat.addListener("execute", this.selectAnatFile, this);

            container.add(buttonOpenAnat);

            var buttonOpenFunc = this.__buttonOpenFunc = new qx.ui.form.Button(this.tr("Ouvrir un calque fonctionnel"), 'eduAnat2/func.png');

            buttonOpenFunc.getChildControl("label").setAllowGrowX(true);
            buttonOpenFunc.getChildControl("label").setTextAlign("left");

            container.add(buttonOpenFunc);

            /* Button Close all */
            var buttonCloseAll = this.__buttonCloseAll = new qx.ui.form.Button(this.tr("Fermer cette image"), 'eduAnat2/close.png');
            buttonCloseAll.getChildControl("label").setAllowGrowX(true);
            buttonCloseAll.getChildControl("label").setTextAlign("left");
            buttonCloseAll.addListener("execute", this.removeAll.bind(this));
            buttonCloseAll.setEnabled(false);
            container.add(buttonCloseAll);



            /* Button compare */
            if (that.__sideViewer) {
                var buttonCompare = this.compareButton = new qx.ui.form.Button(this.tr("Comparer deux images"), 'eduAnat2/compare.png');
                buttonCompare.getChildControl("label").setAllowGrowX(true);
                buttonCompare.getChildControl("label").setTextAlign("left");
            
                buttonCompare.addListener("execute", function () {
                    if (that.__sideViewer.isVisible()) {
                        that.__sideViewer.exclude();
                        buttonCompare.setLabel(that.tr("Comparer deux images"));
                        //that.unlink();

                        that.switchMenu(true);
                        that.__sideViewer.switchMenu(true);

                    } else {
                        that.__sideViewer.__MPR.resetMaximize();
                        that.__sideViewer.show();
                        buttonCompare.setLabel(that.tr("Fermer la comparaison"));
                        //that.link(that.__sideViewer);

                        that.switchMenu(false);
                        that.__sideViewer.switchMenu(false);

                    }
                });

                container.add(buttonCompare);
            }

            var buttonShare = this.__buttonShare = new qx.ui.form.Button(this.tr("Partager via un lien"), 'eduAnat2/share.png' );
            buttonShare.getChildControl("label").setAllowGrowX(true);
            buttonShare.getChildControl("label").setTextAlign("left");
            container.add(buttonShare);
            buttonShare.addListener( 'execute' , function () {

				const mainViewer =  this.getMainViewer() || this;
				console.log( mainViewer.openedFile, mainViewer.__sideViewer.openedFile )

				const files = [];


				for ( let viewer of [ mainViewer, mainViewer.__sideViewer ] ) {

					if ( !viewer.isVisible() ) continue;
					if ( !viewer.openedFile ) continue;
					files.push( viewer.openedFile );

					const container = viewer.funcLayers[ 0 ].getLayoutParent();

					for ( let layer of container.getChildren() ) {

						if ( !layer.isVisible() ) continue;
						if ( !layer.openedFile ) continue;
						files.push( layer.openedFile );

					}

				}

				const h = window.location.href.split( "?" )[ 0 ] + "?fichiers=" + files.join( ',' );

				const win = new qx.ui.window.Window( "Lien pour partage" );
				win.setLayout( new qx.ui.layout.VBox() );
				const text = "Ce lien vous permet de charger automatiquement les images actuelles : ";
				const label = new qx.ui.embed.Html(
					'<P><a href="' + h + '"> ' + text + "</a></p>"
					+ '<p><a class="dont-break-out" href="' + h + '"> ' + h + "</a></p>"
					+" <p>Note : il est possible de copier le lien avec un clic droit.<p>");
				label.setNativeContextMenu( true );
				label.setWidth( 600 );
				label.setHeight( 200 );
				win.add( label, { flex : 1 } );
				win.open();
				win.center();


			}, this );

            return container;

        },

        switchMenu : function (vertical) {
            var layout = vertical ? new qx.ui.layout.HBox() : new qx.ui.layout.VBox();
            this.setLayout(layout);

            this.remove(this.__scroll);

            var menu = this.__menu = new qx.ui.container.Composite(vertical ? new qx.ui.layout.VBox() : new qx.ui.layout.HBox()).set({height:210, backgroundColor: this.__backgroundColor});
			const scroll = this.__scroll = new qx.ui.container.Scroll();
			scroll.add( menu );
            menu.add(new qx.ui.core.Spacer(), {flex: 1});
            menu.add(this.__subMenuButtons);

            var target, parent;
            if (vertical) {
                this.__buttonShare.setVisibility( "visible" );
                menu.setPadding(5);
                
                menu.addAt(this.__burger, 0);
                this.__burger.setSource("eduAnat2/menu_left.png");
                parent = new qx.ui.container.Scroll().set({});
                target = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({spacing:20}));
                parent.add(target, {flex: 1});
            }
            else { //compare mode
                if ( this.__sideViewer ) this.__buttonShare.setVisibility( "excluded" );
                this.__burger.setSource("eduAnat2/menu_bottom.png");
                parent = new qx.ui.container.Scroll().set({ maxHeight: 200 });
                target = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({spacing:10}));

                parent.add(target, {flex: 1});
            }

            target.add(this.__subMenuAnat);
            target.add(this.__subMenuFunc[0]);
            target.add(this.__subMenuFunc[1]);
            target.add(this.__subMenuFunc[2]);


            menu.add(new qx.ui.core.Spacer(), {flex: 1});

            if (parent !== menu) menu.add(parent);

            menu.add(new qx.ui.core.Spacer(), {flex: 1});

            this.addAt(scroll, vertical?0:1);

            if (vertical) 
            {
              menu.add(this.createAbout());
              this.__burger.setAlignY("top");

            }
            else if (this.__sideViewer) 
            {
              this.__burger.setAlignY("middle");
              menu.add(this.__burger);
            }
        },


        createSubMenuAnat: function() {
            var that = this;

            var layout = new qx.ui.layout.VBox();
            var container = new qx.ui.container.Composite(layout).set({
              minWidth:200,
              maxWidth:250
            });

            //container.add(new qx.ui.core.Widget().set({height:1, backgroundColor:"gray"}));

            var titleContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox());

                titleContainer.add(new qx.ui.basic.Label().set({
                    value: "<b>" + this.tr("Image anatomique") + " : </b>",
                    rich: true
                }));

                titleContainer.add(new qx.ui.core.Spacer(), {flex: 1});

/*
                var button_meta = this.__anatButtonMeta = new qx.ui.form.Button(null, 'eduAnat2/info_small.png').set({
                    decorator: null
                });
                titleContainer.add(button_meta);
                button_meta.addListener("execute", function() {
                    that.showMeta(that.__volumeAnat);
                });
*/

            container.add(titleContainer);

            this.__IRMAnatName = new qx.ui.basic.Label().set({
                rich: true,
                wrap : true,
                maxWidth:250
            });

            this.__IRMAnatName.setAllowGrowX(false);

            container.add(this.__IRMAnatName);


            /* Gestion du contraste */
            var contrastLabel = new qx.ui.basic.Label(this.tr("Contraste") + " : <b>1.00</b>").set({rich:true});
            container.add(contrastLabel);
            var contrastSlider = this.contrastSlider = new qx.ui.form.Slider();
            contrastSlider.set({
                minimum: -40,
                maximum: 40,
                singleStep: 1,
                backgroundColor:"white"
            });
            contrastSlider.addListener("changeValue", function(e) {
                var value = Math.pow(10, e.getData() / 40);
                contrastLabel.setValue(that.tr("Contraste") + " : <b>" + value.toFixed(2) + "</b>");
                if (that.__volumeAnat) {
                  that.__volumeAnat.getUserData('slices').forEach(function(volumeSlice) {
                      volumeSlice.setContrast(value);
                  });
                }
            });
            container.add(contrastSlider);


            /* Gestion de la luminosité */
            var brightnessLabel = new qx.ui.basic.Label(this.tr("Luminosité") + " : <b>0.5</b>").set({rich:true});
            container.add(brightnessLabel);
            var brightnessSlider = this.brightnessSlider = new qx.ui.form.Slider();
            brightnessSlider.set({
                minimum: 0,
                maximum: 100,
                singleStep: 1,
                value : 50,
                backgroundColor:"white"
            });
            brightnessSlider.addListener("changeValue", function(e) {
                var value = e.getData() / 100;
                brightnessLabel.setValue(that.tr("Luminosité") + " : <b>" + value.toFixed(2)+"</b>");
                if (that.__volumeAnat) {
                  that.__volumeAnat.getUserData('slices').forEach(function(volumeSlice) {
                      volumeSlice.setBrightness((value-0.5)*2 );
                  });
                }
            });
            container.add(brightnessSlider);
            container.add(new qx.ui.core.Spacer(), {flex: 0.5});
            //container.add(new qx.ui.core.Widget().set({height:1, backgroundColor:"gray"}));
            container.add(new qx.ui.core.Spacer(), {flex: 0.5});
            return container;
        },

        showMeta : function (volume) {
            var metadonnees = volume.getUserData("metadonnees");
            var that = this;

            if (!metadonnees) {
              require('electron').remote.dialog.showMessageBox({
                type : "error",
                title : "Erreur",
                message : "Métadonnées indisponibles",
                buttons : ['Ok']
              });
            }

            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(metadonnees,"text/xml");
            var lom = xmlDoc.getElementsByTagName("lom")[0];
            var general = lom.getElementsByTagName("general")[0];
            
            var title       = general.getElementsByTagName("title")[0].childNodes[0].childNodes[0].nodeValue;
            
            
            var description = this.nl2br(general.getElementsByTagName("description")[0].childNodes[0].childNodes[0].nodeValue.trim() );
            

            var contributeursNodeList = lom.getElementsByTagName("lifeCycle")[0].getElementsByTagName("contribute");
            
            var contributeurs = [];
            
            for(var i = 0;i < contributeursNodeList.length; i++)
            {
                contributeurs.push(contributeursNodeList[i].getElementsByTagName("entity")[0].childNodes[0].nodeValue);
            }
                        
            
            var txt = "<h2>"+title+"</h2>"
              + "<h4>Description</h4>" + description + "<br>"
              + "<h4>Contributeurs : </h4>"
              + "<ul>";
              
           contributeurs.forEach(function (contributeur) {
              txt += "<li>" + contributeur + "</li>";
           });
           
           txt += "</ul>";
            
            
            this.alert(txt, "Métadonnées", { width : 800 } );
            
            
        },


        nl2br : function (str, is_xhtml) {
          var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; 
          return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
        },
        
        loadMeta : function (volume, callback) {
            var path = volume.getUserData("path");
            path = path.substr(0, path.length-7) + ".xml";
 
            var oReq = new XMLHttpRequest();
            oReq.onload = function (res) {
               volume.setUserData("metadonnees", this.responseText);
               console.log("HERE !!!");
               callback(null, this.responseText);
            };

            oReq.onerror = function () {
                callback("error");
            };

            oReq.open("get", path, true);
            oReq.send();
        },

        removeAll: function() {
          this.__subMenuFunc[0].removeFunc();
          this.__subMenuFunc[1].removeFunc();
          this.__subMenuFunc[2].removeFunc();

            this.__MPR.removeAllVolumes();
            this.__MPR.resetMaximize();
            if (this.__sideViewer)
              this.__sideViewer.__MPR.resetMaximize();
            this.__meshViewer.removeAllMeshes();

            this.__IRMAnatName.setValue("");

            this.__buttonOpenFunc.setEnabled(false);

            this.__subMenuAnat.hide();

            this.__volumeAnat = undefined;

            this.__buttonCloseAll.setEnabled(false);

            this.contrastSlider.set({value : 0});
            this.brightnessSlider.set({value : 50});


        },

        resetMeshView : function () {
            this.__meshViewer.resetView()
            this.__meshViewer.rotateView(0, -0.5 * Math.PI, 0);
            this.__meshViewer.rotateView(0.75 * Math.PI, 0, 0);
            this.__meshViewer.rotateView(0, 0.1 * Math.PI, 0);
        },

        createSprite : function (text, size, position) {
            if (!size) size = 100;

            var height = 128;

            var canvas = document.createElement('canvas');
            canvas.height = height;


            var context = canvas.getContext("2d");

            context.font = Math.floor(height*0.6) + 'px Helvetica Arial';

            var width = context.measureText(text).width //* height / 10;

            canvas.width = Math.pow(2, Math.ceil(Math.log(width+100) / Math.log(2)));

            var texture = new THREE.Texture(canvas);

            context.clearRect(0, 0, canvas.width, canvas.height);

            context.font = Math.floor(height*0.6) + 'px Helvetica';

            context.fillStyle = "deepskyblue";
            context.fillText(text, (canvas.width-width)/2, height*0.8);
            texture.needsUpdate = true;

            var material = new THREE.SpriteMaterial({map :texture});
            var mesh = new THREE.Sprite(material);

            mesh.position.copy(position); //.add( new THREE.Vector3(size * width/ height /2, size/2, 0 ) );
            mesh.scale.x = size * canvas.width/ height;
            mesh.scale.y = size;
            mesh.transparent = true;
            mesh.renderOrder = 10;

            return mesh;
        }




    }
});
