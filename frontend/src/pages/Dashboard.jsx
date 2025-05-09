// src/pages/Dashboard.jsx

import React, { useState } from 'react';
import { useDataState, useDataDispatch } from '../context/DataContext';
import TransactionCard from '../components/TransactionCard';
import { v4 as uuidv4 } from 'uuid';

export default function Dashboard() {
  const { balance, transactions, tags } = useDataState();
  const dispatch = useDataDispatch();

  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [filterOn, setFilterOn] = useState(false);

  const filtered = filterOn
    ? transactions.filter(txn => {
        if (start && txn.date < start) return false;
        if (end   && txn.date > end)   return false;
        return true;
      })
    : transactions;

  const recalc = txns => txns.reduce((sum, t) => sum + t.amount, 0);

  const addTxn = () => {
    const newTxn = {
      id: uuidv4(),
      name: '',
      amount: 0,
      description: '',
      tag: tags[0]?.id || '',
      date: new Date().toISOString().slice(0,16),
    };
    const txns = [...transactions, newTxn];
    dispatch({ type: 'UPDATE_ALL', data: { transactions: txns, balance: recalc(txns) } });
  };

  const updateTxn = updated => {
    const txns = transactions.map(t => t.id === updated.id ? updated : t);
    dispatch({ type: 'UPDATE_ALL', data: { transactions: txns, balance: recalc(txns) } });
  };

  const deleteTxn = id => {
    const txns = transactions.filter(t => t.id !== id);
    dispatch({ type: 'UPDATE_ALL', data: { transactions: txns, balance: recalc(txns) } });
  };

  return (
    <div id="content-wrapper">
      <div id="balance-display">{balance.toFixed(2)} KZT</div>
      <button id="add-transaction-button" onClick={addTxn}>+</button>

      <div className="filter-wrapper">
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

      <div id="transaction-list">
        {filtered.map(txn => (
          <TransactionCard
            key={txn.id}
            txn={txn}
            tags={tags}
            onUpdate={updateTxn}
            onDelete={deleteTxn}
          />
        ))}
      </div>
    </div>
  );
}
