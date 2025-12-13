using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ManualTestSuite.Server.Migrations
{
    /// <inheritdoc />
    public partial class TestRunOverview : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TestRuns_TestCases_TestCaseId",
                table: "TestRuns");

            migrationBuilder.DropColumn(
                name: "Comment",
                table: "TestRuns");

            migrationBuilder.RenameColumn(
                name: "TestCaseId",
                table: "TestRuns",
                newName: "TestSuiteId");

            migrationBuilder.RenameColumn(
                name: "Result",
                table: "TestRuns",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "ExecutedBy",
                table: "TestRuns",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "ExecutedAt",
                table: "TestRuns",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "IX_TestRuns_TestCaseId",
                table: "TestRuns",
                newName: "IX_TestRuns_TestSuiteId");

            migrationBuilder.CreateTable(
                name: "TestRunResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TestRunId = table.Column<int>(type: "INTEGER", nullable: false),
                    TestCaseId = table.Column<int>(type: "INTEGER", nullable: false),
                    Result = table.Column<string>(type: "TEXT", nullable: false),
                    Comment = table.Column<string>(type: "TEXT", nullable: true),
                    ExecutedBy = table.Column<string>(type: "TEXT", nullable: true),
                    ExecutedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TestRunResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TestRunResults_TestCases_TestCaseId",
                        column: x => x.TestCaseId,
                        principalTable: "TestCases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TestRunResults_TestRuns_TestRunId",
                        column: x => x.TestRunId,
                        principalTable: "TestRuns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TestRunResults_TestCaseId",
                table: "TestRunResults",
                column: "TestCaseId");

            migrationBuilder.CreateIndex(
                name: "IX_TestRunResults_TestRunId",
                table: "TestRunResults",
                column: "TestRunId");

            migrationBuilder.AddForeignKey(
                name: "FK_TestRuns_TestSuites_TestSuiteId",
                table: "TestRuns",
                column: "TestSuiteId",
                principalTable: "TestSuites",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TestRuns_TestSuites_TestSuiteId",
                table: "TestRuns");

            migrationBuilder.DropTable(
                name: "TestRunResults");

            migrationBuilder.RenameColumn(
                name: "TestSuiteId",
                table: "TestRuns",
                newName: "TestCaseId");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "TestRuns",
                newName: "Result");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "TestRuns",
                newName: "ExecutedBy");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "TestRuns",
                newName: "ExecutedAt");

            migrationBuilder.RenameIndex(
                name: "IX_TestRuns_TestSuiteId",
                table: "TestRuns",
                newName: "IX_TestRuns_TestCaseId");

            migrationBuilder.AddColumn<string>(
                name: "Comment",
                table: "TestRuns",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_TestRuns_TestCases_TestCaseId",
                table: "TestRuns",
                column: "TestCaseId",
                principalTable: "TestCases",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
