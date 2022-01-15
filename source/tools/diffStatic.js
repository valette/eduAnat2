
"use strict";

/* global desk*/

const oldStaticDir = "code/EduAnat2-v2.2-update1/";
const newStaticDir = "code/EduAnat2-v2.2-update2/";
const diffDir = "code/diff/";
console.clear();

async function getCacheDirs( dir ) {

    const dirs = {};
    const cacheDir = dir + "cache";

    await desk.FileSystem.traverseAsync( cacheDir, file => {

        const dir = desk.FileSystem.getFileDirectory( file );
        if ( dir == cacheDir + "/" ) return;
        dirs[ dir.slice( cacheDir.length ) ] = true;
        
    } );

    return dirs;

}

async function run() {

    const newDirs = await getCacheDirs( newStaticDir );
    console.log( "done1" )
    const oldDirs = await getCacheDirs( oldStaticDir );
    console.log( "done2" )

    const diff = [];

    for ( let dir of Object.keys( newDirs ) ) {

        if ( !oldDirs[ dir ]) diff.push( dir );

    }

    for ( let dir of diff ) {

        const dirs = dir.split( "/" );
        dirs.shift();
        dirs.pop();
        const source = newStaticDir + "/cache/" + dirs.join( "/" );
        dirs.pop();
        const destination = diffDir + "/cache/" + dirs.join( "/" );
        console.log( source, destination );

        await desk.Actions.executeAsync( {

            action : "mkdirp",
            directory : destination

        } );

        await desk.Actions.executeAsync( {

            action : "copy",
            source, destination, recursive : true

        } );

    }

    console.log( 'done3' );

}

run();