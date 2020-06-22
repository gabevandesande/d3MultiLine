/*eslint-env es6*/
/*eslint-env browser*/
/*eslint no-console: 0*/
/*global d3 */

var svg = d3.select("svg"), //Establish margins and dimensions of svg
    margin = {
        top: 30,
        right: 80,
        bottom: 35,
        left: 50
    },
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%Y"); //Parses incoming data from tsv to be read as a year value

var x = d3.scaleTime().range([0, width]),     // Set x scale
    y = d3.scaleLinear().range([height, 0]),  // Set y scale
    z = d3.scaleOrdinal(d3.schemeCategory10); // Set z scale to be used to establish color

var line = d3.line() //Draw line according to date and consumption data, using curveBasis to interpolate
    .curve(d3.curveBasis)
    .x(function (d) {
        return x(d.date);
    })
    .y(function (d) {
        return y(d.consumption);
    });

d3.csv("BRICSdata.csv", type).then(function (data) { //Read the data

    var countries = data.columns.slice(1).map(function (id) { //Slices first column to distinguish countries
        return {
            id: id,
            values: data.map(function (d) {
                return {
                    date: d.date,
                    consumption: d[id] //Set data variables
                };
            })
        };
    });

    console.log(countries); //Various console calls to debug as we go, showing data values in the console as they are read
    console.log(data);
    console.log(data.columns);
    console.log(data.length);
    console.log(data.columns.slice(1));
    console.log(data.columns.slice(1).map(function (dummy) {
        return dummy.toUpperCase();
    }));
    console.log(data.columns.slice(1).map(function (c) {
        return c
    }));
    console.log(d3.extent(data, function (d) {
        return d.date;
    }));

    x.domain(d3.extent(data, function (d) {
        return d.date;
    }));

    y.domain([0,
    d3.max(countries, function (c) {
            return d3.max(c.values, function (d) {
                return d.consumption;
            });
        })
  ]);

    z.domain(countries.map(function (c) {
        return c.id;
    }));


    g.append("g") //Create x axis line
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .attr("fill", "#000")
        .call(d3.axisBottom(x));
        
    g.append("text") //Label x axis
        .attr("y", height+margin.bottom)
        .attr("x", width/2)
        .style("text-anchor", "middle")
        .text("Year");

    g.append("g") //Create y axis
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em");
    
    g.append("text") //Label y axis
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Million BTUs per Person");

    var country = g.selectAll(".country") //Associates data points with a class 'country'
        .data(countries)
        .enter().append("g")
        .attr("class", "country");

    var path = country.append("path")
        .attr("class", "line")
        .attr("d", function (d) {
            return line(d.values);
        })
        .style("stroke", function (d) { //Sets color of lines to our previously created z function, which provides coloring based on range of data values
            return z(d.id);
        });
    
    var totalLength = path.node().getTotalLength(); //Find total length of paths

    path
      .attr("stroke-dasharray", totalLength + " " + totalLength) //Transition effect of line drawing
      .attr("stroke-dashoffset", totalLength)
      .transition()
        .duration(2000) //Duration of animation
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0); //Starts line at a certain point


    country.append("text")
        .datum(function (d) {
            return {
                id: d.id,
                value: d.values[d.values.length - 1]
            };
        })
        .attr("transform", function (d) {
            return "translate(" + x(d.value.date) + "," + y(d.value.consumption) + ")";
        })
        .attr("x", 3)
        .attr("dy", "0.35em")
        .attr("fill", function (d) {
            return z(d.id); //Sets color of country labels
        })
        .style("font", "10px sans-serif")
        .text(function (d) {
            return d.id; //Sets font of country labels
        });
});

function type(d, _, columns) { //Parse time function to be used on data date, so that it reads correctly --used from starter code--
    d.date = parseTime(d.date);
    for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
    return d;
}