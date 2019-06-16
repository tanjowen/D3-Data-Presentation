var svgWidth = 860;
var svgHeight = 500;

var margin = {
	top: 30,
	bottom: 100,
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

var chosenXAxis = "poverty" || "age" || "income";
var chosenYAxis = "healthcare" || "smokes" || "obesity";

function xScale(myData, chosenXAxis) {
	var xLinearScale = d3.scaleLinear()
		.domain([d3.min(myData, d => d[chosenXAxis]) * 0.8,
			d3.max(myData, d => d[chosenXAxis]) * 1.2])
		.range([0, width]);
	return xLinearScale;
}

function yScale(myData, chosenYAxis) {
	var yLinearScale = d3.scaleLinear()
		.domain([d3.min(myData, d => d[chosenYAxis]) * 0.6,
			d3.max(myData, d => d[chosenYAxis]) * 1.0])
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


function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
	circlesGroup.transition()
		.duration(1000)
		.attr("cx", d => newXScale(d[chosenXAxis]))
		.attr("cy", d => newYScale(d[chosenYAxis]));

	return circlesGroup;
}


function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
                .duration(1000)
                .attr("dx", d => newXScale(d[chosenXAxis])-d.income/8000)
                .attr("dy", d => newYScale(d[chosenYAxis])+d.income/8000);
    return textGroup;
}


function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
	if (chosenXAxis === "poverty") {
		var xlabel = "In Poverty (%):";
	}
	else if (chosenXAxis === "age") {
		var xlabel = "Age (Median):";
	}
	else {
		var xlabel = "Household Income (Median):";
	}


	if (chosenYAxis === "healthcare") {
		var ylabel = "Lacks Healthcare(%):";
	}
	else if (chosenYAxis === "smokes") {
		var ylabel = "Smokes (%):";
	}
	else {
		var ylabel = "Obesity (%):";
	}


	var toolTip = d3.tip()
		.attr("class", "d3-tip")
		.offset([80, -60])
		.html(function(d) {
			return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
		});

	circlesGroup.call(toolTip);

	circlesGroup.on("mouseover", function(data) {
		toolTip.show(data, this);
	})
		.on("mouseout", function(data, index) {
			toolTip.hide(data, this);
		});

	return circlesGroup;
}

d3.csv('assets/data/data.csv').then(function(myData) {

	myData.forEach(function(data) {
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.poverty = +data.poverty;
        data.smokes = +data.smokes;
        data.income = +data.income;
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
		.call(leftAxis);

	var circlesGroup = chartGroup.selectAll("circle")
		.data(myData)
		.enter()
		.append("circle")
		.attr("class","stateCircle")
		.attr("cx", d => xLinearScale(d[chosenXAxis]))
		.attr("cy", d => yLinearScale(d[chosenYAxis]))
		.attr("r", 15);

	var textGroup = chartGroup.selectAll("text")
        .data(myData, function(d,i) {
        	return d + i;
        	})
        .enter()
       	.append("text")
       	.attr("class", "stateText")
       	.text(function(d) {
            return d.abbr;
         	});

    var xlabelsGroup = chartGroup.append("g");
    var ylabelsGroup = chartGroup.append("g");

	var povertyLabel = xlabelsGroup.append("text")
		.attr("transform", `translate(${width / 2}, ${height + margin.top +10})`)
		.attr("value", "poverty")
		.attr("class", "aText")
		.classed("active", true)
		.text("In Poverty (%)");

	var ageLabel = xlabelsGroup.append("text")
		.attr("transform", `translate(${width / 2}, ${height + margin.top +30})`)
    	.attr("value", "age") 
    	.attr("class", "aText")
    	.classed("inactive", true)
    	.text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top +50})`)
        .attr("value", "income") 
        .attr("class", "aText")
        .classed("inactive", true)
        .text("Household Income (Median)");

    var healthcareLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "healthcare") 
        .attr("class", "aText")
        .classed("active", true)        
        .text("Lacks Healthcare (%)");

    var smokeLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "smokes") 
        .attr("class", "aText")
        .classed("inactive", true)
        .text("Smokes (%)");

    var obesityLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "obesity") 
        .attr("class", "aText")
        .classed("inactive", true)
        .text("Obesity (%)");

	var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

	xlabelsGroup.selectAll("text")
		.on("click", function() {
			var xValue = d3.select(this).attr("value");
			if (xValue !== chosenXAxis) {

				chosenXAxis = xValue;

				xLinearScale = xScale(myData, chosenXAxis);

				xAxis = renderXAxes(xLinearScale, xAxis);

				circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

				circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

				textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

				if (chosenXAxis === "poverty") {
					povertyLabel
						.classed("active", true)
						.classed("inactive", false);
					ageLabel
						.classed("active", false)
						.classed("inactive", true);
					incomeLabel
						.classed("active", false)
						.classed("inactive", true);
				}
				else if (chosenXAxis === "age") {
					ageLabel
						.classed("active", true)
						.classed("inactive", false);
					povertyLabel
						.classed("active", false)
						.classed("inactive", true);
					incomeLabel
						.classed("active", false)
						.classed("inactive", true);
				}
				else {
					ageLabel
						.classed("active", false)
						.classed("inactive", true);
					povertyLabel
						.classed("active", false)
						.classed("inactive", true);
					incomeLabel
						.classed("active", true)
						.classed("inactive", false);
				}
			}
		});


	ylabelsGroup.selectAll("text")
		.on("click", function() {
			var yValue = d3.select(this).attr("value");
			if (yValue !== chosenYAxis) {

				chosenYAxis = yValue;

				yLinearScale = yScale(myData, chosenYAxis);

				yAxis = renderYAxes(yLinearScale, yAxis);

				circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

				circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

				textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

				if (chosenYAxis === "obesity") {
	                obesityLabel
	                	.classed("active", true)
	                 	.classed("inactive", false);
	                smokeLabel
	                 	.classed("active", false)
	                 	.classed("inactive", true);
	                healthcareLabel
	                 	.classed("active", false)
	                  	.classed("inactive", true);
	            }
	            else if (chosenYAxis === "smokes") {
	                obesityLabel
	                  	.classed("active", false)
	                	.classed("inactive", true);
	                smokeLabel
	                  	.classed("active", true)
	                  	.classed("inactive", false);
	                healthcareLabel
	                  	.classed("active", false)
	                  	.classed("inactive", true);
	            }
	            else { 
	              	obesityLabel
	                	.classed("active", false)
	                	.classed("inactive", true);
	              	smokeLabel
	                	.classed("active", false)
	                	.classed("inactive", true);
	              	healthcareLabel
	                	.classed("active", true)
	                	.classed("inactive", false);
	            }    
			}
		});
})
.catch(function(error){
  // handle error   
  throw error;
});
