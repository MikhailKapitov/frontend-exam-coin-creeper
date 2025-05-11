import React from 'react';

export default function TransactionCard({ txn, tags, onUpdate, onDelete }) {
  return (
    <div className="transaction-card">
      <input
        type="text"
        placeholder="Enter transaction's name..."
        className="transaction-name"
        value={txn.name}
        onChange={e => onUpdate({ ...txn, name: e.target.value })}
      />
      <button
        className="transaction-value-flipper"
        onClick={() => onUpdate({ ...txn, amount: -txn.amount })}
      >
        +/-
      </button>
      <input
        type="number"
        step="50"
        className="transaction-value-number"
        value={txn.amount}
        onChange={e => onUpdate({ ...txn, amount: +e.target.value })}
      />
      <textarea
        placeholder="Enter transaction's description..."
        className="transaction-description"
        value={txn.description}
        onChange={e => onUpdate({ ...txn, description: e.target.value })}
      />
      <select
        className="transaction-tags"
        value={txn.tag}
        onChange={e => onUpdate({ ...txn, tag: e.target.value })}
      >
        {tags.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
      <input
        type="datetime-local"
        className="transaction-datetime"
        value={txn.date}
        onChange={e => onUpdate({ ...txn, date: e.target.value })}
      />
      <button
        className="transaction-deletion-button"
        onClick={(e) => onDelete(txn.id, e)}
      >
        TRASH
      </button>
    </div>
  );
}
