import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, MapPin, Phone, Navigation, Video } from "lucide-react";
import type { VetClinic } from "@shared/schema";

export default function ConnectTab() {
  const [searchLocation, setSearchLocation] = useState("");
  
  const { data: vetClinics = [] } = useQuery<VetClinic[]>({
    queryKey: ["/api/vet-clinics"],
  });

  const handleCallEmergency = () => {
    window.open("tel:+15551234567", "_self");
  };

  const handleCallVet = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleGetDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://maps.google.com?q=${encodedAddress}`, "_blank");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-100 text-green-800";
      case "busy": return "bg-yellow-100 text-yellow-800";
      case "closed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open": return "Open";
      case "busy": return "Busy";
      case "closed": return "Closed";
      default: return "Unknown";
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Connect with Veterinarians</h2>
      
      {/* Emergency Contact */}
      <Card className="bg-red-50 border-2 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800">Emergency Hotline</h3>
              <p className="text-sm text-red-700">24/7 Emergency Veterinary Service</p>
            </div>
          </div>
          <Button
            data-testid="button-call-emergency"
            onClick={handleCallEmergency}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            Call Emergency Vet: (555) 123-PETS
          </Button>
        </CardContent>
      </Card>

      {/* Location Search */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Find Vets Near You</h3>
          <div className="space-y-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                data-testid="input-location-search"
                type="text"
                placeholder="Enter your zip code or city"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              data-testid="button-search-vets"
              className="w-full bg-primary-600 hover:bg-primary-700"
            >
              Search Veterinarians
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Nearby Vets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Nearby Veterinarians</h3>
          <Button variant="ghost" className="text-sm text-primary-600 hover:text-primary-700">
            View All
          </Button>
        </div>
        
        {vetClinics.map((clinic) => (
          <Card key={clinic.id} className="border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  🏥
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{clinic.name}</h4>
                  <p className="text-sm text-gray-600">{clinic.address}</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm font-medium">{clinic.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">{clinic.distance}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(clinic.status || "")}`}>
                      {getStatusLabel(clinic.status || "")}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button
                    data-testid={`button-call-vet-${clinic.id}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCallVet(clinic.phone || "")}
                    className="p-2 text-primary-600 hover:bg-primary-50"
                  >
                    <Phone className="w-5 h-5" />
                  </Button>
                  <Button
                    data-testid={`button-directions-${clinic.id}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleGetDirections(clinic.address)}
                    className="p-2 text-gray-600 hover:bg-gray-50"
                  >
                    <Navigation className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Telemedicine Option */}
      <Card className="bg-blue-50 border border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800">Virtual Consultation</h3>
              <p className="text-sm text-blue-700">Connect with licensed vets online</p>
            </div>
          </div>
          <Button 
            data-testid="button-virtual-consultation"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Start Virtual Consultation - $49
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
