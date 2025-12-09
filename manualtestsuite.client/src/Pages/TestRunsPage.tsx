import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../Projects.css'

type TestRun = {
    id: number
    executedAt: string
    result: string
    comment?: string
    executedBy?: string
}

const TestRunsPage = () => {
    const { projectId, suiteId, caseId } = useParams()
    const navigate = useNavigate()

    const [runs, setRuns] = useState<TestRun[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [result, setResult] = useState('Passed')
    const [comment, setComment] = useState('')
    const [executedBy, setExecutedBy] = useState('')

    const loadRuns = async () => {
        if (!projectId || !suiteId || !caseId) return
        try {
            setLoading(true)
            setError(null)
            const res = await fetch(
                `/api/projects/${projectId}/testsuites/${suiteId}/testcases/${caseId}/testruns`,
            )
            if (!res.ok) throw new Error(`Status ${res.status}`)
            const json = await res.json()
            setRuns(json)
        } catch (err: any) {
            setError(err.message ?? 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadRuns()
    }, [projectId, suiteId, caseId])

    const onCreateRun = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!projectId || !suiteId || !caseId) return
        try {
            const res = await fetch(
                `/api/projects/${projectId}/testsuites/${suiteId}/testcases/${caseId}/testruns`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ result, comment, executedBy }),
                },
            )
            if (!res.ok) throw new Error(`Status ${res.status}`)
            setComment('')
            await loadRuns()
        } catch (err: any) {
            alert('Error creating test run: ' + (err.message ?? 'Unknown error'))
        }
    }

    if (!projectId || !suiteId || !caseId) {
        return <p>Missing project/suite/case id in URL.</p>
    }

    return (
        <div className="projects-container">
            <div className="column">
                <button className="primary-button"  onClick={() => navigate(-1)}>← Back</button>
                <h2>
                    Test Runs for project {projectId}, suite {suiteId}, case {caseId}
                </h2>

                <form onSubmit={onCreateRun}>
                    <div>
                        <label>
                            Result
                            <select
                                value={result}
                                onChange={(e) => setResult(e.target.value)}
                            >
                                <option value="Passed">Passed</option>
                                <option value="Failed">Failed</option>
                                <option value="Blocked">Blocked</option>
                                <option value="NotRun">Not run</option>
                            </select>
                        </label>
                    </div>
                    <div>
                        <label>
                            Comment
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={2}
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Executed by
                            <input
                                value={executedBy}
                                onChange={(e) => setExecutedBy(e.target.value)}
                            />
                        </label>
                    </div>
                    <button type="submit" className="primary-button">Add Test Run</button>
                </form>

                {loading && <p>Loading runs…</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}

                <ul>
                    {runs.map((r) => (
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
            </div>
        </div>
    )
}

export default TestRunsPage
