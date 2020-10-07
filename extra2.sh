cp script.js compiled/dist

for outpuPath in compiled/source compiled/build compiled/dist
do
cp splash.html $outpuPath
cp script.js $outpuPath
cp icon.icns $outpuPath
cp splash.png $outpuPath
done
