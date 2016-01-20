var prevCellDetailH;
var prevTreeCellH;
var prevDetailH;
var treemapFlex;
var treeMapInitH;

export default function treemapPosition(c, h) {

      var d = document.getElementById("detailView");
      var t = (h - c.offsetTop);
      var ch = c.offsetHeight;
      var dh = d.offsetHeight;

      console.log(dh)

      d.style.top = t +"px";


      treemapFlex = document.getElementById("treemapFlex");  

      console.log(h, d.offsetHeight)

      treemapFlex.height = h+d.offsetHeight

      console.log(document.getElementById("detailView"))


}


function resetTreeView(newH){
    var n;
    
    if(prevCellDetailH){ 
        n = ( parseInt(treemapFlex.style.height, 10)) - ( parseInt(prevCellDetailH, 10)) ;
    }
    if(!prevCellDetailH){
        console.log(treemapFlex);
        n = parseInt(treemapFlex.style.height, 10);
    }

    treemapFlex.style.height = n+"px" 

    n = (parseInt(treemapFlex.style.height, 10) + parseInt( newH, 10));

    treemapFlex.style.height = treeMapInitH+newH+"px" 
}


function resizeTreeView(c,treemapFlex){
    var n;

    if(prevTreeCell){ 
        n = ( parseInt(flex.style.height, 10)) - ( parseInt(prevTreeCell.style.height, 10)) 
        treemapFlex.style.height = n+"px" 
    }

    console.log(n)    

}


