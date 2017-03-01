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
  var height = 400;
  var margin = {top:0, left:40, bottom:0, right:40};

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
    .range(["#5d3548", "#e5e2ca"]);

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
      // create svg and give it a width and height
    svg = d3.select(this)
      .append("div")
      .classed("svg-container", true) //container class to make it responsive
      .selectAll("svg")
      .data([squareData]);
      svg.enter().append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 885 600")
        .classed("svg-content-responsive", true) //class to make it responsive
        .append("g")
        .classed("main-g", true);

      // this group element will be used to contain all
      // other elements.
      g = svg.select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // perform some preprocessing on raw data
      var squareData = getSquares(rawData);
      // filter to just include filler words
      // var fillerWords = getFillerWords(wordData);

      // get the counts of filler words for the
      // bar chart display
      // var fillerCounts = groupByWord(fillerWords);
      // set the bar scale's domain
      // var countMax = d3.max(fillerCounts, function(d) { return d.values;});
      // xBarScale.domain([0,countMax]);

      // get aggregated histogram data
      // var histData = getHistogram(fillerWords);

      // set histogram's domain
      // var histMax = d3.max(histData, function(d) { return d.y; });
      // yHistScale.domain([0, histMax]);

      setupVis(squareData);

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
  setupVis = function(squareData) {
    // axis
    g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisBar);
    g.select(".x.axis").style("opacity", 0);

    // square grid
    var squares = g.selectAll(".square").data(squareData);
    squares.enter()
      .append("rect")
      .attr("width", squareSize)
      .attr("height", squareSize)
      .attr("fill", "#5d3548")
      .classed("square", true)
      .classed("record-before", function(d) { return d.record_before; })
      .classed("record-after", function(d) { return d.record_after; })
      .classed("national-after", function(d) { return d.national_after; })
      .attr("x", function(d) { return d.x;})
      .attr("y", function(d) { return d.y;})
      .attr("opacity", 0);

    // barchart
    // var bars = g.selectAll(".bar").data(fillerCounts);
    // bars.enter()
    //   .append("rect")
    //   .attr("class", "bar")
    //   .attr("x", 0)
    //   .attr("y", function(d,i) { return yBarScale(i);})
    //   .attr("fill", function(d,i) { return barColors[i]; })
    //   .attr("width", 0)
    //   .attr("height", yBarScale.rangeBand());
    //
    // var barText = g.selectAll(".bar-text").data(fillerCounts);
    // barText.enter()
    //   .append("text")
    //   .attr("class", "bar-text")
    //   .text(function(d) { return d.key + "…"; })
    //   .attr("x", 0)
    //   .attr("dx", 15)
    //   .attr("y", function(d,i) { return yBarScale(i);})
    //   .attr("dy", yBarScale.rangeBand() / 1.2)
    //   .style("font-size", "110px")
    //   .attr("fill", "white")
    //   .attr("opacity", 0);
    //
    // // histogram
    // var hist = g.selectAll(".hist").data(histData);
    // hist.enter().append("rect")
    //   .attr("class", "hist")
    //   .attr("x", function(d) { return xHistScale(d.x); })
    //   .attr("y", height)
    //   .attr("height", 0)
    //   .attr("width", xHistScale(histData[0].dx) - 1)
    //   .attr("fill", barColors[0])
    //   .attr("opacity", 0);
    //
    // // cough title
    // g.append("text")
    //   .attr("class", "sub-title cough cough-title")
    //   .attr("x", width / 2)
    //   .attr("y", 60)
    //   .text("cough")
    //   .attr("opacity", 0);
    //
    // // arrowhead from
    // // http://logogin.blogspot.com/2013/02/d3js-arrowhead-markers.html
    // svg.append("defs").append("marker")
    //   .attr("id", "arrowhead")
    //   .attr("refY", 2)
    //   .attr("markerWidth", 6)
    //   .attr("markerHeight", 4)
    //   .attr("orient", "auto")
    //   .append("path")
    //   .attr("d", "M 0,0 V 4 L6,2 Z");
    //
    // g.append("path")
    //   .attr("class", "cough cough-arrow")
    //   .attr("marker-end", "url(#arrowhead)")
    //   .attr("d", function() {
    //     var line = "M " + ((width / 2) - 10) + " " + 80;
    //     line += " l 0 " + 230;
    //     return line;
    //   })
    //   .attr("opacity", 0);
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

    g.selectAll(".record-before")
      .transition()
      .duration(600)
      .attr("opacity", 1.0)
      .style("fill", "#5d3548");

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
      .style("fill", "#5d3548");
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
    showAxis(xAxisHist);

    g.selectAll(".bar-text")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".bar")
      .transition()
      .duration(600)
      .attr("width", 0);

    $('#newspaper_illo').fadeTo(500,0).hide();
    $('#header').removeClass('fixed');

    // here we only show a bar if
    // it is before the 15 minute mark
    g.selectAll(".hist")
      .transition()
      .duration(600)
      .attr("y", function(d) { return (d.x < 15) ? yHistScale(d.y) : height; })
      .attr("height", function(d) { return (d.x < 15) ? height - yHistScale(d.y) : 0;  })
      .style("opacity", function(d,i) { return (d.x < 15) ? 1.0 : 1e-6; });
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

    g.selectAll(".hist")
      .transition()
      .duration(600)
      .attr("height", function(d) { return  0; })
      .attr("y", function(d) { return  height; })
      .style("opacity", 0);

    g.selectAll(".cough")
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

    // ensure the axis to histogram one
    showAxis(xAxisHist);

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
  function showAxis(axis) {
    g.select(".x.axis")
      .call(axis)
      .transition().duration(500)
      .style("opacity", 1);
  }

  /**
   * hideAxis - helper function
   * to hide the axis
   *
   */
  function hideAxis() {
    g.select(".x.axis")
      .transition().duration(500)
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
     if (progress <= 0.4) {
       g.selectAll(".record-after")
         .transition("record")
         .duration(0)
         .style("fill", squareColorScale(progress));
     }
   }

   function updateNational(progress) {
     if (progress <= 0.4) {
       g.selectAll(".national-after")
         .transition("national")
         .duration(0)
         .style("fill", squareColorScale(progress));
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
function display(data) {
  // create a new plot and
  // display it
  var plot = scrollVis();
  d3.select("#vis")
    .datum(data)
    .call(plot);

    console.log(data);

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
// d3.tsv("data/words.tsv", display);

d3.csv("data/employees_intro.csv", display)
