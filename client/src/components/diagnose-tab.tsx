import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Pet, Assessment } from "@shared/schema";

export default function DiagnoseTab() {
  const [petName, setPetName] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [breed, setBreed] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pets = [] } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
  });

  const { data: recentAssessments = [] } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments", pets[0]?.id],
    enabled: !!pets[0]?.id,
  });

  const createAssessmentMutation = useMutation({
    mutationFn: async (data: { petId: string; symptoms: string; status: string; recommendation: string }) => {
      const response = await apiRequest("POST", "/api/assessments", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Assessment Created",
        description: "Your pet's symptoms have been assessed.",
      });
      setSymptoms("");
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create assessment.",
        variant: "destructive",
      });
    },
  });

  const createPetMutation = useMutation({
    mutationFn: async (data: { name: string; breed?: string; age?: string }) => {
      const response = await apiRequest("POST", "/api/pets", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
    },
  });

  const handleStartAssessment = async () => {
    if (!petName || !symptoms) {
      toast({
        title: "Missing Information",
        description: "Please fill in your pet's name and symptoms.",
        variant: "destructive",
      });
      return;
    }

    let petId = pets.find(p => p.name === petName)?.id;
    
    if (!petId) {
      // Create new pet
      const newPet = await createPetMutation.mutateAsync({
        name: petName,
        breed,
        age,
      });
      petId = newPet.id;
    }

    // Simple AI assessment logic
    const recommendation = symptoms.toLowerCase().includes("emergency") || 
                          symptoms.toLowerCase().includes("breathing") ||
                          symptoms.toLowerCase().includes("bleeding")
      ? "Seek immediate veterinary care"
      : "Monitor symptoms and consider vet visit if they persist";

    const status = recommendation.includes("immediate") ? "vet_recommended" : "monitor";

    createAssessmentMutation.mutate({
      petId,
      symptoms,
      status,
      recommendation,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "bg-green-100 text-green-800";
      case "vet_recommended": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "resolved": return "Resolved";
      case "vet_recommended": return "Vet Needed";
      default: return "Monitor";
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Quick Assessment Card */}
      <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quick Health Assessment</h2>
              <p className="text-sm text-gray-600">Help us understand your pet's symptoms</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="pet-name" className="text-sm font-medium text-gray-700">Pet's Name</Label>
              <Input
                id="pet-name"
                data-testid="input-pet-name"
                type="text"
                placeholder="Enter your pet's name"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="symptoms" className="text-sm font-medium text-gray-700">What's concerning you?</Label>
              <Textarea
                id="symptoms"
                data-testid="textarea-symptoms"
                placeholder="Describe your pet's symptoms..."
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="mt-2 resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="age" className="text-sm font-medium text-gray-700">Age</Label>
                <Select value={age} onValueChange={setAge}>
                  <SelectTrigger data-testid="select-age" className="mt-2">
                    <SelectValue placeholder="Select age" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="puppy">Puppy (0-1 year)</SelectItem>
                    <SelectItem value="young">Young (1-3 years)</SelectItem>
                    <SelectItem value="adult">Adult (3-7 years)</SelectItem>
                    <SelectItem value="senior">Senior (7+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="breed" className="text-sm font-medium text-gray-700">Breed</Label>
                <Input
                  id="breed"
                  data-testid="input-breed"
                  type="text"
                  placeholder="e.g., Golden Retriever"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
            
            <Button
              data-testid="button-start-assessment"
              onClick={handleStartAssessment}
              disabled={createAssessmentMutation.isPending}
              className="w-full bg-primary-600 hover:bg-primary-700"
            >
              {createAssessmentMutation.isPending ? "Assessing..." : "Start Assessment"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Notice */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-800">Emergency Situations</h3>
              <p className="text-sm text-red-700 mt-1">
                If your pet is experiencing severe symptoms, difficulty breathing, or trauma, contact your veterinarian immediately.
              </p>
              <Button variant="link" className="mt-2 text-sm text-red-600 font-medium hover:text-red-800 p-0 h-auto">
                Find Emergency Vet →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Assessments */}
      {recentAssessments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Recent Assessments</h3>
          
          {recentAssessments.slice(0, 3).map((assessment) => (
            <Card key={assessment.id} className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      assessment.status === "resolved" ? "bg-green-400" :
                      assessment.status === "vet_recommended" ? "bg-red-400" : "bg-yellow-400"
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{petName}</p>
                      <p className="text-sm text-gray-600">{assessment.symptoms}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {assessment.createdAt ? new Date(assessment.createdAt).toLocaleDateString() : "Recently"}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(assessment.status)}`}>
                      {getStatusLabel(assessment.status)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
