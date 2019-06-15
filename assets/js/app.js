var svgWidth = 960;
var svgHeight = 500;

var margin = {
	top: 20,
	bottom: 80,
	right: 40,
	left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
	.select("#scatter")
	.append("svg")
	.attr("width", svgWidth)
	.attr("height", svgHeight);

var chartGroup = svg.append("g")
	.attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

function xScale(myData, chosenXAxis) {
	var xLinearScale = d3.scaleLinear()
		.domain([d3.min(myData, d => d[chosenXAxis]) * 0.8,
			d3.max(myData, d => d[chosenXAxis]) * 1.2
		])
		.range([0, width]);
	return xLinearScale;
}

function yScale(myData, chosenYAxis) {
	var yLinearScale = d3.scaleLinear()
		.domain([d3.min(myData, d => d[chosenYAxis]),
			d3.max(myData, d => d[chosenYAxis]) *1.2])
		.range([height, 0]);
	return yLinearScale;
}


function renderXAxes(newXScale, xAxis) {
	var bottomAxis = d3.axisBottom(newXScale);

	xAxis.transition()
		.duration(1000)
		.call(bottomAxis);

	return xAxis;
}

function renderYAxes(newYScale, yAxis) {
	var leftAxis = d3.axisLeft(newYScale);

	yAxis.transition()
		.duration(1000)
		.call(leftAxis);

	return yAxis;
}


function renderCircles(circlesGroup, newXScale, chosenXAxis) {
	circlesGroup.transition()
		.duration(1000)
		.attr("cx", d => newXScale(d[chosenXAxis]));

	return circlesGroup;
}


function updateToolTip(chosenXAxis, circlesGroup) {
	if (chosenXAxis === "poverty") {
		var label = "Poverty:";
	}
	else {
		var label = "Age (Median):";
	}

	var toolTip = d3.tip()
		.attr("class", "d3-tip")
		.offset([80, -60])
		.html(function(d) {
			return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
		});

	circlesGroup.call(toolTip);

	circlesGroup.on("mouseover", function(data) {
		toolTip.show(data, this);
	})

		.on("mouseout", function(data, index) {
			toolTip.hide(data);
		});

	return circlesGroup;
}

d3.csv('assets/data/data.csv').then(function(myData) {

	myData.forEach(function(data) {
		data.poverty = +data.poverty;
		data.age = +data.age;
		data.healthcare = +data.healthcare;
	});

	console.log(myData);

	var xLinearScale = xScale(myData, chosenXAxis);

	var yLinearScale = yScale(myData, chosenYAxis);

	var bottomAxis = d3.axisBottom(xLinearScale);
	var leftAxis = d3.axisLeft(yLinearScale);

	var xAxis = chartGroup.append("g")
		.classed("x-axis", true)
		.attr("transform", `translate(0, ${height})`)
		.call(bottomAxis);

	var yAxis = chartGroup.append("g")
		.classed("y-axis", true)
		.attr("transform", `translate(0, ${height})`)
		.call(bottomAxis);
	chartGroup.append("g")
		.call(leftAxis);

	var circlesGroup = chartGroup.selectAll("circle")
		.data(myData)
		.enter()
		.append("circle")
		.classed("stateCircle", true)
		.attr("cx", d => xLinearScale(d[chosenXAxis]))
		.attr("cy", d => yLinearScale(d.healthcare))
		.attr("r", 15);



	var labelsGroup = chartGroup.append("g")
		.attr("transform", `translate(${width / 2}, ${height + 20})`);

	var povertyLabel = labelsGroup.append("text")
		.attr("x", 0)
		.attr("y", 20)
		.attr("value", "poverty")
		.classed("active", true)
		.text("In Poverty (%)");

	var ageLabel = labelsGroup.append("text")
		.attr("x", 0)
    	.attr("y", 40)
    	.attr("value", "age") 
    	.classed("inactive", true)
    	.text("Age (Median)");

    var healthcareLabel = labelsGroup.append("text")
    	.attr("transform", "rotate(-90)")
    	.attr("y", 0 - margin.left)
    	.attr("x", 0- (height / 2))
    	.attr("dy", "1em")
    	.classed("aText", true)
    	.text("Lacks Healthcare (%)")

	var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

	labelsGroup.selectAll("text")
		.on("click", function() {
			var value = d3.select(this).attr("value");
			if (value !== chosenXAxis) {

				chosenXAxis = value;

				xLinearScale = xScale(myData, chosenXAxis);

				xAxis = renderXAxes(xLinearScale, xAxis);

				circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

				circlesGroup = updateToolTip(chosenXAxis, circlesGroup);


				if (chosenXAxis === "age") {
					ageLabel
						.classed("active", true)
						.classed("inactive", false);
					povertyLabel
						.classed("active", false)
						.classed("inactive", true);
				}
				else {
					ageLabel
						.classed("active", false)
						.classed("inactive", true);
					povertyLabel
						.classed("active", true)
						.classed("inactive", false);
				}
			}

			if (value !== chosenYAxis) {

				chosenYAxis = value;

				yLinearScale = yScale(myData, chosenYAxis);

				yAxis = renderYAxes(yLinearScale, yAxis);

				circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

				circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

					if (chosenYAxis === "healthcare") {
					healthcareLabel
						.classed("active", true)
						.classed("inactive", false);
					// povertyLabel
					// 	.classed("active", false)
					// 	.classed("inactive", true);
				}			
			}

		});
})
.catch(function(error){
  // handle error   
  throw error;
})
