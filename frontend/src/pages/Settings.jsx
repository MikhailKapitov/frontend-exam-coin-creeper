import React, { useState } from 'react';
import { useDataState, useDataDispatch } from '../context/DataContext';
import { v4 as uuidv4 } from 'uuid';
import confetti from 'canvas-confetti';

export default function Settings() {

  // I got the audio from the game's Wiki: https://minecraft.wiki/w/Category:Firework_sounds .
  const audioFiles = [
    Object.assign(new Audio('/src/sounds/Firework_blast_far.ogg'), { volume: 0.2 }),
    Object.assign(new Audio('/src/sounds/Firework_blast.ogg'), { volume: 0.2 }),
    Object.assign(new Audio('/src/sounds/Firework_large_blast_far.ogg'), { volume: 0.2 }),
    Object.assign(new Audio('/src/sounds/Firework_large_blast.ogg'), { volume: 0.2 }),
  ];

  function triggerExplosion(x, y) {

    audioFiles[Math.floor(Math.random() * audioFiles.length)].play();

    for (let startVelocity = 8; startVelocity <= 16; startVelocity += 4) {
      for (let scalar = 0.5; scalar <= 2; scalar *= 2) {
        confetti({
          spread: 360,
          startVelocity: startVelocity,
          scalar: scalar,
          decay: 0.99,
          gravity: 0.33,
          particleCount: 8 / scalar,
          origin: {x: x / window.innerWidth, y: y / window.innerHeight}
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

  const delTag = (id, event) => {
    if (id === 'other') {
      alert('Cannot delete the "Other" tag.');
      return;
    }
    const isTouch = event.type === 'touchend';
    const posX = isTouch ? event.changedTouches[0].clientX : event.clientX;
    const posY = isTouch ? event.changedTouches[0].clientY : event.clientY;
    triggerExplosion(posX, posY);
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
            <button onClick={(e) => delTag(t.id, e)}>X</button>
          </div>
        ))}
      </div>
    </div>
  );
}
