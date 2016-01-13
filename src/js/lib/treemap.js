

export default function treemap() {
    function buildTreeJson() {

        var root = {}, i, val, totalVal = 0;

        root.name = "Transfer window spending";

        root.children = [];

        
        _.each(datasetTransfers, function(item, i){
            console.log(item)
        })



        for( i = 0; i < datasetTransfers.length; i++) {
            val = Number(datasetTransfers[i]["Budget 09-10"]);
            datasetDepts[i].size = val;
            datasetDepts[i].mySize = val;
            datasetDepts[i].index = i;
            datasetDepts[i].name = datasetDepts[i]["Title"]
            datasetDepts[i].children = null;
            datasetDepts[i].percentCut = 0;
            root.children.push(datasetDepts[i]);
            totalVal += val;
        }
        
        
        val = 200;
        datasetDepts.push({})
            datasetDepts[i].size = val;
            datasetDepts[i].mySize = val;
            datasetDepts[i].index = i;
            datasetDepts[i].name = "My cuts";
            datasetDepts[i].children = null;
            datasetDepts[i].percentCut = 0;
            root.children.push(datasetDepts[i]);
            totalVal += val;
            colors[i] = "#333333";
        root.size = totalVal;
        
        myCutsIndex = i;
        
        //console.log(datasetDepts[myCutsIndex].name);
        
        return root;
        
    }

function buildTreeMap() {
    console.log("treemap")
    // var w = globalW;
    // var h = maxH;

    //     var treemap = d3.layout.treemap().size([w, h]).sticky(true).value(function(d) {
    //         if (myView) {
    //         return d.mySize;
    //         } else {
    //         return d.size;
    //         }
    //     });

    //     treemap.sort(comparator);
        
    //     console.log(datasetTransfers[myCutsIndex].name);
        

    //     function comparator(a, b) {
    //         return a.value - b.value;
    //     }

    //     div = d3.select("#treemap-view").append("div").style("position", "relative").style("width", w + "px").style("height", h + "px");
        
        
        
        
    //     var root = treeJson;

    //     div.data([root]).selectAll("div").data(treemap.nodes).enter().append("div").attr("class", function(d) {
    //         if(d.depth > 1 || d.depth == 0) {

    //             return "cell hide";
    //         } else {
    //             return "cell show";
    //         }
    //     }).attr("id", function(d) {

    //         return "cell_" + d.index;

    //     }).style("background", function(d) {
    //         //console.log(colors[d.index])
    //         return colors[d.index] ? colors[d.index] : "#a9a9a9";
    //     }).html(function(d) {

    //         return "<div class='cellCutBlock'></div><div class='cell-info'><span class='cellValue'>" + d.value + "bn</span><br /><span class='cellLabel'>" + d.name + "</span></div>";

    //     })//return d.children ? color(d.name) : null;
    //     .call(cell).on("click", function(d) {
    //         currentDepartment = d.index;
    //         zoomToDepartment(d);
    //     });
        
    //     datasetTransfers[myCutsIndex].size = 0;
    //     datasetTransfers[myCutsIndex].mySize = 0;
        
    //     div.selectAll(".cell").data(treemap.value(function(d) {
    //             return d.size;
    //         })).call(cell);
            
    //         $(".cellCutBlock").hide();
    }
}
