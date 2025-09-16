import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppIcons } from "../components/icons";
import { supabase } from "../lib/supabase";
import { apiRequest } from "../lib/api";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get URL parameters
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const email = searchParams.get('email');
        const code = searchParams.get('code');

        // Handle magic link verification
        if (token_hash && type === 'magiclink') {
          console.log("Processing magic link verification...");
          
          const { data, error } = await supabase.auth.verifyOtp({
            type: 'magiclink',
            token_hash,
            email: email || '',
          });

          if (error) {
            console.error("Magic link verification error:", error);
            setError(error.message || "Failed to verify magic link");
            setIsProcessing(false);
            return;
          }

          if (data.session) {
            console.log("Magic link verification successful");
            await handleSuccessfulAuth(data.session);
            return;
          }
        }

        // Handle OAuth code exchange (legacy support)
        if (code) {
          console.log("Processing OAuth code exchange...");
          
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("Code exchange error:", error);
            setError(error.message || "Failed to exchange code for session");
            setIsProcessing(false);
            return;
          }

          if (data.session) {
            console.log("Code exchange successful");
            await handleSuccessfulAuth(data.session);
            return;
          }
        }

        // If we get here, no valid parameters were found
        console.log("No valid auth parameters found, checking existing session...");
        
        // Check if user already has a session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Existing session found");
          await handleSuccessfulAuth(session);
        } else {
          console.log("No session found, redirecting to login");
          setError("Invalid authentication link");
          setTimeout(() => navigate("/login"), 2000);
        }

      } catch (error) {
        console.error("Auth callback error:", error);
        setError("Authentication failed. Please try again.");
        setTimeout(() => navigate("/login"), 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    const handleSuccessfulAuth = async (session: any) => {
      try {
        // Check profile completion
        const response = await apiRequest("/api/auth/user", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
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
            navigate("/", { replace: true });
          } else {
            navigate("/profile?incomplete=true", { replace: true });
          }
        } else {
          // If profile check fails, still allow user into the app
          navigate("/", { replace: true });
        }
      } catch (profileError) {
        console.error("Error checking profile:", profileError);
        // If profile check fails, still allow user into the app
        navigate("/", { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <AppIcons.logoVertical size={120} />
        </div>

        {isProcessing ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Signing you in...</h2>
            <p className="text-muted-foreground">
              Please wait while we verify your authentication.
            </p>
          </>
        ) : error ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-600">Authentication Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">
              Redirecting to login page...
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-green-600">Success!</h2>
            <p className="text-muted-foreground">
              Authentication successful. Taking you to the app...
            </p>
          </>
        )}
      </div>
    </div>
  );
}