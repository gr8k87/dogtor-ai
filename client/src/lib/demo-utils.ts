
export const isDemoMode = (): boolean => {
  // Check sessionStorage first - this is the primary source of truth
  const storedDemo = sessionStorage.getItem("demo-mode");
  if (storedDemo === "true") {
    return true;
  }

  // Check URL parameters and paths
  const urlParams = new URLSearchParams(window.location.search);
  const isDemo = 
    urlParams.get("demo") === "true" ||
    window.location.pathname.includes("/demo");

  // If demo mode detected from URL, store it in sessionStorage for persistence
  if (isDemo) {
    sessionStorage.setItem("demo-mode", "true");
  }

  return isDemo;
};

export const createDemoUser = () => ({
  id: "demo-user-id",
  email: "demo@example.com",
  first_name: "Demo",
  last_name: "User",
  full_name: "Demo User",
  pet_name: "Buddy",
  pet_breed: "Mixed Breed",
  pet_birth_month: 6,
  pet_birth_year: 2020,
  pet_gender: "Male",
  auth_method: "demo" as const,
  email_verified: true,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});
