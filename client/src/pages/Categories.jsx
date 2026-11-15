import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Receipt, 
  Clapperboard, 
  Activity, 
  Wallet, 
  Home, 
  LayoutGrid, 
  Camera, 
  Laptop, 
  TrendingUp, 
  Gift, 
  Package, 
  Coffee, 
  Bus, 
  Dumbbell, 
  GraduationCap, 
  Sparkles, 
  Wrench, 
  CreditCard, 
  Briefcase, 
  Coins, 
  X,
  TrendingDown
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Available icons map
const ICONS_MAP = {
  Utensils, Car, ShoppingBag, Receipt, Clapperboard, Activity,
  Wallet, Home, LayoutGrid, Camera, Laptop, TrendingUp,
  Gift, Package, Coffee, Bus, Dumbbell, GraduationCap,
  Sparkles, Wrench, CreditCard, Briefcase, Coins
};

const ICONS_LIST = Object.keys(ICONS_MAP);

const COLORS_LIST = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', 
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', 
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', 
  '#ec4899', '#f43f5e', '#64748b'
];

export default function Categories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [type, setType] = useState('expense');
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('LayoutGrid');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      
      // Safe check: data array hai ya object { categories: [...] } ya { data: [...] }
      let list = [];
      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (res.data && Array.isArray(res.data.categories)) {
        list = res.data.categories;
      } else if (res.data && Array.isArray(res.data.data)) {
        list = res.data.data;
      }
      setCategories(list);
    } catch (err) {
      console.error('Failed to load categories', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/categories', {
        name: name.trim(),
        type,
        icon: selectedIcon,
        color: selectedColor,
      });

      const newCat = res.data?.category || res.data;
      if (newCat) {
        setCategories((prev) => [...prev, newCat]);
      }
      toast.success('Category created successfully!');
      setName('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      toast.success('Category deleted successfully!');
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  // Safe Dynamic Icon Renderer
  const renderIconComponent = (iconName, className = 'w-4 h-4') => {
    const IconComp = ICONS_MAP[iconName] || LayoutGrid;
    return <IconComp className={className} />;
  };

  // Safe arrays
  const safeList = Array.isArray(categories) ? categories : [];
  const expenseCategories = safeList.filter((c) => c && c.type === 'expense');
  const incomeCategories = safeList.filter((c) => c && c.type === 'income');
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-xl text-slate-500">☰</span>
          <h2 className="text-base font-medium text-slate-700">
            Hey, {user?.name || 'User'} 😊
          </h2>
        </div>
        <div className="w-10 h-10 rounded-full bg-purple-200 text-purple-700 font-semibold flex items-center justify-center shadow-sm">
          {userInitial}
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Categories</h1>
          <p className="text-xs text-slate-400 mt-0.5">{safeList.length} total</p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Left Card: Add new category */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
            <h2 className="text-sm font-semibold text-slate-800">Add new category</h2>

            {/* Type Switcher */}
            <div className="bg-slate-100/80 p-1 rounded-2xl grid grid-cols-2 gap-1 text-sm font-medium">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
                  type === 'expense'
                    ? 'bg-white text-slate-800 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <TrendingDown className="w-4 h-4 text-slate-600" />
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
                  type === 'income'
                    ? 'bg-white text-slate-800 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-slate-600" />
                Income
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateCategory} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
                  NAME
                </label>
                <input
                  type="text"
                  placeholder="e.g. Groceries"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/60 border border-slate-200/80 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                />
              </div>

              {/* Icon Grid */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                  ICON
                </label>
                <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-3 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-8 gap-2">
                    {ICONS_LIST.map((iconKey) => {
                      const IconComp = ICONS_MAP[iconKey];
                      const isSelected = selectedIcon === iconKey;
                      return (
                        <button
                          key={iconKey}
                          type="button"
                          onClick={() => setSelectedIcon(iconKey)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-white text-slate-800 shadow-md ring-2 ring-purple-500'
                              : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                  COLOR
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {COLORS_LIST.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        style={{ backgroundColor: color }}
                        className={`w-7 h-7 rounded-full transition-transform ${
                          isSelected
                            ? 'ring-2 ring-offset-2 ring-slate-800 scale-110'
                            : 'hover:scale-105'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-2xl font-medium text-sm transition-all shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Creating...' : '+ Create category'}
              </button>
            </form>
          </div>

          {/* Right Card: Your categories */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-sm font-semibold text-slate-800">Your categories</h2>

            {/* Expenses */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3">
                EXPENSES
              </p>
              {expenseCategories.length === 0 ? (
                <p className="text-xs text-slate-400">No expense categories yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {expenseCategories.map((c) => {
                    const color = c.color || '#3b82f6';
                    return (
                      <div
                        key={c._id || Math.random()}
                        style={{
                          backgroundColor: `${color}15`,
                          color: color,
                          borderColor: `${color}30`
                        }}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-medium border transition-all"
                      >
                        <span>{renderIconComponent(c.icon, 'w-3.5 h-3.5')}</span>
                        <span className="text-slate-800">{c.name}</span>
                        {c._id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(c._id)}
                            className="text-slate-400 hover:text-red-500 transition-colors ml-1"
                            title="Delete"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Income */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3">
                INCOME
              </p>
              {incomeCategories.length === 0 ? (
                <p className="text-xs text-slate-400">No income categories yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {incomeCategories.map((c) => {
                    const color = c.color || '#10b981';
                    return (
                      <div
                        key={c._id || Math.random()}
                        style={{
                          backgroundColor: `${color}15`,
                          color: color,
                          borderColor: `${color}30`
                        }}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-medium border transition-all"
                      >
                        <span>{renderIconComponent(c.icon, 'w-3.5 h-3.5')}</span>
                        <span className="text-slate-800">{c.name}</span>
                        {c._id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(c._id)}
                            className="text-slate-400 hover:text-red-500 transition-colors ml-1"
                            title="Delete"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}