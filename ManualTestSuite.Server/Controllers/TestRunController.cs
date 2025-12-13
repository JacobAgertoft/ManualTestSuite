using ManualTestSuite.Server.Context;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

[ApiController]
[Route("api/test-runs")]
public class TestRunController : ControllerBase
{
    private readonly AppDbContext _db;
    public TestRunController(AppDbContext db) => _db = db;

    [HttpGet("overview")]
    public async Task<ActionResult<List<TestRunOverviewDto>>> GetOverview(
        [FromQuery] int? runId,
        [FromQuery] int? testSuiteId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (page < 1) page = 1;
        if (pageSize is < 1 or > 200) pageSize = 20;

        var q = _db.TestRuns
            .AsNoTracking()
            .Include(r => r.TestSuite)
            .AsQueryable();

        if (runId.HasValue)
            q = q.Where(r => r.Id == runId.Value);

        if (testSuiteId.HasValue)
            q = q.Where(r => r.TestSuiteId == testSuiteId.Value);

        var items = await q
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new TestRunOverviewDto
            {
                Id = r.Id,
                TestSuiteId = r.TestSuiteId,
                TestSuiteName = r.TestSuite != null ? r.TestSuite.Name : "",

                Name = r.Name,
                CreatedAt = r.CreatedAt,
                CreatedBy = r.CreatedBy,

                TotalTests = r.Results.Count(),
                PassedCount = r.Results.Count(x => x.Result == "Passed"),
                FailedCount = r.Results.Count(x => x.Result == "Failed"),
                BlockedCount = r.Results.Count(x => x.Result == "Blocked"),
                NotRunCount = r.Results.Count(x => x.Result == "NotRun"),

                LastExecutedAt = r.Results.Max(x => x.ExecutedAt)
            })
            .ToListAsync();

        return Ok(items);
    }
}
