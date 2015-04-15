function chooseFile(name) {
    var chooser = $(name);
    chooser.change(function (evt) {
        console.log($(this).val());
        var fileName = $(this).val();
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
            var fName = "file_"+(new Date).yyyymmddHHMMss();
            var newFileName = path.join('data', fName + '.' + fileType);
            $("#hdnFileName").html(fName);
            var jsonToWrite = JSON.stringify({ 'fileName': fName + '.' + fileType,'items':[] });
            var newFileJsonName = path.join('data', fName + '.json');
            fs.appendFile(newFileJsonName, jsonToWrite, function (err) {
                if (err)
                    alert(err);
            });
            fs.createReadStream(fileName).pipe(fs.createWriteStream(newFileName));
            newImage();
        });
    });
    chooser.trigger('click');
}

function showWordBoxes(jsonFileName) {
    var fs = require('fs');
    var path = require('path');
    var obj = JSON.parse(fs.readFileSync(path.join('data', jsonFileName), 'utf-8'));
    var items = obj['items'];
    var elCanvas = document.getElementById("cvsImage");
    var ctx = elCanvas.getContext("2d");
    $.each(items, function (index, obj) {
        var value = obj.item;
        var lines = value['lines'];
        $.each(lines, function(index1, lineItem) {
            var point1X = lineItem['line'][0];
            var point1Y = lineItem['line'][1];
            var point2X = lineItem['line'][2];
            var point2Y = lineItem['line'][3];
            ctx.beginPath();
            ctx.moveTo(point1X, point1Y);
            ctx.lineTo(point2X, point2Y);
            ctx.stroke();
        });
        //var top = value.top;
        //var left = value.left;
        //var right = value.right;
        //var bottom = value.bottom;
        //ctx.beginPath();
        //ctx.moveTo(left, top);
        //ctx.lineTo(left, bottom);
        //ctx.stroke();
        //ctx.beginPath();
        //ctx.moveTo(right, bottom);
        //ctx.lineTo(left, bottom);
        //ctx.stroke();
        //ctx.beginPath();
        //ctx.moveTo(right, bottom);
        //ctx.lineTo(right, top);
        //ctx.stroke();
    });
}

function reloadImageFromFile() {
    var jsonFileName = getJsonFileNameFromHiddenField();
    showWordBoxes(jsonFileName);
}

function getJsonFileNameFromHiddenField() {
    return $("#hdnFileName").html() + ".json";
}

function getImageFileName(jsonFileName) {
    var fs = require('fs');
    var path = require('path');
    var obj = JSON.parse(fs.readFileSync(path.join('data',jsonFileName), 'utf-8'));
    var imageFileName = obj['fileName'];
    return imageFileName;
}

function reloadImageFile() {
    var path = require('path');
    var jsonFileName = getJsonFileNameFromHiddenField();
    var imageFileName = getImageFileName(jsonFileName);
    var fullFileName = path.join("data", imageFileName);
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
    $("#hint").val('');
}

function deleteItem(jsonFileName,id) {
    var fs = require('fs');
    var path = require('path');
    var obj = JSON.parse(fs.readFileSync(path.join('data', jsonFileName), 'utf-8'));
    var items = obj['items'];
    items = $.grep(items, function(e) {
        return e['item'].id !== id;
    });
    obj['items'] = items;
    var jsonToWrite = JSON.stringify(obj, null, 4);
    var fileNameToWrite = path.join('data', jsonFileName);
    fs.writeFile(fileNameToWrite, jsonToWrite, function (err) {
        if (err)
            alert(err);
        reloadImageFile();
    });
}

function displayAllAnswers(jsonFileName) {
    var fs = require('fs');
    var path = require('path');
    var obj = JSON.parse(fs.readFileSync(path.join('data', jsonFileName), 'utf-8'));
    var items = obj['items'];
    $("#lstAnswers").html('');
    $.each(items, function (index, obj) {
        var clickevent = "deleteItem('" + jsonFileName + "'," + obj['item'].id + ")";
        var btnId = 'del_' + obj['item'].id;
        var delButtonHtml = '<button id="'+btnId+'" class="btn btn-danger btn-xs" onclick="' + clickevent + '">Delete</button>';
        var li = $('<li/>', {
            html: delButtonHtml + ' '+ obj['item'].answer
        });
        $("#lstAnswers").append(li);
    });
}

function newImage() {
    $("#lstAnswers").html('');
}

function saveAnnotations() {
    var fileName = $("#hdnFileName").html();
    var answer = $("#answer").val();
    var hint = $("#hint").val();
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
    var jsonFileName = path.join('data', fileName + '.json');
    var obj = JSON.parse(fs.readFileSync(jsonFileName, 'utf-8'));
    var ids = $(obj['items']).map(function() {
        return $(this)[0]['item'].id;
    });
    var maxid = ids.length === 0 ? 0 : Array.max(ids);
    
    var json = {
        'item': {
            'id': maxid + 1, 'answer': answer, 'hint': hint,
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