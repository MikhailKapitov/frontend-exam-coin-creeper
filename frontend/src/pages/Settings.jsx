import React, { useState } from 'react';
import { useDataState, useDataDispatch } from '../context/DataContext';
import { v4 as uuidv4 } from 'uuid';
import confetti from 'canvas-confetti';

export default function Settings() {

  // I got the audio from the game's Wiki: https://minecraft.wiki/w/Category:Firework_sounds .
  const audioFiles = [
    '/src/sounds/Firework_blast_far.ogg',
    '/src/sounds/Firework_blast.ogg',
    '/src/sounds/Firework_large_blast_far.ogg',
    '/src/sounds/Firework_large_blast.ogg',
  ];

  function triggerExplosion() {

    const audio = new Audio(audioFiles[Math.floor(Math.random() * audioFiles.length)]);
    console.log(audio);
    audio.play();

    for (let startVelocity = 8; startVelocity <= 16; startVelocity += 4) {
      for (let scalar = 0.5; scalar <= 2; scalar *= 2) {
        confetti({
          spread: 360,
          startVelocity: startVelocity,
          scalar: scalar,
          decay: 0.99,
          gravity: 0.33,
          particleCount: 8 / scalar
        });
      }
    }

  }

  const { tags, transactions } = useDataState();
  const dispatch = useDataDispatch();
  const [newTag, setNewTag] = useState('');

  const addTag = e => {
    e.preventDefault();
    const nt = { id: uuidv4(), name: newTag };
    dispatch({ type: 'UPDATE_ALL', data: { tags: [...tags, nt] } });
    setNewTag('');
  };

  const delTag = id => {
    if (id === 'other') {
      alert('Cannot delete the "Other" tag.');
      return;
    }
    triggerExplosion();
    const updatedTransactions = transactions.map(txn => 
      txn.tag === id ? { ...txn, tag: 'other' } : txn
    );
    dispatch({ 
      type: 'UPDATE_ALL', 
      data: { 
        tags: tags.filter(t => t.id !== id),
        transactions: updatedTransactions,
      } 
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Manage Tags</h2>
      <form id="add-tag-form" onSubmit={addTag}>
        <input
          type="text" required
          placeholder="New tag name"
          value={newTag} onChange={e => setNewTag(e.target.value)}
        />
        <button type="submit">Add Tag</button>
      </form>
      <div id="tag-list-wrapper">
        {tags.map(t => (
          <div key={t.id} className="tag-card">
            <span>{t.name}</span>
            <button onClick={() => delTag(t.id)}>X</button>
          </div>
        ))}
      </div>
    </div>
  );
}
