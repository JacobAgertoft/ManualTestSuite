namespace ManualTestSuite.Server.Models
{
    public class TestSuite
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // FK to Project
        public int ProjectId { get; set; }
        public Project? Project { get; set; }
    }
}
