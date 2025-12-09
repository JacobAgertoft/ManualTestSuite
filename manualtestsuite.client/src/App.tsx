import { Routes, Route, Link } from 'react-router-dom'
import ProjectsPage from './pages/ProjectsPage'
import SuitesPage from './pages/SuitesPage'
import TestCasesPage from './pages/TestCasesPage'
import TestRunsPage from './pages/TestRunsPage'
import './Projects.css' // reuse your styling if you like

function App() {
    return (
        <div>
            <header style={{ padding: '12px 24px', borderBottom: '1px solid #ddd' }}>
                <nav style={{ display: 'flex', gap: 16 }}>
                    <Link to="/">Projects</Link>
                </nav>
            </header>

            <main style={{ padding: 24 }}>
                <Routes>
                    <Route path="/" element={<ProjectsPage />} />
                    <Route path="/projects/:projectId/suites" element={<SuitesPage />} />
                    <Route
                        path="/projects/:projectId/suites/:suiteId/cases"
                        element={<TestCasesPage />}
                    />
                    <Route
                        path="/projects/:projectId/suites/:suiteId/cases/:caseId/runs"
                        element={<TestRunsPage />}
                    />
                </Routes>
            </main>
        </div>
    )
}

export default App
