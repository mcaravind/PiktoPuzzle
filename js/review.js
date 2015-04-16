﻿function review_showWordBoxes(jsonFileName) {
    var fs = require('fs');
    var path = require('path');
    var obj = JSON.parse(fs.readFileSync(path.join('data', jsonFileName), 'utf-8'));
    var items = obj['items'];
    var elCanvas = document.getElementById("cvsImage");
    $.each(items, function (index, obj) {
        var value = obj.item;
        var lines = value['lines'];
        var ctx = elCanvas.getContext("2d");
        ctx.beginPath();
        $.each(lines, function (index1, lineItem) {
            var point1X = lineItem['line'][0];
            var point1Y = lineItem['line'][1];
            var point2X = lineItem['line'][2];
            var point2Y = lineItem['line'][3];
            if (index1 === 0) {
                //to make sure you dont jump off the canvas
                //to draw the next line
                ctx.moveTo(point1X, point1Y);
            }
            ctx.lineTo(point2X, point2Y);
             
        });
        ctx.closePath();
        ctx.fillStyle = '#FFFFFF';
        ctx.stroke();
        ctx.fill();
    });
}

function review_reloadImageFromFile() {
    var jsonFileName = review_getJsonFileNameFromHiddenField();
    review_showWordBoxes(jsonFileName);
}

function relMouseCoords(event) {
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do {
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while (currentElement === currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return { x: canvasX, y: canvasY }
}


HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

function highlightClickedArea(canvasX, canvasY) {
    var jsonFileName = review_getJsonFileNameFromHiddenField();
    var fs = require('fs');
    var path = require('path');
    var obj = JSON.parse(fs.readFileSync(path.join('data', jsonFileName), 'utf-8'));
    var items = obj['items'];
    var elCanvas = document.getElementById("cvsImage");
    $.each(items, function (index, obj) {
        var value = obj.item;
        var lines = value['lines'];
        var ctx = elCanvas.getContext("2d");
        ctx.beginPath();
        var vertX = [];
        var vertY = [];
        $.each(lines, function (index1, lineItem) {
            var point1X = lineItem['line'][0];
            var point1Y = lineItem['line'][1];
            var point2X = lineItem['line'][2];
            var point2Y = lineItem['line'][3];
            vertX.push(point1X);
            vertY.push(point1Y);
            if (index1 === 0) {
                //to make sure you dont jump off the canvas
                //to draw the next line
                ctx.moveTo(point1X, point1Y);
            }
            ctx.lineTo(point2X, point2Y);
        });
        if (pnpoly(4, vertX, vertY, canvasX, canvasY)) {
            ctx.fillStyle = '#32cd32';
        } else {
            ctx.fillStyle = '#FFFFFF';
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    });
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

function review_getJsonFileNameFromHiddenField() {
    return $("#hdnFileName").html() + ".json";
}

function review_getImageFileName(jsonFileName) {
    var fs = require('fs');
    var path = require('path');
    var obj = JSON.parse(fs.readFileSync(path.join('data', jsonFileName), 'utf-8'));
    var imageFileName = obj['fileName'];
    return imageFileName;
}

function review_reloadImageFile() {
    var path = require('path');
    var jsonFileName = review_getJsonFileNameFromHiddenField();
    var imageFileName = review_getImageFileName(jsonFileName);
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
        review_showWordBoxes(jsonFileName);
    });
}

Date.prototype.yyyymmddHHMMss = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    var HH = (this.getHours()).toString();
    var MM = this.getMinutes().toString();
    var ss = this.getSeconds().toString();
    return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]) + (HH[1] ? HH : "0" + HH[0]) + (MM[1] ? MM : "0" + MM[0]) + (ss[1] ? ss : "0" + ss[0]); // padding
};

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

function newImage() {
    $("#lstAnswers").html('');
}

Array.max = function (array) {
    return Math.max.apply(Math, array);
};

Array.min = function (array) {
    return Math.min.apply(Math, array);
};