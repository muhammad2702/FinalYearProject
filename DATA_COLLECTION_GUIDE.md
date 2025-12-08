# SABCEMM Data Collection & Export Guide

## ✅ Frontend Removed

All frontend code has been removed:
- ✅ `visualization-dashboard/` - DELETED
- ✅ Summary documents - DELETED  
- ⚠️ `Prism-client/` - Still present (let me know if you want this removed too)

---

## 📊 Data Collectors in SABCEMM

Your SABCEMM project has comprehensive data collection capabilities. Here's what's available:

### Available Data Item Collectors

Located in `/src/DataCollector/`:

1. **DataItemCollectorPrice** - Market price tracking
2. **DataItemCollectorExcessDemand** - Supply/demand imbalances
3. **DataItemCollectorWealth** - Agent wealth over time
4. **DataItemCollectorAmountOfStock** - Stock holdings
5. **DataItemCollectorAmountOfCash** - Cash positions
6. **DataItemCollectorFWSharesChartist** - Chartist strategy shares
7. **DataItemCollectorFWSharesFundamentalist** - Fundamentalist strategy shares
8. **DataItemCollectorHarrasK** - Harras K values
9. **DataItemCollectorEMBGamma** - EMB Gamma values
10. **DataItemCollectorLLSMemorySpans** - Memory span tracking
11. **DataItemCollectorSwitchableShares** - Switchable strategy shares

---

## 📁 Current Data Export Options

SABCEMM has built-in writer classes in `/src/Writer/`:

### 1. **WriterHDF5** (`WriterHDF5.cpp`)
- Exports to HDF5 format (efficient binary format)
- Good for large datasets
- Can be read by Python (h5py), MATLAB, R

### 2. **WriterTxt** (`WriterTxt.cpp`)  
- Exports to text files
- Human-readable
- Can be imported anywhere

### 3. **WriterNone** (`WriterNone.cpp`)
- No file output (for testing)

---

## 🎯 Setting Up Structured Data Export

### Option 1: Use Existing Writers with Configuration

You can configure the output format in your input XML files (in `/input/` directory).

Example configuration:
```xml
\u003cwriter type="WriterTxt"\u003e
    \u003coutputDirectory\u003eoutput/structured_data\u003c/outputDirectory\u003e
    \u003cfilePrefix\u003esimulation\u003c/filePrefix\u003e
\u003c/writer\u003e

\u003cdataItemCollectorClasses\u003e
    \u003cdatacollectorprice\u003e
        \u003cname\u003ePrice\u003c/name\u003e
        \u003ccollectInterval\u003e1\u003c/collectInterval\u003e
    \u003c/datacollectorprice\u003e
    
    \u003cdatacollectorwealth\u003e
        \u003cname\u003eWealth\u003c/name\u003e
        \u003cmethod\u003efull\u003c/method\u003e
        \u003ccollectInterval\u003e1\u003c/collectInterval\u003e
    \u003c/datacollectorwealth\u003e
    
    \u003c!-- Add more collectors as needed --\u003e
\u003c/dataItemCollectorClasses\u003e
```

### Option 2: Create Custom CSV/JSON Exporter

I can help you create a new writer class that exports to:
- **CSV files** (one per data collector)
- **JSON format** (structured, easy to parse)
- **Organized folder structure**:
  ```
  output/
  ├── run_001/
  │   ├── price/
  │   │   ├── series_0.csv
  │   │   ├── series_1.csv
  │   │   └── metadata.json
  │   ├── wealth/
  │   │   ├── series_0.csv
  │   │   └── metadata.json
  │   ├── excess_demand/
  │   └── ...
  ├── run_002/
  └── ...
  ```

### Option 3: Enhance Existing Writers

Modify `WriterTxt.cpp` or `WriterHDF5.cpp` to:
- Create subdirectories for each simulation run
- Separate files for each data collector
- Include metadata files (timestamps, parameters, etc.)

---

## 🛠️ What Would You Like?

Please choose one of these options:

### A. **Keep Existing System + Better Organization**
- I'll show you how to configure existing writers
- Set up structured output directories
- Document the output format

### B. **Create New CSV Writer++**
- New writer class for CSV export
- Organized folder structure
- Separate file per data collector
- Metadata files for each export

### C. **Create New JSON Writer**
- Export all data to structured JSON
- Easy to parse in Python/JavaScript/R
- All collectors in one organized structure
- Perfect for custom visualization tools

### D. **Create HDF5 + CSV Hybrid**
- HDF5 for raw data (efficient, fast)
- CSV summaries for quick viewing
- Best of both worlds

---

## 📝 Next Steps

Tell me:
1. **Which option** do you prefer (A, B, C, or D)?
2. **Do you want to remove Prism-client** as well?
3. **What output format** would work best for your custom visualization?
   - CSV?
   - JSON?  
   - HDF5?
   - Combination?

Once you decide, I'll:
1. Set up the proper data collection infrastructure
2. Create organized folder structures
3. Document the export format
4. Ensure all data collectors are properly configured
5. Test with a sample simulation

---

## 🗂️ Current Status

✅ All frontend removed
✅ Data collectors intact and functional
✅ Writer infrastructure ready
⏳ Waiting for your preference on data export structure

Let me know how you want to proceed!
