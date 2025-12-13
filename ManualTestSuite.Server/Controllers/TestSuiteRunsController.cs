using ManualTestSuite.Server.Context;
using ManualTestSuite.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ManualTestSuite.Server.Controllers
{
    [ApiController]
    [Route("api/projects/{projectId:int}/testsuites/{suiteId:int}/runs")]
    public class TestSuiteRunsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public TestSuiteRunsController(AppDbContext db)
        {
            _db = db;
        }

        // GET: /api/projects/{projectId}/testsuites/{suiteId}/runs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TestRun>>> GetRuns(int projectId, int suiteId)
        {
            var suite = await _db.TestSuites
                .FirstOrDefaultAsync(s => s.Id == suiteId && s.ProjectId == projectId);

            if (suite == null)
            {
                return NotFound($"Suite {suiteId} for project {projectId} not found.");
            }

            var runs = await _db.TestRuns
                .Where(r => r.TestSuiteId == suiteId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(runs);
        }

        // POST: /api/projects/{projectId}/testsuites/{suiteId}/runs
        // body: { "name": "Optional name", "createdBy": "Jacob" }
        [HttpPost]
        public async Task<ActionResult<TestRun>> CreateRun(
            int projectId,
            int suiteId,
            [FromBody] TestRun input)
        {
            var suite = await _db.TestSuites
               .FirstOrDefaultAsync(s => s.Id == suiteId && s.ProjectId == projectId);

            if (suite == null)
            {
                return NotFound($"Suite {suiteId} for project {projectId} not found.");
            }

            // Create the run
            var run = new TestRun
            {
                TestSuiteId = suiteId,
                Name = string.IsNullOrWhiteSpace(input.Name)
                    ? $"Run {DateTime.UtcNow:yyyy-MM-dd HH:mm}"
                    : input.Name,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = input.CreatedBy
            };

            _db.TestRuns.Add(run);
            await _db.SaveChangesAsync(); // get run.Id

            // Get test cases in this suite
            var testCases = await _db.TestCases
                .Where(c => c.TestSuiteId == suiteId)
                .ToListAsync();

            // Create result rows, default NotRun
            foreach (var tc in testCases)
            {
                _db.TestRunResults.Add(new TestRunResult
                {
                    TestRunId = run.Id,
                    TestCaseId = tc.Id,
                    Result = "NotRun"
                });
            }

            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRunWithResults),
                new { projectId, suiteId, runId = run.Id }, run);
        }

        // GET: /api/projects/{projectId}/testsuites/{suiteId}/runs/{runId}
        [HttpGet("{runId:int}")]
        public async Task<ActionResult<TestRun>> GetRunWithResults(
            int projectId, int suiteId, int runId)
        {
            var run = await _db.TestRuns
                .Include(r => r.Results)
                    .ThenInclude(rr => rr.TestCase)
                .FirstOrDefaultAsync(r =>
                    r.Id == runId &&
                    r.TestSuiteId == suiteId &&
                    r.TestSuite!.ProjectId == projectId);

            if (run == null)
                return NotFound();

            return Ok(run);
        }
    }
}
