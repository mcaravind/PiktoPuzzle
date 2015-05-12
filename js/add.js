function chooseFile(name) {
    var chooser = $(name);
    chooser.change(function (evt) {
        console.log($(this).val());
        var fileName = $(this).val();
        console.log('only name = ' + fileName.replace(/^.*[\\\/]/, ''));
        var fileType = $(this).val().split('.')[1];
        $("#cvsImage").removeAttr("data-caman-id");
        Caman("#cvsImage", $(this).val(), function () {
            // manipulate image here
            //this.brightness(5).render();
            this.render();
            var canvasHeight = $("#cvsImage").height();
            var canvasWidth = $("#cvsImage").width();
            $("#sliderLeft").height(canvasHeight);
            $("#sliderRight").height(canvasHeight);
            $("#sliderTop").width(canvasWidth);
            $("#sliderBottom").width(canvasWidth);
            $("#sliderLeft").slider({
                max: $("#cvsImage").height()
            });
            $("#sliderRight").slider({
                max: $("#cvsImage").height()
            });
            $("#sliderTop").slider({
                max: $("#cvsImage").width()
            });
            $("#sliderBottom").slider({
                max: $("#cvsImage").width()
            });
            ////save file to data folder
            var fs = require('fs');
            var path = require('path');
            var dateStr = (new Date).yyyymmddHHMMss();
            var fName = "file_" + dateStr;
            var scoreFileName = "score_" + dateStr;
            var newFileName = path.join('data',dateStr, fName + '.' + fileType);
            var mkdirp = require('mkdirp');
            mkdirp(path.join('data', dateStr), function(err) {
                if (!err) {
                    $("#hdnFileName").html(fName);
                    var jsonToWrite = JSON.stringify({ 'originalFileName': fileName.replace(/^.*[\\\/]/, ''), 'fileName': fName + '.' + fileType, 'items': [] });
                    var newFileJsonName = path.join('data', dateStr, fName + '.json');
                    fs.appendFile(newFileJsonName, jsonToWrite, function (err) {
                        if (err)
                            alert(err);
                    });
                    fs.createReadStream(fileName).pipe(fs.createWriteStream(newFileName));
                    var scoreJsonToWrite = JSON.stringify({ 'fileName': fName + '.' + fileType, 'scores': [] });
                    var newScoreFileName = path.join('data', dateStr, scoreFileName + '.json');
                    fs.appendFile(newScoreFileName, scoreJsonToWrite, function (err) {
                        if (err)
                            alert(err);
                    });
                    newImage();
                }
            });
        });
    });
    chooser.trigger('click');
}

function showWordBoxes(jsonFileName) {
    var fs = require('fs');
    var path = require('path');
    var dirName = getDirectoryFromFileName(jsonFileName);
    var obj = JSON.parse(fs.readFileSync(getFullPath(jsonFileName), 'utf-8'));
    var items = obj['items'];
    var elCanvas = document.getElementById("cvsImage");
    var ctx = elCanvas.getContext("2d");
    $.each(items, function (index, obj) {
        var value = obj.item;
        var disabled = value['disabled'];
        var lines = value['lines'];
        $.each(lines, function (index1, lineItem) {
            var point1X = lineItem['line'][0];
            var point1Y = lineItem['line'][1];
            var point2X = lineItem['line'][2];
            var point2Y = lineItem['line'][3];
            ctx.beginPath();
            ctx.moveTo(point1X, point1Y);
            ctx.lineTo(point2X, point2Y);
            if (disabled === "1") {
                ctx.setLineDash([5, 2]);
            } else {
                ctx.setLineDash([5, 0]);
            }
            ctx.stroke();
        });
    });
}

function getJsonFileNameFromHiddenField() {
    return $("#hdnFileName").html() + ".json";
}

function getImageFileName(jsonFileName) {
    var fs = require('fs');
    var path = require('path');
    var dirName = getDirectoryFromFileName(jsonFileName);
    var obj = JSON.parse(fs.readFileSync(getFullPath(jsonFileName), 'utf-8'));
    var imageFileName = obj['fileName'];
    return imageFileName;
}

function showMapName(jsonFileName) {
    var fs = require('fs');
    var path = require('path');
    var obj = JSON.parse(fs.readFileSync(getFullPath(jsonFileName), 'utf-8'));
    var originalFileName = obj['originalFileName'];
    $("#tbxMapName").val(originalFileName);
}

function handleEditClick() {
    var buttonText = $("#btnEditName").html();
    if (buttonText === "Edit") {
        $("#btnEditName").html("Save");
        $("#tbxMapName").attr("readonly", false);
    } else {
        var jsonFileName = getJsonFileNameFromHiddenField();
        var fs = require('fs');
        var path = require('path');
        var obj = JSON.parse(fs.readFileSync(getFullPath(jsonFileName), 'utf-8'));
        obj['originalFileName'] = $("#tbxMapName").val();
        obj['lastModified'] = Date.now();
        var jsonToWrite = JSON.stringify(obj, null, 4);
        fs.writeFile(getFullPath(jsonFileName), jsonToWrite, function (err) {
            if (err)
                alert(err);
        });
        $("#btnEditName").html("Edit");
        $("#tbxMapName").attr("readonly", true);
    }
}

function handleDisableAllClick() {
    var jsonFileName = getJsonFileNameFromHiddenField();
    if (confirm('Disable all?')) {
        var fs = require('fs');
        var obj = JSON.parse(fs.readFileSync(getFullPath(jsonFileName), 'utf-8'));
        var items = obj['items'];
        $.each(items, function (index, value) {
            value.item.disabled = '1';
        });
        var jsonToWrite = JSON.stringify(obj, null, 4);
        var fileNameToWrite = getFullPath(jsonFileName);
        fs.writeFile(fileNameToWrite, jsonToWrite, function (err) {
            if (err)
                alert(err);
            reloadImageFile();
        });
    }
}

function handleEnableAllClick() {
    var jsonFileName = getJsonFileNameFromHiddenField();
    if (confirm('Enable all?')) {
        var fs = require('fs');
        var obj = JSON.parse(fs.readFileSync(getFullPath(jsonFileName), 'utf-8'));
        var items = obj['items'];
        $.each(items, function (index, value) {
            delete value.item.disabled;
        });
        var jsonToWrite = JSON.stringify(obj, null, 4);
        var fileNameToWrite = getFullPath(jsonFileName);
        fs.writeFile(fileNameToWrite, jsonToWrite, function (err) {
            if (err)
                alert(err);
            reloadImageFile();
        });
    }
}

function reloadImageFile() {
    var path = require('path');
    var jsonFileName = getJsonFileNameFromHiddenField();
    var imageFileName = getImageFileName(jsonFileName);
    var dirName = getDirectoryFromFileName(jsonFileName);
    var fullFileName = path.join("data",dirName, imageFileName);
    Caman("#cvsImage", fullFileName, function () {
        // manipulate image here
        //this.brightness(5).render();
        this.render();
        var canvasHeight = $("#cvsImage").height();
        var canvasWidth = $("#cvsImage").width();
        $("#sliderLeft").height(canvasHeight);
        $("#sliderRight").height(canvasHeight);
        $("#sliderTop").width(canvasWidth);
        $("#sliderBottom").width(canvasWidth);
        $("#sliderLeft").slider({
            max: $("#cvsImage").height()
        });
        $("#sliderRight").slider({
            max: $("#cvsImage").height()
        });
        $("#sliderTop").slider({
            max: $("#cvsImage").width()
        });
        $("#sliderBottom").slider({
            max: $("#cvsImage").width()
        });
        showWordBoxes(jsonFileName);
        displayAllAnswers(jsonFileName);
        showMapName(jsonFileName);
        add_loadJsonInMemory();
    });
}

Date.prototype.yyyymmddHHMMss = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    var HH = (this.getHours()).toString();
    var MM = this.getMinutes().toString();
    var ss = this.getSeconds().toString();
    return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0])+(HH[1]?HH:"0"+HH[0])+(MM[1]?MM:"0"+MM[0])+(ss[1]?ss:"0"+ss[0]); // padding
};


function selectFile() {
    chooseFile('#fileDialog');
}

function handleSliderChanged() {
    Caman("#cvsImage", function () {
        this.render(function () {
            var jsonFileName = getJsonFileNameFromHiddenField();
            showWordBoxes(jsonFileName);
            redrawBoundaries();
        });
    });
}

function redrawBoundaries() {
    var currWidth = $("#cvsImage").width();
    var currHeight = $("#cvsImage").height();
    var elCanvas = document.getElementById("cvsImage");
    var ctx = elCanvas.getContext("2d");
    //draw for left slider
    var leftVal = $("#sliderLeft").slider("option", "value");
    ctx.beginPath();
    ctx.moveTo(0, currHeight - leftVal);
    ctx.lineTo(currWidth, currHeight - leftVal);
    ctx.stroke();
    //draw for right slider
    var rightVal = $("#sliderRight").slider("option", "value");
    ctx.beginPath();
    ctx.moveTo(0, currHeight - rightVal);
    ctx.lineTo(currWidth, currHeight - rightVal);
    ctx.stroke();
    //draw for top slider
    var topVal = $("#sliderTop").slider("option", "value");
    ctx.beginPath();
    ctx.moveTo(topVal, 0);
    ctx.lineTo(topVal, currHeight);
    ctx.stroke();
    //draw for bottom slider
    var bottomVal = $("#sliderBottom").slider("option", "value");
    ctx.beginPath();
    ctx.moveTo(bottomVal, 0);
    ctx.lineTo(bottomVal, currHeight);
    ctx.stroke();
}

function getParameterByName(name) //courtesy Artem
{
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}

function clearAnswerBoxes() {
    $("#answer").val('');
}

function deleteItem(jsonFileName, id) {
    if (confirm('Delete?')) {
        var fs = require('fs');
        var path = require('path');
        var obj = JSON.parse(fs.readFileSync(getFullPath(jsonFileName), 'utf-8'));
        var items = obj['items'];
        items = $.grep(items, function (e) {
            return e['item'].id !== id;
        });
        obj['items'] = items;
        var jsonToWrite = JSON.stringify(obj, null, 4);
        var fileNameToWrite = getFullPath(jsonFileName);
        fs.writeFile(fileNameToWrite, jsonToWrite, function (err) {
            if (err)
                alert(err);
            reloadImageFile();
        });
    }
}

function disableItem(jsonFileName, id, alreadyDisabled) {
    var question = '';
    if (alreadyDisabled) {
        question = 'Enable?';
    } else {
        question = 'Disable?';
    }
    if (confirm(question)) {
        var fs = require('fs');
        var path = require('path');
        var obj = JSON.parse(fs.readFileSync(getFullPath(jsonFileName), 'utf-8'));
        var items = obj['items'];
        //var item = $.grep(items, function (e) {
        //    return e['item'].id === id;
        //});
        $.each(items, function (index, value) {
            if (value.item.id === id) {
                if (!alreadyDisabled) {
                    value.item.disabled = '1';
                } else {
                    delete value.item.disabled;
                }
            }
        });
        
        
        var jsonToWrite = JSON.stringify(obj, null, 4);
        var fileNameToWrite = getFullPath(jsonFileName);
        fs.writeFile(fileNameToWrite, jsonToWrite, function (err) {
            if (err)
                alert(err);
            reloadImageFile();
        });
    }
}

function sortByAnswer(a, b) {
    if (a.item.answer < b.item.answer)
        return -1;
    if (a.item.answer > b.item.answer)
        return 1;
    return 0;
}

function displayAllAnswers(jsonFileName) {
    var fs = require('fs');
    var path = require('path');
    var obj = JSON.parse(fs.readFileSync(getFullPath(jsonFileName), 'utf-8'));
    var items = obj['items'];
    items.sort(sortByAnswer);
    $("#lstAnswers").html('');
    $.each(items, function (index, obj) {
        var disabled = obj['item'].disabled;
        var clickevent = "deleteItem('" + jsonFileName + "'," + obj['item'].id +")";
        var disableClickEvent = "disableItem('" + jsonFileName + "'," + obj['item'].id + "," + disabled + ")";
        var btnId = 'del_' + obj['item'].id;
        var delButtonHtml = '<button id="' + btnId + '" class="btn btn-danger btn-xs" onclick="' + clickevent + '">Delete</button>';
        var disableButtonHtml = '';
        var liBackgroundColor = '#ffffff';
        if (disabled !== "1") {
            disableButtonHtml = '<button id="' + btnId + '" class="btn btn-warning btn-xs" onclick="' + disableClickEvent + '">Disable</button>';
        } else {
            liBackgroundColor = '#d3d3d3';
            disableButtonHtml = '<button id="' + btnId + '" class="btn btn-warning btn-xs" onclick="' + disableClickEvent + '">Enable</button>';
        }
        var li = $('<li/>', {
            html: delButtonHtml + ' ' + disableButtonHtml + ' ' + obj['item'].answer
        });
        $(li).css('background-color', liBackgroundColor);
        $("#lstAnswers").append(li);
    });
}

function newImage() {
    $("#lstAnswers").html('');
}

function saveAnnotations() {
    var fileName = $("#hdnFileName").html();
    var dirName = fileName.split('_')[1];
    if ($.trim($("#answer").val()) === '') {
        alert('Name cannot be blank');
        return;
    }
    var answer = $("#answer").val();
    var currHeight = $("#cvsImage").height();
    var leftSliderVal = currHeight - $("#sliderLeft").slider("option", "value");
    var rightSliderVal = currHeight - $("#sliderRight").slider("option", "value");
    var topSliderVal =  $("#sliderTop").slider("option", "value");
    var bottomSliderVal =  $("#sliderBottom").slider("option", "value");
    var leftVal = (topSliderVal < bottomSliderVal) ? topSliderVal : bottomSliderVal;
    var rightVal = (bottomSliderVal > topSliderVal) ? bottomSliderVal : topSliderVal;
    var topVal = (leftSliderVal < rightSliderVal) ? leftSliderVal : rightSliderVal;
    var bottomVal = (rightSliderVal > leftSliderVal) ? rightSliderVal : leftSliderVal;

    var fs = require('fs');
    var path = require('path');
    var jsonFileName = path.join('data',dirName, fileName + '.json');
    var obj = JSON.parse(fs.readFileSync(jsonFileName, 'utf-8'));
    var ids = $(obj['items']).map(function() {
        return $(this)[0]['item'].id;
    });
    var maxid = ids.length === 0 ? 0 : Array.max(ids);
    var lastDateModified = Date.now();
    obj['lastModified'] = lastDateModified;
    var json = {
        'item': {
            'id': maxid + 1, 'answer': answer, 
            'lines': [
                { 'line': [leftVal, bottomVal, leftVal, topVal] },
                { 'line': [leftVal, topVal, rightVal, topVal] },
                { 'line': [rightVal, topVal, rightVal, bottomVal] },
                { 'line': [rightVal, bottomVal, leftVal, bottomVal] }
            ]
        }
    };
    obj['items'].push(json);
    var jsonToWrite = JSON.stringify(obj,null,4);
    fs.writeFile(jsonFileName, jsonToWrite, function(err) {
        if (err)
            alert(err);
        reloadImageFile();
        clearAnswerBoxes();
    });
}

Array.max = function (array) {
    return Math.max.apply(Math, array);
};

Array.min = function (array) {
    return Math.min.apply(Math, array);
};

function add_getJsonFileNameFromHiddenField() {
    return $("#hdnFileName").html() + ".json";
}

function add_loadJsonInMemory() {
    var jsonFileName = add_getJsonFileNameFromHiddenField();
    var fs = require('fs');
    var obj = JSON.parse(fs.readFileSync(getFullPath(jsonFileName), 'utf-8'));
    window.items = obj['items'];
    window.lastModified = obj['lastModified'];
}

function handleRightClick(canvasX, canvasY, rect) {
    var items = window.items;
    $.each(items, function (index, obj) {
        var value = obj.item;
        var id = parseInt(value['id']);
        if ($.inArray(id, window.answeredItemsIds) === -1) {
            var disabled = value['disabled'];
            var disabledMenuKeyword = '';
            if (disabled === '1') {
                disabledMenuKeyword = 'Enable ';
            } else {
                disabledMenuKeyword = 'Disable ';
            }
            var lines = value['lines'];
            var vertX = [];
            var vertY = [];
            $.each(lines, function (index1, lineItem) {
                var point1X = lineItem['line'][0];
                var point1Y = lineItem['line'][1];
                vertX.push(point1X);
                vertY.push(point1Y);
            });
            if (pnpoly(4, vertX, vertY, canvasX, canvasY)) {
                var gui = require('nw.gui'),
                    menu = new gui.Menu(),
                    mnuDelete = new gui.MenuItem({
                        label: "Delete " + value['answer'],
                        click: function () {
                            deleteItem(add_getJsonFileNameFromHiddenField(), id);
                        }
                    }),
                    mnuDisable = new gui.MenuItem({
                        label: disabledMenuKeyword + value['answer'],
                        click: function () {
                            disableItem(add_getJsonFileNameFromHiddenField(), id, disabled);
                        }
                    });
                menu.append(mnuDelete);
                menu.append(mnuDisable);
                menu.popup(canvasX+rect.left, canvasY+rect.top);
            }
        }
    });
}