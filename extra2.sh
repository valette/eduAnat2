cp script.js compiled/dist
cd compiled/dist
npm install --production
cd ../..

for outpuPath in compiled/source compiled/build compiled/dist
cp splash.html $outpuPath
cp script.js $outpuPath
cp icon.icns $outpuPath
