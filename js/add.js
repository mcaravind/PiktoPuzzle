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
            var newFileName = path.join('data', 'file.'+ fileType);
            fs.createReadStream(fileName).pipe(fs.createWriteStream(newFileName));
        });
    });
    chooser.trigger('click');
}

function selectFile() {
    chooseFile('#fileDialog');
}

function handleSliderChanged() {
    Caman("#cvsImage", function () {
        this.render(function () {
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
    console.log(leftVal);
    console.log($("#cvsImage").height());
    console.log($("#cvsImage").width());
    ctx.moveTo(0, currHeight - leftVal);
    ctx.lineTo(currWidth, currHeight - leftVal);
    ctx.stroke();
    //draw for right slider
    var rightVal = $("#sliderRight").slider("option", "value");
    ctx.beginPath();
    console.log(rightVal);
    ctx.moveTo(0, currHeight - rightVal);
    ctx.lineTo(currWidth, currHeight - rightVal);
    ctx.stroke();
    //draw for top slider
    var topVal = $("#sliderTop").slider("option", "value");
    ctx.beginPath();
    console.log(topVal);
    ctx.moveTo(topVal, 0);
    ctx.lineTo(topVal, currHeight);
    ctx.stroke();
    //draw for bottom slider
    var bottomVal = $("#sliderBottom").slider("option", "value");
    ctx.beginPath();
    console.log(bottomVal);
    ctx.moveTo(bottomVal, 0);
    ctx.lineTo(bottomVal, currHeight);
    ctx.stroke();
}

function saveAnnotations() {
    
}