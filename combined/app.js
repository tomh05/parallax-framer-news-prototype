////////////////////////////////////////////////////
// Framer prototype 2: Expandable text news
// tom.howe@bbc.co.uk
/////////////////////////////////////////////////////

// load a bunch of layers from a JSON file using photoshop exporter.
importLayers = Framer.Importer.load("imported/p_4_text")
layers_1_1 = Framer.Importer.load("imported/1.1")
layers_1_2 = Framer.Importer.load("imported/1.2")
layers_2_134 = Framer.Importer.load("imported/2.1_2.3_2.4")
layers_2_2 = Framer.Importer.load("imported/2.2")
layers_3_13 = Framer.Importer.load("imported/3.1_3.3")
layers_3_2 = Framer.Importer.load("imported/3.2")
layers_4_1 = Framer.Importer.load("imported/4.1")
layers_4_2 = Framer.Importer.load("imported/4.2")
layers_5_1 = Framer.Importer.load("imported/5.1")
layers_5_23 = Framer.Importer.load("imported/5.2_5.3")
layers_6_12 = Framer.Importer.load("imported/6.1_6.2")

/*
   for (layerName in layers_1_1) {
   console.log(layerName);
   }
   */

// //////////////////////////////
// One of the expandable regions in a storyline
var StorylineElement = function(params,parentObject) {
    this.params = params;
    this.params.parentStory = parentObject;

    // Main container layer (changes size as content expands)
    this.layer = new Layer({
        x:0,y:0,
    width:1080,
    height:300,
    backgroundColor: "transparent"});
    this.layer.parentObject = this;
    this.layer.parentStory = parentObject;

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

        this.headerLayer.parentStory = this.params.parentStory;

        this.headerLayer.on(Events.TouchEnd, function(event, layer) {
            console.log("header clicked");
            console.log(layer.parentStory.scroller.scrolling);
            if (!layer.parentStory.scroller.scrolling) {
                if (layer.parentObject.isExpanded == false) {
                    layer.parentObject.expand();
                } else {
                    layer.parentObject.contract();
                }
            }
        });

        this.layer.on("change:height", function(event, layer) {
            layer.parentStory.recomputeElementPositions();
        });

        // popup
        //var popupParams = { header: params.popup.targetHeader, body: params.popup.targetBody};
        if (params.popup !== undefined) {
            this.popup = new Popup(params.popup);
        }

        //
        // buttons
        if (params.buttons !== undefined) {
            this.buttons = new Array();
            for (var i=0; i< params.buttons.length; i++) {
                var buttonParams = params.buttons[i];
                if (params.buttons[i].type=="popup") {
                    buttonParams.popup = this.popup;
                    /*buttonParams = {type:"popup",
                      destination: this.popup,
                      target: params.buttons[i].target
                      };
                      } else {
                      buttonParams = {type:"url",
                      destination: params.buttons[i].href,
                      target: params.buttons[i].target
                      };
                      */
                }
                var newButton = new Button(buttonParams);
                this.buttons.push(newButton);
            }
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

    this.scrollContent = new Array();
    for (var i=0;i<params.body.length;i++) {
        var layer =  params.body[i];
        layer.superLayer = this.scroller.content;
        layer.x = 0;
        if (i==0){
            layer.y = 0;
        } else {
            layer.y = this.scrollContent[i-1].y + this.scrollContent[i-1].height;
        }
        this.scrollContent.push(layer);
        this.scroller.updateContent();
    }


    // move header to foreground
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
    this.launch = function(target) {
        this.layer.index = 10000;
        this.layer.visible = true;
        this.scroller.scrollToLayer(target,0,0,false);
    }
    this.hide = function() {

        this.layer.visible = false;
    }
}

// //////////////////////////////
// A button that launches popups
var Button = function(params) {
    //TODO: button should change colour on press down
    this.layer = params.layer;
    this.layer.parentObject = this;
    //this.layerHover = params.layerHover;

    //var popupParams = { header: params.targetHeader, body: params.targetBody};
    //this.popup = new Popup(popupParams);
    this.type = params.type;
    if (this.type == "popup") {
        this.popup = params.popup;
        this.popupIndex = params.target;
        this.layer.on(Events.Click, function(event, layer) {
            layer.parentObject.popup.launch(layer.parentObject.popupIndex);
        });
    } else if (this.type == "url") {
        this.layer.url = params.target
            this.layer.on(Events.Click, function(event, layer) {
                window.open(layer.url);
            });

    }

}



var Story = function(params) {

    this.storylineElements = new Array();

    this.addElement = function(params) {
        var storylineElement = new StorylineElement(params,this);
        this.storylineElements.push(storylineElement);
        storylineElement.layer.superLayer = this.storyRegion;
        this.recomputeElementPositions();
    };


    this.tileLayer = new Layer({
        x:0, y:0,
    width: 1080,
    height: 1080,
        backgroundColor: "transparent"
    });

    this.tileBackground = new Layer({
        superLayer:this.tileLayer,
        x:0, y:0,
    width: 1080,
    height: 1080,
    image: params.backgroundImage


    });
    this.tileMask = new Layer({
        superLayer: this.tileLayer,
     x:0, y:0,
    width: 1080,
    height: 1080,
    image: "images/mask.png"
    });
    this.titleLayer = new Layer({
        superLayer: this.tileLayer,
        x:0, y:680,
    width: 678,
    height: 115,
    image: params.titleImage
    });
    this.titleLayer.centerX();

    this.exploreButton = new Layer({
        superLayer: this.tileLayer,
        x:0, y:840,
    width: 201,
    height: 73,
    image: "images/explore more.png"
    });

    this.exploreButton.centerX();
    this.exploreButton.parentObject=this;

        this.exploreButton.on(Events.Click, function(event, layer) {
            layer.parentObject.launchStory();

        });


    this.bodyLayer = new Layer({
        superLayer:this.tileLayer,
        visible: false,
        opacity:0,
        x: 0,
        y: 0,
        width:1080,
        height: 1701,
        backgroundColor: "transparent"
    });

        this.launchStory = function() {
            console.log("launching story");
            this.tileLayer.animate({
                properties: {height:1701,y: -homePagerContent.y}});
            this.tileBackground.animate({
                properties: {height:1701,width: 1701, x:-310}});
            this.tileMask.animate({
                properties: {height:1701,width: 1701, x:-310, opacity: 0}});
            this.exploreButton.animate({
                properties: {opacity: 0}});
            this.titleLayer.animate({
                properties: {opacity: 0}});

            homePagerContent.draggable.enabled = false;

            //scale up background object
            //
            //morph title up
            //
            //:w
            //
            this.bodyLayer.visible = true;
            this.bodyLayer.animate({
                properties: {opacity: 1}});

            for(var i =0; i<stories.length;i++) {
                if (stories[i] !== this) {
                stories[i].tileLayer.animate({
                    properties: {y: 3000}});
                }

            }
        };
    ////////////////////////////////////////////////////////////////////
    // Main Vertical scroller
    this.scroller = new ScrollComponent({
        superLayer: this.bodyLayer,
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
    this.scroller.scrolling  = false;
    console.log(this.scroller);
    this.scroller.on(Events.DirectionLockDidStart, function(Event,layer) { console.log(layer); layer.layer.superLayer.scrolling = true});
    this.scroller.on(Events.ScrollEnd, function(event,layer) { console.log("nop"); layer.layer.superLayer.scrolling = false});

    // Scrollable region that goes inside scroller
    this.storyRegion = new Layer({
        superLayer: this.scroller.content,
        width:1080,
        height:10000,
        backgroundColor:"transparent"});

    // Put each layer inside the scroller. Compute Y positions so they are stacked
    this.recomputeElementPositions = function() {
        if (this.storylineElements.length ==0) return;

        this.storylineElements[0].layer.y = 0;
        for (var i = 1; i<this.storylineElements.length; i++) {
            this.storylineElements[i].layer.y = this.storylineElements[i-1].layer.y + this.storylineElements[i-1].layer.height;
        }
        this.storyRegion.height = this.storylineElements[this.storylineElements.length-1].layer.y + this.storylineElements[this.storylineElements.length-1].layer.height; 

        //TODO: prevent scroll from jumping when content is updated
        //var scrollY = storylineScroller.scrollY;

        //this.scroller.updateContent();
        //storylineScroller.scrollToPoint({x:0,y:scrollY});
    };

    this.recomputeElementPositions();


};




//////////////////////////////////////////////////////
// Create the storyline elements
var stories = new Array();

var story1 = new Story({backgroundImage:"images/bg_story_1.png",
titleImage: "images/title_story_1.png",
});
stories.push(story1);

var story2 = new Story({backgroundImage:"images/bg_story_1.png",
titleImage: "images/title_story_1.png",
});
stories.push(story2);

var story3 = new Story({backgroundImage:"images/bg_story_1.png",
titleImage: "images/title_story_1.png",
});
stories.push(story3);

story1.addElement({
    mainLayer: importLayers["title"],
}
);

console.log("making atom 1");
story1.addElement({
    mainLayer: importLayers["atom_1"],
    expandedLayer: layers_1_1["background"],
    popup: {
        header: layers_1_2["header"],
    body: [layers_1_2["body"]],
    },
    buttons: [{
                 layer: layers_1_1["PERSON_1_hit"],
    layerHover: layers_1_1["PERSON_1_down"],
    type: "popup",
    target: 0,
             }],
}
);
console.log("making atom 2");
story1.addElement({
    mainLayer: importLayers["atom 2"],
    expandedLayer: layers_2_134["background"],
    popup: {
        header: layers_2_2["header-2"],
    body: [layers_2_2["body"]],
    },

    buttons: [{
                 layer: layers_2_134["org_hit"],
    layerHover: layers_2_134["org_down"],
    type: "popup",
    target: 0,
             }],
}
);
console.log("making atom 3");
story1.addElement({
    mainLayer: importLayers["atom_3"],
    expandedLayer: layers_3_13["background"],
    popup: {
        header: layers_3_2["header"],
    body: [layers_3_2["body"]],
    },

    buttons: [{
                 layer: layers_3_13["european_commission_hit"],
    layerHover: layers_3_13["org_down"],
    type: "popup",
    target: 0,
             }],
}
);
console.log("making atom 4");
story1.addElement({
    mainLayer: importLayers["atom_4"],
    expandedLayer: layers_4_1["background"],
    popup: {
        header: layers_4_2["header"],
    body: [layers_4_2["body"]],
    },

    buttons: [{
                 layer: layers_4_1["org_down"],
    layerHover: layers_4_1["org_down"],
    type: "popup",
    target: 0,

             }],
}
);
console.log("making atom 5");
story1.addElement({
    mainLayer: importLayers["atom_5"],
    expandedLayer: layers_5_1["background"],
    popup: {
        header: layers_5_23["header"],
    body: [layers_5_23["person_1"], layers_5_23["person_2"]], //TODO
    },

    buttons: [{
                 layer: layers_5_1["PERSON_1_down"],
    layerHover: layers_5_1["org_down"],
    type: "popup",
    target: layers_5_23["person_1"],

             },{
                 layer: layers_5_1["PERSON_2"],
    layerHover: layers_5_1["org_down"],
    type: "popup",
    target: layers_5_23["person_2"],

             },{
                 layer: layers_5_1["read_more"],
                 type: "url",
                 target: "http://www.bbc.co.uk/news/world-europe-34007859",

             }],
}
);
console.log("making atom 6");
story1.addElement({
    mainLayer: importLayers["atom_6"],
    expandedLayer: layers_6_12["background"],
}
);
console.log("making atom 7");
story1.addElement({
    mainLayer: importLayers["atom_7"],
    externalLink: "http://www.bbc.co.uk/news/world-europe-32988841" // TODO: implement
}
);


// TODO: remove this. It deletes any remaining layers that our importer left over
for (layerName in importLayers) {
    var layer = importLayers[layerName];
    console.log(layerName);
    layer.destroy();

    //layer.on(Events.Click, function(event, layer) {
}


/////////////////////
/// Home Screen scroller
var screenWidth = 1080;
var smallHeight = 432;
var smallHeight = 300;
var largeHeight = screenWidth-smallHeight;

var homePager = new Layer({
    x:0, y:0,
    width: 1080,
    height: 1701,
    backgroundColor: "transparent"
});
var homePagerContent = new Layer({
    x:0, y:0,
    width: 1080,
    height: 2000,
    superLayer: homePager,
    backgroundColor: "transparent"
});


for (var i=0; i <stories.length;i++) {
stories[i].tileLayer.superLayer = homePagerContent;
}

homePagerContent.draggable.enabled = true;
homePagerContent.draggable.vertical = true;
homePagerContent.draggable.horizontal = false;
homePagerContent.draggable.momentum = true; //false if we're doing our own

homePagerContent.height = (stories.length+2) * smallHeight + largeHeight;
homePagerContent.draggable.constraints = {
    x:0,
    y:-homePagerContent.height+1700,
    width:1080, 
    height: 2*homePagerContent.height-1700};

var dragCallback = function(event,layer){

    var ratio = -layer.y/smallHeight; // how squished up the bottom elements are compared to the current element
    var currIndex = Math.floor(ratio);
    var interp = ratio % 1;
    //console.log("y" + layer.y + " index: "+currIndex + " interp " + interp);

    for (var i =0; i<stories.length; i++) {
        if (i<=currIndex) {
            // off the top, or current card
            stories[i].tileLayer.y = smallHeight*i;
        } else if (i==currIndex+1) {
            //next card
            stories[i].tileLayer.y = (1-interp)*largeHeight + smallHeight*(i);
        } else {
            //queued card
            stories[i].tileLayer.y = largeHeight + smallHeight*(i);
        }
    }

    if (currIndex<0) stories[0].tileLayer.y=0;
};

homePagerContent.on("change:y",dragCallback);
dragCallback(0,homePagerContent);



