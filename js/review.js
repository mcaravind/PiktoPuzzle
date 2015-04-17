function review_showWordBoxes(jsonFileName) {
    //var fs = require('fs');
    //var path = require('path');
    //var obj = JSON.parse(fs.readFileSync(path.join('data', jsonFileName), 'utf-8'));
    var items = window.items;
    var elCanvas = document.getElementById("cvsImage");
    $.each(items, function (index, obj) {
        var value = obj.item;
        var id = parseInt(value['id']);
        if ($.inArray(id, window.answeredItemsIds) === -1) {
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
        }
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

function loadJsonInMemory() {
    var jsonFileName = review_getJsonFileNameFromHiddenField();
    var fs = require('fs');
    var path = require('path');
    var obj = JSON.parse(fs.readFileSync(path.join('data', jsonFileName), 'utf-8'));
    window.items = obj['items'];
    window.answeredItemsIds = [];
}

function highlightClickedArea(canvasX, canvasY) {
    var items = window.items;
    var elCanvas = document.getElementById("cvsImage");
    $.each(items, function (index, obj) {
        var value = obj.item;
        var id = parseInt(value['id']);
        if ($.inArray(id, window.answeredItemsIds) === -1) {
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
                window.penalty = 0;
                window.hintNumber = 0;
                window.hintPosArray = [];
                $("#divHint").html();
                $("#divPenalty").html();
                ctx.fillStyle = '#adff2f';
                $("#hdnAnswer").html(value['answer']);
                $("#hdnHint").html(value['hint']);
                $("#hdnItemId").html(value['id']);
            } else {
                ctx.fillStyle = '#FFFFFF';
            }
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        }
    });
}

function showHint() {
    var actualAnswer = $("#hdnAnswer").html();
    var allChars = actualAnswer.split('');
    var displayString = '';
    if (window.hintNumber === 0) {
        $.each(allChars, function (index, value) {
            if ($.inArray(index, window.hintPosArray) === -1) {
                displayString += '_ ';
            } else {
                displayString += value + ' ';
            }
        });
        $("#divHint").html(displayString);
        window.hintNumber = 1;
    } else {
        var availableIndices = [];
        $.each(allChars, function(index, value) {
            if ($.inArray(index, window.hintPosArray) === -1) {
                availableIndices.push(index);
            }
        });
        var randomPos = Math.floor(Math.random() * availableIndices.length);
        var randomIndex = availableIndices[randomPos];
        window.hintPosArray.push(randomIndex);
        $.each(allChars, function(index, value) {
            if ($.inArray(index, window.hintPosArray) === -1) {
                displayString += '_ ';
            } else {
                displayString += value + ' ';
            }
        });
        $("#divHint").html(displayString);
    }
    window.penalty += 1;
    $("#divPenalty").html('Penalty: ' + window.penalty.toString());
}

String.prototype.replaceArray = function (find, replace) {
    var replaceString = this;
    for (var i = 0; i < find.length; i++) {
        replaceString = replaceString.replace(find[i], replace[i]);
    }
    return replaceString;
};

function submitAnswer() {
    var actualAnswer = $("#hdnAnswer").html();
    var givenAnswer = $("#answer").val();
    var dist = levDist(actualAnswer.toLowerCase(), givenAnswer.toLowerCase());
    var scalingFactor = 1;
    window.answeredItemsIds.push(parseInt($("#hdnItemId").html()));
    var li = $('<li/>', {
        html: actualAnswer + ' Max Score: ' +(actualAnswer.length * scalingFactor).toString() + '  Your score: '+ ((scalingFactor * actualAnswer.length) - dist - window.penalty).toString()
    });
    $("#lstAnswers").append(li);
    $("#answer").val('');
    $("#hint").val('');
    review_reloadImageFile();
}

//http://www.merriampark.com/ld.htm, http://www.mgilleland.com/ld/ldjavascript.htm, Damerau–Levenshtein distance (Wikipedia)
var levDist = function (s, t) {
    var d = []; //2d matrix

    // Step 1
    var n = s.length;
    var m = t.length;

    if (n === 0) return m;
    if (m === 0) return n;

    //Create an array of arrays in javascript (a descending loop is quicker)
    for (var i = n; i >= 0; i--) d[i] = [];

    // Step 2
    for (var i = n; i >= 0; i--) d[i][0] = i;
    for (var j = m; j >= 0; j--) d[0][j] = j;

    // Step 3
    for (var i = 1; i <= n; i++) {
        var s_i = s.charAt(i - 1);

        // Step 4
        for (var j = 1; j <= m; j++) {

            //Check the jagged ld total so far
            if (i == j && d[i][j] > 4) return n;

            var t_j = t.charAt(j - 1);
            var cost = (s_i == t_j) ? 0 : 1; // Step 5

            //Calculate the minimum
            var mi = d[i - 1][j] + 1;
            var b = d[i][j - 1] + 1;
            var c = d[i - 1][j - 1] + cost;

            if (b < mi) mi = b;
            if (c < mi) mi = c;

            d[i][j] = mi; // Step 6

            //Damerau transposition
            if (i > 1 && j > 1 && s_i === t.charAt(j - 2) && s.charAt(i - 2) === t_j) {
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
            }
        }
    }

    // Step 7
    return d[n][m];
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