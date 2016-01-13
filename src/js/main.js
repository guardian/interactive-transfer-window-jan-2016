import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'
import mainHTML from './text/main.html!text'
import treemapHTML from './text/treemap.html!text'
import share from './lib/share'

import underscore from 'underscore'
import d3 from 'd3';
import treemap from './lib/treemap'


var _ = underscore;

var totalSpend;

var shareFn = share('Guardian football transfer window', 'http://gu.com/p/URL', '#Interactive');
var premClubsArr = [];
var colorsArr = [];
var transfersArr, myCutsIndex, treeJson, playerCountArray, rootJSON;
var myView = false;

var globalW = 960;
var maxH = 600, borderWidth = 1;;

var datasetTransfers = null;

var globalSortVar = "to";

export function init(el, context, config, mediator) {
    iframeMessenger.enableAutoResize();

    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);

    reqwest({
        url: 'https://interactive.guim.co.uk/docsdata/1oHfE7wk0FYbbMPnbqvTNYOyLJij8WBOFl5MXa5kpa_A.json',
        type: 'json',
        crossOrigin: true,
        //success: console.log(resp)
         success: (resp) => modelData(resp)
    });

    [].slice.apply(el.querySelectorAll('.interactive-share')).forEach(shareEl => {
        var network = shareEl.getAttribute('data-network');
        shareEl.addEventListener('click',() => shareFn(network));
    });
}


function modelData(r){
    datasetTransfers = r.sheets.Data;
    console.log(r);

    treeJson = buildTreeJson();

    buildTreeMap();

    addListeners();

}

function buildTreeJson() {

        var root = {}, i, val, totalVal = 0;

        root.name = "Transfer window spending";
        root.children = [];

        
        // _.each(datasetTransfers, function(item, i){
        //     console.log(item)
        // })



        for( i = 0; i < datasetTransfers.length; i++) {
            val = getVal(datasetTransfers[i]["Price"]);
            datasetTransfers[i].size = val;
            datasetTransfers[i].mySize = val;
            datasetTransfers[i].index = i;
            datasetTransfers[i].name = datasetTransfers[i]["Title"]
            datasetTransfers[i].children = null;
            datasetTransfers[i].percentCut = 0;
            root.children.push(datasetTransfers[i]);
            totalVal += val;
        }
        
        
        val = 200;
        datasetTransfers.push({})
            datasetTransfers[i].size = val;
            datasetTransfers[i].mySize = val;
            datasetTransfers[i].index = i;
            datasetTransfers[i].name = "My cuts";
            datasetTransfers[i].children = null;
            datasetTransfers[i].percentCut = 0;
            root.children.push(datasetTransfers[i]);
            totalVal += val;
            colorsArr[i] = "#aa0000";
        root.size = totalVal;
        
        myCutsIndex = i;
        
        _.each(datasetTransfers, function(item, i){
            console.log(item)
        })
        
        return root;
        
    }

function buildTreeMap() {

    var w = globalW;
    var h = maxH;

        var treemap = d3.layout.treemap().size([w, h]).sticky(true).value(function(d) {
            if (myView) {
            return d.mySize;
            } else {
            return d.size;
            }
        });

        treemap.sort(comparator);
        
        console.log(datasetTransfers[myCutsIndex].name);
        

        function comparator(a, b) {
            return a.value - b.value;
        }

        var div = d3.select("#treemapView").append("div").style("position", "relative").style("width", w + "px").style("height", h + "px");
        
        
        
        
        var root = treeJson;

        div.data([root]).selectAll("div").data(treemap.nodes).enter().append("div").attr("class", function(d) {
            if(d.depth > 1 || d.depth == 0) {

                return "cell hide";
            } else {
                return "cell show";
            }
        }).attr("id", function(d) {

            return "cell_" + d.index;

        }).style("background", function(d) {
            //console.log(colors[d.index])
            return colorsArr[d.index] ? colorsArr[d.index] : "#a9a9a9";
        }).html(function(d) {

            return "<div class='cellCutBlock'></div><div class='cell-info'><span class='cellValue'>" + d.value + "bn</span><br /><span class='cellLabel'>" + d.name + "</span></div>";

        })//return d.children ? color(d.name) : null;
        .call(cell).on("click", function(d) {  currentDepartment = d.index;  zoomToDepartment(d); });
        
        datasetTransfers[myCutsIndex].size = 0;
        datasetTransfers[myCutsIndex].mySize = 0;
        
        div.selectAll(".cell").data(treemap.value(function(d) { return d.size; })).call(cell);
            
            //$(".cellCutBlock").hide();

            document.getElementsByClassName('cellCutBlock')[0].style.visibility='hidden';
}


function cell() {

    this.style("left", function(d) {
        return d.x + "px";
    }).style("top", function(d) {
        return d.y + "px";
    }).style("width", function(d) {
        return Math.max(0, d.dx - borderWidth) + "px";
    }).style("height", function(d) {
        return Math.max(0, d.dy - borderWidth) + "px";
    }).style("display", function(d) {
        if(d.depth <= 1 && d.depth != 0) {
            return "block";
        } else {
            return "none";
        }
    });
}

function filterTreeMap(varIn){

  globalSortVar=varIn;

    //$("#detail-view").hide();  

     var playerCount = getCountByProperty(datasetTransfers, varIn);

     playerCountArray = _.map(playerCount, function(val, key, list) {
                                var num = _.reduce(val, function(memo, player) {
                                var cost = (isNaN(parseInt(player.price))) ? 0 : parseInt(player.price);
                                return memo + cost;
                            }, 0);


                if (varIn=="Total spending"){
                      return {
                                  name: "Total spending",
                                  totalCost: num,
                                  size: val.length
                              
                              };
                }else{

                    console.log(val, key, list)
                      return {
                                name: key,
                                totalCost: num,
                                size: val.length
                              };


                }
                

            });
 
        rootJSON = buildTreeJson(playerCountArray);

        document.getElementById("treemapView").innerHTML = "";
        
      //  buildTreeMap(rootJSON);

    //checkWinSize(winW);
}

function addListeners(){
    document.getElementById("filterDropdown").addEventListener("change", updateFromFilter);
}

function updateFromFilter(){
    var x = document.getElementById("filterDropdown").value;
    filterTreeMap(x);

}

function getCountByProperty(dataset, property) {
    return _.groupBy(dataset, function(player) {
      return player[property];
    });
}


function getVal(n){
    var checkNum = (isNaN(n))
        if (checkNum){
            n = 0;
        }     
    return n;
}


// $(window).resize(function() {
    
//   setTimeout(checkWinSize, 1000)

// });


function checkWinSize(wideNumIn){

    var wideNumIn = w;

    w = document.getElementById("treemapView").outerWidth();
    if(wideNumIn <= 899){
      h = (w/6)*18;
    }
    if(wideNumIn > 899)

    {
      h = (w/10)*6;
    }



  rootJSON = buildTreeJson(playerCountArray);
    document.getElementById("treemapView").innerHTML = "";
    //.css({height: "auto"});
    buildTreeMap(rootJSON);

    //$("#detail-view").hide();
    //$('#treemapView').css('height', 'auto');

}

