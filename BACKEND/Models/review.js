import db from "../db.js";

// Helper functions

export const addReview = ({ paperId, reviewerId, role, decision, comment }) => {
  const stmt = db.prepare(`
    INSERT INTO reviews (paperId, reviewerId, role, decision, comment)
    VALUES (?, ?, ?, ?, ?)
  `);
  return stmt.run(paperId, reviewerId, role, decision, comment || null);
};

export const getReviewsByPaper = (paperId) => {
  return db.prepare(`SELECT * FROM reviews WHERE paperId = ?`).all(paperId);
};

export const getReviewByRole = (paperId, role) => {
  return db.prepare(`SELECT * FROM reviews WHERE paperId = ? AND role = ?`).get(paperId, role);
};

export default db;
