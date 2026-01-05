export interface Category {
  id: number;
  user_id: number;
  name: string;
  color: string;
  icon: string;
  is_default: number;
  created_at: string;
}

export interface Expense {
  id: number;
  user_id: number;
  amount: number;
  date: string;
  category_id: number;
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseWithCategory extends Expense {
  category: Category;
}

export interface ReportData {
  totalExpenses: number;
  categoryBreakdown: Array<{
    category: Category;
    total: number;
    percentage: number;
  }>;
  dailyTrends: Array<{
    date: string;
    total: number;
  }>;
  weeklyTrends: Array<{
    week: string;
    total: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    total: number;
  }>;
  highestSpendingDay: {
    date: string;
    total: number;
  };
  topCategory: {
    category: Category;
    total: number;
  };
}

