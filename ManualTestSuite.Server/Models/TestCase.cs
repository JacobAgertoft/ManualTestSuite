namespace ManualTestSuite.Server.Models
{
    public class TestCase
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string? Steps { get; set; }

        public string? ExpectedResult { get; set; }

        // Simple text status for now (e.g. "NotRun", "Passed", "Failed")
        public string Status { get; set; } = "NotRun";

        // FK to TestSuite
        public int TestSuiteId { get; set; }
        public TestSuite? TestSuite { get; set; }
    }
}
