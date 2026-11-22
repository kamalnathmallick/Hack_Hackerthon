const { updateUserProfile } = require("../models/userModel");

async function updateProfile(req, res) {
  try {
    const { name, domain } = req.body;
    // Assume user email is in req.user due to authMiddleware
    // Or we take it from the body, the prompt asks for:
    // UPDATE users SET name = $1, domain = $2 WHERE email = $3
    // We will use req.user.email if possible, else req.body.email
    const email = req.user?.email || req.body.email;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required to update profile." });
    }

    const updatedUser = await updateUserProfile(email, name, domain);

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  updateProfile
};
