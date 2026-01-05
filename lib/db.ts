import fs from 'fs';
import path from 'path';
import { Category, Expense } from './types';

// Lazy initialization - only create directory/files when needed
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
}

function getCategoriesFile(): string {
  const dataDir = ensureDataDir();
  const categoriesFile = path.join(dataDir, 'categories.json');
  if (!fs.existsSync(categoriesFile)) {
    fs.writeFileSync(categoriesFile, JSON.stringify([], null, 2));
  }
  return categoriesFile;
}

function getExpensesFile(): string {
  const dataDir = ensureDataDir();
  const expensesFile = path.join(dataDir, 'expenses.json');
  if (!fs.existsSync(expensesFile)) {
    fs.writeFileSync(expensesFile, JSON.stringify([], null, 2));
  }
  return expensesFile;
}

// Default categories template
const defaultCategoriesTemplate = [
  { name: 'Food', color: '#FFD6CC', icon: '🍔' },
  { name: 'Transport', color: '#B3E5FC', icon: '🚗' },
  { name: 'Rent', color: '#C8E6C9', icon: '🏠' },
  { name: 'Shopping', color: '#F8BBD0', icon: '🛍️' },
  { name: 'Entertainment', color: '#FFE5B4', icon: '🎬' },
  { name: 'Utilities', color: '#D4A574', icon: '💡' },
  { name: 'Misc', color: '#E1BEE7', icon: '📦' },
];

// Database interface
class Database {
  private readCategories(userId: number): Category[] {
    const categoriesFile = getCategoriesFile();
    const data = fs.readFileSync(categoriesFile, 'utf-8');
    const categories = JSON.parse(data) as Category[];
    
    // Filter by user
    const userCategories = categories.filter(cat => cat.user_id === userId);
    
    // If user has no categories, create defaults
    if (userCategories.length === 0) {
      const now = new Date().toISOString();
      const newCategories: Category[] = defaultCategoriesTemplate.map((cat, index) => ({
        ...cat,
        id: index + 1,
        user_id: userId,
        is_default: 1,
        created_at: now,
      }));
      
      // Add to all categories
      const allCategories = [...categories, ...newCategories];
      fs.writeFileSync(categoriesFile, JSON.stringify(allCategories, null, 2));
      return newCategories;
    }
    
    return userCategories;
  }

  private writeCategories(categories: Category[], userId: number): void {
    const categoriesFile = getCategoriesFile();
    const data = fs.readFileSync(categoriesFile, 'utf-8');
    const allCategories = JSON.parse(data) as Category[];
    
    // Remove user's old categories and add new ones
    const filtered = allCategories.filter(cat => cat.user_id !== userId);
    const updated = [...filtered, ...categories];
    
    fs.writeFileSync(categoriesFile, JSON.stringify(updated, null, 2));
  }

  private readExpenses(userId: number): Expense[] {
    const expensesFile = getExpensesFile();
    const data = fs.readFileSync(expensesFile, 'utf-8');
    const expenses = JSON.parse(data) as Expense[];
    return expenses.filter(exp => exp.user_id === userId);
  }

  private writeExpenses(expenses: Expense[], userId: number): void {
    const expensesFile = getExpensesFile();
    const data = fs.readFileSync(expensesFile, 'utf-8');
    const allExpenses = JSON.parse(data) as Expense[];
    
    // Remove user's old expenses and add new ones
    const filtered = allExpenses.filter(exp => exp.user_id !== userId);
    const updated = [...filtered, ...expenses];
    
    fs.writeFileSync(expensesFile, JSON.stringify(updated, null, 2));
  }

  // Category methods
  getCategories(userId: number): Category[] {
    return this.readCategories(userId);
  }

  getCategoryById(id: number, userId: number): Category | undefined {
    const categories = this.readCategories(userId);
    return categories.find(cat => cat.id === id);
  }

  createCategory(category: Omit<Category, 'id' | 'created_at' | 'user_id'>, userId: number): Category {
    const categories = this.readCategories(userId);
    const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
    const newCategory: Category = {
      ...category,
      id: newId,
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    categories.push(newCategory);
    this.writeCategories(categories, userId);
    return newCategory;
  }

  updateCategory(id: number, updates: Partial<Category>, userId: number): Category | null {
    const categories = this.readCategories(userId);
    const index = categories.findIndex(cat => cat.id === id);
    if (index === -1) return null;
    
    categories[index] = { ...categories[index], ...updates };
    this.writeCategories(categories, userId);
    return categories[index];
  }

  deleteCategory(id: number, userId: number): boolean {
    const categories = this.readCategories(userId);
    const category = categories.find(cat => cat.id === id);
    if (!category || category.is_default) return false;
    
    // Check if category is used by any expenses
    const expenses = this.readExpenses(userId);
    if (expenses.some(exp => exp.category_id === id)) return false;
    
    const filtered = categories.filter(cat => cat.id !== id);
    this.writeCategories(filtered, userId);
    return true;
  }

  // Expense methods
  getExpenses(userId: number, startDate?: string, endDate?: string): Expense[] {
    let expenses = this.readExpenses(userId);
    
    if (startDate && endDate) {
      expenses = expenses.filter(exp => exp.date >= startDate && exp.date <= endDate);
    }
    
    return expenses.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  getExpenseById(id: number, userId: number): Expense | undefined {
    const expenses = this.readExpenses(userId);
    return expenses.find(exp => exp.id === id);
  }

  createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'user_id'>, userId: number): Expense {
    const expenses = this.readExpenses(userId);
    const newId = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
    const now = new Date().toISOString();
    const newExpense: Expense = {
      ...expense,
      id: newId,
      user_id: userId,
      created_at: now,
      updated_at: now,
    };
    expenses.push(newExpense);
    this.writeExpenses(expenses, userId);
    return newExpense;
  }

  updateExpense(id: number, updates: Partial<Expense>, userId: number): Expense | null {
    const expenses = this.readExpenses(userId);
    const index = expenses.findIndex(exp => exp.id === id);
    if (index === -1) return null;
    
    expenses[index] = {
      ...expenses[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.writeExpenses(expenses, userId);
    return expenses[index];
  }

  deleteExpense(id: number, userId: number): boolean {
    const expenses = this.readExpenses(userId);
    const filtered = expenses.filter(exp => exp.id !== id);
    if (filtered.length === expenses.length) return false;
    
    this.writeExpenses(filtered, userId);
    return true;
  }

  // Migration helper - assign existing data to a user
  migrateDataToUser(userId: number): void {
    // Migrate categories
    const categoriesFile = getCategoriesFile();
    const categoriesData = fs.readFileSync(categoriesFile, 'utf-8');
    const categories = JSON.parse(categoriesData) as Category[];
    const unmigratedCategories = categories.filter(cat => !cat.user_id);
    
    if (unmigratedCategories.length > 0) {
      unmigratedCategories.forEach(cat => {
        cat.user_id = userId;
      });
      const migratedCategories = categories.map(cat => {
        const unmigrated = unmigratedCategories.find(uc => uc.id === cat.id);
        return unmigrated || cat;
      });
      fs.writeFileSync(categoriesFile, JSON.stringify(migratedCategories, null, 2));
    }

    // Migrate expenses
    const expensesFile = getExpensesFile();
    const expensesData = fs.readFileSync(expensesFile, 'utf-8');
    const expenses = JSON.parse(expensesData) as Expense[];
    const unmigratedExpenses = expenses.filter(exp => !exp.user_id);
    
    if (unmigratedExpenses.length > 0) {
      unmigratedExpenses.forEach(exp => {
        exp.user_id = userId;
      });
      const migratedExpenses = expenses.map(exp => {
        const unmigrated = unmigratedExpenses.find(ue => ue.id === exp.id);
        return unmigrated || exp;
      });
      fs.writeFileSync(expensesFile, JSON.stringify(migratedExpenses, null, 2));
    }
  }
}

// Create database instance (lazy initialization)
const db = new Database();

export default db;
