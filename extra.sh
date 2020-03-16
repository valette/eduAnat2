for outpuPath in compiled/build compiled/source
do
cp icon.* $outpuPath
cp splash.* $outpuPath
cp script.js $outpuPath
cp package.json $outpuPath
cp buildDate.txt $outpuPath
done
cd compiled/build
npm install --production
cd ../..
