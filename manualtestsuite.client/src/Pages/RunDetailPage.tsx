import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import '../Projects.css'

type RunResult = {
    id: number
    result: string
    comment?: string
    executedBy?: string
    executedAt?: string | null
    testCase?: {
        id: number
        title: string
        steps?: string
        expectedResult?: string
    }
}

type TestRun = {
    id: number
    name: string
    createdAt: string
    createdBy?: string
    results: RunResult[]
}

type TestRunOverview = {
    id: number
    name: string
    testSuiteId: number
    testSuiteName: string
    createdAt: string
    createdBy?: string | null
    lastCompletededAt?: string | null
    lastExecutedAt?: string | null
    totalTests: number
    passedCount: number
    failedCount: number
    blockedCount: number
    notRunCount: number
}

const loadOverview = async (runId: string) => {
    const res = await fetch(`/api/test-runs/overview?runId=${runId}`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    const list = await res.json()
    return (list[0] ?? null) as TestRunOverview | null
}



const RunDetailPage = () => {
    const { projectId, suiteId, runId } = useParams()
    const navigate = useNavigate()

    const [searchParams] = useSearchParams()
    const tab = searchParams.get('tab') // "overview" | null

    const [overview, setOverview] = useState<TestRunOverview | null>(null)

    const [run, setRun] = useState<TestRun | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [editingResults, setEditingResults] = useState<Record<number, RunResult>>({})

    const loadRun = async () => {
        if (!projectId || !suiteId || !runId) {
            setLoading(false)
            setError('Missing project/suite/run id in URL.')
            return
        }

        try {
            setLoading(true)
            setError(null)

            const res = await fetch(
                `/api/projects/${projectId}/testsuites/${suiteId}/runs/${runId}`,
            )

            if (!res.ok) throw new Error(`Status ${res.status}`)
            const json = await res.json()

            setRun(json)

            const map: Record<number, RunResult> = {}
            json.results.forEach((r: RunResult) => {
                map[r.id] = { ...r }
            })
            setEditingResults(map)
        } catch (err: any) {
            setError(err.message ?? 'Unknown error')
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        loadRun()
    }, [projectId, suiteId, runId])


    useEffect(() => {
        if (tab !== 'overview' || !runId) {
            setOverview(null)
            return
        }

        loadOverview(runId)
            .then(setOverview)
            .catch((e) => setError(e?.message ?? 'Unknown error'))
    }, [tab, runId])




    const updateLocalResult = (id: number, patch: Partial<RunResult>) => {
        setEditingResults((prev) => ({
            ...prev,
            [id]: { ...prev[id], ...patch },
        }))
    }

    const saveResult = async (resultId: number) => {
        if (!projectId || !suiteId || !runId) return
        const current = editingResults[resultId]
        if (!current) return

        try {
            const res = await fetch(
                `/api/projects/${projectId}/testsuites/${suiteId}/runs/${runId}/results/${resultId}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        result: current.result,
                        comment: current.comment,
                        executedBy: current.executedBy,
                    }),
                },
            )
            if (!res.ok) throw new Error(`Status ${res.status}`)
            await loadRun() // refresh run + timestamps
            if (tab === 'overview') await loadOverview()
        } catch (err: any) {
            alert('Error saving result: ' + (err.message ?? 'Unknown error'))
        }
    }

    if (!projectId || !suiteId || !runId) {
        return <p>Missing project/suite/run id in URL.</p>
    }

    if (loading) {
        return <p>Loading run…</p>
    }

    if (error) {
        return <p style={{ color: 'red' }}>Error: {error}</p>
    }

    if (!run) {
        return <p>Run not found.</p>
    }

    return (
        <div className="projects-container">
            <div className="column">
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 12,
                    }}
                >
                    <button
                        type="button"
                        className="primary-button"
                        onClick={() => navigate(-1)}
                    >
                        ← Back
                    </button>
                </div>

                <h2>{run.name}</h2>

                {tab === 'overview' && (
                    <div className="run-overview-card" style={{ marginTop: 12, marginBottom: 12 }}>
                        <h3 style={{ marginTop: 0 }}>Overview</h3>

                        {!overview ? (
                            <p>Loading overview…</p>
                        ) : (
                            <ul>
                                <li><strong>Total:</strong> {overview.totalTests}</li>
                                <li><strong>Passed:</strong> {overview.passedCount}</li>
                                <li><strong>Failed:</strong> {overview.failedCount}</li>
                                <li><strong>Blocked:</strong> {overview.blockedCount}</li>
                                <li><strong>Not run:</strong> {overview.notRunCount}</li>
                                <li>
                                    <strong>Last executed:</strong>{' '}
                                    {overview.lastExecutedAt ? new Date(overview.lastExecutedAt).toLocaleString() : '—'}
                                </li>
                            </ul>
                        )}
                    </div>
                )}


                <p>
                    Created at {new Date(run.createdAt).toLocaleString()}
                    {run.createdBy ? ` by ${run.createdBy}` : ''}
                </p>

                {tab !== 'overview' && (
                    <>

                    <h3>Test cases in this run</h3>

                    {run.results.length === 0 && <p>No test cases in this suite.</p>}

                    <ul>
                        {run.results.map((r) => {
                            const edit = editingResults[r.id] || r
                            return (
                                <li key={r.id} className="run-case-card">
                                    <div className="run-case-title">{r.testCase?.title}</div>

                                    <div className="run-case-meta">
                                        <div><strong>Steps:</strong> {r.testCase?.steps || '(none)'}</div>
                                        <div><strong>Expected:</strong> {r.testCase?.expectedResult || '(none)'}</div>
                                    </div>

                                    <label className="run-case-label">Result</label>
                                    <select
                                        className="run-case-field"
                                        value={edit.result}
                                        onChange={(e) => updateLocalResult(r.id, { result: e.target.value })}
                                    >
                                        <option value="NotRun">Not run</option>
                                        <option value="Passed">Passed</option>
                                        <option value="Failed">Failed</option>
                                        <option value="Blocked">Blocked</option>
                                    </select>

                                    <label className="run-case-label">Comment</label>
                                    <textarea
                                        className="run-case-field"
                                        rows={2}
                                        value={edit.comment ?? ''}
                                        onChange={(e) => updateLocalResult(r.id, { comment: e.target.value })}
                                    />

                                    <label className="run-case-label">Executed by</label>
                                    <input
                                        className="run-case-field"
                                        value={edit.executedBy ?? ''}
                                        onChange={(e) => updateLocalResult(r.id, { executedBy: e.target.value })}
                                    />

                                    {r.executedAt && (
                                        <div className="run-case-meta">
                                            <small>Last updated at {new Date(r.executedAt).toLocaleString()}</small>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        className="primary-button run-save-button"
                                        onClick={() => saveResult(r.id)}
                                    >
                                        Save
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                    </>
                )}
            </div>
        </div>
    )
}

export default RunDetailPage
