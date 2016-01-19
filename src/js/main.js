import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'
import mainHTML from './text/main.html!text'
import treemapHTML from './text/treemap.html!text'
import share from './lib/share'

import underscore from 'underscore'
import d3 from 'd3';

var _ = underscore;

var totalSpend;

var shareFn = share('Guardian football transfer window', 'http://gu.com/p/URL', '#Interactive');
var premClubsArr = [];
var colorsArr = [];
var transfersArr, myCutsIndex, treeJson, playerCountArray, rootJSON, parseData, dataset, starData, leaguesArray, nationalitiesArray, sellArr, gotoPosition;
var myView = false;

var globalW = 960;
var maxH = 600, borderWidth = 1;;

var datasetAllTransfers = null;

var globalSortVar = "to";



var winW;

var premClubs=['Arsenal','Aston Villa','Burnley','Chelsea','Crystal Palace','Everton','Hull City','Leicester City','Liverpool','Manchester City','Manchester United','Newcastle United','QPR','Stoke City','Southampton','Sunderland','Swansea City','Tottenham Hotspur','West Bromwich Albion','West Ham United'];



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

        var tempArr = []; 
        var tempArrTwo = [];
        var tempArrThree = [];

        // Store in global var
        dataset = r.sheets.Data;
        starData = r.sheets.Star_Men;

        var topBuyArr = filterArray(starData,"topbuy","y");

        sellArr = filterArray(dataset,"previousleague","Premier League (England)");

         _.each(premClubs, function(one){
              _.each(dataset, function(two){
                  if(one === two.to){
                      one = two.to;  
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

      buildTopBuyView(topBuyArr);

      filterTreeMap(globalSortVar);

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
                                  size: val.length
                              
                              };
                }else{
                      return {
                                name: key,
                                totalCost: num,
                                size: val.length
                              };


                }
                

            });

           _.each(rootJSON, function(item){
            console.log(item)
           })
           
        rootJSON = buildTreeJson(playerCountArray);
        document.getElementById('treemapView').innerHTML = "";
        buildTreeMap(rootJSON);
        //console.log(rootJSON)
        //checkWinSize(winW);
}


function buildTreeMap(dataIn){
    
    
    
    var w = 740, h = 600, treeMap, div, root, node, nodes;

    var htmlStr = "";

    

    _.each(dataIn.children, function(obj){
            obj.treeMapArea < 2800000 ? obj.treeMapArea = 3000000 : obj.treeMapArea = (obj.treeMapArea+2800000);
        });

     _.sortBy(dataIn.children, function(num, i){ return dataIn.children[i].value; });      
        //positionDetailView();
              treeMap = d3.layout.treemap()
                .size([w, h])
                .sticky(false)
                .ratio('3')
                .mode("dice")

                .sort(function comparator(a, b) {
                    if(a.name == "Other leagues"){
                      a.totalCost = 0
                    }

                    if(a.name == "Other countries"){
                      a.totalCost = 0
                    }

                  return a.totalCost - b.totalCost;
                })

                .round(true)
                .value(function(d) { return d.size });


              div = d3.select("#treemapView").append("div")
                .style("position", "relative")
                .style("width", w + "px")
                .style("height", h+"px")
                .style("opacity",1);

                //div.transition().style("height", h+"px").duration(500);
          
                root = dataIn;
                node = root = dataIn;
                nodes = treeMap.nodes(root)


                
            .filter(function(d) { return !d.children; });

                  div.data([root]).selectAll("div").data(treeMap.nodes).enter().append("div").attr("class", function(d) {
                          
                            if(d.depth > 1 || d.depth == 0) {
                                 return "cell hide";
                                
                            } else {
                                return "cell show";
                            }
                  })

              .attr("id", function(d) { return "cell_" + d.index; })
              .style("background", function(d) { return d.tintColor; })

              .html(function(d) {
                if(d.name=="Other leagues" || d.name=="Other countries"){
                  var cellStr = getPostionStringTreemap(d.name);

                }else{
                  var cellStr = getPostionStringTreemap(d.name)+":  "+myRound(d.totalCost, 3)+"m";
                }
                return "<div class='cellCutBlock' id='cellCutBlock'></div><div class='cell-info'><span class='cellLabel'>" + cellStr + "</span><br /><span class='cellValue'></span></div>";
                })//return d.children ? color(d.name) : null;
              

              .call(cell).on("click", function(d) { 
                var coOrds = getPosition(this)
                zoomToDetailView(d, this); 
                gotoPosition = coOrds.y;
                iframeMessenger.getPositionInformation(scrollPage);
              });
              
              div.selectAll(".cell").data(treeMap.value(function(d) {  return d.treeMapArea; })).call(cell);
                
          //document.getElementById("cellCutBlock").style.display = 'none';

}

function buildTreeJson(data) {
    var root = {}, i, val, obj, othersObj;
    root.name = "Root";
    root.children = [];

        for ( i = 0; i < data.length; i++) {

            //val = data[i].value;
            
              //if(data[i]["totalCost"] > 0) {
                  obj = {};
                  obj.index = i;
                  obj.name = data[i]["name"];
                  obj.size = data[i]["totalCost"] + 100000;
                  obj.value = data[i]["totalCost"];
                  obj.sellValue = getSellVal(obj);
                  
                  obj.totalCost = (data[i]["totalCost"]);
                  obj.treeMapArea = (data[i]["totalCost"]);
                  obj.name = data[i]["name"];
                  obj.tintColor = "#197caa";
                  obj.children = null;
            //}

            root.children.push(obj);

        }
   
    return root;
}


function getSellVal(obj){

  var n = 0;

  _.each(sellArr, function (item,i){
      if(item.from == obj.name){
        
        var t= checkForNumber(item.price);
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
                
                console.log(interactiveContainer.offsetWidth);
            });
        }
        else if(window.addEventListener) {
            window.addEventListener('resize', function() {
                
                console.log(interactiveContainer.offsetWidth);
            }, true);
        }
        else {
            //The browser does not support Javascript event binding
        }

  document.getElementById("filterDropdown").addEventListener('change', filterChanged);
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


function zoomToDetailView(d, currClip) { 
  
  document.getElementById("detailView").style.display="block";

  console.log(d, currClip)


 
  // var offset = $(currClip).offset();
  // globalOffsetClip = $(currClip); 
  // var newTop = (offset.top + $(currClip).height());
  // var newLeft = offset.left;
  var newArr = getDetailArray(d.name, globalSortVar);

  setDetailView(newArr, globalSortVar, d);



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

function setDetailView(arrIn,strIn,d){
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


       //$("#center-panel").html(htmlStrC);
        document.getElementById("centerPanel").innerHTML = htmlStrR;

        if(arrIn[0][strIn]=="Other leagues" || arrIn[0][strIn]=="Other countries"){
          document.getElementById("leftPanel").innerHTML = " ";
        }else{
           document.getElementById("leftPanel").innerHTML = "<div class='large-number-left'>"+myRound(totalFees, 2 )+"<span class='large-number-left-M'>m</span></div><div class='number-caption'>"+spendStr+"</div>";
        }
        
        

        //<div class='number-caption'>PLAYERS SOLD</div><div class='large-number-left'>"+myRound(totalFees, 2 )+"m</div>
        //var position = $("#treemap-view").position();

        //$('#back-to-top').on('click', function(){ gotoPosition=0; iframeMessenger.getPositionInformation(scrollPage) });

}





