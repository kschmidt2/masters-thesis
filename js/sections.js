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

  var xLineScale = d3.scale.linear()
    .range([0, width]);

  var yLineScale = d3.scale.linear()
    .range([height, 0]);

  var xAxisLine = d3.svg.axis()
    .scale(xLineScale)
    .ticks(20)
    .tickFormat(function (d) { return d; })
    .innerTickSize(5)
    .orient("bottom");

  var yAxisLine = d3.svg.axis()
    .scale(yLineScale)
    .tickFormat(function(d) { return d.toLocaleString();})
    .ticks(5)
    .orient("left");

  // We will set the domain when the
  // data is processed.
  var xBarScale = d3.scale.linear()
    .range([0, width]);

  // The bar chart display is horizontal
  // so we can use an ordinal scale
  // to get width and y locations.
  var yBarScale = d3.scale.ordinal()
    .domain([0,1,2])
    .rangeBands([0, height - 50], 0.1, 0.1);

  // Color is determined just by the index of the bars
  var barColors = {0: "#008080", 1: "#399785", 2: "#5AAF8C"};

  // The histogram display shows the
  // first 30 minutes of data
  // so the range goes from 0 to 30
  var xHistScale = d3.scale.linear()
    .domain([0, 30])
    .range([0, width - 20]);

  var yHistScale = d3.scale.linear()
    .range([height, 0]);

  // The color translation uses this
  // scale to convert the progress
  // through the section into a
  // color value.
  var squareColorScale = d3.scale.linear()
    .domain([0,0.4])
    .range(["#e7472e", "#e5e2ca"]);

  // You could probably get fancy and
  // use just one axis, modifying the
  // scale, but I will use two separate
  // ones to keep things easy.
  var xAxisBar = d3.svg.axis()
    .scale(xBarScale)
    .orient("bottom");

  var xAxisHist = d3.svg.axis()
    .scale(xHistScale)
    .orient("bottom")
    .tickFormat(function(d) { return d + " min"; });

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
      console.log('employeeLineData', employeeLineData);
      // create svg and give it a width and height
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

      // perform some preprocessing on raw data
      var squareData = getSquares(rawData);

      employeeLineData.forEach(function(d){
        d.year = +d.year;
        d.total = +d.total;
        return d;
      });

      // line chart domain
      var employeeLineMax = d3.max(employeeLineData, function (d) { return d.total });
      yLineScale.domain([30000,employeeLineMax])
      xLineScale.domain(d3.extent(employeeLineData, function(d) { return d.year }));

      setupVis(squareData, employeeLineData);

      setupSections();

    });
  };


  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   * @param wordData - data object for each word.
   * @param fillerCounts - nested data that includes
   *  element for each filler word type.
   * @param histData - binned histogram data
   */
  setupVis = function(squareData, employeeLineData) {

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
    activateFunctions[7] = showCough;
    // activateFunctions[8] = showHistAll;

    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for(var i = 0; i < 9; i++) {
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
   * showTitle - initial title
   *
   * hides: count title
   * (no previous step to hide)
   * shows: intro title
   *
   */
  function showBridge() {
    $('#bridge-text').fadeTo(500,0).css("display", "none");
    $('.active-circle').removeClass('active-circle');
    $('#circle-1').addClass('active-circle');
  }

  /**
   * showFillerTitle - filler counts
   *
   * hides: intro title
   * hides: square grid
   * shows: filler count title
   *
   */
  function showBridgeQuote() {
    $('.active-circle').removeClass('active-circle');
    $('#circle-2').addClass('active-circle');

    $('#bridge-text').show();
    $('#bridge-text').fadeTo(500,1);
    $('.bridge-quote').hide().html('"Time for some traffic problems in Fort Lee."').fadeIn(1000);
    $('.bridge-attrib').hide().html("Bridget Anne Kelly, deputy chief of staff in Christie's office in an email to Port Authority executive David Wildstein.").fadeIn(1000);
  }

  /**
   * showGrid - square grid
   *
   * hides: filler count title
   * hides: filler highlight in grid
   * shows: square grid
   *
   */
  function showBridgeQuote2() {
    $('.active-circle').removeClass('active-circle');
    $('#circle-3').addClass('active-circle');
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
   * highlightGrid - show fillers in grid
   *
   * hides: barchart, text and axis
   * shows: square grid and highlighted
   *  filler words. also ensures squares
   *  are moved back to their place in the grid
   */
  function showRecord() {
    $('.active-circle').removeClass('active-circle');
    $('#circle-4').addClass('active-circle');

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
   * showBar - barchart
   *
   * hides: square grid
   * hides: histogram
   * shows: barchart
   *
   */
  function showNational() {
    $('.active-circle').removeClass('active-circle');
    $('#circle-5').addClass('active-circle');

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
   * showHistPart - shows the first part
   *  of the histogram of filler words
   *
   * hides: barchart
   * hides: last half of histogram
   * shows: first half of histogram
   *
   */
  function showNationalTrend() {
    $('.active-circle').removeClass('active-circle');
    $('#circle-6').addClass('active-circle');
    // switch the axis to histogram one

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
    // showAxis(yLineAxis);

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
    $('#header').removeClass('fixed');

  }

  /**
   * showHistAll - show all histogram
   *
   * hides: cough title and color
   * (previous step is also part of the
   *  histogram, so we don't have to hide
   *  that)
   * shows: all histogram bars
   *
   */
  function showNewspaper() {
    $('.active-circle').removeClass('active-circle');
    $('#circle-7').addClass('active-circle');

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

  }

  /**
   * showCough
   *
   * hides: nothing
   * (previous and next sections are histograms
   *  so we don't have to hide much here)
   * shows: histogram
   *
   */
  function showCough() {
    $('#newspaper_illo').fadeTo(500,0).hide();
    $('#header').removeClass('fixed');

    g.selectAll(".hist")
      .transition()
      .duration(600)
      .attr("y", function(d) { return yHistScale(d.y); })
      .attr("height", function(d) { return  height - yHistScale(d.y);  })
      .style("opacity", 1.0);
  }

  /**
   * showAxis - helper function to
   * display particular xAxis
   *
   * @param axis - the axis to show
   *  (xAxisHist or xAxisBar)
   */
  function showAxis(xAxis, yAxis, delay) {
    console.log("show axis");
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
    console.log("hide axis");
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
   * updateCough - increase/decrease
   * cough text and color
   *
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
      $('#header').addClass('fixed');
    }

  /**
   * DATA FUNCTIONS
   *
   * Used to coerce the data into the
   * formats we need to visualize
   *
   */

  /**
   * getWords - maps raw data to
   * array of data objects. There is
   * one data object for each word in the speach
   * data.
   *
   * This function converts some attributes into
   * numbers and adds attributes used in the visualization
   *
   * @param rawData - data read in from file
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

  // function getEmployeeLine(d) {
  //     d.total = +d.total;
  //     d.year = +d.year;
  //     return d;
  // }

  /**
   * getFillerWords - returns array of
   * only filler words
   *
   * @param data - word data from getWords
   */
  function getFillerWords(data) {
    return data.filter(function(d) {return d.filler; });
  }

  /**
   * getHistogram - use d3's histogram layout
   * to generate histogram bins for our word data
   *
   * @param data - word data. we use filler words
   *  from getFillerWords
   */
  function getHistogram(data) {
    // only get words from the first 30 minutes
    var thirtyMins = data.filter(function(d) { return d.min < 30; });
    // bin data into 2 minutes chuncks
    // from 0 - 31 minutes
    return d3.layout.histogram()
      .value(function(d) { return d.min; })
      .bins(d3.range(0,31,2))
      (thirtyMins);
  }

  /**
   * groupByWord - group words together
   * using nest. Used to get counts for
   * barcharts.
   *
   * @param words
   */
  function groupByWord(words) {
    return d3.nest()
      .key(function(d) { return d.word; })
      .rollup(function(v) { return v.length; })
      .entries(words)
      .sort(function(a,b) {return b.values - a.values;});
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
    });
    lastIndex = activeIndex;
  };

  /**
   * setOtherData -
   * this setter can be more complicated - and can even take in
   * more then one data set - but we can start with just this
   * to minimize changes in the code.
   * @param other - array of some other data you want to use
   */

  chart.setOtherData = function(employeeLine) {
    employeeLineData = employeeLine;
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
 * @param data - loaded tsv data
 */
function display(error, employeeSquares, employeeLine) {
  // create a new plot and
  // display it
  var plot = scrollVis();
  plot.setOtherData(employeeLine);
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

// function display1(data) {
//   // create a new plot and
//   // display it
//   var plot = scrollVis();
//   d3.select("#vis")
//     .datum(data)
//     .call(plot);
// }

// load data and display
// d3.tsv("data/words.tsv", display);

// d3.csv("data/employees_intro.csv", display)
// d3.csv("data/national_employees_intro.csv", display1)

queue()
.defer(d3.csv, "data/employees_intro.csv")
.defer(d3.csv, "data/national_employees_intro.csv")
.await(display);
