// ==UserScript==
// @name         Baka Cobbler
// @namespace    baka-extensions-tool
// @updateURL    https://raw.githubusercontent.com/xzfc/baka-extensions-tool/bakacobbler/ZeachCobbler.user.js
// @downloadURL  https://raw.githubusercontent.com/xzfc/baka-extensions-tool/bakacobbler/ZeachCobbler.user.js
// @contributer  See full list at https://github.com/RealDebugMonkey/ZeachCobbler#contributors-and-used-code
// @version      1.1
// @description  Agario powerups
// @author       DebugMonkey
// @match        http://agar.io
// @match        https://agar.io
// @require      https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.0/lodash.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest

// ==/UserScript==

unsafeWindow.agar = {};
unsafeWindow.agar.region = "";
function exposeReset() {
    var dd = 7071.067811865476;
    unsafeWindow.agar.allCells = {};
    unsafeWindow.agar.myCells = [];
    unsafeWindow.agar.top = [];
    unsafeWindow.agar.ws = "";
    unsafeWindow.agar.dimensions = [-dd,-dd,dd,dd];
    unsafeWindow.agar.rawViewport={x:0,y:0,scale:1};
    unsafeWindow.agar.disableRendering = false;
}
exposeReset();

var _version_ = GM_info.script.version;
var zc_name = GM_info.script.name;
var zc_short_name = zc_name.replace(/[^A-Z]/g, '');

//if (window.top != window.self)  //-- Don't run on frames or iframes
//    return;
//https://cdn.rawgit.com/pockata/blackbird-js/1e4c9812f8e6266bf71a25e91cb12a553e7756f4/blackbird.js
//https://raw.githubusercontent.com/pockata/blackbird-js/cc2dc268b89e6345fa99ca6109ddaa6c22143ad0/blackbird.css
$.getScript("https://cdnjs.cloudflare.com/ajax/libs/canvasjs/1.4.1/canvas.min.js");
$.getScript("https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js");

unsafeWindow.connect2 = unsafeWindow.connect;
jQuery("#canvas").remove();
jQuery("#connecting").after('<canvas id="canvas" width="800" height="600"></canvas>');

(function(d, f) {


    // Options that will always be reset on reload
    var zoomFactor = 10;
    var isGrazing = false;
    var serverIP = "";
    var showVisualCues = true;

    // Game State & Info
    var highScore = 0;
    var timeSpawned = null;
    var grazzerTargetResetRequest = false;
    var nearestVirusID;
    var suspendMouseUpdates = false;
    var grazingTargetFixation = false;
    var selectedBlobID = null;

    // Constants
    var Huge = 2.66,
        Large = 1.25,
        Small = 0.7,
        Tiny = 0.375;
    var Huge_Color = "#FF3C3C",
        Large_Color = "#FFBF3D",
        Same_Color = "#FFFF00",
        Small_Color  = "#00AA00",
        Tiny_Color = "#CC66FF",
        myColor ="#3371FF",
        virusColor ="#666666";
    var lastMouseCoords = { x: 0, y: 0 };
    var ghostBlobs = [];


    // cobbler is the object that holds all user options. Options that should never be persisted can be defined here.
    // If an option setting should be remembered it can
    var cobbler = {
        set grazingMode(val)    {isGrazing = val;},
        get grazingMode()       {return isGrazing;},
        _isAcid : false,
        set isAcid(val)         {this._isAcid = val; setAcid(val);},
        get isAcid()            {return this._isAcid;},

    };
    // utility function to simplify creation of options whose state should be persisted to disk
    function simpleSavedSettings(optionsObject){
        _.forEach(optionsObject, function(defaultValue, settingName){
            var backingVar = '_' + settingName;
            cobbler[backingVar] = GM_getValue(settingName, defaultValue),
            Object.defineProperty(cobbler, settingName, {
                get: function()     { return this[backingVar];},
                set: function(val)  { this[backingVar] = val; GM_setValue(settingName, val); }
            });
        });
    }
    // defines all options that should be persisted along with their default values.
    function makeCobbler(){
        var optionsAndDefaults = {
            "sfxVol"            : 0.5,
            "drawTail"          : false,
            "splitGuide"        : true,
            "absorptionGuide"   : true,
            "debugLevel"        : 0,
            "namesUnderBlobs"   : false,
            "grazerHybridSwitch": false,
            "grazerHybridSwitchMass" : 300,
            "gridLines"         : true,
            "mouseCoordLines"   : false,
            "autoRespawn"       : false,
            "visualizeGrazing"  : true,
            "msDelayBetweenShots" : 100,
            "enableBlobLock"    : false,
            'nextOnBlobLock'    : false,
            'rightClickFires'   : false,
            'showZcStats'       : false,
        };
        simpleSavedSettings(optionsAndDefaults);
    }
    makeCobbler();

    window.cobbler = cobbler;

    // ======================   Property & Var Name Restoration  =======================================================
    var zeach = {
        get connect()       {return Aa;},        // Connect
        get ctx()           {return g;},        // g_context
        get webSocket()     {return r;},        // g_socket
        get myIDs()         {return K;},        // g_playerCellIds
        get myPoints()      {return m;},        // g_playerCells
        get allNodes()      {return D;},        // g_cellsById
        get allItems()      {return v;},        // g_cells
        get mouseX2()       {return fa;},       // g_moveX
        get mouseY2()       {return ga;},       // g_moveY
        get mapLeft()       {return oa;},       // g_minX
        get mapTop()        {return pa;},       // g_minY
        get mapRight()      {return qa;},       // g_maxX
        get mapBottom()     {return ra;},       // g_maxY
        get isShowSkins()   {return fb;},       // g_showSkins
        // "g_showNames": "va",
        get isNightMode()   {return sa;},       // ??
        get isShowMass()    {return gb;},       // ??
        get gameMode()      {return O;},        // g_mode
        get fireFunction()  {return G;},        // SendCmd
        get isColors()      {return Ka;},       // g_noColors
        get defaultSkins()  {return jb;},       // g_skinNamesA
        get imgCache()      {return T;},       // ???
        get textFunc()      {return ua;},       // CachedCanvas
        get textBlobs()     {return Bb;},       // g_skinNamesB
        get hasNickname()   {return va;},        // g_showNames
        get scale()   {return k;},        //
        // Classes
        get CachedCanvas()  {return ua;},       // CachedCanvas
        get Cell()          {return aa;},        //
        // These never existed before but are useful
        get mapWidth()      {return  ~~(Math.abs(zeach.mapLeft) + zeach.mapRight);},
        get mapHeight()  {return  ~~(Math.abs(zeach.mapTop) + zeach.mapBottom);},
    };


    function restoreCanvasElementObj(objPrototype){
        var canvasElementPropMap = {
            'setValue'   : 'C',                 //
            'render'     : 'L',                 //
            'setScale'   : 'ea',                //
            'setSize'    : 'M',                 //
        };
        _.forEach(canvasElementPropMap, function(newPropName,oldPropName){
            Object.defineProperty(objPrototype, oldPropName, {
                get: function()     { return this[newPropName];},
                set: function(val)  { this[newPropName] = val; }
            });
        });
    }

    // Cell
    function restorePointObj(objPrototype){
        var pointPropMap = {
            'isVirus'     : 'h', //
            'nx'          : 'J', //
            'ny'          : 'K', //
            'setName'     : 'B', //
            'nSize'       : 'q', //
            'ox'          : 's', //
            'oy'          : 't', //
            'oSize'       : 'r', //
            'destroy'     : 'X', //
            'maxNameSize' : 'l', //
            'massText'    : 'O', //
            'nameCache'   : 'o', //
            'isAgitated'  : 'n'
        };
        _.forEach(pointPropMap, function(newPropName,oldPropName){
            Object.defineProperty(objPrototype, oldPropName, {
                get: function()     { return this[newPropName];},
                set: function(val)  { this[newPropName] = val; }
            });
        });
    }

    // ======================   Utility code    ==================================================================
    function isFood(blob){
        return (blob.nSize < 15);
    }
    function getSelectedBlob(){
        if(!_.contains(zeach.myIDs, selectedBlobID)){
            selectedBlobID = zeach.myPoints[0].id;
            //console.log("Had to select new blob. Its id is " + selectedBlobID);
        }
        return zeach.allNodes[selectedBlobID];
    }

    function isPlayerAlive(){
        return !!zeach.myPoints.length;
    }

    function sendMouseUpdate(ws, mouseX2, mouseY2, blob) {
        lastMouseCoords = {x: mouseX2, y: mouseY2};

        if (ws && ws.readyState == ws.OPEN) {
            var blobId = blob ? blob.id : 0;
            var z0 = new ArrayBuffer(13);
            var z1 = new DataView(z0);
            z1.setUint8(0, 16);
            z1.setInt32(1, mouseX2, true);
            z1.setInt32(5, mouseY2, true);
            z1.setUint32(9, blobId, true);
            ws.send(z0);
        }
    }

    function getMass(x){
        return x*x/100;
    }

    function lineDistance( point1, point2 ){
        var xs = point2.nx - point1.nx;
        var ys = point2.ny - point1.ny;

        return Math.sqrt( xs * xs + ys * ys );
    }

    function getVirusShotsNeededForSplit(cellSize){
        return ~~((149-cellSize)/7);
    }

    function calcTTR(element){

        var totalMass = _.sum(_.pluck(zeach.myPoints, "nSize").map(getMass));
        return ~~((((totalMass*0.02)*1000)+30000) / 1000) - ~~((Date.now() - element.splitTime) / 1000);
    }

    function getBlobShotsAvailable(blob) {
        return ~~(Math.max(0, (getMass(blob.nSize)-(35-18))/18));
    }

    function distanceFromCellZero(blob) {
        return isPlayerAlive() ? lineDistance(blob, getSelectedBlob()) :
            Math.sqrt((zeach.mapRight - zeach.mapLeft) * (zeach.mapRight - zeach.mapLeft) + (zeach.mapBottom - zeach.mapTop) * (zeach.mapBottom - zeach.mapTop));
    }

    function getViewport(interpolated) {
        var x =  _.sum(_.pluck(zeach.myPoints, interpolated ? "x" : "nx")) / zeach.myPoints.length;
        var y =  _.sum(_.pluck(zeach.myPoints, interpolated ? "y" : "ny")) / zeach.myPoints.length;
        var totalRadius =  _.sum(_.pluck(zeach.myPoints, interpolated ? "size" : "nSize"));
        var zoomFactor = Math.pow(Math.min(64.0 / totalRadius, 1), 0.4);
        var deltaX = 1024 / zoomFactor;
        var deltaY = 600 / zoomFactor;
        return { x: x, y: y, dx: deltaX, dy: deltaY };
    }

    function getMouseCoordsAsPseudoBlob(){
        return {
            "x": zeach.mouseX2,
            "y": zeach.mouseY2,
            "nx": zeach.mouseX2,
            "ny": zeach.mouseY2,
        };
    }

    // ======================   Grazing code    ==================================================================

    function checkCollision(myBlob, targetBlob, potential){
        // Calculate distance to target
        var dtt = lineDistance(myBlob, targetBlob);
        // Slope and normal slope
        var sl = (targetBlob.ny-myBlob.ny)/(targetBlob.nx-myBlob.nx);
        var ns = -1/sl;
        // y-int of ptt
        var yint1 = myBlob.ny - myBlob.nx*sl;
        if(!(lineDistance(myBlob, potential) < dtt)){
            // get second y-int
            var yint2 = potential.ny - potential.nx * ns;
            var interx = (yint2-yint1)/(sl-ns);
            var intery = sl*interx + yint1;
            var pseudoblob = {};
            pseudoblob.nx = interx;
            pseudoblob.ny = intery;
            if (((targetBlob.nx < myBlob.nx && targetBlob.nx < interx && interx < myBlob.nx) ||
                (targetBlob.nx > myBlob.nx && targetBlob.nx > interx && interx > myBlob.nx)) &&
                ((targetBlob.ny < myBlob.ny && targetBlob.ny < intery && intery < myBlob.ny) ||
                (targetBlob.ny > myBlob.ny && targetBlob.ny > intery && intery > myBlob.ny))){
                if(lineDistance(potential, pseudoblob) < potential.size+100){
                    return true;
                }
            }
        }
        return false;
    }

    function isSafeTarget(myBlob, targetBlob, threats){
        var isSafe = true;
        // check target against each enemy to make sure no collision is possible
        threats.forEach(function (threat){
            if(isSafe) {
                if(threat.isVirus) {
                    //todo once we are big enough, our center might still be far enough
                    // away that it doesn't cross virus but we still pop
                    if(checkCollision(myBlob, targetBlob, threat) )  {
                        isSafe = false;
                    }
                }
                else {
                    if ( checkCollision(myBlob, targetBlob, threat) || lineDistance(threat, targetBlob) <= threat.size + 200) {
                        isSafe = false;
                    }
                }
            }
        });
        return isSafe;
    }

    // All blobs that aren't mine
    function getOtherBlobs(){
        return _.omit(zeach.allNodes, zeach.myIDs);
    }

    // Gets any item which is a threat including bigger players and viruses
    function getThreats(blobArray, myMass) {
        // start by omitting all my IDs
        // then look for viruses smaller than us and blobs substantially bigger than us
        return _.filter(getOtherBlobs(), function(possibleThreat){
            var possibleThreatMass = getMass(possibleThreat.size);

            if(possibleThreat.isVirus) {
                // Viruses are only a threat if we are bigger than them
                return myMass >= possibleThreatMass;
            }
            // other blobs are only a threat if they cross the 'Large' threshhold
            return possibleThreatMass > myMass * Large;
        });
    }

    var throttledResetGrazingTargetId = null;

    function doGrazing() {
        var i;
        if(!isPlayerAlive()) {
            //isGrazing = false;
            return;
        }
        
        if(null === throttledResetGrazingTargetId){
            throttledResetGrazingTargetId = _.throttle(function (){
                grazzerTargetResetRequest = 'all';
                //console.log(~~(Date.now()/1000));
            }, 200);
        }
        
        
        if (grazzerTargetResetRequest == 'all') {
            grazzerTargetResetRequest = false;
            
            for(i = 0; i < zeach.myPoints.length; i++) {
                zeach.myPoints[i].grazingTargetID = false;
            }
        } else if (grazzerTargetResetRequest == 'current') {
            var pseudoBlob = getMouseCoordsAsPseudoBlob();

            pseudoBlob.size = getSelectedBlob().size;
            //pseudoBlob.scoreboard = scoreboard;
            var newTarget = findFoodToEat_old(pseudoBlob,zeach.allItems);
            if(-1 == newTarget){
                isGrazing = false;
                return;
            }
            getSelectedBlob().grazingTargetID = newTarget.id;
        }
        
        // with target fixation on, target remains until it's eaten by someone or
        // otherwise disappears. With it off target is constantly recalculated
        // at the expense of CPU
        if(!grazingTargetFixation) {
            throttledResetGrazingTargetId();
        }

        var target;


        var targets = findFoodToEat();
        for(i = 0; i < zeach.myPoints.length; i++) {
            var point = zeach.myPoints[i];
            
            if (point.id != getSelectedBlob().id)
                continue;

            point.grazingMode = isGrazing;
            if(cobbler.grazerHybridSwitch) {
                var mass = getMass(point.nSize);
                // switch over to new grazer once we pass the threshhold
                if(1 === point.grazingMode && mass > cobbler.grazerHybridSwitchMass){
                    point.grazingMode = 2; // We gained enough much mass. Use new grazer.
                }else if(2 === point.grazingMode && mass < cobbler.grazerHybridSwitchMass ){
                    point.grazingMode = 1; // We lost too much mass. Use old grazer.
                }
            }
            switch(point.grazingMode) {
                case 1: {

                    if(!zeach.allNodes.hasOwnProperty(point.grazingTargetID)) {
                        target = findFoodToEat_old(point, zeach.allItems);
                        if(-1 == target){
                            point.grazingMode = 2;
                            return;
                        }
                        point.grazingTargetID = target.id;
                    } else {
                        target = zeach.allNodes[point.grazingTargetID];
                    }
                    sendMouseUpdate(zeach.webSocket, target.x + Math.random(), target.y + Math.random());
                
                break;
                }
                case 2: {
                    target = _.max(targets, "v");
                    sendMouseUpdate(zeach.webSocket, target.x + Math.random(), target.y + Math.random());
                    
                    break;
                }
            }
        }

    }

    function dasMouseSpeedFunction(id, cx, cy, radius, nx, ny) {
        this.cx = cx; this.cy = cy; this.radius = radius; this.nx = nx; this.ny = ny;
        this.value = function(x, y) {
            x -= this.cx; y -= this.cy;
            var lensq = x*x + y*y;
            var len = Math.sqrt(lensq);

            var val = x * this.nx + y * this.ny;
            if (len > this.radius) {
                return {
                    id : id,
                    v: val / len,
                    dx: y * (this.nx * y - this.ny * x) / (lensq * len),
                    dy: x * (this.ny * x - this.nx * y) / (lensq * len),
                };
            } else {
                return {id: id, v: val / this.radius, dx: this.nx, dy: this.ny};
            }
        };
    }

    function dasBorderFunction(l, t, r, b, w) {
        this.l = l; 
        this.t = t;
        this.r = r; 
        this.b = b; 
        this.w = w;
        this.value = function(x, y) {
            var v = 0, dx = 0, dy = 0;
            if (x < this.l) {
                v += this.l - x;
                dx = -this.w;
            } else if (x > this.r) {
                v += x - this.r;
                dx = this.w;
            }

            if (y < this.t) {
                v += this.t - y;
                dy = -this.w;
            } else if (y > this.b) {
                v += y - this.b;
                dy = this.w;
            }

            return {v: v * this.w, dx: dx, dy: dy};
        };
    }

    function dasSumFunction(sumfuncs) {
        this.sumfuncs = sumfuncs;
        this.value = function(x, y) {
            return sumfuncs.map(function(func) {
                return func.value(x, y);
            }).reduce(function (acc, val) {
                acc.v += val.v; acc.dx += val.dx; acc.dy += val.dy;
                return acc;
            });
        };
    }

    function gradient_ascend(func, step, iters, id, x, y) {
        var max_step = step;

        var last = func.value(x, y);

        while(iters > 0) {
            iters -= 1;

            x += last.dx * step;
            y += last.dy * step;
            var tmp = func.value(x, y);
            if (tmp.v < last.v) {
                step /= 2;
            } else {
                step = Math.min(2 * step, max_step);
            }
            //console.log([x, y, tmp[0], step]);

            last.v = tmp.v;
            last.dx = (last.dx + tmp.dx)/2.0;
            last.dy = (last.dy + tmp.dy)/2.0;
        }

        return {id: id, x: x, y: y, v: last.v};
    }

    function augmentBlobArray(blobArray) {

        blobArray = blobArray.slice();

        var curTimestamp = Date.now();

        // Outdated blob id set
        var ghostSet = [];

        blobArray.forEach(function (element) {
            ghostSet[element.id] = true;
            element.lastTimestamp = curTimestamp;
        });

        var viewport = getViewport(false);

        ghostBlobs = _.filter(ghostBlobs, function (element) {
            return !ghostSet[element.id] && // a fresher blob with the same id doesn't exist in blobArray already
                (curTimestamp - element.lastTimestamp < 10000) && // last seen no more than 10 seconds ago
                (
                    (Math.abs(viewport.x - element.nx) > (viewport.dx + element.nSize) * 0.9) ||
                    (Math.abs(viewport.y - element.ny) > (viewport.dy + element.nSize) * 0.9)
                ); // outside of firmly visible area, otherwise there's no need to remember it
        });

        ghostBlobs.forEach(function (element) {
            blobArray.push(element);
        });

        ghostBlobs = blobArray;

        return blobArray;
    }
    function findFoodToEat() {
        blobArray = augmentBlobArray(zeach.allItems);

        zeach.myPoints.forEach(function(cell) {
            cell.gr_is_mine = true;
        });

        var accs = zeach.myPoints.map(function (cell) {
            

            var per_food = [], per_threat = [];
            var acc = {
                id : cell.id,
                fx: 0,
                fy: 0,
                x: cell.nx,
                y: cell.ny,
                size : cell.nSize,
                per_food: per_food,
                per_threat: per_threat,
                cumulatives: [ { x: 0, y: 0}, { x: 0, y: 0} ],
            };
            
            var totalMass = _.sum(_.pluck(zeach.myPoints, "nSize").map(getMass));

            // Avoid walls too
            var wallArray = [];
            wallArray.push({id: -2, nx: cell.nx, ny: zeach.mapTop - 1, nSize: cell.nSize * 30});
            wallArray.push({id: -3, nx: cell.nx, ny: zeach.mapBottom + 1, nSize: cell.nSize * 30});
            wallArray.push({id: -4, ny: cell.ny, nx: zeach.mapLeft - 1, nSize: cell.nSize * 30});
            wallArray.push({id: -5, ny: cell.ny, nx: zeach.mapRight + 1, nSize: cell.nSize * 30});
            wallArray.forEach(function(el) {
                // Calculate repulsion vector
                var vec = { id: el.id, gr_type: true, x: cell.nx - el.nx, y: cell.ny - el.ny };
                var dist = Math.sqrt(vec.x * vec.x + vec.y * vec.y);

                // Normalize it to unit length
                vec.x /= dist;
                vec.y /= dist;

                // Walls have pseudo-size to generate repulsion, but we can move farther.
                dist += cell.nSize / 2.0;

                dist = Math.max(dist, 0.01);

                // Walls. Hate them muchly.
                dist /= 10;

                // The more we're split and the more we're to lose, the more we should be afraid.
                dist /= cell.nSize * Math.sqrt(zeach.myPoints.length);

                // The farther they're from us the less repulsive/attractive they are.
                vec.x /= dist;
                vec.y /= dist;

                if(!isFinite(vec.x) || !isFinite(vec.y)) {
                    return;
                }

                // Save element-produced force for visualization
                per_threat.push(vec);

                // Sum forces from all threats
                acc.fx += vec.x;
                acc.fy += vec.y;
            });

            blobArray.forEach(function(el) {
                var vec = { id: el.id, x: cell.nx - el.nx, y: cell.ny - el.ny };

                if(el.gr_is_mine) {
                    return; //our cell, ignore
                } else if( !el.isVirus && (getMass(el.nSize) * 4 <= getMass(cell.nSize) * 3)) {
                    //if(!el.isVirus && (getMass(el.nSize) <= 9)) {
                    //vec.gr_type = null; //edible
                } else if (!el.isVirus && (getMass(el.nSize) * 3 < (getMass(cell.nSize) * 4))) {
                    return; //not edible ignorable
                    // TODO: shouldn't really be so clear-cut. Must generate minor repulsion/attraction depending on size.
                } else {
                    vec.gr_type = true; //threat
                }

                // Calculate repulsion vector
                var dist = Math.sqrt(vec.x * vec.x + vec.y * vec.y);

                // Normalize it to unit length
                vec.x /= dist;
                vec.y /= dist;

                if(el.nSize > cell.nSize) {
                    if(el.isVirus) {
                        // Viruses are only a threat if they're smaller than us
                        return;
                    }

                    // Distance till consuming
                    dist -= el.nSize;
                    dist += cell.nSize /　3.0;
                    dist -= 11;

                    dist = Math.max(dist, 0.01);

                    // Prioritize targets by size
                    if(!vec.gr_type) {
                        //Non-threat
                        dist /= el.nSize;
                    } else {
                        var ratio = getMass(el.nSize) / getMass(cell.nSize);
                        // Cells that 1 to 8 times bigger are the most dangerous.
                        // Prioritize them by a truncated parabola up to 6 times.

                        // when we are fractured into small parts, we might underestimate
                        // how cells a lot bigger than us can be interested in us as a conglomerate of mass.
                        // So calculate threat index for our total mass too.
                        var ratio2 = getMass(el.nSize) / totalMass;
                        if(ratio2 < 4.5 && ratio > 4.5) {
                            ratio2 = 4.5;
                        }

                        ratio = Math.min(5, Math.max(0, - (ratio - 1) * (ratio - 8))) + 1;
                        ratio2 = Math.min(5, Math.max(0, - (ratio2 - 1) * (ratio2 - 8))) + 1;
                        ratio = Math.max(ratio, ratio2);

                        // The more we're split and the more we're to lose, the more we should be afraid.
                        dist /= ratio * cell.nSize * Math.sqrt(zeach.myPoints.length);
                    }

                } else {
                    // Distance till consuming
                    dist += el.nSize * 1 / 3;
                    dist -= cell.nSize;
                    dist -= 11;

                    if(el.isVirus) {
                        if(zeach.myPoints.length >= 16 ) {
                            // Can't split anymore so viruses are actually a good food!
                            delete vec.gr_type; //vec.gr_type = null;
                        } else {
                            // Hate them a bit less than same-sized blobs.
                            dist *= 2;
                        }
                    }

                    dist = Math.max(dist, 0.01);

                    // Prioritize targets by size
                    dist /= el.nSize;
                }

                if(!vec.gr_type) {
                    //Not a threat. Make it attractive.
                    dist = -dist;
                }

                // The farther they're from us the less repulsive/attractive they are.
                vec.x /= dist;
                vec.y /= dist;

                if(!isFinite(vec.x) || !isFinite(vec.y)) {
                    return;
                }

                // Save element-produced force for visualization
                (vec.gr_type ? per_threat : per_food).push(vec);

                // Sum forces per target type
                var cumul = acc.cumulatives[!vec.gr_type ? 1 : 0];
                cumul.x += vec.x;
                cumul.y += vec.y;
            });

            // Sum forces from all sources
            acc.fx += _.sum(_.pluck(acc.cumulatives, "x"));
            acc.fy += _.sum(_.pluck(acc.cumulatives, "y"));

            // Save resulting info for visualization
            cell.grazeInfo = acc;
            return acc;
        });
        
        var funcs = accs.map(function(acc) {
            return new dasMouseSpeedFunction(acc.id, acc.x, acc.y, 200, acc.fx, acc.fy);
        });

        // Pick gradient ascent step size for better convergence
        // so that coord jumps don't exceed ~50 units
        var step = _.sum(accs.map(function(acc) {
            return Math.sqrt(acc.fx * acc.fx + acc.fy * acc.fy);
        }));
        step = 50 / step;
        if(!isFinite(step)) {
            step = 50;
        }

        var viewport = getViewport(false);
        funcs.push(
            new dasBorderFunction(
                viewport.x - viewport.dx,
                viewport.y - viewport.dy,
                viewport.x + viewport.dx,
                viewport.y + viewport.dy,
                -1000
            )
        );

        var func = new dasSumFunction(funcs);

        var results = accs.map(function(acc) {
            return gradient_ascend(func, step, 100, acc.id, acc.x, acc.y);
        });


        var reply = {};
        for (var i = 0; i < results.length; i++) {
            reply[results[i].id] = {id : -5, x : results[i].x, y : results[i].y, v : results[i].v};
        }

        return reply;
    }


    function findFoodToEat_old(cell, blobArray){
        var edibles = [];
        var densityResults = [];
        var threats = getThreats(blobArray, getMass(cell.size));
        blobArray.forEach(function (element){
            var distance = lineDistance(cell, element);
            if (!element.isSafeTarget) {
                element.isSafeTarget = {};
            }
            element.isSafeTarget[cell.id] = null;
            if( getMass(element.size) <= (getMass(cell.size) * 0.4) && !element.isVirus){
                if(isSafeTarget(cell, element, threats)){
                    edibles.push({"distance":distance, "id":element.id});
                    element.isSafeTarget[cell.id] = true;
                } else {
                    element.isSafeTarget[cell.id] = false;
                }
            }
        });
        edibles = edibles.sort(function(x,y){return x.distance<y.distance?-1:1;});
        edibles.forEach(function (element){
            var density = calcFoodDensity(cell, zeach.allNodes[element.id], blobArray)/(element.distance*2);
            densityResults.push({"density":density, "id":element.id});
        });
        if(0 === densityResults.length){
            //console.log("No target found");
            return avoidThreats(threats, cell);
            return -1;
        }
        var target = densityResults.sort(function(x,y){return x.density>y.density?-1:1;});
        //console.log("Choosing blob (" + target[0].id + ") with density of : "+ target[0].isVirusensity);
        return zeach.allNodes[target[0].id];
    }

    function avoidThreats(threats, cell){
        // Avoid walls too
        threats.push({x: cell.x, y: zeach.mapTop - 1, size: 1});
        threats.push({x: cell.x, y: zeach.mapBottom + 1, size: 1});
        threats.push({y: cell.y, x: zeach.mapLeft - 1, size: 1});
        threats.push({y: cell.y, x: zeach.mapRight + 1, size: 1});

        var direction = threats.reduce(function(acc, el) {
            // Calculate repulsion vector
            var vec = { x: cell.x - el.x, y: cell.y - el.y };
            var dist = Math.sqrt(vec.x * vec.x + vec.y * vec.y);

            // Normalize it to unit length
            vec.x /= dist;
            vec.y /= dist;

            // Take enemy cell size into account
            dist -= el.size;

            // The farther they're from us the less repulsive they are
            vec.x /= dist;
            vec.y /= dist;

            // Sum forces from all threats
            acc.x += vec.x;
            acc.y += vec.y;

            return acc;
        }, {x: 0, y: 0});

        // Normalize force to unit direction vector
        var dir_norm = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        direction.x /= dir_norm;
        direction.y /= dir_norm;

        if(!isFinite(direction.x) || !isFinite(direction.y)) {
            return -1;
        }

        return { id: -5, x: cell.x + direction.x * cell.size * 5, y: cell.y + direction.y * cell.size * 5 };
    }

    function calcFoodDensity(cell, cell2, blobArray2){
        var MaxDistance2 = 250;
        var pelletCount = 0;
        blobArray2.forEach(function (element2){
            var distance2 = lineDistance(cell2, element2);

            var cond1 = getMass(element2.size) <= (getMass(cell.size) * 0.4);
            var cond2 = distance2 < MaxDistance2;
            var cond3 = !element2.isVirus;
            //console.log(cond1 + " " + distance2 + " " + cell2.isSafeTarget);
            if( cond1 && cond2 && cond3 && cell2.isSafeTarget[cell.id] ){
                pelletCount +=1;
            }
        });

        return pelletCount;
    }
// ======================   UI stuff    ==================================================================

    function drawRescaledItems(ctx) {
        if (showVisualCues && isPlayerAlive()) {
            drawMapBorders(ctx);
            drawGrazingLines_old(ctx);
            drawGrazingLines(ctx);
            if(cobbler.drawTail){
                drawTrailTail(ctx);
            }
            drawMouseCoordLines(ctx);


            drawSplitGuide(ctx, getSelectedBlob());
        }
    }

    function getScoreBoardExtrasString(F) {
        var extras = " ";
        if (showVisualCues) {
            highScore = Math.max(highScore, ~~(F / 100));
            extras += " High: " + highScore.toString();
            if (isPlayerAlive()) {
                extras += "" + isPlayerAlive() ? " Alive: " + (~~((Date.now() - timeSpawned) / 1000)).toString() : "";
            }
        }
        return extras;
    }

    function drawMapBorders(ctx) {
        if (zeach.isNightMode) {
            ctx.strokeStyle = '#FFFFFF';
        }
        ctx.beginPath();
        ctx.moveTo(zeach.mapLeft, zeach.mapTop);        // 0
        ctx.lineTo(zeach.mapRight, zeach.mapTop);       // >
        ctx.lineTo(zeach.mapRight, zeach.mapBottom);    // V
        ctx.lineTo(zeach.mapLeft, zeach.mapBottom);     // <
        ctx.lineTo(zeach.mapLeft, zeach.mapTop);        // ^
        ctx.stroke();
    }

    function drawSplitGuide(ctx, cell) {
        if( !isPlayerAlive() || !cobbler.splitGuide){
            return;
        }
        var radius = 660;
        var centerX = cell.x;
        var centerY = cell.y;
        var hold = ctx.globalAlpha;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius+cell.size, 0, 2 * Math.PI, false);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FF0000';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#00FF00';
        ctx.stroke();
        ctx.globalAlpha = hold;
    }

    function isTeamMode(){
        return (zeach.gameMode === ":teams");
    }
    function setCellColors(cell,myPoints){
        var res = {c:cell.color, a:undefined};
        if(!showVisualCues || isFood(cell)) {
            return res;
        }
        if (myPoints.length > 0 && !isTeamMode()) {
            var size_this =  getMass(cell.size);
            var size_that =  ~~(getSelectedBlob().size * getSelectedBlob().size / 100);
            if (cell.isVirus || myPoints.length === 0) {
                res.a = virusColor;
            } else if (~myPoints.indexOf(cell)) {
                res.a = myColor;
            } else if (size_this > size_that * Huge) {
                res.a = Huge_Color;
            } else if (size_this > size_that * Large) {
                res.a = Large_Color;
            } else if (size_this > size_that * Small) {
                res.a = Same_Color;
            } else if (size_this > size_that * Tiny) {
                res.a = Small_Color;
            } else {
                res.a = Tiny_Color;
            }
        }
        return res;
    }

    function displayDebugText(ctx, agarTextFunction) {

        if(0 >= cobbler.debugLevel) {
            return;
        }

        var textSize = 15;
        var debugStrings = [];
        if(1 <= cobbler.debugLevel) {
            debugStrings.push("v " + _version_);
            debugStrings.push("Server: " + serverIP);

            debugStrings.push("G - grazing: " + (isGrazing ? (1 == isGrazing) ? "Old" : "New" : "Off"));
        }
        if(2 <= cobbler.debugLevel) {
            debugStrings.push("M - suspend mouse: " + (suspendMouseUpdates ? "On" : "Off"));
            debugStrings.push("P - grazing target fixation :" + (grazingTargetFixation ? "On" : "Off"));
            if(grazingTargetFixation){ debugStrings.push("  (T) to retarget");}
            debugStrings.push("O - right click: " + (cobbler.rightClickFires ? "Fires @ virus" : "Default"))
            debugStrings.push("Z - zoom: " + zoomFactor.toString());
            if (isPlayerAlive()) {
                debugStrings.push("Location: " + Math.floor(getSelectedBlob().x) + ", " + Math.floor(getSelectedBlob().y));
            }

        }
        var offsetValue = 20;
        var text = new agarTextFunction(textSize, (zeach.isNightMode ? '#F2FBFF' : '#111111'));

        for (var i = 0; i < debugStrings.length; i++) {
            text.setValue(debugStrings[i]); // setValue
            var textRender = text.render();
            ctx.drawImage(textRender, 20, offsetValue);
            offsetValue += textRender.height;
        }
    }

    function drawLine(ctx, point1, point2, color){
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(point1.x, point1.y);
        ctx.lineTo(point2.x, point2.y);
        ctx.stroke();
    }

    function drawGrazingLines(ctx) {
        if(!isGrazing || !cobbler.visualizeGrazing ||  !isPlayerAlive())
        {
            //console.log("returning early");
            return;
        }
        var oldLineWidth = ctx.lineWidth;
        var oldColor = ctx.color;
        var oldGlobalAlpha = ctx.globalAlpha;

        zeach.myPoints.forEach(function(playerBlob) {
            if(!playerBlob.grazeInfo || playerBlob.grazingMode != 2) {
                return;
            }
            var grazeInfo = playerBlob.grazeInfo;

            var nullVec = { x: 0, y: 0 };
            var cumulatives = grazeInfo.cumulatives;
            var maxSize = 0.001;

            // Render threat forces
            grazeInfo.per_threat.forEach(function (grazeVec){
                var element = zeach.allNodes[grazeVec.id];

                if(!element) return; //Wall or dead or something

                //drawLine(ctx,element, playerBlob, "red" );
                //drawLine(ctx,element, {x: element.x + grazeVec.x / maxSize, y: element.y + grazeVec.y / maxSize }, "red" );
                drawLine(ctx,playerBlob, {x: playerBlob.x + grazeVec.x / maxSize, y: playerBlob.y + grazeVec.y / maxSize }, "red" );

                var grazeVecLen = Math.sqrt(grazeVec.x * grazeVec.x + grazeVec.y * grazeVec.y);

                ctx.globalAlpha = 0.5 / zeach.myPoints.length;
                ctx.beginPath();
                ctx.arc(element.x, element.y, grazeVecLen / maxSize / 20, 0, 2 * Math.PI, false);
                ctx.fillStyle = 'red';
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#FFFFFF';
                ctx.stroke();
                ctx.globalAlpha = 1;
            });

            if(zeach.myPoints.length <= 1) {
                // If we're not fragmented, render fancy food forces
                grazeInfo.per_food.forEach(function (grazeVec){
                    var element = zeach.allNodes[grazeVec.id];

                    if(!element) return; //Wall or dead or something

                    //drawLine(ctx,element, playerBlob, "white" );
                    drawLine(ctx,element, {x: element.x + grazeVec.x / maxSize, y: element.y + grazeVec.y / maxSize }, "green" );
                    //drawLine(ctx,playerBlob, {x: playerBlob.x + grazeVec.x / maxSize, y: playerBlob.y + grazeVec.y / maxSize }, "green" );
                });
            }

            // Prepare to render cumulatives
            maxSize *= grazeInfo.per_threat.length + grazeInfo.per_food.length;
            maxSize /= 10;

            ctx.lineWidth = 10;

            // Render summary force without special forces, like walls
            drawLine(ctx,playerBlob,
                {
                    x: playerBlob.x + (cumulatives[0].x + cumulatives[1].x) / maxSize,
                    y: playerBlob.y + (cumulatives[0].y + cumulatives[1].y) / maxSize,
                }, "gray"
            );

            // Render foods and threats force cumulatives
            drawLine(ctx,playerBlob, {x: playerBlob.x + cumulatives[1].x / maxSize, y: playerBlob.y + cumulatives[1].y / maxSize }, "green" );
            drawLine(ctx,playerBlob, {x: playerBlob.x + cumulatives[0].x / maxSize, y: playerBlob.y + cumulatives[0].y / maxSize }, "red" );

            // Render summary force with special forces, like walls
            ctx.lineWidth = 5;
            drawLine(ctx,playerBlob, {x: playerBlob.x + (grazeInfo.fx) / maxSize, y: playerBlob.y + (grazeInfo.fy) / maxSize }, "orange" );
            ctx.lineWidth = 1;
            drawLine(ctx,playerBlob, {x: playerBlob.x + 300 * (grazeInfo.fx) / maxSize, y: playerBlob.y + 300 * (grazeInfo.fy) / maxSize }, "orange" );
        });

        var viewport = getViewport(true);

        // Render sent mouse coords as a small circle
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(lastMouseCoords.x, lastMouseCoords.y, 0.01 * viewport.dx, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = zeach.isNightMode ? '#FFFFFF' : '#000000';
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Render viewport borders, useful for blob lookout and 10-sec-memoization debugging
        ctx.strokeStyle = zeach.isNightMode ? '#FFFFFF' : '#000000';
        ctx.lineWidth = 5;

        ctx.beginPath();
        ctx.moveTo(viewport.x - viewport.dx, viewport.y - viewport.dy);
        ctx.lineTo(viewport.x + viewport.dx, viewport.y - viewport.dy);
        ctx.lineTo(viewport.x + viewport.dx, viewport.y + viewport.dy);
        ctx.lineTo(viewport.x - viewport.dx, viewport.y + viewport.dy);
        ctx.lineTo(viewport.x - viewport.dx, viewport.y - viewport.dy);
        ctx.stroke();

        ctx.globalAlpha = oldGlobalAlpha;
        ctx.lineWidth = oldLineWidth;
        ctx.color = oldColor;
    }

    function drawTrailTail(ctx) {
        // Render trailing tail that indicates real movement,
        // based on the difference between client-interpolated and real coords.
        var trailScale = 5;
        zeach.myPoints.forEach(function(playerBlob) {
            var d = { x: playerBlob.nx - playerBlob.x, y: playerBlob.ny - playerBlob.y };
            drawLine(ctx,playerBlob, {x: playerBlob.x - d.x * trailScale, y: playerBlob.y - d.y * trailScale }, myColor );
            //drawLine(ctx,{x: playerBlob.ox, y: playerBlob.oy }, {x: playerBlob.nx, y: playerBlob.ny }, "green" );
        });
    }

    function drawMouseCoordLines(ctx) {
        if (cobbler.mouseCoordLines) {
            ctx.globalAlpha = 0.5;
            ctx.lineWidth = 2;
            zeach.myPoints.forEach(function(playerBlob) {
                if (playerBlob.sentMouseCoords)
                    drawLine(ctx,
                             playerBlob,
                             playerBlob.sentMouseCoords,
                             zeach.isNightMode ? '#FFFFFF' : '#000000');
            });
            ctx.globalAlpha = 1;
        }
    }

    function drawGrazingLines_old(ctx) {
        if(!isGrazing || !cobbler.visualizeGrazing ||  !isPlayerAlive())
        {
            //console.log("returning early");
            return;
        }
        var oldLineWidth = ctx.lineWidth;
        var oldColor = ctx.color;
        
        ctx.lineWidth = 10;
        for(var i = 0; i < zeach.myPoints.length; i++) {
            var point = zeach.myPoints[i];
            if (point.grazingMode != 1) {
                continue;
            }
        
            if(_.has(zeach.allNodes, point.grazingTargetID)){
                drawLine(ctx, zeach.allNodes[point.grazingTargetID], point, "green");
            }
        }
        
        ctx.lineWidth = 2;
        for(var i = 0; i < zeach.myPoints.length; i++) {
            var point = zeach.myPoints[i];
            if (point.grazingMode != 1) {
                continue;
            }
            zeach.allItems.forEach(function (element){
                if (!element.isSafeTarget) {
                } else if(element.isSafeTarget[point.id] === true) {
                    drawLine(ctx, element, point, "white" );
                } else if (element.isSafeTarget[point.id] === false) {
                    drawLine(ctx, element, point, "red" );
                } else {
                    //drawLine(ctx,element, getSelectedBlob(), "blue" );
                }
            })
        }
        ctx.lineWidth = oldLineWidth;
        ctx.color = oldColor;

    }

// ======================   Virus Popper    ==================================================================
    function findNearestVirus(cell, blobArray){
        var nearestVirus = _.min(_.filter(blobArray, "isVirus", true), function(element) {
            return lineDistance(cell, element);
        });

        if( Infinity == nearestVirus){
            //console.log("No nearby viruses");
            return -1;
        }
        return nearestVirus;
    }

    function fireAtVirusNearestToBlob(blob, blobArray) {
        console.log("fireAtVirusNearestToBlob");
        var msDelayBetweenShots = cobbler.msDelayBetweenShots;
        nearestVirus = findNearestVirus(blob, blobArray);

        if(-1 == nearestVirus){
            console.log("No Nearby Virus Found");
            console.log(blobArray);
            console.log(blob);
            return;
        }

        // TODO: count availableshots and limit shots sent to  Math.min(shotsNeeded, ShotsAvailable)
        var shotsNeeded = getVirusShotsNeededForSplit(nearestVirus.size);
        var shotsFired = 0 / zeach.myPoints.length;
        if(shotsNeeded <= 0){
            return;
        }

        suspendMouseUpdates = true;
        console.log("Nearest Virus at: ("+ nearestVirus.x + "," + nearestVirus.y + ") requires " + shotsNeeded + " shots.");
        // two mouse updates in a row to make sure new position is locked in.
        sendMouseUpdate(zeach.webSocket, nearestVirus.x + Math.random(), nearestVirus.y + Math.random());
        window.setTimeout(function () { sendMouseUpdate(zeach.webSocket, nearestVirus.x + Math.random(), nearestVirus.y + Math.random()); }, 25);

        // schedules all shots needed spaced evenly apart by of 'msDelayBetweenShots'
        for ( ; shotsFired < shotsNeeded; shotsFired++){
            window.setTimeout(function () {
                sendMouseUpdate(zeach.webSocket, nearestVirus.x + Math.random(), nearestVirus.y + Math.random());
                zeach.fireFunction(21);
            }, msDelayBetweenShots *(shotsFired+1));
        }
        window.setTimeout(function () { suspendMouseUpdates = false;}, msDelayBetweenShots *(shotsFired+1));
    }


    function fireAtVirusNearestToCursor(){
        fireAtVirusNearestToBlob(getMouseCoordsAsPseudoBlob(), zeach.allItems);
    }

// ======================   Skins    ==================================================================
    function customSkins(cell, defaultSkins, imgCache, showSkins, gameMode) {
        var retval = null;
        var userName = cell.name;
        var userNameLowerCase = userName.toLowerCase();
        if(":teams" ==  gameMode)
        {
            retval = null;
        }
        else if(!cell.isAgitated && showSkins ){
            if(-1 != defaultSkins.indexOf(userNameLowerCase)){
                if (!imgCache.hasOwnProperty(userNameLowerCase)){
                    imgCache[userNameLowerCase] = new Image;
                    imgCache[userNameLowerCase].src = "skins/" + userNameLowerCase + ".png";
                }
                if(0 != imgCache[userNameLowerCase].width && imgCache[userNameLowerCase].complete) {
                    retval = imgCache[userNameLowerCase];
                } else {
                    retval = null;
                }
            }
            else {
                retval = null;
            }
        }
        else {
            retval = null;
        }
        return retval;
    }


// ======================   Draw Functions    ==================================================================
    function shouldRelocateName(){
        if(cobbler.namesUnderBlobs && !this.isVirus) {
            return true;
        }
    }

    function drawCellName(isMyCell, kbIndex, itemToDraw){
        var yBasePos;
        var nameCache = this.nameCache;
        yBasePos = ~~this.y;
        // Viruses have empty name caches. If this is a virus with an empty name cache
        // then give it a name of the # of shots needed to split it.
        if(null == nameCache) {
            if (this.isVirus) {
                var virusSize = this.nSize;
                var shotsNeeded = getVirusShotsNeededForSplit(virusSize).toString();
                this.setName(shotsNeeded);
            }
        }

        if((zeach.hasNickname || isMyCell) && (this.name && (nameCache && (null == itemToDraw || -1 == zeach.textBlobs.indexOf(kbIndex)))) ) {

            itemToDraw = nameCache;
            itemToDraw.setValue(this.name);
            itemToDraw.setSize(this.maxNameSize());
            var scale = Math.ceil(10 * zeach.scale) / 10;
            itemToDraw.setScale(scale);

            setVirusInfo(this, itemToDraw, scale);
            itemToDraw = itemToDraw.render();
            var xPos = ~~(itemToDraw.width / scale);
            var yPos = ~~(itemToDraw.height / scale);

            if(shouldRelocateName.call(this)) {
                // relocate names to UNDER the cell rather than on top of it
                zeach.ctx.drawImage(itemToDraw, ~~this.x - ~~(xPos / 2), yBasePos + ~~(yPos ), xPos, yPos);
                yBasePos += itemToDraw.height / 2 / scale + 8;
            }
            else {
                zeach.ctx.drawImage(itemToDraw, ~~this.x - ~~(xPos / 2), yBasePos - ~~(yPos / 2), xPos, yPos);
            }
            yBasePos += itemToDraw.height / 2 / scale + 4;
        }
        return yBasePos;
    }

    function drawCellMass(yBasePos, itemToDraw){
        if(!zeach.isShowMass){
            return;
        }
        if(!(itemToDraw || (0 == zeach.myPoints.length || showVisualCues) && ((!this.isVirus || this.isAgitated) && 20 < this.size))) {
            return;
        }

        var massValue = (~~(getMass(this.size))).toString();
        if(showVisualCues){
            var pct="", shots="", ttr="";
            var isMy = _.contains(zeach.myIDs, this.id);
            if(isPlayerAlive()){
                pct = " " + ~~(this.nSize*this.nSize*100/(getSelectedBlob().nSize*getSelectedBlob().nSize)) + "%";
                if(isMy && _.min(zeach.myPoints, "splitTime").id != this.id){
                    ttr = " ~" + calcTTR(this) + "s"
                }
            }
            if(isMy){
                shots = " (" + getBlobShotsAvailable(this).toString() + ")";
            }
            massValue = massValue + pct + shots + ttr;
        }

        var scale;
        if(null == this.massText) {
            this.massText = new zeach.CachedCanvas(this.maxNameSize() / 1.4, "#FFFFFF", true, "#000000");
        }
        itemToDraw = this.massText;
        itemToDraw.setSize(this.maxNameSize() / 1.4);
        itemToDraw.setValue(massValue); // precalculated & possibly appended
        scale = Math.ceil(10 * zeach.scale) / 10;
        itemToDraw.setScale(scale);

        // Tweak : relocated mass is line is bigger than stock
        itemToDraw.setScale(scale * ( shouldRelocateName.call(this) ? 2 : 1));

        var e = itemToDraw.render();
        var xPos = ~~(e.width / scale);
        var yPos = ~~(e.height / scale);
        if(shouldRelocateName.call(this)) {
            // relocate mass to UNDER the cell rather than on top of it
            zeach.ctx.drawImage(e, ~~this.x - ~~(xPos / 2), yBasePos + ~~(yPos), xPos, yPos);
        }
        else {
            zeach.ctx.drawImage(e, ~~this.x - ~~(xPos / 2), yBasePos - ~~(yPos / 2), xPos, yPos);
        }
    }

// ======================   Misc    ==================================================================

    function switchCurrentBlob() {
        var myids_sorted = _.pluck(zeach.myPoints, "id").sort(); // sort by id
        var indexloc = _.indexOf(myids_sorted, selectedBlobID);
        if(-1 === indexloc){
            selectedBlobID = zeach.myPoints[0].id;
            console.log("Had to select new blob. Its id is " + selectedBlobID);
            return zeach.allNodes[selectedBlobID];
        }
        indexloc += 1;
        if(indexloc >= myids_sorted.length){
            selectedBlobID = zeach.myPoints[0].id;
            console.log("Reached array end. Moving to beginning with id " + selectedBlobID);
            return zeach.allNodes[selectedBlobID];
        }
        selectedBlobID = zeach.myPoints[indexloc].id;
        return zeach.allNodes[selectedBlobID];
    }

    function customKeyDownEvents(d) {
        //if('X'.charCodeAt(0) === d.keyCode && isPlayerAlive()) {
        //        jQuery("#overlays").hide();
        //        jQuery("#ZCOverlay").hide();
        //        isGrazing = 0;
        //        showVisualCues = true;
        //        suspendMouseUpdates = false;
        //        cobbler.enableBlobLock = false;
        //}
        if(jQuery("#overlays").is(':visible')){
            return;
        }

        if(9 === d.keyCode && isPlayerAlive()) {
            d.preventDefault();
            switchCurrentBlob();
        }
        else if('A'.charCodeAt(0) === d.keyCode && isPlayerAlive()){
            cobbler.isAcid = !cobbler.isAcid;
            setAcid(cobbler.isAcid);
        }
        else if('C'.charCodeAt(0) === d.keyCode && isPlayerAlive()) {
            grazzerTargetResetRequest = "all";
            showVisualCues = !showVisualCues;
            if(!showVisualCues) {
                zoomFactor = 10;
            }
        }
        else if('E'.charCodeAt(0) === d.keyCode && isPlayerAlive()){
            fireAtVirusNearestToCursor();
        }
        else if('G'.charCodeAt(0) === d.keyCode && isPlayerAlive()) {
            if(cobbler.grazerHybridSwitch && isGrazing){
                isGrazing = 0;
                return;
            }
            grazzerTargetResetRequest = "all";
            isGrazing = (2 == isGrazing) ? false : 2;
        }
        else if('H'.charCodeAt(0) === d.keyCode && isPlayerAlive()) {
            if(cobbler.grazerHybridSwitch && isGrazing){
                isGrazing = 0;
                return;
            }
            grazzerTargetResetRequest = "all";
            isGrazing = (1 == isGrazing) ? false : 1;
        }
        else if('M'.charCodeAt(0) === d.keyCode && isPlayerAlive()){
            suspendMouseUpdates = !suspendMouseUpdates;
        }
        else if('O'.charCodeAt(0) === d.keyCode && isPlayerAlive()) {
            cobbler.rightClickFires = !cobbler.rightClickFires;
        }
        else if('P'.charCodeAt(0) === d.keyCode && isPlayerAlive()) {
            grazingTargetFixation = !grazingTargetFixation;
        }
        else if('R'.charCodeAt(0) === d.keyCode && isPlayerAlive()){
            fireAtVirusNearestToBlob(getSelectedBlob(),zeach.allItems);
        }
        else if('T'.charCodeAt(0) === d.keyCode && isPlayerAlive() && (1 == isGrazing)) {
            console.log("Retarget requested");
            grazzerTargetResetRequest = "current";
        }
        else if('V'.charCodeAt(0) === d.keyCode && isPlayerAlive()) {
            cobbler.visualizeGrazing = !cobbler.visualizeGrazing;
        }
        else if('Z'.charCodeAt(0) === d.keyCode && isPlayerAlive()) {
            // /*old*/ zoomFactor = (zoomFactor == 10 ? 11 : 10);
            /*new*/ zoomFactor = zoomFactor >= 11 ? 10 : +(zoomFactor + 0.1).toFixed(2);
        }
        else if('1'.charCodeAt(0) <= d.keyCode && '7'.charCodeAt(0) >= d.keyCode && isPlayerAlive()) {
            var id = d.keyCode - '1'.charCodeAt(0);
            if(id >= _.size(zeach.myPoints)) {return; }
            var arr =  _.sortBy(zeach.myPoints, "nSize").reverse();
            selectedBlobID = arr[id].id;
        }
        else if('S'.charCodeAt(0) === d.keyCode && isPlayerAlive()) {
            for(var i = 0; i < zeach.myPoints.length; i++) {
                var point = zeach.myPoints[i];
                point.locked = false;
            }
        }
    }

    function onAfterUpdatePacket() {
        if (!isPlayerAlive()){
            timeSpawned = null;
        }
        if(null == timeSpawned && isPlayerAlive()) {
            timeSpawned = Date.now(); // it's been reported we miss some instances of player spawning
        }
    }

    function onBeforeNewPointPacket() {
        if (0 == _.size(zeach.myPoints)){
            timeSpawned = Date.now();
        }
    }

    function setVirusInfo(cell, ctx, c) {
        ctx.setScale(c * 1.25);
        if (showVisualCues) {
            if (cell.isVirus) {
                cell.nameCache.setValue(getVirusShotsNeededForSplit(cell.nSize));
                var nameSizeMultiplier = 4;
                ctx.setScale(c * nameSizeMultiplier);
            }
        }
        if (cell.isVirus && !showVisualCues) {
            cell.nameCache.setValue(" ");
        }
    }


    function sendMultyMouseUpdate(send_normal) {
        for (var i = 0; i < zeach.myPoints.length; i++) {
            var blob = zeach.myPoints[i];
            var x = zeach.mouseX2;
            var y = zeach.mouseY2;
            if (blob.locked) {
                blob.last_locked--;
                if (blob.last_locked < 0) {
                    continue;
                }
                x = blob.locked_x;
                y = blob.locked_y;
            } else if (!send_normal) {
                continue;
            }
            var z0 = new ArrayBuffer(13);
            var z1 = new DataView(z0);
            z1.setUint8(0, 16);
            z1.setInt32(1, x, true);
            z1.setInt32(5, y, true);
            z1.setUint32(9, blob.id, true);
            zeach.webSocket.send(z0);
        }
    }

    function lockCurrentBlob() {
        if(!isPlayerAlive()){
            return;
        }
        var blob = getSelectedBlob();
        if (blob.locked) {
            blob.locked = false;
        } else {
            if (cobbler.nextOnBlobLock) {
                switchCurrentBlob();
            }
            blob.locked = true;
            blob.last_locked = 10;
            blob.locked_x = zeach.mouseX2;
            blob.locked_y = zeach.mouseY2;
        }
    }

    function calculateAbsorptionGuide(eatenCells, aliveCells) {
        if (!showVisualCues || !cobbler.absorptionGuide)
            return;
        var i, j, ci, cj;
        var bigEnough = [];
        for (i = 0; i < eatenCells.length; i++) {
            ci = eatenCells[i];
            delete ci.zcEatees;
            delete ci.zcEater;
            delete ci.zcProgress;
        }
        for (i = 0; i < aliveCells.length; i++) {
            ci = aliveCells[i];
            ci.zcEatees = [];
            ci.zcEater = undefined;
            ci.zcProgress = Number.POSITIVE_INFINITY;
            if (ci.size > 32)
                bigEnough.push(ci);
        }

        for (i = 0; i < bigEnough.length; i++) {
            ci = bigEnough[i];
            if (ci.isVirus)
                continue;
            for (j = 0; j < bigEnough.length; j++) {
                cj = bigEnough[j];
                if (ci.size <= cj.size)
                    continue
                var dist_min = ci.size - 0.354*cj.size + 11;
                var dist_max = ci.size + cj.size;
                var dist = lineDistance(ci, cj);
                if (dist >= dist_max)
                    continue;
                var progress = (dist - dist_min) / (dist_max - dist_min);
                ci.zcEatees.push({
                    cell: cj,
                    radius: dist_min,
                    angle: Math.atan2(cj.y-ci.y, cj.x-ci.x),
                    progress: progress,
                    max_angle: Math.atan2(cj.size, dist_max),
                })
                if (cj.zcEater === undefined && cj.zcProgress > progress) {
                    cj.zcProgress = progress;
                    cj.zcEater = ci;
                }
            }
        }
    }

// ======================   Start main    ==================================================================

    function kb() {
        wa = true;
        La();
        setInterval(La, 18E4);
        F = xa = document.getElementById("canvas");
        g = F.getContext("2d");
        // /*old*/ (/*new*/ /remap/) F.onmousewheel = function (e) {zoomFactor = e.wheelDelta > 0 ? 10 : 11;}
        /*new*/ function Na(e) {
            if (e.wheelDelta > 0) {
                zoomFactor = zoomFactor <= 9.50 ? 9.50 : +(zoomFactor - 0.05).toFixed(2);
            } else {
                zoomFactor = zoomFactor >= 11 ? 11 : +(zoomFactor + 0.05).toFixed(2);
            }
        };
        Object.defineProperty(unsafeWindow.agar, "scale", {
            get: function(){ return zoomFactor/10; },
            set: function(){ zoomFactor = arguments[0]*10; },
            enumerable: true
        });
        F.onmousedown = function(a) {
            /*new*/if(cobbler.enableBlobLock) {lockCurrentBlob();}
            /*new*/if(isPlayerAlive() && cobbler.rightClickFires){fireAtVirusNearestToCursor();}return;
            if (Ma) {
                var c = a.clientX - (5 + q / 5 / 2);
                var b = a.clientY - (5 + q / 5 / 2);
                if (Math.sqrt(c * c + b * b) <= q / 5 / 2) {
                    U();
                    G(17);
                    return;
                }
            }
            ca = a.clientX;
            da = a.clientY;
            ya();
            U();
        };
        F.onmousemove = function(a) {
            ca = a.clientX;
            da = a.clientY;
            ya();
        };
        F.onmouseup = function() {
        };
        if (/firefox/i.test(navigator.userAgent)) {
            document.addEventListener("DOMMouseScroll", Na, false);
            unsafeWindow.agar.dommousescroll = Na;
        } else {
            document.body.onmousewheel = Na;
        }
        var a = false;
        var c = false;
        var b = false;
        d.onkeydown = function(e) {
            if (!(32 != e.keyCode)) {
                if (!a) {
                    U();
                    G(17);
                    a = true;
                }
            }
            if (!(81 != e.keyCode)) {
                if (!c) {
                    G(18);
                    c = true;
                }
            }
            if (!(87 != e.keyCode)) {
                if (!b) {
                    U();
                    G(21);
                    b = true;
                }
            }
            if (27 == e.keyCode) {
                Oa(true);
            }
            /*new*/customKeyDownEvents(e);
        };
        d.onkeyup = function(e) {
            if (32 == e.keyCode) {
                a = false;
            }
            if (87 == e.keyCode) {
                b = false;
            }
            if (81 == e.keyCode) {
                if (c) {
                    G(19);
                    c = false;
                }
            }
        };
        d.onblur = function() {
            G(19);
            b = c = a = false;
        };
        d.onresize = Pa;
        d.requestAnimationFrame(Qa);
        setInterval(U, 40);
        if (x) {
            f("#region").val(x);
        }
        Ra();
        ea(f("#region").val());
        if (0 == za) {
            if (x) {
                N();
            }
        }
        V = true;
        f("#overlays").show();
        Pa();
    }
    function Na(a) {
        // /*new*/ H *= Math.pow(0.9, a.wheelDelta / -120 || (a.detail || 0));
        if (1 > H) {
            H = 1;
        }
        if (H > 4 / k) {
            H = 4 / k;
        }
    }
    function lb() {
        if (0.4 > k) {
            W = null;
        } else {
            var a = Number.POSITIVE_INFINITY;
            var c = Number.POSITIVE_INFINITY;
            var b = Number.NEGATIVE_INFINITY;
            var e = Number.NEGATIVE_INFINITY;
            var l = 0;
            var p = 0;
            for (;p < v.length;p++) {
                var h = v[p];
                if (!!h.N()) {
                    if (!h.R) {
                        if (!(20 >= h.size * k)) {
                            l = Math.max(h.size, l);
                            a = Math.min(h.x, a);
                            c = Math.min(h.y, c);
                            b = Math.max(h.x, b);
                            e = Math.max(h.y, e);
                        }
                    }
                }
            }
            W = mb.ja({
                ca : a - (l + 100),
                da : c - (l + 100),
                ma : b + (l + 100),
                na : e + (l + 100),
                ka : 2,
                la : 4
            });
            p = 0;
            for (;p < v.length;p++) {
                if (h = v[p], h.N() && !(20 >= h.size * k)) {
                    a = 0;
                    for (;a < h.a.length;++a) {
                        c = h.a[a].x;
                        b = h.a[a].y;
                        if (!(c < t - q / 2 / k)) {
                            if (!(b < u - s$$0 / 2 / k)) {
                                if (!(c > t + q / 2 / k)) {
                                    if (!(b > u + s$$0 / 2 / k)) {
                                        W.m(h.a[a]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    function ya() {
        fa = (ca - q / 2) / k + t;
        ga = (da - s$$0 / 2) / k + u;
    }
    function La() {
        if (null == ha) {
            ha = {};
            f("#region").children().each(function() {
                var a = f(this);
                var c = a.val();
                if (c) {
                    ha[c] = a.text();
                }
            });
        }
        f.get("https://m.agar.io/info", function(a) {
            var c = {};
            var b;
            for (b in a.regions) {
                var e = b.split(":")[0];
                c[e] = c[e] || 0;
                c[e] += a.regions[b].numPlayers;
            }
            for (b in c) {
                f('#region option[value="' + b + '"]').text(ha[b] + " (" + c[b] + " players)");
            }
        }, "json");
    }
    function Sa() {
        f("#adsBottom").hide();
        f("#overlays").hide();
        V = false;
        Ra();
        if (d.googletag) {
            if (d.googletag.pubads && d.googletag.pubads().clear) {
                d.googletag.pubads().clear(d.aa);
            }
        }
    }
    function ea(a) {
        if (a) {
            if (a != x) {
                if (f("#region").val() != a) {
                    f("#region").val(a);
                }
                x = d.localStorage.location = a;
                f(".region-message").hide();
                f(".region-message." + a).show();
                f(".btn-needs-server").prop("disabled", false);
                if (wa) {
                    N();
                }
            }
        }
    }
    function Oa(a) {
        if (!V) {
            I = null;
            nb();
            if (a) {
                w = 1;
            }
            V = true;
            f("#overlays").fadeIn(a ? 200 : 3E3);
            /*new*//*mikey*/OnShowOverlay(a);
        }
    }
    function ia(a) {
        f("#helloContainer").attr("data-gamemode", a);
        O = a;
        f("#gamemode").val(a);
    }
    function Ra() {
        if (f("#region").val()) {
            d.localStorage.location = f("#region").val();
        } else {
            if (d.localStorage.location) {
                f("#region").val(d.localStorage.location);
            }
        }
        if (f("#region").val()) {
            f("#locationKnown").append(f("#region"));
        } else {
            f("#locationUnknown").append(f("#region"));
        }
    }
    function nb() {
        if (ja) {
            ja = false;
            setTimeout(function() {
                ja = true;
            }, 6E4 * Ta);
            if (d.googletag) {
                if (d.googletag.pubads && d.googletag.pubads().clear) {
                    d.googletag.pubads().refresh(d.aa);
                }
            }
        }
    }
    function X(a) {
        return d.i18n[a] || (d.i18n_dict.en[a] || a);
    }
    function Ua() {
        var a = ++za;
        console.log("Find " + x + O);
        unsafeWindow.agar.region = x + O;
        f.ajax("https://m.agar.io/", {
            error : function() {
                setTimeout(Ua, 1E3);
            },
            success : function(c) {
                if (a == za) {
                    c = c.split("\n");
                    if (c[2]) {
                        alert(c[2]);
                    }
                    Aa("ws://" + c[0], c[1]);
                    /*new*/ serverIP = c[0];
                }
            },
            dataType : "text",
            method : "POST",
            cache : false,
            crossDomain : true,
            data : (x + O || "?") + "\n154669603"
        });
    }
    function N() {
        if (wa) {
            if (x) {
                f("#connecting").show();
                Ua();
            }
        }
    }
    function Aa(a$$0, c) {
        if (r) {
            r.onopen = null;
            r.onmessage = null;
            r.onclose = null;
            try {
                r.close();
            } catch (b$$0) {
            }
            r = null;
        }
        if (null != J) {
            var e = J;
            J = function() {
                e(c);
            };
        }
        if (ob) {
            var l = a$$0.split(":");
            a$$0 = l[0] + "s://ip-" + l[1].replace(/\./g, "-").replace(/\//g, "") + ".tech.agar.io:" + (+l[2] + 2E3);
        }
        K = [];
        m = [];
        D = {};
        v = [];
        P = [];
        E = [];
        y = z = null;
        Q = 0;
        ka = false;
        console.log("Connecting to " + a$$0);
        r = new WebSocket(a$$0);
        exposeReset();
        unsafeWindow.agar.ws = a$$0;
        r.binaryType = "arraybuffer";
        r.onopen = function() {
            var a;
            console.log("socket open");
            a = L(5);
            a.setUint8(0, 254);
            a.setUint32(1, 5, true);
            M(a);
            a = L(5);
            a.setUint8(0, 255);
            a.setUint32(1, 154669603, true);
            M(a);
            a = L(1 + c.length);
            a.setUint8(0, 80);
            var b = 0;
            for (;b < c.length;++b) {
                a.setUint8(b + 1, c.charCodeAt(b));
            }
            M(a);
            Va();
        };
        r.onmessage = pb;
        r.onclose = qb;
        r.onerror = function() {
            console.log("socket error");
        };
    }
    function L(a) {
        return new DataView(new ArrayBuffer(a));
    }
    function M(a) {
        r.send(a.buffer);
    }
    function qb() {
        if (ka) {
            la = 500;
        }
        console.log("socket close");
        setTimeout(N, la);
        la *= 2;
    }
    function pb(a) {
        rb(new DataView(a.data));
    }
    function rb(a) {
        function c$$0() {
            var c = "";
            for (;;) {
                var e = a.getUint16(b, true);
                b += 2;
                if (0 == e) {
                    break;
                }
                c += String.fromCharCode(e);
            }
            return c;
        }
        var b = 0;
        if (240 == a.getUint8(b)) {
            b += 5;
        }
        switch(a.getUint8(b++)) {
            case 16:
                sb(a, b);
                /*new*/onAfterUpdatePacket();
                break;
            case 17:
                Y = a.getFloat32(b, true);
                b += 4;
                Z = a.getFloat32(b, true);
                b += 4;
                $ = a.getFloat32(b, true);
                b += 4;
                unsafeWindow.agar.rawViewport.x = Y;
                unsafeWindow.agar.rawViewport.y = Z;
                unsafeWindow.agar.rawViewport.scale = $;
                break;
            case 20:
                m = [];
                K = [];
                break;
            case 21:
                Ba = a.getInt16(b, true);
                b += 2;
                Ca = a.getInt16(b, true);
                b += 2;
                if (!Da) {
                    Da = true;
                    ma = Ba;
                    na = Ca;
                }
                break;
            case 32:
                /*new*/onBeforeNewPointPacket();
                K.push(a.getUint32(b, true));
                b += 4;
                unsafeWindow.agar.myCells = K;
                break;
            case 49:
                if (null != z) {
                    break;
                }
                var e$$0 = a.getUint32(b, true);
                b = b + 4;
                E = [];
                unsafeWindow.agar.top = E;
                var l = 0;
                for (;l < e$$0;++l) {
                    var p = a.getUint32(b, true);
                    b = b + 4;
                    E.push({
                        id : p,
                        name : c$$0()
                    });
                }
                Wa();
                break;
            case 50:
                z = [];
                e$$0 = a.getUint32(b, true);
                b += 4;
                l = 0;
                for (;l < e$$0;++l) {
                    z.push(a.getFloat32(b, true));
                    b += 4;
                }
                Wa();
                break;
            case 64:
                oa = a.getFloat64(b, true);
                b += 8;
                pa = a.getFloat64(b, true);
                b += 8;
                qa = a.getFloat64(b, true);
                b += 8;
                ra = a.getFloat64(b, true);
                b += 8;
                unsafeWindow.agar.dimensions = [oa, pa, qa, ra];
                Y = (qa + oa) / 2;
                Z = (ra + pa) / 2;
                $ = 1;
                if (0 == m.length) {
                    t = Y;
                    u = Z;
                    k = $;
                }
                break;
            case 81:
                var h = a.getUint32(b, true);
                b = b + 4;
                var d = a.getUint32(b, true);
                b = b + 4;
                var f = a.getUint32(b, true);
                b = b + 4;
                setTimeout(function() {
                    R({
                        e : h,
                        f : d,
                        d : f
                    });
                }, 1200);
        }
    }
    function sb(a, c) {
        Xa = A = Date.now();
        if (!ka) {
            ka = true;
            f("#connecting").hide();
            Ya();
            if (J) {
                J();
                J = null;
            }
        }
        var b = Math.random();
        Ea = false;
        var e = a.getUint16(c, true);
        c += 2;
        var l = 0;
        for (;l < e;++l) {
            var p = D[a.getUint32(c, true)];
            var h = D[a.getUint32(c + 4, true)];
            c += 8;
            if (p) {
                if (h) {
                    /*new*//*mikey*//*remap*/OnCellEaten(p,h);
                    /*new*/// Remove from 10-sec-remembered cells list by id
                    /*new*//*remap*/_.remove(ghostBlobs, {id: h.id});
                    h.X();
                    h.s = h.x;
                    h.t = h.y;
                    h.r = h.size;
                    h.J = p.x;
                    h.K = p.y;
                    h.q = h.size;
                    h.Q = A;
                }
            }
        }
        l = 0;
        for (;;) {
            e = a.getUint32(c, true);
            c += 4;
            if (0 == e) {
                break;
            }
            ++l;
            var d;
            p = a.getInt32(c, true);
            c += 4;
            h = a.getInt32(c, true);
            c += 4;
            d = a.getInt16(c, true);
            c += 2;
            var g = a.getUint8(c++);
            var k = a.getUint8(c++);
            var q = a.getUint8(c++);
            g = (g << 16 | k << 8 | q).toString(16);
            for (;6 > g.length;) {
                g = "0" + g;
            }
            g = "#" + g;
            k = a.getUint8(c++);
            q = !!(k & 1);
            var s = !!(k & 16);
            if (k & 2) {
                c += 4;
            }
            if (k & 4) {
                c += 8;
            }
            if (k & 8) {
                c += 16;
            }
            var r;
            var n = "";
            for (;;) {
                r = a.getUint16(c, true);
                c += 2;
                if (0 == r) {
                    break;
                }
                n += String.fromCharCode(r);
            }
            r = n;
            n = null;
            unsafeWindow.agar.allCells = D;
            if (D.hasOwnProperty(e)) {
                n = D[e];
                n.P();
                n.s = n.x;
                n.t = n.y;
                n.r = n.size;
                n.color = g;
            } else {
                n = new aa(e, p, h, d, g, r);
                v.push(n);
                D[e] = n;
                n.sa = p;
                n.ta = h;
            }
            n.h = q;
            n.n = s;
            n.J = p;
            n.K = h;
            n.q = d;
            n.qa = b;
            n.Q = A;
            n.ba = k;
            if (r) {
                n.B(r);
            }
            if (-1 != K.indexOf(e)) {
                if (-1 == m.indexOf(n)) {
                    document.getElementById("overlays").style.display = "none";
                    m.push(n);
                    if (1 == m.length) {
                        /*new*//*mikey*/OnGameStart(zeach.myPoints);
                        t = n.x;
                        u = n.y;
                        Za();
                    }
                }
            }
        }
        b = a.getUint32(c, true);
        c += 4;
        l = 0;
        for (;l < b;l++) {
            e = a.getUint32(c, true);
            c += 4;
            n = D[e];
            if (null != n) {
                n.X();
            }
        }
        if (Ea) {
            if (0 == m.length) {
                Oa(false);
            }
        }
    }
    function U() {
        /*new*/if(isGrazing){ doGrazing(); return; }
        /*new*/if(suspendMouseUpdates){return;}
        var a;
        if (S()) {
            a = ca - q / 2;
            var c = da - s$$0 / 2;
            if (!(64 > a * a + c * c)) {
                if (!(0.01 > Math.abs($a - fa) && 0.01 > Math.abs(ab - ga))) {
                        $a = fa;
                        ab = ga;
                        /*new*/zeach.myPoints.forEach(function(playerBlob){playerBlob.sentMouseCoords = {x:$a,y:ab};});
                        a = L(13);
                        a.setUint8(0, 16);
                        a.setInt32(1, fa, true);
                        a.setInt32(5, ga, true);
                        a.setUint32(9, 0, true);
                        M(a);

                }
            }
        }
    }
    function Ya() {
        if (S() && null != I) {
            var a = L(1 + 2 * I.length);
            a.setUint8(0, 0);
            var c = 0;
            for (;c < I.length;++c) {
                a.setUint16(1 + 2 * c, I.charCodeAt(c), true);
            }
            M(a);
        }
    }
    function S() {
        return null != r && r.readyState == r.OPEN;
    }
    function G(a) {
        if (S()) {
            var c = L(1);
            c.setUint8(0, a);
            M(c);
        }
    }
    function Va() {
        if (S() && null != B) {
            var a = L(1 + B.length);
            a.setUint8(0, 81);
            var c = 0;
            for (;c < B.length;++c) {
                a.setUint8(c + 1, B.charCodeAt(c));
            }
            M(a);
        }
    }
    function Pa() {
        q = d.innerWidth;
        s$$0 = d.innerHeight;
        xa.width = F.width = q;
        xa.height = F.height = s$$0;
        var a = f("#helloContainer");
        a.css("transform", "none");
        var c = a.height();
        var b = d.innerHeight;
        if (c > b / 1.1) {
            a.css("transform", "translate(-50%, -50%) scale(" + b / c / 1.1 + ")");
        } else {
            a.css("transform", "translate(-50%, -50%)");
        }
        bb();
    }
    function cb() {
        var a;
        a = 1 * Math.max(s$$0 / 1080, q / 1920);
        return a *= H;
    }
    function tb() {
        if (0 != m.length) {
            var a = 0;
            var c = 0;
            for (;c < m.length;c++) {
                a += m[c].size;
            }
            unsafeWindow.agar.rawViewport.scale = Math.pow(Math.min(64 / a, 1), 0.4);
            a = Math.pow(Math.min(64 / a, 1), 0.4) * cb();
            //k = (9 * k + a) / 10;
            /*new*//*remap*/k = (9 * k + a) / zoomFactor;
        }
    }
    function bb() {
        var a$$0;
        var c$$0 = Date.now();
        ++ub;
        A = c$$0;
        if (0 < m.length) {
            tb();
            var b = a$$0 = 0;
            var e = 0;
            for (;e < m.length;e++) {
                m[e].P();
                a$$0 += m[e].x / m.length;
                b += m[e].y / m.length;
            }
            Y = a$$0;
            Z = b;
            $ = k;
            t = (t + a$$0) / 2;
            u = (u + b) / 2;
        } else {
            t = (29 * t + Y) / 30;
            u = (29 * u + Z) / 30;
            k = (9 * k + $ * cb()) / 10;
        }
        unsafeWindow.agar.rawViewport.x = Y;
        unsafeWindow.agar.rawViewport.y = Z;
        if (unsafeWindow.agar.disableRendering) return;
        lb();
        ya();
        if (!Fa) {
            g.clearRect(0, 0, q, s$$0);
        }
        if (Fa) {
            g.fillStyle = sa ? "#111111" : "#F2FBFF";
            g.globalAlpha = 0.05;
            g.fillRect(0, 0, q, s$$0);
            g.globalAlpha = 1;
        } else {
            vb();
        }
        v.sort(function(a, c) {
            return a.size == c.size ? a.id - c.id : a.size - c.size;
        });
        g.save();
        g.translate(q / 2, s$$0 / 2);
        g.scale(k, k);
        g.translate(-t, -u);
        /*new*/calculateAbsorptionGuide(P, v);
        e = 0;
        for (;e < P.length;e++) {
            P[e].w(g);
        }
        e = 0;
        for (;e < v.length;e++) {
            v[e].w(g);
        }
        /*new*/drawRescaledItems(zeach.ctx);
        if (Da) {
            ma = (3 * ma + Ba) / 4;
            na = (3 * na + Ca) / 4;
            g.save();
            g.strokeStyle = "#FFAAAA";
            g.lineWidth = 10;
            g.lineCap = "round";
            g.lineJoin = "round";
            g.globalAlpha = 0.5;
            g.beginPath();
            e = 0;
            for (;e < m.length;e++) {
                g.moveTo(m[e].x, m[e].y);
                g.lineTo(ma, na);
            }
            g.stroke();
            g.restore();
        }
        g.restore();
        if (y) {
            if (y.width) {
                g.drawImage(y, q - y.width - 10, 10);
            }
        }
        /*new*//*mikey*/OnDraw(zeach.ctx);
        Q = Math.max(Q, wb());
        /*new*//*remap*/ var extras = " " + getScoreBoardExtrasString(Q);
        if (0 != Q) {
            if (null == ta) {
                ta = new ua(24, "#FFFFFF");
            }
            ta.C(X("score") + ": " + ~~(Q / 100));
            /*new*/ /*remap*/ ta.setValue("Score: " + ~~(Q / 100) + extras);
            b = ta.L();
            a$$0 = b.width;
            g.globalAlpha = 0.2;
            g.fillStyle = "#000000";
            g.fillRect(10, s$$0 - 10 - 24 - 10, a$$0 + 10, 34);
            g.globalAlpha = 1;
            g.drawImage(b, 15, s$$0 - 10 - 24 - 5);
            /*new*//*mikey*//*remap*/(zeach.myPoints&&zeach.myPoints[0]&&OnUpdateMass(wb()));
        }
        xb();
        c$$0 = Date.now() - c$$0;
        if (c$$0 > 1E3 / 60) {
            C -= 0.01;
        } else {
            if (c$$0 < 1E3 / 65) {
                C += 0.01;
            }
        }
        if (0.4 > C) {
            C = 0.4;
        }
        if (1 < C) {
            C = 1;
        }
        c$$0 = A - db;
        if (!S() || V) {
            w += c$$0 / 2E3;
            if (1 < w) {
                w = 1;
            }
        } else {
            w -= c$$0 / 300;
            if (0 > w) {
                w = 0;
            }
        }
        if (0 < w) {
            g.fillStyle = "#000000";
            g.globalAlpha = 0.5 * w;
            g.fillRect(0, 0, q, s$$0);
            g.globalAlpha = 1;
        }
        db = A;
        /*new*/displayDebugText(zeach.ctx,zeach.textFunc);
    }
    function vb() {
        g.fillStyle = sa ? "#111111" : "#F2FBFF";
        g.fillRect(0, 0, q, s$$0);
        /*new*/if(!cobbler.gridLines){return;}
        g.save();
        g.strokeStyle = sa ? "#AAAAAA" : "#000000";
        g.globalAlpha = 0.2 * k;
        var a = q / k;
        var c = s$$0 / k;
        var b = (-t + a / 2) % 50;
        for (;b < a;b += 50) {
            g.beginPath();
            g.moveTo(b * k - 0.5, 0);
            g.lineTo(b * k - 0.5, c * k);
            g.stroke();
        }
        b = (-u + c / 2) % 50;
        for (;b < c;b += 50) {
            g.beginPath();
            g.moveTo(0, b * k - 0.5);
            g.lineTo(a * k, b * k - 0.5);
            g.stroke();
        }
        g.restore();
    }
    function xb() {
        if (Ma && Ga.width) {
            var a = q / 5;
            g.drawImage(Ga, 5, 5, a, a);
        }
    }
    function wb() {
        var a = 0;
        var c = 0;
        for (;c < m.length;c++) {
            a += m[c].q * m[c].q;
        }
        return a;
    }
    function Wa() {
        y = null;
        if (null != z || 0 != E.length) {
            if (null != z || va) {
                y = document.createElement("canvas");
                var a = y.getContext("2d");
                var c = 60;
                c = null == z ? c + 24 * E.length : c + 180;
                var b = Math.min(200, 0.3 * q) / 200;
                y.width = 200 * b;
                y.height = c * b;
                a.scale(b, b);
                a.globalAlpha = 0.4;
                a.fillStyle = "#000000";
                a.fillRect(0, 0, 200, c);
                a.globalAlpha = 1;
                a.fillStyle = "#FFFFFF";
                b = null;
                b = X("leaderboard");
                a.font = "30px Ubuntu";
                a.fillText(b, 100 - a.measureText(b).width / 2, 40);
                if (null == z) {
                    a.font = "20px Ubuntu";
                    c = 0;
                    for (;c < E.length;++c) {
                        b = E[c].name || X("unnamed_cell");
                        if (!va) {
                            b = X("unnamed_cell");
                        }
                        if (-1 != K.indexOf(E[c].id)) {
                            if (m[0].name) {
                                b = m[0].name;
                            }
                            a.fillStyle = "#FFAAAA";
                            /*new*//*mikey*//*remap*/OnLeaderboard(c+1);
                        } else {
                            a.fillStyle = "#FFFFFF";
                        }
                        b = c + 1 + ". " + b;
                        a.fillText(b, 100 - a.measureText(b).width / 2, 70 + 24 * c);
                    }
                } else {
                    c = b = 0;
                    for (;c < z.length;++c) {
                        var e = b + z[c] * Math.PI * 2;
                        a.fillStyle = yb[c + 1];
                        a.beginPath();
                        a.moveTo(100, 140);
                        a.arc(100, 140, 80, b, e, false);
                        a.fill();
                        b = e;
                    }
                }
            }
        }
    }
    function Ha(a, c, b, e, l) {
        this.V = a;
        this.x = c;
        this.y = b;
        this.i = e;
        this.b = l;
    }
    function aa(a, c, b, e, l, p) {
        this.id = a;
        this.s = this.x = c;
        this.t = this.y = b;
        this.r = this.size = e;
        this.color = l;
        this.a = [];
        this.W();
        this.B(p);
        /*new*/this.splitTime = Date.now();
    }
    function ua(a, c, b, e) {
        if (a) {
            this.u = a;
        }
        if (c) {
            this.S = c;
        }
        this.U = !!b;
        if (e) {
            this.v = e;
        }
    }
    function R(a, c) {
        var b$$0 = "1" == f("#helloContainer").attr("data-has-account-data");
        /*new*/var b$$0 = "1" == f("#ZCOverlay").attr("data-has-account-data");

        f("#helloContainer").attr("data-has-account-data", "1");
        if (null == c && d.localStorage.loginCache) {
            var e = JSON.parse(d.localStorage.loginCache);
            e.f = a.f;
            e.d = a.d;
            e.e = a.e;
            d.localStorage.loginCache = JSON.stringify(e);
        }
        if (b$$0) {
            var l = +f(".agario-exp-bar .progress-bar-text").text().split("/")[0];
            b$$0 = +f(".agario-exp-bar .progress-bar-text").text().split("/")[1].split(" ")[0];
            e = f(".agario-profile-panel .progress-bar-star").text();
            if (e != a.e) {
                R({
                    f : b$$0,
                    d : b$$0,
                    e : e
                }, function() {
                    f(".agario-profile-panel .progress-bar-star").text(a.e);
                    f(".agario-exp-bar .progress-bar").css("width", "100%");
                    f(".progress-bar-star").addClass("animated tada").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function() {
                        f(".progress-bar-star").removeClass("animated tada");
                    });
                    setTimeout(function() {
                        f(".agario-exp-bar .progress-bar-text").text(a.d + "/" + a.d + " XP");
                        R({
                            f : 0,
                            d : a.d,
                            e : a.e
                        }, function() {
                            R(a, c);
                        });
                    }, 1E3);
                });
            } else {
                var p = Date.now();
                var h = function() {
                    var b;
                    b = (Date.now() - p) / 1E3;
                    b = 0 > b ? 0 : 1 < b ? 1 : b;
                    b = b * b * (3 - 2 * b);
                    f(".agario-exp-bar .progress-bar-text").text(~~(l + (a.f - l) * b) + "/" + a.d + " XP");
                    f(".agario-exp-bar .progress-bar").css("width", (88 * (l + (a.f - l) * b) / a.d).toFixed(2) + "%");
                    if (1 > b) {
                        d.requestAnimationFrame(h);
                    } else {
                        if (c) {
                            c();
                        }
                    }
                };
                d.requestAnimationFrame(h);
            }
        } else {
            f(".agario-profile-panel .progress-bar-star").text(a.e);
            f(".agario-exp-bar .progress-bar-text").text(a.f + "/" + a.d + " XP");
            f(".agario-exp-bar .progress-bar").css("width", (88 * a.f / a.d).toFixed(2) + "%");
            if (c) {
                c();
            }
        }
    }
    function eb(a) {
        if ("string" == typeof a) {
            a = JSON.parse(a);
        }
        if (Date.now() + 18E5 > a.ia) {
            f("#helloContainer").attr("data-logged-in", "0");
        } else {
            d.localStorage.loginCache = JSON.stringify(a);
            B = a.fa;
            f(".agario-profile-name").text(a.name);
            Va();
            R({
                f : a.f,
                d : a.d,
                e : a.e
            });
            f("#helloContainer").attr("data-logged-in", "1");
        }
    }
    function zb(a) {
        a = a.split("\n");
        eb({
            name : a[0],
            ra : a[1],
            fa : a[2],
            ia : 1E3 * +a[3],
            e : +a[4],
            f : +a[5],
            d : +a[6]
        });
    }
    function Ia(a$$0) {
        if ("connected" == a$$0.status) {
            var c = a$$0.authResponse.accessToken;
            d.FB.api("/me/picture?width=180&height=180", function(a) {
                d.localStorage.fbPictureCache = a.data.url;
                f(".agario-profile-picture").attr("src", a.data.url);
            });
            f("#helloContainer").attr("data-logged-in", "1");
            if (null != B) {
                f.ajax("https://m.agar.io/checkToken", {
                    error : function() {
                        B = null;
                        Ia(a$$0);
                    },
                    success : function(a) {
                        a = a.split("\n");
                        R({
                            e : +a[0],
                            f : +a[1],
                            d : +a[2]
                        });
                    },
                    dataType : "text",
                    method : "POST",
                    cache : false,
                    crossDomain : true,
                    data : B
                });
            } else {
                f.ajax("https://m.agar.io/facebookLogin", {
                    error : function() {
                        B = null;
                        f("#helloContainer").attr("data-logged-in", "0");
                    },
                    success : zb,
                    dataType : "text",
                    method : "POST",
                    cache : false,
                    crossDomain : true,
                    data : c
                });
            }
        }
    }
    if (!d.agarioNoInit) {
        var Ja = d.location.protocol;
        var ob = "https:" == Ja;
        var xa;
        var g;
        var F;
        var q;
        var s$$0;
        var W = null;
        var r = null;
        var t = 0;
        var u = 0;
        var K = [];
        var m = [];
        var D = {};
        var v = [];
        var P = [];
        var E = [];
        var ca = 0;
        var da = 0;
        var fa = -1;
        var ga = -1;
        var ub = 0;
        var A = 0;
        var db = 0;
        var I = null;
        var oa = 0;
        var pa = 0;
        var qa = 1E4;
        var ra = 1E4;
        var k = 1;
        var x = null;
        var fb = true;
        var va = true;
        var Ka = false;
        var Ea = false;
        var Q = 0;
        var sa = false;
        var gb = false;
        var Y = t = ~~((oa + qa) / 2);
        var Z = u = ~~((pa + ra) / 2);
        var $ = 1;
        var O = "";
        var z = null;
        var wa = false;
        var Da = false;
        var Ba = 0;
        var Ca = 0;
        var ma = 0;
        var na = 0;
        var hb = 0;
        var yb = ["#333333", "#FF3333", "#33FF33", "#3333FF"];
        var Fa = false;
        var ka = false;
        var Xa = 0;
        var B = null;
        var H = 1;
        var w = 1;
        var V = true;
        var za = 0;
        var Ma = "ontouchstart" in d && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        var Ga = new Image;
        Ga.src = "img/split.png";
        var ib = document.createElement("canvas");
        if ("undefined" == typeof console || ("undefined" == typeof DataView || ("undefined" == typeof WebSocket || (null == ib || (null == ib.getContext || null == d.localStorage))))) {
            alert("You browser does not support this game, we recommend you to use Firefox to play this");
        } else {

            var ha = null;
            d.setNick = function(a) {
                Sa();
                I = a;
                Ya();
                Q = 0;
                /*new*/GM_setValue("nick", a);
                /*new*/console.log("Storing '" + a + "' as nick");
            };
            d.setRegion = ea;
            d.setSkins = function(a) {
                fb = a;
            };
            d.setNames = function(a) {
                va = a;
            };
            d.setDarkTheme = function(a) {
                sa = a;
            };
            d.setColors = function(a) {
                Ka = a;
            };
            d.setShowMass = function(a) {
                gb = a;
            };
            d.spectate = function() {
                I = null;
                G(1);
                Sa();
            };
            d.setGameMode = function(a) {
                if (a != O) {
                    if (":party" == O) {
                        f("#helloContainer").attr("data-party-state", "0");
                    }
                    ia(a);
                    if (":party" != a) {
                        N();
                    }
                }
            };
            d.setAcid = function(a) {
                Fa = a;
            };
            if (null != d.localStorage) {
                if (null == d.localStorage.AB9) {
                    d.localStorage.AB9 = 0 + ~~(100 * Math.random());
                }
                hb = +d.localStorage.AB9;
                d.ABGroup = hb;
            }
            f.get(Ja + "//gc.agar.io", function(a) {
                var c = a.split(" ");
                a = c[0];
                c = c[1] || "";
                if (-1 == ["UA"].indexOf(a)) {
                    jb.push("ussr");
                }
                if (-1 != d.navigator.userAgent.indexOf("Android")) {
                    d.location.href = "market://details?id=com.miniclip.agar.io";
                }
                if (-1 != d.navigator.userAgent.indexOf("iPhone") || (-1 != d.navigator.userAgent.indexOf("iPad") || -1 != d.navigator.userAgent.indexOf("iPod"))) {
                    d.location.href = "https://itunes.apple.com/app/agar.io/id995999703";
                }
                if (ba.hasOwnProperty(a)) {
                    if ("string" == typeof ba[a]) {
                        if (!x) {
                            ea(ba[a]);
                        }
                    } else {
                        if (ba[a].hasOwnProperty(c)) {
                            if (!x) {
                                ea(ba[a][c]);
                            }
                        }
                    }
                }
            }, "text");
            var ja = false;
            var Ta = 0;
            setTimeout(function() {
                ja = true;
            }, Math.max(6E4 * Ta, 1E4));
            var ba = {
                AF : "JP-Tokyo",
                AX : "EU-London",
                AL : "EU-London",
                DZ : "EU-London",
                AS : "SG-Singapore",
                AD : "EU-London",
                AO : "EU-London",
                AI : "US-Atlanta",
                AG : "US-Atlanta",
                AR : "BR-Brazil",
                AM : "JP-Tokyo",
                AW : "US-Atlanta",
                AU : "SG-Singapore",
                AT : "EU-London",
                AZ : "JP-Tokyo",
                BS : "US-Atlanta",
                BH : "JP-Tokyo",
                BD : "JP-Tokyo",
                BB : "US-Atlanta",
                BY : "EU-London",
                BE : "EU-London",
                BZ : "US-Atlanta",
                BJ : "EU-London",
                BM : "US-Atlanta",
                BT : "JP-Tokyo",
                BO : "BR-Brazil",
                BQ : "US-Atlanta",
                BA : "EU-London",
                BW : "EU-London",
                BR : "BR-Brazil",
                IO : "JP-Tokyo",
                VG : "US-Atlanta",
                BN : "JP-Tokyo",
                BG : "EU-London",
                BF : "EU-London",
                BI : "EU-London",
                KH : "JP-Tokyo",
                CM : "EU-London",
                CA : "US-Atlanta",
                CV : "EU-London",
                KY : "US-Atlanta",
                CF : "EU-London",
                TD : "EU-London",
                CL : "BR-Brazil",
                CN : "CN-China",
                CX : "JP-Tokyo",
                CC : "JP-Tokyo",
                CO : "BR-Brazil",
                KM : "EU-London",
                CD : "EU-London",
                CG : "EU-London",
                CK : "SG-Singapore",
                CR : "US-Atlanta",
                CI : "EU-London",
                HR : "EU-London",
                CU : "US-Atlanta",
                CW : "US-Atlanta",
                CY : "JP-Tokyo",
                CZ : "EU-London",
                DK : "EU-London",
                DJ : "EU-London",
                DM : "US-Atlanta",
                DO : "US-Atlanta",
                EC : "BR-Brazil",
                EG : "EU-London",
                SV : "US-Atlanta",
                GQ : "EU-London",
                ER : "EU-London",
                EE : "EU-London",
                ET : "EU-London",
                FO : "EU-London",
                FK : "BR-Brazil",
                FJ : "SG-Singapore",
                FI : "EU-London",
                FR : "EU-London",
                GF : "BR-Brazil",
                PF : "SG-Singapore",
                GA : "EU-London",
                GM : "EU-London",
                GE : "JP-Tokyo",
                DE : "EU-London",
                GH : "EU-London",
                GI : "EU-London",
                GR : "EU-London",
                GL : "US-Atlanta",
                GD : "US-Atlanta",
                GP : "US-Atlanta",
                GU : "SG-Singapore",
                GT : "US-Atlanta",
                GG : "EU-London",
                GN : "EU-London",
                GW : "EU-London",
                GY : "BR-Brazil",
                HT : "US-Atlanta",
                VA : "EU-London",
                HN : "US-Atlanta",
                HK : "JP-Tokyo",
                HU : "EU-London",
                IS : "EU-London",
                IN : "JP-Tokyo",
                ID : "JP-Tokyo",
                IR : "JP-Tokyo",
                IQ : "JP-Tokyo",
                IE : "EU-London",
                IM : "EU-London",
                IL : "JP-Tokyo",
                IT : "EU-London",
                JM : "US-Atlanta",
                JP : "JP-Tokyo",
                JE : "EU-London",
                JO : "JP-Tokyo",
                KZ : "JP-Tokyo",
                KE : "EU-London",
                KI : "SG-Singapore",
                KP : "JP-Tokyo",
                KR : "JP-Tokyo",
                KW : "JP-Tokyo",
                KG : "JP-Tokyo",
                LA : "JP-Tokyo",
                LV : "EU-London",
                LB : "JP-Tokyo",
                LS : "EU-London",
                LR : "EU-London",
                LY : "EU-London",
                LI : "EU-London",
                LT : "EU-London",
                LU : "EU-London",
                MO : "JP-Tokyo",
                MK : "EU-London",
                MG : "EU-London",
                MW : "EU-London",
                MY : "JP-Tokyo",
                MV : "JP-Tokyo",
                ML : "EU-London",
                MT : "EU-London",
                MH : "SG-Singapore",
                MQ : "US-Atlanta",
                MR : "EU-London",
                MU : "EU-London",
                YT : "EU-London",
                MX : "US-Atlanta",
                FM : "SG-Singapore",
                MD : "EU-London",
                MC : "EU-London",
                MN : "JP-Tokyo",
                ME : "EU-London",
                MS : "US-Atlanta",
                MA : "EU-London",
                MZ : "EU-London",
                MM : "JP-Tokyo",
                NA : "EU-London",
                NR : "SG-Singapore",
                NP : "JP-Tokyo",
                NL : "EU-London",
                NC : "SG-Singapore",
                NZ : "SG-Singapore",
                NI : "US-Atlanta",
                NE : "EU-London",
                NG : "EU-London",
                NU : "SG-Singapore",
                NF : "SG-Singapore",
                MP : "SG-Singapore",
                NO : "EU-London",
                OM : "JP-Tokyo",
                PK : "JP-Tokyo",
                PW : "SG-Singapore",
                PS : "JP-Tokyo",
                PA : "US-Atlanta",
                PG : "SG-Singapore",
                PY : "BR-Brazil",
                PE : "BR-Brazil",
                PH : "JP-Tokyo",
                PN : "SG-Singapore",
                PL : "EU-London",
                PT : "EU-London",
                PR : "US-Atlanta",
                QA : "JP-Tokyo",
                RE : "EU-London",
                RO : "EU-London",
                RU : "RU-Russia",
                RW : "EU-London",
                BL : "US-Atlanta",
                SH : "EU-London",
                KN : "US-Atlanta",
                LC : "US-Atlanta",
                MF : "US-Atlanta",
                PM : "US-Atlanta",
                VC : "US-Atlanta",
                WS : "SG-Singapore",
                SM : "EU-London",
                ST : "EU-London",
                SA : "EU-London",
                SN : "EU-London",
                RS : "EU-London",
                SC : "EU-London",
                SL : "EU-London",
                SG : "JP-Tokyo",
                SX : "US-Atlanta",
                SK : "EU-London",
                SI : "EU-London",
                SB : "SG-Singapore",
                SO : "EU-London",
                ZA : "EU-London",
                SS : "EU-London",
                ES : "EU-London",
                LK : "JP-Tokyo",
                SD : "EU-London",
                SR : "BR-Brazil",
                SJ : "EU-London",
                SZ : "EU-London",
                SE : "EU-London",
                CH : "EU-London",
                SY : "EU-London",
                TW : "JP-Tokyo",
                TJ : "JP-Tokyo",
                TZ : "EU-London",
                TH : "JP-Tokyo",
                TL : "JP-Tokyo",
                TG : "EU-London",
                TK : "SG-Singapore",
                TO : "SG-Singapore",
                TT : "US-Atlanta",
                TN : "EU-London",
                TR : "TK-Turkey",
                TM : "JP-Tokyo",
                TC : "US-Atlanta",
                TV : "SG-Singapore",
                UG : "EU-London",
                UA : "EU-London",
                AE : "EU-London",
                GB : "EU-London",
                US : "US-Atlanta",
                UM : "SG-Singapore",
                VI : "US-Atlanta",
                UY : "BR-Brazil",
                UZ : "JP-Tokyo",
                VU : "SG-Singapore",
                VE : "BR-Brazil",
                VN : "JP-Tokyo",
                WF : "SG-Singapore",
                EH : "EU-London",
                YE : "JP-Tokyo",
                ZM : "EU-London",
                ZW : "EU-London"
            };
            /*new*/// Hack to kill an established websocket
            /*new*//*remap*/d.connect2 = d.connect;d.connect = zeach.connect;setTimeout(function(){try {d.connect2("Killing_original_websocket","");}catch(err){}} ,1500);

            var J = null;
            d.connect = Aa;
            var la = 500;
            var $a = -1;
            var ab = -1;
            var y = null;
            var C = 1;
            var ta = null;
            var Qa = function() {
                var a = Date.now();
                var c = 1E3 / 60;
                return function() {
                    d.requestAnimationFrame(Qa);
                    var b = Date.now();
                    var e = b - a;
                    if (e > c) {
                        a = b - e % c;
                        if (!S() || 240 > Date.now() - Xa) {
                            bb();
                        } else {
                            /*new*///console.warn("Skipping draw");
                        }
                        Ab();
                    }
                };
            }();
            var T = {};
            var jb = "poland;usa;china;russia;canada;australia;spain;brazil;germany;ukraine;france;sweden;chaplin;north korea;south korea;japan;united kingdom;earth;greece;latvia;lithuania;estonia;finland;norway;cia;maldivas;austria;nigeria;reddit;yaranaika;confederate;9gag;indiana;4chan;italy;bulgaria;tumblr;2ch.hk;hong kong;portugal;jamaica;german empire;mexico;sanik;switzerland;croatia;chile;indonesia;bangladesh;thailand;iran;iraq;peru;moon;botswana;bosnia;netherlands;european union;taiwan;pakistan;hungary;satanist;qing dynasty;matriarchy;patriarchy;feminism;ireland;texas;facepunch;prodota;cambodia;steam;piccolo;ea;india;kc;denmark;quebec;ayy lmao;sealand;bait;tsarist russia;origin;vinesauce;stalin;belgium;luxembourg;stussy;prussia;8ch;argentina;scotland;sir;romania;belarus;wojak;doge;nasa;byzantium;imperial japan;french kingdom;somalia;turkey;mars;pokerface;8;irs;receita federal;facebook".split(";");
            var Bb = ["8", "nasa"];
            var Cb = ["m'blob"];
            Ha.prototype = {
                V : null,
                x : 0,
                y : 0,
                i : 0,
                b : 0
            };
            aa.prototype = {
                /*new*/ locked : false,
                id : 0,
                a : null,
                name : null,
                o : null,
                O : null,
                x : 0,
                y : 0,
                size : 0,
                s : 0,
                t : 0,
                r : 0,
                J : 0,
                K : 0,
                q : 0,
                ba : 0,
                Q : 0,
                qa : 0,
                ha : 0,
                G : false,
                h : false,
                n : false,
                R : true,
                Y : 0,
                X : function() {
                    var a;
                    a = 0;
                    for (;a < v.length;a++) {
                        if (v[a] == this) {
                            v.splice(a, 1);
                            break;
                        }
                    }
                    delete D[this.id];
                    a = m.indexOf(this);
                    if (-1 != a) {
                        Ea = true;
                        m.splice(a, 1);
                    }
                    a = K.indexOf(this.id);
                    if (-1 != a) {
                        K.splice(a, 1);
                    }
                    this.G = true;
                    if (0 < this.Y) {
                        P.push(this);
                    }
                },
                l : function() {
                    return Math.max(~~(0.3 * this.size), 24);
                },
                B : function(a) {
                    if (this.name = a) {
                        if (null == this.o) {
                            this.o = new ua(this.l(), "#FFFFFF", true, "#000000");
                        } else {
                            this.o.M(this.l());
                        }
                        this.o.C(this.name);
                    }
                },
                W : function() {
                    var a = this.I();
                    for (;this.a.length > a;) {
                        var c = ~~(Math.random() * this.a.length);
                        this.a.splice(c, 1);
                    }
                    if (0 == this.a.length) {
                        if (0 < a) {
                            this.a.push(new Ha(this, this.x, this.y, this.size, Math.random() - 0.5));
                        }
                    }
                    for (;this.a.length < a;) {
                        c = ~~(Math.random() * this.a.length);
                        c = this.a[c];
                        this.a.push(new Ha(this, c.x, c.y, c.i, c.b));
                    }
                },
                I : function() {
                    var a = 10;
                    if (20 > this.size) {
                        a = 0;
                    }
                    if (this.h) {
                        a = 30;
                    }
                    var c = this.size;
                    if (!this.h) {
                        c *= k;
                    }
                    c *= C;
                    if (this.ba & 32) {
                        c *= 0.25;
                    }
                    return~~Math.max(c, a);
                },
                oa : function() {
                    this.W();
                    var a$$0 = this.a;
                    var c = a$$0.length;
                    var b = 0;
                    for (;b < c;++b) {
                        var e = a$$0[(b - 1 + c) % c].b;
                        var l = a$$0[(b + 1) % c].b;
                        a$$0[b].b += (Math.random() - 0.5) * (this.n ? 3 : 1);
                        a$$0[b].b *= 0.7;
                        if (10 < a$$0[b].b) {
                            a$$0[b].b = 10;
                        }
                        if (-10 > a$$0[b].b) {
                            a$$0[b].b = -10;
                        }
                        a$$0[b].b = (e + l + 8 * a$$0[b].b) / 10;
                    }
                    var p = this;
                    var h = this.h ? 0 : (this.id / 1E3 + A / 1E4) % (2 * Math.PI);
                    b = 0;
                    for (;b < c;++b) {
                        var d = a$$0[b].i;
                        e = a$$0[(b - 1 + c) % c].i;
                        l = a$$0[(b + 1) % c].i;
                        if (15 < this.size && (null != W && (20 < this.size * k && 0 < this.id))) {
                            var f = false;
                            var g = a$$0[b].x;
                            var m = a$$0[b].y;
                            W.pa(g - 5, m - 5, 10, 10, function(a) {
                                if (a.V != p) {
                                    if (25 > (g - a.x) * (g - a.x) + (m - a.y) * (m - a.y)) {
                                        f = true;
                                    }
                                }
                            });
                            if (!f) {
                                if (a$$0[b].x < oa || (a$$0[b].y < pa || (a$$0[b].x > qa || a$$0[b].y > ra))) {
                                    f = true;
                                }
                            }
                            if (f) {
                                if (0 < a$$0[b].b) {
                                    a$$0[b].b = 0;
                                }
                                a$$0[b].b -= 1;
                            }
                        }
                        d += a$$0[b].b;
                        if (0 > d) {
                            d = 0;
                        }
                        d = this.n ? (19 * d + this.size) / 20 : (12 * d + this.size) / 13;
                        a$$0[b].i = (e + l + 8 * d) / 10;
                        e = 2 * Math.PI / c;
                        l = this.a[b].i;
                        if (this.h) {
                            if (0 == b % 2) {
                                l += 5;
                            }
                        }
                        a$$0[b].x = this.x + Math.cos(e * b + h) * l;
                        a$$0[b].y = this.y + Math.sin(e * b + h) * l;
                    }
                },
                P : function() {
                    if (0 >= this.id) {
                        return 1;
                    }
                    var a;
                    a = (A - this.Q) / 120;
                    a = 0 > a ? 0 : 1 < a ? 1 : a;
                    var c = 0 > a ? 0 : 1 < a ? 1 : a;
                    this.l();
                    if (this.G && 1 <= c) {
                        var b = P.indexOf(this);
                        if (-1 != b) {
                            P.splice(b, 1);
                        }
                    }
                    this.x = a * (this.J - this.s) + this.s;
                    this.y = a * (this.K - this.t) + this.t;
                    this.size = c * (this.q - this.r) + this.r;
                    return c;
                },
                N : function() {
                    return 0 >= this.id ? true : this.x + this.size + 40 < t - q / 2 / k || (this.y + this.size + 40 < u - s$$0 / 2 / k || (this.x - this.size - 40 > t + q / 2 / k || this.y - this.size - 40 > u + s$$0 / 2 / k)) ? false : true;
                },
                w : function(a) {
                    if (unsafeWindow.agar.disableRendering) return;
                    if (this.N()) {
                        ++this.Y;
                        var c = 0 < this.id && (!this.h && (!this.n && 0.4 > k));
                        if (5 > this.I()) {
                            c = true;
                        }
                        if (this.R && !c) {
                            var b = 0;
                            for (;b < this.a.length;b++) {
                                this.a[b].i = this.size;
                            }
                        }
                        this.R = c;
                        a.save();
                        this.ha = A;
                        b = this.P();
                        if (this.G) {
                            a.globalAlpha *= 1 - b;
                        }
                        a.lineWidth = 10;
                        a.lineCap = "round";
                        a.lineJoin = this.h ? "miter" : "round";
                        if (Ka) {
                            a.fillStyle = "#FFFFFF";
                            a.strokeStyle = "#AAAAAA";
                        } else {
                            a.fillStyle = this.color;
                            a.strokeStyle = this.color;
                        }

                        var color = {c:this.color, a:undefined};
                        if (showVisualCues) {
                            color = setCellColors(this, zeach.myPoints);
                            if (this.isVirus) {
                                if (!zeach.allNodes.hasOwnProperty(nearestVirusID))
                                    nearestVirusID = this.id;
                                else if (distanceFromCellZero(this) < distanceFromCellZero(zeach.allNodes[nearestVirusID]))
                                    nearestVirusID = this.id;
                            }
                            if(zeach.isColors) {
                                zeach.ctx.fillStyle = "#FFFFFF";
                                zeach.ctx.strokeStyle = "#AAAAAA"
                            }
                            else {
                                zeach.ctx.fillStyle = color.c;
                                zeach.ctx.strokeStyle = (this.id == nearestVirusID) ? "red" : color.a;
                            }
                        }

                        if (c) {
                            a.beginPath();
                            a.arc(this.x, this.y, this.size + 5, 0, 2 * Math.PI, false);
                        } else {
                            this.oa();
                            a.beginPath();
                            var e = this.I();
                            a.moveTo(this.a[0].x, this.a[0].y);
                            b = 1;
                            for (;b <= e;++b) {
                                var d = b % e;
                                a.lineTo(this.a[d].x, this.a[d].y);
                            }
                        }
                        a.closePath();
                        e = this.name.toLowerCase();
                        //if (!this.n && (fb && ":teams" != O)) {
                        //    if (-1 != jb.indexOf(e)) {
                        //        if (!T.hasOwnProperty(e)) {
                        //            T[e] = new Image;
                        //            T[e].src = "skins/" + e + ".png";
                        //        }
                        //        b = 0 != T[e].width && T[e].complete ? T[e] : null;
                        //    } else {
                        //        b = null;
                        //    }
                        //} else {
                        //    b = null;
                        //}
                        /*new*//*remap*/var b = customSkins(this, zeach.defaultSkins, zeach.imgCache, zeach.isShowSkins, zeach.gameMode);
                        b = (d = b) ? -1 != Cb.indexOf(e) : false;
                        if(typeof unsafeWindow.agar.skinF === 'function'){
                            // b == big
                            // d == skin
                            d = unsafeWindow.agar.skinF(this, d);
                            b = d ? !!d.big : false;
                        }
                        a.globalAlpha = 0.8;
                        a.fill();
                        a.globalAlpha = 1.0;
                        a.stroke();

                        if (!(null == d)) {
                            if (!b) {
                                a.save();
                                /*new*/zeach.ctx.globalAlpha = 0.8;
                                a.clip();
                                a.drawImage(d, this.x - this.size, this.y - this.size, 2 * this.size, 2 * this.size);
                                a.restore();
                            }
                        }
                        if (Ka || 15 < this.size) {
                            if (!c) {
                                a.strokeStyle = "#000000";
                                a.globalAlpha *= 0.1;
                                a.stroke();
                            }
                        }
                        a.globalAlpha = 1;
                        if (null != d) {
                            if (b) {
                                a.drawImage(d, this.x - 2 * this.size, this.y - 2 * this.size, 4 * this.size, 4 * this.size);
                            }
                        }
                        b = -1 != m.indexOf(this);
                        c = ~~this.y;
                        //if (0 != this.id && ((va || b) && (this.name && (this.o && (null == d || -1 == Bb.indexOf(e)))))) {
                        //    d = this.o;
                        //    d.C(this.name);
                        //    d.M(this.l());
                        //    e = 0 >= this.id ? 1 : Math.ceil(10 * k) / 10;
                        //    d.ea(e);
                        //    d = d.L();
                        //    var p = ~~(d.width / e);
                        //    var h = ~~(d.height / e);
                        //    a.drawImage(d, ~~this.x - ~~(p / 2), c - ~~(h / 2), p, h);
                        //    c += d.height / 2 / e + 4;
                        //}
                        //if (0 < this.id) {
                        //    if (gb) {
                        //        if (b || 0 == m.length && ((!this.h || this.n) && 20 < this.size)) {
                        //            if (null == this.O) {
                        //                this.O = new ua(this.l() / 2, "#FFFFFF", true, "#000000");
                        //            }
                        //            b = this.O;
                        //            b.M(this.l() / 2);
                        //            b.C(~~(this.size * this.size / 100));
                        //            e = Math.ceil(10 * k) / 10;
                        //            b.ea(e);
                        //            d = b.L();
                        //            p = ~~(d.width / e);
                        //            h = ~~(d.height / e);
                        //            a.drawImage(d, ~~this.x - ~~(p / 2), c - ~~(h / 2), p, h);
                        //        }
                        //    }
                        //}
                        /*new*//*remap*/if(0 != this.id) {
                            /*new*//*remap*/var vertical_offset = drawCellName.call(this,b,e,d);
                            /*new*//*remap*/ drawCellMass.call(this,vertical_offset,b);
                        }

                        /*new↓*/
                        a.strokeStyle = "#000000";
                        a.fillStyle = "#000000";
                        if(this.zcEatees && showVisualCues && cobbler.absorptionGuide)
                            for(var zcI = 0; zcI < this.zcEatees.length; zcI++) {
                                var zcW = this.zcEatees[zcI]
                                var zcAngle = Math.max(0.2, zcW.progress)*zcW.max_angle;
                                a.globalAlpha = 1-zcW.progress;

                                a.beginPath();
                                a.arc(this.x, this.y,
                                      zcW.radius,
                                      zcW.angle-zcAngle, zcW.angle+zcAngle);
                                a.stroke();

                                if (zcW.progress < 0) {
                                    a.beginPath();
                                    a.moveTo(this.x + zcW.radius*Math.cos(zcW.angle),
                                             this.y + zcW.radius*Math.sin(zcW.angle));
                                    a.lineTo(zcW.cell.x, zcW.cell.y);
                                    a.stroke();
                                }

                                if (this === zcW.cell.zcEater) {
                                    a.beginPath();
                                    a.arc(zcW.cell.x, zcW.cell.y,
                                          20,
                                          0, 2 * Math.PI);
                                    a.fill();
                                }
                            }
                        /*new↑*/
                        a.restore();
                    }
                }
            };
            /*new*//*remap*/restorePointObj(aa.prototype);
            ua.prototype = {
                F : "",
                S : "#000000",
                U : false,
                v : "#000000",
                u : 16,
                p : null,
                T : null,
                k : false,
                D : 1,
                M : function(a) {
                    if (this.u != a) {
                        this.u = a;
                        this.k = true;
                    }
                },
                ea : function(a) {
                    if (this.D != a) {
                        this.D = a;
                        this.k = true;
                    }
                },
                setStrokeColor : function(a) {
                    if (this.v != a) {
                        this.v = a;
                        this.k = true;
                    }
                },
                C : function(a) {
                    if (a != this.F) {
                        this.F = a;
                        this.k = true;
                    }
                },
                L : function() {
                    if (null == this.p) {
                        this.p = document.createElement("canvas");
                        this.T = this.p.getContext("2d");
                    }
                    if (this.k) {
                        this.k = false;
                        var a = this.p;
                        var c = this.T;
                        var b = this.F;
                        var e = this.D;
                        var d = this.u;
                        var p = d + "px Ubuntu";
                        c.font = p;
                        var h = ~~(0.2 * d);
                        a.width = (c.measureText(b).width + 6) * e;
                        a.height = (d + h) * e;
                        c.font = p;
                        c.scale(e, e);
                        c.globalAlpha = 1;
                        c.lineWidth = 3;
                        c.strokeStyle = this.v;
                        c.fillStyle = this.S;
                        if (this.U) {
                            c.strokeText(b, 3, d - h / 2);
                        }
                        c.fillText(b, 3, d - h / 2);
                    }
                    return this.p;
                }
            };
            /*new*//*remap*/restoreCanvasElementObj(ua.prototype);
            if (!Date.now) {
                Date.now = function() {
                    return(new Date).getTime();
                };
            }
            (function() {
                var a$$0 = ["ms", "moz", "webkit", "o"];
                var c = 0;
                for (;c < a$$0.length && !d.requestAnimationFrame;++c) {
                    d.requestAnimationFrame = d[a$$0[c] + "RequestAnimationFrame"];
                    d.cancelAnimationFrame = d[a$$0[c] + "CancelAnimationFrame"] || d[a$$0[c] + "CancelRequestAnimationFrame"];
                }
                if (!d.requestAnimationFrame) {
                    d.requestAnimationFrame = function(a) {
                        return setTimeout(a, 1E3 / 60);
                    };
                    d.cancelAnimationFrame = function(a) {
                        clearTimeout(a);
                    };
                }
            })();
            var mb = {
                ja : function(a$$0) {
                    function c$$1(a, c, b, d, e) {
                        this.x = a;
                        this.y = c;
                        this.j = b;
                        this.g = d;
                        this.depth = e;
                        this.items = [];
                        this.c = [];
                    }
                    var b$$1 = a$$0.ka || 2;
                    var e$$0 = a$$0.la || 4;
                    c$$1.prototype = {
                        x : 0,
                        y : 0,
                        j : 0,
                        g : 0,
                        depth : 0,
                        items : null,
                        c : null,
                        H : function(a) {
                            var c$$0 = 0;
                            for (;c$$0 < this.items.length;++c$$0) {
                                var b = this.items[c$$0];
                                if (b.x >= a.x && (b.y >= a.y && (b.x < a.x + a.j && b.y < a.y + a.g))) {
                                    return true;
                                }
                            }
                            if (0 != this.c.length) {
                                var d = this;
                                return this.$(a, function(c) {
                                    return d.c[c].H(a);
                                });
                            }
                            return false;
                        },
                        A : function(a, c) {
                            var b$$0 = 0;
                            for (;b$$0 < this.items.length;++b$$0) {
                                c(this.items[b$$0]);
                            }
                            if (0 != this.c.length) {
                                var d = this;
                                this.$(a, function(b) {
                                    d.c[b].A(a, c);
                                });
                            }
                        },
                        m : function(a) {
                            if (0 != this.c.length) {
                                this.c[this.Z(a)].m(a);
                            } else {
                                if (this.items.length >= b$$1 && this.depth < e$$0) {
                                    this.ga();
                                    this.c[this.Z(a)].m(a);
                                } else {
                                    this.items.push(a);
                                }
                            }
                        },
                        Z : function(a) {
                            return a.x < this.x + this.j / 2 ? a.y < this.y + this.g / 2 ? 0 : 2 : a.y < this.y + this.g / 2 ? 1 : 3;
                        },
                        $ : function(a, c) {
                            return a.x < this.x + this.j / 2 && (a.y < this.y + this.g / 2 && c(0) || a.y >= this.y + this.g / 2 && c(2)) || a.x >= this.x + this.j / 2 && (a.y < this.y + this.g / 2 && c(1) || a.y >= this.y + this.g / 2 && c(3)) ? true : false;
                        },
                        ga : function() {
                            var a = this.depth + 1;
                            var b = this.j / 2;
                            var d = this.g / 2;
                            this.c.push(new c$$1(this.x, this.y, b, d, a));
                            this.c.push(new c$$1(this.x + b, this.y, b, d, a));
                            this.c.push(new c$$1(this.x, this.y + d, b, d, a));
                            this.c.push(new c$$1(this.x + b, this.y + d, b, d, a));
                            a = this.items;
                            this.items = [];
                            b = 0;
                            for (;b < a.length;b++) {
                                this.m(a[b]);
                            }
                        },
                        clear : function() {
                            var a = 0;
                            for (;a < this.c.length;a++) {
                                this.c[a].clear();
                            }
                            this.items.length = 0;
                            this.c.length = 0;
                        }
                    };
                    var d$$0 = {
                        x : 0,
                        y : 0,
                        j : 0,
                        g : 0
                    };
                    return{
                        root : new c$$1(a$$0.ca, a$$0.da, a$$0.ma - a$$0.ca, a$$0.na - a$$0.da, 0),
                        m : function(a) {
                            this.root.m(a);
                        },
                        A : function(a, c) {
                            this.root.A(a, c);
                        },
                        pa : function(a, c, b, e, f) {
                            d$$0.x = a;
                            d$$0.y = c;
                            d$$0.j = b;
                            d$$0.g = e;
                            this.root.A(d$$0, f);
                        },
                        H : function(a) {
                            return this.root.H(a);
                        },
                        clear : function() {
                            this.root.clear();
                        }
                    };
                }
            };
            var Za = function() {
                var a = new aa(0, 0, 0, 32, "#ED1C24", "");
                var c = document.createElement("canvas");
                c.width = 32;
                c.height = 32;
                var b = c.getContext("2d");
                return function() {
                    if (0 < m.length) {
                        a.color = m[0].color;
                        a.B(m[0].name);
                    }
                    b.clearRect(0, 0, 32, 32);
                    b.save();
                    b.translate(16, 16);
                    b.scale(0.4, 0.4);
                    a.w(b);
                    b.restore();
                    var d = document.getElementById("favicon");
                    var f = d.cloneNode(true);
                    /*new*/try{
                        f.setAttribute("href", c.toDataURL("image/png"));
                        /*new*/}catch(err){}
                    d.parentNode.replaceChild(f, d);
                };
            }();
            /*new*///kb();
            /*new*///f(function() {
            /*new*///    Za();
            /*new*///});

            f(function() {
                if (d.localStorage.loginCache) {
                    eb(d.localStorage.loginCache);
                }
                if (d.localStorage.fbPictureCache) {
                    f(".agario-profile-picture").attr("src", d.localStorage.fbPictureCache);
                }
            });

            d.fbAsyncInit = function() {
                function a$$0() {
                    d.FB.login(function(a) {
                        Ia(a);
                    }, {
                        scope : "public_profile, email"
                    });
                }
                d.FB.init({
                    appId : "677505792353827",
                    cookie : true,
                    xfbml : true,
                    status : true,
                    version : "v2.2"
                });
                d.FB.Event.subscribe("auth.statusChange", function(c) {
                    if ("connected" == c.status) {
                        Ia(c);
                    } else {
                        a$$0();
                    }
                });
                d.facebookLogin = a$$0;
            };

            var Ab = function() {
                function a$$0(a, c, b, d, e) {
                    var f = c.getContext("2d");
                    var g = c.width;
                    c = c.height;
                    a.color = e;
                    a.B(b);
                    a.size = d;
                    f.save();
                    f.translate(g / 2, c / 2);
                    a.w(f);
                    f.restore();
                }
                var c$$0 = new aa(0, 0, 0, 32, "#5bc0de", "");
                c$$0.id = -1;
                var b$$0 = new aa(0, 0, 0, 32, "#5bc0de", "");
                b$$0.id = -1;
                var d$$0 = document.createElement("canvas");
                d$$0.getContext("2d");
                d$$0.width = d$$0.height = 70;
                a$$0(b$$0, d$$0, "", 26, "#ebc0de");
                return function() {
                    f(".cell-spinner").filter(":visible").each(function() {
                        var b = f(this);
                        var g = Date.now();
                        var h = this.width;
                        var k = this.height;
                        var m = this.getContext("2d");
                        m.clearRect(0, 0, h, k);
                        m.save();
                        m.translate(h / 2, k / 2);
                        var q = 0;
                        for (;10 > q;++q) {
                            m.drawImage(d$$0, (0.1 * g + 80 * q) % (h + 140) - h / 2 - 70 - 35, k / 2 * Math.sin((0.001 * g + q) % Math.PI * 2) - 35, 70, 70);
                        }
                        m.restore();
                        if (b = b.attr("data-itr")) {
                            b = X(b);
                        }
                        a$$0(c$$0, this, b || "", +f(this).attr("data-size"), "#5bc0de");
                        /*new*/             });
                };
            };

            d.createParty = function() {
                ia(":party");
                J = function(a) {
                    f(".partyToken").val(a);
                    f("#helloContainer").attr("data-party-state", "1");
                };
                N();
            };

            d.joinParty = function(a) {
                f("#helloContainer").attr("data-party-state", "4");
                a = decodeURIComponent(a).replace(/.*#/gim, '');
                f.ajax(Ja + "//m.agar.io/getToken", {
                    error : function() {
                        f("#helloContainer").attr("data-party-state", "6");
                    },
                    success : function(c) {
                        c = c.split("\n");
                        f(".partyToken").val(a);
                        f("#helloContainer").attr("data-party-state", "5");
                        ia(":party");
                        Aa("ws://" + c[0], a);
                    },
                    dataType : "text",
                    method : "POST",
                    cache : false,
                    crossDomain : true,
                    data : a
                });
            };
            d.cancelParty = function() {
                f("#helloContainer").attr("data-party-state", "0");
                ia("");
                N();
            };

            /*new*///f(function() {
            /*new*///    f(kb);
            /*new*///});
            /*new*/d.onload = kb;
        }
    }
    /*new*/})(unsafeWindow, unsafeWindow.jQuery);

// ====================================== Stats Screen ===========================================================

var __STORAGE_PREFIX = "mikeyk730__";
var chart_update_interval = 10;
jQuery('body').append('<div id="chart-container" style="display:none; position:absolute; height:176px; width:300px; left:10px; bottom:44px"></div>');
var checkbox_div = jQuery('#settings input[type=checkbox]').closest('div');

// make sure player sees ads at least once so Zeach doesn't go medieval on me.
var PlayerHasSeenOfficialAds =_.once(function (){
    jQuery("#ZCPlay").show();
    jQuery("#ZCClose").text("Close");
});

unsafeWindow.hideZCOverlay = function(){
    PlayerHasSeenOfficialAds();
    jQuery('#ZCOverlay').fadeOut();
}
unsafeWindow.showZCOverlay = function (){
    jQuery('#ZCOverlay').fadeIn();
    OnShowOverlay(false);
};
jQuery('body').append('<div id="ZCOverlay" class="bs-example-modal-lg" style="position:relative;z-index: 300;">'+
'<div class="modal-dialog modal-lg">'+
'    <div class="modal-content">'+
'    <div class="modal-header">'+
'    <button type="button" class="close" onclick="hideZCOverlay();")><span>×</span></button>'+
'<h4 class="modal-title">' + zc_name + ' v' +GM_info.script.version + '</h4>'+
'</div>'+
'<div id="ZCOverlayBody" class="modal-body" style="height:675px;">'+
'    </div>'+
'    <div class="modal-footer">'+
'    <button type="button" id="ZCClose" class="btn btn-default" onclick="hideZCOverlay();">Let\'s Roll</button>'+
'    <button type="button" id="ZCPlay" class="btn btn-primary" onclick="hideZCOverlay();setNick(document.getElementById(\'nick\').value); return false;">Play</button>'+
'</div>'+
'</div><!-- /.modal-content -->'+
'</div><!-- /.modal-dialog -->'+
'</div><!-- /.modal -->');

jQuery("#ZCPlay").hide();
jQuery("#ZCOverlay").hide();

jQuery("#agario-main-buttons")
    .append('<button type="button" class="btn btn-danger" id="opnZC" onclick="showZCOverlay()" style="margin-top:5px;position:relative;width:100%;">' + zc_name + ' Options</button>');
jQuery("#agario-main-buttons")

jQuery('#ZCOverlayBody').append('<div id="ZCStats" style="position:relative;width:100%; background-color: #FFFFFF; border-radius: 15px; padding: 5px 15px 5px 15px;">'+
    '<ul class="nav nav-pills" role="tablist">' +
    '<li role="presentation">                 <a href="#page1" id="statsTab"  role="tab" data-toggle="tab">Stats</a></li>' +
    '<li role="presentation" class="active" > <a href="#page2" id="configTab" role="tab" data-toggle="tab">Extended Options</a></li>' +
    '<li role="presentation">                 <a href="#page3" id="helpTab" role="tab" data-toggle="tab">Help</a></li>' +
        //'<li role="presentation"><a href="#page3" role="tab" data-toggle="tab">IP Connect</a></li>' +
    '</ul>'+

    '<div id="bigbox" class="tab-content">' +
    '<div id="page1" role="tabpanel" class="tab-pane">' +
    '<div class="row">' +
    '<div id="statArea" class="col-sm-6" style="vertical-align:top;"></div>' +
    '<div id="pieArea" class="col-sm-5" style="vertical-align: top; height:250px;"></div>' +
    '<div id="padder" class="col-sm-1"></div>' +
    '</div>' +
    '<div class="row">' +
    '<div id="gainArea" class="col-sm-6" style="vertical-align:top;"></div>' +
    '<div id="lossArea" class="col-sm-6" style="vertical-align:top;"></div>' +
    '</div>' +
    '<div class="row">' +
    '<div id="chartArea" class="col-sm-8" ></div>' +
    '<div id="XPArea" class="col-sm-4"></div>' +
    '</div>' +
    '</div>' +
    '<div id="page2" role="tabpanel" class="tab-pane active">' +
    '<div class="row">' +
    '<div id="col1" class="col-sm-4 checkbox" style="padding-left: 5%; padding-right: 1%;"></div>' +
    '<div id="col2" class="col-sm-4" style="padding-left: 2%; padding-right: 2%;"></div>' +
    '<div id="col3" class="col-sm-4" style="padding-left: 2%; padding-right: 5%;"></div>' +
    '</div>' +
    '</div>'+
    '<div id="page3" role="tabpanel" class="tab-pane">' +
    '<div class="row">' +
    '<div id="col1" class="col-sm-6" style="padding-left: 5%; padding-right: 1%;"><h3>Keys</h3><ul>' +
    '   <li><B>TAB</B> - When split switches selected blob</li>' +
    '   <li><B>A</B> - Toggle Acid mode</li>' +
    '   <li><B>C</B> - Toggle display of visual cues</li>' +
    '   <li><B>G</B> - Toggle new grazer (better overall)</li>' +
    '   <li><B>H</B> - Toggle old grazer (slightly better early on)' +
    '   <li><B>E</B> - Fire at virus near cursor</li>' +
    '   <li><B>R</B> - Fire at virus near selected blob (virus is highlighted in red)</li>' +
    '   <li><B>M</B> - Enables/Disables mouse input</li>' +
    '   <li><B>Z</B> - Zoom in/zoom out</li>' +
    '   <li><B>1...7</B> - Selecte n-th blob sorted by size</li>' +
    '   <li><B>Click</B> - Lock currently selected blob (if blob locking enabled)</li>' +
    '   <li><B>S</B> - Unlock all blobs (if blob locking enabled)</li>' +
    '</ul></div>' +
    '<div id="col2" class="col-sm-6" style="padding-left: 5%; padding-right: 2%;"><h3></h3></div>' +
    '</div>' +
    '</div>');
jQuery(".agario-profile-panel").appendTo("#XPArea");
jQuery("#statsTab").click(function(){OnShowOverlay(false);});
function LS_getValue(aKey, aDefault) {
    var val = localStorage.getItem(__STORAGE_PREFIX + aKey);
    if (null === val && 'undefined' != typeof aDefault) return aDefault;
    return val;
}

function LS_setValue(aKey, aVal) {
    localStorage.setItem(__STORAGE_PREFIX + aKey, aVal);
}

function GetRgba(hex_color, opacity)
{
    var patt = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})$/;
    var matches = patt.exec(hex_color);
    return "rgba("+parseInt(matches[1], 16)+","+parseInt(matches[2], 16)+","+parseInt(matches[3], 16)+","+opacity+")";
}

function secondsToHms(d)
{
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
}

var chart = null;
var chart_data = [];
var num_cells_data = [];
var chart_counter = 0;
var stat_canvas = null;

var stats = null;
var my_cells = null;
var my_color = "#ff8888";
var pie = null;
var stats_chart;

var display_chart = LS_getValue('display_chart', 'false') === 'true';
var display_stats = LS_getValue('display_stats', 'false') === 'true';

function AppendCheckbox(e, id, label, checked, on_change)
{
    e.append('<label><input type="checkbox" id="'+id+'">'+label+'</label><br>');
    jQuery('#'+id).attr('checked', checked);
    jQuery('#'+id).change(function(){
        on_change(!!this.checked);
    });
    on_change(checked);
}
function AppendCheckboxP(e, id, label, checked, on_change)
{
    e.append('<p><input type="checkbox" id="'+id+'">'+label+'</p>');
    jQuery('#'+id).attr('checked', checked);
    jQuery('#'+id).change(function(){
        on_change(!!this.checked);
    });
    on_change(checked);
}

function OnChangeDisplayChart(display)
{
    LS_setValue('display_chart', display ? 'true' : 'false');
    display_chart = display;
    display ? jQuery('#chart-container').show() : jQuery('#chart-container').hide();
}

function OnChangeDisplayStats(display)
{
    LS_setValue('display_stats', display ? 'true' : 'false');
    display_stats = display;
    RenderStats(false);
}

function ResetChart()
{
    chart = null;
    chart_data.length = 0;
    num_cells_data.length = 0;
    chart_counter = 0;
    jQuery('#chart-container').empty();
}

function UpdateChartData(mass)
{
    chart_counter++;
    if (chart_counter%chart_update_interval > 0)
        return false;

    num_cells_data.push({
        x: chart_counter,
        y: my_cells.length
    });

    chart_data.push({
        x: chart_counter,
        y: mass/100
    });
    return true;
}

function CreateChart(e, color, interactive)
{
    return new CanvasJS.Chart(e,{
        interactivityEnabled: false,
        title: null,
        axisX:{
            valueFormatString: " ",
            lineThickness: 0,
            tickLength: 0
        },
        axisY:{
            lineThickness: 0,
            tickLength: 0,
            gridThickness: 2,
            gridColor: "white",
            labelFontColor: "white"
        },
        backgroundColor: "rgba(0,0,0,0.2)",
        data: [{
            type: "area",
            color: color,
            dataPoints: chart_data
        }]
    });
}

function UpdateChart(mass, color)
{
    my_color = color;
    if (chart === null)
        chart = CreateChart("chart-container", color, false);
    if (UpdateChartData(mass) && display_chart)
        chart.render();

    jQuery('.canvasjs-chart-credit').hide();
}

function ResetStats()
{
    stats = {
        pellets: {num:0, mass:0},
        w: {num:0, mass:0},
        cells: {num:0, mass:0},
        viruses: {num:0, mass:0},

        birthday: Date.now(),
        time_of_death: null,
        high_score: 0,
        top_slot: Number.POSITIVE_INFINITY,

        gains: {},
        losses: {},
    };
}

function OnGainMass(me, other)
{
    var mass = other.size * other.size;
    if (other.isVirus){
        stats.viruses.num++;
        stats.viruses.mass += mass; //TODO: shouldn't add if  game mode is teams
        sfx_event("virushit");
    }
    else if (Math.floor(mass) <= 400 && !other.name){
        stats.pellets.num++;
        stats.pellets.mass += mass;
        sfx_event("pellet");
    }
    // heuristic to determine if mass is 'w', not perfect
    else if (!other.name && mass <= 1444 && (mass >= 1369 || (other.x == other.ox && other.y == other.oy))){
        //console.log('w', mass, other.name, other);
        if (other.color != me.color){ //don't count own ejections, again not perfect
            stats.w.num++;
            stats.w.mass += mass;
        }
        sfx_event("eat");
    }
    else {
        //console.log('cell', mass, other.name, other);
        var key = other.name + ':' + other.color;
        stats.cells.num++;
        stats.cells.mass += mass;
        if (stats.gains[key] == undefined)
            stats.gains[key] = {num: 0, mass: 0};
        stats.gains[key].num++;
        stats.gains[key].mass += mass;
        sfx_event("eat");
    }
}

function OnLoseMass(me, other)
{
    var mass = me.size * me.size;
    var key = other.name + ':' + other.color;
    if (stats.losses[key] == undefined)
        stats.losses[key] = {num: 0, mass: 0};
    stats.losses[key].num++;
    stats.losses[key].mass += mass;
    sfx_event("eat");
}

function DrawPie(pellet, w, cells, viruses)
{
    var total = pellet + w + cells + viruses;
    pie = new CanvasJS.Chart("pieArea", {
        title: null,
        animationEnabled: false,
        legend:{
            verticalAlign: "center",
            horizontalAlign: "left",
            fontSize: 20,
            fontFamily: "Helvetica"
        },
        theme: "theme2",
        data: [{
            type: "pie",
            startAngle:-20,
            showInLegend: true,
            toolTipContent:"{legendText} {y}%",
            dataPoints: [
                {  y: 100*pellet/total, legendText:"pellets"},
                {  y: 100*cells/total, legendText:"cells"},
                {  y: 100*w/total, legendText:"w"},
                {  y: 100*viruses/total, legendText:"viruses"},
            ]
        }]
    });
    pie.render();
}

function GetTopN(n, p){
    var r = [];
    var a = Object.keys(stats[p]).sort(function(a, b) {return -(stats[p][a].mass - stats[p][b].mass)});
    for (var i = 0; i < n && i < a.length; ++i){
        var key = a[i];
        var mass = stats[p][key].mass;
        var name = key.slice(0,key.length-8);
        if (!name) name = "An unnamed cell";
        var color = key.slice(key.length-7);
        r.push({name:name, color:color, mass:Math.floor(mass/100)});
    }
    return r;
}

function AppendTopN(n, p, list) {
    var a = GetTopN(n,p);
    for (var i = 0; i < a.length; ++i){
        var text = a[i].name + ' (' + (p == 'gains' ? '+' : '-') + a[i].mass + ' mass)';
        list.append('<li style="font-size: 16px; "><div style="width: 16px; height: 16px; border-radius: 50%; margin-right:5px; background-color: ' + a[i].color + '; display: inline-block;"></div>' + text + '</li>');
    };
    return a.length > 0;
}

function ShowZCStats(){
    if(cobbler.showZcStats){
        jQuery("#ZCOverlay").fadeIn();
        jQuery('#statsTab').tab('show');
    }

}

function DrawStats(game_over) {
    if (!stats) return;

    jQuery('#statArea').empty();
    jQuery('#pieArea').empty();
    jQuery('#gainArea').empty();
    jQuery('#lossArea').empty();
    jQuery('#chartArea').empty();
    //jQuery('#statsTab').tab('show');

    if (game_over){
        stats.time_of_death = Date.now();
        sfx_play(1);
        ShowZCStats();
        if(window.cobbler.autoRespawn && window.cobbler.grazingMode){setTimeout(function(){jQuery(".btn-play-guest").click();},3000);}
    }
    var time = stats.time_of_death ? stats.time_of_death : Date.now();
    var seconds = (time - stats.birthday)/1000;

    var list = jQuery('<ul>');
    list.append('<li style="font-size: 16px; ">Game time: ' + secondsToHms(seconds) + '</li>');
    list.append('<li style="font-size: 16px; ">High score: ' + ~~(stats.high_score/100) + '</li>');
    if (stats.top_slot == Number.POSITIVE_INFINITY){
        list.append('<li style="font-size: 16px; ">You didn\'t make the leaderboard</li>');
    }
    else {
        list.append('<li style="font-size: 16px; ">Leaderboard max: ' + stats.top_slot + '</li>');
    }
    list.append('<li style="font-size: 16px; padding-top: 15px">' + stats.pellets.num + " pellets eaten (" + ~~(stats.pellets.mass/100) + ' mass)</li>');
    list.append('<li style="font-size: 16px; ">' + stats.cells.num + " cells eaten (" + ~~(stats.cells.mass/100) + ' mass)</li>');
    list.append('<li style="font-size: 16px; ">' + stats.w.num + " masses eaten (" + ~~(stats.w.mass/100) + ' mass)</li>');
    list.append('<li style="font-size: 16px; ">' + stats.viruses.num + " viruses eaten (" + ~~(stats.viruses.mass/100) + ' mass)</li>');
    jQuery('#statArea').append('<h2>Game Summary</h2>');
    jQuery('#statArea').append(list);

    DrawPie(stats.pellets.mass, stats.w.mass, stats.cells.mass, stats.viruses.mass);

    jQuery('#gainArea').append('<h3>Top Gains</h3>');
    list = jQuery('<ol>');
    if (AppendTopN(5, 'gains', list))
        jQuery('#gainArea').append(list);
    else
        jQuery('#gainArea').append('<ul><li style="font-size: 16px; ">You have not eaten anybody</li></ul>');

    jQuery('#lossArea').append('<h3>Top Losses</h3>');
    list = jQuery('<ol>');
    if (AppendTopN(5, 'losses', list))
        jQuery('#lossArea').append(list);
    else
        jQuery('#lossArea').append('<ul><li style="font-size: 16px; ">Nobody has eaten you</li></ul>');

    if (stats.time_of_death !== null){
        jQuery('#chartArea').height(200);
        jQuery('#chartArea')[0].height=200;
        stat_chart = CreateChart('chartArea', my_color, true);
        var scale = Math.max.apply(Math,chart_data.map(function(o){return o.y;}))/16;
        var scaled_data = num_cells_data.map(function(a){return {x:a.x, y:a.y*scale};});
        stat_chart.options.data.push({type: "line", dataPoints: scaled_data, toolTipContent:" "});
        stat_chart.render();
    }
    else {
        jQuery('#chartArea').height(200);
        jQuery('#chartArea')[0].height=200;
    }
}

var styles = {
    heading: {font:"30px Ubuntu", spacing: 41, alpha: 1},
    subheading: {font:"25px Ubuntu", spacing: 31, alpha: 1},
    normal: {font:"17px Ubuntu", spacing: 21, alpha: 0.6}
};

var g_stat_spacing = 0;
var g_display_width = 220;
var g_layout_width = g_display_width;

function AppendText(text, context, style) {
    context.globalAlpha = styles[style].alpha;
    context.font = styles[style].font;
    g_stat_spacing += styles[style].spacing;

    var width = context.measureText(text).width;
    g_layout_width = Math.max(g_layout_width, width);
    context.fillText(text, g_layout_width/2 - width/2, g_stat_spacing);
}

function RenderStats(reset) {
    if (reset) g_layout_width = g_display_width;
    if (!display_stats || !stats) return;
    g_stat_spacing = 0;

    var gains = GetTopN(3, 'gains');
    var losses =  GetTopN(3, 'losses');
    var height = 30 + styles['heading'].spacing + styles['subheading'].spacing * 2 + styles['normal'].spacing * (4 + gains.length + losses.length);

    stat_canvas = document.createElement("canvas");
    var scale = Math.min(g_display_width, .3 * window.innerWidth) / g_layout_width;
    stat_canvas.width = g_layout_width * scale;
    stat_canvas.height = height * scale;
    var context = stat_canvas.getContext("2d");
    context.scale(scale, scale);

    context.globalAlpha = .4;
    context.fillStyle = "#000000";
    context.fillRect(0, 0, g_layout_width, height);

    context.fillStyle = "#FFFFFF";
    AppendText("Stats", context, 'heading');

    var text = stats.pellets.num + " pellets eaten (" + ~~(stats.pellets.mass/100) + ")";
    AppendText(text, context,'normal');
    text = stats.w.num + " mass eaten (" + ~~(stats.w.mass/100) + ")";
    AppendText(text, context,'normal');
    text = stats.cells.num + " cells eaten (" + ~~(stats.cells.mass/100) + ")";
    AppendText(text, context,'normal');
    text = stats.viruses.num + " viruses eaten (" + ~~(stats.viruses.mass/100) + ")";
    AppendText(text, context,'normal');

    AppendText("Top Gains",context,'subheading');
    for (var j = 0; j < gains.length; ++j){
        text = (j+1) + ". " + gains[j].name + " (" + gains[j].mass + ")";
        context.fillStyle = gains[j].color;
        AppendText(text, context,'normal');
    }

    context.fillStyle = "#FFFFFF";
    AppendText("Top Losses",context,'subheading');
    for (var j = 0; j < losses.length; ++j){
        text = (j+1) + ". " + losses[j].name + " (" + losses[j].mass + ")";
        context.fillStyle = losses[j].color;
        AppendText(text, context,'normal');
    }
}

jQuery(unsafeWindow).resize(function() {
    RenderStats(false);
});

unsafeWindow.OnGameStart = function(cells) {
    my_cells = cells;
    ResetChart();
    ResetStats();
    RenderStats(true);
    sfx_play(0);
};

unsafeWindow.OnShowOverlay = function(game_in_progress) {
    DrawStats(!game_in_progress);
};

unsafeWindow.OnUpdateMass = function(mass) {
    stats.high_score = Math.max(stats.high_score, mass);
    UpdateChart(mass, GetRgba(my_cells[0].color,0.4));
};

unsafeWindow.OnCellEaten = function(predator, prey) {
    if (!my_cells) return;

    if (my_cells.indexOf(predator) != -1){
        OnGainMass(predator, prey);
        RenderStats(false);
    }
    if (my_cells.indexOf(prey) != -1){
        OnLoseMass(prey, predator);
        RenderStats(false);
    }
};

unsafeWindow.OnLeaderboard = function(position) {
    stats.top_slot = Math.min(stats.top_slot, position);
};
unsafeWindow.OnDraw = function(context) {
    display_stats && stat_canvas && context.drawImage(stat_canvas, 10, 10);
};

// ====================== SFX System ==============================================================
//sfx play on event (only one of each sfx can play - for sfx that won't overlap with itself)
var ssfxlist = [
    'spawn',
    'gameover'
];
var ssfxs = [];
for (i=0;i<ssfxlist.length;i++) {
    var newsfx = new Audio("http://skins.agariomods.com/botb/sfx/" + ssfxlist[i] + ".mp3");
    newsfx.loop = false;
    ssfxs.push(newsfx);
}
function sfx_play(id) {
    if (document.getElementById("sfx").value==0) return;
    var event = ssfxs[id];
    event.volume = document.getElementById("sfx").value;
    event.play();
}

//sfx insertion on event (multiple of same sfx can be played simultaneously)
var sfxlist = [
    'pellet',
    'split',
    'eat',
    'bounce',
    'merge',
    'virusfeed',
    'virusshoot',
    'virushit'
];

var sfxs = {};
for (i=0;i<sfxlist.length;i++) {
    var newsfx = new Audio("//skins.agariomods.com/botb/sfx/" + sfxlist[i] + ".mp3");
    newsfx.loop = false;
    newsfx.onended = function() {
        $(this).remove();
    };
    sfxs[sfxlist[i]] = newsfx;
}
function sfx_event(id) {
    if (document.getElementById("sfx").value==0) return;
    var event = jQuery.clone(sfxs[id]);
    event.volume = document.getElementById("sfx").value;
    event.play();
}

volSFX = function (vol) {
    window.cobbler.sfxVol = vol;
};

/*sfx*/
var nodeAudio = document.createElement("audio");
nodeAudio.id = 'audiotemplate';
nodeAudio.preload = "auto";
jQuery(".agario-panel").get(0).appendChild(nodeAudio);


function uiOnLoadTweaks(){
    $("label:contains('Dark theme') input").prop('checked', true);
    setDarkTheme(true);
    $("label:contains('Show mass') input").prop('checked', true);
    setShowMass(true);

    $('#nick').val(GM_getValue("nick", ""));
}
// ===============================================================================================================
uiOnLoadTweaks();

var col1 = $("#col1");
col1.append("<h4>Options</h4>");
AppendCheckbox(col1, 'showZcStats-checkbox', ' Show ' + zc_short_name + ' Stats On Death', window.cobbler.showZcStats, function(val){window.cobbler.showZcStats = val;});
col1.append("<h4>Modes</h4>");
AppendCheckbox(col1, 'isacid-checkbox', ' Enable Acid Mode', window.cobbler.isAcid, function(val){window.cobbler.isAcid = val;});
col1.append("<h4>Visual</h4>");
AppendCheckbox(col1, 'trailingtail-checkbox', ' Draw Trailing Tail', window.cobbler.drawTail, function(val){window.cobbler.drawTail = val;});
AppendCheckbox(col1, 'splitguide-checkbox', ' Draw Split Guide', window.cobbler.splitGuide, function(val){window.cobbler.splitGuide = val;});
AppendCheckbox(col1, 'absorptionguide-checkbox', ' Draw Absorption Guide', window.cobbler.absorptionGuide, function(val){window.cobbler.absorptionGuide = val;});
AppendCheckbox(col1, 'namesunder-checkbox', ' Names under blobs', window.cobbler.namesUnderBlobs, function(val){window.cobbler.namesUnderBlobs = val;});
AppendCheckbox(col1, 'gridlines-checkbox', ' Show Gridlines', window.cobbler.gridLines, function(val){window.cobbler.gridLines = val;});
AppendCheckbox(col1, 'mousecoordlines-checkbox', ' Show Mouse Lines', window.cobbler.mouseCoordLines, function(val){window.cobbler.mouseCoordLines = val;});
col1.append("<h4>Stats</h4>");
AppendCheckbox(col1, 'chart-checkbox', ' Show in-game chart', display_chart, OnChangeDisplayChart);
AppendCheckbox(col1, 'stats-checkbox', ' Show in-game stats', display_stats, OnChangeDisplayStats);
col1.append("<h4>Features</h4>");
AppendCheckbox(col1, 'feature-click-fire', ' Click to fire @ virus', window.cobbler.rightClickFires, function(val) {window.cobbler.rightClickFires = val;});
AppendCheckbox(col1, 'feature-blob-lock', ' Click to lock blob', window.cobbler.enableBlobLock, function(val) {window.cobbler.enableBlobLock = val;});
AppendCheckbox(col1, 'feature-blob-lock-next', ' Switch blob on lock', window.cobbler.nextOnBlobLock, function(val) {window.cobbler.nextOnBlobLock = val;});

var col2 = $("#col2");
col2.append('<h4>Debug Level</h4><div class="btn-group-sm" role="group" data-toggle="buttons">' +
    '<label class="btn btn-primary"><input type="radio" name="DebugLevel" id="DebugNone" autocomplete="off" value=0>None</label>' +
    '<label class="btn btn-primary"><input type="radio" name="DebugLevel" id="DebugLow" autocomplete="off" value=1>Low</label>' +
    '<label class="btn btn-primary"><input type="radio" name="DebugLevel" id="DebugHigh" autocomplete="off" value=2>High</label>' +
    '</div>');
$('input[name="DebugLevel"]:radio[value='+window.cobbler.debugLevel +']').parent().addClass("active");
$('input[name="DebugLevel"]').change( function() {window.cobbler.debugLevel = $(this).val();});

col2.append('<h4>Virus Popper</h4><h5>Milliseconds between shots</h5><div id="mspershot-group" class="input-group input-group-sm"> <input type="text" id="mspershot-textbox" class="form-control" placeholder="1-2000 (Default: 100)"' +
    'value=' + cobbler.msDelayBetweenShots.toString() + '><span class="input-group-addon">ms</span></div><h6>145ms = 7 shots per second. Lower values are faster but less stable.</h6>');
$('#mspershot-textbox').on('input propertychange paste', function() {
    var newval = parseInt(this.value);
    if(!_.isNaN(newval) && newval > 0 && newval <= 2000) {
        $("#mspershot-group").removeClass('has-error');
        cobbler.msDelayBetweenShots = newval;
    }
    else{
        $("#mspershot-group").addClass('has-error');
    }
});

col2.append('<h4>Grazer</h4><div id="grazer-checks" class="checkbox" ></div>');
var grazerChecks = $("#grazer-checks");
AppendCheckbox(grazerChecks, 'autorespawn-checkbox', ' Grazer Auto-Respawns', window.cobbler.autoRespawn, function(val){window.cobbler.autoRespawn = val;});
AppendCheckbox(grazerChecks, 'option5', ' Visualize Grazer', window.cobbler.visualizeGrazing, function(val){window.cobbler.visualizeGrazing = val;});

col2.append('<h5>Hybrid Grazer</h5>' +
    '<div id="hybrid-group" class="input-group input-group-sm"><span class="input-group-addon"><input id="hybrid-checkbox" type="checkbox"></span>' +
    '<input id="hybrid-textbox" type="text" class="form-control" value='+ cobbler.grazerHybridSwitchMass +' placeholder="Default: 300"></div>' +
    '<h6>Starts with old grazer and at specified mass switches to new grazer</h6>');
$('#hybrid-checkbox').change(function(){
    if(!!this.checked){
        $('#hybrid-textbox').removeAttr("disabled");
    } else {
        $('#hybrid-textbox').attr({disabled:"disabled"})
    }
    cobbler.grazerHybridSwitch = !!this.checked;
});
if(cobbler.grazerHybridSwitch){$('#hybrid-checkbox').prop('checked', true);}else{ $('#hybrid-textbox').attr({disabled:"disabled"})}
$('#hybrid-textbox').on('input propertychange paste', function() {
    var newval = parseInt(this.value);
    if(!_.isNaN(newval)) {
        $("#hybrid-group").removeClass('has-error');
        cobbler.grazerHybridSwitchMass = newval;
    }
    else{
        $("#hybrid-group").addClass('has-error');
    }
});


var col3 = $("#col3");
col3.append("<h4>Sound</h4>");
col3.append('<p>Sound Effects<input id="sfx" type="range" value=' + window.cobbler.sfxVol + ' step=".1" min="0" max="1" oninput="volSFX(this.value);"></p>');

// Ugly ass hack to fix effects of official code loading before mod
//$("#canvas").remove();
//$("body").prepend('<canvas id="canvas" width="800" height="600"></canvas>');
