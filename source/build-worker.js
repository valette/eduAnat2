var fs = require('fs');

//Got list from https://github.com/rii-mango/Papaya-Builder/blob/master/src/edu/uthscsa/ric/papaya/builder/Builder.java
var js_files =  [
  //"../Papaya/lib/daikon.js",
  //"../Papaya/lib/base64-binary.js",
  //"Papaya/lib/bowser.js",
  //"../Papaya/lib/numerics.js",
  "node_modules/papaya-viewer/lib/pako-inflate.js",
  "node_modules/papaya-viewer/lib/nifti-reader.js",
  //"../Papaya/lib/gifti-reader.js",
  //"../Papaya/lib/gl-matrix.js",
  //"../Papaya/lib/GLU.js",
  "node_modules/papaya-viewer/src/js/constants.js",
  "node_modules/papaya-viewer/src/js/utilities/array-utils.js",
  "node_modules/papaya-viewer/src/js/utilities/math-utils.js",
  "node_modules/papaya-viewer/src/js/utilities/object-utils.js",
  //"Papaya/src/js/utilities/platform-utils.js",
  "node_modules/papaya-viewer/src/js/utilities/string-utils.js",
  //"../Papaya/src/js/utilities/url-utils.js",
  "node_modules/papaya-viewer/src/js/core/coordinate.js",
  "node_modules/papaya-viewer/src/js/core/point.js",
  "node_modules/papaya-viewer/src/js/volume/header.js",
  "node_modules/papaya-viewer/src/js/volume/imagedata.js",
  "node_modules/papaya-viewer/src/js/volume/imagedescription.js",
  "node_modules/papaya-viewer/src/js/volume/imagedimensions.js",
  "node_modules/papaya-viewer/src/js/volume/imagerange.js",
  "node_modules/papaya-viewer/src/js/volume/imagetype.js",
  "node_modules/papaya-viewer/src/js/volume/nifti/header-nifti.js",
  //"../Papaya/src/js/volume/dicom/header-dicom.js",
  "node_modules/papaya-viewer/src/js/volume/orientation.js",
  "node_modules/papaya-viewer/src/js/volume/transform.js",
  "node_modules/papaya-viewer/src/js/volume/volume.js",
  "node_modules/papaya-viewer/src/js/volume/voxeldimensions.js",
  "node_modules/papaya-viewer/src/js/volume/voxelvalue.js",
  //"../Papaya/src/js/surface/surface.js",
  //"../Papaya/src/js/surface/surface-gifti.js",
  //"../Papaya/src/js/surface/surface-mango.js",
  //"../Papaya/src/js/surface/surface-vtk.js",
  "source/workerSlicer.manager.js"];

var output = js_files.map((f)=>{
  return fs.readFileSync(f).toString();
}).join(';')

output += `
papaya.utilities.PlatformUtils = {
isPlatformLittleEndian : () => true
}
`;

fs.writeFileSync("source/ext/workerSlicer.worker.js",output, "utf8");

