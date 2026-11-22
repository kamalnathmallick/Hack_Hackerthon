const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail, findUserById, findMembers, updateUserPassword } = require("../models/userModel");

function detectRoleFromEmail(email) {
  const lowered = String(email || "").toLowerCase();
  if (lowered.endsWith("@leader.com")) {
    return "TEAM_LEADER";
  } else if (lowered.endsWith("@member.com")) {
    return "TEAM_MEMBER";
  }
  return null;
}

function normalizeRole(role) {
  if (!role) return "TEAM_MEMBER";
  const upper = String(role).trim().toUpperCase();
  if (upper === "LEADER" || upper === "TEAM_LEADER") return "TEAM_LEADER";
  if (upper === "MEMBER" || upper === "TEAM_MEMBER") return "TEAM_MEMBER";
  return "TEAM_MEMBER";
}

async function register(req, res) {
  try {
    let { name, email, password, role, domain } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Role can be provided during signup, detected from email, or defaults to TEAM_MEMBER
    const resolvedRole = normalizeRole(role || detectRoleFromEmail(email));

    // Check if user exists
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);
    
    // Insert user into PostgreSQL
    const derivedName = name || email.split("@")[0];
    const user = await createUser({ name: derivedName, email, password: hash, role: resolvedRole, domain });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        domain: user.domain
      }
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!process.env.JWT_SECRET) {
      console.error("FATAL: JWT_SECRET environment variable is missing.");
      return res.status(500).json({ success: false, message: "Server authentication misconfiguration" });
    }

    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Compare password
    let isMatch = await bcrypt.compare(password, user.password);
    
    // Automatic Migration: If password in database was legacy plain text, hash it
    if (!isMatch && password === user.password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await updateUserPassword(email, hashedPassword);
      isMatch = true;
      user.password = hashedPassword;
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const normalizedDbRole = normalizeRole(user.role);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: normalizedDbRole },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: normalizedDbRole,
        domain: user.domain
      }
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      // Avoid user enumeration
      return res.json({ 
        success: true, 
        message: "If an account with that email exists, reset instructions have been issued." 
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: "Server authentication misconfiguration" });
    }

    const resetToken = jwt.sign(
      { email: user.email, purpose: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Dev-only log for manual testing; NEVER leak token in HTTP response body
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV ONLY] Password reset token for ${user.email}: ${resetToken}`);
    }

    return res.json({
      success: true,
      message: "If an account with that email exists, password reset instructions have been sent."
    });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function resetPassword(req, res) {
  try {
    const { email, currentPassword, newPassword, resetToken } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    let targetEmail = email;

    // Verify time-limited reset token OR current password verification
    if (resetToken) {
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ success: false, message: "Server authentication misconfiguration" });
      }
      try {
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        if (decoded.purpose !== "password_reset") {
          return res.status(400).json({ success: false, message: "Invalid reset token" });
        }
        targetEmail = decoded.email;
      } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid or expired reset token" });
      }
    } else if (currentPassword) {
      if (!targetEmail) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }
      const user = await findUserByEmail(targetEmail);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid current password" });
      }
    } else {
      return res.status(400).json({ 
        success: false, 
        message: "Password reset requires either currentPassword verification or a valid resetToken" 
      });
    }

    const user = await findUserByEmail(targetEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(targetEmail, hashedPassword);

    return res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function changePassword(req, res) {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Valid current password and new password (min 6 chars) are required" });
    }

    const user = await findUserByEmail(email || req.user.email);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(user.email, hashedPassword);

    return res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change Password Error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function me(req, res) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  return res.json({ 
    success: true, 
    user: {
      ...req.user,
      role: normalizeRole(req.user.role)
    }
  });
}

async function listMembers(req, res) {
  try {
    const members = await findMembers();
    const normalized = members.map(m => ({
      ...m,
      role: normalizeRole(m.role)
    }));
    return res.json({ success: true, data: normalized });
  } catch (error) {
    console.error("List Members Error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  detectRoleFromEmail,
  normalizeRole,
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  me,
  listMembers
};
