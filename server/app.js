import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import diagnose from "./routes/diagnose.js";

// Authentication imports
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import bcrypt from "bcrypt";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads directory:", uploadsDir);
}

// --- Multer storage setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// health + api  
app.get("/health", (_req, res) => res.json({ ok: true }));

// Initialize Supabase client
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

// ================================================
// Session Management & Authentication Setup
// ================================================

// Configure session management
app.use(session({
  secret: process.env.SESSION_SECRET || 'dogtor-ai-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !user) {
      return done(null, false);
    }
    
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', profile.id)
      .single();

    if (existingUser) {
      // Update login time
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ 
          last_login_at: new Date().toISOString(),
          // Update profile info in case it changed
          first_name: profile.name.givenName,
          last_name: profile.name.familyName,
          full_name: profile.displayName,
          profile_image_url: profile.photos[0]?.value
        })
        .eq('id', existingUser.id)
        .select()
        .single();
      
      return done(null, updatedUser.data || existingUser);
    }

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        auth_method: 'google',
        google_id: profile.id,
        email: profile.emails[0].value,
        email_verified: profile.emails[0].verified || false,
        first_name: profile.name.givenName,
        last_name: profile.name.familyName,
        full_name: profile.displayName,
        profile_image_url: profile.photos[0]?.value,
        last_login_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError) {
      return done(createError, null);
    }

    done(null, newUser.data);
  } catch (error) {
    done(error, null);
  }
  }));
} else {
  console.log('⚠️  Google OAuth not configured - set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
}

// Local Strategy (Email/Password)
passport.use(new LocalStrategy({
  usernameField: 'email'
}, async (email, password, done) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('auth_method', 'email')
      .single();

    if (error || !user) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    // Update login time
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};

// Get current user middleware
const getCurrentUser = (req, res, next) => {
  req.currentUser = req.user || null;
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
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/?error=auth_failed' }),
  (req, res) => {
    // Successful authentication
    res.redirect('/');
  }
);

// Email signup
app.post('/auth/email/signup', async (req, res) => {
  try {
    const { email, password, pet_name, pet_breed, pet_age, pet_gender } = req.body;

    // Validate input
    if (!email || !password || !pet_name || !pet_breed) {
      return res.status(400).json({ error: 'Email, password, pet name, and pet breed are required' });
    }

    // Check if user already exists
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        auth_method: 'email',
        email: email,
        password_hash: passwordHash,
        pet_name: pet_name,
        pet_breed: pet_breed,
        pet_age: pet_age || null,
        pet_gender: pet_gender || null,
        email_verified: false
      }])
      .select()
      .single();

    if (createError) {
      console.error('❌ User creation error:', createError);
      return res.status(500).json({ error: 'Failed to create account' });
    }

    // Log user in automatically
    req.login(newUser.data, (err) => {
      if (err) {
        console.error('❌ Auto-login error:', err);
        return res.status(500).json({ error: 'Account created but login failed' });
      }
      res.json({ success: true, user: { id: newUser.data.id, email: newUser.data.email } });
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Email login
app.post('/auth/email/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Login failed' });
    }
    if (!user) {
      return res.status(401).json({ error: info.message || 'Invalid credentials' });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed' });
      }
      res.json({ success: true, user: { id: user.id, email: user.email } });
    });
  })(req, res, next);
});

// Logout
app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

// Get current user
app.get('/api/auth/user', getCurrentUser, (req, res) => {
  if (req.currentUser) {
    const { password_hash, ...userWithoutPassword } = req.currentUser;
    res.json(userWithoutPassword);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Update user profile
app.put('/api/auth/profile', isAuthenticated, async (req, res) => {
  try {
    const { pet_name, pet_breed, pet_birth_month, pet_birth_year, pet_gender, first_name, last_name } = req.body;
    
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        pet_name,
        pet_breed,
        pet_birth_month,
        pet_birth_year,
        pet_gender,
        first_name,
        last_name,
        full_name: first_name && last_name ? `${first_name} ${last_name}` : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    const { password_hash, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
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
    
    const { data, error } = await supabase
      .from("history")
      .insert([{ 
        prompt, 
        response, 
        user_id: req.user.id,
        created_at: new Date().toISOString()
      }]);

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

// --- Upload route ---
app.post("/api/upload", upload.single("image"), (req, res) => {
  const uploadStart = Date.now();
  console.log("📤 Upload request received at:", new Date(uploadStart).toISOString());
  
  if (!req.file) {
    console.log("❌ No file in upload request");
    return res.status(400).json({ error: "No file uploaded" });
  }

  const uploadEnd = Date.now();
  const uploadTime = uploadEnd - uploadStart;
  const imageUrl = `/uploads/${req.file.filename}`;
  
  console.log("✅ File uploaded successfully:", {
    originalName: req.file.originalname,
    filename: req.file.filename,
    size: req.file.size,
    path: req.file.path,
    imageUrl: imageUrl,
    uploadTime: uploadTime + "ms"
  });

  res.json({ imageUrl, uploadTime });
});

// --- Serve uploaded files ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// serve client build
app.use(express.static(path.join(__dirname, "..", "client", "build")));
app.get("*", (_req, res) =>
  res.sendFile(path.join(__dirname, "..", "client", "build", "index.html")),
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
