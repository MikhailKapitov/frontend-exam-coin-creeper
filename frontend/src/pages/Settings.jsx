import React, { useState } from 'react';
import { useDataState, useDataDispatch } from '../context/DataContext';
import { v4 as uuidv4 } from 'uuid';

export default function Settings() {
  const { tags } = useDataState();
  const dispatch = useDataDispatch();
  const [newTag, setNewTag] = useState('');

  const addTag = e => {
    e.preventDefault();
    const nt = { id: uuidv4(), name: newTag };
    dispatch({ type: 'UPDATE_ALL', data: { tags: [...tags, nt] } });
    setNewTag('');
  };

  const delTag = id => {
    dispatch({ type: 'UPDATE_ALL', data: { tags: tags.filter(t => t.id !== id) } });
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
