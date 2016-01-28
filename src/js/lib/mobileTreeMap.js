var prevCellDetailH;
var prevTreeCellH;
var prevDetailH;
var treemapFlex;
var treeMapInitH;
import underscore from 'underscore'

var _ = underscore;

export default function mobileTreeMap(dataIn,w,h) {


      var htmlStr = "";

    _.each(dataIn.children, function(obj){
            obj.treeMapArea < 2800000 ? obj.treeMapArea = 3000000 : obj.treeMapArea = (obj.treeMapArea+2800000);

            //obj.treeMapArea += 60000000;
        });


     _.sortBy(dataIn.children, function(num){ return dataIn.children.value; });      
        //positionDetailView();
             var treemap = d3.layout.treemap()
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


            var  div = d3.select("#treemap-view").append("div")

                .style("position", "relative")
                .style("width", w + "px")
                .style("height", h+"px")
                .style("opacity",1);

                //div.transition().style("height", h+"px").duration(500);
          
             var root = dataIn;
             var node = root = dataIn;
             var cell;
             var nodes = treemap.nodes(root).filter(function(d) { return !d.children; });

                  div.data([root]).selectAll("div").data(treemap.nodes).enter().append("div").attr("class", function(d) {

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
                return "<div class='cellCutBlock'></div><div class='cell-info'><span class='cellLabel'> + cellStr + </span><br /><span class='cellValue'></span></div>";})
                //return d.children ? color(d.name) : null;
              

              .call(cell).on("click", function(d) {  
                zoomToDetailView(d, this); 
                gotoPosition = $(this).offset().top;
                iframeMessenger.getPositionInformation(scrollPage);
              });
              
              div.selectAll(".cell").data(treemap.value(function(d) {  return d.treeMapArea; })).call(cell);
                
          $(".cellCutBlock").hide();


}


function filterTreeMap(varIn){
//console.log (dataset);

  globalSortVar=varIn;

    //$("#detail-view").hide();  

     var playerCount = getCountByProperty(dataset, varIn);
        
           playerCountArray = _.map(playerCount, function(val, key, list) {
                var num = _.reduce(val, function(memo, player) {
                  var cost = (isNaN(parseInt(player.price))) ? 0 : parseInt(player.price);

                  console.log(memo);

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


           
        rootJSON = buildMobileTreeJson(playerCountArray);
        $('#treemap-view').empty();
        buildTreeMap(rootJSON);

        checkWinSize(winW);
}





