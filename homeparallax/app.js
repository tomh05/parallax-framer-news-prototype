/*
   var superScreen = new Layer({
   x:0, y:0,
   width: 1440,
   height: 2392,
   backgroundColor: "transparent"
   });
//superScreen.center();

this.drawerPager.on(Events.DirectionLockDidStart, function(event, layer) {  scrolling = true; });
*/
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
    //pager.addPage(this.layer,"bottom");
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
    //pager.content.on(Events.Move,function(event,layer){


    var ratio = -layer.y/smallHeight;
    var currIndex = Math.floor(ratio);
    var interp = ratio % 1;
    //console.log("y" + layer.y + " index: "+currIndex + " interp " + interp);

    for (var i =0; i<pages.length; i++) {
        //pages[i].layer.y = layer.y;

            //pages[i].layer.x = 100;
        if (i<currIndex) {
            // off the top
            pages[i].layer.y = smallHeight*i;
        } else if (i==currIndex) {
            //current card
            pages[i].layer.y = smallHeight*i;
            //pages[i].layer.x = 40;
        } else if (i==currIndex+1) {
            //next card
            pages[i].layer.y = (1-interp)*largeHeight + smallHeight*(i);
            //pages[i].layer.x = 80;
        } else {
            //pages[i].layer.y = largeHeight + smallHeight*(currIndex-i);
            //queued card
            pages[i].layer.y = largeHeight + smallHeight*(i);
            //pages[i].layer.x = 120;
        }
    }

    if (currIndex<0) pages[0].layer.y=0;
};

//pager.content.on("change:y",function(event,layer){
pagerContent.on("change:y",dragCallback);
dragCallback(0,pagerContent);
/*

pager.content.on(Events.Move,function(event,layer){
console.log("move!");
});
*/
// The below code almost works...
/*
pagerContent.on(Events.DragEnd,function(event,layer){
    console.log("drag end!");


    console.log(pagerContent.y);

        var ratio = -pagerContent.y/smallHeight;
        console.log(ratio);
        console.log(smallHeight);
        var currIndex = Math.round(ratio);
        if (currIndex<0) currIndex = 0;
        console.log(currIndex);
        var destY = -pages[currIndex].layer.y
    console.log("desty is "+destY);
       pagerContent.animate({
       properties: { y: destY},
       time:0.5
       });

    console.log("set the animation!");
});
*/


/*
   pager.on(Events.DragAnimationDidStart,function(event,layer){
    console.log("drag anim started!");
});

pager.on(Events.DragAnimationDidEnd,function(event,layer){
    console.log("drag anim ended!");
});

//pager.content.on(Events.Move,dragCallback2);
*/
