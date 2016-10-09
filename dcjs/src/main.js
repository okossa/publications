


define(function (require, exports, module) {    
    'use strict';

    var SimpleTooltip = require('js/simpletoolTip');
    
    var spendData = [
            {Name: 'Mr A', Spent: '$40', Year: 2011, fullDate : '02/04/2011'},
            {Name: 'Mr B', Spent: '$10', Year: 2011, fullDate : '09/05/2011'},
            {Name: 'Mr C', Spent: '$40', Year: 2011, fullDate : '23/05/2011'},
        
            {Name: 'Mr A', Spent: '$70', Year: 2012, fullDate : '11/01/2012'},
            {Name: 'Mr B', Spent: '$20', Year: 2012, fullDate : '19/01/2012'},
            {Name: 'Mr A', Spent: '$70', Year: 2012, fullDate : '04/03/2012'},
            {Name: 'Mr B', Spent: '$20', Year: 2012, fullDate : '15/08/2012'},
        
            {Name: 'Mr B', Spent: '$90', Year: 2013, fullDate : '12/02/2013'},
            {Name: 'Mr C', Spent: '$60', Year: 2013, fullDate : '22/04/2013'},
            {Name: 'Mr B', Spent: '$10', Year: 2013, fullDate : '27/04/2013'},
            {Name: 'Mr C', Spent: '$20', Year: 2013, fullDate : '12/06/2013'},
            {Name: 'Mr B', Spent: '$150', Year: 2013, fullDate : '02/08/2013'},
            {Name: 'Mr C', Spent: '$40', Year: 2013, fullDate : '12/10/2013'}
        ];
    
    CreateLinkedChart(spendData);
    
    
    function CreateLinkedChart(spendData){
        var spendHistChart  = dc.barChart("#chart-hist-spend");
        var spenderRowChart = dc.rowChart("#chart-row-spenders");
        var yearRingChart   = dc.pieChart("#chart-ring-year");      
        var lineChart       = dc.lineChart("#chart-line-spenders");      
        var parserDate = d3.time.format("%d/%m/%Y").parse;
         
        // normalize/parse data
        spendData.forEach(function(d) {
            d.Spent = d.Spent.match(/\d+/);
            d.CompleteDate = parserDate(d.fullDate);
        });

        // set crossfilter
        var ndx = crossfilter(spendData),
            yearDim  = ndx.dimension(function(d) {return +d.Year;}),
            spendDim = ndx.dimension(function(d) {return Math.floor(d.Spent/10);}),
            nameDim  = ndx.dimension(function(d) {return d.Name;}),
            CompleteDateDim = ndx.dimension(function(d) {return +d.CompleteDate;}),
            
            spendPerYear = yearDim.group().reduceSum(function(d) {return +d.Spent;}),
            spendPerName = nameDim.group().reduceSum(function(d) {return +d.Spent;}),
            spendHist    = spendDim.group().reduceCount(),
            spendPerCompleteDate = CompleteDateDim.group().reduceSum(function(d) {return +d.Spent;});
        
        yearRingChart
            .width(250).height(250)
            .dimension(yearDim)
            .group(spendPerYear)
            .innerRadius(50);
            
        spendHistChart
            .width(400).height(250)
            .dimension(spendDim)
            .group(spendHist)
            .x(d3.scale.linear().domain([0,10]))
            .xAxisLabel('$') 
            .elasticY(true);
        
        spendHistChart.xAxis().tickFormat(function(d) {return d*10}); // convert back to base unit
        spendHistChart.yAxis().ticks(2);
        
         lineChart
            .width(600)
            .height(300)
            .elasticY(true)
            .elasticX(true)
            .x(d3.time.scale().domain([new Date(2011, 2, 2), new Date(2013, 12, 31)]))
            .renderArea(true)
            .brushOn(false)
            .renderDataPoints(true)
            .yAxisLabel("$")
            .dimension(CompleteDateDim)
            .group(spendPerCompleteDate);
              
        spenderRowChart
            .width(400).height(300)
            .dimension(nameDim)
            .group(spendPerName)
            .elasticX(true);
        
          dc.dataTable("#data-table")
            .dimension(CompleteDateDim)
            .group(function (d) {
                  return d.Name;
            })
            .size(20) 
            .columns([
                function (d) {
                    return d.fullDate;
                },
                function (d) {
                    return d.Spent+'$';
                }
            ]);
                  
        dc.renderAll();
        

          
          // new SimpleTooltip({id : 'yearRingChart', chart : yearRingChart});
          // new SimpleTooltip({id : 'lineChart', chart : lineChart});
          // new SimpleTooltip({id : 'spenderRowChart', chart : spenderRowChart});
        
    }
});
