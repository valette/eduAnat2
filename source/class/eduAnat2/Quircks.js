/**
 * @ignore (require)
 * @ignore (fetch)
 */
qx.Class.define("eduAnat2.Quircks", {

	extend: qx.core.Object,

	type: "singleton",

	/**
	 * constructor
	 */
	construct: function() {

		this.base(arguments);

		const root = qx.core.Init.getApplication().getRoot();
		const blocker = this.__blocker = new qx.ui.core.Blocker(root);
		blocker.setOpacity(0.5);
		blocker.setColor("black");

		try {

			const el = "electron";
			const electron = require( el );
			eduAnat2.Quircks.slicer = true;
			eduAnat2.Quircks.selectFile = this.__selectFileElectron;
			eduAnat2.Quircks.__isElectron = true;
			return;

		} catch (e) {

			eduAnat2.Quircks.__isElectron = false;

		}

		let formatButton;

		function updateFormatButtonLabel() {

			if (!formatButton) return;
			formatButton.setLabel(eduAnat2.Quircks.anatImagesFormat ?
				"Low Res Anat" : "Hi Res Anat");

		}

		switch (desk.Actions.getEngine()) {

			case "node":

				const root = qx.core.Init.getApplication().getRoot();
				const button = new qx.ui.form.Button("loop");
				root.add(button, {
					right: 0,
					top: 200
				});
				button.addListener('execute', this.__loop, this);
				desk.Actions.statifyCode = "home/git/eduAnat2/compiled/build";
				formatButton = new qx.ui.form.Button("Hi Res Anat");
				updateFormatButtonLabel();

				formatButton.addListener('execute', () => {

					eduAnat2.Quircks.anatImagesFormat = 1 - eduAnat2.Quircks.anatImagesFormat;

					updateFormatButtonLabel();

				});

				root.add(formatButton, {
					right: 0,
					top: 260
				});

			default:

				desk.FileSystem.readFile(eduAnat2.Quircks.formatFile,
					(err, res) => {

						if (err) return;
						eduAnat2.Quircks.anatImagesFormat = JSON.parse(res);
						updateFormatButtonLabel();

					});

				eduAnat2.Quircks.slicer = false;
				eduAnat2.Quircks.selectFile = this.__selectFileNode;

				break;

		}



	},

	destruct: function() {

	},

	statics: {

		__isElectron : null,
		isElectron : () => eduAnat2.Quircks.__isElectron,

		formatFile: "data/format.json",
		getVersion: async function() {

			return (await (await fetch('package.json')).json()).version

		},

		selectFile: null,

		getBlocker : function () {

			return eduAnat2.Quircks.getInstance().__blocker;

		},

		getFileURL: function(path) {

			try {
				const el = "electron";
				require( el );
				return path;
			} catch (e) {};

			return encodeURI(desk.FileSystem.getFileURL(path));

		},

		flipVolume: async function(file) {

			try {

				const el = 'electron';
				require( el );
				return {
					file
				};

			} catch (e) {}

			const flip = await desk.Actions.executeAsync({

				action: "flipToRAS",
				inputVolume: file,
				outputFileName: "output.nii.gz"

			});

			const RASFile = flip.outputDirectory + "output.nii.gz";

			switch (file.split('/').pop()) {

				case "IRMsujet12222PathologieTumeurAudition-T1-HD.anat.nii.gz":
					const flipY = await desk.Actions.executeAsync({

						action: "c3d",
						inputVolume: RASFile,
						command: "-flip",
						option: "y",
						outputVolume: "output.nii.gz"

					});

					return {
						file: flipY.outputDirectory + "output.nii.gz",
							opts: {
								center: [1, 4, 36.89310249999998]
							}
					};

			}

			return {
				file: RASFile
			};

		},

		anatImagesFormat: 0,

		capture: async function(element) {

			try {
				const el = "electron";
				require( el );

			} catch (e) {

				eduAnat2.Quircks.getInstance().__captureWeb(element);
				return;

			}

			eduAnat2.Quircks.getInstance().__captureElectron(element);

		}

	},

	members: {

		__captureWeb: async function(element) {
			// TODO!
		},

		__captureElectron: async function(element) {

			var el = element.getContentElement().getDomElement();
			var rect = el.getBoundingClientRect();
			rect.y = rect.top;
			rect.x = rect.left;
			const rem = '@electron/remote';
			var remote = require( rem );
			var webContents = remote.getCurrentWebContents();
			var image = await webContents.capturePage(rect);
			var dialog = remote.dialog;
			var fn = await dialog.showSaveDialog({
				defaultPath: 'capture.png',
				filters: [{
					name: 'Image',
					extensions: ['png']
				}]
			});

			if (fn.canceled) return;
			remote.require('fs').writeFile(fn.filePath, image.toPNG(), function() {});

		},

		__loop: async function() {

			console.clear();
			const volumes = [];
			const meshes = [];

			await desk.FileSystem.writeFileAsync(eduAnat2.Quircks.formatFile,
				JSON.stringify(eduAnat2.Quircks.anatImagesFormat))

			desk.FileSystem.getFileURL(eduAnat2.Quircks.formatFile);


			await desk.FileSystem.traverseAsync(this.anaPedaRoot, f => {

				if (f.endsWith("stl")) meshes.push(f);
				if (f.endsWith(".nii.gz")) volumes.push(f);

			});

			//			volumes.length = meshes.length = 3;

			console.log({
				volumes,
				meshes
			});
			for (let mesh of meshes) desk.FileSystem.getFileURL(mesh);

			const volumeViewer = new desk.MPR.Viewer();

			for (let volume of volumes) {

				const flip = await eduAnat2.Quircks.flipVolume(volume);
				const fixedFile = flip.file;
				const format = volume.endsWith(".fonc.nii.gz") ?
					0 : eduAnat2.Quircks.anatImagesFormat;

				await volumeViewer.addVolumeAsync(fixedFile, {
					format
				});
				await new Promise(res => setTimeout(res, 500));
				volumeViewer.removeAllVolumes();

			}

			alert('loop done');

		},

		anaPedaRoot: "data/AnaPeda",

		__selectFileNode: async function(func) {

			const self = eduAnat2.Quircks.getInstance();
			self.__blocker.block();
			const selector = eduAnat2.FileSelector.getInstance();
			const file = await selector.getFile(func);
			self.__blocker.unblock();
			return file;

		},

		__selectFileElectron: async function(func) {

			const self = eduAnat2.Quircks.getInstance();
			self.__blocker.block();

			const filters = func ? [{
						name: 'Fonc Nifti Image',
						extensions: ['fonc.nii.gz']
					},
					{
						name: 'Nifti Image',
						extensions: ['nii.gz']
					},
					{
						name: 'All Files',
						extensions: ['*']
					}

				] :
				[{
						name: 'Anat Nifti Image',
						extensions: ['anat.nii.gz']
					},
					{
						name: 'Nifti Image',
						extensions: ['nii.gz']
					},
					{
						name: 'All Files',
						extensions: ['*']
					}

				];

			const rem = '@electron/remote';
			const dialog = require( rem ).dialog;
			const win = await dialog.showOpenDialog({
				filters,
				properties: ['openFile']
			});

			self.__blocker.unblock();
			if (win.canceled) return {
				canceled: true
			};
			return {
				file: win.filePaths[0]
			};

		}


	}


});
