using ManualTestSuite.Server.Context;
using ManualTestSuite.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ManualTestSuite.Server.Controllers
{
    [ApiController]
    [Route("api/projects/{projectId:int}/testsuites/{suiteId:int}/[controller]")]
    public class TestCasesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public TestCasesController(AppDbContext db)
        {
            _db = db;
        }

        // GET: /api/projects/{projectId}/testsuites/{suiteId}/testcases
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TestCase>>> GetBySuite(int projectId, int suiteId)
        {
            var suite = await _db.TestSuites
                .Include(s => s.Project)
                .FirstOrDefaultAsync(s => s.Id == suiteId && s.ProjectId == projectId);

            if (suite == null)
            {
                return NotFound($"Test suite {suiteId} for project {projectId} not found");
            }

            var cases = await _db.TestCases
                .Where(c => c.TestSuiteId == suiteId)
                .OrderBy(c => c.Id)
                .ToListAsync();

            return Ok(cases);
        }

        // POST: /api/projects/{projectId}/testsuites/{suiteId}/testcases
        [HttpPost]
        public async Task<ActionResult<TestCase>> Create(int projectId, int suiteId, TestCase testCase)
        {
            var suite = await _db.TestSuites
                .FirstOrDefaultAsync(s => s.Id == suiteId && s.ProjectId == projectId);

            if (suite == null)
            {
                return NotFound($"Test suite {suiteId} for project {projectId} not found");
            }

            testCase.TestSuiteId = suiteId;
            if (string.IsNullOrEmpty(testCase.Status))
            {
                testCase.Status = "NotRun";
            }

            _db.TestCases.Add(testCase);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBySuite),
                new { projectId = projectId, suiteId = suiteId }, testCase);
        }

        // PUT: /api/projects/{projectId}/testsuites/{suiteId}/testcases/{testCaseId}
        [HttpPut("{testCaseId}")]
        public async Task<ActionResult<TestCase>> Edit(
            int projectId,
            int suiteId,
            int testCaseId,
            [FromBody] TestCase edited)
        {
            var suiteExists = await _db.TestSuites
                .AnyAsync(s => s.Id == suiteId && s.ProjectId == projectId);

            if (!suiteExists)
                return NotFound($"Test suite {suiteId} for project {projectId} not found");

            var testCase = await _db.TestCases
                .FirstOrDefaultAsync(c => c.Id == testCaseId && c.TestSuiteId == suiteId);

            if (testCase == null)
                return NotFound($"Test case {testCaseId} not found in suite {suiteId}");

            // Update fields (don’t replace the row)
            testCase.Title = edited.Title;
            testCase.Steps = edited.Steps;
            testCase.ExpectedResult = edited.ExpectedResult;

            // Preserve existing status if none provided, otherwise update it
            if (!string.IsNullOrWhiteSpace(edited.Status))
                testCase.Status = edited.Status;
            else if (string.IsNullOrWhiteSpace(testCase.Status))
                testCase.Status = "NotRun";

            await _db.SaveChangesAsync();

            return Ok(testCase);
        }

        // DELETE: /api/projects/{projectId}/testsuites/{suiteId}/testcases/{testCaseId}
        [HttpDelete("{testCaseId:int}")]
        public async Task<IActionResult> Delete(
            int projectId,
            int suiteId,
            int testCaseId)
        {
            var testCase = await _db.TestCases
                .FirstOrDefaultAsync(tc =>
                    tc.Id == testCaseId &&
                    tc.TestSuiteId == suiteId);

            if (testCase == null)
                return NotFound($"Test case {testCaseId} not found in suite {suiteId}");

            _db.TestCases.Remove(testCase);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
