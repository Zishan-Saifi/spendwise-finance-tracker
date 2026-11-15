import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Download, 
  Plus, 
  Search, 
  Filter, 
  Pencil, 
  Trash2, 
  X, 
  Check, 
  TrendingDown, 
  TrendingUp, 
  Smartphone, 
  Banknote, 
  CreditCard, 
  Building, 
  MoreHorizontal,
  LayoutGrid,
  Calendar,
  RotateCw,
  // Category Icons from Categories page
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  Activity,
  Home,
  Camera,
  Laptop,
  Gift,
  Package,
  Coffee,
  Bus,
  Dumbbell,
  GraduationCap,
  Sparkles,
  Wrench,
  Briefcase,
  Link as LinkIcon
} from 'lucide-react';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ICON_COMPONENTS = {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  Activity,
  CreditCard,
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
  Briefcase,
  Link: LinkIcon
};

function CategoryIcon({ iconName, color, className = 'w-5 h-5' }) {
  const IconComponent = ICON_COMPONENTS[iconName];

  if (IconComponent) {
    return <IconComponent className={className} style={{ color: color || '#8b5cf6' }} />;
  }

  if (iconName && iconName.length <= 2) {
    return <span className="text-base">{iconName}</span>;
  }

  return <ShoppingBag className={className} style={{ color: color || '#8b5cf6' }} />;
}

const PAYMENT_METHODS = [
  { id: 'UPI', label: 'UPI', icon: Smartphone },
  { id: 'Cash', label: 'Cash', icon: Banknote },
  { id: 'Card', label: 'Card', icon: CreditCard },
  { id: 'Net Banking', label: 'Net Banking', icon: Building },
  { id: 'Other', label: 'Other', icon: MoreHorizontal },
];

export default function Transactions() {
  const { user, currencySymbol = '₹' } = useAuth();
  
  // Tab State: 'all' vs 'recurring'
  const [activeTab, setActiveTab] = useState('all');

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recurringRules, setRecurringRules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Filters & Sorting (for All Transactions)
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Transaction Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalType, setModalType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Recurring Modal State
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [editingRecurringId, setEditingRecurringId] = useState(null);
  const [recTitle, setRecTitle] = useState('');
  const [recAmount, setRecAmount] = useState('');
  const [recType, setRecType] = useState('expense');
  const [recCategory, setRecCategory] = useState('');
  const [recPaymentMethod, setRecPaymentMethod] = useState('UPI');
  const [recFrequency, setRecFrequency] = useState('monthly');
  const [recStartDate, setRecStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [recSubmitting, setRecSubmitting] = useState(false);
  const [recError, setRecError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, catRes, recRes] = await Promise.all([
        api.get('/transactions').catch(() => ({ data: [] })),
        api.get('/categories').catch(() => ({ data: [] })),
        api.get('/recurring').catch(() => ({ data: [] }))
      ]);

      const txList = Array.isArray(txRes.data) 
        ? txRes.data 
        : (txRes.data?.transactions || []);
      setTransactions(txList);

      const catList = Array.isArray(catRes.data) 
        ? catRes.data 
        : (catRes.data?.categories || []);
      setCategories(catList);

      const recList = Array.isArray(recRes.data)
        ? recRes.data
        : (recRes.data?.rules || []);
      setRecurringRules(recList);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecurringOnly = async () => {
    try {
      const res = await api.get('/recurring');
      const list = Array.isArray(res.data) ? res.data : (res.data?.rules || []);
      setRecurringRules(list);
    } catch (err) {
      console.error('Failed to load recurring rules:', err);
    }
  };

  // ---------------- Transactions Modal Handlers ----------------
  const openAddModal = () => {
    setEditingId(null);
    setModalType('expense');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('');
    setPaymentMethod('UPI');
    setNote('');
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingId(t._id);
    setModalType(t.type || 'expense');
    setAmount(t.amount || '');
    setDate(t.date ? new Date(t.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setCategory(t.category?._id || t.category || '');
    setPaymentMethod(t.paymentMethod || 'UPI');
    setNote(t.note || '');
    setModalError('');
    setIsModalOpen(true);
  };
  const getCategoryName = (cat) => {
    if (!cat) return 'General';
    if (typeof cat === 'object' && cat.name) return cat.name;
    const found = categories.find((c) => c._id === cat || c.name === cat);
    return found ? found.name : cat;
  };

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setModalError('Please enter a valid amount');
      toast.error('Please enter a valid amount');
      return;
    }
    if (!category) {
      setModalError('Please select a category');
      toast.error('Please selrct a category');
      return;
    }

    setSubmitting(true);
    setModalError('');

    const payload = {
      type: modalType,
      amount: Number(amount),
      date,
      category,
      paymentMethod,
      note: note.trim()
    };

    try {
      if (editingId) {
        const res = await api.put(`/transactions/${editingId}`, payload);
        const updated = res.data?.transaction || res.data;
        setTransactions((prev) => prev.map((t) => (t._id === editingId ? updated : t)));
      } else {
        const res = await api.post('/transactions', payload);
        const created = res.data?.transaction || res.data;
        setTransactions((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
      fetchData();
      toast.success(editingId ? 'Transaction updated successfully!' : 'Transaction added successfully');
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error saving transaction');
      toast.error(err.response?.data?.message || 'Error saving transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      toast.success('Transaction deleted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete transaction');
    }
  };

  // ---------------- Recurring Handlers ----------------
  const openAddRecurringModal = () => {
    setEditingRecurringId(null);
    setRecTitle('');
    setRecAmount('');
    setRecType('expense');
    setRecCategory('');
    setRecFrequency('monthly');
    setRecStartDate(new Date().toISOString().split('T')[0]);
    setRecPaymentMethod('UPI');
    setRecError('');
    setIsRecurringModalOpen(true);
  };

  const openEditRecurringModal = (r) => {
    setEditingRecurringId(r._id);
    setRecTitle(r.title || '');
    setRecAmount(r.amount || '');
    setRecType(r.type || 'expense');
    setRecCategory(r.category?._id || r.category || '');
    setRecFrequency(r.frequency || 'monthly');
    setRecStartDate(r.startDate ? new Date(r.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setRecPaymentMethod(r.paymentMethod || 'UPI');
    setRecError('');
    setIsRecurringModalOpen(true);
  };

  const handleSaveRecurring = async (e) => {
    e.preventDefault();
    if (!recTitle.trim()) {
      setRecError('Please enter a title (e.g. Rent, WiFi)');
      return;
    }
    if (!recAmount || Number(recAmount) <= 0) {
      setRecError('Please enter a valid amount');
      return;
    }
    if (!recCategory) {
      setRecError('Please select a category');
      return;
    }

    setRecSubmitting(true);
    setRecError('');

    const payload = {
      title: recTitle.trim(),
      amount: Number(recAmount),
      type: recType,
      category: recCategory,
      frequency: recFrequency,
      startDate: recStartDate,
      paymentMethod: recPaymentMethod
    };

    try {
      if (editingRecurringId) {
        await api.put(`/recurring/${editingRecurringId}`, payload);
      } else {
        await api.post('/recurring', payload);
      }
      setIsRecurringModalOpen(false);
      fetchRecurringOnly();
      fetchData(); // also refresh transactions in case catch-up created entries
    } catch (err) {
      setRecError(err.response?.data?.message || 'Error saving recurring rule');
    } finally {
      setRecSubmitting(false);
    }
  };

  const handleToggleRecurringStatus = async (rule) => {
    const newStatus = rule.status === 'active' ? 'paused' : 'active';
    try {
      await api.put(`/recurring/${rule._id}`, { status: newStatus });
      setRecurringRules((prev) =>
        prev.map((r) => (r._id === rule._id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteRecurring = async (id) => {
    if (!window.confirm('Delete this recurring rule?')) return;
    try {
      await api.delete(`/recurring/${id}`);
      setRecurringRules((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete recurring rule');
    }
  };

  // Filter & Sort Logic (for All Transactions)
  const filteredTransactions = transactions
    .filter((t) => {
      if (!t) return false;
      const matchesSearch = !searchTerm || 
        (t.note && t.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.title && t.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.category?.name && t.category.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesCategory = filterCategory === 'all' || (t.category?._id || t.category) === filterCategory;

      let matchesDate = true;
      if (t.date) {
        const txDate = new Date(t.date).toISOString().split('T')[0];
        if (startDate && txDate < startDate) matchesDate = false;
        if (endDate && txDate > endDate) matchesDate = false;
      }

      return matchesSearch && matchesType && matchesCategory && matchesDate;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date || 0) - new Date(a.date || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.date || 0) - new Date(b.date || 0);
      }
      if (sortBy === 'highest') {
        return (Number(b.amount) || 0) - (Number(a.amount) || 0);
      }
      if (sortBy === 'lowest') {
        return (Number(a.amount) || 0) - (Number(b.amount) || 0);
      }
      return 0;
    });

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('No transactions to export');
      return;
    }

    const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Payment Method', 'Note'];
    const rows = filteredTransactions.map((t) => [
      t.date ? new Date(t.date).toLocaleDateString() : '',
      t.title || '',
      t.type || '',
      t.category?.name || t.category || 'Other',
      t.amount || 0,
      t.paymentMethod || 'UPI',
      `"${(t.note || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transactions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalIncome = filteredTransactions
    .filter((t) => t && t.type === 'income')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const totalExpense = filteredTransactions
    .filter((t) => t && t.type === 'expense')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const netTotal = totalIncome - totalExpense;

  // Recurring stats
  const monthlyRecurringExpense = recurringRules
    .filter((r) => r.status === 'active' && r.type === 'expense')
    .reduce((acc, r) => {
      const amt = Number(r.amount) || 0;
      if (r.frequency === 'daily') return acc + amt * 30;
      if (r.frequency === 'weekly') return acc + amt * 4.33;
      if (r.frequency === 'yearly') return acc + amt / 12;
      return acc + amt; // monthly default
    }, 0);

  const activeRecurringCount = recurringRules.filter((r) => r.status === 'active').length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

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
        {/* Header: Title + Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transactions</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeTab === 'all' 
                ? `${filteredTransactions.length} record(s)` 
                : `${recurringRules.length} recurring rule(s)`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'all' ? (
              <>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  Export CSV
                </button>

                <button
                  onClick={openAddModal}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-medium shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </>
            ) : (
              <button
                onClick={openAddRecurringModal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Recurring Rule
              </button>
            )}
          </div>
        </div>

        {/* Dual Tab Switcher: All Transactions vs Recurring */}
        <div className="flex items-center gap-2 p-1 bg-slate-200/70 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Transactions ({filteredTransactions.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recurring')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'recurring'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Recurring & Subscriptions</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
              activeTab === 'recurring' ? 'bg-purple-700/80 text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              {recurringRules.length}
            </span>
          </button>
        </div>

        {/* TAB 1: ALL TRANSACTIONS */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            {/* 3 Summary Pills */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
                <span>↑ Income</span>
                <span>{currencySymbol}{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
                <span>↓ Expense</span>
                <span>{currencySymbol}{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                <span>🗂 Net</span>
                <span>{currencySymbol}{netTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Search & Filters Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
              {/* Search Bar + Filters Toggle */}
              <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2.5 flex-1">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    showFilters 
                      ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-xs' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filters
                </button>
              </div>

              {/* Filter Rows */}
              {showFilters && (
                <div className="space-y-3 pt-1">
                  {/* Row 1: All types | All categories | Start Date | End Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* 1. All types */}
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    >
                      <option value="all">All types</option>
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>

                    {/* 2. All categories */}
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    >
                      <option value="all">All categories</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    {/* 3. Start Date */}
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="mm/dd/yyyy"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      title="Start Date"
                    />

                    {/* 4. End Date */}
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="mm/dd/yyyy"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      title="End Date"
                    />
                  </div>

                  {/* Row 2: Sort dropdown + Reset button */}
                  <div className="flex items-center gap-3">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    >
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="highest">Highest amount</option>
                      <option value="lowest">Lowest amount</option>
                    </select>

                    {(startDate || endDate || filterType !== 'all' || filterCategory !== 'all' || searchTerm) && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setFilterType('all');
                          setFilterCategory('all');
                          setStartDate('');
                          setEndDate('');
                          setSortBy('newest');
                        }}
                        className="px-3 py-2 text-xs text-purple-600 hover:text-purple-700 font-medium whitespace-nowrap hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Transactions List */}
            <div className="space-y-3">
              {loading ? (
                <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
                  Loading transactions...
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
                  No transactions found.
                </div>
              ) : (
                filteredTransactions.map((t) => {
                  const cat = t.category || {};
                  const isIncome = t.type === 'income';
                  const catName = cat.name || 'Uncategorized';
                  const catIcon = cat.icon || 'ShoppingBag';
                  const catColor = cat.color || '#8b5cf6';
                  const displayTitle = t.title || catName;

                  return (
                    <div
                      key={t._id}
                      className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex items-center justify-between hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${catColor}15` }}
                        >
                          <CategoryIcon iconName={catIcon} color={catColor} />
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-slate-800">
                            {cat.name || categories.find(c => c._id === (t.category?._id || t.category))?.name || 'Expense'}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatDate(t.date)} · {t.paymentMethod || 'UPI'}{t.note ? ` · ${t.note}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className={`text-sm font-bold tracking-tight ${
                            isIncome ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {isIncome ? '+' : '-'}{currencySymbol}{Number(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(t)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(t._id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: RECURRING & SUBSCRIPTIONS */}
        {activeTab === 'recurring' && (
          <div className="space-y-6">
            {/* 2 Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Monthly Commitment
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                    {currencySymbol}{monthlyRecurringExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    <span className="text-xs font-normal text-slate-400">/mo</span>
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <RotateCw className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Active Rules
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                    {activeRecurringCount} <span className="text-xs font-normal text-slate-400">active of {recurringRules.length}</span>
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Recurring Rules List */}
            <div className="space-y-3">
              {recurringRules.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <RotateCw className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No recurring rules set yet.</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4 max-w-sm mx-auto">
                    Set up rent, WiFi, subscriptions or monthly salary to track recurring finances automatically.
                  </p>
                  <button
                    type="button"
                    onClick={openAddRecurringModal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Recurring Rule
                  </button>
                </div>
              ) : (
                recurringRules.map((r) => {
                  const cat = r.category || {};
                  const isIncome = r.type === 'income';
                  const catName = cat.name || 'Uncategorized';
                  const catIcon = cat.icon || 'ShoppingBag';
                  const catColor = cat.color || '#8b5cf6';
                  const isActive = r.status === 'active';

                  return (
                    <div
                      key={r._id}
                      className={`bg-white rounded-2xl border p-4 shadow-xs flex items-center justify-between hover:shadow-sm transition-all ${
                        isActive ? 'border-slate-100' : 'border-slate-200/60 opacity-60 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${catColor}15` }}
                        >
                          <CategoryIcon iconName={catIcon} color={catColor} />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-slate-800">{r.title}</h4>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 capitalize">
                              {r.frequency}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {catName} · Next due: <span className="font-medium text-slate-600">{formatDate(r.nextRunDate)}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className={`text-sm font-bold tracking-tight ${
                            isIncome ? 'text-emerald-600' : 'text-slate-900'
                          }`}
                        >
                          {isIncome ? '+' : '-'}{currencySymbol}{Number(r.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          <span className="text-[11px] font-normal text-slate-400">/{r.frequency === 'monthly' ? 'mo' : r.frequency}</span>
                        </span>

                        {/* On / Off Toggle switch */}
                        <button
                          type="button"
                          onClick={() => handleToggleRecurringStatus(r)}
                          title={isActive ? 'Click to Pause' : 'Click to Activate'}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                            isActive ? 'bg-purple-600' : 'bg-slate-300'
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              isActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditRecurringModal(r)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteRecurring(r._id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ---------------- TRANSACTIONS MODAL ---------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? 'Edit Transaction' : 'Add Transaction'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type toggle */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-medium">
              <button
                type="button"
                onClick={() => { setModalType('expense'); setCategory(''); }}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-all cursor-pointer ${
                  modalType === 'expense'
                    ? 'bg-white text-slate-800 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <TrendingDown className="w-4 h-4 text-slate-600" />
                Expense
              </button>
              <button
                type="button"
                onClick={() => { setModalType('income'); setCategory(''); }}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-all cursor-pointer ${
                  modalType === 'income'
                    ? 'bg-white text-slate-800 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-slate-600" />
                Income
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                    AMOUNT
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                    DATE
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                  CATEGORY
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white cursor-pointer"
                >
                  <option value="">Select category...</option>
                  {categories
                    .filter((c) => c.type === modalType)
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
                  PAYMENT METHOD
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {PAYMENT_METHODS.map(({ id, label, icon: IconComp }) => {
                    const isSelected = paymentMethod === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPaymentMethod(id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50/50 text-purple-700 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <IconComp className="w-4 h-4 mb-1" />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {recError && <p className="text-xs text-red-500">{recError}</p>}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecurringModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {recSubmitting ? 'Saving...' : editingRecurringId ? 'Update Rule' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- RECURRING RULE MODAL ---------------- */}
      {isRecurringModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {editingRecurringId ? 'Edit Recurring Rule' : 'Add Recurring Rule'}
              </h3>
              <button
                type="button"
                onClick={() => setIsRecurringModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type toggle */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-medium">
              <button
                type="button"
                onClick={() => { setRecType('expense'); setRecCategory(''); }}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-all cursor-pointer ${
                  recType === 'expense'
                    ? 'bg-white text-slate-800 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <TrendingDown className="w-4 h-4 text-slate-600" />
                Expense (Rent, Bill)
              </button>
              <button
                type="button"
                onClick={() => { setRecType('income'); setRecCategory(''); }}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-all cursor-pointer ${
                  recType === 'income'
                    ? 'bg-white text-slate-800 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-slate-600" />
                Income (Salary)
              </button>
            </div>

            <form onSubmit={handleSaveRecurring} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                  TITLE
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apartment Rent, Netflix, Salary"
                  value={recTitle}
                  onChange={(e) => setRecTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                    AMOUNT ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={recAmount}
                    onChange={(e) => setRecAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                    FREQUENCY
                  </label>
                  <select
                    value={recFrequency}
                    onChange={(e) => setRecFrequency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white cursor-pointer"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="yearly">Yearly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                    CATEGORY
                  </label>
                  <select
                    value={recCategory}
                    onChange={(e) => setRecCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white cursor-pointer"
                  >
                    <option value="">Select category...</option>
                    {categories
                      .filter((c) => c.type === recType)
                      .map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                    START DATE
                  </label>
                  <input
                    type="date"
                    value={recStartDate}
                    onChange={(e) => setRecStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
                  PAYMENT METHOD
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {PAYMENT_METHODS.map(({ id, label, icon: IconComp }) => {
                    const isSelected = recPaymentMethod === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setRecPaymentMethod(id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50/50 text-purple-700 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <IconComp className="w-4 h-4 mb-1" />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {recError && <p className="text-xs text-red-500">{recError}</p>}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecurringModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {recSubmitting ? 'Saving...' : editingRecurringId ? 'Update Rule' : 'Save Recurring Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}