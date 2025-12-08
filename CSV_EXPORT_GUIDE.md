# CSV Data Export Guide for SABCEMM

## ✅ Implementation Complete!

A new **WriterCSV** class has been created that exports all data to organized CSV files.

---

## 📁 Output Structure

When you run a simulation with the CSV writer, data will be organized as:

```
output/csv_export/[simulation_name]_[timestamp]/
├── price/
│   ├── run_0_full.csv
│   ├── run_1_full.csv
│   └── ...
├── wealth/
│   ├── run_0_full.csv
│   ├── run_1_full.csv
│   └── ...
├── amountofstock/
│   ├── run_0_full.csv
│   └── ...
├── amountofcash/
│   ├── run_0_full.csv
│   └── ...
├── excessdemand/
│   ├── run_0_full.csv
│   └── ...
├── fwshareschar

tist/
│   ├── run_0_full.csv
│   └── ...
├── fwsharesfundamentalist/
│   ├── run_0_full.csv
│   └── ...
├── simulation_0_metadata.txt
├── simulation_0_rng_info.txt
├── simulation_0_timing.txt
└── build_info.txt
```

### Folder Organization:
- **One folder per data collector** (price, wealth, etc.)
- **One CSV file per simulation run** inside each folder
- **Metadata files** in the root directory

---

## 📊 CSV File Format

Each CSV file contains:

### Header (commented lines starting with #):
- Collector name
- Quantity type
- Method used
- Group ID
- Simulation identifier
- Number of series
- Number of time steps

### Data Structure:
```csv
# SABCEMM Data Export
# Collector: Price
# Quantity: price
# Method: full
# Group ID: -1
# Simulation: cross_simulation_0
# Number of Series: 1
# Time Steps: 1000
#
TimeStep,Series_0,Series_1,Series_2
0,1.0,1.0,1.0
1,1.006,1.005,1.007
2,1.012,1.010,1.014
...
```

**Columns**:
- First column: `TimeStep` (0, 1, 2, ...)
- Remaining columns: `Series_0`, `Series_1`, etc. (one per agent/group)

---

## 🎯 How to Use

### Step 1: Update Your Input XML File

Edit your input configuration file (e.g., `/input/Cross_Example.xml`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<input>
    <!-- Change writer class to writercsv -->
    <writerClass>writercsv</writerClass>
    
    <!-- Rest of your configuration -->
    <numberOfSimulations>10</numberOfSimulations>
    <maxIterations>1000</maxIterations>
    
    <!-- Data collectors to export -->
    <dataItemCollectorClasses>
        <datacollectorprice>
            <name>Price</name>
            <collectInterval>1</collectInterval>
        </datacollectorprice>
        
        <datacollectorwealth>
            <name>Wealth</name>
            <method>full</method>
            <collectInterval>1</collectInterval>
        </datacollectorwealth>
        
        <datacollectoramountofstock>
            <name>AmountOfStock</name>
            <method>full</method>
            <collectInterval>1</collectInterval>
        </datacollectoramountofstock>
        
        <datacollectoramountofcash>
            <name>AmountOfCash</name>
            <method>full</method>
            <collectInterval>1</collectInterval>
        </datacollectoramountofcash>
        
        <datacollectorexcessdemand>
            <name>ExcessDemand</name>
            <collectInterval>1</collectInterval>
        </datacollectorexcessdemand>
        
        <datacollectorfwshares>
            <name>FWShares</name>
            <collectInterval>1</collectInterval>
        </datacollectorfwshares>
    </dataItemCollectorClasses>
    
    <!-- Other simulation parameters -->
    <!-- ... -->
</input>
```

### Step 2: Rebuild SABCEMM

```bash
cd /home/monan/Desktop/SABCEMM/build
cmake ..
make
```

### Step 3: Run Your Simulation

```bash
cd /home/monan/Desktop/SABCEMM
./build/SABCEMM input/Cross_Example.xml
```

### Step 4: View Your CSV Files

The data will be exported to:
```
/home/monan/Desktop/SABCEMM/output/csv_export/Cross_Example_[timestamp]/
```

Each collector will have its own folder with CSV files ready for your custom visualization!

---

## 📈 CSV File Features

### Advantages:
✅ **Human-readable** - Open in Excel, LibreOffice, or any text editor
✅ **Standard format** - Import into Python, R, MATLAB, Julia
✅ **Organized** - One folder per data type
✅ **Complete metadata** - Headers explain the data structure
✅ **High precision** - 15 decimal places for scientific accuracy

### Metadata Files:
- `simulation_X_metadata.txt` - Input parameters for each run
- `simulation_X_rng_info.txt` - Random number generator information
- `simulation_X_timing.txt` - Simulation execution time
- `build_info.txt` - Build and version information

---

## 🔧 Customization Options

### Collect Interval

Control how often data is collected:
```xml
<collectInterval>1</collectInterval>   <!-- Every time step -->
<collectInterval>10</collectInterval>  <!-- Every 10 time steps -->
<collectInterval>100</collectInterval> <!-- Every 100 time steps -->
```

### Method

For collectors that support it:
```xml
<method>full</method>      <!-- All agents -->
<method>mean</method>      <!-- Mean across agents -->
<method>variance</method>  <!-- Variance -->
```

### Group Tracking

Track specific groups:
```xml
<groupToTrack>-1</groupToTrack>  <!-- All groups -->
<groupToTrack>0</groupToTrack>   <!-- Group 0 only -->
<groupToTrack>1</groupToTrack>   <!-- Group 1 only -->
```

---

## 📚 Reading CSV Files in Your Code

### Python Example:
```python
import pandas as pd

# Read a CSV file
df = pd.read_csv('output/csv_export/simulation_xxx/price/run_0_full.csv', 
                 comment='#')

# Plot all series
df.plot(x='TimeStep', y=[col for col in df.columns if col != 'TimeStep'])
```

### R Example:
```r
# Read CSV file
data <- read.csv('output/csv_export/simulation_xxx/price/run_0_full.csv', 
                 comment.char='#')

# Plot
plot(data$TimeStep, data$Series_0, type='l')
```

### MATLAB Example:
```matlab
% Read CSV file
data = readtable('output/csv_export/simulation_xxx/price/run_0_full.csv', ...
                 'CommentStyle','#');

% Plot
plot(data.TimeStep, data.Series_0);
```

---

## 🎯 Next Steps

1. **Rebuild** your project with `cmake .. && make`
2. **Update** your input XML to use `writercsv`
3. **Run** your simulation
4. **Build** your custom visualization with the CSV data!

---

## ✅ What's Been Done

- ✅ Created `WriterCSV.h` - Header file
- ✅ Created `WriterCSV.cpp` - Implementation
- ✅ Updated `Writer.cpp` - Added to factory
- ✅ Updated `CMakeLists.txt` - Added to build
- ✅ **One folder per data collector**
- ✅ CSV files with headers and metadata
- ✅ High-precision data export
- ✅ Organized directory structure

All frontend code removed, data export optimized for your custom visualization!
