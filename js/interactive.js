function buildMap (){

  // gets map data
  var mapFile = "data/state_reporters.csv";
  d3.csv(mapFile,
      function(d) {
          return {
              state: d.state,
              reporters: +d.reporters,
              legislators: +d.legislators,
              per_ten_legislators: +d.per_ten_legislators,
              total: +d.total
          };
      },
      function(error, data) {
              if (error != null) {
                  console.log("Uh-oh, something went wrong. Try again?");
              } else {

                  var usadata = d3.nest()
                    .rollup(function(v) {
                     return {
                       total: d3.sum(v, function(d) {return d.total; }),
                       full_time: d3.sum(v, function(d) {return d.reporters; }),
                       legis: d3.sum(v, function(d) {return d.legislators; })
                     };
                    }).entries(data);

                  map_data(data, usadata)
              }


      });

      var map_data = function(data, usadata) {

        // hover info for USA
        function usaInfo() {
          $("#state-name").html('<strong>United States</strong>');
          var usaDetails = "Total statehouse reporters, 2014: <span class='teal'>" + usadata.total.toLocaleString();
          usaDetails += "</span></br>Full-time statehouse reporters, 2014: <span class='teal'>" + usadata.full_time.toLocaleString();
          usaDetails += "</span></br>Full-time statehouse reporters per ten legislators, 2014: <span class='teal'>" + ((usadata.legis/10)/usadata.full_time).toLocaleString();
          $("#state-info").html(usaDetails);
        };

        usaInfo();

        var series = data;
        var dataset = {};

        var onlyValues = series.map(function(d){ return d.per_ten_legislators; });
        var minValue = Math.min.apply(null, onlyValues),
            maxValue = Math.max.apply(null, onlyValues);

        var paletteScale = d3.scale.linear()
            .domain([minValue,maxValue])
            .range(["#e5e2ca","#52908b"]);

        series.forEach(function(d){
            var iso = d.state,
                value = d.per_ten_legislators;
                dataset[iso] = { numberOfThings: value, fillColor: paletteScale(value) };
        });

        // hover info
        function infoBox(selectState) {
          series.forEach(function(d){
            if (d.state == selectState) {
              var stateDetails = "Total statehouse reporters, 2014: <span class='teal'>" + d.total;
              stateDetails += "</span></br>Full-time statehouse reporters, 2014: <span class='teal'>" + d.reporters;
              stateDetails += "</span></br>Full-time statehouse reporters per ten legislators, 2014: <span class='teal'>" + d.per_ten_legislators;
              $("#state-info").html(stateDetails);
            }
          });
        };

        // creates map
        var map = new Datamap({
            element: document.getElementById('usmap'),
            scope: 'usa',
            fills: { defaultFill: '#FFF' },
            data: dataset,
            responsive: true,
            geographyConfig: {
              borderColor: '#323232',
              highlightBorderWidth: 1,
              highlightBorderColor: '#323232',
              highlightFillColor: "white",
            },
            done: function(datamap) {
            datamap.svg.selectAll('.datamaps-subunit').on('mouseover', function(geography){
              $this = this;
              $(this).css('opacity', '0.4');
              $(this).removeClass('datamaps-subunit');
              var stateClass = $(this).attr('class');
              var enterState = '<div class="sf sf-' + stateClass.toLowerCase() + '"></div> <strong>' + geography.properties.name + '</strong>';
              $('#state-name').html(enterState);
              infoBox(stateClass);
            }).on('mouseleave', function(){
              $('.datamaps-subunits').children().css('opacity', '1.0');
              usaInfo();
              $('#state-name').html("<strong>United States</strong>");
            });
          }
        });

        $(window).on('resize', function() {
           map.resize();
        });
      }
}

buildMap();

// creates states dropdown
var dropDown = d3.selectAll("#state-menu li");

dropDown.on("click", function() {
  $this = this;
  currentState = $(this).text();
  var stateClass = currentState.replace(/\s+/g, '-');
  updateData(currentState, stateClass);
});

// function dropClick(d) {
//   $this = $this;
//   currentState = $this.text();
//   console.log($this);
//   var selectedValue = d3.event.target.value;
//
//   console.log(d);
// }

  // bar chart setup
  var width = 300;
  var height = 120;
  var margin = {top:20, left:0, bottom:0, right:0};

  var y0 = d3.scale.ordinal()
      .rangeBands([0, height], .2);

  var y1 = d3.scale.ordinal();

  var x = d3.scale.linear()
      .range([0, width-40]);

  var x1 = d3.scale.linear()
      .range([0, width-40]);

  // create responsive svg
  var svg = d3.select("#state-bars")
  .append("div")
    .classed("svg-container-state", true) //container class to make it responsive
    .append("svg")
    //responsive SVG needs these 2 attributes and no width and height attr
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 300 200")
    //class to make it responsive
    .classed("svg-content-responsive", true)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // create responsive svg
  var svg2 = d3.select("#state-bars-2")
  .append("div")
    .classed("svg-container-state", true) //container class to make it responsive
    .append("svg")
    //responsive SVG needs these 2 attributes and no width and height attr
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 300 200")
    //class to make it responsive
    .classed("svg-content-responsive", true)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // loads data for bar charts
  function loadData() {
    d3.csv("data/newspaper_interactive.csv", function (error, data){
      if (error) throw error;

        var newspaperData = d3.nest()
        .key(function(d) { return d.rucc;})
        .sortKeys(d3.ascending)
        .key(function(d) { return d.year;})
          .rollup(function(v) {
            return  v.length; })
        .entries(data);

        var circData = d3.nest()
        .key(function(d) { return d.rucc; })
        .sortKeys(d3.ascending)
        .key(function(d) { return d.year; })
          .rollup(function(v) {
            return d3.sum(v, function(d) {return d.total_circulation; })
          }).entries(data);

        y0.domain([0,1,2]);
        y1.domain([0,1]).rangeBands([0, y0.rangeBand()]);
        x.domain([0, d3.max(newspaperData, function(d) { return d3.max(d.values, function(d) { return d.values; }); })]);
        x1.domain([0, d3.max(circData, function(d) { return d3.max(d.values, function(d) { return d.values; }); })]);

        svg.append("text")
          .attr("class", "interactive-chart-hed")
          .attr("x", 0)
          .attr("y", -8)
          .text("Total newspapers, 2004 and 2016")
          .style("font-weight", 400);

        var g = svg.append("g")
          .selectAll("g")
          .data(newspaperData)
          .enter().append("g")
            .attr("class", "newspaper-group")
            .attr("transform", function(d,i) { return "translate(0," + y0(i) + ")"; });
          var rect = g.selectAll("rect")
          .data(function(d) { return d.values; })
          .enter().append("rect")
            .attr("class", function(d) { return "newspaper-bars bar-" + d.key;})
            .attr("x", 40)
            .attr("y", function(d,i) { return y1(i); })
            .attr("width", function(d) { return x(d.values); })
            .attr("height", y1.rangeBand());

        svg.selectAll(".news-bar-text")
          .data(newspaperData)
          .enter()
          .append("text")
          .attr("class", "news-bar-text")
          .text(function(d) { return d.key; })
          .attr("x", 0)
          .attr("dx", 32)
          .attr("y", function(d,i) { return y0(i) + 3;})
          .attr("dy", y1.rangeBand() / 1.5)
          .style("font-size", "12px")
          .attr("text-anchor", "end");

        svg.selectAll(".news-bar-text-2")
          .data(newspaperData)
          .enter()
          .append("text")
          .attr("class", "news-bar-text-2")
          .text(function(d) {
            if (d.key=="rural") {
              return "area";
            } else {
              return "metro";
            }
          })
          .attr("x", 0)
          .attr("dx", 32)
          .attr("y", function(d,i) { return y0(i) + 17;})
          .attr("dy", y1.rangeBand() / 1.5)
          .style("font-size", "12px")
          .attr("text-anchor", "end");

        g.selectAll(".news-bar-number")
          .data(function(d) { return d.values; })
          .enter()
          .append("text")
          .attr("class", "news-bar-number")
          .text(function(d) { return (d.values).toLocaleString(); })
          .attr("x",function(d) { return x(d.values) + 20 })
          .attr("dx", 15)
          .attr("y", function(d,i) { return y1(i);})
          .attr("dy", y1.rangeBand() / 1.2)
          .style("font-size", "12px")
          .style("font-weight", 700)
          .style("fill", "#323232")
          .attr("text-anchor", "end");

        svg2.append("text")
          .attr("class", "interactive-chart-hed")
          .attr("x", 0)
          .attr("y", -8)
          .text("Total circulation, 2004 and 2016")
          .style("font-weight", 400);

        var g2 = svg2.append("g")
          .selectAll(".circ-g")
          .data(circData)
          .enter().append("g")
            .attr("class", "circ-g")
            .attr("transform", function(d,i) { return "translate(0," + y0(i) + ")"; });
          var rect2 = g2.selectAll(".newspaper-circ-bars")
          .data(function(d) { return d.values; })
          .enter().append("rect")
            .attr("class", function(d) { return "newspaper-circ-bars bar-" + d.key;})
            .attr("x", 40)
            .attr("y", function(d,i) { return y1(i); })
            .attr("width", function(d) { return x1(d.values); })
            .attr("height", y1.rangeBand());

        svg2.selectAll(".news-circ-text")
          .data(circData)
          .enter()
          .append("text")
          .attr("class", "news-circ-text")
          .text(function(d) { return d.key; })
          .attr("x", 0)
          .attr("dx", 32)
          .attr("y", function(d,i) { return y0(i) + 3;})
          .attr("dy", y1.rangeBand() / 1.5)
          .style("font-size", "12px")
          .attr("text-anchor", "end");

        svg2.selectAll(".news-circ-text-2")
          .data(circData)
          .enter()
          .append("text")
          .attr("class", "news-circ-text-2")
          .text(function(d) {
            if (d.key=="rural") {
              return "area";
            } else {
              return "metro";
            }
          })
          .attr("x", 0)
          .attr("dx", 32)
          .attr("y", function(d,i) { return y0(i) + 17;})
          .attr("dy", y1.rangeBand() / 1.5)
          .style("font-size", "12px")
          .attr("text-anchor", "end");

        g2.selectAll(".news-circ-number")
          .data(function(d) { return d.values; })
          .enter()
          .append("text")
          .attr("class", "news-circ-number")
          .text(function(d) { return ((d.values)/1000000).toFixed(1) + "M"; })
          .attr("x",function(d) { return x1(d.values) + 20 })
          .attr("dx", 15)
          .attr("y", function(d,i) { return y1(i);})
          .attr("dy", y1.rangeBand() / 1.2)
          .style("font-size", "12px")
          .style("font-weight", 700)
          .style("fill", "#323232")
          .attr("text-anchor", "end");

    })
  }

loadData();

// updates data on dropdown change
function updateData(selectState, stateClass) {

  var enterState = '<div class="sf sf-' + stateClass.toLowerCase() + '"></div> <strong>' + selectState + '</strong>';

  $('#state-name-2').html(enterState);
  $('#table-state').html(selectState);

  function loadData(selectState) {
    d3.csv("data/newspaper_interactive.csv", function (error, data){
      if (error) throw error;
      var newspaperData = d3.nest()
      .key(function(d) { return d.rucc;})
      .sortKeys(d3.ascending)
      .key(function(d) { return d.year;})
        .rollup(function(v) {
          return  v.length; })
      .entries(data);

      var circData = d3.nest()
      .key(function(d) { return d.rucc; })
      .sortKeys(d3.ascending)
      .key(function(d) { return d.year; })
        .rollup(function(v) {
          return d3.sum(v, function(d) {return d.total_circulation; })
        }).entries(data);

      if (selectState !== "United States") {

        data = data.filter(function (d) {return d.state_full == selectState});

        var newspaperData = d3.nest()
        .key(function(d) { return d.rucc;})
        .sortKeys(d3.ascending)
        .key(function(d) { return d.year;})
          .rollup(function(v) {
            return  v.length; })
        .entries(data);

        var circData = d3.nest()
        .key(function(d) { return d.rucc; })
        .key(function(d) { return d.year; })
          .rollup(function(v) {
            return d3.sum(v, function(d) {return d.total_circulation; })
          }).entries(data);

        }

        x.domain([0, d3.max(newspaperData, function(d) { return d3.max(d.values, function(d) { return d.values; }); })]);
        x1.domain([0, d3.max(circData, function(d) { return d3.max(d.values, function(d) { return d.values; }); })]);

        var groups = svg.selectAll(".newspaper-group")
        .data(newspaperData);

        groups.selectAll(".newspaper-bars")
          .data(function(d) { return d.values })
            .transition()
            .delay(function(d,i) { return 100 * (i + 1);})
            .duration(600)
            .attr("width", function(d) { return x(d.values); });

        groups.selectAll(".news-bar-number")
          .data(function(d) { return d.values; })
          .transition()
          .delay(function(d,i) { return 100 * (i + 1);})
          .duration(600)
          .text(function(d) { return (d.values).toLocaleString(); })
          .attr("x",function(d) { return x(d.values) + 20 });

        var groups2 = svg2.selectAll(".circ-g")
        .data(circData);

        groups2.selectAll(".newspaper-circ-bars")
          .data(function(d) { return d.values })
            .transition()
            .delay(function(d,i) { return 100 * (i + 1);})
            .duration(600)
            .attr("width", function(d) { return x1(d.values); });

        groups2.selectAll(".news-circ-number")
          .data(function(d) { return d.values; })
          .transition()
          .delay(function(d,i) { return 100 * (i + 1);})
          .duration(600)
          .text(function(d) {
            if(selectState == "United States") {
              return ((d.values)/1000000).toFixed(1) + "M";
            } else {
              return (d.values).toLocaleString();
            }
          })
          .attr("x",function(d) {
            if (x1(d.values) < 100) {
              return x1(d.values) + 80
            } else {
              return x1(d.values) + 20
            }})
           .style("fill", function(d) {
             if (x1(d.values) < 100) {
               return "white"
             } else {
               return "#323232"
             }});
      })
    }

    loadData(selectState);

}
