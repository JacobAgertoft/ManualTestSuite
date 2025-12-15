import { useEffect, useState, type FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import '../Projects.css'
import Modal from '../components/Modal'

type TestRun = {
    id: number
    name: string
    createdAt: string
    createdBy?: string
}

const SuiteRunsPage = () => {
    const { projectId, suiteId } = useParams()
    const navigate = useNavigate()

    const [suiteName, setSuiteName] = useState<string | null>(null)
    const [runs, setRuns] = useState<TestRun[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [name, setName] = useState('')
    const [createdBy, setCreatedBy] = useState('')
    const [isRunModalOpen, setRunModalOpen] = useState(false)

    const loadRuns = async () => {
        if (!projectId || !suiteId) return
        try {
            setLoading(true)
            setError(null)
            const res = await fetch(
                `/api/projects/${projectId}/testsuites/${suiteId}/runs`,
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

    const loadSuiteName = async () => {
        if (!projectId || !suiteId) return

        try {
            const res = await fetch(`/api/projects/${projectId}/testsuites`)
            if (!res.ok) throw new Error(`Status ${res.status}`)
            const suites = await res.json()

            const match = suites.find((s: any) => String(s.id) === String(suiteId))
            setSuiteName(match?.name ?? '')
        } catch {
            setSuiteName('')
        }
    }

    useEffect(() => {
        loadRuns()
        loadSuiteName()
    }, [projectId, suiteId])

    const onCreateRun = async (e: FormEvent) => {
        e.preventDefault()
        if (!projectId || !suiteId) return
        try {
            const res = await fetch(
                `/api/projects/${projectId}/testsuites/${suiteId}/runs`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, createdBy }),
                },
            )
            if (!res.ok) throw new Error(`Status ${res.status}`)
            setName('')
            // keep createdBy if you like
            await loadRuns()
            setRunModalOpen(false)
        } catch (err: any) {
            alert('Error creating run: ' + (err.message ?? 'Unknown error'))
        }
    }

    if (!projectId || !suiteId) {
        return <p>Missing project or suite id in URL.</p>
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
                    <button
                        type="button"
                        className="primary-button"
                        onClick={() => setRunModalOpen(true)}
                    >
                        + New Run
                    </button>
                </div>

                <h2>
                    Test runs for {suiteName ?? `Suite ${suiteId}`}
                </h2>

                {loading && <p>Loading runs…</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}

                <ul>
                    {runs.map((r) => (
                        <li key={r.id}>
                            <strong>{r.name}</strong>
                            <div>
                                <small>
                                    Created at {new Date(r.createdAt).toLocaleString()}
                                    {r.createdBy ? ` by ${r.createdBy}` : ''}
                                </small>
                            </div>
                            <div className="run-actions">
                                <Link
                                    className="run-link"
                                    to={`/projects/${projectId}/suites/${suiteId}/runs/${r.id}`}
                                >
                                    Open run
                                </Link>
                            </div>
                            <div>
                                <Link to={`/projects/${projectId}/suites/${suiteId}/runs/${r.id}?tab=overview`}>
                                    Overview
                                </Link>

                            </div>

                        </li>
                    ))}
                </ul>
            </div>

            <Modal
                isOpen={isRunModalOpen}
                title="Start New Run"
                onClose={() => setRunModalOpen(false)}
            >
                <form onSubmit={onCreateRun}>
                    <div>
                        <label>
                            Name
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Regression 2025-01-12"
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Created by
                            <input
                                value={createdBy}
                                onChange={(e) => setCreatedBy(e.target.value)}
                            />
                        </label>
                    </div>
                    <button type="submit" className="primary-button">
                        Create run
                    </button>
                </form>
            </Modal>
        </div>
    )
}

export default SuiteRunsPage
