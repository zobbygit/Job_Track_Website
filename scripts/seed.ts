import connectDB from "../lib/db";
import { Board, Column, JobApplication } from "../lib/models";

const USER_ID = process.env.SEED_USER_ID;

interface SampleJob {
  company: string;
  position: string;
  location: string;
  tags: string[];
  description: string;
  jobUrl: string;
  salary: string;
}

const SAMPLE_JOBS: SampleJob[] = [
  /* ------------------------------ WISH LIST (0-7) ------------------------------ */
  {
    company: "MU Company",
    position: "Software Developer",
    location: "San Francisco, CA",
    tags: ["React", "Tailwind", "High Pay"],
    description: "Build modern web applications using React and Tailwind CSS",
    jobUrl: "https://example.com/jobs/1",
    salary: "$120k - $150k",
  },
  {
    company: "Stripe",
    position: "Front End Developer",
    location: "Remote",
    tags: ["TypeScript", "React", "Next.js"],
    description: "Work on payment infrastructure frontend",
    jobUrl: "https://example.com/jobs/2",
    salary: "$130k - $160k",
  },
  {
    company: "Nutrishe",
    position: "QA Engineer",
    location: "New York, NY",
    tags: ["CIT", "Appium", "CI/CD"],
    description: "Ensure quality of mobile and web applications",
    jobUrl: "https://example.com/jobs/3",
    salary: "$90k - $110k",
  },
  {
    company: "Figma",
    position: "Product Designer",
    location: "San Francisco, CA",
    tags: ["Figma", "Design Systems", "Prototyping"],
    description: "Shape the future of collaborative design tooling",
    jobUrl: "https://example.com/jobs/16",
    salary: "$140k - $180k",
  },
  {
    company: "Linear",
    position: "Full Stack Engineer",
    location: "Remote",
    tags: ["React", "Node.js", "GraphQL"],
    description: "Build fast, keyboard-first productivity software",
    jobUrl: "https://example.com/jobs/17",
    salary: "$150k - $190k",
  },
  {
    company: "Raycast",
    position: "React Developer",
    location: "Remote",
    tags: ["React", "TypeScript", "macOS"],
    description: "Extend the fastest launcher on macOS",
    jobUrl: "https://example.com/jobs/18",
    salary: "$130k - $170k",
  },
  {
    company: "Vercel",
    position: "DX Engineer",
    location: "Remote",
    tags: ["Next.js", "TypeScript", "Docs"],
    description: "Improve developer experience for the frontend cloud",
    jobUrl: "https://example.com/jobs/19",
    salary: "$140k - $180k",
  },
  {
    company: "Notion",
    position: "Frontend Engineer",
    location: "San Francisco, CA",
    tags: ["React", "TypeScript", "Performance"],
    description: "Build collaborative docs and databases at scale",
    jobUrl: "https://example.com/jobs/20",
    salary: "$150k - $200k",
  },

  /* ------------------------------ APPLIED (8-17) ------------------------------- */
  {
    company: "LeaFood",
    position: "DevOps Engineer",
    location: "Austin, TX",
    tags: ["promQL", "Full-stack", "Docker"],
    description: "Manage infrastructure and deployment pipelines",
    jobUrl: "https://example.com/jobs/4",
    salary: "$110k - $140k",
  },
  {
    company: "Nomura",
    position: "Mobile Developer",
    location: "Tokyo, Japan",
    tags: ["React Native", "iOS", "Android"],
    description: "Develop mobile applications for financial services",
    jobUrl: "https://example.com/jobs/5",
    salary: "$100k - $130k",
  },
  {
    company: "Wise",
    position: "UI/UX Designer",
    location: "London, UK",
    tags: ["Figma", "Design Systems", "User Research"],
    description: "Design beautiful and intuitive user experiences",
    jobUrl: "https://example.com/jobs/6",
    salary: "$80k - $100k",
  },
  {
    company: "Danone",
    position: "DevOps Engineer",
    location: "Paris, France",
    tags: ["promQL", "Full-stack", "Docker"],
    description: "Support cloud infrastructure and CI/CD",
    jobUrl: "https://example.com/jobs/7",
    salary: "$95k - $120k",
  },
  {
    company: "Spotify",
    position: "Backend Engineer",
    location: "Stockholm, Sweden",
    tags: ["Java", "Kafka", "Microservices"],
    description: "Scale backend services powering music streaming for millions",
    jobUrl: "https://example.com/jobs/21",
    salary: "€90k - €120k",
  },
  {
    company: "Airbnb",
    position: "Full Stack Developer",
    location: "Remote",
    tags: ["React", "Node.js", "GraphQL"],
    description: "Build features for the global travel marketplace",
    jobUrl: "https://example.com/jobs/22",
    salary: "$145k - $185k",
  },
  {
    company: "Shopify",
    position: "Ruby Developer",
    location: "Remote",
    tags: ["Ruby on Rails", "MySQL", "GraphQL"],
    description: "Empower millions of merchants to sell online",
    jobUrl: "https://example.com/jobs/23",
    salary: "$130k - $170k",
  },
  {
    company: "Ramp",
    position: "Software Engineer",
    location: "New York, NY",
    tags: ["TypeScript", "React", "Node.js"],
    description: "Build finance automation for modern companies",
    jobUrl: "https://example.com/jobs/24",
    salary: "$160k - $210k",
  },
  {
    company: "Coinbase",
    position: "Backend Developer",
    location: "Remote",
    tags: ["Go", "PostgreSQL", "Crypto"],
    description: "Build reliable APIs for the crypto economy",
    jobUrl: "https://example.com/jobs/25",
    salary: "$150k - $200k",
  },
  {
    company: "GitLab",
    position: "DevOps Engineer",
    location: "Remote",
    tags: ["Kubernetes", "Terraform", "CI/CD"],
    description: "Operate the largest all-remote DevOps platform",
    jobUrl: "https://example.com/jobs/26",
    salary: "$130k - $170k",
  },

  /* ---------------------------- INTERVIEWING (18-24) --------------------------- */
  {
    company: "Retomotion",
    position: "Web Designer",
    location: "Berlin, Germany",
    tags: ["Figma", "React", "Bootstrap"],
    description: "Create responsive web designs and implement them",
    jobUrl: "https://example.com/jobs/8",
    salary: "$85k - $105k",
  },
  {
    company: "WorkLab",
    position: "Product Manager",
    location: "Seattle, WA",
    tags: ["Product Strategy", "Agile", "Analytics"],
    description: "Help drive the product and business planning for our platform",
    jobUrl: "https://example.com/jobs/9",
    salary: "$140k - $170k",
  },
  {
    company: "I Networks",
    position: "Mobile Developer",
    location: "Remote",
    tags: ["Flutter", "Dart", "Firebase"],
    description: "Build cross-platform mobile applications",
    jobUrl: "https://example.com/jobs/10",
    salary: "$115k - $145k",
  },
  {
    company: "Uber",
    position: "Senior Frontend Engineer",
    location: "San Francisco, CA",
    tags: ["React", "TypeScript", "Web Performance"],
    description: "Build rider and driver web experiences at global scale",
    jobUrl: "https://example.com/jobs/27",
    salary: "$180k - $230k",
  },
  {
    company: "Klarna",
    position: "Mobile Developer",
    location: "Stockholm, Sweden",
    tags: ["React Native", "TypeScript", "iOS"],
    description: "Build the smoothest checkout experience in fintech",
    jobUrl: "https://example.com/jobs/28",
    salary: "€85k - €115k",
  },
  {
    company: "Canva",
    position: "Frontend Developer",
    location: "Sydney, Australia",
    tags: ["React", "TypeScript", "Canvas API"],
    description: "Build intuitive design tools for non-designers",
    jobUrl: "https://example.com/jobs/29",
    salary: "A$130k - A$170k",
  },
  {
    company: "JetBrains",
    position: "Kotlin Developer",
    location: "Prague, Czech Republic",
    tags: ["Kotlin", "JVM", "IntelliJ"],
    description: "Build developer tools loved by millions of engineers",
    jobUrl: "https://example.com/jobs/30",
    salary: "€80k - €110k",
  },

  /* -------------------------------- OFFER (25-28) ------------------------------ */
  {
    company: "Profan",
    position: "Software Developer",
    location: "Stockholm, Sweden",
    tags: ["Node.js", "PostgreSQL", "AWS"],
    description: "Develop backend services and APIs",
    jobUrl: "https://example.com/jobs/11",
    salary: "$100k - $125k",
  },
  {
    company: "MUS Logistics",
    position: "UI Designer",
    location: "Amsterdam, Netherlands",
    tags: ["Figma", "Illustrator"],
    description:
      "Lead the UX process and workflow, and work closely with development team",
    jobUrl: "https://example.com/jobs/12",
    salary: "$90k - $110k",
  },
  {
    company: "Netflix",
    position: "Data Engineer",
    location: "Los Gatos, CA",
    tags: ["Spark", "Scala", "AWS"],
    description: "Power personalization and recommendation systems",
    jobUrl: "https://example.com/jobs/31",
    salary: "$200k - $280k",
  },
  {
    company: "Revolut",
    position: "Product Manager",
    location: "London, UK",
    tags: ["Fintech", "Analytics", "Growth"],
    description: "Drive product strategy for a global neobank",
    jobUrl: "https://example.com/jobs/32",
    salary: "£95k - £130k",
  },

  /* ------------------------------ REJECTED (29-34) ----------------------------- */
  {
    company: "Ultra Vouche",
    position: "Associate",
    location: "Chicago, IL",
    tags: ["Scrum", "Agile"],
    description: "Support product development and project management",
    jobUrl: "https://example.com/jobs/13",
    salary: "$70k - $85k",
  },
  {
    company: "NRI",
    position: "Web Test",
    location: "Boston, MA",
    tags: ["Testing", "Automation"],
    description: "Manage product testing and quality assurance",
    jobUrl: "https://example.com/jobs/14",
    salary: "$75k - $90k",
  },
  {
    company: "TOG London",
    position: "Data Ana",
    location: "London, UK",
    tags: ["JavaScript", "Python", "SQL"],
    description: "Analyze user data and provide insights for product decisions",
    jobUrl: "https://example.com/jobs/15",
    salary: "$85k - $100k",
  },
  {
    company: "Atlassian",
    position: "Engineering Manager",
    location: "Sydney, Australia",
    tags: ["Leadership", "Agile", "Hiring"],
    description: "Lead a team building collaboration tools",
    jobUrl: "https://example.com/jobs/33",
    salary: "A$180k - A$230k",
  },
  {
    company: "Datadog",
    position: "Site Reliability Engineer",
    location: "New York, NY",
    tags: ["Kubernetes", "Go", "Observability"],
    description: "Keep the observability platform reliable at massive scale",
    jobUrl: "https://example.com/jobs/34",
    salary: "$160k - $210k",
  },
  {
    company: "Twilio",
    position: "Platform Engineer",
    location: "Remote",
    tags: ["Go", "Kafka", "gRPC"],
    description: "Build real-time communications infrastructure",
    jobUrl: "https://example.com/jobs/35",
    salary: "$140k - $180k",
  },
];

async function seed() {
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

    const existingJobs = await JobApplication.find({ userId: USER_ID });
    if (existingJobs.length > 0) {
      console.log(
        `🗑️  Deleting ${existingJobs.length} existing job applications...`
      );
      await JobApplication.deleteMany({ userId: USER_ID });
      await Column.updateMany(
        { boardId: board._id },
        { $set: { jobApplications: [] } }
      );
    }

    // ✅ 35-job distribution:
    //   Wish List   →  8 jobs  (index 0-7)
    //   Applied     → 10 jobs  (index 8-17)
    //   Interviewing→  7 jobs  (index 18-24)
    //   Offer       →  4 jobs  (index 25-28)
    //   Rejected    →  6 jobs  (index 29-34)
    const jobsByColumn: Record<string, SampleJob[]> = {
      "Wish List": SAMPLE_JOBS.slice(0, 8),
      Applied: SAMPLE_JOBS.slice(8, 18),
      Interviewing: SAMPLE_JOBS.slice(18, 25),
      Offer: SAMPLE_JOBS.slice(25, 29),
      Rejected: SAMPLE_JOBS.slice(29, 35),
    };

    const applicationsToCreate: Record<string, unknown>[] = [];
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
          order: i * 100,
        });
      });
    }

    const createdApplications = await JobApplication.insertMany(
      applicationsToCreate
    );

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
    // console.log(`📋 Board: ${board.name}`);
    // console.log(`👤 User ID: ${USER_ID}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();