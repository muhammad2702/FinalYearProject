# Install script for directory: /mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/src

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

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  if(EXISTS "$ENV{DESTDIR}${CMAKE_INSTALL_PREFIX}/bin/financeSimulation" AND
     NOT IS_SYMLINK "$ENV{DESTDIR}${CMAKE_INSTALL_PREFIX}/bin/financeSimulation")
    file(RPATH_CHECK
         FILE "$ENV{DESTDIR}${CMAKE_INSTALL_PREFIX}/bin/financeSimulation"
         RPATH "")
  endif()
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/bin" TYPE EXECUTABLE FILES "/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/src/financeSimulation")
  if(EXISTS "$ENV{DESTDIR}${CMAKE_INSTALL_PREFIX}/bin/financeSimulation" AND
     NOT IS_SYMLINK "$ENV{DESTDIR}${CMAKE_INSTALL_PREFIX}/bin/financeSimulation")
    if(CMAKE_INSTALL_DO_STRIP)
      execute_process(COMMAND "/usr/bin/strip" "$ENV{DESTDIR}${CMAKE_INSTALL_PREFIX}/bin/financeSimulation")
    endif()
  endif()
endif()

if(NOT CMAKE_INSTALL_LOCAL_ONLY)
  # Include the install script for each subdirectory.
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/src/Agent/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/src/Algorithms/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/src/DataCollector/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/src/Exceptions/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/src/ExcessDemandCalculator/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/src/Group/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/src/NeighbourhoodGenerator/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/src/Input/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/src/PriceCalculator/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/src/QuantitiesOfInterest/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/src/RandomGenerator/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/src/StockExchange/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/src/Switching/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/src/Util/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/src/VariableContainer/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/src/Writer/cmake_install.cmake")
  include("/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/src/Version/cmake_install.cmake")

endif()

