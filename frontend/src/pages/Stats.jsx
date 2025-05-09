// src/pages/Stats.jsx

import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useDataState } from '../context/DataContext';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Stats() {
  const { transactions, tags } = useDataState();

  // date filters
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  // toggle on/off
  const [filterOn, setFilterOn] = useState(false);

  // apply filter only when on
  const filtered = filterOn
    ? transactions.filter(txn => {
        if (start && txn.date < start) return false;
        if (end   && txn.date > end)   return false;
        return true;
      })
    : transactions;

  // map tag IDs to names
  const tagMap = Object.fromEntries(tags.map(t => [t.id, t.name]));

  // split and group
  const groupByTag = (txs) => {
    const result = {};
    txs.forEach(tx => {
      const name = tagMap[tx.tag] || 'Unknown';
      result[name] = (result[name] || 0) + Math.abs(tx.amount);
    });
    return result;
  };

  const earningsData = (() => {
    const data = groupByTag(filtered.filter(tx => tx.amount > 0));
    return {
      labels: Object.keys(data),
      datasets: [{
        data: Object.values(data),
        backgroundColor: [
          '#3d550c',
          '#81b622',
          '#ecf87f',
          '#59981a',// Mr. Nodirbek, feel free to change colours here. I went with a Creeper-y https://www.canva.com/colors/color-palettes/healthy-leaves/ so far.
        ],
      }],
    };
  })();

  const spendingsData = (() => {
    const data = groupByTag(filtered.filter(tx => tx.amount < 0));
    return {
      labels: Object.keys(data),
      datasets: [{
        data: Object.values(data),
        backgroundColor: [
          '#3d550c',
          '#81b622',
          '#ecf87f',
          '#59981a',
        ],
      }],
    };
  })();

  return (
    <div style={{ padding: 20 }}>
      <h2>Statistics</h2>

      <div className="filter-wrapper" style={{ marginBottom: 20 }}>
        <input
          type="datetime-local"
          value={start}
          onChange={e => setStart(e.target.value)}
        />
        <input
          type="datetime-local"
          value={end}
          onChange={e => setEnd(e.target.value)}
        />
        <button
          onClick={() => setFilterOn(on => !on)}
          style={{ fontSize: '1.2rem' }}
          aria-label={filterOn ? 'Turn filter off' : 'Turn filter on'}
        >
          {filterOn ? '✓' : '✕'}
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div style={{ width: '45%' }}>
          <h3>Spendings by Tag</h3>
          <Pie data={spendingsData} />
        </div>
        <div style={{ width: '45%' }}>
          <h3>Earnings by Tag</h3>
          <Pie data={earningsData} />
        </div>
      </div>
    </div>
  );
}
