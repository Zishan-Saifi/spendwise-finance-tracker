import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Target,
  PiggyBank,
  Laptop,
  Car,
  Plane,
  Home,
  GraduationCap,
  Heart,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  Wallet
} from 'lucide-react';

const API_BASE = 'https://spendwise-finance-tracker.onrender.com/api/goals';

const ICON_MAP = {
  Target,
  PiggyBank,
  Laptop,
  Car,
  Plane,
  Home,
  GraduationCap,
  Heart,
  Sparkles,
  Wallet
};

const COLOR_OPTIONS = [
  { name: 'Purple', bg: 'bg-purple-500', hex: '#8b5cf6' },
  { name: 'Blue', bg: 'bg-blue-500', hex: '#3b82f6' },
  { name: 'Emerald', bg: 'bg-emerald-500', hex: '#10b981' },
  { name: 'Amber', bg: 'bg-amber-500', hex: '#f59e0b' },
  { name: 'Rose', bg: 'bg-rose-500', hex: '#f43f5e' },
  { name: 'Indigo', bg: 'bg-indigo-500', hex: '#6366f1' }
];

export default function Goals() {
  const { user, currencySymbol } = useAuth();
  const currency = currencySymbol || '₹';
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [form, setForm] = useState({
    title: '',
    targetAmount: '',
    savedAmount: '',
    targetDate: '',
    category: 'General',
    icon: 'Target',
    color: '#8b5cf6',
    notes: ''
  });

  // Deposit Modal State
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');

  const getToken = () => user?.token || localStorage.getItem('token') || '';

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getToken();

      const res = await fetch(API_BASE, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error('Session expired. Please log in again.');
        throw new Error(`Failed to load goals (Status: ${res.status})`);
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.data || data.goals || []);
      setGoals(list);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const resetForm = () => {
    setForm({
      title: '',
      targetAmount: '',
      savedAmount: '',
      targetDate: '',
      category: 'General',
      icon: 'Target',
      color: '#8b5cf6',
      notes: ''
    });
  };

  const openAddModal = () => {
    setEditingGoal(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (goal) => {
    setEditingGoal(goal);
    setForm({
      title: goal.title || '',
      targetAmount: goal.targetAmount || '',
      savedAmount: goal.savedAmount || 0,
      targetDate: goal.targetDate ? goal.targetDate.split('T')[0] : '',
      category: goal.category || 'General',
      icon: goal.icon || 'Target',
      color: goal.color || '#8b5cf6',
      notes: goal.notes || ''
    });
    setIsModalOpen(true);
  };

  const openDepositModal = (goal) => {
    setDepositGoal(goal);
    setDepositAmount('');
    setDepositNote('');
    setIsDepositModalOpen(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const url = editingGoal ? `${API_BASE}/${editingGoal._id}` : API_BASE;
      const method = editingGoal ? 'PUT' : 'POST';

      const payload = {
        title: form.title,
        targetAmount: Number(form.targetAmount),
        savedAmount: Number(form.savedAmount || 0),
        targetDate: form.targetDate,
        category: form.category,
        icon: form.icon,
        color: form.color,
        notes: form.notes
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save goal');
      }

      toast.success(editingGoal ? 'Goal updated successfully' : 'Goal created successfully');
      setIsModalOpen(false);
      setEditingGoal(null);
      resetForm();
      fetchGoals();
    } catch (err) {
      console.error('Error saving goal:', err);
      toast.error(err.message || 'Error saving goal');
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to delete goal');
      }

      toast.success('Goal deleted successfully!');
      fetchGoals();
    } catch (err) {
      console.error('Error deleting goal:', err);
      toast.error(err.message || 'Error deleting goal');
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositGoal || !depositAmount || Number(depositAmount) <= 0) return;

    try {
      const token = getToken();
      // Try deposit endpoint first
      let res = await fetch(`${API_BASE}/${depositGoal._id}/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(depositAmount),
          note: depositNote
        })
      });

      // Fallback if deposit endpoint isn't mounted
      if (res.status === 404) {
        const updatedSaved = Number(depositGoal.savedAmount || 0) + Number(depositAmount);
        res = await fetch(`${API_BASE}/${depositGoal._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            savedAmount: updatedSaved
          })
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to add deposit');
      }
      
      toast.success('Money added to goal successfully!');
      setIsDepositModalOpen(false);
      setDepositGoal(null);
      setDepositAmount('');
      setDepositNote('');
      fetchGoals();
    } catch (err) {
      console.error('Error depositing to goal:', err);
      toast.error(err.message || 'Error adding deposit');
    }
  };

  // Metrics
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount || 0), 0);
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.savedAmount || 0), 0);
  const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;
  const activeCount = goals.filter((g) => Number(g.savedAmount || 0) < Number(g.targetAmount || 0)).length;

  const getDaysRemaining = (targetDate) => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Savings Goals</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Set targets, track progress, and build your wealth.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          Add New Goal
        </button>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Target</span>
            <span className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <Target className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {currency} {totalTarget.toLocaleString()}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Across {goals.length} total goals</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Saved</span>
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <PiggyBank className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {currency} {totalSaved.toLocaleString()}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Current accumulated savings</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Overall Progress</span>
            <span className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{overallProgress}%</div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Goals</span>
            <span className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{activeCount}</div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {goals.length - activeCount} achieved
          </p>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
            <p className="mt-3 text-sm">Loading your goals...</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center dark:border-rose-900/40 dark:bg-rose-950/20">
          <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
          <p className="mt-2 text-sm font-medium text-rose-600 dark:text-rose-400">{error}</p>
          <button
            onClick={fetchGoals}
            className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-xs font-medium text-white hover:bg-rose-700"
          >
            Try Again
          </button>
        </div>
      ) : goals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
            <Target className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">No Savings Goals Yet</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Create your first savings goal for a new phone, emergency fund, vacation, or anything you're planning for.
          </p>
          <button
            onClick={openAddModal}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const IconComponent = ICON_MAP[goal.icon] || Target;
            const target = Number(goal.targetAmount || 0);
            const saved = Number(goal.savedAmount || 0);
            const progress = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
            const isCompleted = progress >= 100;
            const daysLeft = getDaysRemaining(goal.targetDate);
            const remainingToSave = Math.max(0, target - saved);

            return (
              <div
                key={goal._id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-purple-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-800"
              >
                {/* Top Row */}
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm"
                        style={{ backgroundColor: goal.color || '#8b5cf6' }}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{goal.title}</h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{goal.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => openEditModal(goal)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        title="Edit goal"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal._id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                        title="Delete goal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="mt-5 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Saved</span>
                      <div className="text-xl font-bold text-slate-900 dark:text-white">
                        {currency} {saved.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Target</span>
                      <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {currency} {target.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{progress}%</span>
                      <span className="text-slate-400">
                        {isCompleted ? 'Goal Reached!' : `${currency} ${remainingToSave.toLocaleString()} left`}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: isCompleted ? '#10b981' : goal.color || '#8b5cf6'
                        }}
                      />
                    </div>
                  </div>

                  {/* Due Date & Badges */}
                  <div className="mt-4 flex items-center justify-between text-xs">
                    {goal.targetDate ? (
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {daysLeft !== null && daysLeft > 0
                          ? `${daysLeft} days left`
                          : daysLeft === 0
                          ? 'Due today'
                          : 'Target date passed'}
                      </span>
                    ) : (
                      <span />
                    )}

                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Quick Action: Add Money */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => openDepositModal(goal)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-600 transition hover:bg-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:hover:bg-purple-950/50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Money / Deposit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingGoal ? 'Edit Savings Goal' : 'Create New Goal'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook Pro, Trip to Bali"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-purple-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Target Amount ({currency})
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="80000"
                    value={form.targetAmount}
                    onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-purple-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Already Saved ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.savedAmount}
                    onChange={(e) => setForm({ ...form, savedAmount: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-purple-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Target Date</label>
                  <input
                    type="date"
                    required
                    value={form.targetDate}
                    onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-purple-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-purple-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Gadgets">Gadgets</option>
                    <option value="Travel">Travel</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Home">Home</option>
                    <option value="Education">Education</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Choose Icon</label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {Object.keys(ICON_MAP).map((iconKey) => {
                    const Comp = ICON_MAP[iconKey];
                    const isSelected = form.icon === iconKey;
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setForm({ ...form, icon: iconKey })}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <Comp className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Choose Color</label>
                <div className="mt-1.5 flex gap-2">
                  {COLOR_OPTIONS.map((c) => {
                    const isSelected = form.color === c.hex;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setForm({ ...form, color: c.hex })}
                        className={`h-7 w-7 rounded-full transition-transform ${c.bg} ${
                          isSelected ? 'ring-2 ring-purple-600 ring-offset-2' : 'hover:scale-110'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-700"
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Money (Deposit) Modal */}
      {isDepositModalOpen && depositGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Add Money to Goal</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{depositGoal.title}</p>
              </div>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDeposit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Deposit Amount ({currency})
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-purple-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Quick Amount Pills */}
              <div className="flex gap-2">
                {[500, 1000, 2000, 5000].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setDepositAmount(String(quick))}
                    className="flex-1 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-600 hover:border-purple-500 hover:text-purple-600 dark:border-slate-700 dark:text-slate-300"
                  >
                    +{currency}
                    {quick}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Note / Remark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly salary savings"
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-purple-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-700"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}