namespace ManualTestSuite.Server.Models
{
    public class Project
    {
        public int Id { get; set; }         // PK
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}