
cp icon.* compiled/build
cp splash.* compiled/build
cp script.js compiled/build
cp package.json compiled/build
cp -r source/resource/ife compiled/source/resource/ife
cp -r source/resource/ife compiled/build/resource/ife
rm -rf compiled/build/transpiled

cd compiled/build
npm install --production
cd ..
