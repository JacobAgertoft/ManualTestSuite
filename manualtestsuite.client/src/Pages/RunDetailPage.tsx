import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

const RunDetailPage = () => {
    const { projectId, suiteId, runId } = useParams()
    const navigate = useNavigate()

    const [run, setRun] = useState<TestRun | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [editingResults, setEditingResults] = useState<Record<number, RunResult>>({})

    const loadRun = async () => {
        if (!projectId || !suiteId || !runId) return
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
                <p>
                    Created at {new Date(run.createdAt).toLocaleString()}
                    {run.createdBy ? ` by ${run.createdBy}` : ''}
                </p>

                <h3>Test cases in this run</h3>

                {run.results.length === 0 && <p>No test cases in this suite.</p>}

                <ul>
                    {run.results.map((r) => {
                        const edit = editingResults[r.id] || r
                        return (
                            <li key={r.id}>
                                <strong>{r.testCase?.title ?? 'Unnamed test case'}</strong>
                                <div>
                                    <small>Steps: {r.testCase?.steps || '(none)'}</small>
                                </div>
                                <div>
                                    <small>
                                        Expected: {r.testCase?.expectedResult || '(none)'}
                                    </small>
                                </div>

                                <div style={{ marginTop: 8 }}>
                                    <label>
                                        Result{' '}
                                        <select
                                            value={edit.result}
                                            onChange={(e) =>
                                                updateLocalResult(r.id, { result: e.target.value })
                                            }
                                        >
                                            <option value="NotRun">Not run</option>
                                            <option value="Passed">Passed</option>
                                            <option value="Failed">Failed</option>
                                            <option value="Blocked">Blocked</option>
                                        </select>
                                    </label>
                                </div>

                                <div>
                                    <label>
                                        Comment
                                        <textarea
                                            value={edit.comment ?? ''}
                                            onChange={(e) =>
                                                updateLocalResult(r.id, { comment: e.target.value })
                                            }
                                            rows={2}
                                        />
                                    </label>
                                </div>

                                <div>
                                    <label>
                                        Executed by
                                        <input
                                            value={edit.executedBy ?? ''}
                                            onChange={(e) =>
                                                updateLocalResult(r.id, {
                                                    executedBy: e.target.value,
                                                })
                                            }
                                        />
                                    </label>
                                </div>

                                {r.executedAt && (
                                    <div>
                                        <small>
                                            Last updated at{' '}
                                            {new Date(r.executedAt).toLocaleString()}
                                        </small>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className="primary-button"
                                    style={{ marginTop: 8 }}
                                    onClick={() => saveResult(r.id)}
                                >
                                    Save
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}

export default RunDetailPage
