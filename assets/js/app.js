var svgWidth = 960;
var svgHeight = 500;

var margin = {
	top: 20;
	bottom: 40;
	right: 40;
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
	.attr("transform", `translate(${margin.left}, ${margin.top}`);

var chosenXAxis = "poverty";

function xScale(data, chosenXAxis) {
	var xLinearScale = d3.scaleLinear()
		.domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
			d3.max(data, d => d[chosenXAxis]) * 1.2
		])
		.range([0, width]);
	return xLinearScale;
}


function renderAxes(newXScale, xAxis) {
	var bottomAxis = d3.axisBottom(newXScale);

	xAxis.transition()
		.duration(1000)
		.call(bottomAxis);

	return xAxis;
}


function rendercircles(circlesGroup, newXScalem chosenXAxis) {
	circlesGroup.transition()
		.duration(1000)
		.attr("cx", d => newXScale(d[chosenXAxis]));

	return circlesGroup;
}


function updateToolTip(chosenXAxis, circlesGroup) {
	if (chosenXAxis === "poverty") {
		var label = "In Poverty (%)";
	}
	else {
		var label = "Age (Median)";
	}

	var toolTip = d3.tip()
		.attr("class", "toolTip")
		.offset([80, -60])
		.html(function(d) {
			return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
		});

	circlesGroup.call(toolTip);

	circlesGroup.on("mouseover", function(data) {
		toolTip.show(data);
	})

		.on("mouseout", function(data, index) {
			toolTip.hide(data);
		});

	return circlesGroup;
}


d3.csv("data.csv", function(err, data) {
	if (err) throw err;


	data.forEach(function(data) {
		data.poverty = +data.poverty;
		data.age = +data.age;
		data.healthcare = +data.healthcare;
	});

	var xLinearScale = xScale(data, chosenXAxis);

	var yLinearScale = d3.scaleLinear()
		.domain([0, d3.max(data, d => d.healthcare)])
		.range([height, 0]);

	
})