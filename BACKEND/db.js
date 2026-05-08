import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_PASSWORD_HASH = "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f";
const LEGACY_BAD_PASSWORD_HASH = "ef61a579c907bbed674c0dbcbcf7f7af8f851538eef7b8e58c5bee0b8";
const UNIVERSITY_STRUCTURE = {
  "College of Medicine": ["Medicine"],
  "College of Nursing": ["Nursing"],
  "College of Law": ["Law"],
  "Faculty of Computing and Information Technology": [
    "Software Engineering",
    "Cybersecurity",
    "Computer Science"
  ],
  "Faculty of Management and Social Sciences": [
    "International Relations",
    "Accounting",
    "Management"
  ],
  "Faculty of Natural and Environmental Studies": [
    "Biochemistry",
    "Biotechnology",
    "Industrial Chemical",
    "Microbiology"
  ],
  "Faculty of Arts": [
    "Philosophy",
    "History"
  ],
  "Faculty of Education": ["Education"]
};
const COLLEGES = Object.keys(UNIVERSITY_STRUCTURE);

const getDefaultDepartment = (college) => UNIVERSITY_STRUCTURE[college]?.[0] || "General";

const slugifyCollege = (college) =>
  college
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/facit_journal';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['student', 'staff', 'officer']
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  registrationNumber: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  // New university structure fields
  college: {
    type: String,
    required: true,
    enum: COLLEGES
  },
  department: {
    type: String,
    required: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Category Schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

// Research Paper Schema
const researchPaperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  authors: {
    type: String,
    required: true
  },
  abstract: {
    type: String,
    required: true
  },
  pdf_path: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  submitted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  author_role: {
    type: String,
    required: true,
    enum: ['student', 'staff', 'officer']
  },
  citation_count: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'rejected_final'],
    default: 'pending'
  },
  approval_required: {
    type: Number,
    default: 2
  },
  approval_count: {
    type: Number,
    default: 0
  },
  resubmission_count: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Review Schema
const reviewSchema = new mongoose.Schema({
  paperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResearchPaper',
    required: true
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['staff', 'officer']
  },
  decision: {
    type: String,
    required: true,
    enum: ['approved', 'rejected']
  },
  comment: {
    type: String,
    required: function() {
      return this.decision === 'rejected';
    }
  },
  reviewedAt: {
    type: Date,
    default: Date.now
  }
});

// Create unique compound index for reviews (one staff + one officer per paper)
reviewSchema.index({ paperId: 1, role: 1 }, { unique: true });

// Create models
const User = mongoose.model('User', userSchema);
const Category = mongoose.model('Category', categorySchema);
const ResearchPaper = mongoose.model('ResearchPaper', researchPaperSchema);
const Review = mongoose.model('Review', reviewSchema);

const baseSeedUsers = [
  {
    username: "student1",
    password_hash: DEFAULT_PASSWORD_HASH,
    role: "student",
    fullName: "John Student",
    email: "student1@example.com",
    phone: "1234567890",
    registrationNumber: "GOU/UCC/CSC/001",
    college: "Faculty of Computing and Information Technology",
    department: "Computer Science"
  },
  {
    username: "staff1",
    password_hash: DEFAULT_PASSWORD_HASH,
    role: "staff",
    fullName: "Jane Staff",
    email: "staff1@example.com",
    phone: "9876543210",
    college: "Faculty of Computing and Information Technology",
    department: "Computer Science"
  },
  {
    username: "officer1",
    password_hash: DEFAULT_PASSWORD_HASH,
    role: "officer",
    fullName: "Dr. Officer Dean",
    email: "officer1@example.com",
    phone: "5555555555",
    position: "HOD",
    college: "Faculty of Computing and Information Technology",
    department: "Computer Science"
  },
];

const facultySeedUsers = COLLEGES.flatMap((college) => {
  const department = getDefaultDepartment(college);
  const slug = slugifyCollege(college);

  return [
    {
      username: `staff_${slug}`,
      password_hash: DEFAULT_PASSWORD_HASH,
      role: "staff",
      fullName: `${college} Staff`,
      email: `staff.${slug}@example.com`,
      phone: "08000000001",
      college,
      department
    },
    {
      username: `officer_${slug}`,
      password_hash: DEFAULT_PASSWORD_HASH,
      role: "officer",
      fullName: `${college} Officer`,
      email: `officer.${slug}@example.com`,
      phone: "08000000002",
      position: college.startsWith("College of") ? "Dean" : "HOD",
      college,
      department
    }
  ];
});

const defaultUsers = [...baseSeedUsers, ...facultySeedUsers];

// Seed categories if empty
const seedCategories = async () => {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      await Category.insertMany(COLLEGES.map(name => ({ name })));
    }
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};

// Seed sample users
const seedUsers = async () => {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      await User.insertMany(defaultUsers);
      return;
    }

    const seededUsernames = defaultUsers.map(({ username }) => username);

    await User.updateMany(
      {
        username: { $in: seededUsernames },
        password_hash: LEGACY_BAD_PASSWORD_HASH
      },
      {
        $set: { password_hash: DEFAULT_PASSWORD_HASH }
      }
    );

    for (const user of defaultUsers) {
      await User.updateOne(
        { username: user.username },
        { $setOnInsert: user },
        { upsert: true }
      );
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

export default {
  connectDB,
  seedCategories,
  seedUsers,
  User,
  Category,
  ResearchPaper,
  Review
};
