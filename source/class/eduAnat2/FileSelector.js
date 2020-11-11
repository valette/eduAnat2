/**
 * @ignore (require)
 * @ignore (fetch)
 */
qx.Class.define("eduAnat2.FileSelector", {

	extend: qx.ui.window.Window,

	type: "singleton",

	/**
	 * constructor
	 */
	construct: function() {

		this.base(arguments);
		this.set({
			layout: new qx.ui.layout.VBox(),
			showMinimize: false
		});

		const selectButton = this.__selectButton = new qx.ui.form.Button( this.tr('Open local file' ));
		this.add(selectButton);

		const fileBrowser = this.__fileBrowser = new desk.FileBrowser(eduAnat2.Quircks.getInstance().anaPedaRoot);
		this.add(fileBrowser, {
			flex: 1
		});
		const tree = fileBrowser.getTree();
		tree.setContextMenu(new qx.ui.menu.Menu());
		tree.setHideRoot(true);
		tree.setOpenMode("tap");
		const font = new qx.bom.Font(20, ["sans-serif"])
		tree.setFont(font);
		fileBrowser.setFileHandler(() => {});
		const okButton = this.__okButton = new qx.ui.form.Button( this.tr( "Open" ) );

		for (let button of [okButton, selectButton]) {
			button.getChildControl("label").setFont(font);
			button.setHeight(50);
		}

		this.add(okButton);

	},

	destruct: function() {

	},

	events: {

		"file": "qx.event.type.Data"

	},

	members: {

		getFile: async function(func) {

			const minSize = Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.85);

			this.set({
				width: minSize,
				height: minSize
			});

			const selectButtonHandler = this.__selectButton.addListener('click', () => {

				const chooser = new qxfileio.FileChooser();
				chooser.open();

				chooser.addListenerOnce('filesChange', () => {

					this.fireDataEvent("file", {
						file: chooser.getFiles()[0]
					});

				});

			});

			this.center();
			this.open();
			const okButton = this.__okButton;
			okButton.setEnabled(false);

			const fileBrowser = this.__fileBrowser
			const filterValue = (func ? ".fonc" : ".anat") + ".nii.gz"
			fileBrowser.getFileFilter().setValue(filterValue);
			const tree = fileBrowser.getTree();
			tree.refresh();

			const caption = func ? this.tr( "Select one functional map" ) :
				this.tr( "Select one image" );

			function onChange() {
				const file = fileBrowser.getSelectedFiles()[0];
				const valid = (file || false) && file.endsWith(filterValue);
				okButton.setEnabled(valid);
				okButton.setBackgroundColor(valid ? "#dddddd" : "white");
			}

			this.setCaption(caption);
			const selectionHandler = tree.addListener('changeSelection', onChange);
			onChange();

			const self = this;

			fileBrowser.setFileHandler(file => {

				if (!file.endsWith(filterValue)) return;
				this.fireDataEvent("file", {
					file
				});

			});

			const closeHandler = this.addListenerOnce("close", () => {

				this.fireDataEvent("file", {
					canceled: true
				});

			});

			const okButtonHandler = okButton.addListenerOnce("execute", () => {

				this.fireDataEvent("file", {
					file: fileBrowser.getSelectedFiles()[0]
				});

			});

			const data = await (new Promise(res =>
				this.addListenerOnce("file", d => {
					res(d.getData())
				})));

			// clear handlers;
			fileBrowser.setFileHandler(() => {});
			tree.removeListenerById(selectionHandler);
			this.removeListenerById(closeHandler);
			okButton.removeListenerById(okButtonHandler);
			this.__selectButton.removeListenerById(selectButtonHandler);
			this.close();
			return data;

		}

	}


});
