using ManualTestSuite.Server.Context;
using ManualTestSuite.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ManualTestSuite.Server.Controllers
{
    [ApiController]
    [Route("api/projects/{projectId:int}/testsuites/{suiteId:int}/testcases/{caseId:int}/[controller]")]
    public class TestRunsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public TestRunsController(AppDbContext db)
        {
            _db = db;
        }

        // GET: /api/projects/{projectId}/testsuites/{suiteId}/testcases/{caseId}/testruns
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TestRun>>> GetByCase(
            int projectId,
            int suiteId,
            int caseId)
        {
            var testCase = await _db.TestCases
                .Include(c => c.TestSuite)
                .ThenInclude(s => s.Project)
                .FirstOrDefaultAsync(c =>
                    c.Id == caseId &&
                    c.TestSuiteId == suiteId &&
                    c.TestSuite!.ProjectId == projectId);

            if (testCase == null)
            {
                return NotFound($"Test case {caseId} not found for suite {suiteId}, project {projectId}");
            }

            var runs = await _db.TestRuns
                .Where(r => r.TestCaseId == caseId)
                .OrderByDescending(r => r.ExecutedAt)
                .ToListAsync();

            return Ok(runs);
        }

        // POST: /api/projects/{projectId}/testsuites/{suiteId}/testcases/{caseId}/testruns
        [HttpPost]
        public async Task<ActionResult<TestRun>> Create(
            int projectId,
            int suiteId,
            int caseId,
            TestRun run)
        {
            var testCase = await _db.TestCases
                .Include(c => c.TestSuite)
                .FirstOrDefaultAsync(c =>
                    c.Id == caseId &&
                    c.TestSuiteId == suiteId &&
                    c.TestSuite!.ProjectId == projectId);

            if (testCase == null)
            {
                return NotFound($"Test case {caseId} not found for suite {suiteId}, project {projectId}");
            }

            run.TestCaseId = caseId;
            if (run.ExecutedAt == default)
            {
                run.ExecutedAt = DateTime.UtcNow;
            }
            if (string.IsNullOrEmpty(run.Result))
            {
                run.Result = "NotRun";
            }

            _db.TestRuns.Add(run);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetByCase),
                new { projectId, suiteId, caseId }, run);
        }
    }
}
