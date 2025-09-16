import React, { useState } from "react";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";

interface BreedSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
  error?: string;
}

// Popular dog and cat breeds
const POPULAR_BREEDS = [
  // Popular Dogs
  "Labrador Retriever",
  "Golden Retriever",
  "German Shepherd",
  "French Bulldog",
  "Bulldog",
  "Poodle",
  "Beagle",
  "Rottweiler",
  "Yorkshire Terrier",
  "Dachshund",
  "Siberian Husky",
  "Boston Terrier",
  "Boxer",
  "Shih Tzu",
  "Border Collie",
  "Australian Shepherd",
  "Chihuahua",
  "Cocker Spaniel",
  "Great Dane",
  "Pomeranian",
  "Jack Russell Terrier",
  "Cavalier King Charles Spaniel",
  "Maltese",
  "Bernese Mountain Dog",
  "Mastiff",
  "Newfoundland",
  "Saint Bernard",
  "Basset Hound",
  "Pit Bull Terrier",
  "Weimaraner",
  "Australian Cattle Dog",
  "Bloodhound",
  "Brittany",
  "Collie",
  "Dalmatian",
  "English Springer Spaniel",
  "Great Pyrenees",
  "Havanese",
  "Irish Setter",
  "Papillon",

  // Popular Cats
  "Domestic Shorthair",
  "Domestic Longhair",
  "Persian",
  "Maine Coon",
  "Siamese",
  "Ragdoll",
  "British Shorthair",
  "Russian Blue",
  "Bengal",
  "American Shorthair",
  "Scottish Fold",
  "Sphynx",
  "Norwegian Forest Cat",
  "Birman",
  "Oriental Shorthair",
  "Devon Rex",
  "Cornish Rex",
  "Manx",
  "Turkish Angora",
  "Exotic Shorthair",
  "Abyssinian",
  "Burmese",
  "Himalayan",
  "Munchkin",
  "Bombay",
  "Egyptian Mau",
  "Selkirk Rex",
  "Tonkinese",
  "Turkish Van",
  "Balinese",
].sort();

const SPECIAL_OPTIONS = ["Mixed breed", "Unknown", "Other"];

export default function BreedSelector({
  value,
  onChange,
  className = "",
  required = false,
  error,
}: BreedSelectorProps) {
  const [showOtherInput, setShowOtherInput] = useState(
    value &&
      !POPULAR_BREEDS.includes(value) &&
      !SPECIAL_OPTIONS.includes(value),
  );

  const handleBreedChange = (newValue: string) => {
    if (newValue === "Other") {
      setShowOtherInput(true);
      onChange(""); // Clear the value so user can type
    } else {
      setShowOtherInput(false);
      onChange(newValue);
    }
  };

  const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium text-foreground">
        Pet Breed {required && <span className="text-red-500">*</span>}
      </Label>

      {showOtherInput ? (
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Enter your pet's breed"
            value={value}
            onChange={handleOtherInputChange}
            className={error ? "border-red-500" : ""}
            data-testid="input-breed-other"
          />
          <button
            type="button"
            onClick={() => {
              setShowOtherInput(false);
              onChange("");
            }}
            className="text-sm text-blue-600 hover:text-blue-700"
            data-testid="button-breed-back"
          >
            ← Back to breed list
          </button>
        </div>
      ) : (
        <div className={error ? "border-red-500 border rounded-md" : ""}>
          <Select
            value={value}
            onValueChange={handleBreedChange}
            required={required}
          >
            <SelectTrigger
              className="w-full text-foreground border-none"
              data-testid="select-breed"
            >
              <SelectValue placeholder="Select your pet's breed" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {/* Special options first */}
              {SPECIAL_OPTIONS.map((option) => (
                <SelectItem
                  key={option}
                  value={option}
                  data-testid={`option-breed-${option.toLowerCase().replace(" ", "-")}`}
                >
                  {option}
                </SelectItem>
              ))}

              {/* Separator */}
              <div className="border-t border-gray-200 my-1" />

              {/* Popular breeds */}
              {POPULAR_BREEDS.map((breed) => (
                <SelectItem
                  key={breed}
                  value={breed}
                  data-testid={`option-breed-${breed.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                >
                  {breed}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500" data-testid="text-breed-error">
          {error}
        </p>
      )}
    </div>
  );
}
