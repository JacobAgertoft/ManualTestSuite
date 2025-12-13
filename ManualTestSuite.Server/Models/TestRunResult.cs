namespace ManualTestSuite.Server.Models
{
    public class TestRunResult
    {
        public int Id { get; set; }

        public int TestRunId { get; set; }
        public TestRun? TestRun { get; set; }

        public int TestCaseId { get; set; }
        public TestCase? TestCase { get; set; }

        public string Result { get; set; } = "NotRun";   // Passed / Failed / Blocked / NotRun
        public string? Comment { get; set; }
        public string? ExecutedBy { get; set; }
        public DateTime? ExecutedAt { get; set; }
    }
}
