console.log("this is desktop");

/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollVis = function() {
  // constants to define the size
  // and margins of the vis area.
  var width = 800;
  var height = 300;
  var margin = {top:60, left:60, bottom:0, right:60};

  var employeeLineData = [];
  var circulationData = [];
  var papersClosedData = [];
  var govtCoverageData = [];
  var congressCoverageData = [];
  var stateReportersData = [];
  var partisanshipData = [];
  var losAngelesData = [];
  var corruptionData = [];
  var animosityData = [];

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;

  // Sizing for the grid visualization
  var squareSize = 17;
  var squarePad = 3;
  var numPerRow = width / (squareSize + squarePad);

  // main svg used for visualization
  var svg = null;

  // d3 selection that will be used
  // for displaying visualizations
  var g = null;

  // scales and axes for national employee line chart
  var xLineScale = d3.scale.linear()
    .range([0, width]);

  var yLineScale = d3.scale.linear()
    .range([height, 0]);

  var xAxisLine = d3.svg.axis()
    .scale(xLineScale)
    .ticks(20)
    .tickFormat(function (d) { return d; })
    .innerTickSize(5)
    .outerTickSize(0)
    .orient("bottom");

  var yAxisLine = d3.svg.axis()
    .scale(yLineScale)
    .tickFormat(function(d) { return d.toLocaleString();})
    .ticks(5)
    .innerTickSize(-width)
    .orient("left");

  // scales and axes for circulation bar chart
  var xBarScale0 = d3.scale.ordinal()
    .rangeRoundBands([0, width], 0.2);

  var yBarScale0 = d3.scale.linear()
    .range([height, 0]);

  var xAxisBar0 = d3.svg.axis()
    .scale(xBarScale0)
    .tickFormat(function (d) { return d; })
    .innerTickSize(5)
    .outerTickSize(0)
    .orient("bottom");

  // scales and axes for revenue chart
  var xBarScale01 = d3.scale.ordinal()
  .rangeRoundBands([0, width], 0.2);

  var yBarScale01 = d3.scale.linear()
    .range([height, 0]);

  var xAxisBar01 = d3.svg.axis()
    .scale(xBarScale01)
    .tickFormat(function (d) { return d; })
    .innerTickSize(5)
    .outerTickSize(0)
    .orient("bottom");

  // scales for closed newspaper donut charts
  var radius = 170,
      padding = 10;

  var donutColor = d3.scale.ordinal()
    .range(["#e7472e", "#52908b"]);

  var arc = d3.svg.arc()
    .outerRadius(radius)
    .innerRadius(radius - 80);

  var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.papers; });

  // scales for news coverage bar chart
  var xBarScale = d3.scale.linear()
    .range([0, width-200]);

  var yBarScale = d3.scale.ordinal()
    .domain([0,1,2,3,4,5])
    .rangeBands([0, height - 50], 0.1, 0.1);

  // bar scale for Congress coverage chart
  var xBarScale1 = d3.scale.linear()
    .range([0, width-80]);

  var yBarScale1 = d3.scale.ordinal()
    .domain([0,1])
    .rangeBands([0, height - 50], 0.1, 0.1);

  // bar scale for state reporter chart
  var xBarScale2 = d3.scale.ordinal()
    .rangeBands([0, width], 0.1, 0);

  var yBarScale2 = d3.scale.linear()
    .range([height, 0]);

  // scales and axes for partisanship line charts
  var xLineScale1 = d3.scale.linear()
    .range([0, width]);

  var yLineScale1 = d3.scale.linear()
    .range([height, 0])
    .domain([25,65]);

  var xAxisLine1 = d3.svg.axis()
    .scale(xLineScale1)
    .tickValues([1994,1999,2004,2011,2014,2015])
    .tickFormat(function (d) { return d; })
    .innerTickSize(5)
    .outerTickSize(0)
    .orient("bottom");

  var yAxisLine1 = d3.svg.axis()
    .scale(yLineScale1)
    .tickFormat(function(d) { return d + "%";})
    .ticks(5)
    .innerTickSize(-width)
    .orient("left");

  // scales and axes for animosity line charts
  var xLineScale2 = d3.scale.linear()
    .range([0, width]);

  var yLineScale2 = d3.scale.linear()
    .range([height, 0])
    .domain([0,100]);

    var xAxisLine2 = d3.svg.axis()
      .scale(xLineScale2)
      .tickFormat(function (d) { return d; })
      .innerTickSize(5)
      .outerTickSize(0)
      .orient("bottom");

  var yAxisLine2 = d3.svg.axis()
    .scale(yLineScale2)
    .tickFormat(function(d) { return d + "%";})
    .ticks(5)
    .innerTickSize(-width)
    .orient("left");

  // scales for Los Angeles chart
  var xBarScale3 = d3.scale.ordinal()
    .rangeBands([0, width], 0.1, 0.8);

  var yBarScale3 = d3.scale.linear()
    .range([height, 0])
    .domain([0,80]);

  // scales for corruption bar chart
  var xBarScale4 = d3.scale.linear()
    .range([0, width-300]);

  var yBarScale4 = d3.scale.ordinal()
    .domain([0,1,2,3,4])
    .rangeBands([0, height - 50], 0.1, 0.1);

  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  var updateFunctions = [];

  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function(selection) {
    selection.each(function(rawData) {
      console.log('animosityData', animosityData);
    // create responsive svg
    svg = d3.select(this)
      .append("div")
      .classed("svg-container", true) //container class to make it responsive
      .selectAll("svg")
      .data([getSquares]);
      svg.enter().append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 885 400")
        .classed("svg-content-responsive", true) //class to make it responsive
        .append("g")
        .classed("main-g", true);

      // this group element will be used to contain all
      // other elements.
      g = svg.select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // perform some preprocessing on raw squares data
      var squareData = getSquares(rawData);

      // national employee line chart domain
      var employeeLineMax = d3.max(employeeLineData, function (d) { return d.total });
      yLineScale.domain([30000,employeeLineMax])
      xLineScale.domain(d3.extent(employeeLineData, function(d) { return d.year }));

      // circulation bar chart domain
      yBarScale0.domain([-.12,.04])
      xBarScale0.domain(circulationData.map(function(d) { return d.year }));

      // revenue bar chart domain
      yBarScale01.domain([-.27,.06])
      xBarScale01.domain([2007,2008,2009,2010,2011,2012,2013,2014,2015]);

      // donut charts
      donutColor.domain(d3.keys(papersClosedData[0]).filter(function(key) { return key !== "type"; }));
      papersClosedData.forEach(function(d) {
        d.newspapers = donutColor.domain().map(function(name) {
          return {name: name, papers: +d[name]};
        });
      });

      xBarScale.domain([0,d3.max(govtCoverageData, function(d) { return d.big_city })]);

      xBarScale1.domain([0,d3.max(congressCoverageData, function(d) { return d.per_candidate })]);

      xBarScale2.domain(stateReportersData.map(function(d) { return d.state; }));
      yBarScale2.domain([0, d3.max(stateReportersData, function(d) { return d.per_ten_legislators; })]);

      xLineScale1.domain(d3.extent(partisanshipData, function(d) { return d.year }))

      xLineScale2.domain(d3.extent(animosityData, function(d) { return d.year }))

      xBarScale3.domain(losAngelesData.map(function(d) { return d.paper; }));

      xBarScale4.domain([0,d3.max(corruptionData, function(d) { return d.change})]);

      setupVis(squareData, employeeLineData, circulationData, papersClosedData, govtCoverageData, congressCoverageData, stateReportersData, partisanshipData, animosityData, losAngelesData, corruptionData);

    });
  };


  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   */
  setupVis = function(squareData, employeeLineData, circulationData, papersClosedData, govtCoverageData, congressCoverageData, stateReportersData, partisanshipData, animosityData, losAngelesData, corruptionData) {

    var squares = g.selectAll(".square").data(squareData);
    squares.enter()
      .append("rect")
      .attr("width", squareSize)
      .attr("height", squareSize)
      .attr("fill", "#e7472e")
      .classed("square", true)
      .classed("record-before", function(d) { return d.record_before; })
      .classed("record-after", function(d) { return d.record_after; })
      .classed("national-after", function(d) { return d.national_after; })
      .attr("x", function(d) { return d.x;})
      .attr("y", function(d) { return d.y;})
      .attr("opacity", 0);

    var chartText = g.append("text")
        .attr("class", "chart-key chart-hed")
        .attr("x", 0)
        .attr("y", -25)
        .text("Bergen Record employees, before 2016 layoffs")
        .style("font-weight", 700)
        .attr("opacity", 0);
      g.append("rect")
        .attr("width", squareSize)
        .attr("height", squareSize)
        .attr("fill", "#e7472e")
        .attr("x", 645)
        .attr("y", -40)
        .attr("class", "chart-key-square")
        .attr("opacity", 0);
      g.append("text")
        .attr("class", "chart-key chart-legend")
        .attr("x", 670)
        .attr("y", -25)
        .text("= 1 employee")
        .attr("opacity", 0);

      var employeeLineDraw = d3.svg.line()
        .x(function(d) { return xLineScale(d.year); })
        .y(function(d) { return yLineScale(d.total); });

      var employeeLineChart = g.selectAll(".employee-line").data([employeeLineData]);
      employeeLineChart.enter()
        .append("path")
        .attr("class", "employee-line")
        .attr("fill", "none")
        .attr("d", function(d) { return employeeLineDraw(d) });

      var circulationChart = g.selectAll(".circulation-bar").data(circulationData);
      circulationChart.enter()
        .append("rect")
        .attr("class", function(d) { return "circulation-bar circulation-bar-" + (d.daily < 0 ? "negative" : "positive"); })
        .attr("y", function(d) { return yBarScale0(Math.max(0,d.daily)); })
        .attr("x", function(d) { return xBarScale0(d.year); })
        .attr("height", 0)
        .attr("width", xBarScale0.rangeBand());

      var circulationChartNumber = g.selectAll(".circulation-bar-number").data(circulationData);
      circulationChartNumber.enter()
        .append("text")
        .attr("class", "circulation-bar-number")
        .text(function(d) { return ((d.daily*100).toLocaleString() + '%'); })
        .attr("x", function(d) { return xBarScale0(d.year); })
        .attr("dx", xBarScale0.rangeBand() / 1.75)
        .attr("y", function(d) {
          if (d.daily >= 0) {
            return yBarScale0(d.daily) - 35;
          } else {
            return yBarScale0(d.daily)
          } })
        .attr("dy", 25)
        .style("font-size", "18px")
        .attr("text-anchor", "middle")
        .attr("opacity", 0);

      var revChart = g.selectAll(".rev-bar").data(circulationData);
      revChart.enter()
        .append("rect")
        .attr("class", function(d) { return "rev-bar circulation-bar-" + (d.circulation < 0 ? "negative" : "positive"); })
        .attr("y", function(d) { return yBarScale01(Math.max(0,d.circulation)); })
        .attr("x", function(d) { return xBarScale01(d.year); })
        .attr("height", 0)
        .attr("width", xBarScale01.rangeBand());

      var revChartNumber = g.selectAll(".rev-bar-number").data(circulationData);
      revChartNumber.enter()
        .append("text")
        .attr("class", "rev-bar-number")
        .text(function(d) { if (d.circulation !== 0) { return ((d.circulation*100).toLocaleString() + '%') }; })
        .attr("x", function(d) { return xBarScale01(d.year); })
        .attr("dx", xBarScale01.rangeBand() / 1.75)
        .attr("y", function(d) {
          if (d.circulation >= 0) {
            return yBarScale01(d.circulation) - 35;
          } else {
            return yBarScale01(d.circulation) + 15;
          } })
        .attr("dy", 25)
        .style("font-size", "18px")
        .attr("text-anchor", "middle")
        .attr("opacity", 0);

      var donutChart = g.selectAll(".pie").data(papersClosedData);
      donutChart.enter().append("svg")
        .attr("class", "pie")
        .attr("width", radius * 2)
        .attr("height", radius * 2)
        .attr("x", function(d,i) { return i*radius*2.7 });

      var donutG = donutChart.append("g")
        .attr("transform", "translate(" + radius + "," + radius + ")");

      donutG.selectAll(".arc")
        .data(function(d) { return pie(d.newspapers); })
      .enter().append("path")
        .attr("class", "arc")
        .attr("d", arc)
        .attr("opacity", 0)
        .style("fill", function(d) { return donutColor(d.data.name); });

      donutG.append("text")
        .attr("dy", ".35em")
        .attr("class", "donut-text")
        .attr("opacity", 0)
        .style("text-anchor", "middle")
        .text(function(d) { return d.type; });

      var govtCoverageBars = g.selectAll(".govt-bar").data(govtCoverageData);
      govtCoverageBars.enter()
        .append("rect")
        .attr("class", "govt-bar")
        .attr("x", 180)
        .attr("y", function(d,i) { return yBarScale(i);})
        .attr("width", 0)
        .attr("height", yBarScale.rangeBand());

      var govtCoverageBarText = g.selectAll(".govt-bar-text").data(govtCoverageData);
      govtCoverageBarText.enter()
        .append("text")
        .attr("class", "govt-bar-text")
        .text(function(d) { return d.display; })
        .attr("x", 150)
        .attr("dx", 15)
        .attr("y", function(d,i) { return yBarScale(i);})
        .attr("dy", yBarScale.rangeBand() / 1.5)
        .style("font-size", "20px")
        .attr("text-anchor", "end")
        .attr("opacity", 0);

      var govtCoverageBarNumber = g.selectAll(".govt-bar-number").data(govtCoverageData);
      govtCoverageBarNumber.enter()
        .append("text")
        .attr("class", "govt-bar-number")
        .text(function(d) { return (d.big_city*100).toFixed(1) + "%"; })
        .attr("x",function(d) {
          if (d.medium == "cable" || d.medium == "websites") {
            return xBarScale(d.big_city)+220;
          } else {
            return xBarScale(d.big_city)+150;
          }
        })
        .attr("dx", 15)
        .attr("y", function(d,i) { return yBarScale(i);})
        .attr("dy", yBarScale.rangeBand() / 1.5)
        .style("font-size", "20px")
        .attr("text-anchor", "end")
        .attr("opacity", 0);

      var govtCoverageBarNumber1 = g.selectAll(".govt-bar-number-1").data(govtCoverageData);
      govtCoverageBarNumber1.enter()
        .append("text")
        .attr("class", "govt-bar-number-1")
        .text(function(d) { return (d.suburbs*100).toFixed(1) + "%"; })
        .attr("x",function(d) {
          if (d.medium == "websites") {
            return xBarScale(d.suburbs)+220;
          } else if (d.medium == "cable") {
            return xBarScale(d.suburbs)+210;
          } else {
            return xBarScale(d.suburbs)+150;
          }
        })
        .attr("dx", 15)
        .attr("y", function(d,i) { return yBarScale(i);})
        .attr("dy", yBarScale.rangeBand() / 1.5)
        .style("font-size", "20px")
        .attr("text-anchor", "end")
        .attr("opacity", 0);

      var congressCoverageBars = g.selectAll(".congress-bar").data(congressCoverageData);
      congressCoverageBars.enter()
        .append("rect")
        .attr("class", "congress-bar")
        .attr("x", 60)
        .attr("y", function(d,i) { return yBarScale1(i);})
        .attr("width", 0)
        .attr("height", yBarScale1.rangeBand());

      var congressCoverageBarText = g.selectAll(".congress-bar-text").data(congressCoverageData);
      congressCoverageBarText.enter()
        .append("text")
        .attr("class", "congress-bar-text")
        .text(function(d) { return d.year; })
        .attr("x", 35)
        .attr("dx", 15)
        .attr("y", function(d,i) { return yBarScale1(i);})
        .attr("dy", yBarScale1.rangeBand() / 1.75)
        .style("font-size", "20px")
        .attr("text-anchor", "end")
        .attr("opacity", 0);

      var congressCoverageBarNumber = g.selectAll(".congress-bar-number").data(congressCoverageData);
      congressCoverageBarNumber.enter()
        .append("text")
        .attr("class", "congress-bar-number")
        .text(function(d) { return ((d.per_candidate).toFixed(2)); })
        .attr("x",function(d) { return xBarScale1(d.per_candidate)+20; })
        .attr("dx", 15)
        .attr("y", function(d,i) { return yBarScale1(i);})
        .attr("dy", yBarScale1.rangeBand() / 1.75)
        .style("font-size", "20px")
        .attr("text-anchor", "end")
        .attr("opacity", 0);

      var stateReporterBars = g.selectAll(".state-bar").data(stateReportersData);
      stateReporterBars.enter()
        .append("rect")
        .attr("class", "state-bar")
        .attr("y", height)
        .attr("x", function(d) { return xBarScale2(d.state);})
        .attr("height", 0)
        .attr("width", xBarScale2.rangeBand());

      var stateReporterBarText = g.selectAll(".state-bar-text").data(stateReportersData);
      stateReporterBarText.enter()
        .append("text")
        .attr("class", "state-bar-text")
        .text(function(d) { return d.state; })
        .attr("x", function(d) { return xBarScale2(d.state);})
        .attr("dx", xBarScale2.rangeBand()/2)
        .attr("y", height)
        .attr("dy", 10)
        .style("font-size", "10.5px")
        .attr("text-anchor", "middle")
        .attr("opacity", 0);

      var stateReporterBarNumber = g.selectAll(".state-bar-number").data(stateReportersData);
      stateReporterBarNumber.enter()
        .append("text")
        .attr("class", "state-bar-number")
        .text(function(d) { return (d.per_ten_legislators).toFixed(1); })
        .attr("x",function(d) { return xBarScale2(d.state); })
        .attr("dx", xBarScale2.rangeBand()/2)
        .attr("y", function(d) { return yBarScale2(d.per_ten_legislators); })
        .attr("dy", -5)
        .style("font-size", "10.5px")
        .attr("text-anchor", "middle")
        .attr("opacity", 0);

      var partisanLineDraw = d3.svg.line()
        .x(function(d) { return xLineScale1(d.year); })
        .y(function(d) { return yLineScale1(d.rep); })
        .defined(function(d) { return d; });;

      var partisanLineChart = g.selectAll(".partisan-line").data([partisanshipData]);
      partisanLineChart.enter()
        .append("path")
        .attr("class", "partisan-line")
        .attr("fill", "none")
        .attr("opacity", 0)
        .attr("d", function(d) { return partisanLineDraw(d) });

      var animosityLineDraw1 = d3.svg.line()
        .x(function(d) { return xLineScale2(d.year); })
        .y(function(d) { return yLineScale2(d.rep_unfav); })
        .defined(function(d) { return d; });;

      var animosityLineDraw2 = d3.svg.line()
        .x(function(d) { return xLineScale2(d.year); })
        .y(function(d) { return yLineScale2(d.rep_very); })
        .defined(function(d) { return d; });;

      var animosityLineChart = g.selectAll(".animosity-line").data([animosityData]);
      animosityLineChart.enter()
        .append("path")
        .attr("class", "animosity-line unfav-line")
        .attr("fill", "none")
        .attr("opacity", 0)
        .attr("d", function(d) { return animosityLineDraw1(d) });
      animosityLineChart.enter()
        .append("path")
        .attr("class", "animosity-line very-line")
        .attr("fill", "none")
        .attr("opacity", 0)
        .attr("d", function(d) { return animosityLineDraw2(d) });

      var animosityLineText = g.selectAll(".animosity-text").data(animosityData);
      animosityLineText.enter()
        .append("text")
        .attr("class", "animosity-text")
        .text("Unfavorable")
        .attr("x", width)
        .attr("dx", 15)
        .attr("y", 50)
        .attr("dy", 20)
        .style("font-size", "14px")
        .attr("text-anchor", "end")
        .attr("opacity", 0);

      var animosityLineText1 = g.selectAll(".animosity-text-1").data(animosityData);
      animosityLineText1.enter()
        .append("text")
        .attr("class", "animosity-text-1")
        .text("Very unfavorable")
        .attr("x", width)
        .attr("dx", 15)
        .attr("y", height-130)
        .attr("dy", 20)
        .style("font-size", "14px")
        .attr("text-anchor", "end")
        .attr("opacity", 0);

      var losAngelesBars = g.selectAll(".la-bar").data(losAngelesData);
      losAngelesBars.enter()
        .append("rect")
        .attr("class", "la-bar")
        .attr("y", height)
        .attr("x", function(d) { return xBarScale3(d.paper);})
        .attr("height", 0)
        .attr("width", xBarScale3.rangeBand());

      var losAngelesBarText = g.selectAll(".la-bar-text").data(losAngelesData);
      losAngelesBarText.enter()
        .append("text")
        .attr("class", "la-bar-text")
        .text(function(d) { return d.paper; })
        .attr("x", function(d) { return xBarScale3(d.paper);})
        .attr("dx", xBarScale3.rangeBand()/2)
        .attr("y", height)
        .attr("dy", 20)
        .style("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("opacity", 0);

      var losAngelesBarNumber = g.selectAll(".la-bar-number").data(losAngelesData);
      losAngelesBarNumber.enter()
        .append("text")
        .attr("class", "la-bar-number")
        .text(function(d) { return (d.percent + "%"); })
        .attr("x",function(d) { return xBarScale3(d.paper); })
        .attr("dx", xBarScale3.rangeBand()/2)
        .attr("y", function(d) { return yBarScale3(d.percent); })
        .attr("dy", -5)
        .style("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("opacity", 0);

      var corruptionBars = g.selectAll(".corruption-bar").data(corruptionData);
      corruptionBars.enter()
        .append("rect")
        .attr("class", function(d) {
          if (d.variable == "Free circulation of newspapers") {
            return "corruption-bar bar-highlight"
          } else {
            return "corruption-bar"
          }
        })
        .attr("x", 240)
        .attr("y", function(d,i) { return yBarScale4(i);})
        .attr("width", 0)
        .attr("height", yBarScale4.rangeBand());

      var corruptionBarText = g.selectAll(".corruption-bar-text").data(corruptionData);
      corruptionBarText.enter()
        .append("text")
        .attr("class", "corruption-bar-text")
        .text(function(d) { return d.variable; })
        .attr("x", 210)
        .attr("dx", 15)
        .attr("y", function(d,i) { return yBarScale4(i);})
        .attr("dy", yBarScale4.rangeBand() / 1.5)
        .style("font-size", "16px")
        .attr("text-anchor", "end")
        .attr("opacity", 0);

      var corruptionBarNumber = g.selectAll(".corruption-bar-number").data(corruptionData);
      corruptionBarNumber.enter()
        .append("text")
        .attr("class", "corruption-bar-number")
        .text(function(d) { return (d.change).toFixed(2); })
        .attr("x",function(d) {
            return xBarScale4(d.change)+280;
        })
        .attr("dx", 15)
        .attr("y", function(d,i) { return yBarScale4(i);})
        .attr("dy", yBarScale4.rangeBand() / 1.5)
        .style("font-size", "20px")
        .attr("text-anchor", "end")
        .attr("opacity", 0);

      // x axis
      g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisLine);
      g.select(".x.axis").style("opacity", 0);

      // y axis
      g.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(0,0)")
        .call(yAxisLine);
      g.select(".y.axis").style("opacity", 0);


  };


  /**
   * ACTIVATE FUNCTIONS
   *
   * These will be called their
   * section is scrolled to.
   *
   * General pattern is to ensure
   * all content for the current section
   * is transitioned in, while hiding
   * the content for the previous section
   * as well as the next section (as the
   * user may be scrolling up or down).
   *
   */

  /**
   * showBridge - initial title
   *
   * hides: bridge quote 1
   * (no previous step to hide)
   * shows: bridge
   *
   */
  function showBridge() {
    $('#bridge-text').fadeTo(500,0).css("display", "none");

    g.selectAll(".square")
      .transition()
      .duration(0)
      .attr("opacity", 0.0);

    g.selectAll(".record-before")
      .transition()
      .duration(0)
      .attr("opacity", 0.0);

  }

  /**
   * showBridgeQuote - time for some traffic problems
   *
   * (no previous step to hide)
   * hides: Christie drops out
   * shows: traffic problems quote
   *
   */
  function showBridgeQuote() {

    $('.scroll-down').fadeOut();

    $('#bridge-text').show();
    $('#bridge-text').delay(1000).fadeTo(500,1);
    $('.bridge-quote').hide().html('"Time for some traffic problems in Fort Lee."').fadeIn(1000);
    $('.bridge-attrib').hide().html("Bridget Anne Kelly, deputy chief of staff in Christie's office in an email to Port Authority executive David Wildstein.").fadeIn(1000);

    g.selectAll(".record-before")
      .transition()
      .duration(0)
      .attr("opacity", 0.0);

  }

  /**
   * showBridgeQuote1 - Christie drops out
   *
   * hides: traffic problems quote
   * hides: square grid
   * shows: Christie drops out
   *
   */
  function showBridgeQuote2() {
    $('#vis').removeClass('vis-small-container');
    $('#vis').addClass('vis-large-container');

    $('.bridge-quote').hide().html('"Chris Christie Drops Out of Presidential Race After New Hampshire Flop"').delay(1000).fadeIn(1000);
    $('.bridge-attrib').hide().html('Headline in The New York Times after Christie received only 7 percent of the vote in the New Hampshire primary and dropped out of the race.').delay(1000).fadeIn(1000);

    $('#bridge_illo').fadeTo(500,1);
    $('#bridge-text').show();
    $('#bridge-text').fadeTo(500,1);

    $('#vis').addClass('vis-trigger');

  }

  function hideBridge() {

    $('#bridge-text').fadeTo(500,0).css("display", "none");
    $('#bridge_illo').hide();
    $('#vis').removeClass('vis-large-container');
    $('#vis').addClass('vis-small-container');

    $('#vis').removeClass('vis-trigger');

    g.selectAll(".square")
      .transition()
      .duration(0)
      .attr("opacity", 0.0);

    g.selectAll(".record-before")
      .transition()
      .duration(0)
      .attr("opacity", 0.0);

    g.selectAll(".chart-key")
      .transition()
      .duration(0)
      .attr("opacity", 0.0);

    g.selectAll(".chart-key-square")
      .transition()
      .duration(0)
      .attr("opacity", 0.0);

  }

  /**
   * showRecord - show Record employee grid
   *
   * hides: christie drops out, bridge illustration
   * hides: national employee squares
   * shows: Record employee grid, updates on scroll
   */
  function showRecord() {

    g.selectAll(".chart-hed")
      .text("Bergen record employees, after 2016 layoffs");

    g.selectAll(".square")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".chart-key")
      .transition()
      .duration(600)
      .attr("opacity", 1.0);

    g.selectAll(".chart-key-square")
      .transition()
      .duration(0)
      .attr("opacity", 1);

    g.selectAll(".record-before")
      .transition()
      .duration(0)
      .attr("opacity", 1.0)
      .style("fill", "#e7472e");

  }

  function updateRecord() {
      g.selectAll(".chart-hed")
        .text("Bergen record employees, after 2016 layoffs");

      g.selectAll(".square")
        .transition()
        .duration(0)
        .attr("opacity", 0);

      g.selectAll(".record-before")
        .transition()
        .duration(0)
        .attr("opacity", 1.0)
        .style("fill", "#e7472e");

      g.selectAll(".record-after")
        .transition()
        .duration(0)
        .style("fill", "#7a3a30");
  }

  /**
   * showNational - national employee grid
   *
   * hides: Record employee squares
   * hides: national employee line chart
   * shows: national employee squares
   *
   */
  function showNational() {

    g.selectAll(".record-before")
      .transition()
      .duration(0)
      .attr("opacity", 0.0);

    g.selectAll(".square")
      .transition()
      .duration(0)
      .attr("opacity", 1.0)
      .style("fill", "#e7472e");

    g.selectAll(".chart-hed")
      .text("National newspaper employees, 2000");

    g.selectAll(".chart-legend")
      .transition()
      .duration(600)
      .text("= 100 employees");

    g.selectAll(".chart-key")
      .transition()
      .duration(0)
      .attr("opacity", 1);

  }

  function updateNational() {

    g.selectAll(".square")
      .transition()
      .duration(0)
      .attr("opacity", 1.0)
      .style("fill", "#e7472e");

    g.selectAll(".chart-legend")
      .transition()
      .duration(600)
      .text("= 100 employees");

    g.selectAll(".chart-key")
      .transition()
      .duration(0)
      .attr("opacity", 1);

    g.selectAll(".chart-key-square")
      .transition()
      .duration(0)
      .attr("opacity", 1);

    g.selectAll(".square")
      .transition("move-fills")
      .duration(800)
      .attr("x", function(d,i) {
        return d.x;
      })
      .attr("y", function(d,i) {
        return d.y;
      });

    g.selectAll(".chart-hed")
      .text("National newspaper employees, 2014");

    g.selectAll(".national-after")
      .transition("national")
      .duration(0)
      .style("fill", "#7a3a30");

    hideAxis();

    var totalLength = g.selectAll(".employee-line").node().getTotalLength();

    g.selectAll(".employee-line")
    .transition()
      .duration(500)
      .ease("linear")
      .attr("stroke-dashoffset", totalLength);

  }

  /**
   * showNationalTrend - shows national employee line graph
   *
   * hides: national employee squares
   * hides: newspaper illustration
   * shows: national employee line chart
   *
   */
  function showNationalTrend() {

    g.selectAll(".square")
      .transition()
      .duration(800)
      .attr("x", 0)
      .attr("y", 125)
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".chart-hed")
      .transition()
      .text("National newspaper employees, 1978-2014")
      .attr("opacity", 1);

    g.selectAll(".chart-legend")
      .transition()
      .duration(600)
      .attr("opacity", 0);

    g.selectAll(".chart-key-square")
      .transition()
      .duration(600)
      .attr("opacity", 0);

    showAxis(xAxisLine, yAxisLine, 700);

    var totalLength = g.selectAll(".employee-line").node().getTotalLength();

    g.selectAll(".employee-line")
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .delay(700)
        .duration(1000)
        .ease("linear")
        .attr("stroke-dashoffset", 0)
        .attr("stroke-width", 5)
        .attr("fill", "none")
        .attr("stroke", "#e7472e");


    $('#newspaper_illo').fadeTo(500,0).hide();
    // $('#header').removeClass('fixed');
    $('#sections').removeClass('header-step');


  }

  /**
   * showNewspaper - show newspaper illustration
   *
   * hides: national employee line chart
   * shows: newspaper illustration
   *
   */
  function showNewspaper() {

    hideAxis();

    var totalLength = g.selectAll(".employee-line").node().getTotalLength();

    g.selectAll(".employee-line")
    .transition()
      .duration(0)
      .ease("linear")
      .attr("stroke-dashoffset", totalLength);

    g.selectAll(".chart-hed")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    $('#newspaper_illo').show().fadeTo(500,1);
    // $('#sections').addClass('header-step');

    // $('#header').addClass('fixed');

  }

  /**
   * hideNewspaper - blank slide
   *
   * hides: newspaper illustration
   * shows: nothing
   *
   */
  function hideNewspaper() {
    $('#newspaper_illo').fadeTo(500,0).hide();
    // $('#header').removeClass('fixed');
    $('#sections').removeClass('header-step');
  }

  /**
   * blankSlide - blank slide
   *
   * hides: circulation chart
   * shows: nothing
   *
   */
  function blankSlide() {

    g.select(".x.axis")
      .attr("transform", "translate(0," + height + ")");

    hideAxis();

    hideKey();

    g.selectAll(".circulation-bar")
      .transition()
      .duration(600)
      .attr("height", 0);

    g.selectAll(".circulation-bar-number")
      .transition()
      .duration(600)
      .attr("opacity", 0)

  }

  function showCirculation() {
    showXAxis(xAxisBar0, 600);

    g.select(".x.axis")
      .attr("transform", "translate(0," + yBarScale0(0) + ")");

    g.selectAll(".chart-hed")
      .text("Percent change in daily newspaper circulation, 2003-2015");

    showKey();

    g.selectAll(".circulation-bar")
      .transition()
      .delay(function(d,i) { return 50 * (i + 1);})
      .duration(600)
      .attr("height", function(d) { return Math.abs(yBarScale0(0) - yBarScale0(d.daily)); });

    g.selectAll(".circulation-bar-number")
      .transition()
      .delay(600)
      .duration(600)
      .attr("opacity", 1)

    g.selectAll(".rev-bar")
      .transition()
      .duration(600)
      .attr("height", 0);

    g.selectAll(".rev-bar-number")
      .transition()
      .duration(600)
      .attr("opacity", 0)

  }

  function showCircRevenue () {

    showKey();

    g.select(".x.axis")
      .attr("transform", "translate(0," + yBarScale01(0) + ")");

    g.selectAll(".circulation-bar")
      .transition()
      .duration(600)
      .attr("height", 0);

    g.selectAll(".circulation-bar-number")
      .transition()
      .duration(600)
      .attr("opacity", 0)

    showXAxis(xAxisBar01, 600);

    g.selectAll(".chart-hed")
      .text("Percent change in newspaper circulation revenue, 2007-2015");

    g.selectAll(".rev-bar")
      .transition()
      .delay(function(d,i) { return 50 * (i + 1);})
      .duration(600)
      .attr("class", function(d) { return "rev-bar circulation-bar-" + (d.circulation < 0 ? "negative" : "positive"); })
      .attr("y", function(d) { return yBarScale01(Math.max(0,d.circulation)); })
      .attr("height", function(d) { return Math.abs(yBarScale01(0) - yBarScale01(d.circulation)); });

    g.selectAll(".rev-bar-number")
      .attr("opacity", 0)
      .transition()
      .delay(600)
      .duration(600)
      .attr("opacity", 1)
      .text(function(d) { if (d.circulation !== 0) { return ((d.circulation*100).toLocaleString() + '%') }; })
      .attr("y", function(d) {
        if (d.circulation >= 0) {
          return yBarScale01(d.circulation) - 35;
        } else {
          return yBarScale01(d.circulation) + 15;
        } });

  }

  function showAdRevenue () {

    showKey();

    g.select(".x.axis")
      .attr("transform", "translate(0," + yBarScale01(0) + ")");

    g.selectAll(".chart-hed")
      .text("Percent change in newspaper advertising revenue, 2007-2015");

    g.selectAll(".rev-bar")
      .transition()
      .delay(function(d,i) { return 50 * (i + 1);})
      .duration(600)
      .attr("class", function(d) { return "rev-bar circulation-bar-" + (d.advertising < 0 ? "negative" : "positive"); })
      .attr("y", function(d) { return yBarScale01(Math.max(0,d.advertising)); })
      .attr("height", function(d) { return Math.abs(yBarScale01(0) - yBarScale01(d.advertising)); });

    g.selectAll(".rev-bar-number")
      .attr("opacity", 0)
      .transition()
      .delay(600)
      .duration(600)
      .attr("opacity", 1)
      .text(function(d) { if (d.advertising !== 0) { return ((d.advertising*100).toLocaleString() + '%') }; })
      .attr("y", function(d) {
        if (d.advertising >= 0) {
          return yBarScale01(d.advertising) - 35;
        } else {
          return yBarScale01(d.advertising);
        } });


    showXAxis(xAxisBar01, 0);

    g.selectAll(".arc")
      .transition()
      .duration(600)
      .attr("opacity", 0);

    g.selectAll(".donut-text")
      .transition()
      .duration(600)
      .attr("opacity", 0);

    g.selectAll(".chart-legend")
      .transition()
      .duration(600)
      .attr("opacity", 0);

    g.selectAll(".chart-key-square")
      .transition()
      .duration(0)
      .attr("opacity", 0);

  }

  function showPapersClosed () {

    g.select(".x.axis")
      .attr("transform", "translate(0," + height + ")");

    hideAxis();

    g.selectAll(".chart-hed")
      .text("Percent of newspapers that have closed since 2004");

    g.selectAll(".chart-legend")
      .transition()
      .duration(600)
      .attr("opacity", 1)
      .text("= closed papers");

    g.selectAll(".chart-key-square")
      .transition()
      .duration(0)
      .attr("opacity", 1);

    g.selectAll(".rev-bar")
      .transition()
      .duration(600)
      .attr("height", 0);

    g.selectAll(".rev-bar-number")
      .transition()
      .duration(600)
      .attr("opacity", 0)

    g.selectAll(".govt-bar")
      .transition()
      .duration(600)
      .attr("width", 0);

    g.selectAll(".govt-bar-text")
      .transition()
      .duration(600)
      .attr("opacity", 0);

    g.selectAll(".govt-bar-number")
      .transition()
      .duration(600)
      .attr("opacity", 0);

    g.selectAll(".arc")
      .transition()
      .duration(600)
      .attr("opacity", 1);

    g.selectAll(".donut-text")
      .transition()
      .duration(600)
      .attr("opacity", 1);

  }

  function showBigCities () {

    g.selectAll(".arc")
      .transition()
      .duration(600)
      .attr("opacity", 0);

    g.selectAll(".donut-text")
      .transition()
      .duration(600)
      .attr("opacity", 0);

    g.selectAll(".chart-legend")
      .transition()
      .duration(600)
      .attr("opacity", 0);

    g.selectAll(".chart-key-square")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".chart-hed")
      .text("Percentage of local government news stories reported by medium in big cities, 2010");

    g.selectAll(".govt-bar")
      .transition()
      .delay(function(d,i) { return 100 * (i + 1);})
      .duration(600)
      .attr("width", function(d) { return xBarScale(d.big_city); });

    g.selectAll(".govt-bar-text")
      .transition()
      .duration(600)
      .delay(function(d,i) { return 100 * (i + 1);})
      .attr("opacity", 1);

    g.selectAll(".govt-bar-number")
      .transition()
      .duration(600)
      .delay(function(d,i) { return 100 * (i + 1);})
      .attr("opacity", 1);

    g.selectAll(".govt-bar-number-1")
      .transition()
      .duration(600)
      .delay(600)
      .attr("opacity", 0);
  }

  function showSuburbs () {

    showKey();

    g.selectAll(".chart-hed")
      .text("Percentage of local government news stories reported by medium in suburbs, 2010");

    g.selectAll(".govt-bar")
      .transition()
      .delay(function(d,i) { return 100 * (i + 1);})
      .duration(600)
      .attr("width", function(d) { return xBarScale(d.suburbs); });

    g.selectAll(".govt-bar-number")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".govt-bar-number-1")
      .transition()
      .duration(600)
      .attr("opacity", 1);

    g.selectAll(".govt-bar-text")
      .transition()
      .duration(600)
      .delay(600)
      .attr("opacity", 1);

    g.selectAll(".congress-bar")
      .transition()
      .duration(600)
      .attr("width", 0);

    g.selectAll(".congress-bar-text")
      .transition()
      .duration(600)
      .attr("opacity", 0);

    g.selectAll(".congress-bar-number-1")
      .transition()
      .duration(600)
      .attr("opacity", 0);

    g.selectAll(".congress-bar-number")
      .transition()
      .duration(600)
      .attr("opacity", 0);

  }

  function showCongressCoverage () {

    showKey();

    g.selectAll(".chart-hed")
      .text("Major newspapers articles per Congressional candidate");

    g.selectAll(".govt-bar")
      .transition()
      .duration(600)
      .attr("width", 0);

    g.selectAll(".govt-bar-text")
      .transition()
      .duration(600)
      .attr("opacity", 0);

    g.selectAll(".govt-bar-number-1")
      .transition()
      .duration(600)
      .attr("opacity", 0);

    g.selectAll(".congress-bar")
      .transition()
      .duration(600)
      .attr("width", function(d) { return xBarScale1(d.per_candidate); });

    g.selectAll(".congress-bar-text")
      .transition()
      .duration(600)
      .delay(600)
      .attr("opacity", 1);

    g.selectAll(".congress-bar-number")
      .transition()
      .duration(600)
      .delay(600)
      .attr("opacity", 1);

    g.selectAll(".congress-bar-number-1")
      .transition()
      .duration(600)
      .attr("opacity", 0);

    g.selectAll(".state-bar")
      .transition()
      .delay(function(d,i) { return 10 * (i + 1);})
      .duration(600)
      .attr("opacity", 0)
      .attr("y", height)
      .attr("height", 0);

    g.selectAll(".state-bar-text")
      .transition()
      .duration(600)
      .attr("opacity", 0);

    g.selectAll(".state-bar-number")
      .transition()
      .duration(600)
      .attr("opacity", 0);
  }

  function showStateReporters () {
    g.selectAll(".congress-bar")
      .transition()
      .duration(600)
      .attr("width", 0);

    g.selectAll(".congress-bar-text")
      .transition()
      .duration(600)
      .attr("opacity", 0);

    g.selectAll(".congress-bar-number")
      .transition()
      .duration(600)
      .attr("opacity", 0);

    g.selectAll(".congress-bar-number-1")
      .transition()
      .duration(600)
      .attr("opacity", 0);

    g.selectAll(".chart-hed")
      .text("Full-time statehouse reporters per 10 legislators, 2014");

    showKey();

    g.selectAll(".state-bar")
      .transition()
      .delay(function(d,i) { return 10 * (i + 1);})
      .duration(600)
      .attr("opacity", 1)
      .attr("y", function(d) { return yBarScale2(d.per_ten_legislators); })
      .attr("height", function(d) { return height - yBarScale2(d.per_ten_legislators); });

    g.selectAll(".state-bar-text")
      .transition()
      .duration(600)
      .delay(function(d,i) { return 10 * (i + 1);})
      .attr("opacity", 1);

    g.selectAll(".state-bar-number")
      .transition()
      .duration(600)
      .delay(600)
      .attr("opacity", 1);
  }

  function hideStateReporters() {

    hideKey();

    g.selectAll(".state-bar-text")
      .transition()
      .duration(100)
      .attr("opacity", 0);

    g.selectAll(".state-bar")
      .transition()
      .duration(200)
      .attr("opacity", 0)
      .attr("y", height)
      .attr("height", 0);

    g.selectAll(".state-bar-number")
      .transition()
      .duration(100)
      .attr("opacity", 0);

  }

  function hideRepublican() {

    hideKey();

    hideAxis();

    var totalLength = g.selectAll(".partisan-line").node().getTotalLength();

    g.selectAll(".partisan-line")
    .transition()
      .duration(500)
      .ease("linear")
      .attr("stroke-dashoffset", totalLength)
      .attr("opacity", 0);

  }

  function showRepublican() {

    showAxis(xAxisLine1, yAxisLine1, 0);

    showKey();

    g.selectAll(".chart-hed")
      .text("Share of Republicans who consider themselves conservative");

    var partisanLineDraw = d3.svg.line()
      .x(function(d) { return xLineScale1(d.year); })
      .y(function(d) { return yLineScale1(d.rep); })
      .defined(function(d) { return d; });

    var totalLength = g.selectAll(".partisan-line").node().getTotalLength();

    g.selectAll(".partisan-line")
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .attr("opacity", 1)
      .transition()
        .delay(0)
        .attr("d", function(d) { return partisanLineDraw(d) })
        .duration(1000)
        .ease("linear")
        .attr("stroke-dashoffset", 0)
        .attr("stroke-width", 5)
        .attr("fill", "none")
        .attr("stroke", "#e7472e");

  }

  function showDemocrat() {

    showAxis(xAxisLine1, yAxisLine1, 0);

    showKey();

    g.selectAll(".chart-hed")
      .text("Share of Democrats who consider themselves liberal");

    var partisanLineDraw = d3.svg.line()
      .x(function(d) { return xLineScale1(d.year); })
      .y(function(d) { return yLineScale1(d.dem); })
      .defined(function(d) { return d; });

    g.selectAll('.partisan-line')
      .attr("opacity", 1)
      .transition()
        .delay(0)
        .duration(1000)
        .ease("linear")
        .attr("stroke-dashoffset", 0)
        .attr("stroke-width", 5)
        .attr("fill", "none")
        .attr("stroke", "#52908b")
        .attr("d", function(d) { return partisanLineDraw(d) });

    var totalLength1 = g.selectAll(".unfav-line").node().getTotalLength();

    g.selectAll(".unfav-line")
      .transition()
        .duration(500)
        .ease("linear")
        .attr("stroke-dashoffset", totalLength1)
        .attr("opacity", 0);

    var totalLength2 = g.selectAll(".very-line").node().getTotalLength();

    g.selectAll(".very-line")
      .transition()
        .duration(500)
        .ease("linear")
        .attr("stroke-dashoffset", totalLength2)
        .attr("opacity", 0);

    g.selectAll(".animosity-text")
      .transition()
      .duration(200)
      .attr("opacity", 0);

    g.selectAll(".animosity-text-1")
      .transition()
      .duration(200)
      .attr("opacity", 0);

  }

  function showAnimosity() {

    showAxis(xAxisLine2, yAxisLine2, 0);

    showKey();

    var totalLength = g.selectAll(".partisan-line").node().getTotalLength();

    g.selectAll(".partisan-line")
      .transition()
        .duration(500)
        .ease("linear")
        .attr("stroke-dashoffset", totalLength)
        .attr("opacity", 0);

      g.selectAll(".chart-hed")
        .text("Republican attitudes about Democratic Party");

    var animosityLineDraw1 = d3.svg.line()
      .x(function(d) { return xLineScale2(d.year); })
      .y(function(d) { return yLineScale2(d.rep_unfav); })
      .defined(function(d) { return d; });

    var totalLength1 = g.selectAll(".unfav-line").node().getTotalLength();

    g.selectAll(".unfav-line")
      .attr("stroke-dasharray", totalLength1 + " " + totalLength1)
      .attr("stroke-dashoffset", totalLength1)
      .attr("opacity", 1)
      .transition()
        .delay(0)
        .attr("d", function(d) { return animosityLineDraw1(d) })
        .duration(800)
        .ease("linear")
        .attr("stroke-dashoffset", 0)
        .attr("stroke-width", 5)
        .attr("fill", "none")
        .attr("stroke", "#e7472e");

    var animosityLineDraw2 = d3.svg.line()
      .x(function(d) { return xLineScale2(d.year); })
      .y(function(d) { return yLineScale2(d.rep_very); })
      .defined(function(d) { return d; });

      var totalLength2 = g.selectAll(".very-line").node().getTotalLength();

    g.selectAll(".very-line")
      .attr("stroke-dasharray", totalLength2 + " " + totalLength2)
      .attr("stroke-dashoffset", totalLength2)
      .attr("opacity", 1)
      .transition()
        .delay(0)
        .attr("d", function(d) { return animosityLineDraw2(d) })
        .duration(800)
        .ease("linear")
        .attr("stroke-dashoffset", 0)
        .attr("stroke-width", 5)
        .attr("fill", "none")
        .attr("stroke", "#e5e2ca");

    g.selectAll(".animosity-text")
      .transition()
      .delay(800)
      .duration(200)
      .attr("opacity", 1);

    g.selectAll(".animosity-text-1")
      .transition()
      .delay(800)
      .duration(200)
      .attr("opacity", 1);

  }

  function updateAnimosity() {

    showAxis(xAxisLine2, yAxisLine2, 0);

    showKey();

    g.selectAll(".animosity-text")
      .transition()
      .delay(800)
      .duration(500)
      .attr("opacity", 1);

    g.selectAll(".animosity-text-1")
      .transition()
      .delay(800)
      .duration(500)
      .attr("opacity", 1);

      g.selectAll(".chart-hed")
        .text("Democratic attitudes about Republican Party");

        var animosityLineDraw1 = d3.svg.line()
          .x(function(d) { return xLineScale2(d.year); })
          .y(function(d) { return yLineScale2(d.dem_unfav); })
          .defined(function(d) { return d; });

        g.selectAll(".unfav-line")
          .attr("opacity", 1)
          .transition()
            .delay(0)
            .attr("d", function(d) { return animosityLineDraw1(d) })
            .duration(800)
            .ease("linear")
            .attr("stroke-dashoffset", 0)
            .attr("stroke-width", 5)
            .attr("fill", "none")
            .attr("stroke", "#52908b");

          var animosityLineDraw2 = d3.svg.line()
            .x(function(d) { return xLineScale2(d.year); })
            .y(function(d) { return yLineScale2(d.dem_very); })
            .defined(function(d) { return d; });

          g.selectAll(".very-line")
            .attr("opacity", 1)
            .transition()
              .delay(0)
              .attr("d", function(d) { return animosityLineDraw2(d) })
              .duration(800)
              .ease("linear")
              .attr("stroke-dashoffset", 0)
              .attr("stroke-width", 5)
              .attr("fill", "none")
              .attr("stroke", "#e5e2ca");
  }

  function hideAnimosity() {

    hideKey();
    hideAxis();

    var totalLength1 = g.selectAll(".unfav-line").node().getTotalLength();

    g.selectAll(".unfav-line")
      .transition()
        .duration(100)
        .ease("linear")
        .attr("stroke-dashoffset", totalLength1)
        .attr("opacity", 0);

    var totalLength2 = g.selectAll(".very-line").node().getTotalLength();

    g.selectAll(".very-line")
      .transition()
        .duration(100)
        .ease("linear")
        .attr("stroke-dashoffset", totalLength2)
        .attr("opacity", 0);

    g.selectAll(".animosity-text")
      .transition()
      .duration(100)
      .attr("opacity", 0);

    g.selectAll(".animosity-text-1")
      .transition()
      .duration(100)
      .attr("opacity", 0);
  }

  function hideCincinnati() {

    hideKey();

    g.selectAll(".la-bar-text")
      .transition()
      .duration(600)
      .delay(function(d,i) { return 1 * (i + 1);})
      .attr("opacity", 0);

    g.selectAll(".la-bar")
      .transition()
      .delay(function(d,i) { return 1 * (i + 1);})
      .duration(600)
      .attr("opacity", 0)
      .attr("y", height)
      .attr("height", 0);

    g.selectAll(".la-bar-number")
      .transition()
      .duration(600)
      .attr("opacity", 0);
  }

  function showLosAngeles() {
    g.selectAll(".chart-hed")
      .text("Percentage of people in Los Angeles communities who say they always vote, 2009");

    showKey();

    g.selectAll(".la-bar")
      .transition()
      .delay(function(d,i) { return 10 * (i + 1);})
      .duration(600)
      .attr("opacity", 1)
      .attr("y", function(d) { return yBarScale3(d.percent); })
      .attr("height", function(d) { return height - yBarScale3(d.percent); });

    g.selectAll(".la-bar-text")
      .transition()
      .duration(600)
      .delay(function(d,i) { return 10 * (i + 1);})
      .attr("opacity", 1);

    g.selectAll(".la-bar-number")
      .transition()
      .duration(600)
      .delay(200)
      .attr("opacity", 1);
  }

  function hideLosAngeles() {

    hideKey();

    g.selectAll(".la-bar-text")
      .transition()
      .duration(600)
      .delay(function(d,i) { return 1 * (i + 1);})
      .attr("opacity", 0);

    g.selectAll(".la-bar")
      .transition()
      .delay(function(d,i) { return 1 * (i + 1);})
      .duration(600)
      .attr("opacity", 0)
      .attr("y", height)
      .attr("height", 0);

    g.selectAll(".la-bar-number")
      .transition()
      .duration(600)
      .attr("opacity", 0);
  }

  function hideCorruption() {

    hideKey();

    g.selectAll(".corruption-bar")
      .transition()
      .duration(600)
      .attr("width", 0);

    g.selectAll(".corruption-bar-text")
      .transition()
      .duration(600)
      .attr("opacity", 0);

    g.selectAll(".corruption-bar-number")
      .transition()
      .duration(600)
      .attr("opacity", 0);
  }

  function showCorruption() {

    g.selectAll(".chart-hed")
      .text("Change in corruption index as a result of increasing variable from minimum to maximum value");

    showKey();

    g.selectAll(".corruption-bar")
      .transition()
      .delay(function(d,i) { return 100 * (i + 1);})
      .duration(600)
      .attr("width", function(d) { return xBarScale4(d.change); });

    g.selectAll(".corruption-bar-text")
      .transition()
      .delay(function(d,i) { return 1 * (i + 1);})
      .duration(600)
      .attr("opacity", 1);

    g.selectAll(".corruption-bar-number")
      .transition()
      .delay(function(d,i) { return 1 * (i + 1);})
      .duration(600)
      .attr("opacity", 1);

    $('#bridge-text').fadeTo(500,0).hide();
  }

  function setMaxWidth() {
    $("#vis").css("display", "inherit");
  }

  function removeMaxWidth() {
    $("#vis").css("display", "none");
  }

  /**
   * showAxis - helper function to
   * display particular xAxis
   *
   * @param xAxis, yAxis - the axis to show, delay - how long to delay the transition
   */
  function showAxis(xAxis, yAxis, delay) {
    g.select(".x.axis")
      .call(xAxis)
      .transition().duration(500).delay(delay)
      .style("opacity", 1);
    g.select(".y.axis")
      .call(yAxis)
      .transition().duration(500).delay(delay)
      .style("opacity", 1);
  }

  function showXAxis(xAxis, delay) {
    g.select(".x.axis")
      .call(xAxis)
      .transition().duration(500).delay(delay)
      .style("opacity", 1);
  }

  /**
   * hideAxis - helper function
   * to hide the axis
   *
   */
  function hideAxis() {
    g.select(".x.axis")
      .transition().duration(0)
      .style("opacity",0);
    g.select(".y.axis")
      .transition().duration(0)
      .style("opacity",0);
  }

  function showKey() {
    g.selectAll(".chart-key")
      .transition()
      .duration(600)
      .attr("opacity", 1.0);

    g.selectAll(".chart-legend")
      .transition()
      .duration(600)
      .attr("opacity", 0);
  }

  function hideKey() {
    g.selectAll(".chart-key")
      .transition()
      .duration(600)
      .attr("opacity", 0.0);
  }

  /**
   * DATA FUNCTIONS
   *
   * Used to coerce the data into the
   * formats we need to visualize
   *
   */

  /**
   * getSquares - maps raw data to
   * array of data objects.
   *
   * This function converts some attributes into
   * numbers and adds attributes used in the visualization
   *
   * @param rawData - data read in from squares file
   */
  function getSquares(rawData) {
    return rawData.map(function(d,i) {
      d.record_before = (d.record_before === "1") ? true : false;
      d.record_after = (d.record_after === "1") ? true : false;
      d.national_before = (d.national_before === "1") ? true : false;
      d.national_after = (d.national_after === "1") ? true : false;
      // positioning for square visual
      // stored here to make it easier
      // to keep track of.
      d.col = i % numPerRow;
      d.x = d.col * (squareSize + squarePad);
      d.row = Math.floor(i / numPerRow);
      d.y = d.row * (squareSize + squarePad);
      return d;
    });
  }

  /**
   * activate -
   *
   * @param index - index of the activated section
   */

   chart.activate =
   	$('#sections').fullpage({
       anchors: false,
       scrollingSpeed: 700,
       navigation: true,
       scrollBar: true,
       fadingEffect: true,
       fadingEffectKey: 'a2llcnN0ZW5zY2htaWR0LmNvbV9NSUVabUZrYVc1blJXWm1aV04wdmZ',


       onLeave: function(anchorLink, index){
         activateFunctions[0] = showBridge;
         activateFunctions[1] = showBridgeQuote;
         activateFunctions[2] = showBridgeQuote2;
         activateFunctions[3] = hideBridge;
         activateFunctions[4] = showRecord;
         activateFunctions[5] = updateRecord;
         activateFunctions[6] = showNational;
         activateFunctions[7] = updateNational;
         activateFunctions[8] = showNationalTrend;
         activateFunctions[9] = showNewspaper;
         activateFunctions[10] = hideNewspaper;
         activateFunctions[11] = blankSlide;
         activateFunctions[12] = showCirculation;
         activateFunctions[13] = showCircRevenue;
         activateFunctions[14] = showAdRevenue;
         activateFunctions[15] = showPapersClosed;
         activateFunctions[16] = showBigCities;
         activateFunctions[17] = showSuburbs;
         activateFunctions[18] = showCongressCoverage;
         activateFunctions[19] = showStateReporters;
         activateFunctions[20] = hideStateReporters;
         activateFunctions[21] = hideRepublican;
         activateFunctions[22] = showRepublican;
         activateFunctions[23] = showDemocrat;
         activateFunctions[24] = showAnimosity;
         activateFunctions[25] = updateAnimosity;
         activateFunctions[26] = hideAnimosity;
         activateFunctions[27] = blankSlide;
         activateFunctions[28] = hideCincinnati;
         activateFunctions[29] = showLosAngeles;
         activateFunctions[30] = hideLosAngeles;
         activateFunctions[31] = hideCorruption;
         activateFunctions[32] = showCorruption;
         activateFunctions[33] = hideCorruption;
         activateFunctions[34] = blankSlide;
         activateFunctions[35] = setMaxWidth;
         activateFunctions[36] = removeMaxWidth;
         activateFunctions[37] = blankSlide;



       var loadedSection = $(this);
       index = index - 1;


       activeIndex = index;
         var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
         var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
         scrolledSections.forEach(function(i) {
           activateFunctions[i]();
           $('.vis-small-container').css('left', function(){
             var width = 780;
             var windowWidth = $(window).width();
             return (windowWidth - width)/2;
           });
          //  $('#step9').css('left', function(){
          //    var width = $('#step9').width();
          //    var windowWidth = $(window).width();
          //    return "-" + (windowWidth - width)/1.5;
          //  });
           $('.vis-large-container').css('left', 0);
         });
         lastIndex = activeIndex;
   	}
     });

  /**
   * setOtherData - brings in all data except the first file
   * @param other - array of some other data you want to use
   */

  chart.setOtherData = function(employeeLine, circulation, papers_closed, govt_coverage, congress_coverage, state_reporters, partisanship, animosity, losangeles, corruption) {
    employeeLineData = employeeLine;
    circulationData = circulation;
    papersClosedData = papers_closed;
    govtCoverageData = govt_coverage;
    congressCoverageData = congress_coverage;
    stateReportersData = state_reporters;
    partisanshipData = partisanship;
    animosityData = animosity;
    losAngelesData = losangeles;
    corruptionData = corruption;

    employeeLineData.forEach(function(d){
      d.year = +d.year;
      d.total = +d.total;
      return d;
    });

    circulationData.forEach(function(d){
      d.year = +d.year;
      d.daily = +d.daily;
      d.circulation = +d.circulation;
      d.advertising = +d.advertising;
      return d;
    });

    papersClosedData.forEach(function(d){
      d.type = d.type;
      d.closed = +d.closed;
      d.open = +d.open;
    })

    govtCoverageData.forEach(function(d){
      d.medium = d.medium;
      d.big_city = +d.big_city;
      d.suburbs = +d.suburbs;
      d.display = d.display;
      return d;
    });

    congressCoverageData.forEach(function(d){
      d.year = +d.year;
      d.articles = +d.articles;
      d.candidates = +d.candidates;
      d.per_candidate = +d.per_candidate;
    })

    stateReportersData.forEach(function(d){
      d.state = d.state;
      d.reporters = +d.reporters;
      d.legislators = +d.legislators;
      d.per_ten_legislators = +d.per_ten_legislators;
    })

    partisanshipData.forEach(function(d){
      d.year = +d.year;
      d.rep = +d.rep;
      d.dem = +d.dem;
    })

    animosityData.forEach(function(d){
      d.year = +d.year;
      d.rep_unfav = +d.rep_unfav;
      d.rep_very = +d.rep_very;
      d.dem_unfav = +d.dem_unfav;
      d.dem_very = +d.dem_very;
    })

    losAngelesData.forEach(function(d){
      d.paper = d.paper;
      d.percent = +d.percent;
    })

    corruptionData.forEach(function(d){
      d.variable = d.variable;
      d.change = +d.change;
    })
  };

  /**
   * update
   *
   * @param index
   * @param progress
   */
  chart.update = function(index, progress) {
    updateFunctions[index](progress);
  };

  // return chart function
  return chart;
};


/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded csv data
 */
function display(error, employeeSquares, employeeLine, circulation, papers_closed, govt_coverage, congress_coverage, state_reporters, partisanship, animosity, losangeles, corruption) {
  // create a new plot and
  // display it
  var plot = scrollVis();
  plot.setOtherData(employeeLine, circulation, papers_closed, govt_coverage, congress_coverage, state_reporters, partisanship, animosity, losangeles, corruption);
  d3.select("#vis")
    .datum(employeeSquares)
    .call(plot);

}

// load data and display
queue()
.defer(d3.csv, "data/employees_intro.csv")
.defer(d3.csv, "data/national_employees_intro.csv")
.defer(d3.csv, "data/circulation.csv")
.defer(d3.csv, "data/papers_closed.csv")
.defer(d3.csv, "data/govt_coverage.csv")
.defer(d3.csv, "data/congress_coverage.csv")
.defer(d3.csv, "data/state_reporters.csv")
.defer(d3.csv, "data/partisanship.csv")
.defer(d3.csv, "data/animosity.csv")
.defer(d3.csv, "data/losangeles.csv")
.defer(d3.csv, "data/corruption.csv")
.await(display);
