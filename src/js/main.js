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
var allTransfersArr, treeJson, playerCountArray, rootJSON, parseData, dataset, starData, leaguesArray, nationalitiesArray, sellArr, gotoPosition;
var myView = false;

var svgArrow = "";

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
        
        starData = r.sheets.Star_Men;

        var topBuyArr = filterArray(starData,"topbuy","y");

        _.each(dataset, function(item){
            var tempFee = checkForNumber(item.price);
            totalSpend+=tempFee;
               var displayFee = tempFee;
                displayFee == 0 ? displayFee = item.price : displayFee = myRound(tempFee, 2 );
                item.displayFee = displayFee;
                item.name = item.playername;
                item.buyClub = item.to;
                item.sellClub = item.from;


        })
    allTransfersArr = dataset;
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

   setTreeMapDetails(rootJSON, "null")
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


function filterArrayPrem(a,v){
  var tempArr = [];
   _.each(premClubs, function(one){
              _.each(a, function(two){
                  if(one.name === two[v]){
                      //one = two.to;  
                      
                      tempArr.push (two);           
                  }           
              });
          });
   return tempArr;

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

  addD3Tree(dataJSON)

 
}


function setCellLabels(d,dir){
  console.log(d)
    if(dir=="out"){ return d.parent.name +"<br>"+d.parent.displayFee};
    if(dir=="in"){ return d.name +"<br>"+d.displayFee} ;
}


function buildTreeJson(data) {
    var r = {}, i, obj;
    r.name = "Showing all clubs";
    r.children = [];

    var allDealsArr = [];
    var hex;
    var totalCost;
    var allSalesCost = 0;
    var allBuysCost = 0;
    
    for ( i = 0; i < data.length; i++) {
          var buyGrandChildren = [];


          _.each(dataset, function(item,k){
                if (item.to == data[i]["name"]){
                  var grandChild = {};
                  grandChild.tintColor = item.hex;
                  grandChild.name = item.playername;
                  grandChild.price = checkForNumber(item.price)
                  grandChild.size = checkForNumber(item.price) + 1000000
                  grandChild.value = checkForNumber(item.price) + 1000000
                  grandChild.displayFee = item.displayFee 
                  grandChild.buyClub = item.to 
                  grandChild.sellClub = item.from 
                  grandChild.position = item.position
                  grandChild.buySell = getBuySell(data[i].name, item.to)
                  buyGrandChildren.push(grandChild)
                  hex = item.hex;
                }
            })

        var sellGrandChildren = [];
            
            _.each(dataset, function(item,k){
                if (item.from == data[i]["name"]){
                  var grandChild = {};
                  grandChild.tintColor = item.hex;
                  grandChild.name = item.playername;
                  grandChild.price = checkForNumber(item.price)
                  grandChild.size = checkForNumber(item.price) + 1000000
                  grandChild.value = checkForNumber(item.price) + 1000000
                  grandChild.displayFee = item.displayFee 
                  grandChild.buyClub = item.to 
                  grandChild.sellClub = item.from 
                  grandChild.position = item.position
                  grandChild.buySell = getBuySell(data[i].name, item.to)
                  sellGrandChildren.push(grandChild)
                  hex = item.hex;
                }
            })     

           

            var buyFigure = 0;
            _.each(buyGrandChildren, function(item){
                  if(item.buySell == "buy"){ 
                    buyFigure += checkForNumber(item.price)
                    allBuysCost += checkForNumber(item.price) 
                  }
            })

            data[i].buyCost = buyFigure;


            var sellFigure = 0;
            _.each(sellGrandChildren, function(item){
                  if(item.buySell == "sell"){ 
                      sellFigure += checkForNumber(item.price); 
                      allSalesCost+= checkForNumber(item.price);
                  }
            })

            data[i].sellCost = sellFigure;

                  obj = {};
                  obj.name = data[i]["name"];
                  obj.size = data[i]["size"] + data[i].salesCost;
                  obj.value = data[i]["size"]  + data[i].salesCost
                  obj.totalCost = data[i]["totalCost"]
                  obj.buyCost = data[i].buyCost;
                  obj.sellCost = data[i].sellCost;

                  obj.displayFee = myRound(obj.totalCost)
                  obj.balanceCost = obj.buyFigure - obj.totalCost;
                  obj.grossCost = obj.buyFigure + obj.totalCost;

                  obj.tintColor = hex
                  obj.children = buyGrandChildren;
                  obj.sellChildren = sellGrandChildren;

            r.children.push(obj);
            r.sellCost = allSalesCost;
            r.buyCost = allBuysCost;
       
        }


    return r;
}

function getBuySell(v1, v2){
  var s;
  v1 == v2 ? s = "buy" : s = "sell";
  return s;
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

function setFeeForDetail(v){
  if (!isNaN(v)){
    v = "£"+v+"m"
  }

  return v;

}


function setTreeMapDetails(d){

 var a = filterArrayPrem(allTransfersArr,"to"); 
 var clubSellArr = filterArrayPrem(allTransfersArr,"from");
 
  var htmlStr = "<p style='margin:0; display:inline;'>";

    _.each(a, function(item,i){
      var spanClass = "buy-list-item";
      if(d.name == item.buyClub){ spanClass+=" highlight-cell" }

          htmlStr+="<span id='buyList_"+i+"' class='"+spanClass+"' data-club='"+item.buyClub+"'><b>"+item.name+"</b> ";
          if(i != 0) { htmlStr+="; "; }
          htmlStr+=setFeeForDetail(item.displayFee)+", ";
          htmlStr+=getPostionString(item.position);
          htmlStr+=", from "+item.sellClub;
          htmlStr+=" to "+item.buyClub;
          htmlStr+="</span>";  
      })

     
     htmlStr += "</p>";
  if (a.length == 0){ htmlStr = " "};

  document.getElementById("treeMapDetailBuy").innerHTML = htmlStr;

  var htmlStr = "<p style='margin:0; display:inline;'> ";

  _.each(clubSellArr, function(item,i){
    var spanClass = "sell-list-item";
      if(d.name == item.sellClub){ spanClass+=" highlight-cell" }
      
      htmlStr+="<span  id='sellList_"+i+"' class='"+spanClass+"' data-club='"+item.sellClub+"'><b>"+item.playername+"</b>";
      if(i != 0) { htmlStr+="; "; }
      htmlStr+=setFeeForDetail(item.displayFee)+", ";
      htmlStr+=getPostionString(item.position);
      htmlStr+=", from "+item.sellClub;
      
      htmlStr+=" to "+item.buyClub+"</span>"; 
      
  })
      htmlStr += "</p>";

  if (clubSellArr.length == 0){ htmlStr = " "};

    document.getElementById("treeMapDetailSell").innerHTML = htmlStr

    setDetailHead(d);

    console.log(clubSellArr)
}



function setDetailHead(d){
      
   var htmlStr="<h2>"+d.name+"</h2>";
      htmlStr+="<p>Total spending: "+myRound(d.value)+"m</p>";
      htmlStr+="<footer></footer>"; 

      document.getElementById("grandParentButton").innerHTML = " ";
      if (d.name!="Showing all clubs"){ document.getElementById("grandParentButton").innerHTML = "click here to show all spending"; }
      
      document.getElementById("grandParentText").innerHTML = d.name +" total spending: £"+myRound(d.buyCost)+"m";
      document.getElementById("grandParentStack").innerHTML = " ";
}

function setStarManDetail(d){
    var starPlayerInfo = getStarMan(d);
    console.log(starPlayerInfo)

    var htmlStr='<div class="gv-halo-image-holder" style="background: url('+starPlayerInfo.imageurl+'/500.jpg)"></div>'
    
}


function resetTreeMapDetails(){

    var htmlStr= "<h2>Total spending</h2>"
      htmlStr+="<p>"+myRound(totalSpend)+"m</p>";
      htmlStr+="<footer></footer>"; 

    document.getElementById("treeMapDetailSell").innerHTML = " ";
    document.getElementById("treeMapDetailBuy").innerHTML = " ";
    //document.getElementById("starDetail").innerHTML = " "; 
    //document.getElementById("detailHead").innerHTML = htmlStr;
    
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

    addD3Tree(dataJSON)

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
    return (num);
}


function scrollPage(d){
   var scrollTo = d.pageYOffset + d.iframeTop + gotoPosition;
   iframeMessenger.scrollTo(0, scrollTo);
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


function addD3Tree(dataJSON){

  setBarChartVals(dataJSON)
      document.getElementById("treemapFlex").innerHTML = "";
          

                      var margin = {top: 60, right: 0, bottom: 0, left: 0},
                          width = d3.select("#treemapFlex").node().getBoundingClientRect().width,
                          height = width * 0.48,
                          formatNumber = d3.format(",d"),
                          transitioning;

                      var x = d3.scale.linear()
                          .domain([0, width])
                          .range([0, width]);

                      var y = d3.scale.linear()
                          .domain([0, height])
                          .range([0, height]);

                      var treemap = d3.layout.treemap()
                          .children(function(d, depth) { return depth ? null : d._children; })
                          .sort(function(a, b) { return a.value - b.value; })
                          .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
                          .round(false);

                      var svg = d3.select("#treemapFlex").append("svg")
                          .attr("width", width + margin.left + margin.right)
                          .attr("height", height + margin.bottom + margin.top)
                          .style("margin-left", -margin.left + "px")
                          .style("margin.right", -margin.right + "px")
                        .append("g")
                          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                          .style("shape-rendering", "crispEdges");

                      var grandparent = svg.append("g")
                          .attr("class", "grandparent");

                      grandparent.append("rect")
                          .attr("y", -margin.top)
                          .attr("width", width)
                          .attr("height", margin.top);

                      grandparent.append("text")
                          .attr("x", 0)
                          .attr("y", 18 - margin.top)
                          .attr("class", "grandParentLabel")
                          .attr("dy", ".75em");

                      grandparent.append("text")
                          .attr("x", 0)
                          .attr("y", 36- margin.top)
                          .attr("id","grandParentStack")
                          .attr("class", "cellLabel grey")
                          .attr("dy", ".75em");

                      grandparent.append("text")
                          .attr("x", 0)
                          .attr("y", 0 - margin.top)
                          .attr("id","grandParentButton")
                          .attr("class", "cellLabel blue")
                          .attr("dy", ".75em");      



                      d3.json(dataJSON, function() {
                        var root, node;
                        node = root = dataJSON;
                        initialize(root);
                        accumulate(root);
                        layout(root);
                        display(root);

                        function initialize(root) {
                          root.x = root.y = 0;
                          root.dx = width;
                          root.dy = height;
                          root.depth = 0;
                        }

                        // Aggregate the values for internal nodes. This is normally done by the
                        // treemap layout, but not here because of our custom implementation.
                        // We also take a snapshot of the original children (_children) to avoid
                        // the children being overwritten when when layout is computed.
                        function accumulate(d) {
                          return (d._children = d.children)
                              ? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
                              : d.value;
                        }

                        // Compute the treemap layout recursively such that each group of siblings
                        // uses the same size (1×1) rather than the dimensions of the parent cell.
                        // This optimizes the layout for the current zoom state. Note that a wrapper
                        // object is created for the parent node for each group of siblings so that
                        // the parent’s dimensions are not discarded as we recurse. Since each group
                        // of sibling was laid out in 1×1, we must rescale to fit using absolute
                        // coordinates. This lets us use a viewport to zoom.
                        function layout(d) {
                          if (d._children) {
                            treemap.nodes({_children: d._children});
                            d._children.forEach(function(c) {
                              c.x = d.x + c.x * d.dx;
                              c.y = d.y + c.y * d.dy;
                              c.dx *= d.dx;
                              c.dy *= d.dy;
                              c.parent = d;
                              layout(c);
                            });
                          }
                        }

                        function display(d) {
                          var head = d3.select("#detailHead") 
                              .on("click", transition)   

                          grandparent
                              .datum(d.parent)
                              .on("click", transition)
                            .select("text")
                              .attr("id", "grandParentText")
                              .text("Showing all clubs")
                              .attr("class", "grandParentLabel");

                          var g1 = svg.insert("g", ".grandparent")
                              .datum(d)
                              .attr("class", "depth");

                          var g = g1.selectAll("g")
                              .data(d._children)
                            .enter().append("g");

                          g.filter(function(d) { return d._children; })
                              .classed("children", true)
                              .on("click", transition);

                          g.selectAll(".child")
                              .data(function(d) { return d._children || [d]; })
                            .enter().append("rect")
                              .attr("class", "child ")
                              .attr("class", function(d) { return "child "+(d.buySell); })

                              .call(rect);

                          g.append("rect")
                              .style("fill", function(d){return d.tintColor})
                              .attr("class", "parent")
                              .call(rect)
                            // .append("title")
                            //   .text(function(d) { return formatNumber(d.name); });

                          g.append("text")
                              .attr("dy", ".75em")
                              .text(function(d) { return d.name; })
                              .attr("class", "cellLabel")
                              .call(text);

                           g.append("text")
                              .attr("dy", "1.3em")
                              .text(function(d) { return d.displayFee; })
                              .attr("class", "cellLabelFee")
                              .call(text);


                          function transition(d) {
                            updateBarChart(d)
                            if (transitioning || !d) return;
                            transitioning = true;

                            var g2 = display(d),
                                t1 = g1.transition().duration(750),
                                t2 = g2.transition().duration(750);

                            // Update the domain only after entering new elements.
                            x.domain([d.x, d.x + d.dx]);
                            y.domain([d.y, d.y + d.dy]);

                            // Enable anti-aliasing during the transition.
                            svg.style("shape-rendering", null);

                            // Draw child nodes on top of parent nodes.
                            svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

                            // Fade-in entering text.
                            g2.selectAll("text").style("fill-opacity", 0);

                            // Transition to the new view.
                            t1.selectAll("text").call(text).style("fill-opacity", 0);
                            t2.selectAll("text").call(text).style("fill-opacity", 1);
                            t1.selectAll("rect").call(rect);
                            t2.selectAll("rect").call(rect);

                            // Remove the old node when the transition is finished.
                            t1.remove().each("end", function() {
                              svg.style("shape-rendering", "crispEdges");
                              transitioning = false;
                            });
                            
                            setTreeMapDetails(d)

                            //document.getElementById("resetTreeMapDetails").innerHTML = "All spending";
                          }

                          return g;
                        }

                        function text(text) {
                          text.attr("x", function(d) { return x(d.x) + 6; })
                              .attr("y", function(d) { return y(d.y) + 6; });
                        }

                        function rect(rect) {
                          rect.attr("x", function(d) { return x(d.x); })
                              .attr("y", function(d) { return y(d.y); })
                              .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
                              .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
                        }

                        function name(d) {
                          return d.parent
                              ? name(d.parent) + "." + d.name
                              : d.name;
                        }
                      });

  

}

var barMax;

function setBarChartVals(d){
 
    console.log(d)

    var barMin = 0;
    barMax = Math.max(d.sellCost, d.buyCost); 
    var barChart = d3.select("#barChart");


    barChart.html("Hello world! "+barMax);

    buildBarChart(d,barMin,barMax)
}


function buildBarChart(d,min,max){

  var barChart = document.getElementById("barChart");
  var width = barChart.offsetWidth;
  var height = 480;
  var unit = 1000000;
  var onePc = 100/(max/unit);
  var allSalesW = (d.allSalesCost/unit)*onePc;
  var axisStr = '<div class="gv-graph-axis" style="margin-bottom:60px;">';

  for (var k = 0; k < (max/unit); k+=10){
      var labelStr;
    
      if(k == 0){
        axisStr += '<span class="'+getAxisClass(k)+'" style="left: '+(k*onePc)+'%">£millions</span>'; 
      }
      if(k > 10){
        axisStr += '<span class="'+getAxisClass(k)+'" style="left: '+(k*onePc)+'%">'+k+'</span>'; 
      }
      
  }
   axisStr += '</div>';

   console.log(d)

   var tableStr = '<table class="bars-data-table" id="spendingTable">'
   tableStr +=  '<tbody><tr class="spaceAbove" ><td id="tableClub" style="padding-top:72px">Arsenal<br><span class="gv-definition-text" id="tableBalance">Balance: +£10m</span></td></tr>'
   tableStr +=  '<tr><td><div class="bars-data-bar plague-bar" style="width: 10%;" id="clubBarBuys"></div></td></tr>'
   tableStr +=  '<tr><td><div class="bars-data-bar plague-bar" style="width: 25%;" id="clubBarSales"></div></td></tr>'
   tableStr +=  '<tr class="spaceAbove"><td>All clubs<br><span class="gv-definition-text">£250m</span></td></tr>' 
   tableStr +=  '<tr><td><div class="bars-data-bar plague-bar" style="width: 100%;"></div></td></tr>'
   tableStr +=  '<tr><td><div class="bars-data-bar plague-bar" style="width: '+allSalesW+'%; background:#194377 !important;"></div></td>'
   tableStr +=  '</tr></tbody></table> '


   var htmlStr = axisStr+tableStr;

   barChart.innerHTML = htmlStr;

//<span class="timeline__one" style="left: 0%; width: 16.666666666666668%">Spending £millions</span> 


}

function setBarChart(d){
    var newPc = (d.buyCost/barMax)*100;
    //document.getElementById('clubBarSales').width = newPc+"%";

}

function getAxisClass(k){
  var c = "timeline__one";

  if (k > 0){ c = "timeline__label"}

  return c;
}

function updateBarChart(d){


  if(d === "undefined"){
      document.getElementById('tableClub').innerHTML = ' ';
  }else{
      var  n = checkForNumber(d.sellCost-d.buyCost)
      document.getElementById('tableClub').innerHTML = d.name +'<br><span class="gv-definition-text" id="tableBalance">Balance:'+n+'</span>';
      
  }


 

}




