import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Trash2, 
  Target, 
  ChevronLeft, 
  ChevronRight, 
  X,
  ShoppingBag, 
  Utensils, 
  Home, 
  Car, 
  Tv, 
  Zap, 
  Heart, 
  Activity,
  GraduationCap, 
  Briefcase, 
  Plane, 
  Coffee, 
  Gift, 
  Tag,
  Dumbbell,
  Stethoscope,
  Smile,
  Music,
  Film,
  Smartphone,
  Wifi,
  CreditCard,
  PiggyBank,
  DollarSign,
  Wallet,
  Shield,
  BookOpen,
  FileText,   // <-- Yeh yahan hona zaroori hai!
  Receipt,
  File,
  Monitor,
  Video,
  Camera
} from 'lucide-react';

const iconMap = {
  ShoppingBag,
  Utensils,
  Home,
  Car,
  Tv,
  Zap,
  Heart,
  Activity,
  GraduationCap,
  Briefcase,
  Plane,
  Coffee,
  Gift,
  Tag,
  Dumbbell,
  Stethoscope,
  Smile,
  Music,
  Film,
  Smartphone,
  Wifi,
  CreditCard,
  PiggyBank,
  DollarSign,
  Wallet,
  Shield,
  BookOpen,
  FileText,
  Receipt,
  File,
  Monitor,
  Video,
  Camera,
  // Direct Aliases for Database / Category Name mismatches
  bill: DollarSign,
  bills: DollarSign,
  dollar: DollarSign,
  money: DollarSign,
  cash: DollarSign,
  entertainment: Film,
  movie: Film,
  movies: Film,
  health: Activity,
  food: Utensils,
  transport: Car,
  shopping: ShoppingBag,
  salary: DollarSign,
  freelance: Briefcase,
  investments: PiggyBank
};

const CategoryIcon = ({ name, color, size = 18 }) => {
  const getIcon = () => {
    if (!name) return Tag;
    const cleanName = String(name).toLowerCase().trim();
    const match = Object.keys(iconMap).find(
      (k) => k.toLowerCase() === cleanName
    );
    return match ? iconMap[match] : Tag;
  };
  const IconComponent = getIcon();

  return (
    <div 
      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
      style={{ 
        backgroundColor: color ? `${color}15` : '#f1f5f9', 
        color: color || '#64748b' 
      }}
    >
      <IconComponent size={size} />
    </div>
  );
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Budgets = () => {
  const { currencySymbol } = useAuth();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  const [formData, setFormData] = useState({
    category: '',
    limit: '',
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/budgets?month=${selectedMonth}&year=${selectedYear}`);
      const data = res.data?.data || res.data || [];
      setBudgets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      // Backend response ke sabhi possible formats ko handle karne ke liye:
      const rawData = res.data?.data || res.data?.categories || res.data || [];
      const categoryList = Array.isArray(rawData) ? rawData : [];
      
      // Agar aap chahte hain ki budget me sirf 'expense' categories hi dikhein:
      const expenseCategories = categoryList.filter(c => c.type === 'expense' || !c.type);
      
      setCategories(expenseCategories.length > 0 ? expenseCategories : categoryList);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.limit) {
      showToast('Please select category and enter amount');
      return;
    }

    try {
      await api.post('/budgets', {
        category: formData.category,
        amount: Number(formData.limit),
        limit: Number(formData.limit),
        month: selectedMonth,
        year: selectedYear,
      });

      setIsModalOpen(false);
      setFormData({ category: '', limit: '' });
      showToast('Budget saved successfully!');
      fetchBudgets();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save budget');
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      await api.delete(`/budgets/${id}`);
      showToast('Budget deleted');
      fetchBudgets();
    } catch (err) {
      showToast('Failed to delete budget');
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + (Number(b.limit || b.amount) || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (Number(b.spent) || 0), 0);
  const totalRemaining = totalBudget - totalSpent;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {toast && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg z-50 text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Budgets</h1>
          <p className="text-sm text-slate-500">
            {months[selectedMonth - 1]} {selectedYear}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-sm font-semibold text-slate-700 min-w-[120px] text-center">
              {months[selectedMonth - 1]} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-xs"
          >
            <Plus size={16} />
            <span>Set budget</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Budget</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{currencySymbol}{totalBudget.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Spent</p>
          <p className="text-2xl font-bold text-rose-500 mt-1">{currencySymbol}{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Remaining</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{currencySymbol}{totalRemaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Budget List */}
      <div className="bg-white rounded-2xl border border-slate-100 px-6 py-2 shadow-2xs">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading budgets...</div>
        ) : budgets.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target size={24} />
            </div>
            <p className="text-sm font-medium text-slate-700">No budgets set for this month</p>
            <p className="text-xs text-slate-400 mt-1">Click "Set budget" to start tracking limits</p>
          </div>
        ) : (
          <div>
            {budgets.map((b) => {
              const limit = Number(b.limit || b.amount) || 0;
              const spent = Number(b.spent) || 0;
              const remaining = limit - spent;
              const percent = limit > 0 ? (spent / limit) * 100 : 0;
              // Category ID ko safely extract karein chahe woh object ho ya string
              const catId = typeof b.category === 'object' && b.category !== null ? b.category._id : b.category;
              
              // String comparison se exact match ensure karein
              const matchedCat = categories.find(c => String(c._id) === String(catId));

              const catName = matchedCat?.name || (typeof b.category === 'object' ? b.category?.name : 'General');
              const catIcon = matchedCat?.icon || (typeof b.category === 'object' ? b.category?.icon : 'Tag');
              const catColor = matchedCat?.color || (typeof b.category === 'object' ? b.category?.color : '#8b5cf6');

              return (
                <div key={b._id} className="py-4 border-b border-slate-100 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CategoryIcon name={catIcon} color={catColor} />
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 leading-tight">{catName}</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          {currencySymbol}{spent.toLocaleString('en-IN', { minimumFractionDigits: 2 })} spent of {currencySymbol}{limit.toLocaleString('en-IN', { minimumFractionDigits: 2 })} · {currencySymbol}{Math.max(0, remaining).toLocaleString('en-IN', { minimumFractionDigits: 2 })} left
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-700">
                        {Math.round(percent)}%
                      </span>
                      <button
                        onClick={() => handleDeleteBudget(b._id)}
                        className="text-slate-300 hover:text-rose-600 p-1 rounded-lg transition-colors"
                        title="Delete budget"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Dashboard-identical pure purple gradient line */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-2.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        spent > limit
                          ? 'bg-rose-500'
                          : 'bg-gradient-to-r from-purple-300 via-purple-400 to-purple-600'
                      }`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Set Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-4">Set monthly budget</h3>

            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-600"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Monthly Limit ({currencySymbol})
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-600"
                  required
                  min="1"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors shadow-xs"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;