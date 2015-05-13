var fs = require('fs'),
    path = require('path');
var gui = require('nw.gui');
function getImageFileName(jsonFileName) {
    var dirName = getDirectoryFromFileName(jsonFileName);
    var obj = JSON.parse(fs.readFileSync(path.join('data',dirName, jsonFileName), 'utf-8'));
    var imageFileName = obj['fileName'];
    return imageFileName;
}

function getOriginalFileName(jsonFileName) {
    var dirName = getDirectoryFromFileName(jsonFileName);
    var obj = JSON.parse(fs.readFileSync(path.join('data',dirName, jsonFileName), 'utf-8'));
    var imageFileName = obj['originalFileName'];
    return imageFileName;
}

function showScores(fileName) {
    var win = gui.Window.get();
    win.open("scores.html?file=" + fileName);
}



function deleteMap(fileName) {
    var dirName = getDirectoryFromFileName(fileName);
    var imageFileName = getImageFileName(fileName);
    var fsImageFile = path.join('data',dirName, imageFileName.toString());
    var fsJsonFile = path.join('data',dirName, fileName.toString());
    var fsScoreFile = path.join('data',dirName, fileName.replace('file_', 'score_'));
    fs.unlinkSync(fsImageFile);
    fs.unlinkSync(fsJsonFile);
    fs.unlinkSync(fsScoreFile);
    loadFiles();
}

function loadFiles() {
    var EventEmitter = require('events').EventEmitter;
    var filesEE = new EventEmitter();
    var myfiles = [];
    $("#fileList").html('');
    // this event will be called when all files have been added to myfiles
    filesEE.on('files_ready', function () {
        var sHtml = '';
        var brTag = $('<br/>');
        var clearFix = $('<div/>', {
            'class':'clearfix visible-lg'
        });
        var tableEl = $('<table/>', {
            class: 'table table-striped'
        });
        var tr = $('<tr/>', {});
        tableEl.append(tr);
        $.each(myfiles, function (index, value) {
            var dirName = getDirectoryFromFileName(value);
            var td = $('<td/>', {});
            var imageFileNameWithoutPath = getImageFileName(value);
            var scoreFileName = value.replace('file_', 'score_');
            var originalFileName = getOriginalFileName(value);
            var imageFileName = path.join('data', dirName, imageFileNameWithoutPath);

            var obj = JSON.parse(fs.readFileSync(getFullPath(scoreFileName), 'utf-8'));
            var scores = obj.scores;
            var dayArray = [];
            $.each(scores, function (index, item) {
                //incomplete attempts do not count
                if (item.totalSeconds) {
                    var lastDateModified = new Date(item.lastModified);
                    var now = new Date();
                    var timeDiff = Math.abs(now.getTime() - lastDateModified.getTime());
                    var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
                    dayArray.push(diffDays);
                }
            });
            var divFileName = $('<div/>', {
                html: '<b>' + originalFileName + '</b>'
            });
            $(divFileName).css('text-align', 'center');
            $(divFileName).css('width', '300px');

            var divRecentActivity = $('<div/>', {
                html: 'Last 30 days:<br/>'
            });
            $(divRecentActivity).css('text-align', 'center');
            $(divRecentActivity).css('width', '300px');

            var recentActivityTable = $('<table></table>');
            $(recentActivityTable).css('width', '300px');
            $(recentActivityTable).css('border', '1px solid black');
            $(recentActivityTable).css('border-collapse', 'collapse');
            for (i = 0; i < 2; i++) {
                var row = $('<tr></tr>');
                for (j = 0; j < 15; j++) {
                    var cell = $('<td></td>');
                    if ($.inArray(((15 * i) + j), dayArray) > -1) {
                        $(cell).css('background-color', 'gray');
                    }
                    $(cell).css('height', '20px');
                    $(cell).css('border', '1px solid black');
                    $(cell).css('border-collapse', 'collapse');
                    row.append(cell);
                }
                recentActivityTable.append(row);
            }

            var divThumb = $('<div/>', {
                "class": 'col-lg-4'
            });

            var aThumb = $('<a/>', {
                "class":"thumbnail"
            });
            $(aThumb).css('width', '300px');
            var imgThumb = $('<img/>', {
                class: 'img-responsive',
                src:imageFileName
            });
            aThumb.append(imgThumb);

            var divTag = $('<div/>', {
            });
            $(divTag).css('width', '300px');
            $(divTag).css('text-align', 'center');
            var atagEdit = $('<a/>', {
                href: "add.html?file=" + value
            });
            var spantagEdit = $('<span/>', {
                html:'Edit'
            });
            atagEdit.append(spantagEdit);

            var atagScores = $('<a/>', {
                href:"scores.html?file="+scoreFileName
            });
            var spantagScores = $('<span/>', {
                html:'Scores'
            });
            atagScores.append(spantagScores);

            var atagReview = $('<a/>', {
                href: "review.html?file=" + value
            });
            var spanTagReview = $('<span/>', {
                html: 'Review'
            });
            atagReview.append(spanTagReview);

            var buttonDelete = $('<button/>', {
                text: 'Delete',
                class: 'btn btn-primary btn-xs',
                id: value
            });
            divTag.append(" ");
            divTag.append(atagEdit);
            divTag.append("  ");
            divTag.append(atagReview);
            divTag.append("  ");
            divTag.append(atagScores);
            divTag.append("  ");
            divTag.append(buttonDelete);
            divTag.append(brTag);
            divThumb.append(divTag);
            divThumb.append(aThumb);
            divThumb.append(divFileName);
            divThumb.append(divRecentActivity);
            divThumb.append(recentActivityTable);
            td.append(divThumb);
            tr.append(td);
            if ((index + 1) % 3 === 0) {
                tr = $('<tr/>', {});
                tableEl.append(tr);
            }
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
        $("#fileList").append(tableEl);
    });

    var allDirectories = getDirectories('data');
    var dirCount = allDirectories.length;
    var count = 0;
    allDirectories.forEach(function(value) {
        // read all files from current directory
        var directory = path.join('data', value);
        fs.readdir(directory, function (err, files) {
            if (err) throw err;
            files.forEach(function (file) {
                if (file.substr(-5) === '.json' && file.startsWith('file_')) {
                    myfiles.push(file);
                }
            });
            count += 1;
            if(count === dirCount)
                filesEE.emit('files_ready');// trigger files_ready event
        });
    });
}

function getDirectories(srcpath) {
    return fs.readdirSync(srcpath).filter(function (file) {
        return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
}

if (typeof String.prototype.startsWith != 'function') {
    // see below for better implementation!
    String.prototype.startsWith = function (str) {
        return this.indexOf(str) === 0;
    };
}

