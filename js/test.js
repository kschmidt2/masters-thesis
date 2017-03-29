(function() {
    var swipeadoohickey = new Swiper(".swiper-container", {
        direction: "vertical",
        pagination: ".swiper-pagination",
        keyboardControl: true,
        simulateTouch: true,
        threshold: 20,
        hashnav: true,
        speed: 700,
        scrollbarHide: true,
        touchAngle: 45,
        onInit: function() {},
        onTap: function() {
            swipeadoohickey.slideNext()
        },
        onSlideChangeEnd: function() {
            swipeadoohickey.updateClasses();
            flushAnimationFrames()
        },
        onReachEnd: function() {}
    });

    function keydown() {
        switch (d3.event.keyCode) {
            case 39:
                swipeadoohickey.slideNext();
                break;
            case 34:
                swipeadoohickey.slideNext();
                break;
            case 37:
                swipeadoohickey.slidePrev();
                break;
            case 33:
                swipeadoohickey.slidePrev();
                break;
            case 32:
                swipeadoohickey.slideNext();
                break;
                break
        }
    }
    d3.select(window).on("keydown", keydown);
    String.prototype.toProperCase = function() {
        return this.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        })
    };
    var callbacks = [];
    var requestAnimationFrame = function(callback) {
        callbacks.push(callback)
    };
    var flushAnimationFrames = function() {
        var now = Date.now;
        Date.now = function() {
            return Infinity
        };
        callbacks.forEach(function(callback) {
            try {
                callback()
            } catch (e) {
                console.error(e)
            }
        });
        callbacks = [];
        Date.now = now
    };

    function endall(transition, callback) {
        if (transition.size() === 0) {
            callback()
        }
        var n = 0;
        transition.each(function() {
            ++n
        }).each("end", function() {
            if (!--n) callback.apply(this, arguments)
        })
    }
    var pct = d3.format("%"),
        svg, width, height, xAxis, yAxis, g_xAxis, g_yAxis, y_midpoint, pinellas, basemap, transitional_map, county_bars, school_circles, legendLinear;
    var state_data = {
        2009: 62,
        2010: 62,
        2011: 62,
        2008: 60,
        2006: 57,
        2004: 52,
        2013: 58,
        2005: 53,
        2007: 57,
        2012: 57,
        2014: 58
    };

    function checkBrowser() {
        var search_chrome = navigator.userAgent.search("Chrome");
        var search_firefox = navigator.userAgent.search("Firefox");
        var search_m8 = navigator.userAgent.search("MSIE 8.0");
        var search_m9 = navigator.userAgent.search("MSIE 9.0");
        var search_safari = navigator.userAgent.search("Safari");
        var brwsr;
        if (search_chrome > -1) {
            brwsr = "Chrome"
        }
        if (search_safari > -1) {
            brwsr = "Safari"
        } else if (search_firefox > -1) {
            brwsr = "Firefox"
        } else if (search_m9 > -1) {
            brwsr = "MSIE 9.0"
        } else if (search_m8 > -1) {
            brwsr = "MSIE 8.0"
        }
        return brwsr
    }
    var mobile = window.innerWidth < 660;
    var med = !mobile && window.innerWidth < 975;
    var browser = checkBrowser();
    var chrome = browser === "Chrome";
    var ff = browser === "Firefox";
    var safari = browser === "Safari";
    if (ff || safari) {
        swipeadoohickey.disableMousewheelControl()
    }
    var mobile = window.innerWidth < 660;
    var med = !mobile && window.innerWidth < 975;
    var browser = checkBrowser();
    var ff = browser === "Firefox";
    var margin;
    if (mobile) {
        margin = {
            top: 150,
            right: 35,
            bottom: 5,
            left: 20
        }
    } else if (med) {
        margin = {
            top: 200,
            right: 60,
            bottom: 150,
            left: 80
        }
    } else {
        margin = {
            top: 100,
            right: 80,
            bottom: 150,
            left: 80
        }
    }
    var kid_path = "M-42.2,27c0.6,0.8,1.7,1.1,2.5,1.1s1.7-0.4,2.5-1.1c1.5-1.3,1.5-3.6,0.2-5.1l-8.9-9.6c1.3-1.3,2.1-3.2,2.1-5.1c0-3.8-3.2-7.2-7.2-7.2s-7.2,3.2-7.2,7.2c0,2.1,0.8,3.8,2.3,5.1l-9.1,9.4c-1.5,1.5-1.3,3.6,0,5.1c1.5,1.3,3.6,1.3,5.1,0l4-4.2v7l-8.5,14.9c-1.1,1.7-0.4,3.8,1.3,4.9c1.7,1.1,3.8,0.4,4.9-1.3l7.2-12.5l6.8,12.3c0.6,1.3,1.9,1.9,3.2,1.9c0.6,0,1.3-0.2,1.7-0.4c1.7-1.1,2.4-3.2,1.5-4.9l-8.5-15.1v-6.8L-42.2,27z";
    var color;
    queue().defer(d3.json, "data/florida-counties_nerfed.json").defer(d3.json, "data/attendance_zones.json").defer(d3.csv, "data/pass_both_districts.csv").defer(d3.csv, "data/all_pinellas_schools.csv").defer(d3.csv, "data/passbothELEM.csv").await(ready);
    var x, y;
    var yearFormat = d3.time.format("%Y");

    function ready(error, fl_counties, attendance_zones, pass_both, pinellas_schools, schools_pass_both) {
        var school_years = _.uniq(_.pluck(pinellas_schools, "year"));
        school_years = school_years.map(Number).sort();
        var district_values, school_values;
        var schools = d3.nest().key(function(d) {
            return d.school
        }).entries(school_values = pinellas_schools);
        _.each(schools, function(d) {
            d.district_number = "52";
            _.each(d.values, function(b) {
                b.pct_black = +b.pct_black;
                b.reading = +b.reading;
                b.year = +b.year;
                b.rank_reading = +b.rank_reading;
                b.z_read = +b.z_read
            });
            d.values = _.sortBy(d.values, "year")
        });
        var outer_counties = topojson.feature(fl_counties, fl_counties.objects["florida-counties"]);
        var projection = d3.geo.albers();
        var path = d3.geo.path().projection(projection);
        projection.scale(1).rotate([96, 0, -10]).translate([0, 0]);
        var untouchable_path = d3.geo.path().projection(d3.geo.albers().scale(1).translate([0, 0]).rotate([96, 0, -10]));

        function set_projection(geometry, corner) {
            var window_width = window.innerWidth - margin.left - margin.right;
            mobile = window_width < 660;
            var window_height = height;
            var b = untouchable_path.bounds(geometry);
            var s = .95 / Math.max((b[1][0] - b[0][0]) / window_width, (b[1][1] - b[0][1]) / window_height),
                t = [(window_width - s * (b[1][0] + b[0][0])) / 2, (window_height - s * (b[1][1] + b[0][1])) / 2];
            if (corner) {
                s = .7 / Math.max((b[1][0] - b[0][0]) / (window_width * .5), (b[1][1] - b[0][1]) / (window_height * .5));
                t = [(window_width - s * (b[1][0] + b[0][0])) / 2, (window_height - s * (b[1][1] + b[0][1])) / 2]
            }
            projection.scale(s).translate(t)
        }
        set_projection(outer_counties, false);
        var counties = outer_counties.features;
        var school_zones = topojson.feature(attendance_zones, attendance_zones.objects.ElementaryZones2012_13_region);
        _.each(counties, function(d) {
            d.name = d.properties.COUNTY.split(" County")[0];
            d.properties.name = d.properties.COUNTY.split(" County")[0];
            d.properties.math_scores = [];
            d.properties.reading_scores = [];
            d.properties.state_diff_passing_math_scores = [];
            d.properties.state_diff_passing_reading_scores = [];
            d.county_name_upper = d.name.toUpperCase();
            var pass_both_score = _.findWhere(pass_both, {
                district: d.county_name_upper
            });
            if (pass_both_score) {
                d.properties.pass_both = pass_both_score
            } else {
                d.properties.path_both = {
                    pct_black_fail_one_or_more: "0"
                }
            }
        });
        pinellas = _.filter(counties, {
            name: "Pinellas"
        });
        counties = _.sortBy(counties, function(p) {
            return p.properties.pass_both.pct_black_fail_one_or_more
        });
        color = d3.scale.quantize().domain([.5, .86]).range(["276c91", "5c8496", "839c9a", "a7b49d", "c9cea0", "e8be74", "e0a466", "d78958", "cd6e4b", "c2513e", "b63132"]);
        var color_for_legend = d3.scale.quantize().domain([.5, .86]).range(["#276c91", "#5c8496", "#839c9a", "#a7b49d", "#c9cea0", "#e8be74", "#e0a466", "#d78958", "#cd6e4b", "#c2513e", "#b63132"]);
        x = d3.time.scale().range([0, width]);
        y = d3.scale.linear().rangeRound([height, 0]);
        var line = d3.svg.line().interpolate("linear").x(function(d) {
            return x(d.date)
        }).y(function(d) {
            return y(d.value)
        });
        var container = d3.select("#chart");
        stageonepositioning();
        width = window.innerWidth - margin.left - margin.right;
        var max_height = 1e3;
        height = window.innerHeight - margin.top - margin.bottom;
        svg = container.select_or_append("svg.graphic_box").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).select_or_append("g.graphic_container").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        function stopped() {
            if (d3.event.defaultPrevented) {
                d3.event.stopPropagation()
            }
        }
        var defs = svg.append("svg:defs");
        if (!mobile && !ff) {
            defs.append("pattern").attr("id", "white_chalk").attr("patternUnits", "userSpaceOnUse").attr("width", 256).attr("height", 256).append("image").attr("xlink:href", "images/chalk/chalk_f4f4f0.png").attr("x", 0).attr("y", 0).attr("width", 256).attr("height", 256);
            _.each(color.range(), function(d) {
                var pattern_id = "chalk_" + d;
                var base_url = "images/chalk/";
                var full_url = base_url + d + ".png";
                defs.append("pattern").attr("id", pattern_id).attr("patternUnits", "userSpaceOnUse").attr("width", 256).attr("height", 256).style("fill", "#000").style("fill-opacity", .6).append("image").attr("xlink:href", full_url).attr("x", 0).attr("y", 0).attr("width", 256).attr("height", 256)
            })
        }
        var g_counties = svg.select_or_append("g.counties");
        var g_schools;
        var t = svg.transition().duration(750);

        function is_pinellas(d) {
            return d.name === "Pinellas"
        }
        transitional_map = g_counties.select_or_append("g.counties_map").selectAll("path").data(counties, function(d) {
            return d.name
        });
        transitional_map.enter().append("path").attr("d", path).style("fill-opacity", 0).attr("class", "null_county");
        var graph_width = 0;
        var start_graph = 0;
        var florida_length, florida_start, florida_end;

        function stageonepositioning() {
            mobile = window.innerWidth < 660;
            med = !mobile && window.innerWidth < 1e3;
            if (mobile) {
                margin = {
                    top: 150,
                    right: 35,
                    bottom: 5,
                    left: 20
                }
            } else if (med) {
                margin = {
                    top: 200,
                    right: 60,
                    bottom: 150,
                    left: 80
                }
            } else {
                margin = {
                    top: 100,
                    right: 80,
                    bottom: 150,
                    left: 80
                }
            }
            width = window.innerWidth - margin.left - margin.right;
            height = window.innerHeight - margin.top - margin.bottom;
            svg = container.select_or_append("svg.graphic_box").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).select_or_append("g.graphic_container").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            set_projection(outer_counties, false);
            var path_bounds = path.bounds(outer_counties);
            florida_start = path_bounds[0][0] + 30;
            florida_end = path_bounds[1][0];
            florida_length = florida_end - florida_start;
            var armpit_length = florida_length * .55
        }

        function stagetwopositioning() {
            var window_width = window.innerWidth;
            mobile = window_width < 660;
            height = window.innerHeight - margin.top - margin.bottom;
            margin = !mobile ? {
                top: 150,
                right: 80,
                bottom: 80,
                left: 150
            } : {
                top: 150,
                right: 40,
                bottom: 80,
                left: 45
            };
            svg = container.select_or_append("svg.graphic_box").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).select_or_append("g.graphic_container").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            svg.transition().attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            graph_width = window.innerWidth - margin.left - margin.right;
            start_graph = margin.left
        }

        function stagethreepositioning() {}
        stageonepositioning();

        function fill_fail(d) {
            var score = 0;
            if (d.properties.pass_both !== undefined) {
                score = +d.properties.pass_both.pct_black_fail_one_or_more
            }
            if (!mobile && !ff) {
                if (score !== 0) {
                    return "url(#chalk_" + color(score) + ")"
                }
                return "url(#white_chalk)"
            } else {
                if (score !== 0) {
                    return color_for_legend(score)
                }
                return "#fff"
            }
        }

        function drawMap() {
            set_projection(outer_counties, false);
            color.domain([.5, .86]);
            transitional_map.transition("path").attr("d", path);
            transitional_map.style("fill", function(d) {
                return fill_fail(d)
            });
            transitional_map.attr("transform", "scale(1)");
            if (transitional_map.style("fill-opacity") > .7) {
                transitional_map.style("fill", function(d) {
                    return fill_fail(d)
                }).style("fill-opacity", .7)
            } else {
                transitional_map.transition().duration(200).delay(function(d, i) {
                    return i * 20
                }).ease("sin").style("fill", function(d) {
                    return fill_fail(d)
                }).style("fill-opacity", .7)
            }
            d3.select(".legendLinear").remove();

            function map_mouseover(d) {
                tooltip.style("display", "block");
                tooltip.select(".school_name").html("<h2>" + d.name + "</h2>");
                transitional_map.classed("district_suppressed", true);
                transitional_map.filter(function(p) {
                    return p === d
                }).classed("district_suppressed", false)
            }

            function map_mouseout(d) {
                tooltip.style("display", "none");
                transitional_map.classed("district_suppressed", false)
            }
            var pinellas_label = g_counties.select_or_append("g.g_label").selectAll("text").data(counties);
            g_counties.select(".g_county_bar").selectAll(".bar").transition().duration(200).attr("width", 0).each("end", remove_bar_chart);
            if ($(document).width() < 992) {
                $(".header-flag-logo-art").attr("src", "//www.tampabay.com/projects/assets/logo-t.svg")
            }
            d3.selectAll(".title_div").transition().delay(1800).duration(1e3).style("opacity", 1);
            d3.selectAll(".byline").transition().delay(2500).duration(1e3).style("opacity", 1);
            d3.selectAll(".header-flag-logo-art,.swiper-pagination,#componentDivFirstSlide").transition().delay(3200).duration(1e3).style("opacity", 1);
            d3.selectAll(".nav").transition().delay(4200).duration(1e3).style("opacity", 1);

            function remove_bar_chart() {
                g_counties.select(".g_county_bar").remove()
            }
        }

        function enter_and_highlight() {
            addLegend();
            highlightPinellas()
        }

        function to_lines() {}

        function highlight_counties(counties_in) {
            var working_counties = _.map(counties_in, function(d) {
                return d.toUpperCase()
            });
            var transition_duration = 400;
            transitional_map.attr("d", path);
            transitional_map.filter(function(d) {
                return working_counties.indexOf(d.county_name_upper) === -1
            }).transition().duration(transition_duration).style("fill", function(d) {
                return fill_fail(d)
            }).style("fill-opacity", .01).style("stroke-opacity", .1);
            transitional_map.filter(function(d) {
                return working_counties.indexOf(d.county_name_upper) > -1
            }).transition().style("fill", function(d) {
                return fill_fail(d)
            }).transition().delay(transition_duration / 2).duration(transition_duration).style("fill-opacity", 1).style("stroke-opacity", .5)
        }

        function append_legend() {
            var legend = g_counties.select_or_append("g.legendLinear");
            if (!mobile && !med) {
                legend.attr("transform", "translate(" + (florida_start + florida_length) + ",100)")
            } else {
                legend.attr("transform", "translate(" + (florida_start - 20) + "," + 3 * height / 4 + ")")
            }
            legend.append("text").attr("transform", mobile ? "translate(0,-25)" : med ? "translate(0,-50)" : "translate(0,-75)").tspans(["Black elementary students", "failing FCAT math or reading"]).attr("dy", "1.15em");
            legendLinear = d3.legend.color().shapeWidth(mobile ? 10 : 20).shapePadding(0).shapeHeight(mobile ? 10 : 20).labels(["50%", "", "", "", "", "70%", "", "", "", "", "90%"]).orient(mobile || med ? "horizontal" : "vertical").scale(color_for_legend);
            legend.call(legendLinear)
        }

        function addLegend() {
            if (d3.select(".legendLinear").empty()) {
                transitional_map.style("fill-opacity", "").style("stroke-opacity", "");
                append_legend()
            }
        }

        function resetCounties() {
            color.domain([.5, .86]);
            undo_bulge();
            transitional_map.style("fill", function(d) {
                return fill_fail(d)
            });
            highlight_counties(_.pluck(counties, "name"));
            transitional_map.classed("district_suppressed", false)
        }

        function highlightHighCounties() {
            var high_performing_county_names = _.pluck(counties.filter(function(d) {
                if (d.properties.pass_both !== undefined) {
                    return d.properties.pass_both.pct_black_fail_one_or_more <= .842
                }
                return false
            }), "name");
            highlight_counties(high_performing_county_names)
        }

        function zoomToPinellas() {
            set_projection(school_zones, false);
            stagetwopositioning();
            svg.select(".schools").transition().remove();
            g_counties = svg.select_or_append("g.counties");
            transitional_map = g_counties.select_or_append("g.counties_map").selectAll("path").data(pinellas, function(d) {
                return d.name
            });
            transitional_map.enter().append("path").attr("d", path).attr("transform", "scale(.01)").style("fill-opacity", 0).attr("class", "null_county");
            transitional_map.exit().remove();
            transitional_map.transition("bulge").duration(500).ease("sin").attr("d", path).attr("transform", "scale(1)").call(endall, go_on);
            svg.select(".x.axis").remove();
            svg.select(".y.axis").remove();
            g_counties.select(".legendLinear").remove();
            g_counties.select(".x.axis").remove();
            g_counties.select(".y.axis").remove();

            function go_on() {
                g_schools = svg.select_or_append("g.schools");
                school_paths = g_schools.select_or_append("g.school_paths").selectAll("path").data(school_zones.features, function(d) {
                    return d.properties.SCHOOLNUM
                });
                school_paths.enter().append("path");
                school_paths.attr("d", path).attr("class", function(d) {
                    return "attendance_zones " + d["13"]
                }).style("fill-opacity", 0).style("fill", "#000").transition().duration(1500).style("fill-opacity", 1);
                transitional_map.transition().duration(1500).attr("fill-opacity", 0)
            }
        }
        var pinellas_data = pinellas[0].properties.fcat_data;
        var filtered_counties = _.filter(counties, function(d) {
            return d.properties.state_diff_passing_reading_scores.length > 1
        });
        var largest_area = 0;

        function sum_geo_area(county) {
            var geo = county.geometry;
            var area = 0;
            var coordinates = geo.coordinates;
            if (geo.type === "MultiPolygon") {
                coordinates.forEach(function(d) {
                    var polygon = toPoly(d[0]);
                    area += Math.abs(polygon.area())
                })
            } else {
                area = toPoly(coordinates[0]).area()
            }
            if (area > largest_area) {
                largest_area = area
            }
            return area
        }
        var low_performing = counties.filter(function(d) {
            if (d.properties.pass_both !== undefined) {
                return d.properties.pass_both.pct_black_fail_one_or_more >= .842
            }
            return false
        });
        _.each(low_performing, function(d) {
            sum_geo_area(d)
        });

        function highlightLowPerformingCounties() {
            transitional_map.transition("bulge").duration(400).attr("transform", "scale(1)");
            var low_performing_county_names = _.pluck(counties.filter(function(d) {
                if (d.properties.pass_both !== undefined) {
                    return d.properties.pass_both.pct_black_fail_one_or_more >= .842
                }
                return false
            }), "name");
            highlight_counties(low_performing_county_names)
        }

        function bulge_counties() {
            var low_performing_county_names = _.pluck(counties.filter(function(d) {
                if (d.properties.pass_both !== undefined) {
                    return d.properties.pass_both.pct_black_fail_one_or_more >= .842
                }
                return false
            }), "name");
            var working_counties = _.map(low_performing_county_names, function(d) {
                return d.toUpperCase()
            });
            stageonepositioning();
            d3.selectAll(".schools").remove();
            var g_counties = svg.select_or_append("g.counties");
            set_projection(outer_counties, false);
            transitional_map = g_counties.select_or_append("g.counties_map").selectAll("path").data(counties, function(d) {
                return d.name
            });
            transitional_map.enter().append("path").style("fill-opacity", 0).attr("d", path).attr("class", "null_county");
            transitional_map.transition("goish").attr("d", path).attr("stroke", "#ccc").attr("stroke-width", "1px").style("fill-opacity", 1).style("fill", function(d) {
                return fill_fail(d)
            }).call(endall, go_on);
            highlightLowPerformingCounties();

            function go_on() {
                highlightLowPerformingCounties();
                var population_scale = d3.scale.linear().domain([0, 74631]).range([0, 1]);
                transitional_map.filter(function(d) {
                    return working_counties.indexOf(d.county_name_upper) > -1
                }).transition("bulge").duration(2e3).attr("transform", function(d) {
                    var score;
                    if (d.properties.pass_both !== undefined) {
                        score = population_scale(+d.properties.pass_both.all_take_both)
                    } else {
                        score = population_scale(0)
                    }
                    var total_area = sum_geo_area(d);
                    var centroid = path.centroid(d),
                        x = centroid[0],
                        y = centroid[1];
                    if (d.name === "Pinellas") {
                        x += 24
                    }
                    var desired_area = score * largest_area;
                    var desired_scale = Math.sqrt(desired_area / total_area);
                    d.scale = desired_scale;
                    return "translate(" + x + "," + y + ")" + "scale(" + desired_scale * 1.3 + ")" + "translate(" + -x + "," + -y + ")"
                })
            }
        }

        function undo_bulge() {
            transitional_map.transition("bulge").duration(400).attr("transform", "scale(1)")
        }
        var school_paths;

        function enter_pinellas_attendance() {
            stagetwopositioning();
            set_projection(group_a_zones, true);
            var fade_duration = 1e3;
            g_counties.remove();
            g_schools = svg.select_or_append("g.schools");
            school_paths = g_schools.select_or_append("g.school_paths").selectAll("path").data(school_zones.features, function(d) {
                return d.properties.SCHOOLNUM
            });
            schools_y.domain(d3.range(2004, 2015));
            if (!mobile) {
                school_paths.enter().append("path");
                school_paths.attr("d", path);
                g_schools.select(".school_paths").transition().duration(1e3).attr("transform", "translate(" + schools_x(.4) + "," + -1 * schools_y(2006) + ")");
                school_paths.attr("fill", "#000").attr("class", function(d) {
                    return "attendance_zones " + d["13"]
                })
            } else {
                d3.select(".school_paths").remove()
            }
            update_race_time_chart(data_stPete, "", 2007, "slow", false);

            function attendance_mouseover(d) {
                console.log("todo: tooltips")
            }

            function attendance_mouseout(d) {}

            function enter_pinellas_paths() {
                schools_y.domain(d3.range(2004, 2015));
                g_counties.remove();
                g_schools.select_or_append("g.school_paths").style("fill-opacity", 1).transition().delay(1e3).duration(2e3).attr("d", path).attr("transform", "translate(" + -1 * schools_x(.1) + "," + -1 * schools_y(2006) + ")");
                update_race_time_chart(data_stPete, "", 2007, "slow", false)
            }
        }

        function to_census_chart() {
            g_counties.transition().attr("stroke-opacity", 0).remove()
        }
        var five_schools_numbers = [];
        var group_a_numbers = [];
        _.forEach(schools, function(d) {
            d.year_2014 = d.values[d.values.length - 1];
            d.year_2014.pct_pass_both = 0;
            d.school_number = d.year_2014.school_number;
            var pass_both_score = _.findWhere(schools_pass_both, {
                school_number: d.school_number,
                district_number: d.district_number
            });
            if (pass_both_score !== undefined) {
                d.year_2014.pct_pass_both = +pass_both_score.pct_all_pass_both;
                d.pct_all_pass_both = +pass_both_score.pct_all_pass_both
            }
            var first_val = d.values[0];
            if (first_val.is_group_a === "True") {
                group_a_numbers.push(+d.school_number);
                if (first_val.is_five_schools === "True") {
                    five_schools_numbers.push(d.school_number);
                    d.segregation_group = "five_group"
                } else {
                    d.segregation_group = "white_group"
                }
            } else {
                d.segregation_group = "other_group"
            }
        });
        var group_a_zones = JSON.parse(JSON.stringify(school_zones));
        group_a_zones.features = _.filter(school_zones.features, function(d) {
            return group_a_numbers.indexOf(+d.properties.SCHOOLNUM) > -1
        });
        var data_stPete = _.filter(schools, function(d) {
            return d.segregation_group !== "other_group"
        });
        var data_FiveGroup = _.filter(schools, function(d) {
            return d.segregation_group === "five_group"
        });
        var data_WhiteGroup = _.filter(schools, function(d) {
            return d.segregation_group === "white_group" || d.segregation_group === "five_group"
        });
        var stPete_school_zones = [];
        var school_column;
        var year_row;
        var school_lines;
        var tooltip = container.append("div").classed("tt", true);
        tooltip.append("div").classed("school_name", true);
        tooltip.append("div").classed("data_value", true);
        var pos;
        container.on("mousemove", function() {
            pos = d3.mouse(this);
            var ttWidth = tooltip.node().offsetWidth;
            var ttHeight = tooltip.node().offsetHeight;
            tooltip.style("top", pos[1] - ttHeight + "px").style("left", pos[0] + 10 + "px")
        });
        var year_format = d3.time.format("%Y");
        var schools_x = d3.scale.linear().domain([0, 1]).range([0, graph_width]);
        var schools_y = d3.scale.ordinal().rangeBands([0, height]);
        var schools_z = d3.scale.quantize().range(["#276c91", "#5c8496", "#839c9a", "#a7b49d", "#c9cea0", "#ece9a2", "#e8be74", "#e0a466", "#d78958", "#cd6e4b", "#c2513e", "#b63132"]);
        var performance_colors = ["#276c91", "#457793", "#5c8495", "#708f97", "#839b99", "#94a89b", "#a6b59d", "#b8c19e", "#c9cea0", "#dadba1", "#e3d998", "#e3c787", "#e1b577", "#dea269", "#d9925e", "#d38054", "#cd6e4b", "#c65b42", "#be473a", "#b63132"];
        var race_colors = ["#276c91", "#457793", "#5c8495", "#708f97", "#839b99", "#94a89b", "#a6b59d", "#b8c19e", "#c9cea0", "#dadba1", "#e3d998", "#e3c787", "#e1b577", "#dea269", "#d9925e", "#d38054", "#cd6e4b", "#c65b42", "#be473a", "#b63132"];
        var schools_xAxis = d3.svg.axis().scale(schools_x).ticks(mobile ? 4 : 8).tickSize(-height).tickFormat(d3.format("%"));
        var pct_format = d3.format("%");

        function school_mouseout(d) {
            school_column.classed("school_active", false);
            tooltip.style("display", "none");
            school_paths.transition().style("fill-opacity", 1)
        }

        function school_mouseover(d) {
            school_column.classed("school_active", false);
            school_column.filter(function(p) {
                return p === d
            }).classed("school_active", true);
            tooltip.style("display", "block");
            tooltip.select(".school_name").html("<h2>" + d.key + "</h2>");
            tooltip.select(".data_value").html(function() {
                return "<p>2003: " + pct_format(d.values[0].pct_black) + " black enrollment</p><p>2014: " + pct_format(d.values[d.values.length - 1].pct_black) + " black enrollment</p>"
            });
            school_paths.transition().duration(100).style("fill-opacity", .3).filter(function(e) {
                return +e.properties.SCHOOLNUM === +d.year_2014.school_number
            }).style("fill-opacity", 1)
        }

        function update_race_time_chart(data, active_class, max_year, speed, color, performance) {
            stagetwopositioning();
            svg.select(".counties").remove();
            schools_y = d3.scale.ordinal().rangeBands([0, height]);
            schools_y.domain(d3.range(2004, 2015));
            var domain = performance ? [1, 0] : [0, 1];
            schools_x = d3.scale.linear().domain(domain).range([0, graph_width - margin.right]);
            schools_z.domain(domain);
            schools_z.range(performance ? performance_colors : race_colors);
            var legend = g_schools.select_or_append("g.legend");
            legend.attr("transform", "translate(" + 0 + "," + (height + 20) + ")");
            var shapeWidth = (graph_width - margin.right) / schools_z.range().length;
            var legendbuilder = d3.legend.color().shapeWidth(shapeWidth).shapePadding(0).shapeHeight(20).labels(["", "", "", "", "", "", "", "", "", "", "", ""]).orient("horizontal").scale(schools_z);
            legend.call(legendbuilder);
            year_row = g_schools.select_or_append("g.year_row").selectAll("g").data(schools_y.domain()).enter().append("g").attr("transform", function(d) {
                return "translate(0," + schools_y(d) + ")"
            }).append("text").attr("x", -40).attr("dy", ".35em").attr("class", "year_label").text(function(d) {
                return d
            });
            schools_xAxis = d3.svg.axis().scale(schools_x).ticks(mobile ? 4 : 8).outerTickSize(0).tickSize(-height).tickFormat(d3.format("%"));
            var school_axis = g_schools.select_or_append("g.schools_axis").attr("transform", "translate(0," + height + ")").call(schools_xAxis);
            school_axis.select_or_append("text.annotation.left").attr("transform", "translate(0," + 20 + ")").attr("x", 0).attr("text-anchor", "start").attr("dy", mobile ? "2.75em" : "2.2em").text(performance ? mobile ? "← Best in Fla." : "← Best school in Florida" : "← Less black");
            school_axis.select_or_append("text.annotation.right").attr("transform", "translate(0," + 20 + ")").attr("x", graph_width - margin.right).attr("text-anchor", "end").attr("dy", mobile ? "2.75em" : "2.2em").text(performance ? mobile ? "Worst →" : "Worst school →" : "More black →");
            school_column = g_schools.select_or_append("g.school");
            d3.select(".y.axis").remove();
            d3.select(".circles").remove();
            school_column = g_schools.select(".school").selectAll("g").data(data, function(d) {
                return d.key
            });
            school_column.enter().append("g");
            school_column.transition().attr("class", function(d) {
                if (d.segregation_group === active_class) {
                    return "school_active " + d.segregation_group
                }
                return d.segregation_group
            });
            school_column.exit().remove();
            var duration = 50;
            if (speed === "slow") {
                duration = 125
            } else if (speed === "medium") {
                duration = 50
            }
            var delay = duration;
            var easing = "sin";

            function color_group(data) {
                var base = data[0];
                school_paths.filter(function(d) {
                    return +d.properties.SCHOOLNUM === +base.school_number
                }).transition().duration(10).style("fill", function() {
                    return schools_z(performance ? base.z_read : base.pct_black)
                })
            }

            function filter_to_year(values) {
                var new_values = [];
                _.each(values, function(d) {
                    if (+d.year <= max_year) {
                        new_values.push(d)
                    }
                });
                return new_values
            }
            school_lines = school_column.selectAll("line").data(function(d) {
                var active_values = filter_to_year(d.values);
                return active_values.slice(1).map(function(b, i) {
                    return [active_values[i], b]
                })
            }, function(d) {
                return d[0].year
            });
            var data_key = performance ? "rank_reading" : "pct_black";
            var exit_count = 0;
            school_lines.exit().remove();
            school_lines.enter().append("line").attr("display", "none").style("stroke", function(d) {
                return schools_z(performance ? d[1].rank_reading : d[1].pct_black)
            }).transition().duration(duration).attr("x1", function(d) {
                return schools_x(d[0][data_key])
            }).attr("x2", function(d) {
                return schools_x(d[0][data_key])
            }).attr("y1", function(d) {
                return schools_y(d[0].year)
            }).attr("y2", function(d) {
                return schools_y(d[0].year)
            }).transition().duration(duration).ease(easing).delay(function(d, i) {
                return i * delay
            }).attr("display", "block").attr("x1", function(d) {
                return schools_x(d[0][data_key])
            }).attr("x2", function(d) {
                return schools_x(d[1][data_key])
            }).attr("y1", function(d) {
                return schools_y(d[0].year)
            }).attr("y2", function(d) {
                return schools_y(d[1].year)
            }).each("end", function(d) {
                if (d[1].year === max_year) {
                    color_group(d)
                }
            });
            if (performance) {
                school_lines.transition().duration(duration).ease(easing).delay(function(d, i) {
                    return i * delay
                }).attr("display", "block").attr("x1", function(d) {
                    return schools_x(d[0][data_key])
                }).attr("y1", function(d) {
                    return schools_y(d[0].year)
                }).transition(duration).ease(easing).attr("x2", function(d) {
                    return schools_x(d[1][data_key])
                }).attr("y2", function(d) {
                    return schools_y(d[1].year)
                }).each("end", function(d) {
                    if (d[1].year === max_year) {
                        color_group(d)
                    }
                })
            } else {
                school_lines.transition().duration(duration).ease(easing).delay(function(d, i) {
                    return i * delay
                }).attr("display", "block").attr("x1", function(d) {
                    return schools_x(d[0][data_key])
                }).attr("x2", function(d) {
                    return schools_x(d[1][data_key])
                }).attr("y1", function(d) {
                    return schools_y(d[0].year)
                }).attr("y2", function(d) {
                    return schools_y(d[1].year)
                }).each("end", function(d) {
                    if (d[1].year === max_year) {
                        color_group(d)
                    }
                })
            }
            school_lines.transition("colors").duration(duration * 3).ease(easing).delay(function(d, i) {
                return i * delay
            }).style("stroke", function(d) {
                return schools_z(performance ? d[1].rank_reading : d[1].pct_black)
            });
            school_paths = g_schools.select_or_append("g.school_paths").selectAll("path").data(school_zones.features, function(d) {
                return d.properties.SCHOOLNUM
            });
            if (!mobile && !performance) {
                school_paths.enter().append("path");
                school_paths.attr("d", path);
                g_schools.select(".school_paths").transition().duration(1e3).attr("transform", "translate(" + schools_x(.4) + "," + -1 * schools_y(2006) + ")");
                school_paths.attr("fill", "#000").attr("class", function(d) {
                    return "attendance_zones " + d["13"]
                })
            } else {
                d3.select(".school_paths").remove()
            }
        }

        function enter_year(data, year) {
            update_race_time_chart(data, "five_group", year, "fast")
        }

        function schools_up_to_year(data, year) {
            var new_data = [];
            _.each(data, function(school) {
                var values_filtered = [];
                _.each(school.values, function(d) {
                    if (+d.year <= year) {
                        values_filtered.push(d)
                    }
                });
                school.values = values_filtered;
                new_data.push(school)
            });
            return new_data
        }
        var schools_dots;

        function school_dots_mouseover(d) {
            console.log(d);
            school_column.classed("school_active", false);
            school_column.filter(function(p) {
                return p === d
            }).classed("school_active", true);
            tooltip.style("display", "block");
            tooltip.select(".school_name").html("<h2>" + d.school_number + "</h2>")
        }

        function school_dots_mouseout(d) {
            school_column.classed("school_active", true);
            tooltip.style("display", "none");
            school_paths.transition().style("fill-opacity", 1)
        }

        function pass_both_scatter() {
            var duration = 60;
            schools_z = d3.scale.quantize().domain([0, 1]).range(["#276c91", "#5c8496", "#839c9a", "#a7b49d", "#c9cea0", "#ece9a2", "#e8be74", "#e0a466", "#d78958", "#cd6e4b", "#c2513e", "#b63132"]);
            schools_x.domain([0, 1]);
            d3.select(".school_paths").remove();
            d3.select(".legend").remove();
            school_column.selectAll("line").transition().duration(duration).delay(function(d, i) {
                return i * duration
            }).ease("sin").attr("x1", function(d) {
                return schools_x(d[1].pct_black)
            }).attr("x2", function(d) {
                return schools_x(d[1].pct_black)
            }).attr("y1", function(d) {
                return schools_y(d[1].year)
            }).attr("y2", function(d) {
                return schools_y(d[1].year)
            }).attr("stroke-opacity", 0).remove().call(endall, scatter_to_black_pass_both);
            g_schools.selectAll(".year_row").remove();
            g_schools.select(".school_paths").remove()
        }

        function scatter_to_black_pass_both() {
            d3.selectAll(".school").remove();
            d3.select(".school_paths").remove();
            d3.selectAll(".year_row").remove();
            var schools_filter = schools_pass_both.filter(function(d) {
                return d.pct_all_pass_both > 0 && d.district_number == 52
            });
            schools_z = d3.scale.quantize().domain([.9, 0]).range(["#276c91", "#5c8496", "#839c9a", "#a7b49d", "#c9cea0", "#ece9a2", "#e8be74", "#e0a466", "#d78958", "#cd6e4b", "#c2513e", "#b63132"]);
            schools_dots = g_schools.select_or_append("g.circles").selectAll("circle").data(schools_filter, function(d) {
                return d.school_number + " " + d.district_number
            });
            schools_dots.enter().append("circle").attr("r", mobile ? 4 : 8).style("fill", function(d) {
                return schools_z(d.pct_all_pass_both)
            }).on("mouseover", school_dots_mouseover).on("mouseout", school_dots_mouseout).style("fill-opacity", function(d) {
                return d.segregation_group === "five_group" ? 1 : .3
            }).attr("transform", function(d) {
                return "translate(" + schools_x(d.pct_black) + "," + schools_y(2014) + ")"
            });
            schools_y = d3.scale.linear().domain([0, 1]).range([height, 0]);
            schools_yAxis = d3.svg.axis().scale(schools_y).ticks(8).outerTickSize(0).tickSize(-(graph_width - margin.right + 15)).tickFormat(d3.format("%")).orient("left");
            schools_xAxis = d3.svg.axis().scale(schools_x).ticks(mobile ? 4 : 8).tickSize(-height).tickFormat(d3.format("%"));
            g_yAxis = g_schools.select_or_append("g.y.axis").attr("transform", "translate(-15,0)").call(schools_yAxis);
            g_yAxis.select_or_append("text.annotation").attr("dy", ".32em").attr("dx", ".32em").attr("transform", "translate(0, -10)");
            g_schools.select(".y.axis").select(".annotation").tspans(["Students passing reading and math"]);
            var school_axis = g_schools.select_or_append("g.schools_axis").attr("transform", "translate(0," + height + ")").call(schools_xAxis);
            school_axis.select_or_append("text.annotation.left").attr("transform", "translate(0," + 20 + ")").attr("x", 0).attr("text-anchor", "start").attr("dy", mobile ? "2.75em" : "2.2em").text("← Less black");
            school_axis.select_or_append("text.annotation.right").attr("transform", "translate(0," + 20 + ")").attr("x", graph_width - margin.right).attr("text-anchor", "end").attr("dy", mobile ? "2.75em" : "2.2em").text("More black →");
            schools_dots.exit().remove();
            schools_z = d3.scale.quantize().domain([0, 1]).range(["#276c91", "#5c8496", "#839c9a", "#a7b49d", "#c9cea0", "#ece9a2", "#e8be74", "#e0a466", "#d78958", "#cd6e4b", "#c2513e", "#b63132"]);
            schools_x.domain([0, 1]);
            schools_y.domain([0, 1]);
            schools_dots.transition().duration(1500).delay(function(d, i) {
                return i * 20
            }).attr("transform", function(d) {
                return "translate(" + schools_x(d.pct_black) + "," + schools_y(d.pct_all_pass_both) + ")"
            })
        }

        function to_melrose() {
            var melrose = _.findWhere(schools_pass_both, {
                school_number: "2371",
                district_number: "52"
            });
            var school_labels = g_schools.select_or_append("g.school_labels").selectAll("text").data([melrose], function(d) {
                return d.school_number + " " + d.district_number
            });
            schools_dots = g_schools.select_or_append("g.circles").selectAll("circle").data([melrose], function(d) {
                return d.school_number + " " + d.district_number
            });
            school_labels.exit().transition().duration(100).style("opacity", 0).remove();
            schools_dots.exit().transition().duration(1e3).style("fill-opacity", 0).remove();
            schools_dots.transition().duration(700).style("fill", "#7E8277").ease("sin").attr("r", 2e3).transition().duration(100).style("fill-opacity", 0).call(endall, go_on).remove();

            function go_on() {
                school_labels.remove();
                to_single_school(melrose)
            }
        }

        function enter_other_students() {
            var schools = g_schools.select_or_append("g.five_schools")
        }

        function highlight_melrose_fail() {
            svg.style("display", "block");
            var melrose = _.findWhere(schools_pass_both, {
                school_number: "2371",
                district_number: "52"
            });
            highlight_fail(melrose)
        }

        function highlight_melrose_pass() {
            svg.style("display", "block");
            var melrose = _.findWhere(schools_pass_both, {
                school_number: "2371",
                district_number: "52"
            });
            highlight_pass(melrose)
        }
        var school_students;
        var students;
        var min_student_diameter = 8;
        var max_student_diameter = 20;
        var gap = 2;

        function to_single_school(school) {
            var students_x = d3.scale.linear().domain([0, mobile ? 15 : 20]).range([mobile ? margin.left : 0, graph_width - 20]);
            var students_y = d3.scale.linear().domain([0, mobile ? 10 : 10]).range([0, height]);
            d3.selectAll(".school").remove();
            d3.selectAll(".year_row").remove();
            school_students = g_schools.select_or_append("g.school_students");
            var student_elements = d3.range(school.number_test_takers).map(function(d, i) {
                return {
                    school: "Melrose",
                    x: i % students_x.domain()[1],
                    y: Math.floor(i / students_x.domain()[1]),
                    pass: i >= school.number_test_takers - school.number_pass_both ? 1 : 0
                }
            });
            students = school_students.selectAll("path").data(student_elements);
            var scaler = mobile ? .4 : .7;
            students.enter().append("path").attr("d", kid_path).style("fill-opacity", 0).style("fill", "#7E8277").attr("transform", function(d) {
                return "translate(" + students_x(d.x) + "," + students_y(d.y) + ")scale(" + scaler + ")"
            });
            students.transition("kids").duration(500).ease("sin").attr("transform", function(d) {
                return "translate(" + students_x(d.x) + "," + students_y(d.y) + ")scale(" + scaler + ")"
            }).transition().delay(function(d, i) {
                return i * 5
            }).style("fill-opacity", 1).style("fill", "#7E8277")
        }

        function highlight_fail(school) {
            var students_x = d3.scale.linear().domain([0, mobile ? 15 : 20]).range([mobile ? margin.left : 0, graph_width - 20]);
            var students_y = d3.scale.linear().domain([0, mobile ? 10 : 10]).range([0, height]);
            d3.select(".school").remove();
            d3.select(".legend").remove();
            d3.select(".axis").remove();
            d3.select(".year_row").remove();
            to_single_school(school);
            students.filter(function(d) {
                return d.pass == 0
            }).transition("kids").duration(500).style("fill-opacity", 1).delay(function(d, i) {
                return i * 5
            }).transition().duration(1).style("fill", "#e74c3c");
            students.filter(function(d) {
                return d.pass == 1
            }).transition("kids").duration(500).style("fill-opacity", 1).transition().duration(1).style("fill", "#7E8277")
        }

        function highlight_pass(school) {
            var students_x = d3.scale.linear().domain([0, mobile ? 15 : 20]).range([mobile ? margin.left : 0, graph_width - 20]);
            var students_y = d3.scale.linear().domain([0, mobile ? 10 : 10]).range([0, height]);
            d3.select(".school").remove();
            d3.select(".legend").remove();
            d3.select(".axis").remove();
            d3.select(".year_row").remove();
            to_single_school(school);
            students.filter(function(d) {
                return d.pass == 0
            }).transition("kids").duration(500).style("fill-opacity", 1).delay(function(d, i) {
                return i * 5
            }).transition().duration(1).style("fill", "#e74c3c");
            students.filter(function(d) {
                return d.pass == 1
            }).transition("kids").duration(500).style("fill-opacity", 1).delay(function(d, i) {
                return i * 5
            }).transition().duration(1).style("fill", "#3498db")
        }

        function to_student_elements() {
            d3.select(".y.axis").remove();
            d3.select(".x.axis").remove();
            d3.select(".schools_axis").remove();
            to_melrose()
        }
        var schools_yAxis;

        function enter_full_state() {
            schools_y = d3.scale.linear().domain([0, 1]).range([height, 0]);
            schools_yAxis = d3.svg.axis().scale(schools_y).ticks(8).tickSize(-(graph_width - margin.right + 15)).tickFormat(d3.format("%")).orient("left");
            g_yAxis = g_schools.select_or_append("g.y.axis").transition().duration(1500).call(schools_yAxis);
            g_schools.select(".school_paths").remove();
            d3.shuffle(schools_pass_both);
            var full_state_data = schools_pass_both;
            schools_dots = g_schools.select_or_append("g.circles").selectAll("circle").data(full_state_data, function(d) {
                return d.school_number + " " + d.district_number
            });
            schools_dots.exit().remove();
            schools_z.domain([1, 0]);
            if (!ff) {
                schools_dots.enter().append("circle").attr("r", function(d) {
                    if (!mobile) {
                        return d.district_number == "52" ? 8 : 5
                    } else {
                        return d.district_number == "52" ? 5 : 3
                    }
                }).attr("transform", function(d) {
                    return "translate(" + schools_x(+d.pct_black) + "," + schools_y(0) + ")"
                }).style("fill", function(d) {
                    if (d.district_number == 52) {
                        return schools_z(d.pct_all_pass_both)
                    }
                }).style("fill-opacity", function(d) {
                    return d.district_number == 52 ? .7 : mobile ? .1 : .3
                });
                schools_dots.on("mouseover", school_dots_mouseover).on("mouseout", school_dots_mouseout).attr("r", function(d) {
                    if (!mobile) {
                        return d.district_number == "52" ? 8 : 5
                    } else {
                        return d.district_number == "52" ? 5 : 3
                    }
                }).style("fill", function(d) {
                    if (d.district_number == 52) {
                        return schools_z(d.pct_all_pass_both)
                    }
                    return "#5a5a5a"
                }).style("fill-opacity", function(d) {
                    return d.district_number == 52 ? .7 : mobile ? .1 : .3
                });
                schools_dots.transition().duration(1500).delay(function(d, i) {
                    return i
                }).attr("transform", function(d) {
                    return "translate(" + schools_x(d.pct_black) + "," + schools_y(d.pct_all_pass_both) + ")"
                })
            } else {
                schools_dots.enter().append("circle").attr("r", function(d) {
                    return d.district_number == "52" ? 8 : mobile ? 3 : 5
                }).attr("transform", function(d) {
                    return "translate(" + schools_x(+d.pct_black) + "," + schools_y(d.pct_all_pass_both) + ")"
                }).style("fill", function(d) {
                    if (d.district_number == 52) {
                        return schools_z(d.pct_all_pass_both)
                    }
                    return "#5a5a5a"
                }).style("fill-opacity", .2);
                schools_dots.attr("r", function(d) {
                    return d.district_number == "52" ? 8 : mobile ? 3 : 5
                }).attr("transform", function(d) {
                    return "translate(" + schools_x(+d.pct_black) + "," + schools_y(d.pct_all_pass_both) + ")"
                }).style("fill", function(d) {
                    if (d.district_number == 52) {
                        return schools_z(d.pct_all_pass_both)
                    }
                    return "#5a5a5a"
                }).on("mouseover", school_dots_mouseover).on("mouseout", school_dots_mouseout).style("fill-opacity", .2)
            }
        }

        function to_lower_performance() {
            var schools_pass_both_lessthanten = schools_pass_both.filter(function(d) {
                return d.pct_all_pass_both <= .086
            });
            schools_y = d3.scale.linear().domain([0, .1]).range([height, 0]);
            schools_yAxis = d3.svg.axis().scale(schools_y).ticks(8).tickSize(-(graph_width - margin.right + 15)).tickFormat(d3.format("%")).orient("left");
            g_yAxis = g_schools.select_or_append("g.y.axis").transition().duration(1500).call(schools_yAxis);
            g_schools.select(".school_paths").remove();
            schools_dots = g_schools.select_or_append("g.circles").selectAll("circle").data(schools_pass_both_lessthanten, function(d) {
                return d.school_number + " " + d.district_number
            });
            schools_dots.exit().remove();
            schools_dots.enter().append("circle").attr("r", function(d) {
                if (!mobile) {
                    return d.district_number == "52" ? 8 : 5
                } else {
                    return d.district_number == "52" ? 5 : 3
                }
            }).attr("transform", function(d) {
                return "translate(" + schools_x(+d.pct_black) + "," + schools_y(0) + ")"
            }).style("fill", function(d) {
                return "#333"
            });
            schools_dots.transition().duration(1500).delay(function(d, i) {
                return i * 2
            }).attr("r", function(d) {
                if (!mobile) {
                    return d.district_number == "52" ? 8 : 5
                } else {
                    return d.district_number == "52" ? 5 : 3
                }
            }).style("fill-opacity", 1).attr("transform", function(d) {
                return "translate(" + schools_x(d.pct_black) + "," + schools_y(d.pct_all_pass_both) + ")"
            })
        }

        function to_lower_performance_charter() {
            var schools_pass_both_lessthanten = schools_pass_both.filter(function(d) {
                return d.pct_all_pass_both <= .086
            });
            schools_y = d3.scale.linear().domain([0, .1]).range([height, 0]);
            schools_yAxis = d3.svg.axis().scale(schools_y).ticks(8).tickSize(-(graph_width - margin.right + 15)).tickFormat(d3.format("%")).orient("left");
            g_yAxis = g_schools.select_or_append("g.y.axis").transition().duration(1500).call(schools_yAxis);
            g_schools.select(".school_paths").remove();
            schools_dots = g_schools.select_or_append("g.circles").selectAll("circle").data(schools_pass_both_lessthanten, function(d) {
                return d.school_number + " " + d.district_number
            });
            schools_dots.exit().remove();
            schools_dots.enter().append("circle").attr("r", 6).attr("transform", function(d) {
                return "translate(" + schools_x(+d.pct_black) + "," + schools_y(0) + ")"
            }).style("fill", function(d) {
                return "#333"
            });
            schools_dots.transition().duration(1500).delay(function(d, i) {
                return i * 2
            }).attr("r", function(d) {
                if (d.non_charter === "0") {
                    return 15
                } else if (!mobile) {
                    return d.district_number == "52" ? 8 : 5
                } else {
                    return d.district_number == "52" ? 5 : 3
                }
            }).style("fill-opacity", .8).attr("transform", function(d) {
                return "translate(" + schools_x(d.pct_black) + "," + schools_y(d.pct_all_pass_both) + ")"
            })
        }

        function filter_charter() {
            svg.select(".school_students").remove();
            var school_filter = schools_pass_both.filter(function(d) {
                return d.pct_all_pass_both <= .086 && d.non_charter === "1"
            });
            schools_y = d3.scale.linear().domain([0, .1]).range([height, 0]);
            schools_yAxis = d3.svg.axis().scale(schools_y).ticks(8).tickSize(-(graph_width - margin.right + 15)).tickFormat(d3.format("%")).orient("left");
            g_yAxis = g_schools.select_or_append("g.y.axis").transition().duration(1500).call(schools_yAxis);
            g_schools.select(".school_paths").remove();
            schools_dots = g_schools.select_or_append("g.circles").selectAll("circle").data(school_filter, function(d) {
                return d.school_number + " " + d.district_number
            });
            schools_dots.exit().transition().style("fill-opacity", .1).transition().remove();
            schools_dots.enter().append("circle").attr("r", function(d) {
                if (d.non_charter === "special") {
                    return mobile ? 15 : 10
                } else if (!mobile) {
                    return d.district_number == "52" ? 8 : 5
                } else {
                    return d.district_number == "52" ? 5 : 3
                }
            }).style("fill-opacity", .8).attr("transform", function(d) {
                return "translate(" + schools_x(+d.pct_black) + "," + schools_y(0) + ")"
            });
            schools_dots.transition().duration(1500).delay(function(d, i) {
                return i * 2
            }).attr("r", function(d) {
                if (d.school_type === "special") {
                    return mobile ? 15 : 10
                } else if (!mobile) {
                    return d.district_number == "52" ? 8 : 5
                } else {
                    return d.district_number == "52" ? 5 : 3
                }
            }).style("fill-opacity", .8).attr("transform", function(d) {
                return "translate(" + schools_x(d.pct_black) + "," + schools_y(d.pct_all_pass_both) + ")"
            });
            svg.select(".school_labels").transition().style("opacity", 0).remove()
        }

        function filter_special() {
            svg.select(".school_students").remove();
            var school_filter = schools_pass_both.filter(function(d) {
                return d.pct_all_pass_both <= .086 && (d.school_type === "regular" || d.school_type === "early")
            });
            schools_y = d3.scale.linear().domain([0, .1]).range([height, 0]);
            schools_yAxis = d3.svg.axis().scale(schools_y).ticks(8).tickSize(-(graph_width - margin.right + 15)).tickFormat(d3.format("%")).orient("left");
            g_yAxis = g_schools.select_or_append("g.y.axis").transition().duration(1500).call(schools_yAxis);
            g_schools.select(".school_paths").remove();
            schools_dots = g_schools.select_or_append("g.circles").selectAll("circle").data(school_filter, function(d) {
                return d.school_number + " " + d.district_number
            });
            schools_dots.exit().transition().duration(1e3).style("fill-opacity", .1).remove();
            schools_dots.enter().append("circle").attr("r", function(d) {
                if (d.school_type === "early") {
                    return mobile ? 15 : 10
                } else if (!mobile) {
                    return d.district_number == "52" ? 8 : 5
                } else {
                    return d.district_number == "52" ? 5 : 3
                }
            }).attr("transform", function(d) {
                return "translate(" + schools_x(+d.pct_black) + "," + schools_y(0) + ")"
            }).style("fill", function(d) {
                return "#333"
            }).style("fill-opacity", .8);
            schools_dots.transition().duration(1500).attr("r", function(d) {
                if (d.school_type === "early") {
                    return mobile ? 15 : 10
                } else if (!mobile) {
                    return d.district_number == "52" ? 8 : 5
                } else {
                    return d.district_number == "52" ? 5 : 3
                }
            }).delay(function(d, i) {
                return i * 2
            }).attr("transform", function(d) {
                return "translate(" + schools_x(d.pct_black) + "," + schools_y(d.pct_all_pass_both) + ")"
            })
        }

        function filter_early() {
            svg.select(".school_students").remove();
            var school_filter = schools_pass_both.filter(function(d) {
                return d.pct_all_pass_both <= .086 && d.school_type === "regular"
            });
            schools_y = d3.scale.linear().domain([0, .1]).range([height, 0]);
            schools_yAxis = d3.svg.axis().scale(schools_y).ticks(8).tickSize(-(graph_width - margin.right + 15)).tickFormat(d3.format("%")).orient("left");
            g_yAxis = g_schools.select_or_append("g.y.axis").transition().duration(1500).call(schools_yAxis);
            schools_xAxis = d3.svg.axis().scale(schools_x).ticks(mobile ? 4 : 8).tickSize(-height).tickFormat(d3.format("%"));
            g_yAxis = g_schools.select_or_append("g.y.axis").attr("transform", "translate(-15,0)").call(schools_yAxis);
            g_yAxis.select_or_append("text.annotation").attr("dy", ".32em").attr("dx", ".32em").attr("transform", "translate(0, -10)");
            g_schools.select(".y.axis").select(".annotation").tspans(["Students passing reading and math"]);
            var school_axis = g_schools.select_or_append("g.schools_axis").attr("transform", "translate(0," + height + ")").call(schools_xAxis);
            school_axis.select_or_append("text.annotation.left").attr("transform", "translate(0," + 20 + ")").attr("x", 0).attr("text-anchor", "start").attr("dy", mobile ? "2.75em" : "2.2em").text("← Less black");
            school_axis.select_or_append("text.annotation.right").attr("transform", "translate(0," + 20 + ")").attr("x", graph_width - margin.right).attr("text-anchor", "end").attr("dy", mobile ? "2.75em" : "2.2em").text("More black →");
            g_schools.select(".school_paths").remove();
            schools_dots = g_schools.select_or_append("g.circles").selectAll("circle").data(school_filter, function(d) {
                return d.school_number + " " + d.district_number
            });
            schools_dots.exit().transition().duration(1e3).style("fill-opacity", .1).remove();
            schools_dots.enter().append("circle").attr("r", 10).attr("transform", function(d) {
                return "translate(" + schools_x(+d.pct_black) + "," + schools_y(0) + ")"
            }).style("fill", function(d) {
                return "#333"
            }).style("fill-opacity", .8);
            schools_dots.transition().duration(1500).delay(function(d, i) {
                return i * 2
            }).attr("transform", function(d) {
                return "translate(" + schools_x(d.pct_black) + "," + schools_y(d.pct_all_pass_both) + ")"
            });
            var school_labels = g_schools.select_or_append("g.school_labels").selectAll("text").data(school_filter, function(d) {
                return d.school_number + " " + d.district_number
            });
            school_labels.enter().append("text").style("opacity", 0);
            school_labels.text(function(d) {
                return d.school.toProperCase()
            }).style("text-anchor", "end").attr("dy", ".2em").attr("transform", function(d) {
                return "translate(" + (schools_x(d.pct_black) - 20) + "," + schools_y(d.pct_all_pass_both) + ")"
            }).transition().style("opacity", 1)
        }

        function pathTween(d1, precision, path) {
            return function(t) {
                var path0 = path,
                    path1 = path0.cloneNode();
                var n0 = path0.getTotalLength(),
                    n1 = (path1.setAttribute("d", d1), path1).getTotalLength();
                var distances = [0],
                    i = 0,
                    dt = precision / Math.max(n0, n1);
                while ((i += dt) < 1) distances.push(i);
                distances.push(1);
                var points = distances.map(function(t) {
                    var p0 = path0.getPointAtLength(t * n0),
                        p1 = path1.getPointAtLength(t * n1);
                    return d3.interpolate([p0.x, p0.y], [p1.x, p1.y])
                });
                return t < 1 ? "M" + points.map(function(p) {
                    return p(t)
                }).join("L") : d1
            }
        }

        function toPoly(coords) {
            return d3.geom.polygon(coords)
        }

        function translate_geometry(county) {
            if (_.findWhere(county.properties.math_scores, {
                    year: "2013"
                })) {
                var largest_polygon;
                var polyIndex = 0;
                var geo = county.geometry;
                var coordinates0;
                if (geo.type === "MultiPolygon") {
                    var coords = geo.coordinates;
                    largest_polygon = toPoly(county.geometry.coordinates[0][0]);
                    coords.forEach(function(d, i) {
                        var polygon = toPoly(d[0]);
                        if (Math.abs(polygon.area()) > Math.abs(largest_polygon.area())) {
                            largest_polygon = polygon;
                            polyIndex = i
                        }
                    });
                    coordinates0 = county.geometry.coordinates[polyIndex][0]
                } else {
                    coordinates0 = geo.coordinates[0]
                }
                var pop = _.findWhere(d.properties.math_scores, {
                    string_date: active_year
                }).value;
                var coordinates1 = circle(coordinates0, pop),
                    new_path = g.append("path").attr("class", "bubble"),
                    d0 = "M" + coordinates0.join("L") + "Z",
                    d1 = "M" + coordinates1.join("L") + "Z";
                q.defer(function(callback) {
                    new_path.attr("d", d0).transition().duration(duration()).attr("d", d1).transition().delay(1e3).style("fill", function(d) {
                        return color(pop)
                    }).attr("d", d0).each("end", callback(null)).remove()
                })
            }
        }

        function race_chart_to_year(year) {
            update_race_time_chart(schools, "five_group", year)
        }

        function toAttendance() {
            enter_pinellas_attendance()
        }

        function highlightMiamiPinellas() {
            highlight_counties(["PINELLAS", "MIAMI-DADE"])
        }

        function highlightEscambiaPinellas() {
            highlight_counties(["PINELLAS", "ESCAMBIA"])
        }

        function highlightColumbiaPinellas() {
            highlight_counties(["PINELLAS", "COLUMBIA"])
        }

        function highlightPinellas() {
            highlight_counties(["PINELLAS"])
        }

        function remove_students() {
            svg.style("display", "none")
        }
        var lastI = -1;
        var activeI = 0;
        var activated = [];

        function set_directional_components(step, sign) {
            if (step == 3 & sign == -1) {
                linechart_elements_exist = false
            }
        }
        var updateFunctions = d3.range(d3.selectAll("#sections > div").size()).map(function() {
            return function() {}
        });
        updateFunctions[0] = drawMap;
        updateFunctions[1] = enter_and_highlight;
        updateFunctions[2] = highlightHighCounties;
        updateFunctions[3] = highlightLowPerformingCounties;
        updateFunctions[4] = bulge_counties;
        updateFunctions[5] = enter_pinellas_attendance;
        updateFunctions[6] = "update_race_time_chart(data_stPete, '', 2008, 'medium', false)";
        updateFunctions[7] = "update_race_time_chart(data_stPete, '', 2009, 'medium', false)";
        updateFunctions[8] = "update_race_time_chart(data_stPete, '', 2010, 'medium', false)";
        updateFunctions[9] = "update_race_time_chart(data_stPete, '', 2011, 'medium', false)";
        updateFunctions[10] = "update_race_time_chart(data_stPete, '', 2012, 'medium', false)";
        updateFunctions[11] = "update_race_time_chart(data_stPete, '', 2013, 'medium', false)";
        updateFunctions[12] = "update_race_time_chart(data_stPete, 'five_group', 2014, 'medium', false)";
        updateFunctions[13] = "update_race_time_chart(data_stPete, 'five_group', 2014, 'slow', true, true)";
        updateFunctions[14] = pass_both_scatter;
        updateFunctions[15] = enter_full_state;
        updateFunctions[16] = to_lower_performance;
        updateFunctions[17] = to_lower_performance_charter;
        updateFunctions[18] = filter_charter;
        updateFunctions[19] = filter_special;
        updateFunctions[20] = filter_early;
        updateFunctions[21] = to_student_elements;
        updateFunctions[22] = highlight_melrose_fail;
        updateFunctions[23] = highlight_melrose_pass;
        updateFunctions[24] = remove_students;
        swipeadoohickey.on("onSlideChangeStart", function() {
            var i = swipeadoohickey.activeIndex;
            if (!(ff && (i === 17 || i === 4))) {
                if (typeof updateFunctions[i] === "function") {
                    updateFunctions[i]()
                } else {
                    eval(updateFunctions[i])
                }
            }
        });
        swipeadoohickey.on("onTransitionEnd", function() {
            var i = swipeadoohickey.activeIndex;
            if (ff && (i === 17 || i === 4)) {
                if (typeof updateFunctions[i] === "function") {
                    updateFunctions[i]()
                } else {
                    eval(updateFunctions[i])
                }
            }
        });
        drawMap();
        d3.select(window).on("resize.index", _.debounce(function() {
            if ($(document).width() < 992) {
                $(".header-flag-logo-art").attr("src", "//www.tampabay.com/projects/assets/logo-t.svg")
            }
            var i = swipeadoohickey.activeIndex;
            swipeadoohickey.updateClasses();
            if (!(ff && (i === 17 || i === 4))) {
                if (typeof updateFunctions[i] === "function") {
                    updateFunctions[i]()
                } else {
                    eval(updateFunctions[i])
                }
            }
        }), 100)
    }
})();
(function() {
    function jetpack(d3) {
        d3.selection.prototype.translate = function(xy) {
            return this.attr("transform", function(d, i) {
                return "translate(" + [typeof xy == "function" ? xy(d, i) : xy] + ")"
            })
        };
        d3.transition.prototype.translate = function(xy) {
            return this.attr("transform", function(d, i) {
                return "translate(" + [typeof xy == "function" ? xy(d, i) : xy] + ")"
            })
        };
        d3.selection.prototype.tspans = function(lines, lh) {
            return this.selectAll("tspan").data(lines).enter().append("tspan").text(function(d) {
                return d
            }).attr("x", 0).attr("dy", function(d, i) {
                return i ? lh || 15 : 0
            })
        };
        d3.selection.prototype.append = d3.selection.enter.prototype.append = function(name) {
            var n = d3_parse_attributes(name),
                s;
            name = n.attr ? n.tag : name;
            name = d3_selection_creator(name);
            s = this.select(function() {
                return this.appendChild(name.apply(this, arguments))
            });
            return n.attr ? s.attr(n.attr) : s
        };
        d3.selection.prototype.insert = d3.selection.enter.prototype.insert = function(name, before) {
            var n = d3_parse_attributes(name),
                s;
            name = n.attr ? n.tag : name;
            name = d3_selection_creator(name);
            before = d3_selection_selector(before);
            s = this.select(function() {
                return this.insertBefore(name.apply(this, arguments), before.apply(this, arguments) || null)
            });
            return n.attr ? s.attr(n.attr) : s
        };
        d3.select_or_append = d3.selection.prototype.select_or_append = d3.selection.enter.prototype.select_or_append = function(name) {
            if (this.select(name).empty()) {
                var n = d3_parse_attributes(name),
                    s;
                name = n.attr ? n.tag : name;
                name = d3_selection_creator(name);
                s = this.select(function() {
                    return this.appendChild(name.apply(this, arguments))
                });
                return n.attr ? s.attr(n.attr) : s
            }
            return this.select(name)
        };
        var d3_parse_attributes_regex = /([\.#])/g;

        function d3_parse_attributes(name) {
            if (typeof name === "string") {
                var attr = {},
                    parts = name.split(d3_parse_attributes_regex),
                    p;
                name = parts.shift();
                while (p = parts.shift()) {
                    if (p == ".") attr["class"] = attr["class"] ? attr["class"] + " " + parts.shift() : parts.shift();
                    else if (p == "#") attr.id = parts.shift()
                }
                return attr.id || attr["class"] ? {
                    tag: name,
                    attr: attr
                } : name
            }
            return name
        }

        function d3_selection_creator(name) {
            return typeof name === "function" ? name : (name = d3.ns.qualify(name)).local ? function() {
                return this.ownerDocument.createElementNS(name.space, name.local)
            } : function() {
                return this.ownerDocument.createElementNS(this.namespaceURI, name)
            }
        }

        function d3_selection_selector(selector) {
            return typeof selector === "function" ? selector : function() {
                return this.querySelector(selector)
            }
        }
        d3.wordwrap = function(line, maxCharactersPerLine) {
            var w = line.split(" "),
                lines = [],
                words = [],
                maxChars = maxCharactersPerLine || 40,
                l = 0;
            w.forEach(function(d) {
                if (l + d.length > maxChars) {
                    lines.push(words.join(" "));
                    words.length = 0;
                    l = 0
                }
                l += d.length;
                words.push(d)
            });
            if (words.length) {
                lines.push(words.join(" "))
            }
            return lines
        };
        d3.ascendingKey = function(key) {
            return typeof key == "function" ? function(a, b) {
                return key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : key(a) >= key(b) ? 0 : NaN
            } : function(a, b) {
                return a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : a[key] >= b[key] ? 0 : NaN
            }
        };
        d3.descendingKey = function(key) {
            return typeof key == "function" ? function(a, b) {
                return key(b) < key(a) ? -1 : key(b) > key(a) ? 1 : key(b) >= key(a) ? 0 : NaN
            } : function(a, b) {
                return b[key] < a[key] ? -1 : b[key] > a[key] ? 1 : b[key] >= a[key] ? 0 : NaN
            }
        };
        d3.f = function() {
            var functions = arguments;
            var i = 0,
                l = functions.length;
            while (i < l) {
                if (typeof functions[i] === "string" || typeof functions[i] === "number") {
                    functions[i] = function(str) {
                        return function(d) {
                            return d[str]
                        }
                    }(functions[i])
                }
                i++
            }
            return function(d) {
                var i = 0,
                    l = functions.length;
                while (i++ < l) d = functions[i - 1].call(this, d);
                return d
            }
        };
        if (!window.hasOwnProperty("ƒ")) window.ƒ = d3.f;
        var d3_selection_on = d3.selection.prototype.on;
        d3.selection.prototype.on = function(type, listener, capture) {
            if (typeof type == "string" && type.indexOf(" ") > -1) {
                type = type.split(" ");
                for (var i = 0; i < type.length; i++) {
                    d3_selection_on.apply(this, [type[i], listener, capture])
                }
            } else {
                d3_selection_on.apply(this, [type, listener, capture])
            }
            return this
        }
    }
    if (typeof d3 === "object" && d3.version) jetpack(d3);
    else if (typeof define === "function" && define.amd) {
        define(["d3"], jetpack)
    }
})();
(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e)
            }, l, l.exports, e, t, n, r)
        }
        return n[o].exports
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s
})({
    1: [function(require, module, exports) {
        var helper = require("./legend");
        module.exports = function() {
            var scale = d3.scale.linear(),
                shape = "rect",
                shapeWidth = 15,
                shapeHeight = 15,
                shapeRadius = 10,
                shapePadding = 2,
                cells = [5],
                labels = [],
                useClass = false,
                labelFormat = d3.format(".01f"),
                labelOffset = 10,
                labelAlign = "middle",
                orient = "vertical",
                path;

            function legend(svg) {
                var type = helper.d3_calcType(scale, cells, labels, labelFormat);
                var cell = svg.selectAll(".cell").data(type.data),
                    cellEnter = cell.enter().append("g", ".cell").attr("class", "cell").style("opacity", 1e-6);
                shapeEnter = cellEnter.append(shape).attr("class", "swatch"), shapes = cell.select("g.cell " + shape);
                cell.exit().transition().style("opacity", 0).remove();
                helper.d3_drawShapes(shape, shapes, shapeHeight, shapeWidth, shapeRadius, path);
                helper.d3_addText(svg, cellEnter, type.labels);
                var text = cell.select("text"),
                    shapeSize = shapes[0].map(function(d) {
                        return d.getBBox()
                    });
                if (!useClass) {
                    if (shape == "line") {
                        shapes.style("stroke", type.feature)
                    } else {
                        shapes.style("fill", type.feature)
                    }
                } else {
                    shapes.attr("class", function(d) {
                        return "swatch " + type.feature(d)
                    })
                }
                var cellTrans, textTrans, textAlign = labelAlign == "start" ? 0 : labelAlign == "middle" ? .5 : 1;
                if (orient === "vertical") {
                    cellTrans = function(d, i) {
                        return "translate(0, " + i * (shapeSize[i].height + shapePadding) + ")"
                    };
                    textTrans = function(d, i) {
                        return "translate(" + (shapeSize[i].width + shapeSize[i].x + labelOffset) + "," + (shapeSize[i].y + shapeSize[i].height / 2 + 5) + ")"
                    }
                } else if (orient === "horizontal") {
                    cellTrans = function(d, i) {
                        return "translate(" + i * (shapeSize[i].width + shapePadding) + ",0)"
                    };
                    textTrans = function(d, i) {
                        return "translate(" + (shapeSize[i].width * textAlign + shapeSize[i].x) + "," + (shapeSize[i].height + shapeSize[i].y + labelOffset + 8) + ")"
                    }
                }
                helper.d3_placement(orient, cell, cellTrans, text, textTrans, labelAlign);
                cell.transition().style("opacity", 1)
            }
            legend.scale = function(_) {
                if (!arguments.length) return legend;
                scale = _;
                return legend
            };
            legend.cells = function(_) {
                if (!arguments.length) return legend;
                if (_.length > 1 || _ >= 2) {
                    cells = _
                }
                return legend
            };
            legend.shape = function(_, d) {
                if (!arguments.length) return legend;
                if (_ == "rect" || _ == "circle" || _ == "line" || _ == "path" && typeof d === "string") {
                    shape = _;
                    path = d
                }
                return legend
            };
            legend.shapeWidth = function(_) {
                if (!arguments.length) return legend;
                shapeWidth = +_;
                return legend
            };
            legend.shapeHeight = function(_) {
                if (!arguments.length) return legend;
                shapeHeight = +_;
                return legend
            };
            legend.shapeRadius = function(_) {
                if (!arguments.length) return legend;
                shapeRadius = +_;
                return legend
            };
            legend.shapePadding = function(_) {
                if (!arguments.length) return legend;
                shapePadding = +_;
                return legend
            };
            legend.labels = function(_) {
                if (!arguments.length) return legend;
                labels = _;
                return legend
            };
            legend.labelAlign = function(_) {
                if (!arguments.length) return legend;
                if (_ == "start" || _ == "end" || _ == "middle") {
                    labelAlign = _
                }
                return legend
            };
            legend.labelFormat = function(_) {
                if (!arguments.length) return legend;
                labelFormat = _;
                return legend
            };
            legend.labelOffset = function(_) {
                if (!arguments.length) return legend;
                labelOffset = +_;
                return legend
            };
            legend.useClass = function(_) {
                if (!arguments.length) return legend;
                if (_ === true || _ === false) {
                    useClass = _
                }
                return legend
            };
            legend.orient = function(_) {
                if (!arguments.length) return legend;
                _ = _.toLowerCase();
                if (_ == "horizontal" || _ == "vertical") {
                    orient = _
                }
                return legend
            };
            return legend
        }
    }, {
        "./legend": 2
    }],
    2: [function(require, module, exports) {
        module.exports = {
            d3_identity: function(d) {
                return d
            },
            d3_mergeLabels: function(gen, labels) {
                if (labels.length === 0) return gen;
                gen = gen ? gen : [];
                var i = labels.length;
                for (; i < gen.length; i++) {
                    labels.push(gen[i])
                }
                return labels
            },
            d3_linearLegend: function(scale, cells, labelFormat) {
                var data = [];
                if (cells.length > 1) {
                    data = cells
                } else {
                    var domain = scale.domain(),
                        increment = (domain[1] - domain[0]) / (cells - 1),
                        i = 0;
                    for (; i < cells; i++) {
                        data.push(labelFormat(domain[0] + i * increment))
                    }
                }
                return {
                    data: data,
                    labels: data,
                    feature: function(d) {
                        return scale(d)
                    }
                }
            },
            d3_quantLegend: function(scale, labelFormat) {
                var labels = scale.range().map(function(d, i) {
                    if (i === 0 || i === 2 || i === 5 || i === 8 || i === 10) {
                        var invert = scale.invertExtent(d);
                        return "" + labelFormat(invert[1])
                    }
                    return ""
                });
                return {
                    data: scale.range(),
                    labels: labels,
                    feature: this.d3_identity
                }
            },
            d3_ordinalLegend: function(scale) {
                return {
                    data: scale.domain(),
                    labels: scale.domain(),
                    feature: function(d) {
                        return scale(d)
                    }
                }
            },
            d3_drawShapes: function(shape, shapes, shapeHeight, shapeWidth, shapeRadius, path) {
                if (shape === "rect") {
                    shapes.attr("height", shapeHeight).attr("width", shapeWidth)
                } else if (shape === "circle") {
                    shapes.attr("r", shapeRadius)
                } else if (shape === "line") {
                    shapes.attr("x1", 0).attr("x2", shapeWidth).attr("y1", 0).attr("y2", 0)
                } else if (shape === "path") {
                    shapes.attr("d", path)
                }
            },
            d3_addText: function(svg, enter, labels) {
                enter.append("text").attr("class", "label");
                svg.selectAll("g.cell text").data(labels).text(this.d3_identity)
            },
            d3_calcType: function(scale, cells, labels, labelFormat) {
                var type = scale.ticks ? this.d3_linearLegend(scale, cells, labelFormat) : scale.invertExtent ? this.d3_quantLegend(scale, labelFormat) : this.d3_ordinalLegend(scale);
                type.labels = this.d3_mergeLabels(type.labels, labels);
                return type
            },
            d3_placement: function(orient, cell, cellTrans, text, textTrans, labelAlign) {
                cell.attr("transform", cellTrans);
                text.attr("transform", textTrans);
                if (orient === "horizontal") {
                    text.style("text-anchor", labelAlign)
                }
            }
        }
    }, {}],
    3: [function(require, module, exports) {
        var helper = require("./legend");
        module.exports = function() {
            var scale = d3.scale.linear(),
                shape = "rect",
                shapeWidth = 15,
                shapePadding = 2,
                cells = [5],
                labels = [],
                useStroke = false,
                labelFormat = d3.format(".01f"),
                labelOffset = 10,
                labelAlign = "middle",
                orient = "vertical",
                path;

            function legend(svg) {
                var type = helper.d3_calcType(scale, cells, labels, labelFormat);
                var cell = svg.selectAll(".cell").data(type.data),
                    cellEnter = cell.enter().append("g", ".cell").attr("class", "cell").style("opacity", 1e-6);
                shapeEnter = cellEnter.append(shape).attr("class", "swatch"), shapes = cell.select("g.cell " + shape);
                cell.exit().transition().style("opacity", 0).remove();
                if (shape === "line") {
                    helper.d3_drawShapes(shape, shapes, 0, shapeWidth);
                    shapes.attr("stroke-width", type.feature)
                } else {
                    helper.d3_drawShapes(shape, shapes, type.feature, type.feature, type.feature, path)
                }
                helper.d3_addText(svg, cellEnter, type.labels);
                var text = cell.select("text"),
                    shapeSize = shapes[0].map(function(d, i) {
                        var bbox = d.getBBox();
                        var stroke = scale(type.data[i]);
                        if (shape === "line" && orient === "horizontal") {
                            bbox.height = bbox.height + stroke
                        } else if (shape === "line" && orient === "vertical") {
                            bbox.width = bbox.width
                        }
                        return bbox
                    });
                var maxH = d3.max(shapeSize, function(d) {
                        return d.height + d.y
                    }),
                    maxW = d3.max(shapeSize, function(d) {
                        return d.width + d.x
                    });
                var cellTrans, textTrans, textAlign = labelAlign == "start" ? 0 : labelAlign == "middle" ? .5 : 1;
                if (orient === "vertical") {
                    cellTrans = function(d, i) {
                        var height = d3.sum(shapeSize.slice(0, i + 1), function(d) {
                            return d.height
                        });
                        return "translate(0, " + (height + i * shapePadding) + ")"
                    };
                    textTrans = function(d, i) {
                        return "translate(" + (maxW + labelOffset) + "," + (shapeSize[i].y + shapeSize[i].height / 2 + 5) + ")"
                    }
                } else if (orient === "horizontal") {
                    cellTrans = function(d, i) {
                        var width = d3.sum(shapeSize.slice(0, i + 1), function(d) {
                            return d.width
                        });
                        return "translate(" + (width + i * shapePadding) + ",0)"
                    };
                    textTrans = function(d, i) {
                        return "translate(" + (shapeSize[i].width * textAlign + shapeSize[i].x) + "," + (maxH + labelOffset) + ")"
                    }
                }
                helper.d3_placement(orient, cell, cellTrans, text, textTrans, labelAlign);
                cell.transition().style("opacity", 1)
            }
            legend.scale = function(_) {
                if (!arguments.length) return legend;
                scale = _;
                return legend
            };
            legend.cells = function(_) {
                if (!arguments.length) return legend;
                if (_.length > 1 || _ >= 2) {
                    cells = _
                }
                return legend
            };
            legend.shape = function(_, d) {
                if (!arguments.length) return legend;
                if (_ == "rect" || _ == "circle" || _ == "line") {
                    shape = _;
                    path = d
                }
                return legend
            };
            legend.shapeWidth = function(_) {
                if (!arguments.length) return legend;
                shapeWidth = +_;
                return legend
            };
            legend.shapePadding = function(_) {
                if (!arguments.length) return legend;
                shapePadding = +_;
                return legend
            };
            legend.labels = function(_) {
                if (!arguments.length) return legend;
                labels = _;
                return legend
            };
            legend.labelAlign = function(_) {
                if (!arguments.length) return legend;
                if (_ == "start" || _ == "end" || _ == "middle") {
                    labelAlign = _
                }
                return legend
            };
            legend.labelFormat = function(_) {
                if (!arguments.length) return legend;
                labelFormat = _;
                return legend
            };
            legend.labelOffset = function(_) {
                if (!arguments.length) return legend;
                labelOffset = +_;
                return legend
            };
            legend.orient = function(_) {
                if (!arguments.length) return legend;
                _ = _.toLowerCase();
                if (_ == "horizontal" || _ == "vertical") {
                    orient = _
                }
                return legend
            };
            return legend
        }
    }, {
        "./legend": 2
    }],
    4: [function(require, module, exports) {
        var helper = require("./legend");
        module.exports = function() {
            var scale = d3.scale.linear(),
                shape = "path",
                shapeWidth = 15,
                shapeHeight = 15,
                shapeRadius = 10,
                shapePadding = 5,
                cells = [5],
                labels = [],
                useClass = false,
                labelFormat = d3.format(".01f"),
                labelAlign = "middle",
                labelOffset = 10,
                orient = "vertical";

            function legend(svg) {
                var type = helper.d3_calcType(scale, cells, labels, labelFormat);
                var cell = svg.selectAll(".cell").data(type.data),
                    cellEnter = cell.enter().append("g", ".cell").attr("class", "cell").style("opacity", 1e-6);
                shapeEnter = cellEnter.append(shape).attr("class", "swatch"), shapes = cell.select("g.cell " + shape);
                cell.exit().transition().style("opacity", 0).remove();
                helper.d3_drawShapes(shape, shapes, shapeHeight, shapeWidth, shapeRadius, type.feature);

                helper.d3_addText(svg, cellEnter, type.labels);
                var text = cell.select("text"),
                    shapeSize = shapes[0].map(function(d) {
                        return d.getBBox()
                    });
                var maxH = d3.max(shapeSize, function(d) {
                        return d.height
                    }),
                    maxW = d3.max(shapeSize, function(d) {
                        return d.width
                    });
                var cellTrans, textTrans, textAlign = labelAlign == "start" ? 0 : labelAlign == "middle" ? .5 : 1;
                if (orient === "vertical") {
                    cellTrans = function(d, i) {
                        return "translate(0, " + i * (maxH + shapePadding) + ")"
                    };
                    textTrans = function(d, i) {
                        return "translate(" + (maxW + labelOffset) + "," + (shapeSize[i].y + shapeSize[i].height / 2 + 5) + ")"
                    }
                } else if (orient === "horizontal") {
                    cellTrans = function(d, i) {
                        return "translate(" + i * (maxW + shapePadding) + ",0)"
                    };
                    textTrans = function(d, i) {
                        return "translate(" + (shapeSize[i].width * textAlign + shapeSize[i].x) + "," + (maxH + labelOffset) + ")"
                    }
                }
                helper.d3_placement(orient, cell, cellTrans, text, textTrans, labelAlign);
                cell.transition().style("opacity", 1)
            }
            legend.scale = function(_) {
                if (!arguments.length) return legend;
                scale = _;
                return legend
            };
            legend.cells = function(_) {
                if (!arguments.length) return legend;
                if (_.length > 1 || _ >= 2) {
                    cells = _
                }
                return legend
            };
            legend.shapePadding = function(_) {
                if (!arguments.length) return legend;
                shapePadding = +_;
                return legend
            };
            legend.labels = function(_) {
                if (!arguments.length) return legend;
                labels = _;
                return legend
            };
            legend.labelAlign = function(_) {
                if (!arguments.length) return legend;
                if (_ == "start" || _ == "end" || _ == "middle") {
                    labelAlign = _
                }
                return legend
            };
            legend.labelFormat = function(_) {
                if (!arguments.length) return legend;
                labelFormat = _;
                return legend
            };
            legend.labelOffset = function(_) {
                if (!arguments.length) return legend;
                labelOffset = +_;
                return legend
            };
            legend.orient = function(_) {
                if (!arguments.length) return legend;
                _ = _.toLowerCase();
                if (_ == "horizontal" || _ == "vertical") {
                    orient = _
                }
                return legend
            };
            return legend
        }
    }, {
        "./legend": 2
    }],
    5: [function(require, module, exports) {
        d3.legend = {
            color: require("./color"),
            size: require("./size"),
            symbol: require("./symbol")
        }
    }, {
        "./color": 1,
        "./size": 3,
        "./symbol": 4
    }]
}, {}, [5]);
