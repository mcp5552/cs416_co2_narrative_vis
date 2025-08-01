// main.js

let sceneIndex = 0; // 0 = Scene 1, 1 = Scene 2, 2 = Scene 3
let data = []; // Global CSV data

// Load data and render first scene
d3.csv("data/owid-co2-data.csv").then(function(loadedData) {
  data = loadedData;
  renderScene(sceneIndex);
});

function renderScene(index) {
  const svg = d3.select("#vis");

  // Style the SVG container to make it visually distinct
  svg
    .style("border", "1px solid #ccc")
    .style("background-color", "#f9f9f9");

  svg.selectAll("*").remove(); // Clear everything

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
}

function renderScene1(svg) {
  // Filter data for World only and valid CO2 values
  const worldData = data.filter(d =>
    d.country === "World" &&
    d.co2 !== "" &&
    d.year !== ""
  ).map(d => ({
    year: +d.year,
    co2: +d.co2
  }));

  // Set up margins and dimensions
  const margin = {top: 50, right: 30, bottom: 50, left: 70};
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const x = d3.scaleLinear()
    .domain(d3.extent(worldData, d => d.year))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(worldData, d => d.co2)])
    .range([height, 0]);

  // Axes
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d"))); // integer years

  g.append("g")
    .call(d3.axisLeft(y));

  // Line generator
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.co2));

  // Line path
  g.append("path")
    .datum(worldData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  // Title annotation
  svg.append("text")
    .attr("x", 400)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .text("Global CO₂ Emissions Over Time");
}

function renderScene2(svg) {
  svg.append("text")
    .attr("x", 400)
    .attr("y", 250)
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .text("Scene 2: CO₂ by Source");
}

function renderScene3(svg) {
  svg.append("text")
    .attr("x", 400)
    .attr("y", 250)
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .text("Scene 3: CO₂ per Capita vs GDP per Capita");
}

// Button event listeners
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
