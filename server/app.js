import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import diagnose from "./routes/diagnose.js";

// Authentication imports
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://0.0.0.0:5000", "http://localhost:3000", "http://localhost:5000"];

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
// JWT Authentication Setup
// ================================================

// JWT secret - ensure this is set in production
const JWT_SECRET = process.env.JWT_SECRET || "dogtor-ai-jwt-secret-change-in-production";

// JWT utility functions
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      auth_method: user.auth_method
    },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// JWT Authentication Middleware
const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  try {
    // Fetch current user data from Supabase
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT auth error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};

// Initialize Passport (keeping for OAuth strategies only)
app.use(passport.initialize());
// Removed passport.session() - no sessions with JWT

// Google OAuth Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL || "http://0.0.0.0:5000"}/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          const { data: existingUser, error: findError } = await supabase
            .from("users")
            .select("*")
            .eq("google_id", profile.id)
            .single();

          if (existingUser) {
            // Update login time
            const { data: updatedUser, error: updateError } = await supabase
              .from("users")
              .update({
                last_login_at: new Date().toISOString(),
                // Update profile info in case it changed
                first_name: profile.name.givenName,
                last_name: profile.name.familyName,
                full_name: profile.displayName,
                profile_image_url: profile.photos[0]?.value,
              })
              .eq("id", existingUser.id)
              .select()
              .single();

            return done(null, updatedUser.data || existingUser);
          }

          // Create new user
          const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert([
              {
                auth_method: "google",
                google_id: profile.id,
                email: profile.emails[0].value,
                email_verified: profile.emails[0].verified || false,
                first_name: profile.name.givenName,
                last_name: profile.name.familyName,
                full_name: profile.displayName,
                profile_image_url: profile.photos[0]?.value,
                last_login_at: new Date().toISOString(),
              },
            ])
            .select()
            .single();

          if (createError) {
            return done(createError, null);
          }

          done(null, newUser.data);
        } catch (error) {
          done(error, null);
        }
      },
    ),
  );
} else {
  console.log(
    "⚠️  Google OAuth not configured - set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET",
  );
}

// Local Strategy (Email/Password)
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .eq("auth_method", "email")
          .single();

        if (error || !user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const isValidPassword = await bcrypt.compare(
          password,
          user.password_hash,
        );
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid email or password" });
        }

        // Update login time
        await supabase
          .from("users")
          .update({ last_login_at: new Date().toISOString() })
          .eq("id", user.id);

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    },
  ),
);

// JWT Authentication middleware (replaces session-based auth)
const isAuthenticated = authenticateJWT; // Use JWT middleware

// Get current user middleware (now works with JWT)
const getCurrentUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      try {
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', decoded.userId)
          .single();
        
        req.currentUser = error || !user ? null : user;
      } catch (error) {
        req.currentUser = null;
      }
    } else {
      req.currentUser = null;
    }
  } else {
    req.currentUser = null;
  }
  
  next();
};

// ================================================
// Protected Routes Setup
// ================================================

// Protect diagnose routes with user context
app.use("/api/diagnose", getCurrentUser, diagnose);

// ================================================
// Authentication Routes
// ================================================

// Google OAuth routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "https://app.hellodogtor.com/?error=auth_failed",
  }),
  (req, res) => {
    // Successful authentication - generate JWT and redirect with token
    const token = generateToken(req.user);
    res.redirect(`https://app.hellodogtor.com/?token=${token}`);
  },
);

// Email signup
app.post("/auth/email/signup", async (req, res) => {
  try {
    const { email, password, pet_name, pet_breed, pet_age, pet_gender } =
      req.body;

    // Validate input
    if (!email || !password || !pet_name || !pet_breed) {
      return res.status(400).json({
        error: "Email, password, pet name, and pet breed are required",
      });
    }

    // Check if user already exists
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert([
        {
          auth_method: "email",
          email: email,
          password_hash: passwordHash,
          pet_name: pet_name,
          pet_breed: pet_breed,
          pet_age: pet_age || null,
          pet_gender: pet_gender || null,
          email_verified: false,
        },
      ])
      .select()
      .single();

    if (createError) {
      console.error("❌ User creation error:", createError);
      return res.status(500).json({ error: "Failed to create account" });
    }

    // Generate JWT for new user
    const token = generateToken(newUser);
    console.log("✅ User created successfully with JWT");
    
    res.json({
      success: true,
      user: { id: newUser.id, email: newUser.email },
      token: token
    });
  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
});

// Email login
app.post("/auth/email/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: "Login failed" });
    }
    if (!user) {
      return res
        .status(401)
        .json({ error: info.message || "Invalid credentials" });
    }

    // Generate JWT token for authenticated user
    const token = generateToken(user);
    console.log("✅ Email user logged in with JWT");
    
    res.json({ 
      success: true, 
      user: { id: user.id, email: user.email },
      token: token
    });
  })(req, res, next);
});

// Logout (JWT is stateless - just confirm logout)
app.post("/auth/logout", (req, res) => {
  // With JWT, logout is handled client-side by removing token
  // No server-side session to destroy
  console.log("🚪 User logged out (JWT removed client-side)");
  res.json({ success: true });
});

// Demo authentication (for testing)
app.post("/auth/demo", async (req, res) => {
  try {
    console.log("🧪 Demo authentication requested");

    // Check if demo user already exists
    const { data: existingDemoUser, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("email", "demo@dogtorai.com")
      .single();

    let demoUser = existingDemoUser;

    // Create demo user if doesn't exist
    if (!existingDemoUser || findError) {
      console.log("🧪 Creating new demo user");
      const { data: newDemoUser, error: createError } = await supabase
        .from("users")
        .insert([
          {
            auth_method: "demo",
            email: "demo@dogtorai.com",
            first_name: "Demo",
            last_name: "User",
            full_name: "Demo User",
            // Start with empty pet profile - user will set this up
            pet_name: null,
            pet_breed: null,
            pet_birth_month: null,
            pet_birth_year: null,
            pet_gender: null,
            email_verified: true,
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("❌ Demo user creation error:", createError);
        return res.status(500).json({ error: "Failed to create demo user" });
      }

      demoUser = newDemoUser;
    }

    // Generate JWT for demo user
    const token = generateToken(demoUser);
    console.log("✅ Demo user logged in with JWT");
    
    res.json({
      success: true,
      user: {
        id: demoUser.id,
        email: demoUser.email,
        isDemo: true,
      },
      token: token
    });
  } catch (error) {
    console.error("❌ Demo auth error:", error);
    res.status(500).json({ error: "Demo authentication failed" });
  }
});

// Get current user
app.get("/api/auth/user", getCurrentUser, (req, res) => {
  if (req.currentUser) {
    const { password_hash, ...userWithoutPassword } = req.currentUser;
    res.json(userWithoutPassword);
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// Update user profile
app.put("/api/auth/profile", isAuthenticated, async (req, res) => {
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

    const { password_hash, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("❌ Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// History API endpoints (protected)
app.get("/api/history/list", isAuthenticated, async (req, res) => {
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

app.post("/api/history/save", isAuthenticated, async (req, res) => {
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

app.delete("/api/history/delete/:id", isAuthenticated, async (req, res) => {
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
// Serve React build for local development/testing
import fs from "fs";

const clientBuildPath = path.join(__dirname, "..", "client", "build");
const indexPath = path.join(clientBuildPath, "index.html");

// Serve static files if build exists
if (fs.existsSync(indexPath)) {
  console.log("🎯 Serving React build from:", clientBuildPath);
  app.use(express.static(clientBuildPath));

  // Catch-all route for frontend (AFTER all API/auth routes)
  app.get("*", (req, res) => {
    // Explicitly exclude auth and api routes
    if (req.path.startsWith("/api") || req.path.startsWith("/auth")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }

    // Serve React app for all other routes
    res.sendFile(indexPath);
  });
} else {
  console.log("⚠️ No React build found - API only mode");
}
// start server
const PORT = process.env.PORT || 5000;
const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server listening on ${HOST}:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🌐 Base URL: ${process.env.BASE_URL || `http://${HOST}:${PORT}`}`,
  );
});
