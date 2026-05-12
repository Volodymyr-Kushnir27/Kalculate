import React, { useEffect, useRef, useState } from "react";
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BarController,
} from "chart.js";
import "./App.css";

Chart.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BarController
);

// Для Render картинки з public/assets відкриваються від кореня сайту:
// public/assets/logo.png => /assets/logo.png
const ASSET_BASE = `${import.meta.env.BASE_URL}assets/`;

const logo = `${ASSET_BASE}Log1.png`;
const youtube = `${ASSET_BASE}youTube.png`;
const telegram = `${ASSET_BASE}telegram.png`;

function App() {
  const [time, setTime] = useState("");
  const [initial, setInitial] = useState(0);
  const [monthly, setMonthly] = useState(0);
  const [interest, setInterest] = useState(15);
  const [years, setYears] = useState(12);
  const [finalBalance, setFinalBalance] = useState(0);
  const [contribution, setContribution] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString("uk-UA"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  const formatMoney = (value) => {
    return `$${Number(value || 0).toFixed(2)}`;
  };

  const handleCalculate = () => {
    const P = Number(initial);
    const C = Number(monthly);
    const annualRate = Number(interest);
    const t = Number(years);

    if (
      Number.isNaN(P) ||
      Number.isNaN(C) ||
      Number.isNaN(annualRate) ||
      Number.isNaN(t) ||
      P < 0 ||
      C < 0 ||
      annualRate < 0 ||
      t <= 0
    ) {
      alert("Введіть коректні числа.");
      return;
    }

    const r = annualRate / 100;
    const n = 12;
    const months = t * n;

    let balance = P;
    const labels = [];
    const ownContributions = [];
    const interestEarned = [];

    for (let month = 1; month <= months; month++) {
      balance += C;
      balance += balance * (r / n);

      if (month % 12 === 0) {
        const year = month / 12;
        const invested = P + C * month;
        const profit = balance - invested;

        labels.push(`${year} рік`);
        ownContributions.push(Number(invested.toFixed(2)));
        interestEarned.push(Number(profit.toFixed(2)));
      }
    }

    const totalInvested = P + C * months;
    const earned = balance - totalInvested;

    setFinalBalance(balance);
    setContribution(totalInvested);
    setTotalInterest(earned);

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Ваші вкладення",
            data: ownContributions,
            backgroundColor: "rgba(0, 128, 0, 0.7)",
          },
          {
            label: "Прибуток від інвестицій",
            data: interestEarned,
            backgroundColor: "rgba(144, 238, 144, 0.7)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || "";
                const value = context.parsed.y || 0;
                return `${label}: ${formatMoney(value)}`;
              },
            },
          },
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            beginAtZero: true,
          },
        },
      },
    });
  };

  const handleReset = () => {
    setInitial(0);
    setMonthly(0);
    setInterest(15);
    setYears(12);
    setFinalBalance(0);
    setContribution(0);
    setTotalInterest(0);

    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }
  };

  return (
    <>
      <header>
        <div className="logo">
          <a
            href="https://www.youtube.com/@FinStarts"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={logo} alt="FinStart Logo" />
          </a>
        </div>

        <h2>Калькулятор інвестицій</h2>

        <time>
          <p>{time}</p>
        </time>
      </header>

      <main>
        <aside className="calculator">
          <div className="step">
            <h3>
              Початкова інвестиція <span className="tooltip">↓</span>
            </h3>
            <input
              type="number"
              min="0"
              value={initial}
              onChange={(e) => setInitial(e.target.value)}
              onFocus={(e) => e.target.select()}
            />
          </div>

          <div className="step">
            <h3>
              Щомісячне поповнення <span className="tooltip">↓</span>
            </h3>
            <input
              type="number"
              min="0"
              value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
              onFocus={(e) => e.target.select()}
            />
          </div>

          <div className="step">
            <h3>
              Річна ставка дохідності <span className="tooltip">↓</span>
            </h3>
            <div className="input-group">
              <input
                type="number"
                min="0"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                onFocus={(e) => e.target.select()}
              />
              <span>%</span>
            </div>
          </div>

          <div className="step">
            <h3>
              Строк інвестиції, в роках <span className="tooltip">↓</span>
            </h3>
            <input
              type="number"
              min="1"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              onFocus={(e) => e.target.select()}
            />
          </div>

          <div className="buttons">
            <button type="button" onClick={handleReset}>
              Скинути
            </button>
            <button type="button" onClick={handleCalculate}>
              Розрахувати
            </button>
          </div>

          <span className="spg">
            Дохід розрахований за умови щомісячного реінвестування.
          </span>
        </aside>

        <section className="results">
          <h1>{formatMoney(finalBalance)}</h1>

          <div className="summary">
            <div className="box">
              <h2>{formatMoney(contribution)}</h2>
              <p>Ваші вкладення</p>
            </div>

            <div className="box">
              <h2>{formatMoney(totalInterest)}</h2>
              <p>Прибуток від інвестицій</p>
            </div>
          </div>

          <figure className="chart">
            <canvas ref={chartRef}></canvas>
          </figure>
        </section>
      </main>

      <footer className="footer">
        <p>
          Для вас канал <strong>"Фінансовий Старт"</strong>
        </p>

        <div className="footer-logo">
          <a
            href="https://www.youtube.com/@FinStarts"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={youtube} alt="YouTube Logo" />
          </a>

          <a
            href="https://t.me/Finstart2025"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={telegram} alt="Telegram Logo" />
          </a>
        </div>
      </footer>
    </>
  );
}

export default App;