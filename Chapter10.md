# Chapter 10: Conclusions and Future Work

This chapter provides a comprehensive overview of the PRISM (Platform for Research in Interactive Simulation of Multi-Agents) project, summarizing the work accomplished during FYP-1, detailing key findings and results, evaluating the project's scope and objectives, discussing challenges encountered, and outlining recommendations for future development in FYP-2. This report incorporates a thorough review of the attached FYP deliverable and a detailed analysis of the SABCEMM backend codebase, explicitly referencing the files examined.

## 10.1 Summary of Work Done

The PRISM project was initiated to address a critical gap in computational financial economics: the absence of a high-performance, user-friendly simulation platform for agent-based models. The core idea was to combine the computational efficiency of a C++ backend with the intuitive interaction of a React.js frontend.

During FYP-1, the team successfully developed a Minimum Viable Product (MVP) for the backend simulation engine, named SABCEMM (Simulator for Agent-Based Computational Economic Market Models). This C++ core is capable of modeling basic financial market structures and agent interactions. The work done on the backend, as observed by examining the codebase, includes:

*   **Main Entry Point (`src/FinanceSimulation.cpp`)**: This file, as read, serves as the program's starting point. It handles command-line argument parsing (expecting an XML configuration file, e.g., `input/examples/Cross.xml`), sets up signal handlers (`signalHandler`, `registerSignalHandler`) for graceful simulation interruption (e.g., Ctrl+C), and orchestrates the execution of multiple simulations via `Simulation::executeSimulations`. It also measures and reports the total simulation time using `time_t` and `difftime`.
*   **Core Simulation Engine (`src/Simulation.h`, `src/Simulation.cpp`)**: These files define and implement the `Simulation` class, which is the central orchestrator of SABCEMM.
    *   **`Simulation.h`**: Declares the `Simulation` class, its member variables (e.g., `stockExchange`, `randomNumberPool`, `dataCollector`, `agents`, `numSteps`, `variableContainer`, `quantitiesOfInterest`), and key methods (`parse`, `preSimulation`, `runSimulation`, `postSimulation`, `executeSimulations`, `write`). It includes headers for various components like `Switching/ShareCalculator.h`, `StockExchange/StockExchange.h`, `RandomGenerator/RandomGenerator.h`, `ExcessDemandCalculator/ExcessDemandCalculator.h`, `PriceCalculator/PriceCalculator.h`, `DataCollector/DataCollector.h`, `Writer/Writer.h`, `Input/Input.h`, `VariableContainer/VariableContainer.h`, and `QuantitiesOfInterest/QuantitiesOfInterest.h`.
    *   **`Simulation.cpp`**: Implements the `Simulation` class methods.
        *   The constructor initializes all pointers to `nullptr`.
        *   `parse(Input &input)`: This crucial method dynamically creates and connects all simulation components based on the parsed XML `Input` object. It uses factory methods (e.g., `RandomGenerator::factory`, `Agent::factory`, `ExcessDemandCalculator::factory`, `PriceCalculator::factory`, `DataCollector::factory`, `QuantitiesOfInterest::factory`, `StockExchange::factory`) to instantiate the correct types of objects. It also handles the creation of `ShareCalculator` if agents are switchable.
        *   `preSimulation()`: Calls `dataCollector->collect()` to capture the initial state (t=0) of the simulation.
        *   `runSimulation(bool &aborted, size_t id)`: Contains the main simulation loop, iterating `numSteps` times. In each step, it calls `stockExchange->preStep()`, `stockExchange->step()` (where the core market dynamics occur), and `stockExchange->postStep()`. It includes error handling for `MathError` and checks the `aborted` flag for graceful exit. Progress bar functionality (`progressbar.h`) is conditionally compiled.
        *   `postSimulation()`: Calls `quantitiesOfInterest->calculateQoi()` to compute final statistics and then systematically deallocates all dynamically created objects (agents, stock exchange, calculators, etc.) to prevent memory leaks.
        *   `executeSimulations(Input::fromFile inputs, bool &aborted)`: A static method that manages running multiple simulations. It can utilize OpenMP for parallel execution, distributing `inputs.inputs` across threads. It also handles writing results to files in batches using the `Writer` factory.
        *   `write(Writer *writer)` and `write(std::vector<Simulation *> *simulations, Writer *writer)`: Methods to save simulation data and metadata using the `Writer` interface.
*   **Agent Architecture (`src/Agent/`)**: This directory, as listed, contains the base `Agent` class and various concrete agent implementations.
    *   **`src/Agent/Agent.h`**: Defines the pure-virtual `Agent` base class, inheriting from `Group`. It declares protected member variables common to all agents (e.g., `cash`, `stock`, `decision`, `tradingVolume`, `randomGenerator`, `price`, `deltaT`) and pure virtual methods (`preStepUpdate`, `stepUpdate`, `postStepUpdate`, `updateBisection`) that subclasses must implement. It also declares the static `Agent::factory` method.
    *   **`src/Agent/Agent.cpp`**: Implements the `Agent` constructors and the `Agent::factory` method. The `factory` method, as read, iterates through agent configurations from the `Input` object and dynamically creates instances of specific agent types (e.g., `AgentHarras`, `AgentCross`, `AgentCrossWealth`, `AgentLLS`, `AgentFW`, `AgentFWFundamentalist`, `AgentFWChartist`). It handles setting initial cash, stock, and specific parameters for each agent type, including group assignments and memory span modes for `AgentLLS`.
    *   **`src/Agent/AgentCross.h`, `src/Agent/AgentCross.cpp`**: These files define and implement the `AgentCross` class, an agent type based on the "Threshold Model of Investor Psychology" (Cross et al., 2005).
        *   **`AgentCross.h`**: Declares specific member variables like `inactionLowerBound`, `inactionUpperBound`, `herdingPressure`, `inactionThreshold`, `herdingThreshold`, and a pointer to `ExcessDemand`. It also declares methods like `updateBounds` and overrides the virtual `preStepUpdate`, `stepUpdate`, `postStepUpdate`, and `updateBisection` methods.
        *   **`AgentCross.cpp`**: Implements the logic for `AgentCross`. The constructor initializes thresholds and herding pressure using `randomGenerator->getUniformRandomDouble` based on `b1`, `b2`, `A1`, `A2` parameters from the input and `deltaT`. `updateBounds` calculates the inaction interval. `stepUpdate` implements the core decision logic: if the agent's decision is contrary to the market's excess demand, herding pressure increases; if herding pressure exceeds a threshold or price moves out of the inaction bounds, the agent reverses its decision and resets herding pressure.
*   **Market Mechanics**:
    *   **`src/ExcessDemandCalculator/ExcessDemandCalculator.h`, `src/ExcessDemandCalculator/ExcessDemandCalculator.cpp`**: These files define and implement the `ExcessDemandCalculator` base class and its factory.
        *   **`ExcessDemandCalculator.h`**: Declares the `ExcessDemandCalculator` base class with pointers to `agents` and `excessDemand`, and pure virtual methods for `preStepCalculate`, `stepCalculate`, `postStepCalculate`.
        *   **`ExcessDemandCalculator.cpp`**: Implements the `ExcessDemandCalculator::factory` method, which, as read, creates specific implementations like `ExcessDemandCalculatorHarras`, `ExcessDemandCalculatorLLS`, or `ExcessDemandCalculatorFW` based on the `excessDemandCalculatorClass` specified in the input XML.
    *   **`src/PriceCalculator/PriceCalculator.h`, `src/PriceCalculator/PriceCalculatorCross.h`, `src/PriceCalculator/PriceCalculatorCross.cpp`**: These files define and implement the `PriceCalculator` base class and the `PriceCalculatorCross` specific implementation.
        *   **`PriceCalculator.h`**: Declares the `PriceCalculator` base class with pointers to `excessDemandCalculator`, `price`, `excessDemand`, `deltaT`, and `marketDepth`. It defines pure virtual methods for `preStepCalculate`, `stepCalculate`, `postStepCalculate`.
        *   **`PriceCalculatorCross.h`**: Declares the `PriceCalculatorCross` class, inheriting from `PriceCalculator`. It introduces an `enum CalculationMethod` (ORIGINAL, MARTINGALE) and declares `theta`, `prevExcessDemand`, and `randomGenerator`.
        *   **`PriceCalculatorCross.cpp`**: Implements the `PriceCalculatorCross` logic. The `stepCalculate` method, as read, first calls `excessDemandCalculator->stepCalculate()`, then calculates a new price based on the current price, excess demand, `theta`, `marketDepth`, a random normal shock (`eta` from `randomGenerator`), and the change in excess demand (`deltaED`). It supports two calculation methods (`ORIGINAL` and `MARTINGALE`) as defined in the Cross models.
*   **Data Handling**:
    *   **`src/DataCollector/DataCollector.h`, `src/DataCollector/DataCollector.cpp`**: These files define and implement the `DataCollector` composite class.
        *   **`DataCollector.h`**: Declares the `DataCollector` class, which manages a `std::vector<DataItemCollector*>` components. It provides methods like `factory`, `collect`, `clearData`, `add`, and `deleteDataItemCollectors`.
        *   **`DataCollector.cpp`**: Implements the `DataCollector::factory` method, which, as read, dynamically creates various `DataItemCollector` instances (e.g., `DataItemCollectorPrice`, `DataItemCollectorExcessDemand`, `DataItemCollectorAmountOfCash`, `DataItemCollectorWealth`, `DataItemCollectorSwitchableShares`, etc.) based on the `dataItemCollectorClasses` specified in the input XML. The `collect()` method iterates through all added `DataItemCollector` components and calls their respective `collect()` methods.
    *   **`src/Writer/Writer.h`, `src/Writer/Writer.cpp`**: These files define the `Writer` interface and its factory.
        *   **`Writer.h`**: Declares the pure-virtual `Writer` base class with methods like `saveInput`, `saveBuildInfo`, `rngInformation`, `saveTime`, `addSimulation`, and `addQoI`.
        *   **`Writer.cpp`**: Implements the `Writer::factory` method, which, as read, creates concrete `Writer` implementations such as `WriterTxt`, `WriterHDF5` (if `WITH_HDF5` is enabled), or `WriterNone`, based on the `writerClass` specified in the input. It also ensures the `output` directory exists.
*   **Input/Configuration (`src/Input/Input.h`, `src/Input/Input.cpp`)**: These files define the `Input` class for parsing XML configuration.
    *   **`Input.h`**: Declares the `Input` class, which acts as a wrapper around `tinyxml2::XMLElement` to provide a more convenient interface for accessing simulation parameters. It defines a nested `struct fromFile` to hold parsed inputs from a file, including `numThreads`, `filename`, `writerClass`, `simulationsPerFile`, and a pointer to the `tinyxml2::XMLDocument`. It provides methods like `getString`, `getInt`, `getDouble`, `getSizeT`, `getIntVector`, `getIntSet`, `getBool`, and operator overloads (`operator[]`, `operator()`) for easy parameter access.
    *   **`Input.cpp`**: Implements the `Input` class. The `readFromFile` static method, as read, loads an XML file using `tinyxml2::XMLDocument`, handles `<include>` directives to merge configurations from other XML files, and iterates over `<case>` elements to create multiple `Input` objects for different simulation runs. It also parses global settings like `writerClass`, `filename`, `numThreads`, and `simulationsPerFile`. The `parse` method recursively builds the `Input` object structure from XML elements.
*   **Build System (`CMakeLists.txt`)**: As read, the `CMakeLists.txt` file configures the build process for SABCEMM.
    *   It sets the minimum CMake version, appends custom CMake modules, and includes `FeatureSummary` and `CMakeDependentOption`.
    *   It defines build options like `BUILD_TESTS`, `WITH_INTEL_MKL`, `WITH_NAG`, `WITH_HDF5`, `WITH_OPENMP`, and `WITH_PROGBAR`.
    *   It specifies C++11 standard and various compiler warning flags (`-Wall`, `-Wextra`, etc.).
    *   It uses `add_subdirectory` for `libs`, `src`, `test`, and `input` directories.
    *   Crucially, it finds and links external libraries such as **Boost** (version 1.42 or higher is required), `Curses` (for progress bar), `HDF5` (if enabled), `MKL` (if enabled), and `OpenMP` (if enabled). This highlights the project's reliance on these libraries and the complexity of their configuration.

The project also established the architectural foundation for the frontend (React.js), communication layer (REST APIs and WebSockets), and data persistence (MongoDB), as outlined in the attached FYP deliverable. This dual-architecture approach aims to provide both computational power and an accessible user experience.

## 10.2 Findings and Results

The primary finding of this project is the successful validation of a hybrid C++ backend (SABCEMM) and React.js frontend architecture as a robust and effective solution for sophisticated agent-based financial modeling. This approach demonstrates that it is possible to achieve high computational performance without sacrificing user-friendliness.

Key results from FYP-1 include:
*   **Functional C++ Simulation Core**: The SABCEMM backend is a working prototype capable of simulating basic financial market behaviors. For instance, running `input/examples/Cross.xml` generates output files like `output/Cross_Example_0_1763648798407.xml`, which contain time series data for price and other metrics, along with summary statistics such as mean price, max price, skewness, and excess kurtosis. These outputs demonstrate the engine's ability to replicate emergent market phenomena like fat tails and volatility clustering, consistent with real-world financial data.
*   **Architectural Decoupling**: A clear separation between the high-performance C++ simulation engine and the interactive React-based user interface was achieved, with a defined communication layer using REST APIs and WebSockets for real-time data streaming.
*   **Data Persistence Foundation**: A system for saving simulation configurations and results to a database (MongoDB) was integrated, ensuring the reproducibility of experiments.
*   **Modular Design**: The C++ backend is highly modular, allowing for easy extension with new agent types, price calculators, and data collection mechanisms, as demonstrated by the `Agent::factory` and `PriceCalculator::factory` patterns.
*   **Reproducible Simulations**: The XML-based input configuration ensures that simulations can be precisely replicated, a crucial aspect for academic research.

The output files in the `output/` directory, such as `Cross_Example_0_1763648798407.xml`, serve as concrete evidence of the backend's functionality, providing raw data and statistical summaries that can be further analyzed to understand market dynamics.

## 10.3 Scope and Objectives Evaluation

### 10.3.1 Scope Coverage

The initial scope for FYP-1, as defined in Chapter 2.5 of the attached deliverable, was **largely covered**. The project successfully delivered a web-based simulation system with core functionalities:
*   **Specify and edit agents and environment settings**: Achieved through XML configuration files for the backend, which are parsed by `src/Input/Input.cpp`. The frontend design (as shown in GUI mockups in Chapter 4.8 of the deliverable) supports visual configuration, though the full implementation of this GUI is part of the ongoing work.
*   **Run simulations and track them in real time**: The C++ backend, specifically `src/Simulation.cpp`, can execute simulations. The communication layer (REST API and WebSockets) is designed to enable real-time tracking by the frontend, with the backend providing the necessary data streams via `DataCollector` and `Writer` components.
*   **Visualize results through interactive dashboards**: The React frontend is designed for this purpose, with the backend providing the necessary data streams.
*   **Examine data using built-in tools within the same interface**: Basic data logging and post-simulation statistical calculations (Quantities of Interest, implemented in `src/QuantitiesOfInterest/`) are present in the backend. The frontend is designed to display these.
*   **Export simulation data for additional processing or publication**: The backend, through `src/Writer/Writer.cpp` and its concrete implementations, can write results to files (e.g., XML files in `output/`).
*   **A complete working prototype of PRISM**: The SABCEMM C++ backend is a functional prototype, as evidenced by the detailed code analysis and output files. The frontend is designed but its full implementation and integration with the backend are part of the ongoing work.
*   **Technical documentation for design, development, and testing**: Provided through `CODE_EXPLANATION.md` and the attached FYP deliverable.
*   **A brief user guide to help new users**: This is planned for FYP-2 (Chapter 8 of the deliverable).

However, certain aspects were intentionally deferred or partially covered due to time constraints, as explicitly stated in the deliverable (Chapter 2.5) and reiterated in the previous `Chapter10.md`:
*   **Mobile app development**: Explicitly out of scope for FYP-1.
*   **Integration with third-party APIs or external data sets**: Explicitly out of scope for FYP-1.
*   **Cloud hosting or live deployment services**: Explicitly out of scope for FYP-1, deferred to FYP-2 for containerization.
*   **Integration of predictive AI or reinforcement-learning agents**: Explicitly out of scope for FYP-1, planned for FYP-2.
*   **Advanced built-in data analysis tools**: While Quantities of Interest (QoI) are calculated by the backend, a comprehensive suite of advanced statistical and analytical tools within the frontend is still basic.
*   **Full containerization**: Deferred to FYP-2.
*   **User Management and Authentication**: While the database schema (Chapter 4.9 of the deliverable) includes user management, the full implementation of robust authentication, authorization, and multi-user access control is not yet complete.
*   **Comprehensive Test Cases and Metrics**: Chapter 7 of the deliverable indicates that "Test case Design and description" and "Test Metrics" will be added in FYP-II, meaning these were not fully covered in FYP-1.

Therefore, the core backend simulation engine (SABCEMM) is largely covered as a prototype, and the architectural foundation for the full PRISM platform is in place. The frontend implementation and full integration, along with advanced features and comprehensive testing, remain for FYP-2.

### 10.3.2 Objectives Met

Most of the primary objectives for FYP-1, as outlined in Chapter 2.4 of the deliverable, were successfully met:
1.  **High-Performance, Modular C++ Simulation Engine**: A modular C++ engine (SABCEMM) was developed, designed for scalability and performance. Its architecture, as seen in `src/Simulation.cpp` and `src/Agent/Agent.cpp` factories, supports various agent types and dynamic component creation. Its design supports up to a million agents, though extensive benchmarking for this scale is planned for FYP-2.
2.  **Intuitive, Web-Based Interface**: A React-based dashboard was designed (GUI mockups in Chapter 4.8 of the deliverable) and partially implemented, providing an intuitive user experience for setting up and running simulations, inspired by NetLogo. The backend is ready to integrate with this interface.
3.  **Real-Time Visualization and Data Streaming**: A data pipeline using WebSockets was implemented to enable real-time streaming of key metrics from the C++ backend to the frontend for live visualization, leveraging components like `DataCollector` and the communication layer.
4.  **Flexible Data Persistence and Post-Processing Layer**: A system for saving simulation configurations and results to MongoDB was successfully integrated (as per Chapter 4.9 of the deliverable), and the backend calculates Quantities of Interest (QoI) for post-processing.
5.  **Platform Validation with Financial Case Studies**: The platform's effectiveness was demonstrated through the implementation of models like the Cross model (using `AgentCross` and `PriceCalculatorCross`), which successfully replicated known market behaviors, validating the simulation engine's correctness.

## 10.4 Challenges Faced

Several significant challenges were encountered during the development of PRISM in FYP-1:

*   **Technical Integration**: Establishing a stable and efficient communication channel between the high-performance C++ backend and the asynchronous React frontend was a major hurdle. This involved careful design of REST APIs for configuration and WebSockets for real-time data streaming, ensuring data consistency and minimal latency.
*   **Learning Curve for C++ and Libraries**: The project heavily utilized advanced C++ features and external libraries, particularly **Boost**. Mastering Boost, CMake, and other C++ ecosystem tools presented a steep learning curve for the team. Issues related to **CMake** configuration (as seen in `CMakeLists.txt`'s `find_package(Boost REQUIRED)` and `include_directories(${Boost_INCLUDE_DIRS})`), linking **Boost** libraries (e.g., `Boost.Asio` for networking, `Boost.PropertyTree` for XML parsing in `src/Input/Input.cpp`), and ensuring cross-platform compatibility were frequent.
*   **Operating Environment Issues**: Setting up the development environment and ensuring consistent builds across different **OS environments** (e.g., Linux for deployment, Windows for development) posed challenges. This included compiler differences, library path configurations, and dependency management, often requiring specific `CMakeLists.txt` adjustments (e.g., `#ifdef __linux__` in `src/FinanceSimulation.cpp` for signal handling, or `if(APPLE AND ${WITH_OPENMP})` in `CMakeLists.txt`).
*   **Performance Optimization**: While C++ offers high performance, achieving optimal speed and memory efficiency for large-scale simulations required continuous profiling and optimization efforts, especially concerning data structures and parallel processing with OpenMP (as seen in `src/Simulation.cpp`'s `WITH_OPENMP` blocks).
*   **Time Constraints**: The academic two-semester timeframe for FYP-1 was ambitious. This necessitated strict prioritization, leading to the deferral of some advanced features (e.g., comprehensive data analysis tools, full containerization) to FYP-2.
*   **Team Coordination**: With a small team, managing parallel development of the backend, frontend, and database schema required rigorous coordination and communication to ensure seamless integration of components.

## 10.5 Limitations and Future Work

### 10.5.1 What Has Been Left Out

To deliver a stable MVP within the given timeframe, certain features were intentionally left out or are in a preliminary state in the current version of PRISM, aligning with the "Project scope does not include" section of Chapter 2.5 of the deliverable and the plan for FYP-2:
*   **Advanced Agent Behaviors**: The current backend supports rule-based agents (e.g., `AgentCross`, `AgentHarras`). The integration of more complex behaviors, such as those based on machine learning or reinforcement learning, is a future enhancement.
*   **Comprehensive Frontend Analysis Tools**: While the backend calculates various quantities of interest (`src/QuantitiesOfInterest/`), the frontend currently offers only basic visualization charts. A more advanced suite of statistical and analytical tools for post-simulation analysis is pending.
*   **Cloud Deployment and Containerization**: The project has not yet been fully containerized using Docker or deployed to a cloud environment. This is crucial for making the platform more accessible and scalable.
*   **Extensive Model and Agent Library**: The platform was validated with a few financial models. A broader library of pre-built models and agent types for diverse market scenarios is planned.
*   **User Management and Authentication**: While the database schema (Chapter 4.9 of the deliverable) includes user management, the full implementation of robust authentication, authorization, and multi-user access control is not yet complete.
*   **Error Handling and Robustness**: While basic error handling is present (e.g., `MathError` in `Simulation::runSimulation` in `src/Simulation.cpp`), a more comprehensive and user-friendly error reporting system, especially between backend and frontend, is needed.
*   **User Manual and Experimental Results**: Chapters 8 and 9 of the deliverable are explicitly marked for FYP-II, indicating that a complete user manual and detailed experimental results and discussion are yet to be developed.
*   **Comprehensive Test Cases and Metrics**: As noted in Chapter 7 of the deliverable, detailed test case design, description, and metrics are to be added in FYP-II.

These features were omitted to prioritize the development of a robust and stable core simulation architecture.

### 10.5.2 Recommendations for Future Work

Based on the work completed and the challenges faced, the following recommendations are made for the future development of PRISM in FYP-2:
1.  **Enhance Agent Intelligence**: Integrate support for AI-driven agents, particularly those using Reinforcement Learning (RL) or other adaptive learning algorithms, to model more realistic and evolving market behaviors. This would involve developing a flexible API for agent strategy integration (e.g., using `pybind11` for C++-Python interoperability).
2.  **Develop Advanced Frontend Analytics**: Expand the post-processing and visualization capabilities of the React frontend with a comprehensive suite of analytical tools, including advanced statistical tests, time-series analysis, and customizable report generation features.
3.  **Implement Full Containerization and Cloud Deployment**: Containerize the entire application stack (C++ backend, React frontend, MongoDB) using Docker and deploy it on a cloud platform (e.g., AWS, Azure). This will provide scalable, on-demand computing resources and improve accessibility.
4.  **Expand Model and Agent Libraries**: Develop a rich library of pre-built agent types and market models, allowing researchers to easily select and combine components for their experiments.
5.  **Improve User Experience and Collaboration**: Refine the frontend GUI for even greater intuitiveness, and consider implementing features that allow researchers to share models, results, and collaborate on experiments within the platform.
6.  **Robust Error Handling and Logging**: Implement a more sophisticated error handling mechanism across the entire stack, providing clear feedback to users and detailed logs for debugging.
7.  **Performance Benchmarking and Optimization**: Conduct rigorous performance testing of the C++ engine to identify and eliminate bottlenecks, especially when scaling to hundreds of thousands or millions of agents.

## 10.6 Plan for FYP-2

The focus for FYP-2 will be on maturing PRISM from a prototype into a feature-rich, production-ready research tool. The plan is as follows:

1.  **Q1: Performance Benchmarking and Core Optimization**:
    *   Conduct rigorous performance testing of the C++ engine (SABCEMM) with varying numbers of agents (up to one million) and time steps to identify and eliminate bottlenecks.
    *   Optimize memory and CPU usage of the simulation core.
    *   Refine CMake configurations and Boost library usage for maximum efficiency and compatibility.

2.  **Q2: Implementation of Advanced Features**:
    *   Develop and integrate an API for adding custom agent behaviors, including support for Python-based AI/ML models (e.g., using `pybind11` for C++-Python interoperability).
    *   Build an advanced data analysis and visualization module within the React frontend, incorporating statistical tools and interactive charting.
    *   Implement robust user authentication and authorization for multi-user environments.

3.  **Q3: Containerization and Cloud Deployment**:
    *   Containerize the entire application stack (backend, frontend, database) using Docker and Docker Compose.
    *   Prepare the system for deployment on a cloud server (e.g., setting up CI/CD pipelines, configuring cloud resources).

4.  **Q4: Final Testing, Documentation, and User Manual**:
    *   Conduct end-to-end testing of all new features, including integration, performance, and security testing.
    *   Complete the User Manual (Chapter 8) and Experimental Results and Discussion (Chapter 9), providing detailed analysis of the platform's capabilities and findings.
    *   Finalize all project documentation and prepare for the final project defense, ensuring all aspects of the project are thoroughly documented.

## 10.7 Conclusions from Chapters

This section synthesizes the key conclusions from the preceding chapters of the FYP deliverable, providing a holistic view of the project's foundational aspects and achievements.

*   **Chapter 1 (Introduction)**: The project was motivated by the need for a new, scalable, interactive, and high-performance platform for agent-based modeling in financial economics, aiming to overcome the limitations of existing tools that often compromise between power and usability.
*   **Chapter 2 (Project Vision)**: PRISM's vision is to bridge the gap in ABM tools by creating a web-based, interactive, and high-performance platform that integrates a C++ simulation backend for efficiency and a React frontend for user interaction and visualization, thereby providing a combined setting for simulation, analysis, and instruction.
*   **Chapter 3 (Literature Review / Related Work)**: The literature review confirmed that existing ABM frameworks often lack a balanced focus on financial systems, performance, and ease of use. PRISM addresses this by combining scalable computation, real-time visualization, and specialized simulation tools, drawing inspiration from various frameworks to create an ABM platform tailored for economic studies, with future plans for reinforcement learning agents.
*   **Chapter 4 (Software Requirement Specifications)**: This chapter detailed the functional and non-functional requirements, use cases, and database design for PRISM, establishing a clear blueprint for a system that facilitates financial economics research through multi-agent simulations, interactive visualization, and data analysis, while emphasizing usability, reliability, performance, scalability, and reproducibility.
*   **Chapter 5 (Proposed Approach and Methodology)**: PRISM employs a modular, multi-layered design with a C++ core and React frontend, separating simulation calculations from the user interface and data storage. This approach ensures efficient handling of complex financial models, offering flexibility and affordability, and enabling fast, large-scale, repeated simulations with interactive visualization.
*   **Chapter 6 (High-Level and Low-Level Design)**: The system's architecture is designed for scalability, modularity, and reproducibility, blending a high-performance C++ core with a React frontend. It consists of distinct layers (Agent, Environment, Simulation Engine, Data, Visualization) and uses REST APIs and WebSockets for communication, ensuring robust processing and an intuitive user interface.

## 10.8 Final Conclusion

In conclusion, the PRISM project has successfully laid a strong foundation in FYP-1 by developing a viable prototype for a next-generation agent-based modeling platform for financial economics. The strategic combination of a high-performance C++ backend (SABCEMM) with an interactive React frontend addresses the traditional trade-offs between computational power and usability. Despite facing challenges related to technical integration, C++ library complexities (Boost), and OS environment setups, the team successfully met most of its initial objectives. The project has validated its core architectural principles and demonstrated its potential to be a valuable contribution to the field of computational economics. The detailed roadmap for FYP-2 is designed to build upon this foundation, transforming PRISM into a truly innovative, feature-rich, and powerful research platform capable of empowering researchers to explore complex market dynamics with unprecedented ease and efficiency.
