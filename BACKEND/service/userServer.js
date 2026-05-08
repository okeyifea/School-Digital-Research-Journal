import db from "../db.js";

export const getUserById = async (id) => {
  return db.User.findById(id).select("password_hash");
};

export const updateUserPassword = async (id, hashedPassword) => {
  return db.User.findByIdAndUpdate(
    id,
    { password_hash: hashedPassword, updatedAt: new Date() },
    { new: true }
  );
};
