import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Currency formatter for standard PDF fonts (avoids encoding bugs with ₹)
const formatCurrencyForPdf = (amount, currencyCode, symbol) => {
  const num = Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (symbol === '₹' || currencyCode === 'INR') {
    return `INR ${num}`;
  }
  return `${symbol || '$'} ${num}`;
};

export const generateMonthlyPdfReport = ({
  user,
  monthName,
  year,
  currencyCode = 'USD',
  currencySymbol = '$',
  income = 0,
  expenses = 0,
  savings = 0,
  categoryBreakdown = [],
  transactions = [],
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [109, 40, 217]; // SpendWise Purple (#6D28D9)
  const darkTextColor = [30, 41, 59]; // Slate 800
  const lightGrayColor = [148, 163, 184]; // Slate 400

  // 1. Top Decorative Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 6, 'F');

  // 2. Header: Logo & Report Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.text('SpendWise', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...lightGrayColor);
  doc.text('Personal Finance Tracker', 14, 25);

  // Right-aligned Metadata (User & Statement Date)
  doc.setFontSize(9);
  doc.setTextColor(...darkTextColor);
  doc.text(`Statement Period: ${monthName} ${year}`, 196, 18, { align: 'right' });
  doc.text(`Generated On: ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`, 196, 23, { align: 'right' });
  if (user?.name) {
    doc.text(`Account Holder: ${user.name}`, 196, 28, { align: 'right' });
  }

  // Divider Line
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.5);
  doc.line(14, 33, 196, 33);

  // 3. Monthly Financial Summary Cards / Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...darkTextColor);
  doc.text('Monthly Financial Overview', 14, 42);

  const formattedIncome = formatCurrencyForPdf(income, currencyCode, currencySymbol);
  const formattedExpenses = formatCurrencyForPdf(expenses, currencyCode, currencySymbol);
  const formattedSavings = formatCurrencyForPdf(savings, currencyCode, currencySymbol);

  autoTable(doc, {
    startY: 46,
    theme: 'grid',
    head: [['Total Income', 'Total Expenses', 'Net Balance / Savings']],
    body: [[formattedIncome, formattedExpenses, formattedSavings]],
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [71, 85, 105],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 12,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 5,
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        if (data.column.index === 0) data.cell.styles.textColor = [16, 185, 129]; // Green
        if (data.column.index === 1) data.cell.styles.textColor = [239, 68, 68]; // Red
        if (data.column.index === 2) {
          data.cell.styles.textColor = savings >= 0 ? [109, 40, 217] : [239, 68, 68];
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // 4. Category Breakdown Table
  let currentY = doc.lastAutoTable.finalY + 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...darkTextColor);
  doc.text('Expenses by Category', 14, currentY);

  const categoryRows = categoryBreakdown.length > 0
    ? categoryBreakdown.map((cat) => {
        const pct = expenses > 0 ? ((cat.total / expenses) * 100).toFixed(1) : 0;
        return [
          cat.name || 'Uncategorized',
          formatCurrencyForPdf(cat.total, currencyCode, currencySymbol),
          `${pct}%`,
        ];
      })
    : [['No category expenses recorded for this month', '-', '-']];

  autoTable(doc, {
    startY: currentY + 4,
    theme: 'striped',
    head: [['Category', 'Amount', '% of Total Expense']],
    body: categoryRows,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 9,
      cellPadding: 3.5,
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { halign: 'right', fontStyle: 'bold' },
      2: { halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  // 5. Transactions Table
  currentY = doc.lastAutoTable.finalY + 12;

  // Check if we need a new page for transactions title
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...darkTextColor);
  doc.text('Transactions Log', 14, currentY);

  const transactionRows = transactions.length > 0
    ? transactions.map((t) => [
        t.date ? new Date(t.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
        t.title || '-',
        t.category?.name || 'General',
        t.type ? t.type.toUpperCase() : '-',
        `${t.type === 'expense' ? '-' : '+'}${formatCurrencyForPdf(t.amount, currencyCode, currencySymbol)}`,
      ])
    : [['No transactions found for this month', '-', '-', '-', '-']];

  autoTable(doc, {
    startY: currentY + 4,
    theme: 'striped',
    head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
    body: transactionRows,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 62 },
      2: { cellWidth: 38 },
      3: { cellWidth: 22, halign: 'center' },
      4: { halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4 && transactions.length > 0) {
        const rawText = String(data.cell.raw || '');
        if (rawText.startsWith('-')) {
          data.cell.styles.textColor = [239, 68, 68]; // Red for expenses
        } else if (rawText.startsWith('+')) {
          data.cell.styles.textColor = [16, 185, 129]; // Green for income
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // 6. Page Numbers in Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...lightGrayColor);
    doc.text(
      `SpendWise Financial Report • Page ${i} of ${totalPages}`,
      105,
      290,
      { align: 'center' }
    );
  }

  // 7. Trigger download
  const filename = `SpendWise_Report_${monthName}_${year}.pdf`;
  doc.save(filename);
};