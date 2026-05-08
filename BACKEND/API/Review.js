import express from "express";
import db from "../db.js";
import authMiddleware from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/review", authMiddleware, async (req, res) => {
  try {
    const { paperId, decision, comment } = req.body;

    if (!paperId || !decision) {
      return res.status(400).json({ message: "paperId and decision are required" });
    }

    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ message: "Invalid decision" });
    }

    if (decision === "rejected" && !comment?.trim()) {
      return res.status(400).json({ message: "Comment is required for rejection" });
    }

    const role = req.user?.role;
    if (!["staff", "officer"].includes(role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const paper = await db.ResearchPaper.findById(paperId).populate("category", "name");
    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }

    const reviewerCollege = req.user?.college;
    const paperCollege = paper.category?.name;
    if (!reviewerCollege || !paperCollege || reviewerCollege !== paperCollege) {
      return res.status(403).json({ message: "You can only review papers from your own faculty or college" });
    }

    if (paper.status !== "pending") {
      return res.status(400).json({ message: "Paper is not pending review" });
    }

    const existingReview = await db.Review.findOne({
      paperId,
      role
    });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this paper" });
    }

    if (role === "staff") {
      if (paper.author_role && paper.author_role !== "student") {
        return res.status(403).json({ message: "Staff can only review student papers" });
      }
    }

    if (role === "officer") {
      if (paper.author_role === "student") {
        const staffReview = await db.Review.findOne({
          paperId,
          role: 'staff',
          decision: 'approved'
        });
        if (!staffReview) {
          return res.status(400).json({ message: "Staff approval required first" });
        }
      }
    }

    // Create the review
    const review = new db.Review({
      paperId,
      reviewerId: req.user.id,
      role,
      decision,
      comment: comment?.trim() || null
    });
    await review.save();

    if (decision === "rejected") {
      if (role === "officer" && (paper.resubmission_count || 0) >= 1) {
        await db.ResearchPaper.findByIdAndUpdate(paperId, { status: 'rejected_final' });
      } else {
        await db.ResearchPaper.findByIdAndUpdate(paperId, { status: 'rejected' });
      }
    } else {
      await db.ResearchPaper.findByIdAndUpdate(paperId, { $inc: { approval_count: 1 } });
      if (role === "officer") {
        await db.ResearchPaper.findByIdAndUpdate(paperId, { status: 'approved', approval_count: 2 });
      }
    }

    return res.json({ message: "Review submitted" });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
