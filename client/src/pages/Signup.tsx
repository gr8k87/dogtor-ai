import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { HealthCard, HealthCardHeader, HealthCardTitle, HealthCardContent } from '../components/ui/health-card';
import BreedSelector from '../components/BreedSelector';
import { AppIcons } from '../components/icons';
import { EmailSignupData } from '../../../shared/schema';

interface SignupFormData extends Omit<EmailSignupData, 'pet_birth_month' | 'pet_birth_year'> {
  confirmPassword: string;
  pet_birth_month: string; // Keep as string for form handling
  pet_birth_year: string; // Keep as string for form handling
}

const MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

// Generate years from current year back to 25 years ago
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 26 }, (_, i) => ({
  value: (currentYear - i).toString(),
  label: (currentYear - i).toString()
}));

const GENDERS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Unknown', label: 'Unknown' },
];

export default function Signup() {
  const navigate = useNavigate();
  const isEmailFlowEnabled = false; // TODO: Set to true to re-enable email signup
  
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    pet_name: '',
    pet_breed: '',
    pet_birth_month: '',
    pet_birth_year: '',
    pet_gender: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user makes selection
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Pet information validation
    if (!formData.pet_name.trim()) {
      newErrors.pet_name = 'Pet name is required';
    }

    if (!formData.pet_breed.trim()) {
      newErrors.pet_breed = 'Pet breed is required';
    }

    if (!formData.pet_birth_month) {
      newErrors.pet_birth_month = 'Birth month is required';
    }

    if (!formData.pet_birth_year) {
      newErrors.pet_birth_year = 'Birth year is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Convert string dates to numbers for API
      const signupData: EmailSignupData = {
        email: formData.email,
        password: formData.password,
        pet_name: formData.pet_name,
        pet_breed: formData.pet_breed,
        pet_birth_month: parseInt(formData.pet_birth_month),
        pet_birth_year: parseInt(formData.pet_birth_year),
        pet_gender: formData.pet_gender || undefined
      };

      const response = await fetch('/auth/email/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (response.ok) {
        // Successful signup - redirect to main app
        navigate('/');
        window.location.reload(); // Refresh to update auth state
      } else {
        setErrors({
          general: data.error || 'Signup failed. Please try again.'
        });
      }
    } catch (error) {
      setErrors({
        general: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Redirect to Google OAuth
    window.location.href = '/auth/google';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <AppIcons.logoVertical size={72} />
          </div>
          <p className="text-muted-foreground mt-2">
            Sign up with Google to get personalized pet health guidance
          </p>
        </div>

        <HealthCard colorIndex={1}>
          <HealthCardHeader className="space-y-1">
            <HealthCardTitle className="text-xl text-center">Sign up</HealthCardTitle>
          </HealthCardHeader>
          <HealthCardContent className="space-y-4">
            {/* Google OAuth Button */}
            <Button
              onClick={handleGoogleSignup}
              variant="outline"
              className="w-full h-12 text-base"
              disabled={isLoading}
              data-testid="button-google-signup"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            {/* Hidden Email Signup Form - Preserved for future use */}
            {isEmailFlowEnabled && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                {/* Email Signup Form */}
                <form onSubmit={handleEmailSignup} className="space-y-4">
              {errors.general && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md" data-testid="text-signup-error">
                  {errors.general}
                </div>
              )}

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">
                  Account Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? "border-red-500" : ""}
                    disabled={isLoading}
                    data-testid="input-email"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500" data-testid="text-email-error">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? "border-red-500" : ""}
                    disabled={isLoading}
                    data-testid="input-password"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500" data-testid="text-password-error">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={errors.confirmPassword ? "border-red-500" : ""}
                    disabled={isLoading}
                    data-testid="input-confirm-password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500" data-testid="text-confirm-password-error">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Pet Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">
                  Pet Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="pet_name">Pet Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="pet_name"
                    name="pet_name"
                    placeholder="Enter your pet's name"
                    value={formData.pet_name}
                    onChange={handleInputChange}
                    className={errors.pet_name ? "border-red-500" : ""}
                    disabled={isLoading}
                    data-testid="input-pet-name"
                  />
                  {errors.pet_name && (
                    <p className="text-sm text-red-500" data-testid="text-pet-name-error">
                      {errors.pet_name}
                    </p>
                  )}
                </div>

                <BreedSelector
                  value={formData.pet_breed}
                  onChange={handleSelectChange('pet_breed')}
                  required
                  error={errors.pet_breed}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Birth Month <span className="text-red-500">*</span></Label>
                    <Select 
                      value={formData.pet_birth_month} 
                      onValueChange={handleSelectChange('pet_birth_month')}
                      disabled={isLoading}
                    >
                      <SelectTrigger 
                        className={errors.pet_birth_month ? "border-red-500" : ""}
                        data-testid="select-birth-month"
                      >
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month.value} value={month.value} data-testid={`option-month-${month.value}`}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.pet_birth_month && (
                      <p className="text-sm text-red-500" data-testid="text-birth-month-error">
                        {errors.pet_birth_month}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Birth Year <span className="text-red-500">*</span></Label>
                    <Select 
                      value={formData.pet_birth_year} 
                      onValueChange={handleSelectChange('pet_birth_year')}
                      disabled={isLoading}
                    >
                      <SelectTrigger 
                        className={errors.pet_birth_year ? "border-red-500" : ""}
                        data-testid="select-birth-year"
                      >
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {YEARS.map((year) => (
                          <SelectItem key={year.value} value={year.value} data-testid={`option-year-${year.value}`}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.pet_birth_year && (
                      <p className="text-sm text-red-500" data-testid="text-birth-year-error">
                        {errors.pet_birth_year}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Gender (optional)</Label>
                  <Select 
                    value={formData.pet_gender} 
                    onValueChange={handleSelectChange('pet_gender')}
                    disabled={isLoading}
                  >
                    <SelectTrigger data-testid="select-gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((gender) => (
                        <SelectItem key={gender.value} value={gender.value} data-testid={`option-gender-${gender.value.toLowerCase()}`}>
                          {gender.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-email-signup"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="text-primary hover:text-primary/80 font-medium"
                    data-testid="link-login"
                  >
                    Sign in
                  </Link>
                </div>
              </>
            )}

            {/* Message when email flow is disabled */}
            {!isEmailFlowEnabled && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Other signup options coming soon
                </p>
                <p className="text-xs text-muted-foreground">
                  For now, please use Google to sign up and we'll help you set up your pet's profile.
                </p>
                <div className="text-xs text-muted-foreground mt-2">
                  <a 
                    href="/?demo=true" 
                    className="text-primary hover:text-primary/80 underline"
                    data-testid="link-demo"
                  >
                    Try demo version
                  </a>
                </div>
              </div>
            )}
          </HealthCardContent>
        </HealthCard>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            For guidance only. Not a veterinary service.
          </p>
        </div>
      </div>
    </div>
  );
}