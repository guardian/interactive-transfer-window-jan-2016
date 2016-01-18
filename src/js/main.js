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
var transfersArr, myCutsIndex, treeJson, playerCountArray, rootJSON, parseData, dataset, starData, leaguesArray, nationalitiesArray;
var myView = false;

var globalW = 960;
var maxH = 600, borderWidth = 1;;

var datasetAllTransfers = null;

var globalSortVar = "to";

var winW = window.innerWidth;

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
    datasetAllTransfers = r.sheets.Data;

    //parseData = buildTreeJson(datasetAllTransfers);

    modelDataClubArrays(r)

    addListeners();

}



function modelDataClubArrays(data){
 
        var tempArr = []; 
        var tempArrTwo = [];
        var tempArrThree = [];
       


        // Store in global var
        dataset = data.sheets.Data;
        starData = data.sheets.Star_Men;

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
      
      addListeners();

      filterTreeMap(globalSortVar);
}

function getUniqueObjects(strIn){

  var tempArr = [];

       var leaguesArrayTemp = _.countBy(dataset, function(obj){
              
                  var newObj = {};
                  newObj[strIn] = obj[strIn];
                  newObj["price"] = getVal(obj.price);
                  tempArr.push(newObj);  

                  
        });

   return tempArr;
}


function getCountE(valToCheck,checkStr){

      var valueOut = 0;
     // console.log(nationalitiesArray)

      

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

                          tempNum = tempNum + getVal(two.price);
                          newObj[sortStr]= two[sortStr];
                          newObj["price"] = tempNum;

                          //console.log("MATCH "+tempNum)
                        }   
                   
                              
                  });

                  tempArr.push (newObj);
              }); 

         return tempArr;

}


function getAgeGroup(objIn){

      var ageGroup;

      var ageIn = parseInt(objIn.Age);

         if (ageIn < 20){
            ageGroup = "Under 20 years old"
         }

         else if(ageIn >= 20 && ageIn <= 25){
            ageGroup = "20-25 years old"
         }
          
         else if(ageIn >= 26 && ageIn <= 30){
            ageGroup = "25-30 years old"
         } 

         if (ageIn > 30){
            ageGroup = "Over 30 years old"
         }

      return ageGroup;

}

function checkForZeroValues(checkStr){

      var valueOut;
     // console.log(nationalitiesArray)

      for(var i=0; i < leaguesArray.length; i++){
          if (checkStr == leaguesArray[i]["previousleague"]){
                  leaguesArray[i]["price"] == 0 ? valueOut = "Other leagues" : valueOut = checkStr;
                  return valueOut;
          }
      }

    

     

}


function checkForZeroValuesTwo(checkStr){

      var valueOut;
     // console.log(nationalitiesArray)

      

      for(var k=0; k < nationalitiesArray.length; k++){
          if (checkStr == nationalitiesArray[k].nationality){
                  
                  nationalitiesArray[k]["price"] == 0 ? valueOut = "Other nationalities" : valueOut = checkStr;
                 // console.log ("MATCHED NATION "+checkStr +"  returning "+valueOut+"   "+nationalitiesArray[k]["price"]);
                  return valueOut;
          }
      }

     

}

///END DATA MODEL


function buildTreeJson(a) {
        
        var root = {}, i, val, totalVal = 0;

        root.name = globalSortVar;
        root.children = [];

        _.each(a, function(item,i){
         
            val = getVal(item.Price);
            val = Number(val);
            val = val + 1000000;
            item.mySize = val;
            item.index = i;
            item.children = null;

            root.children.push(item);
            totalVal += val;
        })        
        
        root.size = totalVal;
        console.log(root)
        return root;
        
}

function buildTreeMap(dataIn){

    console.log(dataIn)

    var htmlStr = "";

    _.each(dataIn.children, function(obj){
            obj.treeMapArea < 2800000 ? obj.treeMapArea = 3000000 : obj.treeMapArea = (obj.treeMapArea+2800000);

            //obj.treeMapArea += 60000000;
        });

    var w = 960;
    var h= 600;
    var div, treeMap, root, node, nodes, cell;


     _.sortBy(dataIn.children, function(num){ return dataIn.children.value; });      
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
                            console.log(d)
                            if(d.depth > 1 || d.depth == 0) {
                                return "cell hide";
                                
                            } else {
                                return "cell show";
                            }
                  })

              .attr("id", function(d) { return "cell_" + d.index; })
              .style("background", function(d) { console.log(d); return d.tintColor; })

              .html(function(d) {


                if(d.name=="Other leagues" || d.name=="Other countries"){
                  var cellStr = getPostionStringTreemap(d.name);

                }else{
                  var cellStr = getPostionStringTreemap(d.name)+":  "+myRound(d.totalCost, 3)+"m";
                }

                console.log(cellStr)
                return "<div class='cellCutBlock'></div><div class='cell-info'><span class='cellLabel'>" + cellStr + "</span><br /><span class='cellValue'></span></div>";
                })//return d.children ? color(d.name) : null;
              

              .call(cell).on("click", function(d) {  
                zoomToDetailView(d, this); 
                //gotoPosition = $(this).offset().top;
                iframeMessenger.getPositionInformation(scrollPage);
              });
              
              div.selectAll(".cell").data(treeMap.value(function(d) {  return d.treeMapArea; })).call(cell);
                
        //  $(".cellCutBlock").hide();

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


function position() {
  this.style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}



function filterArr(str){

    var a = getCountByProperty(datasetAllTransfers, str);

    a = buildTreeJson(a)

    console.log(a)

    buildTreeMap(a)
}



function addListeners(){
    document.getElementById("filterDropdown").addEventListener("change", updateFromFilter);
}

function updateFromFilter(){
    var x = document.getElementById("filterDropdown").value;
    filterTreeMap(x);
}

function getCountByProperty(dataset, property) {
    var totalPrice, totalSize = 0;

     var a = _.groupBy(dataset, function(player) {
        return player[property];
    });


     var a2 = _.each(a, function(item){
                    var tempCost = 0;
                        _.each(item, function(obj){
                            
                            tempCost+=(getVal(obj["Price"]))

                        })  
                        item.Price = tempCost;
                        item.size = tempCost;
        })
     
     return a2;
}


function getVal(n){
    var checkNum = (isNaN(n))
        if (checkNum){
            n = 0;
        } 

    n = Number(n);       
    return n;
}


function filterTreeMap(varIn){

  globalSortVar=varIn;

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


           
        rootJSON = buildTreeJson(playerCountArray);
        
        buildTreeMap(rootJSON);

        checkWinSize(winW);
}



function checkWinSize(wideNumIn){

    var wideNumIn = w;
    var w = document.getElementById("treemapContainer").offsetWidth;
    
    if(wideNumIn <= 899){
      h = (w/6)*12;
    }
    if(wideNumIn > 899)

    {
      h = (w/10)*6;
    }



    rootJSON = buildTreeJson(playerCountArray);
    document.getElementById("treemapView").innerHTML = "<div></div>";
    
    buildTreeMap(rootJSON);

    

}




// $(window).resize(function() {
    
//   setTimeout(checkWinSize, 1000)

// });




