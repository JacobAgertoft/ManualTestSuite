export async function fetchTestRunOverview(params: {
    suiteId?: number;
    status?: string;
    page?: number;
    pageSize?: number;
}) {
    const {
        suiteId,
        status,
        page = 1,
        pageSize = 20,
    } = params;

    const url =
        `/api/test-runs/overview` +
        `?suiteId=${suiteId ?? ""}` +
        `&status=${status ?? ""}` +
        `&page=${page}` +
        `&pageSize=${pageSize}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to load test runs");
    }

    return response.json();
}
