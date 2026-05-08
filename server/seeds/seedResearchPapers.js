import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import db from "../db.js";

const TOTAL_PAPERS = 30;
const FIXED_EMAILS = [
  "student1@example.com",
  "staff1@example.com",
  "officer1@example.com",
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, "..", "..", "uploads");
const minimalPdfBuffer = Buffer.from(
  "%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 144]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length 65>>stream\nBT /F1 18 Tf 36 96 Td (FACIT Journal Sample Paper) Tj ET\nendstream\nendobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000063 00000 n \n0000000122 00000 n \n0000000248 00000 n \n0000000363 00000 n \ntrailer<</Size 6/Root 1 0 R>>\nstartxref\n433\n%%EOF\n"
);

const ensureSamplePdf = (filename) => {
  fs.mkdirSync(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, minimalPdfBuffer);
  }
};

const randomEmail = () => {
  const names = ["john", "mary", "ade", "chioma", "ahmed", "grace"];
  const domains = ["gmail.com", "yahoo.com", "edu.ng"];
  return `${names[Math.floor(Math.random() * names.length)]}${Math.floor(
    Math.random() * 1000
  )}@${domains[Math.floor(Math.random() * domains.length)]}`;
};

const buildAuthorRole = (email) => {
  if (email.startsWith("student")) return "student";
  if (email.startsWith("staff")) return "staff";
  if (email.startsWith("officer")) return "officer";
  return "student";
};

const buildSubmittedByPool = (usersByEmail) => [
  ...FIXED_EMAILS.map((email) => usersByEmail.get(email)).filter(Boolean),
  ...Array.from({ length: 10 }, () => ({
    _id: new mongoose.Types.ObjectId(),
    email: randomEmail(),
    role: "student",
  })),
];

const main = async () => {
  try {
    await db.connectDB();
    await db.seedCategories();
    await db.seedUsers();

    const categories = await db.Category.find({}, "_id name").sort({ name: 1 });
    if (categories.length === 0) {
      throw new Error("No categories found. Seed categories first.");
    }

    const fixedUsers = await db.User.find(
      { email: { $in: FIXED_EMAILS } },
      "_id email role"
    );
    const usersByEmail = new Map(
      fixedUsers.map((user) => [user.email.toLowerCase(), user])
    );

    const missingEmails = FIXED_EMAILS.filter((email) => !usersByEmail.has(email));
    if (missingEmails.length > 0) {
      throw new Error(
        `Missing seeded users for emails: ${missingEmails.join(", ")}`
      );
    }

    await db.ResearchPaper.deleteMany({});

    const submittedByPool = buildSubmittedByPool(usersByEmail);
    const papers = [];

    FIXED_EMAILS.forEach((email, index) => {
      const user = usersByEmail.get(email);
      const category = categories[index % categories.length];
      const filename = `guaranteed-paper-${index + 1}.pdf`;
      ensureSamplePdf(filename);

      papers.push({
        title: `Guaranteed Paper by ${email}`,
        authors: `Author ${index + 1}`,
        abstract:
          "This paper guarantees that required test emails exist in the database.",
        pdf_path: `/uploads/${filename}`,
        category: category._id,
        submitted_by: user._id,
        author_role: user.role || buildAuthorRole(email),
        citation_count: Math.floor(Math.random() * 50),
        status: "pending",
        approval_required: 2,
        approval_count: 0,
        created_at: new Date(),
      });
    });

    for (let index = FIXED_EMAILS.length; index < TOTAL_PAPERS; index += 1) {
      const category = categories[index % categories.length];
      const submitter =
        submittedByPool[Math.floor(Math.random() * submittedByPool.length)];
      const isApproved = Math.random() > 0.4;
      const filename = `sample-paper-${index + 1}.pdf`;
      ensureSamplePdf(filename);

      papers.push({
        title: `Sample Research Paper ${index + 1}`,
        authors: `Author ${index + 1}, Co-Author ${index + 2}`,
        abstract:
          "This is a dummy abstract used for testing archive filters, categories, and UI rendering.",
        pdf_path: `/uploads/${filename}`,
        category: category._id,
        submitted_by: submitter._id,
        author_role: submitter.role || buildAuthorRole(submitter.email),
        citation_count: Math.floor(Math.random() * 100),
        status: isApproved ? "approved" : "pending",
        approval_required: 2,
        approval_count: isApproved ? 2 : 0,
        created_at: new Date(
          2020 + (index % 5),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1
        ),
      });
    }

    await db.ResearchPaper.insertMany(papers);
    
  } catch (error) {
    console.error("Error seeding research papers:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

main();
