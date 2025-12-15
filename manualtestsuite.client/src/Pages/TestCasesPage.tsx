import { useEffect, useState, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
    const [isEditCaseModalOpen, setEditCaseModalOpen] = useState(false)

    const [editingCaseId, setEditingCaseId] = useState<number | null>(null)

    const loadCases = async () => {
        if (!projectId || !suiteId) return
        try {
            setLoading(true)
            setError(null)
            const res = await fetch(`/api/projects/${projectId}/testsuites/${suiteId}/testcases`)
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


    const openAddModal = () => {
        setEditingCaseId(null)
        setTitle('')
        setSteps('')
        setExpectedResult('')
        setCaseModalOpen(true)
    }

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

    const openEditModal = (tc: TestCase) => {
        setEditingCaseId(tc.id)
        setTitle(tc.title ?? '')
        setSteps(tc.steps ?? '')
        setExpectedResult(tc.expectedResult ?? '')
        setEditCaseModalOpen(true)
    }

    const onEditCase = async (e: FormEvent) => {
        e.preventDefault()
        if (!projectId || !suiteId || editingCaseId == null) return

        try {
            const res = await fetch(
                `/api/projects/${projectId}/testsuites/${suiteId}/testcases/${editingCaseId}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, steps, expectedResult }),
                },
            )
            if (!res.ok) throw new Error(`Status ${res.status}`)

            setEditingCaseId(null)
            setTitle('')
            setSteps('')
            setExpectedResult('')
            await loadCases()
            setEditCaseModalOpen(false)
        } catch (err: any) {
            alert('Error editing test case: ' + (err.message ?? 'Unknown error'))
        }
    }

    const onDeleteCase = async (id: number) => {
        if (!projectId || !suiteId) return

        const confirmed = window.confirm(
            'Are you sure you want to delete this test case?'
        )
        if (!confirmed) return

        try {
            const res = await fetch(
                `/api/projects/${projectId}/testsuites/${suiteId}/testcases/${id}`,
                { method: 'DELETE' },
            )

            if (!res.ok) throw new Error(`Status ${res.status}`)

            // reload list after delete
            await loadCases()
        } catch (err: any) {
            alert('Error deleting test case: ' + (err.message ?? 'Unknown error'))
        }
    }


    if (!projectId || !suiteId) return <p>Missing project or suite id in URL.</p>

    return (
        <div className="projects-container">
            <div className="column">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <button type="button" className="primary-button" onClick={() => navigate(-1)}>
                        ← Back
                    </button>
                    <button type="button" className="primary-button" onClick={() => {
                        openAddModal()
                    }}>
                        + Add Test Case
                    </button>
                </div>

                <h2>Test Cases for project {projectId}, suite {suiteId}</h2>

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
                            <div><small>Steps: {c.steps || '(none)'}</small></div>
                            <div><small>Expected: {c.expectedResult || '(none)'}</small></div>
                            <div>
                                <button type="button" onClick={() => openEditModal(c)}>
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDeleteCase(c.id)}
                                    style={{ marginLeft: 8, color: 'red' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Add modal unchanged */}
            <Modal
                isOpen={isCaseModalOpen}
                title="Add Test Case"
                onClose={() => {
                    setCaseModalOpen(false)
                }}
            >
                <form onSubmit={onCreateCase}>
                    <div>
                        <label>
                            Title
                            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </label>
                    </div>
                    <div>
                        <label>
                            Steps
                            <textarea value={steps} onChange={(e) => setSteps(e.target.value)} rows={3} />
                        </label>
                    </div>
                    <div>
                        <label>
                            Expected result
                            <textarea value={expectedResult} onChange={(e) => setExpectedResult(e.target.value)} rows={2} />
                        </label>
                    </div>
                    <button type="submit" className="primary-button">Save</button>
                </form>
            </Modal>

            {/* Edit modal uses onEditCase */}
            <Modal
                isOpen={isEditCaseModalOpen}
                title="Edit Test Case"
                onClose={() => {
                    setEditCaseModalOpen(false)
                }}
            >
                <form onSubmit={onEditCase}>
                    <div>
                        <label>
                            Title
                            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </label>
                    </div>
                    <div>
                        <label>
                            Steps
                            <textarea value={steps} onChange={(e) => setSteps(e.target.value)} rows={3} />
                        </label>
                    </div>
                    <div>
                        <label>
                            Expected result
                            <textarea value={expectedResult} onChange={(e) => setExpectedResult(e.target.value)} rows={2} />
                        </label>
                    </div>
                    <button type="submit" className="primary-button">Save</button>
                </form>
            </Modal>
        </div>
    )
}

export default TestCasesPage
