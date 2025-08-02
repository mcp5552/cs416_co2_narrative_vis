// main.js 
// D3.js script for rendering interactive CO₂ visualizations across three scenes:
// Scene 1: Line plot of CO₂ emissions over time (world + selectable countries)
// Scene 2: Pie chart of CO₂ emissions by fuel type for a selected country and year
// Scene 3: Scatter plot of CO₂ per capita vs GDP per capita, with bubble size showing population

let sceneIndex = 0; // 0 = Scene 1, 1 = Scene 2, 2 = Scene 3
let data = []; // Global CSV data
let selectedCountries = new Set();

// Load data and render first scene
d3.csv("data/owid-co2-data.csv").then(function(loadedData) {
  data = loadedData;
  renderScene(sceneIndex);
});

function renderScene(index) {
  const svg = d3.select("#vis");
  svg
    .style("border", "1px solid #ccc")
    .style("background-color", "#f9f9f9");
  svg.selectAll("*").remove();

  d3.select("#sceneControls").html("");

  switch(index) {
    case 0:
      renderScene1(svg);
      break;
    case 1:
      renderScene2(svg);
      break;
    case 2:
      renderScene3(svg);
      break;
    default:
      console.warn("Invalid scene index:", index);
  }
  // Page indicator
  d3.select("#pageIndicator").text(`Page: ${index + 1} / 3`);
}

// Scene 1: Line plot of CO₂ emissions over time (world + selectable countries)
function renderScene1(svg) {
  const margin = {top: 50, right: 30, bottom: 50, left: 70};
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const worldData = data.filter(d => d.country === "World" && d.co2 && d.year)
                        .map(d => ({year: +d.year, co2: +d.co2}));

  const x = d3.scaleLinear()
              .domain(d3.extent(worldData, d => d.year))
              .range([0, width]);

  const y = d3.scaleLinear()
              .domain([0, d3.max(data, d => +d.co2 || 0)])
              .range([height, 0]);

  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  g.append("g")
    .call(d3.axisLeft(y));

  // Axis labels
  svg.append("text")
    .attr("x", margin.left + width / 2)
    .attr("y", 490)
    .attr("text-anchor", "middle")
    .text("Year");

  svg.append("text")
    .attr("transform", `translate(15,${margin.top + height / 2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .text("CO₂ Emissions (billion tons)");

  // Title
  svg.append("text")
    .attr("x", margin.left + width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .text("CO₂ Emission by Year");

  // Clean up existing tooltips before creating new one
  d3.selectAll(".tooltip").remove(); 

  // Tooltip div
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "white")
    .style("padding", "5px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.co2));

  g.append("path")
    .datum(worldData)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("d", line);

  g.append("text")
    .attr("x", width - 80)
    .attr("y", y(worldData[worldData.length - 1].co2))
    .attr("fill", "black")
    //.text("World"); // label for "World" line

// Tooltip interaction for "World" line
g.selectAll(".dot")
  .data(worldData)
  .enter()
  .append("circle")
  .attr("class", "dot")
  .attr("cx", d => x(d.year))
  .attr("cy", d => y(d.co2))
  .attr("r", 4)
  .attr("fill", "black")
  .style("opacity", 0)  // Make all dots transparent initially
  .on("mouseover", function(event, d) {
    d3.select(this).style("opacity", 1);  // Highlight hovered dot
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip.html(`Country: World<br>Year: ${d.year}<br>CO₂ Emissions: ${d.co2.toFixed(2)} billion tons`)
           .style("left", (event.pageX + 10) + "px")
           .style("top", (event.pageY - 28) + "px");
  })
  .on("mouseout", function() {
    d3.select(this).style("opacity", 0);  // Re-hide dot
    tooltip.transition().duration(300).style("opacity", 0);
  });

  // Add controls
  const sceneControls = d3.select("#sceneControls");

  sceneControls.append("label").text("Select Country: ");
  const dropdown = sceneControls.append("select")
    .attr("id", "countryDropdown")
    .style("margin-right", "10px")
    .on("change", function() {
      const country = this.value;
      if (!selectedCountries.has(country)) {
        selectedCountries.add(country);
        drawCountryLine(country);
      }
    });

  const uniqueCountries = Array.from(new Set(data.map(d => d.country))).sort();
  uniqueCountries.forEach(country => {
    dropdown.append("option").attr("value", country).text(country);
  });

  // "Clear" button
  sceneControls.append("button")
    .text("Clear")
    .on("click", () => {
      selectedCountries.clear();
      d3.selectAll(".country-line").remove();
      d3.selectAll("circle").filter(function() {
        return d3.select(this).attr("class")?.startsWith("dot-");
      }).remove();
    });
  
  function drawCountryLine(country) {
    const countryData = data.filter(d => d.country === country && d.co2 && d.year)
                            .map(d => ({year: +d.year, co2: +d.co2}));
  
    const color = d3.schemeCategory10[selectedCountries.size % 10];
  
    // Draw line
    g.append("path")
      .datum(countryData)
      .attr("class", "country-line")
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("d", line);
  
    // Invisible dots for tooltip (show on hover only)
    g.selectAll(".dot-" + country.replace(/\s+/g, ""))
      .data(countryData)
      .enter()
      .append("circle")
      .attr("class", "dot-" + country.replace(/\s+/g, ""))
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.co2))
      .attr("r", 4)
      .attr("fill", color)
      .style("opacity", 0)
      .on("mouseover", function(event, d) {
        d3.select(this).style("opacity", 1);
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`Country: ${country}<br>Year: ${d.year}<br>CO₂ Emissions: ${d.co2.toFixed(2)} billion tons`)
               .style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).style("opacity", 0);
        tooltip.transition().duration(300).style("opacity", 0);
      });
  }
}

// Scene 2: Pie chart of CO₂ emissions by fuel type for a selected country and year
function renderScene2(svg) {
  const margin = {top: 50, right: 30, bottom: 50, left: 30};
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;
  const radius = Math.min(width, height) / 2 - 50;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left + width / 2},${margin.top + height / 2})`);

  const sceneControls = d3.select("#sceneControls");

  d3.selectAll(".tooltip").remove(); // Clean existing tooltips before creaitng new one
  
  // Tooltip div
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "white")
    .style("padding", "5px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Populate dropdowns
  sceneControls.append("label").text("Select Country: ");
  const countryDropdown = sceneControls.append("select")
    .attr("id", "countrySelect")
    .style("margin-right", "20px");

  sceneControls.append("label").text("Select Year: ");
  const yearDropdown = sceneControls.append("select")
    .attr("id", "yearSelect");

  const countries = Array.from(new Set(data.map(d => d.country))).sort();
  const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => +a - +b);

  countries.forEach(c => countryDropdown.append("option").attr("value", c).text(c));
  years.forEach(y => yearDropdown.append("option").attr("value", y).text(y));

  countryDropdown.property("value", "World");
  yearDropdown.property("value", "2022");

  drawPieChart("World", "2022");

  countryDropdown.on("change", () => {
    drawPieChart(countryDropdown.property("value"), yearDropdown.property("value"));
  });

  yearDropdown.on("change", () => {
    drawPieChart(countryDropdown.property("value"), yearDropdown.property("value"));
  });

  function drawPieChart(country, year) {
    g.selectAll("*").remove();
    svg.selectAll(".scene-title").remove(); // Remove previous title
    svg.append("text")
      .attr("class", "scene-title")
      .attr("x", svg.attr("width") / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .text(`Emissions Breakdown: ${country}`);

    const entry = data.find(d => d.country === country && d.year === year);
    
    if (!entry) {
      g.append("text").text("No data available").attr("text-anchor", "middle");
      return;
    }

    const sources = {
      Coal: +entry.coal_co2 || 0,
      Oil: +entry.oil_co2 || 0,
      Gas: +entry.gas_co2 || 0,
      Cement: +entry.cement_co2 || 0,
      Flaring: +entry.flaring_co2 || 0,
      Other: +entry.other_industry_co2 || 0
    };

    const total = Object.values(sources).reduce((sum, v) => sum + v, 0);
    const pie = d3.pie().value(d => d[1]);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const color = d3.scaleOrdinal()
      .domain(Object.keys(sources))
      .range(d3.schemeCategory10);

    const pieData = pie(Object.entries(sources).filter(d => d[1] > 0));

    const arcs = g.selectAll("path")
      .data(pieData)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data[0]))
      .attr("stroke", "white")
      .attr("stroke-width", "1px")
      
      // Pie chart tooltip
      .on("mouseover", function(event, d) {
        d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(
          `Fuel type: ${d.data[0]}<br>` +
          `Percentage of Emissions: ${(d.data[1]/total*100).toFixed(1)}%<br>` +
          `Emissions: ${d.data[1].toFixed(2)} billion tons`
        )
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("stroke", "white").attr("stroke-width", 1);
        tooltip.transition().duration(300).style("opacity", 0);
      });
  }
}

// Scene 3: Scatter plot of CO₂ per capita vs GDP per capita, with bubble size showing population
function renderScene3(svg) {
  const margin = {top: 50, right: 30, bottom: 50, left: 70};
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const sceneControls = d3.select("#sceneControls");
  sceneControls.html(""); // Clear previous controls

  sceneControls.append("label").text("Select Year: ");
  const yearDropdown = sceneControls.append("select")
    .attr("id", "yearDropdown")
    .style("margin-right", "20px");

  const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => +a - +b);
  years.forEach(y => yearDropdown.append("option").attr("value", y).text(y));
  yearDropdown.property("value", "2022");

  drawScatter("2022");

  yearDropdown.on("change", () => {
    drawScatter(yearDropdown.property("value"));
  });

  function drawScatter(selectedYear) {
    g.selectAll("*").remove();
    svg.selectAll(".scene-title").remove(); // Clear any previous title
    svg.append("text")
      .attr("class", "scene-title")
      .attr("x", svg.attr("width") / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .text("CO₂ per Capita (tons) vs GDP per Capita (USD)");

    // Debugging logs
    console.log("Example row before filtering:", data[0]);
    console.log("Column names in data:", Object.keys(data[0]));
    console.log("Selected year (from dropdown):", selectedYear);

    const yearData = data.filter(d =>
      String(d.year).trim() === String(selectedYear).trim() &&
      d.gdp && +d.gdp > 0 &&
      d.population && +d.population > 0 &&
      d.co2_per_capita && +d.co2_per_capita > 0
    );

    // Compute GDP per capita
    yearData.forEach(d => {
      d.gdp_per_capita = +d.gdp / +d.population;
    });

    console.log("Filtered data points:", yearData.length);
    console.log("Sample GDP per capita:", yearData.slice(0, 5).map(d => d.gdp_per_capita));

    const x = d3.scaleLinear()
      .domain([0, d3.max(yearData, d => d.gdp_per_capita)])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(yearData, d => +d.co2_per_capita)])
      .range([height, 0]);

    const r = d3.scaleSqrt()
      .domain([0, d3.max(yearData, d => +d.population)])
      .range([2, 20]);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append("g")
      .call(d3.axisLeft(y));

    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .text("GDP per Capita (USD)");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .text("CO₂ per Capita (tons)");

    d3.selectAll(".tooltip").remove(); // clean existing tooltips before creating new ones
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "5px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    g.selectAll("circle")
      .data(yearData)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.gdp_per_capita))
      .attr("cy", d => y(+d.co2_per_capita))
      .attr("r", d => r(+d.population))
      .attr("fill", "steelblue")
      .attr("opacity", 0.7)
      .on("mouseover", function(event, d) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(
          `Country: ${d.country}<br>` +
          `GDP per Capita: $${d.gdp_per_capita.toFixed(0).toLocaleString()}<br>` +
          `CO₂ per Capita: ${(+d.co2_per_capita).toFixed(2)} tons<br>` +
          `Population: ${(+d.population).toLocaleString()}`
        )
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        tooltip.transition().duration(300).style("opacity", 0);
      });
  }
}

// Navigation buttons for switching between scenes
d3.select("#nextBtn").on("click", () => {
  if (sceneIndex < 2) {
    sceneIndex++;
    renderScene(sceneIndex);
  }
});

d3.select("#backBtn").on("click", () => {
  if (sceneIndex > 0) {
    sceneIndex--;
    renderScene(sceneIndex);
  }
});
