import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import '../Projects.css'

type TestSuite = {
    id: number
    name: string
    description?: string
}

const SuitesPage = () => {
    const { projectId } = useParams()
    const navigate = useNavigate()
    const [suites, setSuites] = useState<TestSuite[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

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

    useEffect(() => {
        loadSuites()
    }, [projectId])

    const onCreateSuite = async (e: React.FormEvent) => {
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
                <button className="primary-button" onClick={() => navigate(-1)}>← Back</button>
                <h2>Test Suites for project {projectId}</h2>

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
                    <button type="submit" className="primary-button">Add Test Suite</button>
                </form>

                {loading && <p>Loading suites…</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}

                <ul>
                    {suites.map((s) => (
                        <li key={s.id}>
                            <strong>{s.name}</strong>{' '}
                            {s.description && <span>- {s.description}</span>}
                            <div>
                                <Link
                                    to={`/projects/${projectId}/suites/${s.id}/cases`}
                                >
                                    View test cases
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default SuitesPage
