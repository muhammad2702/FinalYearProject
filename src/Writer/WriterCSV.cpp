/* Copyright 2017 - BSD-3-Clause
 *
 * Copyright Holder (alphabetical)
 *
 * Beikirch, Maximilian
 * Cramer, Simon
 * Frank, Martin
 * Otte, Philipp
 * Pabich, Emma
 * Trimborn, Torsten
 *
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
 * following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following
 *    disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the
 *    following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote
 *    products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
 * USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * @file WriterCSV.cpp
 * @author SABCEMM Team
 * @brief CSV Writer implementation - Exports to organized folders
 */

#include "WriterCSV.h"
#include "../Version/Version.h"

#include <iostream>
#include <fstream>
#include <iomanip>
#include <sys/stat.h>
#include <sys/types.h>
#include <chrono>
#include <algorithm>

using namespace std;

/** Creates a new CSV writer with organized folder structure
 * \param outputLocation Base output directory name
 */
WriterCSV::WriterCSV(const string &outputLocation)
    : Writer()
{
    auto now = std::chrono::high_resolution_clock::now();
    auto time = std::chrono::duration_cast<chrono::milliseconds>(now.time_since_epoch()).count();
    
    baseOutputPath = string("./output/csv_export/") + outputLocation + "_" + std::to_string(time);
    
    // Create base directory
    createDirectory("./output");
    createDirectory("./output/csv_export");
    createDirectory(baseOutputPath);
    
    simulationNumber = 0;
    
    cout << "[WriterCSV] Initialized CSV export to: " << baseOutputPath << endl;
}

/** Standard constructor */
WriterCSV::WriterCSV() : WriterCSV("simulation") {
}

/** Destructor - closes all open files */
WriterCSV::~WriterCSV() {
    closeAllFiles();
    cout << "[WriterCSV] Closed all CSV files" << endl;
}

/** Create a directory if it doesn't exist */
void WriterCSV::createDirectory(const string& path) {
    struct stat st = {0};
    if (stat(path.c_str(), &st) == -1) {
        mkdir(path.c_str(), 0755);
    }
}

/** Sanitize collector name for use as folder/file name */
string WriterCSV::sanitizeName(const string& name) {
    string sanitized = name;
    // Replace spaces and special characters with underscores
    replace(sanitized.begin(), sanitized.end(), ' ', '_');
    replace(sanitized.begin(), sanitized.end(), '/', '_');
    replace(sanitized.begin(), sanitized.end(), '\\', '_');
    // Convert to lowercase
    transform(sanitized.begin(), sanitized.end(), sanitized.begin(), ::tolower);
    return sanitized;
}

/** Close all open CSV files */
void WriterCSV::closeAllFiles() {
    for (auto& pair : openFiles) {
        if (pair.second && pair.second->is_open()) {
            pair.second->close();
            delete pair.second;
        }
    }
    openFiles.clear();
}

/** Save input configuration to a metadata file */
void WriterCSV::saveInput(Input& input) {
    string metadataPath = baseOutputPath + "/simulation_" + to_string(simulationNumber - 1) + "_metadata.txt";
    ofstream metaFile(metadataPath);
    
    if (metaFile.is_open()) {
        metaFile << "SABCEMM Simulation Metadata" << endl;
        metaFile << "============================" << endl;
        metaFile << "Simulation ID: " << currentSimulationID << endl;
        metaFile << "Simulation Number: " << (simulationNumber - 1) << endl;
        metaFile << endl;
        metaFile << "Input Parameters:" << endl;
        metaFile << "----------------------------" << endl;
        
        // Write input parameters (simplified version)
        for (auto& child : input.getChildren()) {
            metaFile << child.getName() << ": ";
            if (child.hasValue()) {
                metaFile << child.getString();
            }
            metaFile << endl;
        }
        
        metaFile.close();
        cout << "[WriterCSV] Saved metadata to: " << metadataPath << endl;
    }
}

/** Save build information */
void WriterCSV::saveBuildInfo() {
    string buildInfoPath = baseOutputPath + "/build_info.txt";
    ofstream buildFile(buildInfoPath, ios::app);
    
    if (buildFile.is_open()) {
        buildFile << "Simulation " << (simulationNumber - 1) << " Build Info:" << endl;
        buildFile << "GIT_VERSION: " << buildinfo::GIT_VERSION << endl;
        buildFile << "GIT_SHA1: " << buildinfo::GIT_SHA1 << endl;
        buildFile << "OS: " << buildinfo::OS << endl;
        buildFile << "OS_NAME: " << buildinfo::OS_NAME << endl;
        buildFile << "BUILD_TYPE: " << buildinfo::BUILD_TYPE << endl;
        buildFile << "CXX: " << buildinfo::CXX << endl;
        buildFile << "----------------------------" << endl;
        buildFile.close();
    }
}

/** Save RNG information */
void WriterCSV::rngInformation(size_t &uniformGenerated, size_t &uniformUnused, 
                               size_t &normalGenerated, size_t &normalUnused, int &seed) {
    string rngPath = baseOutputPath + "/simulation_" + to_string(simulationNumber - 1) + "_rng_info.txt";
    ofstream rngFile(rngPath);
    
    if (rngFile.is_open()) {
        rngFile << "RNG Information" << endl;
        rngFile << "Uniform Generated: " << uniformGenerated << endl;
        rngFile << "Uniform Unused: " << uniformUnused << endl;
        rngFile << "Normal Generated: " << normalGenerated << endl;
        rngFile << "Normal Unused: " << normalUnused << endl;
        rngFile << "Seed: " << seed << endl;
        rngFile.close();
    }
}

/** Save simulation time */
void WriterCSV::saveTime(double time) {
    string timePath = baseOutputPath + "/simulation_" + to_string(simulationNumber - 1) + "_timing.txt";
    ofstream timeFile(timePath);
    
    if (timeFile.is_open()) {
        timeFile << "Simulation Time: " << time << " seconds" << endl;
        timeFile.close();
    }
}

/** Add a new simulation */
void WriterCSV::addSimulation(string simulationIdentifier) {
    // Close any open files from previous simulation
    closeAllFiles();
    
    currentSimulationID = simulationIdentifier + "_" + to_string(simulationNumber);
    simulationNumber++;
    
    cout << "[WriterCSV] Starting simulation: " << currentSimulationID << endl;
}

/** Add Quantity of Interest - this writes the actual CSV data
 * Creates folder structure: output/csv_export/[base]/[collector_name]/
 * Creates CSV file: run_XXX_[method].csv
 */
void WriterCSV::addQoI(string method, QuantityOfInterest::Quantity quantity, int groupID,
                       vector<vector<double>> *newVector, string &name_) {
    
    if (!newVector || newVector->empty()) {
        return;
    }
    
    // Sanitize collector name for folder
    string collectorFolder = sanitizeName(name_);
    string collectorPath = baseOutputPath + "/" + collectorFolder;
    
    // Create collector-specific directory
    createDirectory(collectorPath);
    
    // Create CSV filename
    string csvFilename = collectorPath + "/run_" + to_string(simulationNumber - 1) + "_" + method + ".csv";
    
    // Open CSV file
    ofstream csvFile(csvFilename);
    
    if (!csvFile.is_open()) {
        cerr << "[WriterCSV] ERROR: Could not create CSV file: " << csvFilename << endl;
        return;
    }
    
    // Write CSV header
    csvFile << "# SABCEMM Data Export" << endl;
    csvFile << "# Collector: " << name_ << endl;
    csvFile << "# Quantity: " << QuantityOfInterest::quantityToString.at(quantity) << endl;
    csvFile << "# Method: " << method << endl;
    csvFile << "# Group ID: " << groupID << endl;
    csvFile << "# Simulation: " << currentSimulationID << endl;
    csvFile << "# Number of Series: " << newVector->size() << endl;
    if (!newVector->empty()) {
        csvFile << "# Time Steps: " << newVector->at(0).size() << endl;
    }
    csvFile << "#" << endl;
    
    // Write column headers
    csvFile << "TimeStep";
    for (size_t seriesIdx = 0; seriesIdx < newVector->size(); seriesIdx++) {
        csvFile << ",Series_" << seriesIdx;
    }
    csvFile << endl;
    
    // Determine the maximum number of time steps across all series
    size_t maxTimeSteps = 0;
    for (const auto& series : *newVector) {
        if (series.size() > maxTimeSteps) {
            maxTimeSteps = series.size();
        }
    }
    
    // Write data rows (time steps)
    for (size_t timeStep = 0; timeStep < maxTimeSteps; timeStep++) {
        csvFile << timeStep;
        
        for (size_t seriesIdx = 0; seriesIdx < newVector->size(); seriesIdx++) {
            csvFile << ",";
            if (timeStep < newVector->at(seriesIdx).size()) {
                csvFile << setprecision(15) << newVector->at(seriesIdx).at(timeStep);
            } else {
                csvFile << "NA";  // Handle missing data
            }
        }
        csvFile << endl;
    }
    
    csvFile.close();
    
    cout << "[WriterCSV] Exported " << name_ << " to " << csvFilename 
         << " (" << newVector->size() << " series, " << maxTimeSteps << " time steps)" << endl;
}
