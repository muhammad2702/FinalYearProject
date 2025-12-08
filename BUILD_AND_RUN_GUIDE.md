# SABCEMM - Complete Build and Run Guide

## 🛠️ Building SABCEMM from Scratch

### Prerequisites Check

First, ensure you have the required dependencies:
```bash
# Check if cmake is installed
cmake --version

# Check if make is installed
make --version

# Check if g++ is installed
g++ --version
```

If any are missing, install them:
```bash
sudo apt-get update
sudo apt-get install build-essential cmake libboost-all-dev
```

---

## 📦 Step-by-Step Build Process

### Step 1: Navigate to Project Directory

```bash
cd /home/monan/Desktop/SABCEMM
```

### Step 2: Clean Previous Build (Optional but Recommended)

```bash
# Remove old build directory if it exists
rm -rf build

# Create fresh build directory
mkdir build
cd build
```

### Step 3: Configure with CMake

```bash
# Run CMake to configure the project
cmake ..
```

**Expected output:** You should see configuration messages ending with:
```
-- Configuring done
-- Generating done  
-- Build files have been written to: /home/monan/Desktop/SABCEMM/build
```

### Step 4: Compile the Project

```bash
# Compile with 4 parallel jobs (faster)
make -j4
```

**Expected output:** You should see compilation progress ending with:
```
[100%] Built target financeSimulation
[100%] Built target financeSimulationTests
```

**Build time:** Usually 1-3 minutes depending on your system.

### Step 5: Verify Build Success

```bash
# Check if executable exists
ls -lh financeSimulation
```

You should see:
```
-rwxrwxr-x 1 monan monan [size] [date] financeSimulation
```

---

## 🚀 Running Simulations

### Option 1: Run from Build Directory

```bash
# Stay in build directory
cd /home/monan/Desktop/SABCEMM/build

# Run simulation with your input file
./financeSimulation ../input/examples/Cross.xml
```

### Option 2: Run from Project Root

```bash
# Navigate to project root
cd /home/monan/Desktop/SABCEMM

# Run simulation
./build/financeSimulation input/examples/Cross.xml
```

### Option 3: Run with Full Paths (Works from Anywhere)

```bash
# Can run from any directory
/home/monan/Desktop/SABCEMM/build/financeSimulation \
    /home/monan/Desktop/SABCEMM/input/examples/Cross.xml
```

---

## 📊 Finding Your CSV Output

After running, your CSV files will be in:

```bash
cd /home/monan/Desktop/SABCEMM/output/csv_export
ls -lhrt  # List by time, most recent last
```

You'll see a directory like:
```
Cross_Example_[timestamp]/
```

Inside that directory:
```bash
cd Cross_Example_[timestamp]
ls -la
```

You'll see folders for each data collector:
```
price/
wealth/
amountofstock/
amountofcash/
excessdemand/
fwshareschar

tist/
fwsharesfundamentalist/
```

---

## 📋 Quick Reference Commands

### Complete Fresh Build and Run:

```bash
# One-liner to build and run
cd /home/monan/Desktop/SABCEMM && \
rm -rf build && \
mkdir build && \
cd build && \
cmake .. && \
make -j4 && \
./financeSimulation ../input/examples/Cross.xml
```

### Just Rebuild (if you modified code):

```bash
cd /home/monan/Desktop/SABCEMM/build
make -j4
./financeSimulation ../input/examples/Cross.xml
```

### Just Run (no rebuild needed):

```bash
cd /home/monan/Desktop/SABCEMM
./build/financeSimulation input/examples/Cross.xml
```

---

## 🔍 Troubleshooting

### Problem: "No such file or directory"

**Cause:** You're in the wrong directory or executable doesn't exist.

**Solution:**
```bash
# Check where you are
pwd

# Should be in SABCEMM directory
cd /home/monan/Desktop/SABCEMM

# Check if executable exists
ls -la build/financeSimulation

# If it doesn't exist, rebuild
cd build
cmake ..
make -j4
```

### Problem: Build fails with errors

**Solution:**
```bash
# Clean and rebuild
cd /home/monan/Desktop/SABCEMM
rm -rf build
mkdir build
cd build
cmake ..
make -j4 2>&1 | tee build.log  # Save errors to file
```

Then check `build.log` for specific errors.

### Problem: "undefined reference" errors

**Cause:** Missing libraries or incomplete build.

**Solution:**
```bash
# Install missing dependencies
sudo apt-get install libboost-all-dev

# Rebuild completely
cd /home/monan/Desktop/SABCEMM/build
cmake ..
make clean
make -j4
```

### Problem: Can't find output files

**Solution:**
```bash
# Check output directory
cd /home/monan/Desktop/SABCEMM
ls -lhrt output/csv_export/

# If directory doesn't exist, simulation didn't run
# Check if writerClass is set correctly in input XML:
grep -i writer input/examples/Cross.xml
```

Should show:
```xml
<writer>writercsv</writer>
```

---

## ⚙️ Input File Configuration

Your input file is already configured correctly at:
```
/home/monan/Desktop/SABCEMM/input/examples/Cross.xml
```

Key setting (already done):
```xml
<writer>writercsv</writer>
```

---

## 📁 Project Structure Overview

```
SABCEMM/
├── build/                  ← Build directory (created by you)
│   ├── financeSimulation   ← Executable (run this!)
│   └── ...                 ← Build artifacts
├── input/
│   └── examples/
│       └── Cross.xml       ← Input configuration (modified ✓)
├── output/
│   └── csv_export/         ← CSV output goes here!
│       └── Cross_Example_[timestamp]/
│           ├── price/
│           ├── wealth/
│           └── ...
├── src/                    ← Source code
│   ├── Writer/
│   │   ├── WriterCSV.cpp   ← New CSV writer (created ✓)
│   │   └── WriterCSV.h     ← Header (created ✓)
│   └── ...
└── CMakeLists.txt          ← Build configuration
```

---

## ✅ Verification Checklist

Before running, verify:

- [ ] You're in the SABCEMM directory: `pwd` shows `/home/monan/Desktop/SABCEMM`
- [ ] Build directory exists: `ls build/`
- [ ] Executable exists: `ls build/financeSimulation`
- [ ] Input file exists: `ls input/examples/Cross.xml`
- [ ] Input uses CSV writer: `grep writercsv input/examples/Cross.xml`

---

## 🎯 Expected Simulation Output

When running, you'll see:
```
[WriterCSV] Initialized CSV export to: ./output/csv_export/Cross_Example_[timestamp]
Starting simulation...
[WriterCSV] Starting simulation: cross_simulation_0
[WriterCSV] Exported Price to .../price/run_0_full.csv (1 series, 1000 time steps)
[WriterCSV] Exported Wealth to .../wealth/run_0_full.csv (X series, 1000 time steps)
[WriterCSV] Exported ExcessDemand to .../excessdemand/run_0_full.csv
...
[WriterCSV] Closed all CSV files
Simulation complete!
```

---

## 📝 Next Steps After Successful Run

1. **View CSV files:**
   ```bash
   cd output/csv_export/Cross_Example_*/
   ls -la
   head price/run_0_full.csv
   ```

2. **Build your visualization** using the CSV data!

3. **Run more simulations** by modifying the input XML

---

## 🔄 Common Workflow

### Daily workflow:
```bash
# 1. Navigate to project
cd /home/monan/Desktop/SABCEMM

# 2. Modify input if needed
nano input/examples/Cross.xml

# 3. Run simulation
./build/financeSimulation input/examples/Cross.xml

# 4. View output
ls -lhrt output/csv_export/
```

### After code changes:
```bash
cd /home/monan/Desktop/SABCEMM/build
make -j4
./financeSimulation ../input/examples/Cross.xml
```

### Complete rebuild:
```bash
cd /home/monan/Desktop/SABCEMM
rm -rf build
mkdir build
cd build
cmake ..
make -j4
./financeSimulation ../input/examples/Cross.xml
```

---

## 💡 Tips

- Use **tab completion** in bash to save typing
- Use `ls -lhrt output/csv_export/` to see most recent output last
- Check CSV files with `head -20 filename.csv` to see headers and first rows
- Use `grep` to search in CSV files: `grep "^100," price/run_0_full.csv`

---

## 🎉 You're Ready!

Your CSV export is configured and ready to use. Just follow the build steps above and you'll have organized CSV data for your custom visualization!
