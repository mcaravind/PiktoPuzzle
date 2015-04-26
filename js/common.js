var path = require('path');
function getDirectoryFromFileName(jsonFileName) {
    return jsonFileName.split('.')[0].split('_')[1].toString();
}

function getFullPath(jsonFileName) {
    var dirName = getDirectoryFromFileName(jsonFileName);
    return path.join('data', dirName, jsonFileName);
}