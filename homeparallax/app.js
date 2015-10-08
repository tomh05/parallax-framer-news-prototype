var screenWidth = 1080;
var smallHeight = 432;
var smallHeight = 300;
var largeHeight = screenWidth-smallHeight;

var pages = Array();
var pager = new Layer({
    x:0, y:0,
    width: 1080,
    height: 1701,
    backgroundColor: "transparent"
});
var pagerContent = new Layer({
    x:0, y:0,
    width: 1080,
    height: 2000,
    superLayer: pager,
    backgroundColor: "transparent"
});

var Item = function(imgSrc) {
    this.layer = new Layer({
        x:0, y:0,
        width: 1080,
        height: 1080,
        image: imgSrc
    });
    this.label = new Layer({
        x:0, y:0,
        width: 108,
        height: 108,
        superLayer: this.layer
    });
    this.label.html = "<h1>"+pages.length + "</h1>";
    this.layer.superLayer = pagerContent;
}


pages.push(new Item("images/bg_01.jpg"));
pages.push(new Item("images/bg_02.jpg"));
pages.push(new Item("images/bg_03.jpg"));
pages.push(new Item("images/bg_04.jpg"));
pages.push(new Item("images/bg_05.jpg"));
pages.push(new Item("images/bg_06.jpg"));
pages.push(new Item("images/bg_01.jpg"));
pages.push(new Item("images/bg_02.jpg"));
pages.push(new Item("images/bg_03.jpg"));
pages.push(new Item("images/bg_04.jpg"));
pages.push(new Item("images/bg_05.jpg"));
pages.push(new Item("images/bg_06.jpg"));

pagerContent.draggable.enabled = true;
pagerContent.draggable.vertical = true;
pagerContent.draggable.horizontal = false;
pagerContent.draggable.momentum = true; //false if we're doing our own

pagerContent.height = (pages.length+2) * smallHeight + largeHeight;
pagerContent.draggable.constraints = {
    x:0,
    y:-pagerContent.height+1700,
    width:1080, 
    height: 2*pagerContent.height-1700};

var dragCallback = function(event,layer){

    var ratio = -layer.y/smallHeight; // how squished up the bottom elements are compared to the current element
    var currIndex = Math.floor(ratio);
    var interp = ratio % 1;
    //console.log("y" + layer.y + " index: "+currIndex + " interp " + interp);

    for (var i =0; i<pages.length; i++) {
        if (i<=currIndex) {
            // off the top, or current card
            pages[i].layer.y = smallHeight*i;
        } else if (i==currIndex+1) {
            //next card
            pages[i].layer.y = (1-interp)*largeHeight + smallHeight*(i);
        } else {
            //queued card
            pages[i].layer.y = largeHeight + smallHeight*(i);
        }
    }

    if (currIndex<0) pages[0].layer.y=0;
};

pagerContent.on("change:y",dragCallback);
dragCallback(0,pagerContent);

