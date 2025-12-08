# CMake generated Testfile for 
# Source directory: /home/monan/Desktop/SABCEMM/test
# Build directory: /home/monan/Desktop/SABCEMM/build/test
# 
# This file includes the relevant testing commands required for 
# testing this directory and lists subdirectories to be tested as well.
add_test(financeSimulationTests "financeSimulationTests")
set_tests_properties(financeSimulationTests PROPERTIES  _BACKTRACE_TRIPLES "/home/monan/Desktop/SABCEMM/test/CMakeLists.txt;77;add_test;/home/monan/Desktop/SABCEMM/test/CMakeLists.txt;0;")
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
