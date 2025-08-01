// main.js

let sceneIndex = 0; // 0 = Scene 1, 1 = Scene 2, 2 = Scene 3
let data = [];      // Global CSV data
let selectedCountries = ["World"]; // Scene 1 starts with World

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

  svg.selectAll("*").remove();                 // Clear SVG
  d3.select("#sceneControls").html("");        // Clear scene-specific UI

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
  // Scene 1 UI: dropdown + clear
  const controls = d3.select("#sceneControls");

  controls.append("label")
    .attr("for", "countrySelect")
    .text("Add country: ");

  controls.append("select")
    .attr("id", "countrySelect")
    .selectAll("option")
    .data([...new Set(data.map(d => d.country))].sort())
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  controls.append("button")
    .attr("id", "clearBtn")
    .text("Clear");

  d3.select("#countrySelect").on("change", function () {
    const newCountry = this.value;
    if (!selectedCountries.includes(newCountry)) {
      selectedCountries.push(newCountry);
      renderScene(sceneIndex);
    }
  });

  d3.select("#clearBtn").on("click", function () {
    selectedCountries = ["World"];
    renderScene(sceneIndex);
  });

  // Filter and format data
  const plotData = data
    .filter(d => selectedCountries.includes(d.country) && d.co2 !== "")
    .map(d => ({
      country: d.country,
      year: +d.year,
      co2: +d.co2
    }));

  // Set up margins and dimensions
  const margin = { top: 50, right: 30, bottom: 60, left: 80 };
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const x = d3.scaleLinear()
    .domain(d3.extent(plotData, d => d.year))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(plotData, d => d.co2)])
    .range([height, 0]);

  // Axes
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  g.append("g")
    .call(d3.axisLeft(y));

  // Axis labels
  svg.append("text")
    .attr("x", 400)
    .attr("y", 490)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Year");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -250)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("CO₂ emissions (billions of tons)");

  // Chart title
  svg.append("text")
    .attr("x", 400)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .text("CO₂ Emission by Year");

  // Line generator
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.co2));

  // Group data by country
  const countries = d3.group(plotData, d => d.country);

  const color = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(selectedCountries);

  countries.forEach((values, country) => {
    g.append("path")
      .datum(values)
      .attr("fill", "none")
      .attr("stroke", color(country))
      .attr("stroke-width", 2)
      .attr("d", line);
  });
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

// Scene navigation buttons (next & back)
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
