using Microsoft.EntityFrameworkCore;
using ManualTestSuite.Server.Models;

namespace ManualTestSuite.Server.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Project> Projects => Set<Project>();
        public DbSet<TestSuite> TestSuites => Set<TestSuite>();
        public DbSet<TestCase> TestCases => Set<TestCase>();
        public DbSet<TestRun> TestRuns => Set<TestRun>();
    }
}
