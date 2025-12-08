# SABCEMM PhD Project - Complete Frontend Setup Guide

This guide will help you build and run the complete SABCEMM frontend dashboard for your PhD project.

## 🎯 Overview

You now have a professional, comprehensive web application for your SABCEMM simulations with:

- ✅ **Advanced Dashboard** - Real-time statistics and key metrics
- ✅ **Deep Visualizations** - Price charts, returns, volatility, distributions
- ✅ **Parameter Editor** - Edit XML configurations visually
- ✅ **Simulation Control** - Run simulations from the web interface
- ✅ **Data Browser** - Explore all your simulation results
- ✅ **Quantitative Analysis** - Sharpe ratio, max drawdown, skewness, kurtosis, and more

## 📋 Prerequisites

1. **SABCEMM C++ Backend** - Already built (in `/build/src/`)
2. **Node.js** - Version 18.x or higher (you have 18.19.1, which works)
3. **npm** - Comes with Node.js

## 🚀 Quick Start (3 Steps)

### Step 1: Start the Backend API Server

```bash
cd /home/monan/Desktop/SABCEMM/server
npm start
```

This starts the REST API on `http://localhost:3001`
Leave this terminal running.

### Step 2: Start the Frontend Development Server

Open a **new terminal** and run:

```bash
cd /home/monan/Desktop/SABCEMM/frontend
npm run dev
```

This starts the frontend on `http://localhost:5173`
Leave this terminal running.

### Step 3: Open in Browser

Navigate to: **http://localhost:5173**

You should see the beautiful SABCEMM Dashboard!

## 📁 Project Structure

```
SABCEMM/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/          # UI components
│   │   │   ├── Layout.tsx       # Sidebar navigation
│   │   │   └── Layout.css       # Layout styles
│   │   ├── pages/               # Page components
│   │   │   ├── Dashboard.tsx    # Main dashboard
│   │   │   ├── Visualizations.tsx # Charts and graphs
│   │   │   ├── Simulations.tsx  # Simulation browser
│   │   │   └── Parameters.tsx   # XML parameter editor
│   │   ├── utils/
│   │   │   ├── api.ts           # API client
│   │   │   └── statistics.ts    # Statistical calculations
│   │   ├── App.tsx              # Main app
│   │   ├── main.tsx             # Entry point
│   │   └── index.css            # Global premium styles
│   └── package.json
├── server/                      # Backend API
│   ├── api.js                   # NEW: Comprehensive REST API
│   ├── server.js                # Old server (still available)
│   └── package.json
├── build/                       # C++ build output
│   ├── src/
│   │   └── financeSimulation    # C++ executable
│   └── output/
│       └── csv_export/          # Simulation data
└── input/
    └── examples/                # XML templates
        ├── Cross.xml
        ├── Harras.xml
        ├── EMB.xml
        └── Arbitrage.xml
```

## 🎨 Features Guide

### 1. Dashboard (Home Page)
**Location:** http://localhost:5173/

**Features:**
- Total Return - Overall performance
- Volatility - Risk measure
- Sharpe Ratio - Risk-adjusted returns
- Maximum Drawdown - Worst loss
- Skewness & Kurtosis - Distribution analysis
- Interactive price evolution chart

**What it shows:** Key metrics from your most recent simulation

### 2. Visualizations
**Location:** http://localhost:5173/visualizations

**Features:**
- Price Series Chart - Full price evolution
- Returns Over Time - Period-by-period returns
- Rolling Volatility - 20-period rolling standard deviation
- Return Distribution - Histogram of returns

**What it does:** Deep statistical analysis with multiple chart types

### 3. Simulations Browser
**Location:** http://localhost:5173/simulations

**Features:**
- List all simulation runs
- View simulation metadata
- Select simulations for analysis
- Export capabilities

**What it does:** Browse and manage all your historical runs

### 4. Parameters (XML Editor)
**Location:** http://localhost:5173/parameters

**Features:**
- Load existing XML templates (Cross, Harras, EMB, Arbitrage)
- Edit parameters directly in the browser
- Parameter documentation
- Run simulations from the UI
- Real-time validation

**What it does:** Edit configurations and run new simulations

## 🔧 How to Run a Simulation

### Method 1: From the Web UI

1. Go to `Parameters` page
2. Select a template (e.g., "Cross.xml")
3. Modify parameters if needed:
   - `numsteps` - How many time steps
   - `count` - Number of agents
   - `repetitions` - Number of runs
   - etc.
4. Click "Run Simulation"
5. Wait for completion
6. View results in Dashboard

### Method 2: Command Line (Traditional)

```bash
cd /home/monan/Desktop/SABCEMM/build/src
./financeSimulation ../../input/examples/Cross.xml
```

Results appear in `build/output/csv_export/`

## 📊 Understanding the Metrics

### Financial Metrics

**Total Return**
- Formula: `(Final Price - Initial Price) / Initial Price`
- Interpretation: Overall profit/loss percentage

**Sharpe Ratio**
- Formula: `(Mean Return / Volatility) × √252`
- Interpretation: Risk-adjusted returns (higher is better)
- Good: > 1.0, Excellent: > 2.0

**Maximum Drawdown**
- Formula: `max((Peak - Trough) / Peak)`
- Interpretation: Worst peak-to-trough decline
- Lower is better

**Volatility**
- Formula: `Standard Deviation of Returns`
- Interpretation: Risk measure (higher = more risky)

### Distribution Metrics

**Skewness**
- Positive: More extreme positive returns
- Negative: More extreme negative returns (risk)
- Zero: Symmetric distribution

**Excess Kurtosis**
- Positive: Fat tails (more extreme events)
- Negative: Thin tails (fewer extremes)
- Zero: Normal distribution

## 🛠️ Troubleshooting

### API Server won't start
```bash
cd /home/monan/Desktop/SABCEMM/server
npm install
npm start
```

### Frontend won't start
```bash
cd /home/monan/Desktop/SABCEMM/frontend
npm install
npm run dev
```

### No simulations showing up
1. Make sure you've run at least one simulation
2. Check that CSV files exist in `build/output/csv_export/`
3. Restart the API server

### Charts not displaying
1. Open browser console (F12) to check for errors
2. Verify API is running on port 3001
3. Check that simulation data is available

## 🎓 For Your PhD Presentation

### Demo Flow

1. **Start with Dashboard**
   - Show key metrics
   - Explain Sharpe ratio, drawdown
   - Point out the interactive chart

2. **Deep Dive in Visualizations**
   - Show multiple chart types
   - Explain rolling volatility
   - Demonstrate return distribution

3. **Show Simulations Browser**
   - List historical runs
   - Show metadata tracking

4. **Live Parameter Editing**
   - Open Parameters page
   - Modify agent count or theta
   - Run simulation in real-time
   - Return to Dashboard to show new results

### Key Talking Points

- "Professional web-based interface for agent-based economic modeling"
- "Real-time statistical analysis with quantitative finance metrics"
- "Separation of concerns: C++ computation engine + React presentation layer"
- "Interactive parameter modification without recompiling"
- "Comprehensive data visualization for research analysis"

## 🔄 Development Workflow

### Making Changes to Frontend

1. Edit files in `frontend/src/`
2. Changes hot-reload automatically
3. View updates instantly in browser

### Adding New Features

1. **New Page**: Create in `src/pages/`, add route in `App.tsx`
2. **New Component**: Create in `src/components/`
3. **New API Endpoint**: Add to `server/api.js`
4. **New Metric**: Add calculation in `src/utils/statistics.ts`

## 📦 Building for Production

When ready to deploy:

```bash
cd /home/monan/Desktop/SABCEMM/frontend
npm run build
```

Production files will be in `frontend/dist/`

Serve with:
```bash
npm run preview
```

## 🎯 Next Steps

1. ✅ Start both servers (API + Frontend)
2. ✅ Open browser to http://localhost:5173
3. ✅ Run a simulation to generate data
4. ✅ Explore all pages
5. ✅ Customize parameters
6. ✅ Prepare for PhD presentation!

## 💡 Tips

- **Dark Mode**: The entire UI is optimized for dark mode
- **Responsive**: Works on different screen sizes
- **Performance**: Charts are optimized for large datasets
- **Professional**: Premium design suitable for academic presentations

## 📞 Support

If you encounter issues:
1. Check terminal output for errors
2. Verify Node.js version: `node --version`
3. Clear npm cache: `npm cache clean --force`
4. Reinstall dependencies: `rm -rf node_modules && npm install`

---

**Built for your PhD research in computational economics!** 🎓

Enjoy your professional SABCEMM dashboard! 🚀
