import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../Projects.css'
import Modal from '../components/Modal'

type Project = {
    id: number
    name: string
    description?: string
}

const ProjectsPage = () => {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isProjectModalOpen, setProjectModalOpen] = useState(false)

    const loadProjects = async () => {
        try {
            setLoading(true)
            setError(null)
            const res = await fetch('/api/projects')
            if (!res.ok) throw new Error(`Status ${res.status}`)
            const json = await res.json()
            setProjects(json)
        } catch (err: any) {
            setError(err.message ?? 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadProjects()
    }, [])

    const onCreateProject = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description }),
            })
            if (!res.ok) throw new Error(`Status ${res.status}`)
            setName('')
            setDescription('')
            setProjectModalOpen(false)
            await loadProjects()
        } catch (err: any) {
            alert('Error creating project: ' + (err.message ?? 'Unknown error'))
        }
    }

    return (
        <div className="projects-container">
            <div className="column">
                <div className="column-header">
                    <h1>Projects</h1>
                    <div className="column-header-actions">
                        <button
                            type="button"
                            className="primary-button"
                            onClick={() => setProjectModalOpen(true)}
                        >
                            + Add Project
                        </button>
                    </div>
                </div>

                {loading && <p>Loading projects…</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}

                <ul>
                    {projects.map((p) => (
                        <li key={p.id}>
                            <strong>{p.name}</strong>{' '}
                            {p.description && <span>- {p.description}</span>}
                            <div>
                                <Link to={`/projects/${p.id}/suites`}>View suites</Link>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <Modal
                isOpen={isProjectModalOpen}
                title="Add Project"
                onClose={() => setProjectModalOpen(false)}
            >
                <form onSubmit={onCreateProject}>
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

export default ProjectsPage
