import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'
import mainHTML from './text/main.html!text'
import treemapHTML from './text/treemap.html!text'
import share from './lib/share'
import treemapPosition from './lib/treemapPosition'

import underscore from 'underscore'
import d3 from 'd3';

var _ = underscore;

var totalSpend = 0;

var shareFn = share('Guardian football transfer window', 'http://gu.com/p/URL', '#Interactive');
var premClubsArr = [];
var colorsArr = [];
var allTransfersArr, myCutsIndex, treeJson, playerCountArray, rootJSON, parseData, dataset, starData, leaguesArray, nationalitiesArray, sellArr, gotoPosition;
var myView = false;


var globalSortVar = "to";
var winW;

var cellPad = {t:12, b:0, r:0, l:6};


//var premClubs=['Arsenal','Aston Villa','Bournemouth','Chelsea','Crystal Palace','Everton','Leicester City','Liverpool','Manchester City','Manchester United','Newcastle United','Norwich City','Stoke City','Southampton','Sunderland','Swansea City','Tottenham Hotspur','West Bromwich Albion','Watford','West Ham United'];

// var premClubs= [ {name:'Arsenal', hex:'#c40007'},
// { name:'Aston Villa', hex:'#720e44'},
// { name:'Bournemouth',hex:'#c80000'},
// { name:'Chelsea',hex:'#005ca4'},
// { name:'Crystal Palace',hex:'#af1f17'},
// { name:'Everton',hex:'#00349a'},
// { name:'Leicester City',hex:'#0b2f9d'},
// { name:'Liverpool',hex:'#ce070c'},
// { name:'Manchester City',hex:'#5cbfeb'},
// { name:'Manchester United',hex:'#b00101'},
// { name:'Newcastle United',hex:'#222222'},
// { name:'Norwich City',hex:'#ffe400'},
// { name:'Stoke City', hex:'#cc0617'},
// { name:'Southampton',hex:'#d71921'},
// { name:'Sunderland',hex:'#d51022'},
// { name:'Swansea City',hex:'#efefef'},
// { name:'Tottenham Hotspur',hex:'#eeeeee'},
// { name:'West Bromwich Albion',hex:'#00246a'},
// { name:'Watford', hex:'#fef502' },
// { name:'West Ham United', hex:'#7c1e42' }
// ];



var premClubs= [ {name:'Arsenal', hex:'#000000'},
{ name:'Aston Villa', hex:'#00001D'},
{ name:'Bournemouth',hex:'#001E43'},
{ name:'Chelsea',hex:'#00456E'},
{ name:'Crystal Palace',hex:'#41709D'},
{ name:'Everton',hex:'#739ECE'},
{ name:'Leicester City',hex:'#A4CFFF'},
{ name:'Liverpool',hex:'#003C51'},
{ name:'Manchester City',hex:'#00677E'},
{ name:'Manchester United',hex:'#b00101'},
{ name:'Newcastle United',hex:'#4BC6DF'},
{ name:'Norwich City',hex:'#85F9FF'},
{ name:'Stoke City', hex:'#BCFFFF'},
{ name:'Southampton',hex:'#F3FFFF'},
{ name:'Sunderland',hex:'#002519'},
{ name:'Swansea City',hex:'#004D3F'},
{ name:'Tottenham Hotspur',hex:'#377A6A'},
{ name:'West Bromwich Albion',hex:'#66A998'},
{ name:'Watford', hex:'#96DBC9' },
{ name:'West Ham United', hex:'#C9FFFC' }
];



export function init(el, context, config, mediator) {
    iframeMessenger.enableAutoResize();

    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);

    reqwest({
        url: 'https://interactive.guim.co.uk/docsdata/1oHfE7wk0FYbbMPnbqvTNYOyLJij8WBOFl5MXa5kpa_A.json',
        type: 'json',
        crossOrigin: true,
        //success: console.log(resp)
         success: (resp) => injectTreeMapFrame(resp)
    });

    [].slice.apply(el.querySelectorAll('.interactive-share')).forEach(shareEl => {
        var network = shareEl.getAttribute('data-network');
        shareEl.addEventListener('click',() => shareFn(network));
    });
}

function injectTreeMapFrame(r){
    document.getElementById('treemapFlex').innerHTML = treemapHTML;

    modelData(r);
}

function modelData(r){

        var tempArr = []; 
        var tempArrTwo = [];
        var tempArrThree = [];

        // Store in global var
        dataset = r.sheets.Data;
        allTransfersArr = dataset;
        starData = r.sheets.Star_Men;

        var topBuyArr = filterArray(starData,"topbuy","y");

        _.each(dataset, function(item){
            var tempFee = checkForNumber(item.price);
            totalSpend+=tempFee;
               var displayFee = tempFee;
                displayFee == 0 ? displayFee = item.price : displayFee = myRound(tempFee, 2 )+"m";
                item.displayFee = displayFee;


        })

        sellArr = filterArray(dataset,"previousleague","Premier League (England)");

         _.each(premClubs, function(one){
              _.each(dataset, function(two){
                  if(one.name === two.to){
                      //one = two.to;  
                      two.hex = one.hex;
                      tempArr.push (two);           
                  }           
              });
          });

         dataset = tempArr;

          _.each(dataset, function(three){
               var ageGroup = getAgeGroup(three);
               var newObj = three;
               

               newObj["age-group"] = ageGroup;

               tempArrTwo.push(newObj);
               
          });

      dataset = tempArrTwo;

      leaguesArray = getUniqueObjects("previousleague");
      leaguesArray = getZeroValueObjects(leaguesArray, "previousleague");

      nationalitiesArray = getUniqueObjects("nationality");
      nationalitiesArray = getZeroValueObjects(nationalitiesArray, "nationality");


      //console.log(nationalitiesArray);

        
        _.each(dataset, function(four){

               var newObj = four;
               var newNationality = checkForZeroValuesTwo(four.nationality);
               var newPreviousLeague = checkForZeroValues(four.previousleague);
               var nationalityCount = getCountE("nationality",four.nationality)
               var previousCount = getCountE("previousleague",four.previousleague)


               newObj["displayNationality"] = four.nationality;
               newObj["displayPreviousLeague"] = four.previousleague;
               newObj["nationality"] = checkCategory("nationality",four.nationality,nationalityCount);
               newObj["previousleague"] = checkCategory("previousLeague",four.previousleague,previousCount);
               newObj["nationalityCount"] = nationalityCount;
               newObj["previousLeagueCount"] = previousCount;

              // newObj["nationalityCount"] = nationalityCount;
               tempArrThree.push(newObj);
              
          });
        
      dataset = tempArrThree;

      // add sales to each object here or in getPlayerArr
      _.each(dataset, function (five,i){
          var sellAmount = 0;

          _.each(sellArr, function (item){
              //console.log(item)
          })


      })
      
      addListeners(); 

      setView(topBuyArr);

      

}

function setView(topBuyArr){
  
  buildTopBuyView(topBuyArr);
  filterTreeMap(globalSortVar);
  resetTreeMapDetails();
}


function filterArray(a,q,v){
    var tempArr = [];
          _.each(a, function(item,i){
              if(item[q]===v){
                  tempArr.push(item);
               }
          })
    return tempArr
}

function filterTreeMap(varIn){
  globalSortVar=varIn;
  document.getElementById("detailView").style.display="none";
      var playerCount = getCountByProperty(dataset, varIn);
        
           playerCountArray = _.map(playerCount, function(val, key, list) {


                  var num = _.reduce(val, function(memo, player) {
                  var cost = (isNaN(parseInt(player.price))) ? 0 : parseInt(player.price);
                  return memo + cost;
                }, 0);


                if (varIn=="Total spending"){
                      return {
                                name: "Total spending",
                                totalCost: num,
                                children: playerCount,
                                size: num +1000000
                              };
                }else{
                      return {
                                name: key,
                                totalCost: num,
                                children: playerCount,
                                size: num +1000000
                              };
                }
                

            });

      
           
        rootJSON = buildTreeJson(playerCountArray);
        document.getElementById('treemapView').innerHTML = "";
        buildTreeMap(rootJSON);
        //checkWinSize(winW);
}


//BEGIN ZOOMER



function buildTreeMap(dataJSON){
  var cellPad = {t:12, b:0, r:0, l:6};

  _.sortBy(dataJSON.children, function(num, i){ return dataJSON.children[i].size; }); 

    var w = document.getElementById("treemapFlex").offsetWidth,
              h = w*0.36,
              x = d3.scale.linear().range([0, w]),
              y = d3.scale.linear().range([0, h]),
              color = d3.scale.category20c(),
              root, svg, node;


          var treemap = d3.layout.treemap()
              .round(false)
              .size([w, h])
              .sticky(true)
              .ratio(3)
              .value(function(d) { return d.size; });


          svg = d3.select("#treemapFlex").append("div")
              .attr("class", "chart")
              .style("width", w + "px")
              .style("height", h + "px")
            .append("svg:svg")
              .attr("width", w)
              .attr("height", h)
            .append("svg:g")
              .attr("transform", "translate(.5,.5)");

          d3.json(dataJSON, function(data) {

              node = root = dataJSON;
              
              
            var nodes = treemap.nodes(root)            
                .filter(function(d) {  console.log(!d.children); return !d.children; });
            
            var cell = svg.selectAll("g")
                .data(nodes)

                

            .enter().append("svg:g")
                .attr("class", "cell")
                .attr("id",function(d,i){ return "tree-cell_"+i})
                .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                .on("click", function(d) { return zoom( node == d.parent ? root : d.parent,"in" ); });

            cell.append("svg:rect")
                .attr("width", function(d) { return d.dx + 1; })
                .attr("height", function(d) { return d.dy + 1; })
                .style("fill", "#005689");

            // cell.append("svg:text")
            //     .attr("x", cellPad.l)
            //     .attr("y", cellPad.t)
            //     .attr("dy", ".35em")
            //     .attr("text-anchor", "left")
            //     .text(function(d) { return d.parent.name; })
            //     .attr("class", "cellLabel")
            //     .style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });

            cell.append("svg:text")
                .attr("x", cellPad.l)
                .attr("y", function(){ return (cellPad.t*3)})
                .attr("dy", "6px")
                .attr("text-anchor", "left")
                .text(function(d) { return d.parent.displayFee; })
                .attr("class", "cellLabelFee")
                .style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });

                

           d3.select(window).on("click", function() { zoom(root,"out"); });

          d3.select("select").on("change", function() {
              treemap.value(this.value == "size" ? size : count).nodes(root);
              zoom(node);
            });
          });

            function zoom(d,dir) {

              var kx = w / d.dx, ky = h / d.dy;
              x.domain([d.x, d.x + d.dx]);
              y.domain([d.y, d.y + d.dy]);

              var c = svg.selectAll("g.cell").transition()
                  .duration(d3.event.altKey ? 7500 : 750)
                  .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

              c.select("rect")
                  .attr("width", function(d) { return kx * d.dx - 1; })
                  .attr("height", function(d) { return ky * d.dy - 1; })

              c.select(".cellLabel")
                  .attr("x", function(d) { return cellPad.l; })
                  .attr("y", function(d) { return cellPad.t; })
                  .text(function(d) { return setCellLabels(d,dir) })
                  .style("opacity", function(d) { return kx * d.dx > d.w ? 1 : 0; });

              node = d;
              d3.event.stopPropagation();

              dir == "in" ?   getTreeMapDetails(d):resetTreeMapDetails();
            }
}


function setCellLabels(d,dir){
  console.log(d)
    if(dir=="out"){ return d.parent.name +"<br>"+d.parent.displayFee};
    if(dir=="in"){ return d.name +"<br>"+d.displayFee} ;
}


function buildTreeJson(data) {
    var r = {}, i, obj;
    r.name = "flare";
    r.children = [];
    var hex;
   for ( i = 0; i < data.length; i++) {
          var tempGrandChildren = [];

          _.each(dataset, function(item,k){
                if (item.to == data[i]["name"]){
                  console.log(item)

                  var grandChild = {};
                  grandChild.tintColor = item.hex;
                  grandChild.name = item.playername;
                  grandChild.size = checkForNumber(item.price) + 1000000
                  grandChild.displayFee = item.displayFee 
                  grandChild.buyClub = item.to 
                  grandChild.sellClub = item.from 
                  grandChild.position = item.position 
                  tempGrandChildren.push(grandChild)
                  hex = item.hex;
                }
            })

               
                  obj = {};
                  obj.name = data[i]["name"];
                  obj.size = data[i]["size"]
                  obj.totalCost = data[i]["totalCost"]
                  obj.displayFee = myRound(obj.totalCost)+"m"
                  obj.tintColor = hex
                  obj.children = tempGrandChildren;

            r.children.push(obj);
            console.log(data[i])
        }

    return r;
}


function size(d) {
  return d.size;
}

function count(d) {
  return 1;
}
function getClubSells(s){
  var a=[];

  _.each(sellArr, function(item){
        if(item.from==s){
          a.push(item)
        }
  })

  return a;
}


function checkForStarStr(obj){
  var strOut = obj.name;

    _.each(starData, function(item){

      if(item.nameofplayer == obj.name && item.category ==  obj.to){
        strOut = strOut+" <span style='font-size:80%'>(pictured)</span>"
      }
// 
    });

  return strOut;


}

function getTreeMapDetails(d){

  var v=globalSortVar;
  var a = d.children;
  var clubSellArr = getClubSells(a[0].buyClub);

  console.log(clubSellArr)



  var htmlStr = "";

  _.each(a, function(item,i){

 
      htmlStr+="<h3>"+item.name+"</h3>";
      htmlStr+="<p>Fee: <strong>"+item.displayFee+"</strong></p>";
      htmlStr+="<p>Posititon: <strong>"+getPostionString(item.position)  +"</strong></p>";
      htmlStr+="<p>From: <strong>"+item.sellClub+"</strong></p>"; 

      if(i + 1 != a.length) {
        htmlStr+="<footer></footer>";
        
    }
  
  })

  document.getElementById("treeMapDetailBuy").innerHTML = htmlStr;

  var htmlStr = "";

  _.each(clubSellArr, function(item,i){
      htmlStr+="<h3>"+item.playername+"</h3>";
      htmlStr+="<p>Fee: <strong>"+item.displayFee+"</strong></p>";
      htmlStr+="<p>Posititon: <strong>"+getPostionString(item.position)  +"</strong></p>";
      htmlStr+="<p>To: <strong>"+item.to+"</strong></p>"; 

      if(i + 1 != a.length) {
        htmlStr+="<footer></footer>";
        
    }
  
  })


  document.getElementById("treeMapDetailSell").innerHTML = htmlStr;



  setStarManDetail(d);
  setDetailHead(d);
}

function setDetailHead(d){
      
   var htmlStr="<h2>"+d.name+"</h2>";
      htmlStr+="<p>Total spending: "+myRound(d.value)+"m</p>";
      htmlStr+="<footer></footer>"; 

      document.getElementById("detailHead").innerHTML = htmlStr;
}

function setStarManDetail(d){
    var starPlayerInfo = getStarMan(d);
    console.log(starPlayerInfo)

    var htmlStr='<div class="gv-halo-image-holder" style="background: url('+starPlayerInfo.imageurl+'/500.jpg)"></div>'
    

    document.getElementById("starDetail").innerHTML = htmlStr;
    
}


function resetTreeMapDetails(){

    var htmlStr= "<h2>Total spending</h2>"
      htmlStr+="<p>"+myRound(totalSpend)+"m</p>";
      htmlStr+="<footer></footer>"; 

    document.getElementById("treeMapDetailSell").innerHTML = " ";
    document.getElementById("treeMapDetailBuy").innerHTML = " ";
    document.getElementById("starDetail").innerHTML = " "; 
    document.getElementById("detailHead").innerHTML = htmlStr;
    
}

function getSellVal(obj){

  var n = 0;

  _.each(sellArr, function (item,i){
      if(item.from == obj.name){
        
        var t = checkForNumber(item.price);
        // console.log(t)
        n+=t;
      }    
  })

  return n;

}

function cell() {
    this
    .style("left", function(d) {
      return d.x + "px";
      
    })

    .style("top", function(d) {
      return d.y + "px";
    })

    .style("width", function(d) {
      return Math.max(0, d.dx - borderWidth) + "px";
    })


    .style("height", function(d) {
      return Math.max(0, d.dy - borderWidth) + "px";
    })

    .style("display", function(d) {
      if(d.depth <= 1 && d.depth != 0) {
        return "block";
      } else {
        return "none";
      }
    })

    // .transition()
    //   .style("opacity","1")
    //   .duration(500) // this is 1s
    //   .ease("inOut")
}

function getCountByProperty(dataset, property) {
    return _.groupBy(dataset, function(player) {
      return player[property];
    });
}

function getAgeGroup(objIn){
      var ageGroup;
      var ageIn = parseInt(objIn.age);
         if (ageIn < 20){ ageGroup = "19 years old and younger" }
         else if(ageIn >= 19 && ageIn <= 25){ ageGroup = "20-25 years old" }  
         else if(ageIn >= 26 && ageIn <= 30){ ageGroup = "26-30 years old" } 
         if (ageIn > 30){ ageGroup = "31 years old and over" }
      return ageGroup;
}

function getUniqueObjects(strIn){

  var tempArr = [];
  var tempStr = "";
  var tempCount;

  var datasetSorted = _.sortBy(dataset, strIn);

       var leaguesArray = _.countBy(dataset, function(obj){
              
                  var newObj = {};
                  newObj[strIn] = obj[strIn];
                  newObj["price"] = checkForNumber(obj.price);
                  newObj["counter"] = tempCount;
                  tempArr.push(newObj);  
              
        });

   return tempArr;
}


function checkForNumber(numIn){
    isNaN(numIn) ? numIn = 0 : numIn = numIn;
    numIn = Number(numIn);
    return numIn;
}


function getZeroValueObjects(arrIn, sortStr){
// check for zero values in previous leagues and nationalitites - theses will be bundled to OTHERS
        var tempArr = [];
        var names = _.pluck(arrIn, sortStr);    
        var result = _.uniq(names);//, values
        var uniqleaguesArray = result;

          _.each(uniqleaguesArray, function(one){
                    var newObj = {}
                    var tempNum = 0

                  _.each(arrIn, function(two){
                        if(one === two[sortStr]){

                              tempNum = tempNum + checkForNumber(two.price);
                              newObj[sortStr]= two[sortStr];
                              newObj["price"] = tempNum;

                              //console.log("MATCH "+tempNum)
                            }           
                    });
                  tempArr.push (newObj);
              }); 
         return tempArr;
}

function checkForZeroValues(checkStr){
      var valueOut;
          for(var i=0; i < leaguesArray.length; i++){
              if (checkStr == leaguesArray[i]["previousleague"]){
                      leaguesArray[i]["price"] == 0 ? valueOut = "Other leagues" : valueOut = checkStr;
              return valueOut;
              }
          }  
}

function checkForZeroValuesTwo(checkStr){
      var valueOut;
          for(var k=0; k < nationalitiesArray.length; k++){
              if (checkStr == nationalitiesArray[k].nationality){
                      nationalitiesArray[k]["price"] == 0 ? valueOut = "Other Countries" : valueOut = checkStr;
                      return valueOut;
              }
          }
}

function getCountE(valToCheck,checkStr){
      var valueOut = 0;
          for(var k=0; k < dataset.length; k++){
              if (checkStr == dataset[k][valToCheck]){
                     valueOut++
              }
          }
     return valueOut;
}

function checkCategory(s,str,n){
    if(n < 3 && s == "nationality"){str = "Other countries"};
    if(n < 3 && s == "previousLeague"){str = "Other leagues"};
  return str;
}

function addListeners(){

  var interactiveContainer = document.getElementById("interactiveContainer");
        if(window.attachEvent) {
            window.attachEvent('onresize', function() {
                setTimeout(checkWinSize, 1000);
            });
        }
        else if(window.addEventListener) {
            window.addEventListener('resize', function() {
                setTimeout(checkWinSize, 1000);
            }, true);
        }
        else {
            //The browser does not support Javascript event binding
        }

  document.getElementById("filterDropdown").addEventListener('change', filterChanged);
}






function checkWinSize(){

    console.log(interactiveContainer.offsetWidth);

    // var wideNumIn = w;

    // w = $("#treemap-container").outerWidth();
    // if(wideNumIn <= 899){
    //   h = (w/6)*18;
    // }
    // if(wideNumIn > 899)

    // {
    //   h = (w/10)*6;
    // }



    rootJSON = buildTreeJson(playerCountArray);
    //$('#treemap-view').empty();
    //.css({height: "auto"});
    buildTreeMap(rootJSON);

    //$("#detail-view").hide();
    //$('#treemap-view').css('height', 'auto');

}

function filterChanged(event) {
  document.getElementById("detailView").style.display="none";
   // $('#treemap-view').css('height', 'auto');

    var varIn = this.value;
    filterTreeMap(varIn);
}

function buildTopBuyView(a){
  var htmlStr = "";

  _.each(a, function (item,i){
    htmlStr+= '<div class="gv-halo-column">'
    htmlStr+= '<h2 class="gv-halo-head">'+item.nameofplayer+'</h2>'
    htmlStr+= '<div class="gv-halo-image-holder" style="background: url('+item.imageurl+'/500.jpg)">'
    htmlStr+= '</div>'  
    htmlStr+= '<h5 class="gv-halo-cap-head">words here</h5>'
    htmlStr+= '</div>'
  })

  document.getElementById("topBuyContent").innerHTML = htmlStr;


  
}

function getPosition(element) {
    var xPosition = 0;
    var yPosition = 0;
  
    while(element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
    return { x: xPosition, y: yPosition };
}


function getPostionStringTreemap(strIn){

  var strOut;

  switch(strIn) {
    case "G":
      strOut= "Goalkeeper"
      break;
    case "D":
      strOut= "Defender"
      break;
    case "M":
      strOut= "Midfielder"
      break;
    case "F":
      strOut= "Forward"
      break;
     default:
     strOut= strIn
    } 

    return strOut;       

}


function myRound(num,decimals) {
    var sign="£";
    num = (num/1000000)
    var newNum = num.toFixed(1);
    num = (newNum*1)+0;
    return sign +(num);
}


function scrollPage(d){
   var scrollTo = d.pageYOffset + d.iframeTop + gotoPosition;
   iframeMessenger.scrollTo(0, scrollTo);
}


function zoomToDetailView(d, currClip, h) { 
  
  document.getElementById("detailView").style.display="block";




 
  // var offset = $(currClip).offset();
  // globalOffsetClip = $(currClip); 
  // var newTop = (offset.top + $(currClip).height());
  // var newLeft = offset.left;
  var newArr = getDetailArray(d.name, globalSortVar);

  setDetailView(newArr, globalSortVar, d, currClip, h);




  //     $("#detail-view").show().css({
  //       opacity : 0
  //     });




  //     $("#treemapView").css({
  //       height : ($(currClip).height() + parseInt($(currClip).css('top'), 10) ) + 'px'
  //     });

      

  
}

 function getStarMan(d){
  var obj;

  _.each(starData, function(one){

          if(one.category === d.name){
                  obj = one;      
              }           
          });
      
    return obj;
 }


function getDetailArray (nameIn,valIn){
  //buyArray, to, "Arsenal"
      var tempArr = [];
  //getClubArray(d.name, globalSortVar);

      if (valIn!="Total spending"){
          tempArr = _.filter(dataset, function(item){ return item[valIn] == nameIn; });
          
      }else{
          tempArr = dataset;
      }
      
  return tempArr;
}

function getSpendStr(strIn){

  var strOut;

  switch(strIn) {
    case "to":
      strOut= "spent by this club"
      break;
    case "previousleague":
      strOut= "spent on players from this league"
      break;
    case "age-group":
      strOut= "spent on players in this age range"
      break;
    case "nationality":
      strOut= "spent on players from this country"
      break;
    case "position":
      strOut= "spent on players in this position"
      break;
     default:
     strOut= strIn
    } 

    //strOut = "&nbsp;";

    return strOut;   

}

function getPostionString(strIn){

  var strOut;

  switch(strIn) {
    case "G":
      strOut= "goalkeeper"
      break;
    case "D":
      strOut= "defender"
      break;
    case "M":
      strOut= "midfielder"
      break;
    case "F":
      strOut= "forward"
      break;
     default:
     strOut= strIn
    } 

    return strOut;       

}

function setDetailView(arrIn,strIn,d, c, h){


    var starPlayerInfo = getStarMan(d);
    var htmlStrR = "";
    var htmlStrC = "";
    var totalFees = 0;
    var checkStarName = starPlayerInfo.nameofplayer;
    var starPlayerFormatName = starPlayerInfo.nameofplayer;
    var spendStr = getSpendStr(strIn);

    starPlayerFormatName = starPlayerFormatName.replace(/\s+/g, '&nbsp;');
   
    strIn == "Total spending" ? document.getElementById("detailHeader").innerHTML ="Total spending" :  document.getElementById("detailHeader").innerHTML = (getPostionString(arrIn[0][strIn]));
   

        _.each(arrIn, function(item) {

            var tempFee = checkForNumber(item.price);
            var displayFee = tempFee;
            displayFee == 0 ? displayFee = item.price : displayFee = myRound(tempFee, 2 )+"m";


            if(checkStarName==item.playername){
              
              var starStr="";
              starStr+="<h3>"+item.playername+" <span style='font-weight:200; font-size:80%'>(pictured above)</span></h3>";
              starStr+="<p>";
              if(strIn=="previousleague" && arrIn[0][strIn]=="Other leagues"){
                    starStr+="Previous&nbsp;league:&nbsp;"+item.displayPreviousLeague+". <br/>";
              }

              if(strIn=="nationality" && arrIn[0][strIn]=="Other countries"){
                  htmlStrR+="Nationality:&nbsp;"+item.displayNationality+"</br>";
              }

              starStr+=displayFee+". To "+item.to+" from "+item.from;
              starStr+="<br/>Position:&nbsp;"+getPostionString(item.position).toLowerCase()+". ";
              starStr+="Age:&nbsp;"+item.age+". "; 

              if(arrIn[0][strIn]!="Other countries"){
              starStr+="Nationality:&nbsp;"+item.displayNationality+"</p>";
              }

              // get the starman at the top of htmlStrR even if the starMan is in middle of arrin
              htmlStrR=starStr+" "+htmlStrR;

            }


            
            if(checkStarName!=item.playername){
              htmlStrR+="<h3>"+item.playername+"</h3>";
              htmlStrR+="<p>";

              if(strIn=="previousleague" && arrIn[0][strIn]=="Other leagues"){
                    htmlStrR+="Previous&nbsp;league:&nbsp;"+item.displayPreviousLeague+". <br/>";
              }

              if(strIn=="nationality" && arrIn[0][strIn]=="Other countries"){
                    htmlStrR+="Nationality:&nbsp;"+item.displayNationality+"</br>";
              }

              htmlStrR+=displayFee+". To "+item.to+" from "+item.from;
              htmlStrR+="<br/>Position:&nbsp;"+getPostionString(item.position)+". ";
              htmlStrR+="Age:&nbsp;"+item.age+". ";

              if(arrIn[0][strIn]!="Other countries"){
                    htmlStrR+="Nationality:&nbsp;"+item.displayNationality+"</p>";
              }
            }
            
            totalFees+=tempFee;

          })
        htmlStrR="<div id='starManContainer'><div id='starManPic' style='background-image: url("+starPlayerInfo.imageurl+"/500.jpg)'></div><div id='transferList'>"+htmlStrR+"</div>";

        htmlStrR+="<br/><div class='styled-select'><button id='back-to-top'>back to top of interactive</button></div>";
        // 


      
        document.getElementById("centerPanel").innerHTML = htmlStrR;

        if(arrIn[0][strIn]=="Other leagues" || arrIn[0][strIn]=="Other countries"){
          document.getElementById("leftPanel").innerHTML = " ";
        }else{
           document.getElementById("leftPanel").innerHTML = "<div class='large-number-left'>"+myRound(totalFees, 2 )+"<span class='large-number-left-M'>m</span></div><div class='number-caption'>"+spendStr+"</div>";
        }
        
        
        treemapPosition(c,h);
      

}







