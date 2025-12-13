# Manual Test Case Management Tool

A web-based application for managing **manual test cases**, **test suites**, and **test runs**.  
Built with **ASP.NET Core**, **Entity Framework Core**, **SQLite**, and a **React (Vite) frontend**.

This project simulates how QA teams organize and execute manual testing in real-world software projects.

---

## Features

### Test Case Management
- Create, edit, and delete test cases
- Define steps, expected results, and descriptions
- Organize test cases into test suites

### Test Suite Management
- Group related test cases into suites
- Reuse suites across multiple test runs

### Test Runs
- Create a test run from a test suite
- Automatically includes all test cases in the suite
- Execute tests and record results:
  - Passed
  - Failed
  - Blocked
  - Not Run
- View run overview and per-test results

### Run Overview
- Summary statistics (pass/fail counts)
- Per-case execution status
- Editable results during execution

---

## Tech Stack

### Backend
- ASP.NET Core Web API
- Entity Framework Core
- SQLite
- RESTful endpoints
- DTO-based responses to avoid circular references

### Frontend
- React
- TypeScript
- Vite
- React Router
- Fetch API

---

## Project Structure

```
/backend
  ├── Controllers
  ├── Models
  ├── DTOs
  ├── Data
  ├── Migrations
  └── Program.cs

/frontend
  ├── src
  │   ├── pages
  │   ├── components
  │   ├── api
  │   └── types
  └── vite.config.ts
```

---

## Getting Started

### Prerequisites
- .NET SDK 7 or newer
- Node.js 18+
- npm

---

## Backend Setup

```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

- API runs by default on: https://localhost:5001  
- Swagger available at: https://localhost:5001/swagger

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

- Frontend runs on: https://localhost:5173 (or next available port)

---

## Database

- Uses SQLite
- Database file is created automatically on first run
- Entity Framework Core migrations handle schema changes

---

## Key Design Decisions

- **Runs are immutable snapshots**  
  When a run is created, all test cases from the suite are copied into run results.

- **DTO-based API responses**  
  Prevents circular references and keeps payloads frontend-friendly.

- **Separation of concerns**  
  Clear separation between domain models, DTOs, and UI state.

---

## Future Improvements

- User authentication and roles
- Attachments and screenshots
- Export results (CSV / PDF)
- Filtering and search
- Pagination

---

## Purpose

This project was built to:
- Practice real-world ASP.NET + React architecture
- Demonstrate relational data modeling
- Simulate professional QA workflows
- Serve as a portfolio project

---

## License

This project is for learning and demonstration purposes.
