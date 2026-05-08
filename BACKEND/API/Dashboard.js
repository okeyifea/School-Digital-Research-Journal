import express from "express";
import db from "../db.js";
import authMiddleware from "../Middleware/authMiddleware.js";

const router = express.Router();

const getReviewerCategory = async (college) => {
  if (!college) return null;
  return db.Category.findOne({ name: college }, "_id name");
};

const attachReviews = async (papers) => {
  return Promise.all(
    papers.map(async (paper) => ({
      ...paper.toObject(),
      reviews: await db.Review.find({ paperId: paper._id })
    }))
  );
};

router.get("/dashboard/officer", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "officer") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const reviewerCategory = await getReviewerCategory(req.user.college);
    if (!reviewerCategory) {
      return res.status(400).json({ error: "Reviewer faculty or college is not configured" });
    }

    const staffPapers = await db.ResearchPaper.find({
      author_role: "staff",
      status: "pending",
      category: reviewerCategory._id
    }).populate("category", "name");

    const studentPapers = await db.ResearchPaper.find({
      author_role: "student",
      status: "pending",
      category: reviewerCategory._id
    }).populate("category", "name");

    const filteredStudentPapers = [];
    for (const paper of studentPapers) {
      const staffReview = await db.Review.findOne({
        paperId: paper._id,
        role: "staff",
        decision: "approved"
      });

      const officerReview = await db.Review.findOne({
        paperId: paper._id,
        role: "officer"
      });

      if (staffReview && !officerReview) {
        filteredStudentPapers.push(paper);
      }
    }

    const filteredStaffPapers = [];
    for (const paper of staffPapers) {
      const officerReview = await db.Review.findOne({
        paperId: paper._id,
        role: "officer"
      });

      if (!officerReview) {
        filteredStaffPapers.push(paper);
      }
    }

    res.json({
      staffPapers: await attachReviews(filteredStaffPapers),
      studentPapers: await attachReviews(filteredStudentPapers)
    });
  } catch (error) {
    console.error("Error fetching officer dashboard:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/dashboard/staff", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const reviewerCategory = await getReviewerCategory(req.user.college);
    if (!reviewerCategory) {
      return res.status(400).json({ error: "Reviewer faculty or college is not configured" });
    }

    const studentPapers = await db.ResearchPaper.find({
      author_role: "student",
      status: "pending",
      category: reviewerCategory._id
    }).populate("category", "name");

    const pendingStaffReview = [];
    for (const paper of studentPapers) {
      const staffReview = await db.Review.findOne({
        paperId: paper._id,
        role: "staff"
      });

      if (!staffReview) {
        pendingStaffReview.push(paper);
      }
    }

    const myPapers = await db.ResearchPaper.find({
      submitted_by: req.user.id
    }).populate("category", "name");

    res.json({
      pendingStaffReview: await attachReviews(pendingStaffReview),
      myPapers: await attachReviews(myPapers)
    });
  } catch (error) {
    console.error("Error fetching staff dashboard:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/dashboard/student", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const myPapers = await db.ResearchPaper.find({
      submitted_by: req.user.id
    }).populate("category", "name");

    const papersWithReviews = await Promise.all(
      myPapers.map(async (paper) => {
        const reviews = await db.Review.find({ paperId: paper._id });
        return { ...paper.toObject(), reviews };
      })
    );

    res.json(papersWithReviews);
  } catch (error) {
    console.error("Error fetching student dashboard:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
