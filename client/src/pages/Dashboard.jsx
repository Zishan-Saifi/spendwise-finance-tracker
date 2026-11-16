import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Download } from 'lucide-react';
import { generateMonthlyPdfReport } from '../utils/generatePdfReport';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Sun,
  Moon,
  // Category Icons from Categories page
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
  TrendingUp as TrendingUpIcon,
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
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DONUT_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

// Map of category icon strings to actual Lucide components
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
  TrendingUp: TrendingUpIcon,
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

// Helper component to render category icon
function CategoryIcon({ iconName, color, className = 'w-4 h-4' }) {
  const IconComponent = ICON_COMPONENTS[iconName];

  if (IconComponent) {
    return <IconComponent className={className} style={{ color: color || '#8b5cf6' }} />;
  }

  // Fallback if iconName is an emoji or unknown
  if (iconName && iconName.length <= 2) {
    return <span className="text-base">{iconName}</span>;
  }

  return <ShoppingBag className={className} style={{ color: color || '#8b5cf6' }} />;
}

export default function Dashboard() {
  const { currencySymbol } = useAuth();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const currentDate = new Date();

  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all transactions and budgets
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [txnRes, budgetRes] = await Promise.all([
          api.get('/transactions'),
          api.get(`/budgets?month=${selectedMonth}&year=${selectedYear}`)
        ]);

        const txnList = Array.isArray(txnRes.data)
          ? txnRes.data
          : (txnRes.data?.transactions || []);
        const budgetList = Array.isArray(budgetRes.data)
          ? budgetRes.data
          : (budgetRes.data?.budgets || []);

        setTransactions(txnList);
        setBudgets(budgetList);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

  // Filter transactions for selected Month & Year
  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return (d.getMonth() + 1) === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  // 1. Metric calculations
  const totalIncome = useMemo(() => {
    return monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [monthlyTransactions]);

  const totalExpense = useMemo(() => {
    return monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [monthlyTransactions]);

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((balance / totalIncome) * 100)) : 0;
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const avgPerDay = (totalExpense / daysInMonth).toFixed(2);
  const expenseCount = monthlyTransactions.filter(t => t.type === 'expense').length;

  // 2. Spending by category (Donut chart)
  const categoryData = useMemo(() => {
    const map = {};
    monthlyTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const catName = t.category?.name || 'Other';
        map[catName] = (map[catName] || 0) + Number(t.amount || 0);
      });

    return Object.keys(map).map(name => ({
      name,
      value: map[name]
    }));
  }, [monthlyTransactions]);

  // 3. Annual Income vs Expense (12 months of selectedYear)
  const annualData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m, idx) => {
      const monthTxns = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === selectedYear && d.getMonth() === idx;
      });

      const inc = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
      const exp = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);

      return {
        month: m,
        Income: inc,
        Expense: exp
      };
    });
  }, [transactions, selectedYear]);

  // 4. Last 30 Days spending trend
  const last30DaysData = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

      const daySpent = transactions
        .filter(t => {
          if (t.type !== 'expense') return false;
          const td = new Date(t.date);
          return (
            td.getDate() === d.getDate() &&
            td.getMonth() === d.getMonth() &&
            td.getFullYear() === d.getFullYear()
          );
        })
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      list.push({ date: dayStr, Spent: daySpent });
    }
    return list;
  }, [transactions]);

  // 5. Recent transactions (latest 5)
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [transactions]);

  // Budget totals
  const overallBudgetLimit = budgets.reduce((acc, b) => acc + Number(b.limit || b.amount || 0), 0);
  const overallBudgetSpent = budgets.reduce((acc, b) => acc + Number(b.spent || 0), 0);
  // Download Monthly PDF Report
  const handleDownloadPdf = () => {
    const monthName = MONTH_NAMES[selectedMonth - 1] || 'Current Month';

    const breakdown = categoryData.map((c) => ({
      name: c.name,
      total: c.value,
    }));

    generateMonthlyPdfReport({
      user,
      monthName,
      year: selectedYear,
      currencyCode: user?.preferredCurrency || 'USD',
      currencySymbol: currencySymbol || '₹',
      income: totalIncome,
      expenses: totalExpense,
      savings: balance,
      categoryBreakdown: breakdown,
      transactions: monthlyTransactions,
    });
  };
  
  // Custom Colored Tooltip for Bar Chart
const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const incomeItem = payload.find((p) => p.dataKey === 'Income');
    const expenseItem = payload.find((p) => p.dataKey === 'Expense');

    return (
      <div className="bg-[#0f172a] text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700/60 text-xs min-w-[160px]">
        <p className="font-bold text-slate-100 text-sm mb-1.5">{label}</p>
        {incomeItem && (
          <p className="text-emerald-400 font-semibold text-[13px] py-0.5">
            Income : {currencySymbol}{Number(incomeItem.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        )}
        {expenseItem && (
          <p className="text-rose-500 font-semibold text-[13px] py-0.5">
            Expense : {currencySymbol}{Number(expenseItem.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        )}
      </div>
    );
  }
  return null;
};


  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Greeting & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            {MONTH_NAMES[selectedMonth - 1]} {selectedYear} overview
          </p>
        </div>

        {/* Theme Switch & Month Selector */}
        <div className="flex items-center gap-3">
            {/* Download PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition shadow-sm cursor-pointer"
            title="Download Monthly PDF Report"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        

          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200 px-3.5 py-2 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
          >
            {MONTH_NAMES.map((m, idx) => (
              <option key={m} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
          >
            {[2024, 2025, 2026, 2027, 2028].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Income */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">INCOME</p>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{currencySymbol}{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-400 mt-1">{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</p>
        </div>

        {/* Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">EXPENSES</p>
            <span className="p-1.5 bg-red-50 text-red-500 rounded-lg">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-red-500 mt-2">{currencySymbol}{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-400 mt-1">{expenseCount} transaction{expenseCount !== 1 ? 's' : ''}</p>
        </div>

        {/* Balance */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">BALANCE</p>
            <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{currencySymbol}{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-400 mt-1">Available funds</p>
        </div>

        {/* Savings Rate */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">SAVINGS RATE</p>
            <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Target className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{savingsRate}%</p>
          <p className="text-xs text-gray-400 mt-1">Avg/day {currencySymbol}{avgPerDay}</p>
        </div>
      </div>

      {/* Middle Row: Spending by Category & Budget Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Spending by category</h2>
            <span className="text-xs text-gray-400">{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</span>
          </div>

          {categoryData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-sm">
              <p>No expenses recorded for this month.</p>
            </div>
          ) : (
            <div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`${currencySymbol}${Number(val).toLocaleString()}`, 'Spent']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend Chips */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-2 pt-2 border-t border-gray-50">
                {categoryData.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                    />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Budget Health */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Budget health</h2>
            <Link to="/budgets" className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-0.5">
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {budgets.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-sm">
              <p>No budgets set for this month.</p>
              <Link to="/budgets" className="mt-3 text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg font-medium hover:bg-purple-100">
                + Create a budget
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto pr-1">
                {budgets.map((b) => {
                  const limitVal = Number(b.limit || b.amount || 0);
                  const spentVal = Number(b.spent || 0);
                  const pct = limitVal > 0 ? Math.min(100, Math.round((spentVal / limitVal) * 100)) : 0;
                  const isOver = spentVal > limitVal;

                  return (
                    <div key={b._id} className="py-2.5 first:pt-0 last:pb-0 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-800 flex items-center gap-2">
                          <CategoryIcon iconName={b.category?.icon} color={b.category?.color} className="w-4 h-4" />
                          <span>{b.category?.name || 'Category'}</span>
                        </span>
                        <span className="text-gray-500 font-medium">
                          {currencySymbol}{spentVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / {currencySymbol}{limitVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      {/* Reference Style Thin Gradient Progress Line */}
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        {pct > 0 && (
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isOver
                                ? 'bg-red-500'
                                : 'bg-gradient-to-r from-purple-300 via-purple-500 to-indigo-600'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Overall Total Text */}
              <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 font-medium">
                Overall: {currencySymbol}{overallBudgetSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })} of {currencySymbol}{overallBudgetLimit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Income vs Expense — Year Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-gray-900">Income vs Expense — {selectedYear}</h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-gray-600">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" /> Income
            </span>
            <span className="flex items-center gap-1 text-gray-600">
              <span className="w-2.5 h-2.5 bg-red-400 rounded-sm" /> Expense
            </span>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={annualData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => (val >= 1000 ? `${currencySymbol}${(val / 1000).toFixed(0)}k` : `${currencySymbol}${val}`)}
              />
              <Tooltip
                content={<CustomBarTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="Expense" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Last 30 Days Spending Line/Area Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-gray-900">Last 30 days spending</h2>
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last30DaysData}>
              <defs>
                <linearGradient id="spendColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => (val >= 1000 ? `${currencySymbol}${(val / 1000).toFixed(0)}k` : `${currencySymbol}${val}`)}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', color: '#fff', borderRadius: '12px', border: 'none' }}
                itemStyle={{ color: '#fff' }}
                formatter={(val) => [`${currencySymbol}${Number(val).toLocaleString()}`, 'Spent']}
              />
              <Area type="monotone" dataKey="Spent" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#spendColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Recent transactions</h2>
          <Link to="/transactions" className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-0.5">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No recent transactions found.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentTransactions.map((t) => {
              const isIncome = t.type === 'income';
              const formattedDate = new Date(t.date).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
              });

              return (
                <div key={t._id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Category Icon Badge */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: t.category?.color ? `${t.category.color}15` : '#f3f4f6'
                      }}
                    >
                      <CategoryIcon
                        iconName={t.category?.icon}
                        color={t.category?.color}
                        className="w-5 h-5"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.category?.name || 'Uncategorized'}</p>
                      <p className="text-xs text-gray-400">
                        {formattedDate} {t.paymentMethod ? `• ${t.paymentMethod}` : ''} {t.note ? `• ${t.note}` : ''}
                      </p>
                    </div>
                  </div>

                  <p className={`text-sm font-bold ${isIncome ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isIncome ? '+' : '-'}{currencySymbol}{Number(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}