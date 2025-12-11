# PRISM Project - Presentation Documentation

## Project Overview

**PRISM** (Platform for Research in Simulation Modeling) is a next-generation agent-based modeling platform for financial economics. It combines a high-performance C++ simulation engine (SABCEMM) with a modern React frontend and Node.js backend to create an accessible, powerful research tool.

---

## 1. Project Completion Status

### ✅ Completed Features

#### **Backend (Node.js/Express)**
- ✅ RESTful API server with Express.js
- ✅ MongoDB database integration for user management
- ✅ JWT-based authentication system
- ✅ User registration with email verification (OTP)
- ✅ Protected API routes with authentication middleware
- ✅ Simulation execution service (spawns C++ executable)
- ✅ CSV data parsing and statistics calculation
- ✅ Template management system
- ✅ Simulation data export functionality

#### **Frontend (React/TypeScript)**
- ✅ Modern React application with TypeScript
- ✅ Authentication flow (Login/Signup/OTP Verification)
- ✅ Private and Public route guards
- ✅ User context and state management
- ✅ Dashboard with key performance metrics
- ✅ Simulation management interface
- ✅ Data explorer with CSV visualization
- ✅ Interactive visualizations using Recharts
- ✅ Parameter configuration interface
- ✅ Chat agent component for user assistance
- ✅ Responsive design with modern UI/UX

#### **C++ Simulation Engine (SABCEMM)**
- ✅ Agent-based market simulation engine
- ✅ Multiple agent types (Cross, Harras, Franke-Westerhoff, etc.)
- ✅ Price calculation algorithms
- ✅ Excess demand calculation
- ✅ Data collection and CSV export
- ✅ XML-based configuration system
- ✅ Parallel execution support (OpenMP)

#### **Integration**
- ✅ Frontend-Backend API integration
- ✅ Backend-C++ executable integration
- ✅ File system-based data exchange
- ✅ Error handling and validation

---

## 2. Architecture & Design Patterns

### 2.1 System Architecture

```
┌─────────────────────────────────────┐
│   React Frontend (Port 5173)       │
│   • TypeScript                      │
│   • React Router                    │
│   • Context API (Auth)              │
│   • Axios (HTTP Client)             │
└──────────────┬──────────────────────┘
               │ HTTP REST API (JWT)
┌──────────────▼──────────────────────┐
│   Node.js/Express API (Port 3001)  │
│   • Express.js                      │
│   • MongoDB (Mongoose)              │
│   • JWT Authentication              │
│   • Middleware Pattern              │
└──────────────┬──────────────────────┘
               │ File System / Spawn
┌──────────────▼──────────────────────┐
│   C++ SABCEMM Engine                │
│   • Agent-Based Simulation          │
│   • Object-Oriented Design          │
│   • Strategy Pattern                │
│   • Factory Pattern                 │
└─────────────────────────────────────┘
```

### 2.2 Design Patterns Used

#### **1. MVC (Model-View-Controller) Pattern**
- **Backend**: 
  - Models: `User.js`, Mongoose schemas
  - Views: JSON API responses
  - Controllers: `authController.js`, `simulationController.js`, `templateController.js`
- **Frontend**:
  - Models: TypeScript interfaces/types
  - Views: React components (pages, components)
  - Controllers: Context providers, API utilities

#### **2. Middleware Pattern**
- **Backend**: Express middleware for authentication (`authenticateToken`)
- **Frontend**: Axios interceptors for request/response handling
- Used for:
  - JWT token validation
  - Request authentication
  - Error handling
  - Token injection

#### **3. Strategy Pattern**
- **C++**: Different agent types (AgentCross, AgentHarras, AgentFW) implement the same `Agent` interface
- Each agent type has different trading strategies but same interface
- Allows runtime selection of agent behavior

#### **4. Factory Pattern**
- **C++**: Agent creation based on XML configuration
- Creates appropriate agent instances based on input parameters
- Used in simulation initialization

#### **5. Observer Pattern**
- **C++**: Data collectors observe simulation state
- Collects data at each time step
- Decouples data collection from simulation logic

#### **6. Context Pattern (React)**
- **Frontend**: `AuthContext` for global authentication state
- Provides authentication state to all components
- Eliminates prop drilling

#### **7. Route Guard Pattern**
- **Frontend**: `PrivateRoute` and `PublicRoute` components
- Protects routes based on authentication status
- Redirects unauthenticated users to login

#### **8. Repository Pattern**
- **Backend**: Service layer (`simulationService.js`, `templateService.js`)
- Abstracts data access logic
- Separates business logic from data access

#### **9. Dependency Injection**
- **C++**: Agents receive dependencies (RandomGenerator, Price, etc.) via constructor
- **Backend**: Express middleware injected into routes
- Promotes testability and loose coupling

#### **10. Singleton Pattern**
- **Backend**: Database connection (MongoDB)
- Ensures single database connection instance

---

## 3. Technology Stack

### Frontend
- **React 19.2.0**: UI framework
- **TypeScript**: Type safety
- **React Router 6.28.0**: Client-side routing
- **Axios**: HTTP client
- **Recharts**: Data visualization
- **Lucide React**: Icon library
- **Vite**: Build tool

### Backend
- **Node.js**: Runtime environment
- **Express.js 4.19.2**: Web framework
- **MongoDB**: Database (via Mongoose)
- **JWT (jsonwebtoken)**: Authentication tokens
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing

### C++ Engine
- **C++17**: Language standard
- **CMake**: Build system
- **OpenMP**: Parallel processing
- **TinyXML2**: XML parsing
- **Google Test**: Unit testing framework

---

## 4. Key Features & Functionality

### 4.1 Authentication System
- **User Registration**: Email-based signup with OTP verification
- **Login**: JWT token-based authentication
- **Protected Routes**: Frontend and backend route protection
- **Session Management**: Token stored in localStorage with automatic refresh
- **User Profile**: Display username in navbar when logged in

### 4.2 Simulation Management
- **Run Simulations**: Execute C++ simulations via web interface
- **View Results**: Browse simulation outputs
- **Data Export**: Export simulation data as CSV
- **Statistics**: Calculate financial metrics (Sharpe ratio, volatility, etc.)

### 4.3 Data Visualization
- **Dashboard**: Overview of latest simulation with key metrics
- **Charts**: Interactive price evolution charts
- **Data Explorer**: Browse and filter simulation data
- **Visualizations**: Multiple chart types (line, area, bar)

### 4.4 Parameter Configuration
- **XML Templates**: Pre-configured simulation templates
- **Custom Parameters**: Modify simulation parameters via UI
- **Real-time Execution**: Run simulations without recompiling C++ code

---

## 5. Security Implementation

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Token Expiration**: 7-day token validity
- **Route Protection**: Middleware-based API protection
- **OTP Verification**: Email verification for new users

### API Security
- **CORS**: Configured for frontend origin
- **Input Validation**: Request validation in controllers
- **Error Handling**: Secure error messages (no sensitive data leakage)

---

## 6. Data Flow

### Simulation Execution Flow
1. User configures parameters in frontend
2. Frontend sends XML configuration to backend API
3. Backend validates request and spawns C++ executable
4. C++ engine runs simulation and writes CSV files
5. Backend parses CSV files and calculates statistics
6. Frontend displays results and visualizations

### Authentication Flow
1. User registers → OTP sent to email
2. User verifies OTP → JWT token issued
3. Token stored in localStorage
4. Token included in API requests via Axios interceptor
5. Backend validates token via middleware
6. Protected routes accessible with valid token

---

## 7. Project Structure

```
FinalYearProject/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React contexts (Auth)
│   │   ├── pages/        # Page components
│   │   └── utils/        # Utilities (API, statistics)
│   └── package.json
│
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   └── services/     # Business logic
│   └── package.json
│
├── src/                   # C++ simulation engine
│   ├── Agent/            # Agent implementations
│   ├── StockExchange/    # Market mechanics
│   ├── PriceCalculator/  # Price update algorithms
│   └── ...
│
└── input/                 # Simulation configurations
    └── examples/
```

---

## 8. Challenges Overcome

### Technical Challenges
1. **C++ Integration**: Successfully integrated C++ executable with Node.js backend
2. **Cross-Platform**: Handled Windows/WSL compatibility for simulation execution
3. **Data Parsing**: Efficient CSV parsing and statistics calculation
4. **Authentication**: Implemented secure JWT-based authentication system
5. **State Management**: Managed authentication state across React components

### Architecture Challenges
1. **Separation of Concerns**: Clear separation between frontend, backend, and C++ engine
2. **Error Handling**: Comprehensive error handling across all layers
3. **Performance**: Optimized data loading and visualization rendering

---

## 9. Future Enhancements (Roadmap)

### Phase 2 Features
- [ ] Real-time simulation monitoring (WebSockets)
- [ ] Advanced visualization options
- [ ] PDF report generation
- [ ] User collaboration features
- [ ] Simulation comparison tools
- [ ] Performance optimization
- [ ] Enhanced error recovery
- [ ] Multi-user simulation management

---

## 10. Testing & Quality Assurance

### Testing Strategy
- **Unit Tests**: C++ components tested with Google Test
- **Integration Tests**: API endpoints tested manually
- **Frontend Testing**: Component testing (to be implemented)
- **End-to-End**: Manual testing of complete workflows

### Code Quality
- **TypeScript**: Type safety in frontend
- **ESLint**: Code linting
- **Error Handling**: Comprehensive error handling
- **Code Documentation**: Inline comments and documentation

---

## 11. Deployment Considerations

### Current Setup
- **Development**: Local development environment
- **Database**: MongoDB (local or cloud)
- **Build**: CMake for C++, npm for Node.js/React

### Production Readiness
- Environment variables for configuration
- Error logging and monitoring
- Database connection pooling
- API rate limiting (to be implemented)
- HTTPS/SSL configuration

---

## 12. Conclusion

The PRISM project successfully demonstrates:

1. **Full-Stack Integration**: Seamless integration of React frontend, Node.js backend, and C++ simulation engine
2. **Modern Architecture**: Use of contemporary design patterns and best practices
3. **Security**: Robust authentication and authorization system
4. **User Experience**: Intuitive interface for complex simulation management
5. **Scalability**: Architecture designed for future enhancements

The project provides a solid foundation for a next-generation agent-based modeling platform, combining computational power with user-friendly interfaces.

---

## Presentation Talking Points

### Opening (2 minutes)
- Introduce PRISM project
- Explain the problem: Need for accessible agent-based financial market simulation
- Show the solution: Full-stack web platform

### Architecture Overview (3 minutes)
- Show system architecture diagram
- Explain three-tier architecture (Frontend, Backend, C++ Engine)
- Highlight design patterns used

### Key Features Demo (5 minutes)
- Authentication flow (Login/Signup)
- Dashboard with metrics
- Running a simulation
- Viewing results and visualizations

### Technical Deep Dive (3 minutes)
- Design patterns explanation
- Security implementation
- Data flow demonstration

### Challenges & Solutions (2 minutes)
- Technical challenges overcome
- Architecture decisions made

### Future Roadmap (2 minutes)
- Phase 2 enhancements
- Potential improvements

### Q&A (3 minutes)
- Answer questions
- Discuss technical details

**Total: ~20 minutes**
