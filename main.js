// main.js

let sceneIndex = 0; // 0 = Scene 1, 1 = Scene 2, 2 = Scene 3

function renderScene(index) {
  const svg = d3.select("#vis");
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
  svg.append("text")
    .attr("x", 400)
    .attr("y", 250)
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .text("Scene 1: Global CO₂ Over Time");
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

// Initial render
renderScene(sceneIndex);
