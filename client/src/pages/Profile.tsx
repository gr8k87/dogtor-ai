import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { HealthCard, HealthCardHeader, HealthCardTitle, HealthCardContent } from '../components/ui/health-card';
import { Separator } from '../components/ui/separator';
import BreedSelector from '../components/BreedSelector';
import { ArrowLeft, User, Save } from '../components/icons';
import { GlobalHeader } from '../components/GlobalHeader';

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
    return months > 0 ? `${months} months` : 'Less than 1 month';
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
  auth_method: 'google' | 'email';
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

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    pet_name: '',
    pet_breed: '',
    pet_birth_month: '',
    pet_birth_year: '',
    pet_gender: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        // Populate form with current data
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          pet_name: userData.pet_name || '',
          pet_breed: userData.pet_breed || '',
          pet_birth_month: userData.pet_birth_month ? userData.pet_birth_month.toString() : '',
          pet_birth_year: userData.pet_birth_year ? userData.pet_birth_year.toString() : '',
          pet_gender: userData.pet_gender || ''
        });
      } else {
        // User not authenticated, redirect to login
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

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

    // Pet information validation (required)
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSaving(true);
    setSaveMessage('');
    
    try {
      const updateData = {
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
        pet_name: formData.pet_name,
        pet_breed: formData.pet_breed,
        pet_birth_month: parseInt(formData.pet_birth_month),
        pet_birth_year: parseInt(formData.pet_birth_year),
        pet_gender: formData.pet_gender || undefined
      };

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setSaveMessage('Profile updated successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setErrors({
          general: errorData.error || 'Failed to update profile. Please try again.'
        });
      }
    } catch (error) {
      setErrors({
        general: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getPetAge = () => {
    if (user?.pet_birth_month && user?.pet_birth_year) {
      return formatPetAge(user.pet_birth_month, user.pet_birth_year);
    }
    return 'Age not set';
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
    <div className="min-h-screen bg-background">
      <GlobalHeader 
        title="Profile" 
        showBackButton={true} 
        onBackClick={() => navigate('/')} 
      />

      <div className="max-w-2xl mx-auto p-4 pb-8 space-y-6">
        {/* User Summary Card */}
        <HealthCard colorIndex={5}>
          <HealthCardHeader>
            <HealthCardTitle className="flex items-center gap-2">
              <User size={20} />
              Account Overview
            </HealthCardTitle>
          </HealthCardHeader>
          <HealthCardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-muted-foreground">
                  {user.auth_method === 'google' ? 'Google Account' : 'Email Account'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Pet</p>
                <p className="font-medium">{user.pet_name || 'Not set'}</p>
                <p className="text-xs text-muted-foreground">{getPetAge()}</p>
              </div>
            </div>
          </HealthCardContent>
        </HealthCard>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal Information */}
          <HealthCard colorIndex={5}>
            <HealthCardHeader>
              <HealthCardTitle>Personal Information</HealthCardTitle>
            </HealthCardHeader>
            <HealthCardContent className="space-y-4">
              {errors.general && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md" data-testid="text-profile-error">
                  {errors.general}
                </div>
              )}

              {saveMessage && (
                <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md" data-testid="text-profile-success">
                  {saveMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    placeholder="Enter your first name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={isSaving}
                    data-testid="input-first-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
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
                <Label>Email Address</Label>
                <Input
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
          <HealthCard colorIndex={5}>
            <HealthCardHeader>
              <HealthCardTitle>Pet Information</HealthCardTitle>
            </HealthCardHeader>
            <HealthCardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pet_name">Pet Name <span className="text-red-500">*</span></Label>
                <Input
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
                    disabled={isSaving}
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
                    disabled={isSaving}
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
                  disabled={isSaving}
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

              {/* Show current age if both month and year are set */}
              {formData.pet_birth_month && formData.pet_birth_year && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    <strong>Current age:</strong> {formatPetAge(parseInt(formData.pet_birth_month), parseInt(formData.pet_birth_year))}
                  </p>
                </div>
              )}
            </HealthCardContent>
          </HealthCard>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="min-w-[120px]"
              data-testid="button-save-profile"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}