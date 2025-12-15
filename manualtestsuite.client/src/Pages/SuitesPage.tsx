import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import '../Projects.css'
import Modal from '../components/Modal'

type TestSuite = {
    id: number
    name: string
    description?: string
}

const SuitesPage = () => {
    const { projectId } = useParams()
    const navigate = useNavigate()
    const [projectName, setProjectName] = useState<string | null>(null)
    const [suites, setSuites] = useState<TestSuite[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isSuiteModalOpen, setSuiteModalOpen] = useState(false)

    const loadSuites = async () => {
        if (!projectId) return
        try {
            setLoading(true)
            setError(null)
            const res = await fetch(`/api/projects/${projectId}/testsuites`)
            if (!res.ok) throw new Error(`Status ${res.status}`)
            const json = await res.json()
            setSuites(json)
        } catch (err: any) {
            setError(err.message ?? 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    const loadProjectName = async () => {
      if (!projectId) return

      try {
        const res = await fetch(`/api/projects/${projectId}`)
        if (!res.ok) throw new Error(`Status ${res.status}`)

        const project = await res.json()
        setProjectName(project.name ?? '')
      } catch {
        setProjectName('')
      }
    }

    useEffect(() => {
        loadSuites()
        loadProjectName()
    }, [projectId])

    const onCreateSuite = async (e: FormEvent) => {
        e.preventDefault()
        if (!projectId) return
        try {
            const res = await fetch(`/api/projects/${projectId}/testsuites`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description }),
            })
            if (!res.ok) throw new Error(`Status ${res.status}`)
            setName('')
            setDescription('')
            await loadSuites()
            setSuiteModalOpen(false)
        } catch (err: any) {
            alert('Error creating test suite: ' + (err.message ?? 'Unknown error'))
        }
    }

    if (!projectId) {
        return <p>Missing project id in URL.</p>
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
                        onClick={() => setSuiteModalOpen(true)}
                    >
                        + Add Test Suite
                    </button>
                </div>

                <h2>Test suites for {projectName ?? `Project ${projectId}`}</h2>

                {loading && <p>Loading suites…</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}

                <ul>
                    {suites.map((s) => (
                        <li key={s.id}>
                            <strong>{s.name}</strong>{' '}
                            {s.description && <span>- {s.description}</span>}
                            <div>
                                <Link to={`/projects/${projectId}/suites/${s.id}/cases`}>
                                    View test cases
                                </Link>
                            </div>
                            <div>
                                <Link to={`/projects/${projectId}/suites/${s.id}/runs`}>
                                    View runs
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>

            </div>

            <Modal
                isOpen={isSuiteModalOpen}
                title="Add Test Suite"
                onClose={() => setSuiteModalOpen(false)}
            >
                <form onSubmit={onCreateSuite}>
                    <div>
                        <label>
                            Name
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Description
                            <input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
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

export default SuitesPage
