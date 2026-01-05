'use client';

import { useState } from 'react';
import { Category } from '@/lib/types';
import { Plus, Edit, Trash2, X, Save, Tag } from 'lucide-react';

interface CategoryManagerProps {
  categories: Category[];
  onUpdate: () => void;
}

export default function CategoryManager({ categories, onUpdate }: CategoryManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', color: '#D4A574', icon: '💰' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Category name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create category');
      }

      setFormData({ name: '', color: '#D4A574', icon: '💰' });
      setShowAddForm(false);
      onUpdate();
    } catch (error: any) {
      alert(error.message || 'Failed to add category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (id: number) => {
    if (!formData.name.trim()) {
      alert('Category name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update category');
      }

      setEditingId(null);
      setFormData({ name: '', color: '#D4A574', icon: '💰' });
      onUpdate();
    } catch (error: any) {
      alert(error.message || 'Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone if there are expenses using it.')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete category');
      }

      onUpdate();
    } catch (error: any) {
      alert(error.message || 'Failed to delete category');
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', color: '#D4A574', icon: '💰' });
  };

  const defaultCategories = categories.filter(cat => cat.is_default);
  const customCategories = categories.filter(cat => !cat.is_default);

  const commonIcons = ['💰', '🍔', '🚗', '🏠', '🛍️', '🎬', '💡', '📦', '☕', '✈️', '🎮', '📚', '💊', '🎁', '💳'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Tag className="text-warm-yellow" size={28} />
            Manage Categories
          </h2>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingId(null);
              setFormData({ name: '', color: '#D4A574', icon: '💰' });
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Category
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAdd} className="mb-6 p-4 bg-cream rounded-xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="Category name"
                required
              />
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="input-field h-12"
              />
              <div className="flex gap-2 flex-wrap">
                {commonIcons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                      formData.icon === icon
                        ? 'bg-warm-yellow scale-110'
                        : 'bg-white hover:bg-beige'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={isSubmitting} className="btn-secondary">
                {isSubmitting ? 'Adding...' : 'Add Category'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Default Categories */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Default Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {defaultCategories.map(category => (
              <div
                key={category.id}
                className="p-4 bg-white rounded-xl border-2 border-beige flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: category.color + '40' }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{category.name}</p>
                    <p className="text-xs text-gray-500">Default</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Categories */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Custom Categories</h3>
          {customCategories.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No custom categories yet. Add one above! 💛</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {customCategories.map(category => {
                const isEditing = editingId === category.id;
                return (
                  <div
                    key={category.id}
                    className={`p-4 bg-white rounded-xl border-2 ${
                      isEditing ? 'border-warm-yellow' : 'border-beige'
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="input-field"
                          required
                        />
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            className="input-field h-10 flex-1"
                          />
                          <div className="flex gap-1">
                            {commonIcons.slice(0, 5).map(icon => (
                              <button
                                key={icon}
                                type="button"
                                onClick={() => setFormData({ ...formData, icon })}
                                className={`w-8 h-8 rounded text-sm ${
                                  formData.icon === icon ? 'bg-warm-yellow' : 'bg-cream'
                                }`}
                              >
                                {icon}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(category.id)}
                            disabled={isSubmitting}
                            className="btn-secondary flex items-center gap-1 text-sm"
                          >
                            <Save size={14} />
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="btn-secondary flex items-center gap-1 text-sm"
                          >
                            <X size={14} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                            style={{ backgroundColor: category.color + '40' }}
                          >
                            {category.icon}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{category.name}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(category)}
                            className="p-2 hover:bg-cream rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

