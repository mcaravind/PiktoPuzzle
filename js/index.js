function loadFiles() {
    var fs = require('fs');
    var EventEmitter = require('events').EventEmitter;
    var filesEE = new EventEmitter();
    var myfiles = [];
    
    // this event will be called when all files have been added to myfiles
    filesEE.on('files_ready', function () {
        

        var sHtml = '';
        $.each(myfiles, function(index, value) {
            //sHtml += value + "<br/>";
            var atag = $('<a/>', {
                href: "add.html?file=" + value
            });
            var spanTag = $('<span/>', {
                html:value
            });
            atag.append(spanTag);
            $("#fileList").append(atag);
        });
    });

    // read all files from current directory
    fs.readdir('data', function (err, files) {
        if (err) throw err;
        files.forEach(function (file) {
            if (file.substr(-5) === '.json') {
                myfiles.push(file);
            }
        });
        filesEE.emit('files_ready'); // trigger files_ready event
    });
}