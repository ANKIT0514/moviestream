const apiKey = "ff198e7c68f8a800daa29e0e0d632644"; // Replace this

// 🔍 Redirect to results page
document.getElementById("searchButton")?.addEventListener("click", () => {
  const query = document.getElementById("searchInput").value.trim();
  const type = document.getElementById("typeSelect").value;
  if (query) {
    window.location.href = `results.html?query=${encodeURIComponent(query)}&type=${type}`;
  }
});

// 🎬 Load Trending Movies & Series
async function loadTrending() {
  const trendingList = document.getElementById("trendingList");
  if (!trendingList) return;

  try {
    const movieRes = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`);
    const seriesRes = await fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}`);

    const [movieData, seriesData] = await Promise.all([movieRes.json(), seriesRes.json()]);
    const allTrending = [...movieData.results.slice(0, 6), ...seriesData.results.slice(0, 6)];

    trendingList.innerHTML = "";
    allTrending.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("trending-item");
      const title = item.title || item.name;
      const year = (item.release_date || item.first_air_date || "").split("-")[0];
      div.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${title}">
        <p>${title} (${year || "N/A"})</p>
      `;
      div.addEventListener("click", () => {
        const type = item.title ? "movie" : "tv";
        window.location.href = `player.html?type=${type}&id=${item.id}`;
      });
      trendingList.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading trending:", err);
  }
}

// 🔎 Load Search Results
async function loadResults() {
  const resultsList = document.getElementById("resultsList");
  if (!resultsList) return;

  const params = new URLSearchParams(window.location.search);
  const query = params.get("query");
  const type = params.get("type");

  try {
    const res = await fetch(`https://api.themoviedb.org/3/search/${type}?api_key=${apiKey}&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    resultsList.innerHTML = "";

    data.results.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("trending-item");
      const title = item.title || item.name;
      const year = (item.release_date || item.first_air_date || "").split("-")[0];
      div.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${title}">
        <p>${title} (${year || "N/A"})</p>
      `;
      div.addEventListener("click", () => {
        const contentType = item.title ? "movie" : "tv";
        window.location.href = `player.html?type=${contentType}&id=${item.id}`;
      });
      resultsList.appendChild(div);
    });
  } catch (error) {
    console.error("Error fetching results:", error);
  }
}

// ▶️ Load Player Page
async function loadPlayer() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");
  const id = params.get("id");
  const playerFrame = document.getElementById("playerFrame");
  const playerSection = document.getElementById("playerSection");
  const seriesSelector = document.getElementById("seriesSelector");
  const seriesTitle = document.getElementById("seriesTitle");
  const seasonSelect = document.getElementById("seasonSelect");
  const episodesList = document.getElementById("episodesList");

  if (!id || !type) return;

  // 🎬 For Movies
  if (type === "movie") {
    playerSection.style.display = "flex";
    playerFrame.src = `https://www.vidking.net/embed/movie/${id}?color=ff69b4&autoPlay=true`;
    return;
  }

  // 📺 For Series
  seriesSelector.style.display = "block";
  seriesTitle.textContent = "Loading Series Info...";

  try {
    // Get Series details
    const response = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}`);
    const data = await response.json();
    seriesTitle.textContent = data.name || "Series";

    // Populate seasons
    seasonSelect.innerHTML = "";
    data.seasons
  .filter(season => season.season_number !== 0) // hides 'Specials'
  .forEach(season => {

      const option = document.createElement("option");
      option.value = season.season_number;
      option.textContent = `${season.name} (${season.episode_count} Episodes)`;
      seasonSelect.appendChild(option);
    });

    // Load episodes of first season by default
    loadEpisodes(id, seasonSelect.value);

    // Change season -> load episodes
    seasonSelect.addEventListener("change", () => {
      loadEpisodes(id, seasonSelect.value);
    });
  } catch (err) {
    console.error("Error loading series info:", err);
  }
}

// 🎞 Load Episodes
async function loadEpisodes(seriesId, seasonNumber) {
  const episodesList = document.getElementById("episodesList");
  const playerSection = document.getElementById("playerSection");
  const playerFrame = document.getElementById("playerFrame");

  episodesList.innerHTML = "<p>Loading episodes...</p>";

  try {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?api_key=${apiKey}`);
    const data = await res.json();

    episodesList.innerHTML = "";
    data.episodes.forEach(ep => {
      const btn = document.createElement("button");
      btn.textContent = `Episode ${ep.episode_number}: ${ep.name}`;
      btn.classList.add("episode-btn");
      btn.addEventListener("click", () => {
        playerSection.style.display = "flex";
        playerFrame.src = `https://www.vidking.net/embed/tv/${seriesId}/${seasonNumber}/${ep.episode_number}?color=ff69b4&autoPlay=true`;
      });
      episodesList.appendChild(btn);
    });
  } catch (error) {
    console.error("Error loading episodes:", error);
    episodesList.innerHTML = "<p>Failed to load episodes.</p>";
  }
}
// 🧩 Run appropriate functions based on page
window.addEventListener("DOMContentLoaded", () => {
  loadTrending();
  loadResults();
  loadPlayer();
});
