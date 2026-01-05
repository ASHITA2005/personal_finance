'use client';

import { useState } from 'react';
import { ExpenseWithCategory, Category } from '@/lib/types';
import { format } from 'date-fns';
import { Edit, Trash2, X, Save } from 'lucide-react';

interface ExpenseListProps {
  expenses: ExpenseWithCategory[];
  categories: Category[];
  onUpdate: () => void;
}

export default function ExpenseList({ expenses, categories, onUpdate }: ExpenseListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<ExpenseWithCategory>>({});
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const startEdit = (expense: ExpenseWithCategory) => {
    setEditingId(expense.id);
    setEditForm({
      amount: expense.amount,
      date: expense.date,
      category_id: expense.category_id,
      note: expense.note || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId || !editForm.amount || !editForm.date || !editForm.category_id) {
      return;
    }

    try {
      const response = await fetch(`/api/expenses/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: editForm.amount,
          date: editForm.date,
          category_id: editForm.category_id,
          note: editForm.note || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update expense');
      }

      setEditingId(null);
      setEditForm({});
      onUpdate();
    } catch (error: any) {
      alert(error.message || 'Failed to update expense');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    setIsDeleting(id);
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      onUpdate();
    } catch (error: any) {
      alert(error.message || 'Failed to delete expense');
    } finally {
      setIsDeleting(null);
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="card">
        <p className="text-center text-gray-500 py-8">No expenses yet. Add one above! 💛</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">All Expenses</h2>
      <div className="space-y-3">
        {expenses.map(expense => {
          const isEditing = editingId === expense.id;
          const isDeletingThis = isDeleting === expense.id;

          return (
            <div
              key={expense.id}
              className={`p-4 bg-cream rounded-xl transition-all duration-200 ${
                isEditing ? 'ring-2 ring-warm-yellow' : 'hover:bg-beige'
              } ${isDeletingThis ? 'opacity-50' : ''}`}
            >
              {isEditing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.amount}
                      onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                      className="input-field"
                    />
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <select
                    value={editForm.category_id}
                    onChange={(e) => setEditForm({ ...editForm, category_id: parseInt(e.target.value) })}
                    className="input-field"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={editForm.note || ''}
                    onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                    className="input-field"
                    placeholder="Note (optional)"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: expense.category.color + '40' }}
                    >
                      {expense.category.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{expense.category.name}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                        {expense.note && ` • ${expense.note}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-gray-800">₹{expense.amount.toFixed(2)}</p>
                    <button
                      onClick={() => startEdit(expense)}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={18} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      disabled={isDeletingThis}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} className="text-red-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

