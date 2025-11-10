// public/js/mygraphs.js
// Fetch stats endpoints and render charts using Chart.js

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(url + ' -> ' + res.status);
  return res.json();
}

function makeLineChart(ctx, labels, data) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Views',
        data,
        tension: 0.25,
        borderColor: '#db0000',
        backgroundColor: 'rgba(219,0,0,0.15)',
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: { ticks: { maxRotation: 45, minRotation: 0 } },
        y: { beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  });
}

function makeBarChart(ctx, labels, data) {
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Total Likes',
        data,
        backgroundColor: '#831010'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: { ticks: { autoSkip: false } },
        y: { beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  });
}

async function loadDailyViews() {
  try {
    const json = await fetchJSON('/api/stats/daily-views?days=14');
    const labels = json.data.map(r => r.date);
    const counts = json.data.map(r => r.count);
    const ctx = document.getElementById('dailyViewsChart').getContext('2d');
    if (!labels.length) {
      ctx.font = '16px sans-serif';
      ctx.fillText('No view data yet.', 20, 40);
      return;
    }
    makeLineChart(ctx, labels, counts);
  } catch (e) {
    console.error('daily views failed', e);
  }
}

async function loadPopularGenres() {
  try {
    const json = await fetchJSON('/api/stats/popular-genres?limit=10');
    const labels = json.data.map(r => r.genre);
    const likes = json.data.map(r => r.likes);
    const ctx = document.getElementById('popularGenresChart').getContext('2d');
    if (!labels.length) {
      ctx.font = '16px sans-serif';
      ctx.fillText('No genre data yet.', 20, 40);
      return;
    }
    makeBarChart(ctx, labels, likes);
  } catch (e) {
    console.error('popular genres failed', e);
  }
}

// bootstrap
document.addEventListener('DOMContentLoaded', () => {
  loadDailyViews();
  loadPopularGenres();
});
