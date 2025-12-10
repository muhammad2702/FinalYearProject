# CMake generated Testfile for 
# Source directory: /mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/test
# Build directory: /mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/test
# 
# This file includes the relevant testing commands required for 
# testing this directory and lists subdirectories to be tested as well.
add_test(financeSimulationTests "financeSimulationTests")
set_tests_properties(financeSimulationTests PROPERTIES  _BACKTRACE_TRIPLES "/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/test/CMakeLists.txt;77;add_test;/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/test/CMakeLists.txt;0;")
subdirs("AgentTest")
subdirs("DataCollectorTest")
subdirs("DummyClasses")
subdirs("ExcessDemandCalculatorTest")
subdirs("GroupTest")
subdirs("InputTest")
subdirs("MockClasses")
subdirs("NeighbourhoodGeneratorTest")
subdirs("PriceCalculatorTest")
subdirs("QuantitiesOfInterestTest")
subdirs("RandomGeneratorTest")
subdirs("FullSimulationTest")
subdirs("StockExchangeTest")
subdirs("VariableContainerTest")
subdirs("WriterTest")
