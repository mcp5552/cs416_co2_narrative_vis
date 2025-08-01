// main.js

// Global variables
let sceneIndex = 0;
let data = [];

// Load CSV data
d3.csv("data/owid-co2-data.csv").then(function(loadedData) {
  data = loadedData;
  renderScene(sceneIndex);
});

// Render the current scene
function renderScene(index) {
  d3.select("#vis").html(""); // Clear existing SVG/content

  switch(index) {
    case 0:
      renderScene1();
      break;
    case 1:
      renderScene2();
      break;
    case 2:
      renderScene3();
      break;
    default:
      console.warn("Unknown scene index:", index);
  }
}

// Scene 1 placeholder
function renderScene1() {
  d3.select("#vis").append("p").text("Scene 1: Global CO₂ over time");
  console.log("Rendering Scene 1");
}

// Scene 2 placeholder
function renderScene2() {
  d3.select("#vis").append("p").text("Scene 2: CO₂ by source (pie chart)");
  console.log("Rendering Scene 2");
}

// Scene 3 placeholder
function renderScene3() {
  d3.select("#vis").append("p").text("Scene 3: CO₂ per capita vs GDP per capita");
  console.log("Rendering Scene 3");
}

// Navigation buttons
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
