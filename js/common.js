var path = require('path');
function getDirectoryFromFileName(jsonFileName) {
    return jsonFileName.split('.')[0].split('_')[1].toString();
}

function getFullPath(jsonFileName) {
    var dirName = getDirectoryFromFileName(jsonFileName);
    return path.join('data', dirName, jsonFileName);
}

function pnpoly(nvert, vertx, verty, testx, testy) {
    var i, j, c = false;
    for (i = 0, j = nvert - 1; i < nvert; j = i++) {
        if (((verty[i] > testy) !== (verty[j] > testy)) &&
            (testx < (vertx[j] - vertx[i]) * (testy - verty[i]) / (verty[j] - verty[i]) + vertx[i])) {
            c = !c;
        }
    }
    return c;
}