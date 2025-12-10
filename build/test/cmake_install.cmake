# Install script for directory: /mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/test

# Set the install prefix
if(NOT DEFINED CMAKE_INSTALL_PREFIX)
  set(CMAKE_INSTALL_PREFIX "/usr/local")
endif()
string(REGEX REPLACE "/$" "" CMAKE_INSTALL_PREFIX "${CMAKE_INSTALL_PREFIX}")

# Set the install configuration name.
if(NOT DEFINED CMAKE_INSTALL_CONFIG_NAME)
  if(BUILD_TYPE)
    string(REGEX REPLACE "^[^A-Za-z0-9_]+" ""
           CMAKE_INSTALL_CONFIG_NAME "${BUILD_TYPE}")
  else()
    set(CMAKE_INSTALL_CONFIG_NAME "")
  endif()
  message(STATUS "Install configuration: \"${CMAKE_INSTALL_CONFIG_NAME}\"")
endif()

# Set the component getting installed.
if(NOT CMAKE_INSTALL_COMPONENT)
  if(COMPONENT)
    message(STATUS "Install component: \"${COMPONENT}\"")
    set(CMAKE_INSTALL_COMPONENT "${COMPONENT}")
  else()
    set(CMAKE_INSTALL_COMPONENT)
  endif()
endif()

# Install shared libraries without execute permission?
if(NOT DEFINED CMAKE_INSTALL_SO_NO_EXE)
  set(CMAKE_INSTALL_SO_NO_EXE "1")
endif()

# Is this installation the result of a crosscompile?
if(NOT DEFINED CMAKE_CROSSCOMPILING)
  set(CMAKE_CROSSCOMPILING "FALSE")
endif()

# Set default install directory permissions.
if(NOT DEFINED CMAKE_OBJDUMP)
  set(CMAKE_OBJDUMP "/usr/bin/objdump")
endif()

if(NOT CMAKE_INSTALL_LOCAL_ONLY)
  # Include the install script for each subdirectory.
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/test/AgentTest/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/test/DataCollectorTest/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/test/DummyClasses/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/test/ExcessDemandCalculatorTest/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/test/GroupTest/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/test/InputTest/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/test/MockClasses/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/test/NeighbourhoodGeneratorTest/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/test/PriceCalculatorTest/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/test/QuantitiesOfInterestTest/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/test/RandomGeneratorTest/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/test/FullSimulationTest/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/test/StockExchangeTest/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/test/VariableContainerTest/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/test/WriterTest/cmake_install.cmake")

endif()

