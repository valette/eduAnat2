var WorkerSlicer = function (volume, opts) {
  this.volume = volume;

  var scriptFile = "desk-ui/workerSlicer.worker.js";

  if (!opts.noworker) {
	  console.log("WWWOOORRKKKEERRR");
    this.worker = new Worker(scriptFile);

      var self = this;

      this.worker.onmessage = function(e) {
        var type = e.data.shift();
        var data = e.data.shift();

        if (type == "progress") {
          if (typeof opts.onprogress === 'function')
            opts.onprogress(data);
        }
        else if (type == "slice") {
          var uniqueId = data[0];
          var imgData = data[1];

          if (typeof self.callbacks[uniqueId] === 'function') {
            self.callbacks[uniqueId](null, imgData);

	    self.callbacks[uniqueId] = undefined;
          }
        }
        else if (type == "imageLoaded") {
          self.properties = data;
          self.loaded = true;
          if (typeof opts.onload === 'function')
            opts.onload(self.properties);
        }
      }

      if (opts.local) {
	       this.worker.postMessage(["loadLocalImage", volume]);
      }
      else
      	this.worker.postMessage(["loadImage", volume]);
  }
  else
  {
	  console.log("NNNOOOOOOOWWWOOORRKKKEERRR");
    function loadScript(uri, callback) {
      var elem = document.createElement("script");
      elem.charset = "utf-8";
      elem.src = uri;
      elem.onreadystatechange = elem.onload = function() {
        if (!this.readyState || readyStateValue[this.readyState]) {
          elem.onreadystatechange = elem.onload = null;
          if (typeof callback === "function") {
            callback();
          }
        }
      };

      var head = document.getElementsByTagName("head")[0];
      head.appendChild(elem);
    }

    var that = this;

//	PapayaSlicer = require( 'source/script/workerSlicer.worker.js');
	require( 'source/ext/workerSlicer.worker.js');

//    loadScript(scriptFile, function () {
next();
function next() {
      var root = qx.core.Init.getApplication().getRoot();

      var win = new qx.ui.window.Window("Chargement de l'image");
      win.set({
          width : 300,
          height : 100,
          alwaysOnTop : true,
          showMinimize : false,
          showMaximize : false,
          centerOnAppear : true,
          modal : true,
          movable : false,
          allowMaximize : false,
          allowMinimize : false,
          resizable : false,
          showClose : false
      });

      win.setLayout(new qx.ui.layout.VBox(10));
      var progressText = new qx.ui.basic.Label("Initialisation...");
      win.add(progressText);

      var pb = new desk.ProgressBar();
      win.add(pb);
      root.add(win);
      win.open();

	    var progressFunc = function (frac, text) {
	      if (text == "Unpacking") text = "Décompression";
	      var txt = text+" "+(frac*100).toFixed(1)+"%";
	      progressText.setValue(txt);
	      pb.setValue(frac*100);

	    };

        that.slicer = new PapayaSlicer(progressFunc);
        if (opts.local) {
            if (typeof volume == "string") {
              //fs = require("fs");
              var fs = require('fs')
              var concat = require('concat-stream')

              var readStream = fs.createReadStream(volume)
              var concatStream = concat(gotPicture)

              readStream.on('error', handleError)

              // Get the size of the file
              var stats = fs.statSync(volume);
              var fileSize         = stats.size;
              var readSize    = 0; // Incremented by on('data') to keep track of the amount of data we've uploaded

              readStream.on('data', function(buffer) {
                  var segmentLength   = buffer.length;
                  // Increment the uploaded data counter
                  readSize        += segmentLength;
                  progressFunc(readSize/fileSize, "Chargement");
              });

              readStream.pipe(concatStream)

              function gotPicture(buffer) {
                that.slicer.vol.fileName = require("path").basename(volume);
                that.slicer.vol.rawData[0] = buffer;//fileBuffer.buffer;
                //const b = Buffer.from(fileBuffer);
                //var arrayBuffer = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
                that.slicer.vol.decompress( that.slicer.vol);


                that.slicer.vol.onFinishedRead = function () {
                  that.properties = that.slicer.initProperties();
                  that.loaded = true;
                  opts.onload(that.properties);
                  win.close();
               }
              }

              function handleError(err) {
                // handle your error appropriately here, e.g.:
                console.error(err) // print the error to STDERR
              }


            }
            else
            {
              that.slicer.vol.readFiles([volume], function () {
                  that.properties = that.slicer.initProperties();
                  that.loaded = true;
                  opts.onload(that.properties);
                  win.close();
              });
            }



        }
    }//);
  }

  this.opts = opts;
  this.loaded = false;

  this.callbacks = {};

  /*
    opts.onload
    opts.onprogress
  */

};

WorkerSlicer.prototype.getSlice = function(orientation, number, cb) {

  var DIRECTION_AXIAL = 0;
  var DIRECTION_CORONAL = 1;
  var DIRECTION_SAGITTAL = 2;

  var normales = [
   2, //DIRECTION_AXIAL     XY Z
   0, //DIRECTION_CORONAL   ZY X
   1 //DIRECTION_SAGITTAL   XZ Y
  ];


  var self = this;
  if (this.loaded && number < this.properties.dimensions[normales[orientation]]) {
    if (this.opts.noworker) {
        this.slicer.generateSlice([number, orientation], cb);
    }
    else
    {
	    var uniqueId = Math.floor((1 + Math.random()) * 0x10000000000000).toString(16);
	    this.callbacks[uniqueId] = cb;
	    setTimeout(function () {
	      self.worker.postMessage(["getSlice", [number, orientation, uniqueId]]);
	    }, 0);
    }
  }
  else if (!this.loaded) {
    cb("Error : image not loaded");
  }
  else if (number >= this.properties.dimensions[normales[orientation]] ) {
    cb("Error : out of image, slice "+number+" ask, dimension for orientation "+orientation+" is "+this.properties.dimensions[normales[orientation]]);
  }
};

WorkerSlicer.prototype.destroy = function () {
  if (this.worker)
    this.worker.terminate();

  this.callbacks = undefined;
}

module.exports = WorkerSlicer;
