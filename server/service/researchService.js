import db from "../db.js";

class ResearchService {

  static async create({ title, authors, abstract, category, submittedBy, pdfPath, role }) {
    try {
      const submittingUser = await db.User.findById(submittedBy);
      if (!submittingUser) {
        throw new Error("Submitting user does not exist");
      }

      // Validate category exists
      const categoryExists = await db.Category.findById(category);
      if (!categoryExists) {
        throw new Error("Category does not exist");
      }

      if (
        ["staff", "officer"].includes(submittingUser.role) &&
        categoryExists.name !== submittingUser.college
      ) {
        throw new Error("You can only submit papers under your own faculty or college");
      }

      // Create research paper
      const paper = new db.ResearchPaper({
        title,
        authors,
        abstract,
        pdf_path: pdfPath,
        category,
        submitted_by: submittingUser._id,
        author_role: role || submittingUser.role,
        status: "pending",
        approval_required: 2,
        approval_count: 0,
      });

      const savedPaper = await paper.save();
      return { paperId: savedPaper._id };
    } catch (error) {
      console.error('Error creating research paper:', error);
      throw error;
    }
  }

  static async getAll({ authors, category, search, sort, status }) {
    try {
      let query = { status: status || 'approved' };

      if (authors) {
        query.authors = { $regex: authors, $options: 'i' };
      }

      if (category) {
        query.category = category;
      }

      if (search) {
        query.title = { $regex: search, $options: 'i' };
      }

      let sortOption = {};
      switch (sort) {
        case "citations":
          sortOption = { citation_count: -1 };
          break;
        case "alphabetical":
          sortOption = { title: 1 };
          break;
        case "recent":
        default:
          sortOption = { created_at: -1 };
      }

      return await db.ResearchPaper.find(query)
        .populate('category', 'name')
        .sort(sortOption);
    } catch (error) {
      console.error('Error getting research papers:', error);
      throw error;
    }
  }

  static async incrementCitation(id) {
    try {
      return await db.ResearchPaper.findByIdAndUpdate(id, { $inc: { citation_count: 1 } });
    } catch (error) {
      console.error('Error incrementing citation:', error);
      throw error;
    }
  }

  static async getByUserEmail(email, status) {
    try {
      // First find the user by email to get their ID
      const user = await db.User.findOne({ email });
      if (!user) return [];

      let query = { submitted_by: user._id };
      if (status) {
        query.status = status;
      }

      return await db.ResearchPaper.find(query)
        .populate('category', 'name')
        .sort({ created_at: -1 });
    } catch (error) {
      console.error('Error getting papers by user email:', error);
      throw error;
    }
  }
}

export default ResearchService;
