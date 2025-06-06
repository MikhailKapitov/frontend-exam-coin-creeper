import React, { useState } from 'react';
import { useDataState, useDataDispatch } from '../context/DataContext';
import TransactionCard from '../components/TransactionCard';
import { v4 as uuidv4 } from 'uuid';
import confetti from 'canvas-confetti';

export default function Dashboard() {

  // I got the audio from the game's Wiki: https://minecraft.wiki/w/Category:Explosion_sounds .
  const audioFiles = [
    Object.assign(new Audio('/src/sounds/Explosion1.ogg'), { volume: 0.1 }),
    Object.assign(new Audio('/src/sounds/Explosion2.ogg'), { volume: 0.1 }),
    Object.assign(new Audio('/src/sounds/Explosion3.ogg'), { volume: 0.1 }),
    Object.assign(new Audio('/src/sounds/Explosion4.ogg'), { volume: 0.1 }),
  ];

  function triggerExplosion(x, y) {

    const shapes = [
      confetti.shapeFromText({ text: '💸', scalar: 1.0 }),
      confetti.shapeFromText({ text: '💵', scalar: 1.0 }),
      confetti.shapeFromText({ text: '💶', scalar: 1.0 }),
      confetti.shapeFromText({ text: '💴', scalar: 1.0 }),
      confetti.shapeFromText({ text: '💷', scalar: 1.0 }),
      confetti.shapeFromText({ text: '🪙', scalar: 1.0 }),
      confetti.shapeFromText({ text: '💰', scalar: 1.0 }),
      confetti.shapeFromText({ text: '💳', scalar: 1.0 }),
      confetti.shapeFromText({ text: '💲', scalar: 1.0 }),
    ]

    audioFiles[Math.floor(Math.random() * audioFiles.length)].play();

    for (let startVelocity = 16; startVelocity <= 32; startVelocity += 8) {
      for (let scalar = 1; scalar <= 8; scalar *= 2) {
        confetti({
          shapes: shapes,
          spread: 360,
          startVelocity: startVelocity,
          scalar: scalar,
          decay: 0.99,
          gravity: 0.33,
          particleCount: 16 / scalar,
          origin: {x: x / window.innerWidth, y: y / window.innerHeight}
        });
      }
    }

  }

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
      tag: 'other',
      date: new Date().toISOString().slice(0,16),
    };
    const txns = [newTxn, ...transactions];
    dispatch({ type: 'UPDATE_ALL', data: { transactions: txns, balance: recalc(txns) } });
  };

  const updateTxn = updated => {
    const txns = transactions.map(t => t.id === updated.id ? updated : t);
    dispatch({ type: 'UPDATE_ALL', data: { transactions: txns, balance: recalc(txns) } });
  };

  const deleteTxn = (id, event) => {
    console.log(event);
    const txnToDelete = transactions.find(t => t.id === id);
    if (txnToDelete && true) { // Math.abs(txnToDelete.amount) === 555
      const isTouch = event.type === 'touchend';
      const posX = isTouch ? event.changedTouches[0].clientX : event.clientX;
      const posY = isTouch ? event.changedTouches[0].clientY : event.clientY;
      triggerExplosion(posX, posY);
    }
    const txns = transactions.filter(t => t.id !== id);
    dispatch({ type: 'UPDATE_ALL', data: { transactions: txns, balance: recalc(txns) } });
  };

  return (
    <div id="content-wrapper">
      <div className="balance-display-wrapper">
        <div id="balance-display">{balance.toFixed(2)} <img src="/src/images/emerald-Photoroom.png" alt="coin" style={{ width: '3rem', verticalAlign: 'middle' }} /></div>
        <button id="add-transaction-button" onClick={addTxn}>+</button>
      </div>

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
