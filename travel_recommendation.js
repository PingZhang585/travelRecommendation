const API_URL = "./travel_recommendation_api.json";

let apiData = null;

async function loadData() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch JSON: " + res.status);
  return await res.json();
}

function normalizeKeyword(input) {
  return (input || "").trim().toLowerCase();
}

function clearResults() {
  const results = document.getElementById("results");
  results.innerHTML = "";
}

function showMessage(msg) {
  const results = document.getElementById("results");
  results.innerHTML = `<div class="card"><div class="content"><p>${msg}</p></div></div>`;
}

function buildCards(items) {
  const results = document.getElementById("results");
  results.innerHTML = items
    .map((item) => {
      const imgSrc = item.imageUrl ? `./${item.imageUrl}` : "";
      return `
        <div class="card">
          ${imgSrc ? `<img src="${imgSrc}" alt="${item.name}" />` : ""}
          <div class="content">
            <h3>${item.name}</h3>
            <p>${item.description || ""}</p>
          </div>
        </div>
      `;
    })
    .join("");
}

function getAtLeastTwo(list) {
  return Array.isArray(list) ? list.slice(0, 2) : [];
}

function getCountryCityRecommendations(data) {
  // For keyword "country": we will recommend cities from multiple countries
  // Flatten all cities and take first 2
  const cities = [];
  (data.countries || []).forEach((c) => {
    (c.cities || []).forEach((city) => cities.push(city));
  });
  return cities.slice(0, 2);
}

function handleSearch() {
  const input = document.getElementById("searchInput").value;
  const keyword = normalizeKeyword(input);

  clearResults();

  if (!keyword) {
    showMessage("Please enter a keyword: beach, temple, or country.");
    return;
  }

  // Accept variations (Beach, beaches, BEACH etc.)
  if (keyword.includes("beach")) {
    const items = getAtLeastTwo(apiData.beaches);
    if (items.length < 2) return showMessage("Not enough beach recommendations found in JSON.");
    buildCards(items);
    return;
  }

  if (keyword.includes("temple")) {
    const items = getAtLeastTwo(apiData.temples);
    if (items.length < 2) return showMessage("Not enough temple recommendations found in JSON.");
    buildCards(items);
    return;
  }

  if (keyword.includes("country")) {
    const items = getCountryCityRecommendations(apiData);
    if (items.length < 2) return showMessage("Not enough city recommendations found under countries in JSON.");
    buildCards(items);
    return;
  }

  showMessage("Keyword not recognized. Try: beach, temple, or country.");
}

function handleReset() {
  document.getElementById("searchInput").value = "";
  clearResults();
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    apiData = await loadData();
    console.log("JSON loaded:", apiData);
  } catch (err) {
    console.error(err);
    showMessage("Could not load JSON. Check file name/path and try again.");
    return;
  }

  document.getElementById("searchBtn").addEventListener("click", handleSearch);
  document.getElementById("resetBtn").addEventListener("click", handleReset);
});
