namespace ManualTestSuite.Server.Models
{
    public class TestRun
    {
        public int Id { get; set; }

        public int TestSuiteId { get; set; }
        public TestSuite? TestSuite { get; set; }

        public string Name { get; set; } = string.Empty; // e.g. "Run 1", "Smoke 2025-01-10"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }

        public ICollection<TestRunResult> Results { get; set; } = new List<TestRunResult>();
    }
}
