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
    }
}
