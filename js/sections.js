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
    .outerTickSize(0)
    .orient("left");

  // scales and axes for circulation line chart
  var xLineScale1 = d3.scale.linear()
    .range([0, width]);

  var yLineScale1 = d3.scale.linear()
    .range([height, 0]);

  var xAxisLine1 = d3.svg.axis()
    .scale(xLineScale1)
    .ticks(10)
    .tickFormat(function (d) { return d; })
    .innerTickSize(5)
    .outerTickSize(0)
    .orient("bottom");

  var yAxisLine1 = d3.svg.axis()
    .scale(yLineScale1)
    .tickFormat(function(d) { return d.toLocaleString()*100 + '%';})
    .ticks(5)
    .innerTickSize(-width)
    .outerTickSize(0)
    .orient("left");

  var xLineScale2 = d3.scale.linear()
    .range([0, width]);

  var yLineScale2 = d3.scale.linear()
    .range([height, 0]);

  var xAxisLine2 = d3.svg.axis()
    .scale(xLineScale2)
    .ticks(10)
    .tickFormat(function (d) { return d; })
    .innerTickSize(5)
    .outerTickSize(0)
    .orient("bottom");

  var yAxisLine2 = d3.svg.axis()
    .scale(yLineScale2)
    .tickFormat(function(d) { return d.toLocaleString()*100 + '%';})
    .ticks(6)
    .innerTickSize(-width)
    .outerTickSize(0)
    .orient("left");

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
      console.log('circulationData', circulationData);
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

      //  convert national employee data to numbers
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

      // national employee line chart domain
      var employeeLineMax = d3.max(employeeLineData, function (d) { return d.total });
      yLineScale.domain([30000,employeeLineMax])
      xLineScale.domain(d3.extent(employeeLineData, function(d) { return d.year }));

      // circulation line chart domain
      yLineScale1.domain([-.12,.12])
      xLineScale1.domain(d3.extent(circulationData, function(d) { return d.year }));

      // revenue line chart domain
      yLineScale2.domain([-.27,.27])
      xLineScale2.domain([2007,2015]);

      setupVis(squareData, employeeLineData, circulationData);

      setupSections();

    });
  };


  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   */
  setupVis = function(squareData, employeeLineData, circulationData) {

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
        .text("Bergen Record employees, before and after 2016 layoffs")
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

      var circulationDraw = d3.svg.line()
        .x(function(d) { return xLineScale1(d.year); })
        .y(function(d) { return yLineScale1(d.daily); });

      var circulationChart = g.selectAll(".circulation-line").data([circulationData]);
      circulationChart.enter()
        .append("path")
        .attr("class", "circulation-line")
        .attr("fill", "none")
        .attr("d", function(d) { return circulationDraw(d) });

  };

  /**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  setupSections = function() {

    // activateFunctions are called each
    // time the active section changes
    activateFunctions[0] = showBridge;
    activateFunctions[1] = showBridgeQuote;
    activateFunctions[2] = showBridgeQuote2;
    activateFunctions[3] = showRecord;
    activateFunctions[4] = showNational;
    activateFunctions[5] = showNationalTrend;
    activateFunctions[6] = showNewspaper;
    activateFunctions[7] = hideNewspaper;
    activateFunctions[8] = blankSlide;
    activateFunctions[9] = showCirculation;
    activateFunctions[10] = showCircRevenue;
    activateFunctions[11] = showAdRevenue;
    activateFunctions[12] = showPapersClosed;
    activateFunctions[13] = blankSlide;
    activateFunctions[14] = blankSlide;
    activateFunctions[15] = blankSlide;
    activateFunctions[16] = blankSlide;
    activateFunctions[17] = blankSlide;
    activateFunctions[18] = blankSlide;
    activateFunctions[19] = blankSlide;
    activateFunctions[20] = blankSlide;
    activateFunctions[21] = blankSlide;
    activateFunctions[22] = blankSlide;
    activateFunctions[23] = blankSlide;
    activateFunctions[24] = blankSlide;
    activateFunctions[25] = blankSlide;
    activateFunctions[26] = blankSlide;
    activateFunctions[27] = blankSlide;
    activateFunctions[28] = blankSlide;
    activateFunctions[29] = blankSlide;
    activateFunctions[30] = blankSlide;
    activateFunctions[31] = blankSlide;
    activateFunctions[32] = blankSlide;
    activateFunctions[33] = blankSlide;
    activateFunctions[34] = blankSlide;
    activateFunctions[35] = blankSlide;
    activateFunctions[36] = blankSlide;


    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for(var i = 0; i < activateFunctions.length; i++) {
      updateFunctions[i] = function() {};
    }
    updateFunctions[3] = updateRecord;
    updateFunctions[4] = updateNational;
    updateFunctions[6] = updateNewspaper;
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

    $('#bridge-text').show();
    $('#bridge-text').fadeTo(500,1);
    $('.bridge-quote').hide().html('"Time for some traffic problems in Fort Lee."').fadeIn(1000);
    $('.bridge-attrib').hide().html("Bridget Anne Kelly, deputy chief of staff in Christie's office in an email to Port Authority executive David Wildstein.").fadeIn(1000);
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

    $('.bridge-quote').hide().html('"Chris Christie Drops Out of Presidential Race After New Hampshire Flop"').fadeIn(1000);
    $('.bridge-attrib').hide().html('Headline in The New York Times after Christie received only 7 percent of the vote in the New Hampshire primary and dropped out of the race.').fadeIn(1000);

    $('#bridge_illo').fadeTo(500,1);
    $('#bridge-text').show();
    $('#bridge-text').fadeTo(500,1);

    $('#vis').css("height", "80vh");

    g.selectAll(".square")
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

    $('#bridge-text').fadeTo(500,0).css("display", "none");
    $('#bridge_illo').hide();
    $('#vis').addClass('vis-small-container');

    $('#vis').css("height", "65vh");

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
      .duration(600)
      .attr("opacity", 1.0)
      .style("fill", "#e7472e");

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
      .duration(600)
      .attr("opacity", 1.0)
      .style("fill", "#e7472e");

    g.selectAll(".chart-hed")
      .transition()
      .duration(600)
      .text("National newspaper employees, 2000 and 2014");

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
    $('#sections').addClass('header-step');

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

    hideAxis();

    g.selectAll(".chart-key")
      .transition()
      .duration(0)
      .attr("opacity", 0.0);

    var totalLength = g.selectAll(".circulation-line").node().getTotalLength();

    g.selectAll(".circulation-line")
    .transition()
      .duration(0)
      .ease("linear")
      .attr("stroke-dashoffset", totalLength);
  }

  function showCirculation() {
    showAxis(xAxisLine1, yAxisLine1, 0);

    g.selectAll(".chart-hed")
      .text("Percent change in daily newspaper circulation, 2003-2015");

    g.selectAll(".chart-key")
      .transition()
      .duration(600)
      .attr("opacity", 1.0);

    g.selectAll(".chart-legend")
      .transition()
      .duration(600)
      .attr("opacity", 0);

    var totalLength = g.selectAll(".circulation-line").node().getTotalLength();

    g.selectAll(".circulation-line")
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
        .duration(1000)
        .ease("linear")
        .attr("stroke-dashoffset", 0)
        .attr("stroke-width", 5)
        .attr("fill", "none")
        .attr("stroke", "#e7472e");

  }

  function showCircRevenue () {

    g.selectAll(".chart-hed")
      .text("Percent change in newspaper circulation revenue, 2007-2015");

    var revenueDraw = d3.svg.line()
      .x(function(d) { return xLineScale2(d.year); })
      .y(function(d) { return yLineScale2(d.circulation); })
      .defined(function(d) { return !isNaN(d.circulation); });

    g.selectAll(".circulation-line")
      .transition()
        .duration(1000)
        .attr("d", function(d) { return revenueDraw(d) });

    g.select(".x.axis")
      .transition()
        .duration(1000)
        .call(xAxisLine2);
    g.select(".y.axis")
      .transition()
        .duration(1000)
        .call(yAxisLine2);

  }

  function showAdRevenue () {

    g.selectAll(".chart-hed")
      .text("Percent change in newspaper advertising revenue, 2007-2015");

    var revenueDraw1 = d3.svg.line()
      .x(function(d) { return xLineScale2(d.year); })
      .y(function(d) { return yLineScale2(d.advertising); })
      .defined(function(d) { return !isNaN(d.advertising); });

    g.selectAll(".circulation-line")
      .transition()
        .duration(1000)
        .attr("d", function(d) { return revenueDraw1(d) });
  }

  function showPapersClosed () {

    hideAxis();

    g.selectAll(".chart-key")
      .transition()
      .duration(0)
      .attr("opacity", 0.0);

    var totalLength = g.selectAll(".circulation-line").node().getTotalLength();

    g.selectAll(".circulation-line")
    .transition()
      .duration(0)
      .ease("linear")
      .attr("stroke-dashoffset", totalLength);

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

  /**
   * UPDATE FUNCTIONS
   *
   * These will be called within a section
   * as the user scrolls through it.
   *
   * We use an immediate transition to
   * update visual elements based on
   * how far the user has scrolled
   *
   */

  /**
   * @param progress - 0.0 - 1.0 -
   *  how far user has scrolled in section
   */

   function updateRecord(progress) {
     if (progress > 0.5) {
       g.selectAll(".record-after")
         .transition("record")
         .duration(0)
         .style("fill", "#7a3a30");
     }
   }

   function updateNational(progress) {
     if (progress > 0.5) {
       g.selectAll(".national-after")
         .transition("national")
         .duration(0)
         .style("fill", "#7a3a30");
     }
   }

    function updateNewspaper(progress) {
      var negativeProgress = 1-(progress);
      $('#newspaper_illo').css('transform', 'scale('+ negativeProgress + ')');
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
  chart.activate = function(index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function(i) {
      activateFunctions[i]();
      // changes highlighted circle
      $('.active-circle').removeClass('active-circle');
      $('#circle-' + (i+1)).addClass('active-circle');
      $('.step').removeClass('fixed').fadeTo(0);
      $('#step' + (i+1)).addClass('fixed').fadeTo(100);
    });
    lastIndex = activeIndex;
  };

  /**
   * setOtherData - brings in all data except the first file
   * @param other - array of some other data you want to use
   */

  chart.setOtherData = function(employeeLine, circulation) {
    employeeLineData = employeeLine;
    circulationData = circulation;
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
function display(error, employeeSquares, employeeLine, circulation) {
  // create a new plot and
  // display it
  var plot = scrollVis();
  plot.setOtherData(employeeLine, circulation);
  d3.select("#vis")
    .datum(employeeSquares)
    .call(plot);

  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('#graphic'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  // setup event handling
  scroll.on('active', function(index) {
    // highlight current step text
    d3.selectAll('.step')
      .transition()
      .duration(100)
      .style('opacity',  function(d,i) { return i == index ? 1 : 0; });

    // activate current section
    plot.activate(index);
  });

  scroll.on('progress', function(index, progress){
    plot.update(index, progress);
  });
}

// load data and display
queue()
.defer(d3.csv, "data/employees_intro.csv")
.defer(d3.csv, "data/national_employees_intro.csv")
.defer(d3.csv, "data/circulation.csv")
.await(display);
