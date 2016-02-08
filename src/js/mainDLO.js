
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
var allTransfersArr, treeJson, playerCountArray, rootJSON, parseData, dataset, starData, leaguesArray, nationalitiesArray, sellArr, gotoPosition, dataJSON;
var treemap;
var myView = false;
var rootTitle = "All clubs";


var globalSortVar = "to";
var mobileWin = 739;

var cellPad = {t:12, b:0, r:0, l:6};

var premClubs= [ {name:'Arsenal', hex:'#000000'},
{ name:'Aston Villa', hex:'#00001D'},
{ name:'Bournemouth',hex:'#001E43'},
{ name:'Chelsea',hex:'#00456E'},
{ name:'Crystal Palace',hex:'#41709D'},
{ name:'Everton',hex:'#739ECE'},
{ name:'Leicester City',hex:'#000232'},
{ name:'Liverpool',hex:'#003C51'},
{ name:'Manchester City',hex:'#a4cfff'},
{ name:'Manchester United',hex:'#1c4c00'},
{ name:'Newcastle United',hex:'#4BC6DF'},
{ name:'Norwich City',hex:'#00677E'},
{ name:'Stoke City', hex:'#062300'},
{ name:'Southampton',hex:'#658299'},
{ name:'Sunderland',hex:'#002519'},
{ name:'Swansea City',hex:'#004D3F'},
{ name:'Tottenham Hotspur',hex:'#377A6A'},
{ name:'West Bromwich Albion',hex:'#66A998'},
{ name:'Watford', hex:'#96DBC9' },
{ name:'West Ham United', hex:'#41709D' }
];



export function init(el, context, config, mediator) {

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

        var topBuyArr = filterArray( starData,"topbuy","y" );

        _.each(topBuyArr, function(item){
              var obj = {};
              
              _.each(dataset, function(d){
                  if (d.playername == item.nameofplayer)
                   item.dataObj = d;
              })

        })

        _.each(dataset, function(item){
            var tempFee = checkForNumber(item.price);
            totalSpend+=tempFee;
               var displayFee = tempFee;
                displayFee == 0 ? displayFee = item.price : displayFee = myRound(tempFee, 2 );
                displayFee == 0 ? item.itemNumericFee = 0 : item.itemNumericFee = displayFee;
                item.displayFee = displayFee;
                item.name = item.playername.trim();
                item.buyClub = item.to;
                item.sellClub = item.from; 


        })
    allTransfersArr = dataset;

        sellArr = filterArray(dataset,"previousleague","Premier League (England)");

         _.each(premClubs, function(one){
              _.each(dataset, function(two){
                  if(one.name === two.to || one.name === two.from){
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
  setTreeMapDetails(rootJSON)
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
                    var cost = (isNaN(parseInt(player.price))) ? 0 : parseInt(player.price);return memo + cost;}, 0);
                              if (varIn=="Total spending"){
                                      return {
                                                name: "Total spending",
                                                totalCost: num,
                                                size: num +1000000
                                              };
                                }else{
                                      return {
                                                name: key,
                                                totalCost: num,
                                                size: num +1000000
                                              };
                                }
                        

                    });

        var playerCountSell = getCountByProperty(dataset, "from");

            var playerCountArraySell = _.map(playerCountSell, function(val, key, list) {
                    var num = _.reduce(val, function(memo, player) {
                    var cost = (isNaN(parseInt(player.price))) ? 0 : parseInt(player.price);return memo + cost;}, 0);
                              if (varIn=="Total spending"){
                                      return {
                                                name: "Total spending",
                                                totalProfit: num,
                                                size: num +1000000
                                              };
                                }else{
                                      return {
                                                name: key,
                                                totalProfit: num,
                                                size: num +1000000
                                              };
                                }
                        

                    });
      
      playerCountArray = filterArrayPrem (playerCountArray, "name");
      playerCountArraySell =  filterArrayPrem (playerCountArraySell, "name");

      var tempArr=[];

      _.each(playerCountArray, function(buyItem){
            var tempObj = {};
                  _.each(playerCountArraySell, function(sellItem){
                    
                            if (buyItem.name == sellItem.name){
                                  tempObj.name = buyItem.name;
                                  tempObj.totalProfit = sellItem.totalProfit;
                                  tempObj.totalCost = buyItem.totalCost;
                                  tempObj.size = buyItem.size + sellItem.size;
                            }
                      
                  })
              tempArr.push(tempObj);
      })


      _.each(premClubs, function(item){
                 _.each(playerCountArraySell, function(sellItem){                    
                            if (item.name == sellItem.name){
                                  item.totalProfit = sellItem.totalProfit;
                            }
                  })

                 _.each(playerCountArray, function(buyItem){                    
                            if (item.name == buyItem.name){
                                  item.totalCost = buyItem.totalCost;
                            }
                  })

      })

      _.each(premClubs, function(item){
            if(!item.totalProfit){item.totalProfit=0};
            if(!item.totalCost){item.totalCost=0};
      });

      playerCountArray = premClubs;
      checkTreemapSize()
}

function buildTreeMap(dataJSON){
  addD3Tree(dataJSON)
}
//BEGIN ZOOMER


function setCellLabels(d,dir){
  console.log(d)
    if(dir=="out"){ return d.parent.name +"<br>"+d.parent.displayFeeNum};
    if(dir=="in"){ return d.name +"<br>"+d.displayFeeNum} ; 
}


function buildTreeJson(data) {

    var r = {}, i, obj;
    r.name = rootTitle;
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
                  grandChild.tintColor = data[i].hex;
                  grandChild.name = item.playername;
                  grandChild.price = checkForNumber(item.price)
                  grandChild.buyCost = checkForNumber(item.price)
                  grandChild.size = checkForNumber(item.price) + 1000000
                  grandChild.value = checkForNumber(item.price) + 1000000
                  grandChild.displayFee = item.displayFee 
                  grandChild.displayFeeNum = item.itemNumericFee
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
                  grandChild.tintColor = data[i].hex;
                  grandChild.name = item.playername;
                  grandChild.price = checkForNumber(item.price)
                  grandChild.buyCost = checkForNumber(item.price)
                  grandChild.size = checkForNumber(item.price) + 1000000
                  grandChild.value = checkForNumber(item.price) + 1000000
                  grandChild.displayFee = item.displayFee 
                  grandChild.displayFeeNum = item.itemNumericFee
                  grandChild.buyClub = item.to 
                  grandChild.sellClub = item.from 
                  grandChild.position = item.position
                  grandChild.buySell = getBuySell(data[i].name, item.to)
                  sellGrandChildren.push(grandChild)
                  hex = item.hex;
                }
            })     


                  obj = {};
                  obj.name = data[i]["name"];
                  obj.value = data[i]["size"]  + data[i].salesCost
                  obj.totalCost = data[i]["totalCost"]
                  obj.buyCost = data[i].buyCost;
                  obj.sellCost = data[i].sellCost;

                  obj.displayFee = myRound(obj.totalCost)
                  obj.displayFeeNum =  myRound(obj.totalCost)
                  obj.balanceCost = obj.buyFigure - obj.totalCost;
                  obj.grossCost = obj.buyFigure + obj.totalCost;

                  obj.tintColor =  data[i].hex;
                  //obj.children = buyGrandChildren;
                  obj.sellChildren = sellGrandChildren;
                  obj.children = buyGrandChildren.concat(sellGrandChildren);

                  
                  var uniqueList = _.uniq(obj.children, function(item, key, name) { return item.name; });

                  obj.children = uniqueList;

                  var sellFigure = 0;
                  var buyFigure = 0;
                  _.each(obj.children, function(item){
                        if(item.buySell == "buy"){ 
                          buyFigure += checkForNumber(item.price)
                          allBuysCost += checkForNumber(item.price) 
                        }
                        if(item.buySell == "sell"){ 
                            sellFigure += checkForNumber(item.price); 
                            allSalesCost+= checkForNumber(item.price);
                        }
                  })

            data[i].buyCost = buyFigure;
            data[i].sellCost = sellFigure;
            data[i].tintColor = data[i].hex;

            obj.buyCost = data[i].buyCost;
            obj.sellCost = data[i].sellCost;


            r.children.push(obj);
            r.sellCost = allSalesCost;
            r.buyCost = allBuysCost;
            r.size = allBuysCost+allSalesCost;
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

  return v.toLowerCase();;

}


function setTreeMapDetails(d){
  var a = filterArrayPrem (allTransfersArr, "to"); 
  var a2 = filterArrayPrem (allTransfersArr, "from");
  var c = "buy-list-item";  
  var c2 = "sell-list-item"; 

  a = _.uniq(a, function(item, key, name) { return item.playername; });
  a2 = _.uniq(a2, function(item, key, name) { return item.playername; });

  if (d.name!= rootTitle) { 
    a = filterArray(a,"to",d.name); 
    c+=" highlight-cell"; 
    a2 = filterArray(a2,"from",d.name); 
    c2+=" highlight-cell";

}
  setDetailHead(d); 
  setTreeMapDetailSell(a2, c2, d.name);
  setTreeMapDetailBuy(a,c, d.name);
  
}

function setTreeMapDetailBuy(a,c,nameIn){

  var clubVar = "null";

  var htmlStr = "  ";
          _.each(a, function(item,i){
            var spanClass = "buy-list-item";

            if (item.buyClub != clubVar && i != 0){ htmlStr+="<br/>" };
            if (item.buyClub != clubVar && nameIn == rootTitle){ htmlStr+="<span class='"+c+"'><b>"+item.buyClub+"</b></span><br/> "; clubVar=item.buyClub; } 

              htmlStr+="<span  id='sellList_"+i+"' class='"+c+"' data-club='"+item.buyClub+"'>"+item.playername+", ";
              htmlStr+=setFeeForDetail(item.displayFee)+" ";
              // htmlStr+=getPostionString(item.position);
              htmlStr+=" from "+item.sellClub;
              // htmlStr+="; ";
              
              htmlStr+="</span>";

              if(nameIn==rootTitle){htmlStr+="<br/>";}

          })
    htmlStr += "</p>";
    document.getElementById("playersInHead").style.display = "block";
    if (a.length == 0){ htmlStr = " "; document.getElementById("playersInHead").style.display = "none";};
    document.getElementById("treeMapDetailBuy").innerHTML = htmlStr;
}

function setTreeMapDetailSell(a,c,nameIn){
  var clubVar = "null";
  var htmlStr = "  ";
          _.each(a, function(item,i){

            var spanClass = "sell-list-item";

            if (item.sellClub != clubVar && i != 0){ htmlStr+="<br/>" };
            if (item.sellClub != clubVar  && nameIn == rootTitle){ htmlStr+="<span class='"+c+"'><b>"+item.sellClub+"</b></span><br/> "; clubVar=item.sellClub; } 

              htmlStr+="<span  id='sellList_"+i+"' class='"+c+"' data-club='"+item.sellClub+"'>"+item.playername+", ";
              htmlStr+=setFeeForDetail(item.displayFee)+" ";
              // htmlStr+=getPostionString(item.position);
              htmlStr+=" to "+item.buyClub;
              // htmlStr+="; ";
              
              htmlStr+="</span>";

              if(nameIn==rootTitle){htmlStr+="<br/>";}

          })
    htmlStr += "</p>";
    document.getElementById("playersOutHead").style.display = "block";
    if (a.length == 0){ htmlStr = " "; document.getElementById("playersOutHead").style.display = "none";}
    document.getElementById("treeMapDetailSell").innerHTML = htmlStr;
}


function setDetailHead(d){

      if(document.getElementById("grandParentButton")){
        document.getElementById("instructionTextLabel").style.display = "inline-block";
        document.getElementById("grandParentButton").style.display = "none";
          if (d.name!=rootTitle){ 
              document.getElementById("grandParentButton").style.display = "inline-block";
              document.getElementById("instructionTextLabel").style.display = "none"; 
          }

            var  n = checkForNumber(d.sellCost-d.buyCost)
                document.getElementById("detailClubname").innerHTML = d.name;
                document.getElementById("detailBalance").innerHTML = getBalanceStr(myRound(n));
                document.getElementById("detailSpending").innerHTML = "£"+myRound(d.buyCost)+"m";
                document.getElementById("detailSales").innerHTML = "£"+myRound(d.sellCost)+"m"; 
      }
}




function getBalanceStr(n){
  var strOut = "+£"+n+"m";;

    if (n < 0){
      strOut = "-£"+(n*-1)+"m";
    }

    if (n == 0){
      strOut = "£"+(n*-1)+"m";
    }

    return strOut;

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
       
  window.addEventListener("resize", checkWin);
 
  document.getElementById("filterDropdown").addEventListener('change', filterChanged);

}






function checkWinSize(){

   var w =  document.getElementById("treemapFlex").offsetWidth;
   var h =  document.getElementById("treemapFlex").offsetHeight;


    // var barChart = document.getElementById("barChart");
    // var width = barChart.offsetWidth;

    updateTreeLayout(w,h)

    // var wideNumIn = w;

    // w = $("#treemap-container").outerWidth();
    // if(wideNumIn <= 899){
    //   h = (w/6)*18;
    // }
    // if(wideNumIn > 899)

    // {
    //   h = (w/10)*6;
    // }



    //$('#treemap-view').empty();
    //.css({height: "auto"});

    //console.log(dataJSON)

    //buildTreeMap(rootJSON);

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
    htmlStr+= '<div class="gv-halo-column" style="vertical-align: text-top;">'
    htmlStr+= '<p style="margin-top:0px;"><strong>'+item.nameofplayer+', '+setFeeForDetail(item.dataObj.displayFee)+'</strong></p>'
     htmlStr+= '<p>To '+item.dataObj.buyClub+'<br/>from '+item.dataObj.sellClub+'</p>'
    htmlStr+= '<div class="gv-halo-image-holder" style="background: url('+item.imageurl+'/500.jpg)">'
    htmlStr+= '</div>'  
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
  
      var tempArr = [];

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

function getTreeMapH(w){
  var h = 360;
  if(w > mobileWin){
    h = w * 0.48
  }
  return h;   
}


function addD3Tree(dataJSON){

  //setBarChartVals(dataJSON);

      document.getElementById("treemapFlex").innerHTML = "";
          
                      var margin = {top: 36, right: 0, bottom: 0, left: 0},
                          width = d3.select("#treemapFlex").node().getBoundingClientRect().width,
                          height = getTreeMapH(width),
                          formatNumber = d3.format(",d"),
                          transitioning;

                      var x = d3.scale.linear()
                          .domain([0, width])
                          .range([0, width]);

                      var y = d3.scale.linear()
                          .domain([0, height])
                          .range([0, height]);

                      var svg = d3.select("#treemapFlex").append("svg")
                          .attr("width", width + margin.left + margin.right)
                          .attr("height", height + margin.bottom + margin.top)
                          .style("margin-left", -margin.left + "px")
                          .style("margin.right", -margin.right + "px")
                        .append("g")
                          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                          .style("shape-rendering", "crispEdges");

                      treemap = d3.layout.treemap() 
                          .ratio(1)
                          .sticky(false)
                          .mode("squarify")
                          .round(false)
                          .sort(function(a, b) { return a.value - b.value; })
                          .children(function(d, depth) { return depth ? null : d._children; })

                      var grandparent = svg.append("g")
                          .attr("class", "grandparent");

                      grandparent.append("rect")
                          .attr("y", 0-margin.top)
                          .attr("width", width)
                          .attr("height", margin.top)

                    var grandParentButtonGroup = grandparent.append("g")    
                          .attr("id","grandParentButton")
                          .style("display","none")
                          .attr("x", 0)
                          .attr("y",-36)  

                       grandParentButtonGroup.append("rect")
                          .attr("x", 0)
                          .attr("y", -36) 
                          .attr("width", "120px")
                          .attr("height", "24px")
                          .attr("class","back-button")
                          .attr("rx", "12px")
                          .attr("ry", "12px");   

                      grandParentButtonGroup.append("text")
                          .attr("x", 24)
                          .attr("y", -30)
                          .attr("id","grandParentButtonLabel")
                          .text("show all")
                          .attr("class", "cellLabel")
                          .attr("dy", ".75em");  

                      var instructionTextGroup = grandparent.append("g")  
                          .attr("id","instructionText")
                          .style("display","block")
                          .attr("x", 0)
                          .attr("y",-36) 

                      instructionTextGroup.append("text")
                          .attr("x", 0)
                          .attr("y", -30)
                          .attr("id","instructionTextLabel")
                          .text("click on a club to see all their signings")
                          .attr("class", "treemapText")
                          .attr("dy", ".75em");   
  



                          // var g1 = svg.insert("g", ".grandparent")
                          // <svg width="24px" height="22px" viewBox="0 0 24 22" id="svgArrow"><path fill="#CC0000" d="M0.62,10.49l1.44-1.44l9-8.989l0.97,0.969L4.521,10h19.12v2 l-19.12-0.001l7.51,8.971l-0.97,0.97l-9-9l-1.44-1.431V10.49"/></svg>    

                      d3.xml("../assets/imgs/arrow-left.svg", "image/svg+xml", function(error, xml) {
                              if (error) throw error;
                              var importedNode = document.importNode(xml.documentElement, true);
                              console.log(importedNode)
                              document.getElementById("grandParentButton").appendChild(importedNode);
                              
                      });    

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
                          
                          grandparent
                              .datum(d.parent)
                              .on("click", transition)

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
                              .style("fill", function(d){return d.tintColor})
                              .style("stroke-width","1px")
                              .style("stroke", function(d){return d.tintColor})
                              
                              .call(rect);

                          g.append("rect")
                              .style("fill", function(d){return d.tintColor})
                              .attr("class", function(d) { return "parent "+(d.buySell); })
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
                              .text(function(d) { var t =  myRound(d.buyCost); if(t==0){ t=" "}; return t;})
                              .attr("class", "cellLabelFee")
                              .call(text);


                          function displayFeeCheck(n){
                            var t = n;
                                if(t<0.5){ t = " "}
                            return t;
                          }

                          function transition(d) {
                            //updateBarChart(d)
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
                            
                            setTreeMapDetails(d);
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


function updateTreeLayout(w,h) 
{ 
      rootJSON = buildTreeJson(playerCountArray);

      console.log(rootJSON)
      
      //console.log(w)
      //w > 741 ? buildTreeMap(rootJSON) : mobileTreeMap(rootJSON, w, h);

      buildTreeMap(rootJSON)
      setTreeMapDetails(rootJSON);

}

var barMax;

function setBarChartVals(d){
 
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



///////////////////////////////////////////////////////START MOBILE TREEMAP ///////////////////////////////////////////////

function checkWin(){
    setTimeout(checkTreemapSize, 1000);
}



function checkTreemapSize(){

    var el = document.getElementById("treemapFlex");
    var windowW = el.offsetWidth;
    
    if(windowW <= 899){
      rootJSON = buildTreeJsonMobile(playerCountArray);
      document.getElementById("treemapFlex").innerHTML = " ";
      buildTreeMapMobile(rootJSON);
    }
    if(windowW > 899)
    {
      rootJSON = buildTreeJson(playerCountArray);
      document.getElementById("treemapFlex").innerHTML = " ";  
      buildTreeMap(rootJSON);
      
    }
}

function buildTreeJsonMobile(data) {

    var root = {}, i, val, obj, othersObj;

    root.name = rootTitle;

    root.children = [];

    var rootBuyCost = 0;

    var rootSellCost = 0;

        for ( i = 0; i < data.length; i++) { 
          var tempBuy = 0
          var tempArr = [];

                  obj = {};
                  obj.index = i;
                  obj.name = data[i]["name"];
                  obj.size = data[i]["totalCost"] + 100000;
                  obj.value = data[i]["totalCost"];

                  
                  obj.totalCost = (data[i]["totalCost"]);
                  obj.treeMapArea = (data[i]["totalCost"]);
                  obj.name = data[i]["name"];
                  
                 
                  _.each(dataset, function(item){

                        var tempObj = {}
                        if (data[i].name == item.to){
                            obj.tintColor = item.hex;
                            tempObj.size = checkForNumber(item.price) +1000000;
                            tempObj.dataObj = item;
                            tempArr.push(tempObj);
                            tempBuy+=checkForNumber(item.price)
                            rootBuyCost+=checkForNumber(item.price);
                        }
                        obj.buyCost = tempBuy; 


                  })

                   
                  var tempSell = 0
                   _.each(dataset, function(item){
                        if (data[i].name == item.from){
                            tempSell+=checkForNumber(item.price)
                            rootSellCost+=checkForNumber(item.price);
                        }
                      obj.sellCost = tempSell;  
                      
                  })

                  //d.sellCost-d.buyCost
                  
                  obj._children = tempArr; 



                  var uniqueList = removeDuplicates(obj._children)

                  obj._children = uniqueList;

            root.buyCost = rootBuyCost;
            root.sellCost = rootSellCost;
            
            root.children.push(obj);          

        }

return root;
}
  

function removeDuplicates(a){
  var result = [];
    a.forEach(function(item) {
         if(result.indexOf(item) < 0) {
             result.push(item);
         }
    });
return result;

}

var borderWidth = 0.5;

function buildTreeMapMobile(dataIn){

    var tempArr = [];
    var tempCount = 0;
    _.each(dataIn.children, function(obj,i){
            obj.treeMapArea < 12000000 ? obj.treeMapArea = 12000000 : obj.treeMapArea = (obj.treeMapArea+12000000);
            if (obj._children.length >0 ){ obj.layoutNum = i;  tempArr.push(obj); tempCount ++;}
        });

    _.sortBy(tempArr, function(num){ return num.size; }); 

     dataIn.children = tempArr;    
    var unitH = 24; 
    var el = document.getElementById("treemapFlex");  
    var wid = el.offsetWidth; 
    var hei = dataIn.children.length*unitH;
    var div;

    

   // console.log(el)
    var htmlStr = addTreeDiv(dataIn.children, hei, unitH);
    //console.log(htmlStr)
    el.innerHTML = htmlStr;

   
      _.each((document.getElementsByClassName("treemap-mobile-div")), function(item){ 
              

              var num = item.id.split("-");
              num = num[1];
              var v = num.split("_");
              v = v.join(" ")
            
              var currClip = document.getElementById(item.id);
              
              currClip.addEventListener("click", function(){ setTreeMapDetailsMobile(v, currClip); });
      })
    


      var initObj = getInitObjMobile();

    setDetailHeadFromMobile(initObj);
}


function addTreeDiv(a, h=480, sliceH){

  var htmlStr = "<div class='gv-holder-div' style='height:"+480+"px'>";

        _.each(a, function(d, i){
            var idStr = d.name.split(" ");
            idStr=idStr.join("_");
            htmlStr+= "<div class='treemap-mobile-div' style='background-color:"+d.tintColor+"; height:"+sliceH+"px' data-club='"+d.name+"'  id='treeDiv-"+idStr+"'>";
            htmlStr+= "<div class='cell-mobile-label'>"+d.name+"</div>";
            htmlStr+="</div>"; 

        })
        htmlStr +="</div>" 
     

        return htmlStr;
}

function getInitObjMobile()
{
    var obj  = {};
    var n = 0;
    var n2 = 0;
    var a = filterArrayPrem (allTransfersArr, "to"); 
    var a2 = filterArrayPrem (allTransfersArr, "from");
    obj.name = rootTitle;

    a = _.uniq(a, function(item, key, name) { return item.playername; });
    a2= _.uniq(a2, function(item, key, name) { return item.playername; });

    _.each(a, function(item){
                item.buyCost = checkForNumber(item.price)  
                n+=item.buyCost;
          })

    _.each(a2, function(item){
                item.sellCost = checkForNumber(item.price)  
                n2+=item.sellCost;
          })

      obj.buyCost = n;
      obj.sellCost = n2;

      return(obj)


}


function setTreeMapDetailsMobile(v,currClip){
  var slices = document.getElementsByClassName("treemap-mobile-div");
  
  _.each(slices, function(item){
      item.id == currClip.id ? item.style.opacity = 1 : item.style.opacity = 0.4; 

  })
 
  var a = filterArrayPrem (allTransfersArr, "to"); 
  var a2 = filterArrayPrem (allTransfersArr, "from");

  var c = "buy-list-item";  
  var c2 = "sell-list-item"; 

  var n = 0;
  var n2 = 0;

  // var tempObj = {};
  // var tempObj2 = {};
  var obj = {};

  _.each(dataset, function(item){
        if (item.to == v){
            item.buyCost = checkForNumber(item.price)
            item.buySell = "buy";
            a.push (item)
            n+=item.buyCost

        }
  })

  _.each(dataset, function(item){
        if (item.from == v){
                  item.sellCost = checkForNumber(item.price)  
                  item.buySell = "sell";          
                  a2.push (item)
                  
              }
        })

  

  a = _.uniq(a, function(item, key, name) { return item.playername; });
  a2= _.uniq(a2, function(item, key, name) { return item.playername; });




var t = 0;
  _.each(a, function(item){
    

      if(item.to == v){
        t+=checkForNumber(item.price);
      }

    n=t;

    console.log(n)
     
  })
var t2 = 0;
  _.each(a2, function(item){
    
     if(item.from == v){
        t2 += checkForNumber(item.price);
      }

      n2=t2;

  })
  

console.log(n,n2)

  obj.buyCost = n;
  obj.sellCost = n2;
  obj.name = v;
 


  setDetailHeadFromMobile(obj);
  setDetailMobileSell(a2,c2,v);
  setDetailMobileBuy(a,c,v);
}


function setDetailHeadFromMobile(d){

    console.log(d)

    var  n = checkForNumber(d.sellCost-d.buyCost)
                document.getElementById("detailClubname").innerHTML = d.name;
                document.getElementById("detailBalance").innerHTML = getBalanceStr(myRound(n));
                document.getElementById("detailSpending").innerHTML = "£"+myRound(d.buyCost)+"m";
                document.getElementById("detailSales").innerHTML = "£"+myRound(d.sellCost)+"m"; 
}



function setDetailMobileBuy(a,c,v){

  var htmlStr = "  ";
          _.each(a, function(item,i){

            var spanClass = "buy-list-item";
              
              if(item.to == v)  
              {
                console.log(item)
                htmlStr+="<span id='sellList_"+i+"' class='"+c+"' data-club='"+item.buyClub+"'>"+item.playername+", ";
                htmlStr+=setFeeForDetail(item.displayFee)+" ";
                htmlStr+=" from "+item.sellClub;
                htmlStr+="</span><br/>";
              }          

              
          })    
    document.getElementById("playersInHead").style.display = "block";
    if (a.length == 0){ htmlStr = " "; document.getElementById("playersInHead").style.display = "none";};
    document.getElementById("treeMapDetailBuy").innerHTML = htmlStr;
}




function setDetailMobileBuyAllTeams(a,c,v){
  var htmlStr = "  ";
          _.each(a, function(item,i){
            var spanClass = "buy-list-item";

              htmlStr+="<span id='sellList_"+i+"' class='"+c+"' data-club='"+item.buyClub+"'>"+item.playername+", ";
              htmlStr+=setFeeForDetail(item.displayFee)+" ";
              // htmlStr+=getPostionString(item.position);
              htmlStr+=" from "+item.sellClub;
              // htmlStr+="; ";
  
              htmlStr+="</span><br/>";
          })
    document.getElementById("playersInHead").style.display = "block";
    if (a.length == 0){ htmlStr = " "; document.getElementById("playersInHead").style.display = "none";};
    document.getElementById("treeMapDetailBuy").innerHTML = htmlStr;
}


function setDetailMobileSell(a,c,v){

  var htmlStr = "  ";
          _.each(a, function(item,i){

            var spanClass = "sell-list-item";
              
              if(item.from == v)  
              {
                console.log(item)
                htmlStr+="<span id='sellList_"+i+"' class='"+c+"' data-club='"+item.sellClub+"'>"+item.playername+", ";
                htmlStr+=setFeeForDetail(item.displayFee)+" ";
                htmlStr+=" to "+item.buyClub;
                htmlStr+="</span><br/>";
              }   

          })

    document.getElementById("playersOutHead").style.display = "block";
    if (a.length == 0){ htmlStr = " "; document.getElementById("playersOutHead").style.display = "none";}
    document.getElementById("treeMapDetailSell").innerHTML = htmlStr;
}
     



/////////////////////////////////////////END MOBILE TREEMAP////////////////////////////////////////




