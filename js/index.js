function getImageFileName(jsonFileName) {
    var fs = require('fs');
    var path = require('path');
    var obj = JSON.parse(fs.readFileSync(path.join('data', jsonFileName), 'utf-8'));
    var imageFileName = obj['fileName'];
    return imageFileName;
}

function deleteMap(fileName) {
    var fs = require('fs');
    var path = require('path');
    var imageFileName = getImageFileName(fileName);
    var fsImageFile = path.join('data', imageFileName.toString());
    var fsJsonFile = path.join('data', fileName.toString());
    var fsScoreFile = path.join('data', fileName.replace('file_', 'score_'));
    fs.unlinkSync(fsImageFile);
    fs.unlinkSync(fsJsonFile);
    fs.unlinkSync(fsScoreFile);
    loadFiles();
}

function loadFiles() {
    var fs = require('fs');
    var EventEmitter = require('events').EventEmitter;
    var filesEE = new EventEmitter();
    var myfiles = [];
    var path = require('path');
    $("#divRow").html('');
    // this event will be called when all files have been added to myfiles
    filesEE.on('files_ready', function () {
        var sHtml = '';
        var brTag = $('<br/>');
        
        $.each(myfiles, function (index, value) {
            var imageFileNameWithoutPath = getImageFileName(value);
            var imageFileName = path.join('data', imageFileNameWithoutPath);
            var divThumb = $('<div/>', {
                class: 'col-lg-3 col-md-4 col-xs-6 thumb'
            });
            var aThumb = $('<a/>', {
                class:'thumbnail'
            });
            var imgThumb = $('<img/>', {
                class: 'img-responsive',
                src:imageFileName
            });
            aThumb.append(imgThumb);
            var divTag = $('<div/>', {
            });
            var atagEdit = $('<a/>', {
                href: "add.html?file=" + value
            });
            var spantagEdit = $('<span/>', {
                html:'Edit'
            });
            atagEdit.append(spantagEdit);
            var atagReview = $('<a/>', {
                href: "review.html?file=" + value
            });
            var spanTagReview = $('<span/>', {
                html: 'Review'
            });
            var buttonDelete = $('<button/>', {
                text: 'Delete',
                class: 'btn btn-primary btn-xs',
                id: value
            });
            atagReview.append(spanTagReview);
            divTag.append(" ");
            divTag.append(atagEdit);
            divTag.append(" ");
            divTag.append(atagReview);
            divTag.append(" ");
            divTag.append(buttonDelete);
            divTag.append(brTag);
            divThumb.append(divTag);
            divThumb.append(aThumb);
            $("#divRow").append(divThumb);
            $(buttonDelete).confirmation({
                onConfirm:function(button) {
                    deleteMap($(buttonDelete).attr("id"));
                    $(buttonDelete).confirmation('hide');
                },
                onCancel:function(button) {
                    $(buttonDelete).confirmation('hide');
                }
            });
        });
    });

    // read all files from current directory
    fs.readdir('data', function (err, files) {
        if (err) throw err;
        files.forEach(function (file) {
            if (file.substr(-5) === '.json' && file.startsWith('file_')) {
                myfiles.push(file);
            }
        });
        filesEE.emit('files_ready'); // trigger files_ready event
    });
}

if (typeof String.prototype.startsWith != 'function') {
    // see below for better implementation!
    String.prototype.startsWith = function (str) {
        return this.indexOf(str) === 0;
    };
}

