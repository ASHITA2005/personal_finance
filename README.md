# 💛 Personal Finance Manager

A cozy and cute personal financial management web application that makes tracking expenses delightful! Built with Next.js, TypeScript, Tailwind CSS, and SQLite.

## ✨ Features

### 📝 Expense Entry
- Add daily expenses with amount, date, category, and optional notes
- Edit and delete existing expenses
- Form validation (no negative amounts, required fields)

### 🏷️ Categories
- Predefined default categories (Food 🍔, Transport 🚗, Rent 🏠, Shopping 🛍️, Entertainment 🎬, Utilities 💡, Misc 📦)
- Add, edit, and delete custom categories
- Each category has its own color and icon

### 📊 On-Demand Reports
- Generate reports for any date range
- View total expenses and category-wise breakdown
- See percentage distribution by category
- Daily, weekly, and monthly spending trends
- Highest spending day and top category insights

### 🎯 Dashboard
- Summary cards showing:
  - Total spent (last 30 days)
  - Top spending category
  - Average daily spend
- Interactive charts:
  - Pie chart for category distribution
  - Line chart for spending over time
- Recent expenses list

## 🎨 Design

- **Extremely cute, cozy aesthetic** with soft yellow background
- Pastel accents (cream, beige, soft brown, blush)
- Rounded cards and buttons with soft shadows
- Cute icons for expense categories
- Friendly, playful typography
- Micro-animations for hover, add, delete, and success states
- Fully responsive (mobile + desktop)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) with React 18
- **Styling**: Tailwind CSS with custom theme
- **Database**: SQLite with better-sqlite3
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Language**: TypeScript

## 📦 Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd personal_proj
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database

The application uses SQLite with `better-sqlite3`. The database file (`finance.db`) will be automatically created on first run with:

- **Categories table**: Stores expense categories with colors and icons
- **Expenses table**: Stores individual expenses linked to categories
- **Indexes**: Optimized for date and category queries

Default categories are automatically seeded on first run.

## 📁 Project Structure

```
personal_proj/
├── app/
│   ├── api/              # API routes
│   │   ├── categories/   # Category CRUD endpoints
│   │   ├── expenses/     # Expense CRUD endpoints
│   │   └── reports/      # Report generation endpoint
│   ├── globals.css       # Global styles with Tailwind
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page component
├── components/
│   ├── Dashboard.tsx     # Dashboard with summary and charts
│   ├── ExpenseForm.tsx   # Add expense form
│   ├── ExpenseList.tsx   # List and edit expenses
│   ├── CategoryManager.tsx # Manage categories
│   └── Reports.tsx       # Generate and view reports
├── lib/
│   ├── db.ts             # Database setup and initialization
│   └── types.ts          # TypeScript type definitions
└── package.json          # Dependencies and scripts
```

## 🚀 Usage

1. **Add Expenses**: Click "Add Expense" in the navigation, fill in the form, and submit
2. **View Dashboard**: See your spending summary and trends on the main dashboard
3. **Manage Categories**: Add custom categories with your preferred colors and icons
4. **Generate Reports**: Select a date range and view detailed spending analysis

## 🔮 Future Enhancements

The codebase is structured for easy expansion. Potential features:

- Income tracking
- Budget setting and alerts
- Export to CSV/PDF
- Recurring expenses
- Multi-currency support
- Dark mode
- Data backup/restore

## 📝 Notes

- The database file (`finance.db`) is created in the project root
- Default categories cannot be deleted but can be used for all expenses
- Custom categories can only be deleted if they have no associated expenses
- All dates are stored in ISO format (YYYY-MM-DD)

## 💛 Enjoy Tracking Your Expenses!

This app is designed to make financial tracking feel warm, friendly, and delightful. Happy budgeting! 🌼

