import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  HealthCard,
  HealthCardContent,
} from "../components/ui/health-card";
import { AppIcons } from "../components/icons";
import { supabase } from "../lib/supabase";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (errors.email) {
      setErrors((prev) => ({
        ...prev,
        email: "",
      }));
    }
  };

  const validateEmail = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMagicLinkSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        },
      });

      if (error) {
        setErrors({
          general: error.message || "Failed to send magic link. Please try again.",
        });
      } else {
        // Navigate to verification page with email
        navigate(`/verify?email=${encodeURIComponent(email.toLowerCase())}`);
      }
    } catch (error) {
      setErrors({
        general: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <AppIcons.logoVertical size={150} />
          </div>
          <p className="text-muted-foreground mt-2">
            Create your account with just your email address
          </p>
        </div>

        <HealthCard colorIndex={1}>
          <HealthCardContent className="space-y-4">
            {/* Magic Link Signup Form */}
            <form onSubmit={handleMagicLinkSignup} className="space-y-4">
              {errors.general && (
                <div
                  className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
                  data-testid="text-signup-error"
                >
                  {errors.general}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  className={errors.email ? "border-red-500" : ""}
                  disabled={isLoading}
                  data-testid="input-email"
                />
                {errors.email && (
                  <p
                    className="text-sm text-red-500"
                    data-testid="text-email-error"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={isLoading}
                data-testid="button-magic-link-signup"
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-medium"
                data-testid="link-login"
              >
                Sign in
              </Link>
            </div>

            {/* Demo Link */}
            <div className="text-center py-2">
              <div className="text-xs text-muted-foreground">
                <a
                  href="/?demo=true"
                  className="text-primary hover:text-primary/80 underline"
                  data-testid="link-demo"
                >
                  Try demo version
                </a>
              </div>
            </div>
          </HealthCardContent>
        </HealthCard>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            We'll send you a secure link to complete signup.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            For guidance only. Not a veterinary service.
          </p>
        </div>
      </div>
    </div>
  );
}