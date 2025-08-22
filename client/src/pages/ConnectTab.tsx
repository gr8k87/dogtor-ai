
import React from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";

export default function ConnectTab() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-4">
        <div className="pt-4">
          <h1 className="text-2xl font-bold text-foreground mb-6">Connect to Vet</h1>
        </div>

        {/* Emergency Contact Card */}
        <Card className="opacity-75">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              <CardTitle className="text-xl">Emergency Contact</CardTitle>
              <span className="ml-auto px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground">Coming Soon</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-red-800">24/7 Emergency Clinic</h3>
                    <p className="text-sm text-red-600">VCA Animal Hospital</p>
                    <p className="text-xs text-red-500">2.3 km away</p>
                  </div>
                  <Button disabled variant="outline" className="border-red-300 text-red-600 opacity-50">
                    Call Now
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-orange-800">Pet Poison Helpline</h3>
                    <p className="text-sm text-orange-600">24/7 Toxicology Support</p>
                    <p className="text-xs text-orange-500">1-855-764-7661</p>
                  </div>
                  <Button disabled variant="outline" className="border-orange-300 text-orange-600 opacity-50">
                    Call
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <h3 className="font-medium text-foreground mb-2">When to call immediately:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Difficulty breathing or choking</li>
                  <li>• Severe bleeding or trauma</li>
                  <li>• Loss of consciousness</li>
                  <li>• Suspected poisoning</li>
                </ul>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Find a Vet Card */}
        <Card className="opacity-75">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔍</span>
              <CardTitle className="text-xl">Find a Vet</CardTitle>
              <span className="ml-auto px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground">Coming Soon</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Enter your location or zip code"
                disabled
                className="pl-10 opacity-50"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">📍</span>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button disabled variant="outline" size="sm" className="opacity-50">General Practice</Button>
              <Button disabled variant="outline" size="sm" className="opacity-50">Emergency</Button>
              <Button disabled variant="outline" size="sm" className="opacity-50">Specialist</Button>
              <Button disabled variant="outline" size="sm" className="opacity-50">24/7</Button>
            </div>

            <div className="space-y-3">
              {[
                { name: "Healthy Paws Veterinary", rating: "4.8", distance: "1.2 km", specialty: "General Practice" },
                { name: "Central Animal Hospital", rating: "4.6", distance: "2.1 km", specialty: "Emergency & Surgery" },
                { name: "PetCare Plus Clinic", rating: "4.7", distance: "3.5 km", specialty: "Dermatology" }
              ].map((vet, i) => (
                <Card key={i}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{vet.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-yellow-600">⭐ {vet.rating}</span>
                          <span className="text-sm text-muted-foreground">• {vet.distance}</span>
                          <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">{vet.specialty}</span>
                        </div>
                      </div>
                      <Button disabled size="sm" className="opacity-50">
                        Book
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call TeleVet Card */}
        <Card className="opacity-75">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📱</span>
              <CardTitle className="text-xl">Call TeleVet</CardTitle>
              <span className="ml-auto px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground">Coming Soon</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Get professional veterinary advice through video consultation from the comfort of your home.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <span className="text-2xl mb-2 block">💬</span>
                  <h3 className="font-medium text-foreground text-sm">Chat Consultation</h3>
                  <p className="text-xs text-muted-foreground mt-1">$25 CAD</p>
                  <Button disabled variant="outline" size="sm" className="w-full mt-2 opacity-50">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 text-center">
                  <span className="text-2xl mb-2 block">📹</span>
                  <h3 className="font-medium text-foreground text-sm">Video Call</h3>
                  <p className="text-xs text-muted-foreground mt-1">$45 CAD</p>
                  <Button disabled variant="outline" size="sm" className="w-full mt-2 opacity-50">
                    Start Video
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3">
                <h3 className="font-medium text-blue-800 text-sm mb-2">Available Services:</h3>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Symptom assessment and guidance</li>
                  <li>• Medication questions</li>
                  <li>• Behavioral concerns</li>
                  <li>• Follow-up consultations</li>
                  <li>• Second opinions</li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm text-green-700">3 veterinarians available now</span>
            </div>

            <Button disabled className="w-full opacity-50">
              Connect with Vet Now
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Average response time: 2 minutes
            </p>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <span className="text-orange-500 text-lg">⚠️</span>
              <div>
                <h3 className="font-medium text-orange-800 mb-1">Important Disclaimer</h3>
                <p className="text-orange-700 text-sm">
                  Telemedicine consultations are not suitable for emergency situations. 
                  For urgent cases, please contact your local emergency veterinary clinic immediately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
