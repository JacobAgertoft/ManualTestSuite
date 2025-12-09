namespace ManualTestSuite.Server.Models
{
    public class TestRun
    {
        public int Id { get; set; }

        public int TestCaseId { get; set; }
        public TestCase? TestCase { get; set; }

        public DateTime ExecutedAt { get; set; } = DateTime.UtcNow;

        // e.g. "Passed", "Failed", "Blocked"
        public string Result { get; set; } = "NotRun";

        public string? Comment { get; set; }

        public string? ExecutedBy { get; set; } // optional
    }
}
