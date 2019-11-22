"use strict";

/*
VTK_VOID            0
VTK_BIT             1
VTK_CHAR            2
VTK_SIGNED_CHAR    15
VTK_UNSIGNED_CHAR   3
VTK_SHORT           4
VTK_UNSIGNED_SHORT  5
VTK_INT             6
VTK_UNSIGNED_INT    7
VTK_LONG            8
VTK_UNSIGNED_LONG   9
VTK_FLOAT          10
VTK_DOUBLE         11
VTK_ID_TYPE        12

papaya.volume.ImageType.DATATYPE_UNKNOWN = 0;
papaya.volume.ImageType.DATATYPE_INTEGER_SIGNED = 1;
papaya.volume.ImageType.DATATYPE_INTEGER_UNSIGNED = 2;
papaya.volume.ImageType.DATATYPE_FLOAT = 3;
papaya.volume.ImageType.DATATYPE_RGB = 4;
papaya.volume.ImageType.MAX_SUPPORTED_BYTES_FLOAT = 8;
papaya.volume.ImageType.MAX_SUPPORTED_BYTES_INTEGER = 4;

*/

function PapayaSlicer (progressFunc) {
	this.typePapaya2vtk = {
	"0" : 0,
	"1" : 6,
	"2" : 7,
	"3" : 10,
	"4" : 0, //TODO : multichannel
	"8" : 11,
	"4" : 8
	};

	this.progressMeter = {};
	this.progressMeter.drawProgress = progressFunc;

	this.manager = {
		isRadiologicalMode : function () { return false;},
		isWorldMode : function () { return false;},
		container : { preferences : { smoothDisplay : "No" } }
	};


	this.vol = new papaya.volume.Volume(this.progressMeter);

	this.volumeReady = false;
}

PapayaSlicer.prototype.initProperties = function() {
      this.volumeReady = true;
      var vol = this.vol;

      var xDim = vol.getXDim();
      var yDim = vol.getYDim();
      var zDim = vol.getZDim();

      var min = Number.POSITIVE_INFINITY;
      var max = Number.NEGATIVE_INFINITY;
      var value;

      for (var ctrZ = 0; ctrZ < zDim; ctrZ += 1)
      for (var ctrY = 0; ctrY < yDim; ctrY += 1)
      for (var ctrX = 0; ctrX < xDim; ctrX += 1) {
    	value = this.vol.getVoxelAtIndex(ctrX, ctrY, ctrZ, 0, true);
        min = Math.min(min, value);
        max = Math.max(max, value);
      }


      var numberOfScalarComponents = Math.floor(vol.imageData.data.length / vol.header.imageDimensions.dataLengths[0]);

      if (numberOfScalarComponents !== 3 && numberOfScalarComponents !== 1) numberOfScalarComponents = 1;


      /*
      var scalarType = this.typePapaya2vtk[vol.header.imageType.datatype];
      if (scalarType == 7) { // C'est un unsigned int, il faut regarder la taille
        switch (vol.header.imageType.numBytes) {
          case 1 :
            scalarType = 3;
            break;
          case 2 :
            scalarType = 5;
            break;
          case 4 :
            scalarType = 7;
            break;

        }
      }*/
      if (numberOfScalarComponents == 3) {
        scalarType = 3;
      }
      else {
        scalarType = 6;
      }

      var orig = vol.getOrigin();
      var properties = {
        dimensions : [vol.getXDim(), vol.getYDim(), vol.getZDim()],
        extent : [0, vol.getXDim()-1, 0, vol.getYDim()-1, 0, vol.getZDim()-1],
        origin : [orig.x, orig.y, orig.z],
        spacing : [vol.getXSize(), vol.getYSize(), vol.getZSize()],
        scalarType :scalarType,
        scalarTypeAsString : vol.header.imageType.getTypeDescription(),
        scalarBounds : [min, max],
        numberOfScalarComponents : numberOfScalarComponents
      };

      this.properties = properties;

      return properties;

}

//No TimePoint
//usesGlobalDataScale = false
//forceABS = false
// ctrX, ctrY, ctrZ : integer (no rounding performed)
papaya.volume.VoxelValue.prototype.getVoxelFast = function (ctrX, ctrY, ctrZ, offset) {
        offset += this.orientation.convertIndexToOffset(ctrX, ctrY, ctrZ);

        if (this.usesGlobalDataScale) {
            value = (this.checkSwap(this.imageData.data[offset]) * this.globalDataScaleSlope) +
                this.globalDataScaleIntercept;
        } else {
            dataScaleIndex = parseInt(offset / this.sliceSize);
            value = (this.checkSwap(this.imageData.data[offset]) * this.dataScaleSlopes[dataScaleIndex]) +
                this.dataScaleIntercepts[dataScaleIndex];
        }

        return value;
}


PapayaSlicer.prototype.generateSlice = function(data, callback) {

  var slice = data[0];
  var dir  = data[1];
  var uuid = data[2];
  var vol = this.vol;



	//Changement Papaya <-> vtk
	//if (dir == 1) dir = 2;
	//else if (dir == 2) dir = 1;

	// /!\ Saggital & Coronal sont donc inversé sur les images selon la convention

  var xDim = vol.getXDim();
  var yDim = vol.getYDim();
  var zDim = vol.getZDim();


	var timepoint = 0;
	var value;
  var index;
  var DIRECTION_AXIAL = 0;
  var DIRECTION_CORONAL = 1;
  var DIRECTION_SAGITTAL = 2;
  //var dir = DIRECTION_AXIAL;
  var view = new DataView(new ArrayBuffer(4));
  var yLim, xLim;

	if (dir === DIRECTION_AXIAL) {
			xLim = xDim;
			yLim = yDim;
	} else if (dir === DIRECTION_CORONAL) {
			xLim = zDim;
			yLim = yDim;
	} else if (dir === DIRECTION_SAGITTAL) {
			xLim = xDim;
			yLim = zDim;
	}

	//var imageData = new ImageData(xLim, yLim);
	var imageData = {width: xLim, height : yLim};

	var voxelValue = vol.transform.voxelValue;

  var typedArray;
  if (this.properties.numberOfScalarComponents == 3) {
    typedArray = new Uint8Array(xLim*yLim*this.properties.numberOfScalarComponents);
  }
  else {
    typedArray = new Float32Array(xLim*yLim);
  }

  var numVoxelsSeries = vol.header.imageDimensions.getNumVoxelsSeries();

  var cLim = this.properties.numberOfScalarComponents*numVoxelsSeries;
	for (var ctrY = 0; ctrY < yLim; ctrY += 1) {
		for (var ctrX = 0; ctrX < xLim; ctrX += 1) {
    	for (var channel = 0 ; channel < this.properties.numberOfScalarComponents ; channel++) {
				  //var index3d;
				  if (dir === DIRECTION_AXIAL) {
						  //value = voxelValue.getVoxelAtIndex(ctrX, yDim-ctrY - 1,  zDim - slice - 1, timepoint, true);
						  value = voxelValue.getVoxelFast(ctrX, yDim-ctrY - 1,  zDim - slice - 1, channel*numVoxelsSeries);
				  } else if (dir === DIRECTION_CORONAL) { //Sagittal
						  //value = voxelValue.getVoxelAtIndex(slice, yDim-ctrY - 1, zDim-ctrX - 1, timepoint, true);
						  value = voxelValue.getVoxelFast(slice, yDim-ctrY - 1, zDim-ctrX - 1, channel*numVoxelsSeries);
				  } else if (dir === DIRECTION_SAGITTAL) { //Coronal
              //value = voxelValue.getVoxelAtIndex(ctrX, yDim-slice-1, zDim-ctrY - 1, timepoint, true);
              value = voxelValue.getVoxelFast(ctrX, yDim-slice-1, zDim-ctrY - 1, channel*numVoxelsSeries);
				  }

          /*
				  index = ((ctrY * xLim) + ctrX) * 4;
				  view.setFloat32(0, value);
				  imageData.data[index]   = view.getUint8(0);
				  imageData.data[index+1] = view.getUint8(1);
				  imageData.data[index+2] = view.getUint8(2);
				  imageData.data[index+3] = view.getUint8(3);
				  */

			    var index = (ctrY * xLim) + ctrX;
			    index = this.properties.numberOfScalarComponents*(index) + channel;
			    typedArray[index] = value;


        }
			}
		};

  callback(null, imageData, typedArray);
}








// run this in global scope of window or worker. since window.self = window, we're ok
if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    // In a worker, register comm'
	var progressFunc = function (frac, text) {
	  var txt = text+" "+(frac*100).toFixed(1)+"%";
	  postMessage(["progress", txt]);
		//$('#progress').text();
	};

	var obj = new PapayaSlicer(progressFunc);


	self.addEventListener('message', function(e) {
	  var message = e.data[0];
	  var data = e.data[1];

	  function cbLoad(properties) {
		postMessage(['imageLoaded', properties]);
	  }

	  if (message == 'loadImage') {
		/* data = 'data.nii' */
		obj.vol.loadURL(data, function () {
		  var properties = obj.initProperties();
          postMessage(['imageLoaded', properties]);
		});
	  }
	  else if (message == 'loadLocalImage') {
		obj.vol.readFiles([data], function () {
		  var properties = obj.initProperties();
          postMessage(['imageLoaded', properties]);
		});
	  }
	  else if (message == 'getSlice') {
		obj.generateSlice(data, function (err, imageData) {
			var uuid = data[2];
			postMessage(["slice", [uuid, imageData] ], [imageData.data.buffer]);
		});
	  }
	}, false);


} else {
    // In main thread !
}
