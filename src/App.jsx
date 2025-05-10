
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend, BarController } from 'chart.js';
import './App.css';
import logo from '/assets/logo.png';
import youtube from '/assets/youTube.png'
import telegram from '/assets/telegram.png'
import tiktok from '/assets/TikTok.png'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, BarController);

function App() {
  const [time, setTime] = useState('');
  const [initial, setInitial] = useState(0);
  const [monthly, setMonthly] = useState(0);
  const [interest, setInterest] = useState(15);
  const [years, setYears] = useState(12);
  const [finalBalance, setFinalBalance] = useState(0);
  const [contribution, setContribution] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Годинник
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formatted = now.toLocaleTimeString('uk-UA');
      setTime(formatted);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Розрахунок
  const handleCalculate = () => {
    const P = parseFloat(initial);
    const C = parseFloat(monthly);
    const r = parseFloat(interest) / 100;
    const t = parseFloat(years);
    const n = 12;

    if (isNaN(P) || isNaN(C) || isNaN(r) || isNaN(t)) {
      alert("Please enter valid numbers.");
      return;
    }

    // Загальна сума
    let A = P * Math.pow(1 + r / n, n * t);
    for (let i = 1; i <= t * n; i++) {
      A += C * Math.pow(1 + r / n, n * t - i);
    }

    const total = P + C * n * t;
    const earned = A - total;

    setFinalBalance(A);
    setContribution(total);
    setTotalInterest(earned);

    // Дані для графіка
    const labels = [];
    const ownContributions = [];
    const interestEarned = [];

    let balance = P;
    for (let year = 1; year <= t; year++) {
      let yearlyInterest = 0;
      for (let month = 1; month <= n; month++) {
        const monthlyInterest = (balance + C) * (r / n);
        yearlyInterest += monthlyInterest;
        balance += C + monthlyInterest;
      }
      labels.push(`Year ${year}`);
      ownContributions.push(P + C * n * year);
      interestEarned.push(balance - ownContributions[year - 1]);
    }

    // Очистити попередній графік
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }


    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Own Contributions',
            data: ownContributions,
            backgroundColor: 'rgba(0, 128, 0, 0.7)',
          },
          {
            label: 'Interest Earned',
            data: interestEarned,
            backgroundColor: 'rgba(144, 238, 144, 0.7)',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
        scales: {
          y: {
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
    }
  };

  return (
    <>
      <header>
        <div className="logo">
          <a href="https://www.youtube.com/@FinStarts" target="_blank" rel="noopener noreferrer">
            <img src={logo} alt="Logo" />
          </a>
        </div>
        <h2>Калькулятор інвестицій </h2>
        <time><p>{time}</p></time>
      </header>


      <main>
        <aside className="calculator">
          <div className="step">
            <h3>Початкова інвестиція <span className="tooltip">↓</span></h3>
            <input
              type="number"
              value={initial}
              onChange={(e) => setInitial(e.target.value)}
              onFocus={(e) => e.target.select()}
            />
          </div>

          <div className="step">
            <h3>Щомісячне поповнення<span className="tooltip">↓</span></h3>
            <div className="input-group">
              <input
                type="number"
                value={monthly}
                onChange={(e) => setMonthly(e.target.value)}
                onFocus={(e) => e.target.select()}
              />
            </div>
          </div>

          <div className="step">
            <h3>Річна ставка дохідності <span className="tooltip">↓</span></h3>
            <div className="input-group">
              <input
                type="number"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                onFocus={(e) => e.target.select()}
              />
              <span>%</span>
            </div>
          </div>

          <div className="step">
            <h3>Строк інвестиції, в роках <span className="tooltip">↓</span></h3>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              onFocus={(e) => e.target.select()}
            />
          </div>

          <div className="buttons">
            <button onClick={handleReset}>Скинути</button>
            <button onClick={handleCalculate}>Розрахувати</button>
          </div>
          <span className='spg'>Дохід розрахований за умови реінвестицій вкладень щомісячно
          </span>
        </aside>

        <section className="results">
          <h1>${finalBalance.toFixed(2)}</h1>
          <div className="summary">
            <div className="box">
              <h2>${contribution.toFixed(2)}</h2>
              <p>Ваші вкладення</p>
            </div>
            <div className="box">
              <h2>${totalInterest.toFixed(2)}</h2>
              <p>Дохід вкладника</p>
            </div>
          </div>
          <figure className="chart">
            <canvas ref={chartRef}></canvas>
          </figure>
        </section>
      </main>
      <footer className="footer">
        <p>Для вас канал <strong>"Фінансовий Старт"</strong></p>
        <div className="footer-logo">
          <a href="https://www.youtube.com/@FinStarts" target="_blank" rel="noopener noreferrer">
            <img src={youtube} alt="Logo" />
          </a>
          <a href="https://www.youtube.com/@FinStarts" target="_blank" rel="noopener noreferrer">
            <img src={telegram} alt="Logo" />
          </a>
          <a href="https://www.youtube.com/@FinStarts" target="_blank" rel="noopener noreferrer">
            <img src={tiktok} alt="Logo" />
          </a>
        </div>
      </footer>
    </>
  );
}

export default App;
