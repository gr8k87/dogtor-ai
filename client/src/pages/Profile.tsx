import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  HealthCard,
  HealthCardHeader,
  HealthCardTitle,
  HealthCardContent,
} from "../components/ui/health-card";
import { Separator } from "../components/ui/separator";
import BreedSelector from "../components/BreedSelector";
import { ArrowLeft, User, Save } from "../components/icons";
import { GlobalHeader } from "../components/GlobalHeader";
import { supabase } from "../lib/supabase";
import { apiRequest } from "../lib/api";
import { isDemoMode, createDemoUser } from "../lib/demo-utils";
import { useAuth } from "../lib/auth-provider";

// ************* V2 Stable ADDDED SAVE&CONTINUE ON 09/23/2023 **************

// Helper function to format pet age from birth month/year
function formatPetAge(birthMonth: number, birthYear: number): string {
  const today = new Date();
  const birthDate = new Date(birthYear, birthMonth - 1, 1); // Month is 0-indexed

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years > 0) {
    return months > 0 ? `${years} years, ${months} months` : `${years} years`;
  } else {
    return months > 0 ? `${months} months` : "Less than 1 month";
  }
}

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  pet_name?: string;
  pet_breed?: string;
  pet_birth_month?: number;
  pet_birth_year?: number;
  pet_gender?: string;
  auth_method: "google" | "email" | "demo";
}

interface ProfileFormData {
  first_name: string;
  last_name: string;
  pet_name: string;
  pet_breed: string;
  pet_birth_month: string;
  pet_birth_year: string;
  pet_gender: string;
}

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 26 }, (_, i) => ({
  value: (currentYear - i).toString(),
  label: (currentYear - i).toString(),
}));

const GENDERS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Unknown", label: "Unknown" },
];

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUserProfile } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: "",
    last_name: "",
    pet_name: "",
    pet_breed: "",
    pet_birth_month: "",
    pet_birth_year: "",
    pet_gender: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [profileCompleted, setProfileCompleted] = useState(false);

  // Check if user was redirected here for profile completion
  const isIncompleteProfile =
    new URLSearchParams(location.search).get("incomplete") === "true";

  const isProfileComplete = (profile: UserProfile): boolean => {
    return !!(
      profile.pet_name &&
      profile.pet_breed &&
      profile.pet_birth_month &&
      profile.pet_birth_year
    );
  };

  const isFormValid = (): boolean => {
    return !!(
      formData.pet_name.trim() &&
      formData.pet_breed.trim() &&
      formData.pet_birth_month &&
      formData.pet_birth_year
    );
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Check for demo mode first
      if (isDemoMode()) {
        // Set demo user data
        const demoUser = createDemoUser();

        setUser(demoUser);
        setFormData({
          first_name: demoUser.first_name || "",
          last_name: demoUser.last_name || "",
          pet_name: demoUser.pet_name || "",
          pet_breed: demoUser.pet_breed || "",
          pet_birth_month: demoUser.pet_birth_month
            ? demoUser.pet_birth_month.toString()
            : "",
          pet_birth_year: demoUser.pet_birth_year
            ? demoUser.pet_birth_year.toString()
            : "",
          pet_gender: demoUser.pet_gender || "",
        });
        setIsLoading(false);
        return;
      }

      // Get Supabase session token first
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        navigate("/login");
        return;
      }

      const response = await fetch("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);

        // Populate form with current data
        setFormData({
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          pet_name: userData.pet_name || "",
          pet_breed: userData.pet_breed || "",
          pet_birth_month: userData.pet_birth_month
            ? userData.pet_birth_month.toString()
            : "",
          pet_birth_year: userData.pet_birth_year
            ? userData.pet_birth_year.toString()
            : "",
          pet_gender: userData.pet_gender || "",
        });
      } else {
        // User not authenticated, redirect to login
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user makes selection
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Pet information validation (required)
    if (!formData.pet_name.trim()) {
      newErrors.pet_name = "Pet name is required";
    }

    if (!formData.pet_breed.trim()) {
      newErrors.pet_breed = "Pet breed is required";
    }

    if (!formData.pet_birth_month) {
      newErrors.pet_birth_month = "Birth month is required";
    }

    if (!formData.pet_birth_year) {
      newErrors.pet_birth_year = "Birth year is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);
    setSaveMessage("");

    try {
      // Check for demo mode
      if (isDemoMode()) {
        // Simulate saving for demo mode
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Update the demo user data
        const updatedDemoUser: UserProfile = {
          id: user!.id,
          email: user!.email,
          auth_method: user!.auth_method,
          first_name: formData.first_name || undefined,
          last_name: formData.last_name || undefined,
          full_name:
            formData.first_name && formData.last_name
              ? `${formData.first_name} ${formData.last_name}`
              : user!.full_name,
          pet_name: formData.pet_name,
          pet_breed: formData.pet_breed,
          pet_birth_month: parseInt(formData.pet_birth_month),
          pet_birth_year: parseInt(formData.pet_birth_year),
          pet_gender: formData.pet_gender || undefined,
        };

        setUser(updatedDemoUser);
        setSaveMessage("Demo profile updated successfully!");

        // Scroll to top to show success message
        window.scrollTo(0, 0);

        // Set profile completed state for demo
        if (isProfileComplete(updatedDemoUser)) {
          setProfileCompleted(true);
          // Auto-hide celebration after 10 seconds
          setTimeout(() => setProfileCompleted(false), 10000);
        }

        setTimeout(() => setSaveMessage(""), 3000);

        // Navigate to dogtor after successful save
        navigate("/");
        return;
      }
      const updateData = {
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
        pet_name: formData.pet_name,
        pet_breed: formData.pet_breed,
        pet_birth_month: parseInt(formData.pet_birth_month),
        pet_birth_year: parseInt(formData.pet_birth_year),
        pet_gender: formData.pet_gender || undefined,
      };

      // Get Supabase session token first
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        navigate("/login");
        return;
      }

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setSaveMessage("Profile updated successfully!");

        // Scroll to top to show success message
        window.scrollTo(0, 0);

        // Refresh auth context profile
        await refreshUserProfile();

        // Set profile completed state
        if (isProfileComplete(updatedUser)) {
          setProfileCompleted(true);
          // Auto-hide celebration after 10 seconds
          setTimeout(() => setProfileCompleted(false), 10000);
        }

        // Clear save message after 3 seconds
        setTimeout(() => setSaveMessage(""), 3000);

        // Navigate to dogtor after successful save
        navigate("/");
      } else {
        const errorData = await response.json();
        setErrors({
          general:
            errorData.error || "Failed to update profile. Please try again.",
        });
      }
    } catch (error) {
      setErrors({
        general: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getPetAge = () => {
    if (user?.pet_birth_month && user?.pet_birth_year) {
      return formatPetAge(user.pet_birth_month, user.pet_birth_year);
    }
    return "Age not set";
  };

  const handleContinueToDogtor = () => {
    if (!isFormValid()) {
      setErrors({
        general:
          "Please complete all required pet information before proceeding.",
      });
      return;
    }
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen gradient-hero transition-smooth">
      <GlobalHeader
        showBackButton={!isIncompleteProfile}
        onBackClick={() => navigate("/")}
      />

      <div className="max-w-2xl mx-auto p-4 pb-8 space-y-6">
        {/* Profile completion celebration */}
        {profileCompleted && (
          <HealthCard colorIndex={2}>
            <HealthCardContent className="p-4">
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎉</span>
                  </div>
                </div>
                <h3 className="font-semibold text-green-700">
                  Profile Successfully Created!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Great! Your pet's information has been saved. You're now ready
                  to start getting personalized health guidance.
                </p>
              </div>
            </HealthCardContent>
          </HealthCard>
        )}
        {/* User Summary Card */}
        <HealthCard colorIndex={2}>
          <HealthCardHeader>
            <HealthCardTitle className="flex items-center gap-2">
              <User size={20} />
              Account Overview
            </HealthCardTitle>
          </HealthCardHeader>
          <HealthCardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium text-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground">
                  {user.auth_method === "google"
                    ? "Google Account"
                    : "Email Account"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Pet</p>
                <p className="font-medium text-foreground">
                  {user.pet_name || "Not set"}
                </p>
                <p className="text-xs text-muted-foreground">{getPetAge()}</p>
              </div>
            </div>
          </HealthCardContent>
        </HealthCard>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal Information */}
          <HealthCard colorIndex={2}>
            <HealthCardHeader>
              <HealthCardTitle>Personal Information</HealthCardTitle>
            </HealthCardHeader>
            <HealthCardContent className="space-y-4">
              {errors.general && (
                <div
                  className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
                  data-testid="text-profile-error"
                >
                  {errors.general}
                </div>
              )}

              {saveMessage && (
                <div
                  className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md"
                  data-testid="text-profile-success"
                >
                  {saveMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground" htmlFor="first_name">
                    First Name
                  </Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    placeholder="Enter your first name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={isSaving}
                    data-testid="input-first-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground" htmlFor="last_name">
                    Last Name
                  </Label>
                  <Input
                    type="text"
                    id="last_name"
                    name="last_name"
                    placeholder="Enter your last name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={isSaving}
                    data-testid="input-last-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Email Address</Label>
                <Input
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted/50"
                  data-testid="input-email-readonly"
                />
                <p className="text-xs text-muted-foreground">
                  Email address cannot be changed
                </p>
              </div>
            </HealthCardContent>
          </HealthCard>

          {/* Pet Information */}
          <HealthCard colorIndex={2}>
            <HealthCardHeader>
              <HealthCardTitle>Pet Information</HealthCardTitle>
            </HealthCardHeader>
            <HealthCardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground" htmlFor="pet_name">
                  Pet Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="pet_name"
                  name="pet_name"
                  placeholder="Enter your pet's name"
                  value={formData.pet_name}
                  onChange={handleInputChange}
                  className={errors.pet_name ? "border-red-500" : ""}
                  disabled={isSaving}
                  data-testid="input-pet-name"
                />
                {errors.pet_name && (
                  <p
                    className="text-sm text-red-500"
                    data-testid="text-pet-name-error"
                  >
                    {errors.pet_name}
                  </p>
                )}
              </div>

              <BreedSelector
                value={formData.pet_breed}
                onChange={handleSelectChange("pet_breed")}
                required
                error={errors.pet_breed}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">
                    Birth Month <span className="text-red-500">*</span>
                  </Label>
                  <div
                    className={
                      errors.pet_birth_month
                        ? "border-red-500 border rounded-md"
                        : ""
                    }
                  >
                    <Select
                      value={formData.pet_birth_month}
                      onValueChange={handleSelectChange("pet_birth_month")}
                      disabled={isSaving}
                    >
                      <SelectTrigger
                        className="text-foreground border-none"
                        data-testid="select-birth-month"
                      >
                        <SelectValue
                          className="text-foreground"
                          placeholder="Month"
                        />
                      </SelectTrigger>
                      <SelectContent className="text-foreground">
                        {MONTHS.map((month) => (
                          <SelectItem
                            key={month.value}
                            value={month.value}
                            data-testid={`option-month-${month.value}`}
                          >
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.pet_birth_month && (
                    <p
                      className="text-sm text-red-500"
                      data-testid="text-birth-month-error"
                    >
                      {errors.pet_birth_month}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">
                    Birth Year <span className="text-red-500">*</span>
                  </Label>
                  <div
                    className={
                      errors.pet_birth_year
                        ? "border-red-500 border rounded-md"
                        : ""
                    }
                  >
                    <Select
                      value={formData.pet_birth_year}
                      onValueChange={handleSelectChange("pet_birth_year")}
                      disabled={isSaving}
                    >
                      <SelectTrigger
                        className="text-foreground border-none"
                        data-testid="select-birth-year"
                      >
                        <SelectValue
                          className="text-foreground"
                          placeholder="Year"
                        />
                      </SelectTrigger>
                      <SelectContent className="text-foreground">
                        {YEARS.map((year) => (
                          <SelectItem
                            key={year.value}
                            value={year.value}
                            data-testid={`option-year-${year.value}`}
                          >
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.pet_birth_year && (
                    <p
                      className="text-sm text-red-500"
                      data-testid="text-birth-year-error"
                    >
                      {errors.pet_birth_year}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Gender (optional)</Label>
                <Select
                  value={formData.pet_gender}
                  onValueChange={handleSelectChange("pet_gender")}
                  disabled={isSaving}
                >
                  <SelectTrigger
                    className="text-foreground"
                    data-testid="select-gender"
                  >
                    <SelectValue
                      className="text-foreground"
                      placeholder="Select gender"
                    />
                  </SelectTrigger>
                  <SelectContent className="text-foreground">
                    {GENDERS.map((gender) => (
                      <SelectItem
                        key={gender.value}
                        value={gender.value}
                        data-testid={`option-gender-${gender.value.toLowerCase()}`}
                      >
                        {gender.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Show current age if both month and year are set */}
              {formData.pet_birth_month && formData.pet_birth_year && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    <strong>Current age:</strong>{" "}
                    {formatPetAge(
                      parseInt(formData.pet_birth_month),
                      parseInt(formData.pet_birth_year),
                    )}
                  </p>
                </div>
              )}
            </HealthCardContent>
          </HealthCard>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="min-w-[120px]"
              data-testid="button-save-profile"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save & Continue to Dogtor"}
            </Button>

            {/*  <Button
              type="button"
              onClick={handleContinueToDogtor}
              disabled={!profileCompleted && !isFormValid()}
              className="min-w-[140px] btn-primary"
              data-testid="button-continue-dogtor"
            >
             
              Continue to Dogtor
            </Button> */}
          </div>
        </form>
      </div>
    </div>
  );
}
