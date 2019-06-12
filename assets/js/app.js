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

function xScale()