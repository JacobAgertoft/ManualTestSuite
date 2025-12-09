import './Projects.css'
import { useEffect, useState } from 'react'

export function Projects() {
    const [projects, setProjects] = useState([])
    const [loadingProjects, setLoadingProjects] = useState(true)
    const [projectsError, setProjectsError] = useState(null)

    const [selectedProjectId, setSelectedProjectId] = useState(null)

    const [suites, setSuites] = useState([])
    const [loadingSuites, setLoadingSuites] = useState(false)
    const [suitesError, setSuitesError] = useState(null)
    const [selectedSuiteId, setSelectedSuiteId] = useState(null)

    const [testCases, setTestCases] = useState([])
    const [loadingCases, setLoadingCases] = useState(false)
    const [casesError, setCasesError] = useState(null)
    const [selectedCaseId, setSelectedCaseId] = useState(null)

    const [testRuns, setTestRuns] = useState([])
    const [loadingRuns, setLoadingRuns] = useState(false)
    const [runsError, setRunsError] = useState(null)

    const [projectName, setProjectName] = useState('')
    const [projectDescription, setProjectDescription] = useState('')

    const [suiteName, setSuiteName] = useState('')
    const [suiteDescription, setSuiteDescription] = useState('')

    const [caseTitle, setCaseTitle] = useState('')
    const [caseSteps, setCaseSteps] = useState('')
    const [caseExpected, setCaseExpected] = useState('')

    const [runResult, setRunResult] = useState('Passed')
    const [runComment, setRunComment] = useState('')
    const [runExecutedBy, setRunExecutedBy] = useState('')

    // Load projects
    const loadProjects = async () => {
        try {
            setLoadingProjects(true)
            setProjectsError(null)
            const res = await fetch('/api/projects')
            if (!res.ok) throw new Error(`Status ${res.status}`)
            const json = await res.json()
            setProjects(json)
            if (json.length > 0 && !selectedProjectId) {
                setSelectedProjectId(json[0].id)
            }
        } catch (err) {
            setProjectsError(err.message || 'Unknown error')
        } finally {
            setLoadingProjects(false)
        }
    }

    // Load suites
    const loadSuites = async (projectId) => {
        if (!projectId) return
        try {
            setLoadingSuites(true)
            setSuitesError(null)
            const res = await fetch(`/api/projects/${projectId}/testsuites`)
            if (!res.ok) throw new Error(`Status ${res.status}`)
            const json = await res.json()
            setSuites(json)
            if (!json.some((s) => s.id === selectedSuiteId)) {
                setSelectedSuiteId(json.length > 0 ? json[0].id : null)
            }
        } catch (err) {
            setSuitesError(err.message || 'Unknown error')
        } finally {
            setLoadingSuites(false)
        }
    }

    // Load test cases
    const loadTestCases = async (projectId, suiteId) => {
        if (!projectId || !suiteId) {
            setTestCases([])
            return
        }
        try {
            setLoadingCases(true)
            setCasesError(null)
            const res = await fetch(
                `/api/projects/${projectId}/testsuites/${suiteId}/testcases`
            )
            if (!res.ok) throw new Error(`Status ${res.status}`)
            const json = await res.json()
            setTestCases(json)
            if (!json.some((c) => c.id === selectedCaseId)) {
                setSelectedCaseId(json.length > 0 ? json[0].id : null)
            }
        } catch (err) {
            setCasesError(err.message || 'Unknown error')
        } finally {
            setLoadingCases(false)
        }
    }

    // Load test runs
    const loadTestRuns = async (projectId, suiteId, caseId) => {
        if (!projectId || !suiteId || !caseId) {
            setTestRuns([])
            return
        }
        try {
            setLoadingRuns(true)
            setRunsError(null)
            const res = await fetch(
                `/api/projects/${projectId}/testsuites/${suiteId}/testcases/${caseId}/testruns`
            )
            if (!res.ok) throw new Error(`Status ${res.status}`)
            const json = await res.json()
            setTestRuns(json)
        } catch (err) {
            setRunsError(err.message || 'Unknown error')
        } finally {
            setLoadingRuns(false)
        }
    }

    useEffect(() => {
        loadProjects()
    }, [])

    useEffect(() => {
        if (selectedProjectId) {
            loadSuites(selectedProjectId)
        } else {
            setSuites([])
            setSelectedSuiteId(null)
        }
    }, [selectedProjectId])

    useEffect(() => {
        if (selectedProjectId && selectedSuiteId) {
            loadTestCases(selectedProjectId, selectedSuiteId)
        } else {
            setTestCases([])
            setSelectedCaseId(null)
        }
    }, [selectedProjectId, selectedSuiteId])

    useEffect(() => {
        if (selectedProjectId && selectedSuiteId && selectedCaseId) {
            loadTestRuns(selectedProjectId, selectedSuiteId, selectedCaseId)
        } else {
            setTestRuns([])
        }
    }, [selectedProjectId, selectedSuiteId, selectedCaseId])

    const onCreateProject = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: projectName,
                    description: projectDescription,
                }),
            })
            if (!res.ok) throw new Error(`Status ${res.status}`)
            setProjectName('')
            setProjectDescription('')
            await loadProjects()
        } catch (err) {
            alert('Error creating project: ' + (err.message || 'Unknown error'))
        }
    }

    const onCreateSuite = async (e) => {
        e.preventDefault()
        if (!selectedProjectId) {
            alert('Select a project first')
            return
        }
        try {
            const res = await fetch(`/api/projects/${selectedProjectId}/testsuites`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: suiteName,
                    description: suiteDescription,
                }),
            })
            if (!res.ok) throw new Error(`Status ${res.status}`)
            setSuiteName('')
            setSuiteDescription('')
            await loadSuites(selectedProjectId)
        } catch (err) {
            alert('Error creating test suite: ' + (err.message || 'Unknown error'))
        }
    }

    const onCreateTestCase = async (e) => {
        e.preventDefault()
        if (!selectedProjectId || !selectedSuiteId) {
            alert('Select a project and suite first')
            return
        }
        try {
            const res = await fetch(
                `/api/projects/${selectedProjectId}/testsuites/${selectedSuiteId}/testcases`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: caseTitle,
                        steps: caseSteps,
                        expectedResult: caseExpected,
                    }),
                }
            )
            if (!res.ok) throw new Error(`Status ${res.status}`)
            setCaseTitle('')
            setCaseSteps('')
            setCaseExpected('')
            await loadTestCases(selectedProjectId, selectedSuiteId)
        } catch (err) {
            alert('Error creating test case: ' + (err.message || 'Unknown error'))
        }
    }

    const onCreateTestRun = async (e) => {
        e.preventDefault()
        if (!selectedProjectId || !selectedSuiteId || !selectedCaseId) {
            alert('Select a project, suite and case first')
            return
        }
        try {
            const res = await fetch(
                `/api/projects/${selectedProjectId}/testsuites/${selectedSuiteId}/testcases/${selectedCaseId}/testruns`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        result: runResult,
                        comment: runComment,
                        executedBy: runExecutedBy,
                    }),
                }
            )
            if (!res.ok) throw new Error(`Status ${res.status}`)
            setRunComment('')
            // keep result & executedBy
            await loadTestRuns(selectedProjectId, selectedSuiteId, selectedCaseId)
        } catch (err) {
            alert('Error creating test run: ' + (err.message || 'Unknown error'))
        }
    }

    return (
        <div className="projects-container">
            {/* Projects */}
            <div className="column">
                <h1>Projects</h1>

                <form onSubmit={onCreateProject} style={{ marginBottom: 16 }}>
                    <div>
                        <label>
                            Name{' '}
                            <input
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                required
                            />
                        </label>
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <label>
                            Description{' '}
                            <input
                                value={projectDescription}
                                onChange={(e) => setProjectDescription(e.target.value)}
                            />
                        </label>
                    </div>
                    <button type="submit" style={{ marginTop: 8 }}>
                        Add Project
                    </button>
                </form>

                {loadingProjects && <p>Loading projects…</p>}
                {projectsError && <p style={{ color: 'red' }}>Error: {projectsError}</p>}

                <ul>
                    {projects.map((p) => (
                        <li key={p.id}>
                            <button
                                type="button"
                                onClick={() => setSelectedProjectId(p.id)}
                                style={{
                                    fontWeight: p.id === selectedProjectId ? 'bold' : 'normal',
                                    marginRight: 8,
                                }}
                            >
                                {p.name}
                            </button>
                            <span>{p.description}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Suites */}
            <div className="column">
                <h2>Test Suites</h2>

                {selectedProjectId ? (
                    <>
                        <p>
                            For project ID: <strong>{selectedProjectId}</strong>
                        </p>

                        <form onSubmit={onCreateSuite} style={{ marginBottom: 16 }}>
                            <div>
                                <label>
                                    Name{' '}
                                    <input
                                        value={suiteName}
                                        onChange={(e) => setSuiteName(e.target.value)}
                                        required
                                    />
                                </label>
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <label>
                                    Description{' '}
                                    <input
                                        value={suiteDescription}
                                        onChange={(e) => setSuiteDescription(e.target.value)}
                                    />
                                </label>
                            </div>
                            <button type="submit" style={{ marginTop: 8 }}>
                                Add Test Suite
                            </button>
                        </form>

                        {loadingSuites && <p>Loading suites…</p>}
                        {suitesError && <p style={{ color: 'red' }}>Error: {suitesError}</p>}

                        <ul>
                            {suites.map((s) => (
                                <li key={s.id}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSuiteId(s.id)}
                                        style={{
                                            fontWeight: s.id === selectedSuiteId ? 'bold' : 'normal',
                                            marginRight: 8,
                                        }}
                                    >
                                        {s.name}
                                    </button>
                                    <span>{s.description}</span>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p>Select a project to see its suites.</p>
                )}
            </div>

            {/* Test cases */}
            <div className="column">
                <h2>Test Cases</h2>

                {selectedSuiteId ? (
                    <>
                        <p>
                            For suite ID: <strong>{selectedSuiteId}</strong>
                        </p>

                        <form onSubmit={onCreateTestCase} style={{ marginBottom: 16 }}>
                            <div>
                                <label>
                                    Title{' '}
                                    <input
                                        value={caseTitle}
                                        onChange={(e) => setCaseTitle(e.target.value)}
                                        required
                                    />
                                </label>
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <label>
                                    Steps{' '}
                                    <textarea
                                        value={caseSteps}
                                        onChange={(e) => setCaseSteps(e.target.value)}
                                        rows={3}
                                        style={{ width: '100%' }}
                                    />
                                </label>
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <label>
                                    Expected result{' '}
                                    <textarea
                                        value={caseExpected}
                                        onChange={(e) => setCaseExpected(e.target.value)}
                                        rows={2}
                                        style={{ width: '100%' }}
                                    />
                                </label>
                            </div>
                            <button type="submit" style={{ marginTop: 8 }}>
                                Add Test Case
                            </button>
                        </form>

                        {loadingCases && <p>Loading test cases…</p>}
                        {casesError && <p style={{ color: 'red' }}>Error: {casesError}</p>}

                        <ul>
                            {testCases.map((c) => (
                                <li key={c.id}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCaseId(c.id)}
                                        style={{
                                            fontWeight: c.id === selectedCaseId ? 'bold' : 'normal',
                                            marginRight: 8,
                                        }}
                                    >
                                        {c.title}
                                    </button>{' '}
                                    <div>
                                        <small>Steps: {c.steps || '(none)'}</small>
                                    </div>
                                    <div>
                                        <small>Expected: {c.expectedResult || '(none)'}</small>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p>Select a test suite to see test cases.</p>
                )}
            </div>

            {/* Test runs */}
            <div className="column">
                <h2>Test Runs</h2>

                {selectedCaseId ? (
                    <>
                        <p>
                            For case ID: <strong>{selectedCaseId}</strong>
                        </p>

                        <form onSubmit={onCreateTestRun} style={{ marginBottom: 16 }}>
                            <div>
                                <label>
                                    Result{' '}
                                    <select
                                        value={runResult}
                                        onChange={(e) => setRunResult(e.target.value)}
                                    >
                                        <option value="Passed">Passed</option>
                                        <option value="Failed">Failed</option>
                                        <option value="Blocked">Blocked</option>
                                        <option value="NotRun">Not run</option>
                                    </select>
                                </label>
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <label>
                                    Comment{' '}
                                    <textarea
                                        value={runComment}
                                        onChange={(e) => setRunComment(e.target.value)}
                                        rows={2}
                                        style={{ width: '100%' }}
                                    />
                                </label>
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <label>
                                    Executed by{' '}
                                    <input
                                        value={runExecutedBy}
                                        onChange={(e) => setRunExecutedBy(e.target.value)}
                                    />
                                </label>
                            </div>
                            <button type="submit" style={{ marginTop: 8 }}>
                                Add Test Run
                            </button>
                        </form>

                        {loadingRuns && <p>Loading test runs…</p>}
                        {runsError && <p style={{ color: 'red' }}>Error: {runsError}</p>}

                        <ul>
                            {testRuns.map((r) => (
                                <li key={r.id}>
                                    <strong>{r.result}</strong>{' '}
                                    <small>
                                        at {new Date(r.executedAt).toLocaleString()}
                                        {r.executedBy ? ` by ${r.executedBy}` : ''}
                                    </small>
                                    {r.comment && (
                                        <div>
                                            <small>Comment: {r.comment}</small>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p>Select a test case to see its runs.</p>
                )}
            </div>
        </div>
    )
}
