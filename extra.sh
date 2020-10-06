#!/bin/bash
time=$(date +%s)
for outpuPath in compiled/source compiled/build compiled/dist
do
cp package.json $outpuPath
sed -i -- 's/${compileTime}/'$time'/g' $outpuPath/index.html
done