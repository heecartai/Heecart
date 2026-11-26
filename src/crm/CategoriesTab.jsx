import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { removeCategory, uniqueId, upsertCategory } from './utils';

export default function CategoriesTab({ data, run, busy }) {
  const { categories, products } = data;
  const [rows, setRows] = useState(categories);
  const [newName, setNewName] = useState('');

  useEffect(() => setRows(categories), [categories]);

  const count = id => products.filter(p => p.category === id).length;
  const edit = (id, key, value) => setRows(rs => rs.map(r => (r.id === id ? { ...r, [key]: value } : r)));
  const changed = row => {
    const original = categories.find(c => c.id === row.id);
    return original && (original.name !== row.name || Number(original.sort_order) !== Number(row.sort_order));
  };

  const add = e => {
    e.preventDefault();
    if (!newName.trim()) return;
    const category = {
      id: uniqueId(newName, categories),
      name: newName.trim(),
      sort_order: Math.max(0, ...categories.map(c => c.sort_order || 0)) + 1,
    };
    run(upsertCategory(category), `Added category "${category.name}"`).then(ok => ok && setNewName(''));
  };

  const remove = row => {
    if (count(row.id)) {
      alert(`Move the ${count(row.id)} product(s) in "${row.name}" to another category first.`);
      return;
    }
    if (window.confirm(`Delete category "${row.name}"?`)) run(removeCategory(row.id), `Deleted category "${row.name}"`);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-extrabold">Categories</h1>
      <p className="mt-1 text-sm text-ink/60">These are the filter buttons on the website. Lower position numbers show first.</p>

      <ul className="mt-5 space-y-2">
        {rows.map(row => (
          <li key={row.id} className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-white p-3">
            <input className="input flex-1" value={row.name} onChange={e => edit(row.id, 'name', e.target.value)} aria-label="Category name" />
            <input type="number" className="input w-20" value={row.sort_order} onChange={e => edit(row.id, 'sort_order', e.target.value)} aria-label="Position" />
            <span className="hidden w-20 text-center text-xs text-ink/60 sm:block">{count(row.id)} products</span>
            <button
              onClick={() => run(upsertCategory({ ...row, name: row.name.trim(), sort_order: Number(row.sort_order) || 0 }), `Updated category "${row.name.trim()}"`)}
              disabled={busy || !changed(row) || !row.name.trim()}
              className="grid h-10 w-10 place-items-center rounded-lg text-ink/60 hover:bg-cream disabled:opacity-30"
              title="Save"
              aria-label="Save"
            >
              <Save size={16} />
            </button>
            <button onClick={() => remove(row)} className="grid h-10 w-10 place-items-center rounded-lg text-ink/60 hover:bg-cream hover:text-red-600" title="Delete" aria-label="Delete">
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={add} className="mt-4 flex gap-2">
        <input className="input flex-1" placeholder="New category name, e.g. Diwali Hampers" value={newName} onChange={e => setNewName(e.target.value)} />
        <button className="btn-gold" disabled={busy || !newName.trim()}><Plus size={16} /> Add</button>
      </form>
    </div>
  );
}
