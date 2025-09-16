import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { HealthCard, HealthCardContent } from "../components/ui/health-card";
import { AppIcons } from "../components/icons";
import { supabase } from "../lib/supabase";
import { apiRequest } from "../lib/api";

export default function Verify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Auto-focus on input when component mounts
  useEffect(() => {
    const input = document.getElementById("verification-code");
    if (input) {
      input.focus();
    }
  }, []);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 6) {
      setCode(value);
      // Clear error when user starts typing
      if (errors.code) {
        setErrors((prev) => ({
          ...prev,
          code: "",
        }));
      }
    }
  };

  const validateCode = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!code.trim()) {
      newErrors.code = "Verification code is required";
    } else if (code.length !== 6) {
      newErrors.code = "Please enter the complete 6-digit code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCode()) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: code,
        type: "email",
      });

      if (error) {
        setErrors({
          general:
            error.message || "Invalid verification code. Please try again.",
        });
      } else if (data.session) {
        // Successful verification - check profile completion
        try {
          const response = await apiRequest("/api/auth/user", {
            headers: {
              Authorization: `Bearer ${data.session.access_token}`,
            },
          });

          if (response.ok) {
            const userProfile = await response.json();
            const isComplete = !!(
              userProfile.pet_name &&
              userProfile.pet_breed &&
              userProfile.pet_birth_month &&
              userProfile.pet_birth_year
            );

            if (isComplete) {
              navigate("/");
            } else {
              navigate("/profile?incomplete=true");
            }
          } else {
            navigate("/");
          }
        } catch (profileError) {
          console.error("Error checking profile:", profileError);
          navigate("/");
        }
      }
    } catch (error) {
      setErrors({
        general: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      navigate("/login");
      return;
    }

    setIsResending(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        },
      });

      if (error) {
        setErrors({
          general: error.message || "Failed to resend code. Please try again.",
        });
      } else {
        setErrors({
          general: "",
        });
        // Show success message
        setErrors({
          success: "New verification code sent! Check your email.",
        });
      }
    } catch (error) {
      setErrors({
        general: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <AppIcons.logoVertical size={120} />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Check your email</h1>
          <p className="text-muted-foreground">
            We sent a 6-digit code to <br />
            <span className="font-medium">{email}</span>
          </p>
        </div>

        <HealthCard colorIndex={3}>
          <HealthCardContent className="space-y-4">
            {/* Verification Code Form */}
            <form onSubmit={handleVerifyCode} className="space-y-4">
              {errors.general && (
                <div
                  className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
                  data-testid="text-verify-error"
                >
                  {errors.general}
                </div>
              )}

              {errors.success && (
                <div
                  className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md"
                  data-testid="text-verify-success"
                >
                  {errors.success}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="verification-code">
                  6-digit verification code
                </Label>
                <Input
                  id="verification-code"
                  name="verification-code"
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={handleCodeChange}
                  className={`text-center text-xl tracking-widest font-mono ${errors.code ? "border-red-500" : ""}`}
                  disabled={isLoading}
                  maxLength={6}
                  data-testid="input-verification-code"
                />
                {errors.code && (
                  <p
                    className="text-sm text-red-500"
                    data-testid="text-code-error"
                  >
                    {errors.code}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={isLoading}
                data-testid="button-verify-code"
              >
                {isLoading ? "Verifying..." : "Verify code"}
              </Button>
            </form>

            <div className="text-center space-y-3 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?
              </p>
              <div className="space-y-2">
                <Button
                  variant="default"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="w-full"
                  data-testid="button-resend-code"
                >
                  {isResending ? "Sending..." : "Resend code"}
                </Button>
                <Button
                  variant="default"
                  onClick={handleBackToLogin}
                  className="w-full text-sm"
                  data-testid="button-back-login"
                >
                  Back to login
                </Button>
              </div>
            </div>
          </HealthCardContent>
        </HealthCard>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            The code works for both the email link and in-app verification.
          </p>
        </div>
      </div>
    </div>
  );
}
