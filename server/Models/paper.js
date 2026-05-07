import db from "../db.js";

// Helper functions

export const createPaper = async ({ title, abstract, fileUrl, submittedBy, authorRole, revisionOf }) => {
  try {
    const paper = new db.ResearchPaper({
      title,
      abstract,
      pdf_path: fileUrl,
      submitted_by: submittedBy,
      author_role: authorRole,
      revisionOf: revisionOf || null,
    });
    const savedPaper = await paper.save();
    return savedPaper._id;
  } catch (error) {
    console.error('Error creating paper:', error);
    throw error;
  }
};

export const getPaperById = async (id) => {
  try {
    return await db.ResearchPaper.findById(id).populate('submitted_by', 'fullName email college department').populate('category', 'name');
  } catch (error) {
    console.error('Error getting paper by ID:', error);
    throw error;
  }
};

export const updatePaperStatus = async (id, status) => {
  try {
    return await db.ResearchPaper.findByIdAndUpdate(id, { status, updatedAt: new Date() }, { new: true });
  } catch (error) {
    console.error('Error updating paper status:', error);
    throw error;
  }
};

export const listPapersByAuthor = async (authorId) => {
  try {
    return await db.ResearchPaper.find({ submitted_by: authorId }).populate('category', 'name').sort({ created_at: -1 });
  } catch (error) {
    console.error('Error listing papers by author:', error);
    throw error;
  }
};

export default db;
