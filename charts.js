const palette = {
  extremeFear: '#ef4444',
  fear: '#f97316',
  neutral: '#94a3b8',
  greed: '#22c55e',
  extremeGreed: '#10b981',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  yellow: '#f59e0b',
};

const sentimentColors = [palette.extremeFear, palette.fear, palette.neutral, palette.greed, palette.extremeGreed];

Chart.defaults.color = '#64748b';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 12;

function fmt(n) {
  if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (Math.abs(n) >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
  return '$' + n.toFixed(0);
}

function buildKPIs() {
  const s = CHART_DATA.summary;

  document.getElementById('kpi-trades').textContent = s.total_trades.toLocaleString();
  document.getElementById('kpi-pnl').textContent = fmt(s.total_pnl);
  document.getElementById('kpi-winrate').textContent = s.win_rate + '%';
  document.getElementById('kpi-traders').textContent = s.unique_traders;
  document.getElementById('kpi-sentiment').textContent = s.best_sentiment;
}

function buildSentimentPnLChart() {
  const ctx = document.getElementById('sentimentPnlChart').getContext('2d');
  const d = CHART_DATA.pnl_by_sentiment;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [{
        label: 'Total PnL (USD)',
        data: d.total_pnl,
        backgroundColor: sentimentColors.map(c => c + '33'),
        borderColor: sentimentColors,
        borderWidth: 2,
        borderRadius: 8,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => fmt(ctx.raw)
          }
        }
      },
      scales: {
        x: { grid: { color: '#1e2d4520' } },
        y: {
          grid: { color: '#1e2d4540' },
          ticks: { callback: v => fmt(v) }
        }
      }
    }
  });
}

function buildWinRateChart() {
  const ctx = document.getElementById('winRateChart').getContext('2d');
  const d = CHART_DATA.pnl_by_sentiment;

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: d.labels,
      datasets: [{
        label: 'Win Rate %',
        data: d.win_rate,
        backgroundColor: 'rgba(59,130,246,0.15)',
        borderColor: palette.blue,
        borderWidth: 2,
        pointBackgroundColor: sentimentColors,
        pointRadius: 5,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0, max: 100,
          grid: { color: '#1e2d4540' },
          ticks: { callback: v => v + '%', stepSize: 20 },
          angleLines: { color: '#1e2d4540' },
          pointLabels: { font: { size: 11 }, color: '#94a3b8' }
        }
      }
    }
  });
}

function buildMonthlyChart() {
  const ctx = document.getElementById('monthlyChart').getContext('2d');
  const d = CHART_DATA.monthly;
  const colors = d.values.map(v => v >= 0 ? palette.green + 'cc' : palette.extremeFear + 'cc');
  const borderColors = d.values.map(v => v >= 0 ? palette.green : palette.extremeFear);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [{
        label: 'Monthly PnL',
        data: d.values,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 2,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => fmt(ctx.raw) } }
      },
      scales: {
        x: { grid: { color: '#1e2d4520' } },
        y: { grid: { color: '#1e2d4540' }, ticks: { callback: v => fmt(v) } }
      }
    }
  });
}

function buildHourlyChart() {
  const ctx = document.getElementById('hourlyChart').getContext('2d');
  const d = CHART_DATA.hourly;

  const gradient = ctx.createLinearGradient(0, 0, 0, 200);
  gradient.addColorStop(0, 'rgba(139,92,246,0.4)');
  gradient.addColorStop(1, 'rgba(139,92,246,0)');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: d.labels.map(h => h + ':00'),
      datasets: [{
        label: 'Avg PnL',
        data: d.values,
        borderColor: palette.purple,
        backgroundColor: gradient,
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: palette.purple,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => '$' + ctx.raw.toFixed(2) } }
      },
      scales: {
        x: { grid: { color: '#1e2d4520' } },
        y: { grid: { color: '#1e2d4540' }, ticks: { callback: v => '$' + v } }
      }
    }
  });
}

function buildCoinsChart() {
  const ctx = document.getElementById('coinsChart').getContext('2d');
  const d = CHART_DATA.top_coins;
  const coinColors = [palette.yellow, palette.blue, palette.purple, palette.extremeGreed, palette.orange, '#ec4899', '#14b8a6', '#6366f1'];

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: d.labels,
      datasets: [{
        data: d.values,
        backgroundColor: coinColors.map(c => c + 'cc'),
        borderColor: coinColors,
        borderWidth: 2,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12, boxHeight: 12, padding: 12,
            font: { size: 11 },
            color: '#94a3b8'
          }
        },
        tooltip: { callbacks: { label: ctx => ctx.label + ': ' + fmt(ctx.raw) } }
      }
    }
  });
}

function buildLongShortChart() {
  const ctx = document.getElementById('longShortChart').getContext('2d');
  const d = CHART_DATA.long_short_sentiment;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [
        {
          label: 'Long PnL',
          data: d.long,
          backgroundColor: 'rgba(16,185,129,0.3)',
          borderColor: palette.extremeGreed,
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'Short PnL',
          data: d.short,
          backgroundColor: 'rgba(239,68,68,0.3)',
          borderColor: palette.extremeFear,
          borderWidth: 2,
          borderRadius: 6,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { boxWidth: 12, boxHeight: 12, color: '#94a3b8' }
        },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmt(ctx.raw) } }
      },
      scales: {
        x: { grid: { color: '#1e2d4520' } },
        y: { grid: { color: '#1e2d4540' }, ticks: { callback: v => fmt(v) } }
      }
    }
  });
}

function buildTraderTable() {
  const d = CHART_DATA.top_traders;
  const tbody = document.getElementById('traderTableBody');
  const rankClasses = ['gold', 'silver', 'bronze'];

  d.labels.forEach((label, i) => {
    const pnl = d.total_pnl[i];
    const wr = d.win_rate[i];
    const count = d.trade_count[i];
    const rankClass = i < 3 ? rankClasses[i] : '';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><span class="rank ${rankClass}">${i + 1}</span></td>
      <td style="font-family:monospace;font-size:12px;">${label}</td>
      <td class="${pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}">${fmt(pnl)}</td>
      <td>
        <div class="win-bar">
          <div class="win-bar-bg"><div class="win-bar-fill" style="width:${wr}%"></div></div>
          <span style="font-size:12px;min-width:36px">${wr}%</span>
        </div>
      </td>
      <td style="color:#64748b">${count.toLocaleString()}</td>
    `;
    tbody.appendChild(row);
  });
}

function buildSentimentTable() {
  const d = CHART_DATA.pnl_by_sentiment;
  const tbody = document.getElementById('sentimentTableBody');
  const pillMap = {
    'Extreme Fear': 'pill-extreme-fear',
    'Fear': 'pill-fear',
    'Neutral': 'pill-neutral',
    'Greed': 'pill-greed',
    'Extreme Greed': 'pill-extreme-greed',
  };
  const icons = { 'Extreme Fear': '😱', 'Fear': '😨', 'Neutral': '😐', 'Greed': '😏', 'Extreme Greed': '🤑' };

  d.labels.forEach((label, i) => {
    const pnl = d.total_pnl[i];
    const avg = d.avg_pnl[i];
    const count = d.count[i];
    const wr = d.win_rate[i];

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><span class="sentiment-pill ${pillMap[label]}">${icons[label]} ${label}</span></td>
      <td class="${pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}">${fmt(pnl)}</td>
      <td class="${avg >= 0 ? 'pnl-positive' : 'pnl-negative'}">${fmt(avg)}</td>
      <td>
        <div class="win-bar">
          <div class="win-bar-bg"><div class="win-bar-fill" style="width:${wr}%"></div></div>
          <span style="font-size:12px;min-width:36px">${wr}%</span>
        </div>
      </td>
      <td style="color:#64748b">${count.toLocaleString()}</td>
    `;
    tbody.appendChild(row);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildKPIs();
  buildSentimentPnLChart();
  buildWinRateChart();
  buildMonthlyChart();
  buildHourlyChart();
  buildCoinsChart();
  buildLongShortChart();
  buildTraderTable();
  buildSentimentTable();
});
