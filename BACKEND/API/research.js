import express from "express";
import multer from "multer";
import ResearchService from "../service/researchService.js";
import db from "../db.js";
import authMiddleware from "../Middleware/authMiddleware.js";

const router = express.Router();

// FILE UPLOAD CONFIG
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    file.mimetype === "application/pdf" ? cb(null, true) : cb(new Error("Only PDF allowed"));
  }
});

// SUBMIT PAPER
router.post("/", authMiddleware, upload.single("pdf"), async (req, res) => {
  try {
    const { title, authors, abstract, category } = req.body;

    if (!title || !abstract || !authors || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!req.file) return res.status(400).json({ message: "PDF file required" });

    const result = await ResearchService.create({
      title,
      abstract,
      pdfPath: `/uploads/${req.file.filename}`,
      authors,
      category,
      submittedBy: req.user.id,
      role: req.user.role
    });

    res.json({ message: "Paper submitted successfully", paperId: result.paperId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// RESUBMIT PAPER (after officer rejection)
router.post("/:id/resubmit", authMiddleware, upload.single("pdf"), async (req, res) => {
  try {
    const paperId = req.params.id;

    const paper = await db.ResearchPaper.findById(paperId);
    if (!paper) return res.status(404).json({ message: "Paper not found" });

    if (paper.submitted_by.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const officerRejected = await db.Review.findOne({
      paperId,
      role: 'officer',
      decision: 'rejected'
    });

    if (!officerRejected) {
      return res.status(400).json({ message: "Paper is not rejected by officer" });
    }

    if ((paper.resubmission_count || 0) >= 1) {
      return res.status(400).json({ message: "Resubmission limit reached" });
    }

    if (!req.file) return res.status(400).json({ message: "PDF file required" });

    await db.ResearchPaper.findByIdAndUpdate(paperId, {
      $set: {
        pdf_path: `/uploads/${req.file.filename}`,
        status: 'pending',
        approval_count: 1
      },
      $inc: { resubmission_count: 1 }
    });

    await db.Review.deleteMany({ paperId, role: 'officer' });

    return res.json({ message: "Paper resubmitted for officer review" });
  } catch (error) {
    console.error('Error resubmitting paper:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET CATEGORY LIST
router.get("/categories", async (req, res) => {
  try {
    const categories = await db.Category.find({}, "name").sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL PAPERS
router.get("/", async (req, res) => {
  try {
    const papers = await ResearchService.getAll({
      category: req.query.category,
      search: req.query.search,
      sort: req.query.sort,
      status: req.query.status
    });
    res.json(papers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET user's papers
router.get("/my-papers", authMiddleware, async (req, res) => {
  try {
    const { email: requestedEmail, status } = req.query;
    const currentEmail = req.user?.email;

    if (!currentEmail) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (requestedEmail && requestedEmail !== currentEmail) {
      return res.status(403).json({ message: "You are not allowed to view another user's papers" });
    }

    const papers = await ResearchService.getByUserEmail(currentEmail, status);
    res.json(papers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE user's paper (only if not reviewed or rejected by staff)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const paperId = req.params.id;

    const paper = await db.ResearchPaper.findById(paperId);
    if (!paper) return res.status(404).json({ message: "Paper not found" });

    if (paper.submitted_by.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const reviews = await db.Review.find({ paperId });
    const staffRejected = reviews.some((r) => r.role === "staff" && r.decision === "rejected");
    const officerRejected = reviews.some((r) => r.role === "officer" && r.decision === "rejected");
    const hasAnyReview = reviews.length > 0;

    const canDelete =
      (paper.status === "pending" && !hasAnyReview) ||
      (paper.status === "rejected" && staffRejected) ||
      (paper.author_role === "staff" &&
        officerRejected &&
        (paper.status === "rejected" || paper.status === "rejected_final")) ||
      paper.status === "rejected_final";

    if (!canDelete) {
      return res.status(400).json({ message: "Paper cannot be deleted" });
    }

    await db.Review.deleteMany({ paperId });
    await db.ResearchPaper.findByIdAndDelete(paperId);

    return res.json({ message: "Paper deleted" });
  } catch (error) {
    console.error('Error deleting paper:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
