/**
 * @ignore (ImageData.*)
 * @ignore (THREE*)
 * @ignore (chroma*)
 * @ignore (require*)
 * @ignore (performance*)
 * @ignore (imgArray*)

 */
qx.Class.define("eduAnat2.FuncLayer", {
	extend: qx.ui.container.Composite,

	/**
	 * constructor
	 */
	construct: function(MPR, meshViewer) {

		this.base(arguments);
		this.__MPR = MPR;
		this.__meshViewer = meshViewer;
		this.setLayout( new qx.ui.layout.VBox() );
		this.createUI();
		this.exclude();

	},

	destruct: function() {

	},

	events: {

	},

	properties: {
		volumeFunc: {
			nullable: true
		}
	},

	members: {
		__MPR: null,
		__meshViewer: null,
		__funcButtonMeta: null,
		__IRMFuncName: null,
		__tresholdSlider: null,
		__meshesFunc: null,
		__colors: null,
		__widthMenu: 220,

		/**
		 * create UI
		 */
		createUI: function() {

			this.set( { minWidth: 200, maxWidth: 250 } );

			const titleContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox());

			titleContainer.add(new qx.ui.basic.Label().set({
				value: "<b>" + this.tr("Functional map") + " : </b>",
				rich: true
			}));

			titleContainer.add(new qx.ui.core.Spacer(), { flex: 1 } );
			/*
			              var button_meta = this.__funcButtonMeta = new qx.ui.form.Button(null, 'resource/eduAnat2/info_small.png').set({
			                  decorator: null
			              });
			              titleContainer.add(button_meta);
			              button_meta.addListener("execute", () => {
			                  this.showMeta(that.volumeFunc);
			              });
			*/
			var button_hide = new qx.ui.form.Button(null, 'eduAnat2/show.png').set({
				decorator: null
			});

			var tooltip = new qx.ui.tooltip.ToolTip( this.tr( "More transparent") );
			button_hide.setToolTip(tooltip);

			titleContainer.add(button_hide);
			var imageVisible = 2;
			button_hide.addListener("execute", () => {
				switch (imageVisible) {

					case 2:
						imageVisible = 1;
						this.__MPR.setVolumeOpacity(this.volumeFunc, 0.25);
						button_hide.getChildControl('icon').setSource('eduAnat2/transparent.png');
						button_hide.getToolTip().setLabel( this.tr( "Hide") );
						break;

					case 1:
						imageVisible = 0;
						this.__MPR.setVolumeOpacity(this.volumeFunc, 0);
						button_hide.getChildControl('icon').setSource('eduAnat2/hide.png');
						button_hide.getToolTip().setLabel( this.tr( "Show" ) );
						break;

					case 0:
						imageVisible = 2;
						this.__MPR.setVolumeOpacity(this.volumeFunc, 0.7);
						button_hide.getChildControl('icon').setSource('eduAnat2/show.png');
						button_hide.getToolTip().setLabel( this.tr( "More transparent") );

				}

			});

			var button_close = new qx.ui.form.Button(null, 'eduAnat2/close_small.png').set({
				decorator: null
			});
			titleContainer.add(button_close);
			button_close.addListener("execute", this.removeFunc.bind(this));

			this.add(titleContainer);

			this.__IRMFuncName = new qx.ui.basic.Label().set({
				rich: true,
				wrap: true
			});

			this.__IRMFuncName.setAllowGrowX(false);

			this.add(this.__IRMFuncName);

			var seuilLabel = new qx.ui.basic.Label(this.tr("Threshold") + " : <b></b>").set({
				rich: true
			});
			this.add(seuilLabel);
			var tresholdSlider = this.__tresholdSlider = new qx.ui.form.Slider();
			tresholdSlider.setBackgroundColor("white");

			tresholdSlider.addListener("changeValue", e => {
				var val = (tresholdSlider.getValue() - tresholdSlider.getMinimum()) / (tresholdSlider.getMaximum() - tresholdSlider.getMinimum()) * 100;
				seuilLabel.setValue(this.tr("Threshold") + " : <b>" + Math.floor(val) + "</b>");

				function updateSlice(slice) {
					slice.material.uniforms.thresholdMin.value = tresholdSlider.getValue() / 100;
				}
				this.volumeFunc.getMeshes().forEach(updateSlice);
				this.__meshesFunc.forEach(updateSlice);
				this.__meshViewer.render();
				this.__MPR.render();
			});

			this.add(tresholdSlider);
			this.add(new qx.ui.basic.Label(this.tr("Color map:")));

			const generateChroma = scale => {
				return imgData => {
					return this.generateChromaLut.apply(undefined, [imgData, scale]);
				}
			};

			const lutArray = [
				generateChroma(chroma.scale(["#00f", "#0ff", "#0f0", "#ff0", "#f00"]).domain([0, 0.333, 0.5, 0.666, 1])),
				generateChroma(chroma.scale("Spectral").domain([1, 0])),
				generateChroma(chroma.scale(["blue", "#eee", "red"]).mode('lrgb')),
				generateChroma(chroma.scale(["black", "green", "white"]).gamma(1 / 2)),
				generateChroma(chroma.scale(["black", "red", "white"]).gamma(1 / 2)),
				generateChroma(chroma.scale(["black", "blue", "white"]).gamma(1 / 2)),
				generateChroma(chroma.scale(["yellow", "orange", "red"])),
				generateChroma(chroma.scale(["black", "red", "yellow", "white"])),
				generateChroma(chroma.scale(["black", "white"]).gamma(1 / 2)),
			];


			const selectBox = new qx.ui.form.SelectBox();

			for ( let generator of lutArray )
				selectBox.add( new qx.ui.form.ListItem("", this.lutImage( generator ) ) );

			selectBox.addListener("changeSelection", e => {
				var index = selectBox.getSelectables().indexOf(e.getData()[0]);
				this.__colors = lutArray[index]();
				if (this.volumeFunc)
					this.__MPR.setVolumeLUT(this.volumeFunc, this.__colors);
			});

			this.add( selectBox );
			this.__colors = this.generateLut();
			selectBox.fireDataEvent( "changeSelection", selectBox.getSelectables() );

		},

		selectFuncFile: async function( center ) {

			const selection = await eduAnat2.Quircks.selectFile(true);
			if (selection.canceled) return false;
			return await this.addFuncFile(selection.file, center);

		},

		addFuncFile: async function(file, center) {

			let local;
			let fileName = file;

			if (file.name) {

				fileName = file.name;
				local = file;

			}

			const name = fileName.split('/').pop();
			this.openedFile = name;
			console.log(name);

			if ( !name.endsWith( ".nii.gz" ) ) {

				alert('Erreur : Ne sont acceptés que les fichiers Nifti compressés (.nii.gz). ');
				/*              dialog.showMessageBox({
				                type : "error",
				                title : "Erreur : type de fichier",
				                message : "Ne sont acceptés que les fichiers Nifti compressés (.nii.gz).",
				                buttons : ['Ok']
				              });
				*/
				return false;
			}

			this.removeFunc();
			let fixedFile = file;

			let opts = {
				slicer: true,
				format: 0,
				worker: false,
				colors: this.__colors,
				linearFilter: true,
				opacity: 0.7,
				postProcessFunction: function(texture, slicer) {
					/*  var prop = slicer.properties;
                var v = prop.scalarBounds[0];
                imgArray = texture.data;
						    for (var i=imgArray.length; i-->0;)
						        if (imgArray[i] === 0.0)
						            imgArray[i] = v;*/
				}
			};

			if (!local) {

				const flip = await eduAnat2.Quircks.flipVolume( fileName );
				fixedFile = flip.file;
				opts = Object.assign(opts, flip.opts);
				opts.center = center;
				opts.slicer = eduAnat2.Quircks.slicer;

			}

			const volume = await this.__MPR.addVolumeAsync(fixedFile, opts);
			const scalarBounds = volume.getSlices()[0]
				.getScalarBounds();

			const prop = { scalarBounds };
			this.volumeFunc = volume;
			volume.setUserData("path", file);
			/*
						  this.__funcButtonMeta.exclude();
						  this.loadMeta(volume, function (err, meta) {
							if (err === null) { //show info button
							  this.__funcButtonMeta.show();
							}
							else { //show info button
							  this.__funcButtonMeta.exclude();
							}
						  });
			*/

			const volumeSlices = volume.getSlices();
			this.__meshesFunc = this.__meshViewer.attachVolumeSlices( volumeSlices, { colorFrame : false });
			for ( let funcMesh of this.__meshesFunc ) funcMesh.renderOrder =1;

			this.__IRMFuncName.setValue(name.split(".")[0]);

			const meshes = volume.getMeshes();
			const slice = volumeSlices[0];
			this.hackShaders(slice, meshes);
			this.hackShaders(slice, this.__meshesFunc);

			this.__tresholdSlider.set({
				minimum: Math.floor(prop.scalarBounds[0] * 100),
				maximum: Math.floor(prop.scalarBounds[1] * 99),
				singleStep: 1,
				value: Math.floor((prop.scalarBounds[0] + prop.scalarBounds[1]) * 50)
			} );

			for ( let target of [...meshes, ...this.__meshesFunc ] )
				target.material.uniforms.thresholdMax.value = prop.scalarBounds[1];

			for ( let slice of 
				[ ...this.volumeFunc.getMeshes(), ...this.__meshesFunc ] ) {
				slice.material.uniforms.thresholdMin.value = this.__tresholdSlider.getValue() / 100;

			}
				
			this.__meshViewer.render();
			this.__MPR.render();

			window.setTimeout( () => {
				if (this.$$parent.$$parent.name == "qx.ui.core.scroll.ScrollPane") {
					this.$$parent.$$parent.scrollByY(10000);
				}
			}, 50);

			return true;
		},

		showMeta: function(volume) {

			const metadonnees = volume.getUserData("metadonnees");

			if (!metadonnees) {
				const rem = '@electron/remote';
				require( rem ).dialog.showMessageBox({
					type: "error",
					title: "Erreur",
					message: "Métadonnées indisponibles",
					buttons: ['Ok']
				});
			}

			var parser = new DOMParser();
			var xmlDoc = parser.parseFromString(metadonnees, "text/xml");
			var lom = xmlDoc.getElementsByTagName("lom")[0];
			var general = lom.getElementsByTagName("general")[0];
			var title = general.getElementsByTagName("title")[0].childNodes[0].childNodes[0].nodeValue;
			var description = this.nl2br(general.getElementsByTagName("description")[0].childNodes[0].childNodes[0].nodeValue.trim());
			var contributeursNodeList = lom.getElementsByTagName("lifeCycle")[0].getElementsByTagName("contribute");

			var contributeurs = [];

			for (var i = 0; i < contributeursNodeList.length; i++) {
				contributeurs.push(contributeursNodeList[i].getElementsByTagName("entity")[0].childNodes[0].nodeValue);
			}

			var txt = "<h2>" + title + "</h2>" +
				"<h4>Description</h4>" + description + "<br>" +
				"<h4>Contributeurs : </h4>" +
				"<ul>";
			contributeurs.forEach(function(contributeur) {
				txt += "<li>" + contributeur + "</li>";
			});
			txt += "</ul>";

			this.alert(txt, "Métadonnées", {
				width: 800
			});


		},

		nl2br: function(str, is_xhtml) {
			var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>';
			return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
		},

		loadMeta: function(volume, callback) {
			var path = volume.getUserData("path");
			path = path.substr(0, path.length - 7) + ".xml";

			var oReq = new XMLHttpRequest();
			oReq.onload = function(res) {
				volume.setUserData("metadonnees", this.responseText);
				callback(null, this.responseText);
			};

			oReq.onerror = function() {
				callback("error");
			};

			oReq.open("get", path, true);
			oReq.send();
		},

		alert: function(message, title, option) {
			// create the window instance
			var root = qx.core.Init.getApplication().getRoot();

			if (title === undefined) title = this.tr("Error : file type");

			var win = new qx.ui.window.Window(title);
			win.setLayout(new qx.ui.layout.VBox(10));

			win.set({
				width: option.width || 400,
				alwaysOnTop: true,
				showMinimize: false,
				showMaximize: false,
				centerOnAppear: true,
				modal: true,
				movable: false,
				resizable: false,
				allowMaximize: false,
				allowMinimize: false
			});

			var label = new qx.ui.basic.Label(message);

			label.set({
				rich: true,
				wrap: true
			});

			// label to show the e.g. the alert message
			var scroll = new qx.ui.container.Scroll().set({
				maxHeight: 600
			});

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


		hackShaders: function(volumeSlice, meshes) {

			for ( let slice of meshes ) {

				slice.material.depthWrite = false;
				const shader = slice.material.baseShader;
				slice.material.polygonOffset = true;
				slice.material.polygonOffsetFactor = -1;
				slice.material.polygonOffsetUnits = -4.0;

				shader.extraUniforms.push({
					name: 'thresholdMin',
					type: "f",
					value: 128
				});
				shader.extraUniforms.push({
					name: 'thresholdMax',
					type: "f",
					value: 200
				});
				shader.extraShaders.push([
					'if ( /*( value > thresholdMax ) ||*/ ( value < thresholdMin ) || ( value == 0.0 ) ) {',
					'discard;',
					'} else {',
					'float range = thresholdMax - thresholdMin;',
					'correctedValue = ( value - thresholdMin ) / range;',
					'float blendingOpacity = correctedValue<0.2?easeInOutQuad(correctedValue*5.0):1.0;',
					'colorIndex = vec2( correctedValue, 0.0 );',
					'gl_FragColor = texture2D( lookupTable,colorIndex  );',
					'gl_FragColor.a = opacity*blendingOpacity;',
					'}'
				].join('\n'));
				volumeSlice.updateMaterial(slice.material);

			}

		},

		removeFunc: function() {

			if (!this.volumeFunc) return;
			this.__MPR.removeVolume(this.volumeFunc);
			this.__meshViewer.removeMeshes(this.__meshesFunc);
			this.volumeFunc = undefined;
			this.exclude();

		},

		generateChromaLut: function(imgData, scale) {
			var paletteSize = 2000;
			var red = [];
			var green = [];
			var blue = [];
			var alpha = [];
			var args = Array.prototype.slice.call(arguments, 1);

			var genImg = !!imgData && (imgData instanceof ImageData);


			if (genImg)
				paletteSize = imgData.width;

			for (var i = 0; i < paletteSize; i++) {
				var rgba = scale(i / paletteSize).rgba();

				if (genImg) {
					imgData.data[4 * i] = rgba[0];
					imgData.data[4 * i + 1] = rgba[1];
					imgData.data[4 * i + 2] = rgba[2];
					imgData.data[4 * i + 3] = 255 * rgba[3];
				} else {
					red[i] = rgba[0];
					green[i] = rgba[1];
					blue[i] = rgba[2];
					alpha[i] = 255 * rgba[3];
				}
			}

			if (!genImg)
				return [red, green, blue, alpha];
		},

		lutImage: function(generator /*, arguments pass to chroma.scale */ ) {
			var canvas = document.createElement('canvas');
			canvas.width = this.__widthMenu - 5;
			canvas.height = 16;
			var ctx = canvas.getContext("2d");
			var imgData = new ImageData(this.__widthMenu, 1);
			generator(imgData, Array.prototype.slice.call(arguments, 1));
			for (var i = 1; i < 16; i++) {
				ctx.putImageData(imgData, 0, i);
			}
			return canvas.toDataURL();
		},

		generateLut: function(imgData) {
			var paletteSize = 2000;
			var red = [];
			var green = [];
			var blue = [];
			var alpha = [];
			var colorConverter = new THREE.Color();

			function sigmoid(t, delta) {
				return 1 / (1 + Math.exp(-t * delta));
			}


			if (imgData)
				paletteSize = imgData.width;

			for (var i = 0; i < paletteSize; i++) {
				colorConverter.setHSL((1 - i / paletteSize) * 230 / 360, 1, 0.5);

				//colorConverter.setHSL((1-sigmoid(2 * i / paletteSize - 1, 2.8))* 230 / 360, 1, 0.5);

				if (imgData) {
					imgData.data[4 * i] = 255 * colorConverter.r;
					imgData.data[4 * i + 1] = 255 * colorConverter.g;
					imgData.data[4 * i + 2] = 255 * colorConverter.b;
					imgData.data[4 * i + 3] = 255;
				} else {
					red[i] = 255 * colorConverter.r;
					green[i] = 255 * colorConverter.g;
					blue[i] = 255 * colorConverter.b;
					alpha[i] = 255;
				}
			}
			if (!imgData)
				return [red, green, blue, alpha];
		}
	}
});
