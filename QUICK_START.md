# 🚀 QUICK START - Run Your First CSV Export

## ✅ Everything is Ready!

Your SABCEMM project is configured to export to CSV with one folder per data collector.

---

## 🎯 Run in 3 Easy Steps

### Option 1: Automated Script (EASIEST!)

```bash
cd /home/monan/Desktop/SABCEMM
./quick_build_and_run.sh
```

This script will:
1. Clean old builds
2. Configure with CMake  
3. Compile the project
4. Run your simulation
5. Show you where the CSV files are

**That's it!** Just run one command and wait.

---

### Option 2: Manual Steps

If you prefer to see each step:

```bash
# 1. Go to project directory
cd /home/monan/Desktop/SABCEMM

# 2. Clean and create build directory
rm -rf build
mkdir build
cd build

# 3. Configure
cmake ..

# 4. Compile (takes 1-3 minutes)
make -j4

# 5. Run simulation
./financeSimulation ../input/examples/Cross.xml
```

---

## 📊 Finding Your CSV Files

After the simulation runs successfully, find your data:

```bash
cd /home/monan/Desktop/SABCEMM/output/csv_export
ls -lhrt  # Shows directories sorted by time

# Enter the most recent directory
cd Cross_Example_[timestamp]

# See all your data folders
ls -la
```

You'll see:
```
price/
wealth/
amountofstock/
amountofcash/
excessdemand/
fwshareschar

tist/
fwsharesfundamentalist/
simulation_0_metadata.txt
simulation_0_rng_info.txt
simulation_0_timing.txt
build_info.txt
```

---

## 📁 CSV File Structure

Each folder contains CSV files for that data collector:

```bash
# View price data
cd price
head run_0_full.csv
```

Output example:
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
TimeStep,Series_0
0,1.000000000000000
1,1.006049075514861
2,1.007145839045051
...
```

---

## 🔧 Troubleshooting

### If the automated script fails:

1. **Check your terminal output** - It will tell you which step failed

2. **Make sure you're in the right directory:**
   ```bash
   pwd  # Should show /home/monan/Desktop/SABCEMM
   ```

3. **Try manual build:**
   ```bash
   cd /home/monan/Desktop/SABCEMM/build
   cmake ..
   make -j4 2>&1 | tee build_errors.log
   ```

4. **Check the build log** if compilation fails:
   ```bash
   less build_errors.log
   ```

### If simulation runs but no CSV files appear:

1. **Check if writercsv is set in input file:**
   ```bash
   grep -i writer input/examples/Cross.xml
   ```
   
   Should show:
   ```xml
   <writer>writercsv</writer>
   ```

2. **Check output directory:**
   ```bash
   ls -la output/
   ```

---

## ⚙️ Configuration

Your input file is already configured:
- **Location:** `/home/monan/Desktop/SABCEMM/input/examples/Cross.xml`
- **Writer:** `writercsv` ✓
- **Ready to use:** Yes ✓

---

## 📚 Documentation Files Created

- `BUILD_AND_RUN_GUIDE.md` - Complete detailed guide
- `CSV_EXPORT_GUIDE.md` - CSV format documentation
- `CSV_EXPORT_READY.md` - What was implemented
- `quick_build_and_run.sh` - Automated script
- `QUICK_START.md` - This file!

---

## 🎉 Next Steps

After you have CSV files:

1. **Browse the data:**
   ```bash
   cd output/csv_export/Cross_Example_*/
   ls -la
   ```

2. **View a CSV file:**
   ```bash
   head -30 price/run_0_full.csv
   ```

3. **Build your custom visualization** using:
   - Python (pandas, matplotlib, plotly)
   - R (ggplot2, plotly)
   - MATLAB
   - Any tool that reads CSV!

---

## 💡 Pro Tips

- The automated script (`quick_build_and_run.sh`) can be run anytime
- If you only change the input XML, you don't need to rebuild:
  ```bash
  cd /home/monan/Desktop/SABCEMM/build
  ./financeSimulation ../input/examples/Cross.xml
  ```
- Use `ls -lhrt` to see files sorted by time (newest last)
- CSV files have headers explaining the data structure

---

## 🚀 READY TO GO!

Just run:
```bash
cd /home/monan/Desktop/SABCEMM
./quick_build_and_run.sh
```

And you'll have CSV data ready for your custom visualization! 🎯
