import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import '../Projects.css'
import Modal from '../components/Modal'

type TestCase = {
    id: number
    title: string
    steps?: string
    expectedResult?: string
    status?: string
}

const TestCasesPage = () => {
    const { projectId, suiteId } = useParams()
    const navigate = useNavigate()

    const [cases, setCases] = useState<TestCase[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [title, setTitle] = useState('')
    const [steps, setSteps] = useState('')
    const [expectedResult, setExpectedResult] = useState('')
    const [isCaseModalOpen, setCaseModalOpen] = useState(false)

    const loadCases = async () => {
        if (!projectId || !suiteId) return
        try {
            setLoading(true)
            setError(null)
            const res = await fetch(
                `/api/projects/${projectId}/testsuites/${suiteId}/testcases`,
            )
            if (!res.ok) throw new Error(`Status ${res.status}`)
            const json = await res.json()
            setCases(json)
        } catch (err: any) {
            setError(err.message ?? 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCases()
    }, [projectId, suiteId])

    const onCreateCase = async (e: FormEvent) => {
        e.preventDefault()
        if (!projectId || !suiteId) return
        try {
            const res = await fetch(
                `/api/projects/${projectId}/testsuites/${suiteId}/testcases`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, steps, expectedResult }),
                },
            )
            if (!res.ok) throw new Error(`Status ${res.status}`)
            setTitle('')
            setSteps('')
            setExpectedResult('')
            await loadCases()
            setCaseModalOpen(false)
        } catch (err: any) {
            alert('Error creating test case: ' + (err.message ?? 'Unknown error'))
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
                        onClick={() => setCaseModalOpen(true)}
                    >
                        + Add Test Case
                    </button>
                </div>

                <h2>
                    Test Cases for project {projectId}, suite {suiteId}
                </h2>

                {loading && <p>Loading test cases…</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}

                <ul>
                    {cases.map((c) => (
                        <li key={c.id}>
                            <strong>{c.title}</strong>{' '}
                            {c.status && c.status !== 'NotRun' && (
                                <span className={`status-${c.status.toLowerCase()}`}>
                                    ({c.status})
                                </span>
                            )}
                            <div>
                                <small>Steps: {c.steps || '(none)'}</small>
                            </div>
                            <div>
                                <small>Expected: {c.expectedResult || '(none)'}</small>
                            </div>
                        </li>
                    ))}
                </ul>

            </div>

            <Modal
                isOpen={isCaseModalOpen}
                title="Add Test Case"
                onClose={() => setCaseModalOpen(false)}
            >
                <form onSubmit={onCreateCase}>
                    <div>
                        <label>
                            Title
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Steps
                            <textarea
                                value={steps}
                                onChange={(e) => setSteps(e.target.value)}
                                rows={3}
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Expected result
                            <textarea
                                value={expectedResult}
                                onChange={(e) => setExpectedResult(e.target.value)}
                                rows={2}
                            />
                        </label>
                    </div>
                    <button type="submit" className="primary-button">
                        Save
                    </button>
                </form>
            </Modal>
        </div>
    )
}

export default TestCasesPage
