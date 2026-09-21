import connectDB from "../lib/db";
import { Board, Column, JobApplication } from "../lib/models";

// Read from env — required
const USER_ID = process.env.SEED_USER_ID;

const SAMPLE_JOBS = [
  // ... keep your exact same data array here, unchanged ...
];

async function seed() {
  // ✅ Real validation now
  if (!USER_ID) {
    console.error("❌ SEED_USER_ID env variable is required.");
    console.error("   Usage: SEED_USER_ID=<user-id> npm run seed:jobs");
    process.exit(1);
  }

  try {
    console.log("🌱 Starting seed process...");
    console.log(`📋 Seeding data for user ID: ${USER_ID}`);

    await connectDB();
    console.log("✅ Connected to database");

    // Find or create the board
    let board = await Board.findOne({ userId: USER_ID, name: "Job Hunt" });

    if (!board) {
      console.log("⚠️  Board not found. Creating board...");
      const { initializeUserBoard } = await import("../lib/init-user-board");
      board = await initializeUserBoard(USER_ID);
      console.log("✅ Board created");
    } else {
      console.log("✅ Board found");
    }

    const columns = await Column.find({ boardId: board._id }).sort({ order: 1 });
    console.log(`✅ Found ${columns.length} columns`);

    if (columns.length === 0) {
      console.error("❌ No columns found. Aborting.");
      process.exit(1);
    }

    const columnMap: Record<string, string> = {};
    columns.forEach((col) => {
      columnMap[col.name] = col._id.toString();
    });

    // Cleanup existing
    const existingJobs = await JobApplication.find({ userId: USER_ID });
    if (existingJobs.length > 0) {
      console.log(`🗑️  Deleting ${existingJobs.length} existing job applications...`);
      await JobApplication.deleteMany({ userId: USER_ID });
      await Column.updateMany(
        { boardId: board._id },
        { $set: { jobApplications: [] } }
      );
    }

    const jobsByColumn: Record<string, typeof SAMPLE_JOBS> = {
      "Wish List": SAMPLE_JOBS.slice(0, 3),
      Applied: SAMPLE_JOBS.slice(3, 7),
      Interviewing: SAMPLE_JOBS.slice(7, 10),
      Offer: SAMPLE_JOBS.slice(10, 12),
      Rejected: SAMPLE_JOBS.slice(12, 15),
    };

    // ✅ BATCH INSERT (one round trip)
    const applicationsToCreate: any[] = [];
    for (const [columnName, jobs] of Object.entries(jobsByColumn)) {
      const columnId = columnMap[columnName];
      if (!columnId) {
        console.warn(`⚠️  Column "${columnName}" not found, skipping...`);
        continue;
      }
      jobs.forEach((jobData, i) => {
        applicationsToCreate.push({
          company: jobData.company,
          position: jobData.position,
          location: jobData.location,
          tags: jobData.tags,
          description: jobData.description,
          jobUrl: jobData.jobUrl,
          salary: jobData.salary,
          columnId,
          boardId: board._id,
          userId: USER_ID,
          status: columnName.toLowerCase().replace(/\s+/g, "-"),
          order: i * 100, // ✅ consistent with server strategy
        });
      });
    }

    const createdApplications = await JobApplication.insertMany(applicationsToCreate);

    // Attach references back to columns (bulk)
    await Promise.all(
      columns.map(async (col) => {
        const ids = createdApplications
          .filter((app) => app.columnId.toString() === col._id.toString())
          .map((app) => app._id);
        if (ids.length) {
          await Column.findByIdAndUpdate(col._id, {
            $set: { jobApplications: ids },
          });
        }
      })
    );

    console.log(`\n🎉 Seed completed successfully!`);
    console.log(`📊 Created ${createdApplications.length} job applications`);
    console.log(`📋 Board: ${board.name}`);
    console.log(`👤 User ID: ${USER_ID}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();