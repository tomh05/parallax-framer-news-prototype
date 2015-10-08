/////////////////////////////////////////////////////
// Framer prototype 2: Expandable text news
// tom.howe@bbc.co.uk
/////////////////////////////////////////////////////

// load a bunch of layers from a JSON file using photoshop exporter.
importLayers = Framer.Importer.load("imported/p_4_text")
layers_1_1 = Framer.Importer.load("imported/1.1")
layers_1_2 = Framer.Importer.load("imported/1.2")
layers_2_134 = Framer.Importer.load("imported/2.1_2.3_2.4")
layers_2_2 = Framer.Importer.load("imported/2.2")

/*
for (layerName in layers_1_1) {
    console.log(layerName);
}
*/

// //////////////////////////////
// One of the expandable regions in a storyline
var StorylineElement = function(params) {

    // Main container layer (changes size as content expands)
    this.layer = new Layer({
        x:0,y:0,
    width:1080,
    height:300,
    backgroundColor: "transparent"});
    this.layer.parentObject = this;

    // sublayer that holds the text and arrow
    this.headerLayer = new Layer({
        x:0,y:0,
        width:1080,
        height:300,
        backgroundColor: "transparent",
        superLayer: this.layer});
    this.headerLayer.parentObject = this;

    // copy the text layer over from the imported layers and put it inside this.layer
    this.textLayer = params.mainLayer.copySingle();
    this.textLayer.superLayer = this.headerLayer;
    this.textLayer.centerX();
    this.textLayer.y = 60;

    ///
    this.headerLayer.height = this.textLayer.height + 136;
    this.layer.height = this.headerLayer.height;

    // TODO FIX bottom line
    this.bottomLine = importLayers["more_line copy-5-2"].copySingle();
    this.bottomLine.superLayer = this.headerLayer;
    this.bottomLine.centerX();
    this.bottomLine.y = 0;

    this.minimisedHeight = this.layer.height;

    // The expanded layer appears when the main layer is clicked on
    if (params.expandedLayer !== undefined) 
    {
        this.isExpanded = false;
        //The arrow layer on the left hand side
        this.arrowLayer = importLayers["arrow"].copySingle();
        this.arrowLayer.superLayer = this.headerLayer;
        this.arrowLayer.x = 50;
        this.arrowLayer.centerY();
        this.arrowLayer.opacity = 0.3;

        this.expandedLayer = params.expandedLayer;//.copy();
        this.expandedHeight = this.minimisedHeight + this.expandedLayer.height;

        this.expandedLayer.superLayer = this.layer;
        this.expandedLayer.x = 0;
        this.expandedLayer.y = this.minimisedHeight;


        this.expand = function() {
            this.layer.animate({
                properties: {height:this.expandedHeight} });
            this.arrowLayer.animate({
                properties: {rotation:90, opacity: 1} });
            this.isExpanded = true;
        };
        this.contract = function() {
            this.layer.animate({
                properties: {height:this.minimisedHeight} });
            this.arrowLayer.animate({
                properties: {rotation:0, opacity: 0.3} });
            this.isExpanded = false;
        };

        this.headerLayer.on(Events.Click, function(event, layer) {
            if (!scrolling) {
                if (layer.parentObject.isExpanded == false) {
                    layer.parentObject.expand();
                } else {
                    layer.parentObject.contract();
                }
            }
        });

        this.layer.on("change:height", function(event, layer) {
            recomputeElementPositions();
        });

        // buttons
        this.buttons = new Array();
        for (var i=0; i< params.buttons.length; i++) {
            var newButton = new Button(params.buttons[i]);
            this.buttons.push(newButton);
        }
    }
};

// //////////////////////////////
// A popup box
var Popup = function(params) {
    //transparent background layer
    this.layer = new Layer({
        x: 0,
        y: 0,
        width:1080,
        height: 1701,
        backgroundColor: "rgba(0,0,0,0.8)",
    });
    // white container layer
    this.container = new Layer({
        superLayer: this.layer,
        x: 30,
        y: 32,
        width:1080-(2*30),
        height: 1701-(2*32),
        backgroundColor: "#f6f6f6",
    });
    this.header = params.header;
    this.header.superLayer = this.container;
    this.header.x = 0;
    this.header.y = 0;

    this.scroller = new ScrollComponent({
        superLayer: this.container,
        x: 0,
        y: 0,//147,
        width:1080,
        height: 1701,
        scrollHorizontal: false,
        scrollVertical: true,
        directionLock: true,
        directionLockThreshold: {x:10,y:0}
    });

    this.scrollContent = params.body;
    this.scrollContent.superLayer = this.scroller.content;
    this.scrollContent.x = 0;
    this.scrollContent.y = 0;
    console.log("set body");
    console.log(this.scrollContent.superLayer);

    this.header.index = this.scroller.index + 1;

    // close button
    this.closeButton = new Layer({
        superLayer: this.header,
        x: 870,
        y: 0,//147,
        width: 150,
        height: 150,
        backgroundColor: "transparent",
    });
    this.closeButton.parentObject = this;
    this.closeButton.on(Events.Click, function(event, layer) {
        layer.parentObject.hide();
    });

    this.layer.visible = false;
    this.launch = function() {
        this.layer.index = 10000;
        this.layer.visible = true;
    }
    this.hide = function() {

        this.layer.visible = false;
    }
}

// //////////////////////////////
// A button that launches popups
var Button = function(params) {
    //TODO: button should change colour on press down
    console.log("made a button");
    console.log(params);
    this.layer = params.layer;
    this.layer.parentObject = this;
    this.layerHover = params.layerHover;

    var popupParams = { header: params.targetHeader, body: params.targetBody};
    this.popup = new Popup(popupParams);

        this.layer.on(Events.Click, function(event, layer) {
            console.log("clicked button");
            layer.parentObject.popup.launch();
        });

}

// Create the storyline elements
var storylineElements = new Array();
storylineElements.push(new StorylineElement({
    mainLayer: importLayers["title"],
}
));
storylineElements.push(new StorylineElement({
    mainLayer: importLayers["atom_1"],
    expandedLayer: layers_1_1["background"],
    buttons: [{
        layer: layers_1_1["PERSON_1_hit"],
    layerHover: layers_1_1["PERSON_1_down"],
    targetHeader: layers_1_2["header"],
    targetBody: layers_1_2["body"],
    }],
}
));
storylineElements.push(new StorylineElement({
    mainLayer: importLayers["atom 2"],
    expandedLayer: layers_2_134["background"],
    buttons: [{
        layer: layers_2_134["org_hit"],
    layerHover: layers_2_134["org_down"],
    targetHeader: layers_2_2["header-2"],
    targetBody: layers_2_2["body"],
    }],
}
));

// Main Vertical scroller
var storylineScroller = new ScrollComponent({
    x: 0,
    y: 0,
    width:1080,
    height: 1701,
    scrollHorizontal: false,
    scrollVertical: true,
    directionLock: true,
    directionLockThreshold: {x:10,y:0}
});
// Detect when we're scrolling to prevent the user accidentally clicking on a drawer and opening it
var scrolling  = false;
storylineScroller.on(Events.DirectionLockDidStart, function(Event,layer) { scrolling = true});
storylineScroller.on(Events.ScrollEnd, function(event,layer) { scrolling = false});

// Scrollable region that goes inside storylineScroller
var storyRegion = new Layer({
    superLayer: storylineScroller.content,
    width:1080,
    height:2000,
    backgroundColor:"transparent"});

// Put each layer inside the scroller. Compute Y positions so they are stacked
var recomputeElementPositions = function() {

    storylineElements[0].layer.y = 0;
    for (var i = 1; i<storylineElements.length; i++) {
        storylineElements[i].layer.y = storylineElements[i-1].layer.y + storylineElements[i-1].layer.height;
    }
    storyRegion.height = storylineElements[storylineElements.length-1].layer.y + storylineElements[storylineElements.length-1].layer.height; 

    //TODO: prevent scroll from jumping when content is updated
    //var scrollY = storylineScroller.scrollY;
    storylineScroller.updateContent();
    //storylineScroller.scrollToPoint({x:0,y:scrollY});
};

storylineElements[0].layer.superLayer = storyRegion;
for (var i = 1; i<storylineElements.length; i++) {
    storylineElements[i].layer.superLayer = storyRegion;
}
recomputeElementPositions();

// TODO: remove this. It deletes any remaining layers that our importer left over
for (layerName in importLayers) {
    var layer = importLayers[layerName];
    console.log(layerName);
    layer.destroy();

    //layer.on(Events.Click, function(event, layer) {
}
