using ManualTestSuite.Server.Context;
using ManualTestSuite.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ManualTestSuite.Server.Controllers
{
    [ApiController]
    [Route("api/projects/{projectId:int}/[controller]")]
    public class TestSuitesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public TestSuitesController(AppDbContext db)
        {
            _db = db;
        }

        // GET: /api/projects/{projectId}/testsuites
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TestSuite>>> GetByProject(int projectId)
        {
            var exists = await _db.Projects.AnyAsync(p => p.Id == projectId);
            if (!exists)
            {
                return NotFound($"Project {projectId} not found");
            }

            var suites = await _db.TestSuites
                .Where(s => s.ProjectId == projectId)
                .OrderBy(s => s.Id)
                .ToListAsync();

            return Ok(suites);
        }

        // POST: /api/projects/{projectId}/testsuites
        [HttpPost]
        public async Task<ActionResult<TestSuite>> Create(int projectId, TestSuite suite)
        {
            var project = await _db.Projects.FindAsync(projectId);
            if (project == null)
            {
                return NotFound($"Project {projectId} not found");
            }

            suite.ProjectId = projectId;
            suite.CreatedAt = DateTime.UtcNow;

            _db.TestSuites.Add(suite);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetByProject),
                new { projectId = projectId }, suite);
        }
    }
}
