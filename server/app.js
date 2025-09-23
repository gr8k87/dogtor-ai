import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import diagnose from "./routes/diagnose.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// CORS configuration for multiple deployment environments
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [
      "http://0.0.0.0:5000",
      "http://localhost:3000",
      "http://localhost:5000",
      "https://app.hellodogtor.com",
      "https://hellodogtor.replit.app",
    ];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", true);

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// health + api
app.get("/health", (_req, res) => res.json({ ok: true }));

// Initialize Supabase client
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

// ================================================
// Supabase Auth Middleware
// ================================================

// Middleware to verify Supabase JWT token
const verifySupabaseAuth = async (req, res, next) => {
  try {
    // Check for demo mode
    const isDemoMode =
      req.query.demo === "true" || req.headers["x-demo-mode"] === "true";

    if (isDemoMode) {
      // Create a demo user object
      req.user = {
        id: "demo-user-id",
        email: "demo@example.com",
        auth_method: "demo",
        email_verified: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pet_name: "Demo Pet",
        pet_breed: "Mixed Breed",
        first_name: "Demo",
        last_name: "User",
        full_name: "Demo User",
      };
      req.currentUser = req.user;
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the JWT token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Get or create user in our users table
    let { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    // If user doesn't exist by ID, try to find by email (for Google OAuth -> Magic Link migration)
    if (userError && userError.code === "PGRST116") {
      console.log("🔍 User not found by ID, checking by email:", user.email);

      const { data: emailUserData, error: emailError } = await supabase
        .from("users")
        .select("*")
        .eq("email", user.email.toLowerCase())
        .single();

      if (!emailError && emailUserData) {
        // Found existing user by email - preserve their data without mutating the primary key
        console.log(
          "✅ Found existing user by email, preserving data:",
          user.email,
        );

        // Store Supabase auth ID in google_id field to link accounts without changing primary key
        const { data: updatedUser, error: updateError } = await supabase
          .from("users")
          .update({
            google_id: user.id, // Repurpose google_id to store Supabase auth ID for migration
            auth_method: "email",
            email_verified: true,
            updated_at: new Date().toISOString(),
          })
          .eq("email", user.email.toLowerCase())
          .select()
          .single();

        if (updateError) {
          console.error("❌ Failed to link existing user:", updateError);
          return res.status(500).json({
            error: "Failed to link user account",
            details: updateError.message,
          });
        }
        userData = updatedUser;
      } else {
        // No existing user found by email either - create new user
        console.log("🆕 Creating new user in database:", user.id);
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert([
            {
              id: user.id,
              email: user.email.toLowerCase(),
              auth_method: "email",
              email_verified: true,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (createError) {
          console.error("❌ Failed to create user:", createError);
          return res.status(500).json({
            error: "Failed to create user account",
            details: createError.message,
          });
        }
        userData = newUser;
      }
    } else if (userError) {
      console.error("❌ User lookup error:", userError);
      return res.status(500).json({ error: "Database error" });
    }

    req.user = userData;
    req.currentUser = userData;
    next();
  } catch (error) {
    console.error("❌ Auth verification error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};

// Optional auth middleware (doesn't fail if no auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      req.currentUser = null;
      return next();
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      req.user = null;
      req.currentUser = null;
    } else {
      // Get additional user data from our users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      req.user = userData || user;
      req.currentUser = userData || user;
    }

    next();
  } catch (error) {
    req.user = null;
    req.currentUser = null;
    next();
  }
};

// ================================================
// API Routes
// ================================================

// Protect diagnose routes with optional user context
app.use("/api/diagnose", verifySupabaseAuth, diagnose);

// Get current user
app.get("/api/auth/user", verifySupabaseAuth, (req, res) => {
  res.json(req.currentUser);
});

// Update user profile
app.put("/api/auth/profile", verifySupabaseAuth, async (req, res) => {
  try {
    const {
      pet_name,
      pet_breed,
      pet_birth_month,
      pet_birth_year,
      pet_gender,
      first_name,
      last_name,
    } = req.body;

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        pet_name,
        pet_breed,
        pet_birth_month,
        pet_birth_year,
        pet_gender,
        first_name,
        last_name,
        full_name:
          first_name && last_name ? `${first_name} ${last_name}` : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: "Failed to update profile" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("❌ Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Delete user profile (soft delete by prefixing email)
app.delete("/api/auth/profile", verifySupabaseAuth, async (req, res) => {
  try {
    console.log("🗑️ Deleting profile for user:", req.user.id);

    // Update email with deleted prefix to soft delete the account
    const { data: deletedUser, error } = await supabase
      .from("users")
      .update({
        email: `deleted-${req.user.email}`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.user.id)
      .select()
      .single();

    if (error) {
      console.error("❌ Profile deletion error:", error);
      return res.status(500).json({ error: "Failed to delete profile" });
    }

    console.log("✅ Profile deleted successfully for user:", req.user.id);
    res.json({ success: true, message: "Profile deleted successfully" });
  } catch (error) {
    console.error("❌ Profile deletion error:", error);
    res.status(500).json({ error: "Failed to delete profile" });
  }
});

// History API endpoints (protected)
app.get("/api/history/list", verifySupabaseAuth, async (req, res) => {
  try {
    console.log("📋 Fetching history for user:", req.user.id);
    const { data, error } = await supabase
      .from("history")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase history fetch error:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log("✅ Retrieved", data?.length || 0, "history entries for user");
    res.json(data || []);
  } catch (err) {
    console.error("❌ History list error:", err);
    res.status(500).json({ error: "Failed to load history" });
  }
});

app.post("/api/history/save", verifySupabaseAuth, async (req, res) => {
  try {
    const { prompt, response } = req.body;

    const { data, error } = await supabase.from("history").insert([
      {
        prompt,
        response,
        user_id: req.user.id,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("❌ Supabase history save error:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log("✅ Saved to history for user:", req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    console.error("❌ History save error:", err);
    res.status(500).json({ error: "Failed to save history" });
  }
});

app.delete("/api/history/delete/:id", verifySupabaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🗑️ Deleting history entry:", id, "for user:", req.user.id);

    // Only allow users to delete their own history
    const { error } = await supabase
      .from("history")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.id);

    if (error) {
      console.error("❌ Supabase history delete error:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log("✅ Deleted history entry:", id);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ History delete error:", err);
    res.status(500).json({ error: "Failed to delete history entry" });
  }
});

// serve client build
const clientBuildPath = path.join(__dirname, "..", "client", "build");
console.log("🎯 Serving React build from:", clientBuildPath);

// Ensure proper static file serving with cache-busting headers
app.use(
  express.static(clientBuildPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      } else if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }

      // Cache-busting for index.html - force revalidation
      if (filePath.endsWith("index.html")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
      }
      // Long cache for versioned assets (they have hashes in filename)
      else if (filePath.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
        res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year
      }
    },
  }),
);

// Catch-all route must be LAST - after static file serving
app.get("*", (_req, res) =>
  res.sendFile(path.join(clientBuildPath, "index.html")),
);

const PORT = process.env.PORT || 5000;
const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server listening on ${HOST}:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🌐 Base URL: ${process.env.BASE_URL || `http://${HOST}:${PORT}`}`,
  );
});
