import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../Projects.css";

type TestRunOverview = {
    id: number;
    name: string;
    testSuiteName: string;
    createdAt: string;
    lastExecutedAt?: string | null;

    totalTests: number;
    passedCount: number;
    failedCount: number;
    blockedCount: number;
    notRunCount: number;
};

export default function TestRunOverviewPage() {
    const { runId } = useParams();
    const navigate = useNavigate();

    const [run, setRun] = useState<TestRunOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!runId) return;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch(`/api/test-runs/overview?runId=${runId}`);
                if (!res.ok) throw new Error(`Status ${res.status}`);

                const list = await res.json();
                setRun(list[0] ?? null);
            } catch (e: any) {
                setError(e?.message ?? "Unknown error");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [runId]);

    if (!runId) return <p>Missing run id.</p>;
    if (loading) return <p>Loading run overview…</p>;
    if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
    if (!run) return <p>Run not found.</p>;

    return (
        <div className="projects-container">
            <div className="column">
                <button className="primary-button" onClick={() => navigate(-1)}>
                    ← Back
                </button>

                <h2>{run.name}</h2>
                <p>
                    <small>
                        Created {new Date(run.createdAt).toLocaleString()}
                    </small>
                </p>

                <ul>
                    <li>Total tests: {run.totalTests}</li>
                    <li>Passed: {run.passedCount}</li>
                    <li>Failed: {run.failedCount}</li>
                    <li>Blocked: {run.blockedCount}</li>
                    <li>Not run: {run.notRunCount}</li>
                </ul>
            </div>
        </div>
    );
}
