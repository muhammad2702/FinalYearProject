#!/bin/bash

# SABCEMM - Quick Build and Run Script
# This script builds the project and runs a simulation

echo "=================================================="
echo "SABCEMM - Build and Run Script"
echo "=================================================="
echo ""

# Step 1: Navigate to project root
echo "[1/5] Navigating to project directory..."
cd /home/monan/Desktop/SABCEMM || { echo "ERROR: Cannot find SABCEMM directory!"; exit 1; }
echo "✓ Currently in: $(pwd)"
echo ""

# Step 2: Clean old build
echo "[2/5] Cleaning old build..."
rm -rf build
mkdir build
echo "✓ Build directory created"
echo ""

# Step 3: Run CMake
echo "[3/5] Configuring project with CMake..."
cd build
cmake .. || { echo "ERROR: CMake configuration failed!"; exit 1; }
echo "✓ CMake configuration complete"
echo ""

# Step 4: Compile
echo "[4/5] Compiling project (this may take 1-3 minutes)..."
make -j4 || { echo "ERROR: Compilation failed!"; exit 1; }
echo "✓ Compilation complete"
echo ""

# Step 5: Run simulation
echo "[5/5] Running simulation..."
echo "Using input file: ../input/examples/Cross.xml"
echo "Output will be in: output/csv_export/"
echo ""
echo "Starting simulation..."
echo "----------------------------------------------"
./financeSimulation ../input/examples/Cross.xml
RESULT=$?
echo "----------------------------------------------"
echo ""

if [ $RESULT -eq 0 ]; then
    echo "✓ Simulation completed successfully!"
    echo ""
    echo "Your CSV files are in:"
    echo "  /home/monan/Desktop/SABCEMM/output/csv_export/"
    echo ""
    echo "To view output:"
    echo "  cd /home/monan/Desktop/SABCEMM/output/csv_export"
    echo "  ls -lhrt"
else
    echo "✗ Simulation failed with error code: $RESULT"
    exit 1
fi

echo ""
echo "=================================================="
echo "Complete!"
echo "=================================================="
