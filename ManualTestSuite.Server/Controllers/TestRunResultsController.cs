using ManualTestSuite.Server.Context;
using ManualTestSuite.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace ManualTestSuite.Server.Controllers
{
    [ApiController]
    [Route("api/projects/{projectId:int}/testsuites/{suiteId:int}/runs/{runId:int}/results")]
    public class TestRunResultsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public TestRunResultsController(AppDbContext db)
        {
            _db = db;
        }

        // GET all results for a run (if you don't use GetRunWithResults)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TestRunResult>>> GetResults(
            int projectId, int suiteId, int runId)
        {
            var run = await _db.TestRuns
                .Include(r => r.TestSuite)
                .FirstOrDefaultAsync(r => r.Id == runId && r.TestSuiteId == suiteId);

            if (run == null || run.TestSuite!.ProjectId != projectId)
                return NotFound();

            var results = await _db.TestRunResults
                .Include(r => r.TestCase)
                .Where(r => r.TestRunId == runId)
                .OrderBy(r => r.TestCase!.Id)
                .ToListAsync();

            return Ok(results);
        }

        // PATCH/PUT a single case's result within a run
        // body: { "result": "Passed", "comment": "ok", "executedBy": "Jacob" }
        [HttpPut("{resultId:int}")]
        public async Task<ActionResult> UpdateResult(
            int projectId, int suiteId, int runId, int resultId, [FromBody] TestRunResult input)
        {
            var result = await _db.TestRunResults
                .Include(r => r.TestRun)
                    .ThenInclude(tr => tr.TestSuite)
                .FirstOrDefaultAsync(r => r.Id == resultId && r.TestRunId == runId);

            if (result == null || result.TestRun!.TestSuiteId != suiteId ||
                result.TestRun.TestSuite!.ProjectId != projectId)
            {
                return NotFound();
            }

            result.Result = input.Result;
            result.Comment = input.Comment;
            result.ExecutedBy = input.ExecutedBy;
            result.ExecutedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
