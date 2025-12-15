using ManualTestSuite.Server.Context;
using ManualTestSuite.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ManualTestSuite.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ProjectsController(AppDbContext db)
        {
            _db = db;
        }

        // GET: /api/projects
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetAll()
        {
            var projects = await _db.Projects
                .OrderBy(p => p.Id)
                .ToListAsync();

            return Ok(projects);
        }

        // GET: /api/projects/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Project>> GetProjectById(int id)
        {
            var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == id);
            if (project == null) return NotFound($"Project {id} not found");
            return Ok(project);
        }


        // POST: /api/projects
        [HttpPost]
        public async Task<ActionResult<Project>> Create(Project project)
        {
            project.CreatedAt = DateTime.UtcNow;
            _db.Projects.Add(project);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = project.Id }, project);
        }
    }
}
