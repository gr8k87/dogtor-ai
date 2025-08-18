import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import type { Pet, Assessment } from "@shared/schema";

export default function HistoryTab() {
  const { data: pets = [] } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
  });

  const { data: assessments = [] } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments", pets[0]?.id],
    enabled: !!pets[0]?.id,
  });

  const currentPet = pets[0];

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
      case "vet_recommended": return "Vet Recommended";
      default: return "Monitor";
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Health Timeline</h2>
        <Button variant="ghost" className="text-sm text-primary-600 font-medium hover:text-primary-700">
          Export PDF
        </Button>
      </div>
      
      {/* Pet Profile Card */}
      {currentPet && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center text-2xl">
                🐕
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{currentPet.name}</h3>
                <p className="text-sm text-gray-600">
                  {currentPet.breed && `${currentPet.breed} • `}
                  {currentPet.age && `${currentPet.age}`}
                </p>
                {currentPet.weight && (
                  <p className="text-sm text-gray-600">Weight: {currentPet.weight}</p>
                )}
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                <Edit className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Timeline Items */}
      {assessments.length > 0 ? (
        <div className="space-y-4">
          {assessments.map((assessment, index) => (
            <div key={assessment.id} className="relative">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                </div>
                <Card className="flex-1 border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Health Assessment</h4>
                      <span className="text-xs text-gray-500">
                        {assessment.createdAt ? new Date(assessment.createdAt).toLocaleDateString() : "Recently"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{assessment.symptoms}</p>
                    {assessment.recommendation && (
                      <p className="text-sm text-gray-700 mb-3 font-medium">
                        Recommendation: {assessment.recommendation}
                      </p>
                    )}
                    <div className="flex items-center space-x-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(assessment.status)}`}>
                        {getStatusLabel(assessment.status)}
                      </span>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium p-0 h-auto"
                        data-testid={`button-view-details-${index}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="border-gray-200">
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No health assessments yet.</p>
            <p className="text-sm text-gray-400 mt-1">Start your first assessment in the Diagnose tab.</p>
          </CardContent>
        </Card>
      )}

      {/* Health Metrics */}
      {assessments.length > 0 && (
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Health Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{assessments.length}</div>
                <div className="text-sm text-gray-600">Total Assessments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {assessments.filter(a => a.status === "resolved").length}
                </div>
                <div className="text-sm text-gray-600">Resolved Issues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Vet Visits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {assessments.filter(a => a.status === "monitor").length}
                </div>
                <div className="text-sm text-gray-600">Monitoring</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
