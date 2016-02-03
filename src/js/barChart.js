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