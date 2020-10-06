#!/bin/bash
time=$(date +%s)
for outpuPath in compiled/source compiled/build dist
do
cp script.js $outpuPath
cp package.json $outpuPath
sed -i -- 's/${compileTime}/'$time'/g' $outpuPath/index.html
done
