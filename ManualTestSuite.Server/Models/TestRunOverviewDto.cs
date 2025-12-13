public sealed class TestRunOverviewDto
{
    public int Id { get; init; }

    public int TestSuiteId { get; init; }
    public string TestSuiteName { get; init; } = "";

    public string Name { get; init; } = "";
    public DateTime CreatedAt { get; init; }
    public string? CreatedBy { get; init; }

    public DateTime? LastExecutedAt { get; init; }

    public int TotalTests { get; init; }
    public int PassedCount { get; init; }
    public int FailedCount { get; init; }
    public int BlockedCount { get; init; }
    public int NotRunCount { get; init; }
}
