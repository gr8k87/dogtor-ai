
import React from "react";

export default function ConnectTab() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-4">
        <div className="pt-4">
          <h1 className="text-2xl font-bold text-foreground mb-6">Connect to Vet</h1>
        </div>

        {/* Emergency Contact Card */}
        <div className="card p-6 opacity-75">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🚨</span>
            <h2 className="text-xl font-semibold text-foreground">Emergency Contact</h2>
            <span className="ml-auto px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground">Coming Soon</span>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-red-800">24/7 Emergency Clinic</h3>
                  <p className="text-sm text-red-600">VCA Animal Hospital</p>
                  <p className="text-xs text-red-500">2.3 km away</p>
                </div>
                <button disabled className="btn btn-outline border-red-300 text-red-600 opacity-50 cursor-not-allowed">
                  Call Now
                </button>
              </div>
            </div>
            
            <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-orange-800">Pet Poison Helpline</h3>
                  <p className="text-sm text-orange-600">24/7 Toxicology Support</p>
                  <p className="text-xs text-orange-500">1-855-764-7661</p>
                </div>
                <button disabled className="btn btn-outline border-orange-300 text-orange-600 opacity-50 cursor-not-allowed">
                  Call
                </button>
              </div>
            </div>

            <div className="p-3 border border-border rounded-lg">
              <h3 className="font-medium text-foreground mb-2">When to call immediately:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Difficulty breathing or choking</li>
                <li>• Severe bleeding or trauma</li>
                <li>• Loss of consciousness</li>
                <li>• Suspected poisoning</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Find a Vet Card */}
        <div className="card p-6 opacity-75">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🔍</span>
            <h2 className="text-xl font-semibold text-foreground">Find a Vet</h2>
            <span className="ml-auto px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground">Coming Soon</span>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Enter your location or zip code"
                disabled
                className="input w-full pl-10 opacity-50 cursor-not-allowed"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">📍</span>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button disabled className="btn btn-outline text-xs opacity-50 cursor-not-allowed">General Practice</button>
              <button disabled className="btn btn-outline text-xs opacity-50 cursor-not-allowed">Emergency</button>
              <button disabled className="btn btn-outline text-xs opacity-50 cursor-not-allowed">Specialist</button>
              <button disabled className="btn btn-outline text-xs opacity-50 cursor-not-allowed">24/7</button>
            </div>

            <div className="space-y-3">
              {[
                { name: "Healthy Paws Veterinary", rating: "4.8", distance: "1.2 km", specialty: "General Practice" },
                { name: "Central Animal Hospital", rating: "4.6", distance: "2.1 km", specialty: "Emergency & Surgery" },
                { name: "PetCare Plus Clinic", rating: "4.7", distance: "3.5 km", specialty: "Dermatology" }
              ].map((vet, i) => (
                <div key={i} className="p-3 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{vet.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-yellow-600">⭐ {vet.rating}</span>
                        <span className="text-sm text-muted-foreground">• {vet.distance}</span>
                        <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">{vet.specialty}</span>
                      </div>
                    </div>
                    <button disabled className="btn btn-primary text-sm opacity-50 cursor-not-allowed">
                      Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call TeleVet Card */}
        <div className="card p-6 opacity-75">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📱</span>
            <h2 className="text-xl font-semibold text-foreground">Call TeleVet</h2>
            <span className="ml-auto px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground">Coming Soon</span>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Get professional veterinary advice through video consultation from the comfort of your home.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border border-border rounded-lg text-center">
                <span className="text-2xl mb-2 block">💬</span>
                <h3 className="font-medium text-foreground text-sm">Chat Consultation</h3>
                <p className="text-xs text-muted-foreground mt-1">$25 CAD</p>
                <button disabled className="btn btn-outline w-full mt-2 text-xs opacity-50 cursor-not-allowed">
                  Start Chat
                </button>
              </div>
              
              <div className="p-3 border border-border rounded-lg text-center">
                <span className="text-2xl mb-2 block">📹</span>
                <h3 className="font-medium text-foreground text-sm">Video Call</h3>
                <p className="text-xs text-muted-foreground mt-1">$45 CAD</p>
                <button disabled className="btn btn-outline w-full mt-2 text-xs opacity-50 cursor-not-allowed">
                  Start Video
                </button>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-800 text-sm mb-2">Available Services:</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Symptom assessment and guidance</li>
                <li>• Medication questions</li>
                <li>• Behavioral concerns</li>
                <li>• Follow-up consultations</li>
                <li>• Second opinions</li>
              </ul>
            </div>

            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm text-green-700">3 veterinarians available now</span>
            </div>

            <button disabled className="btn btn-primary w-full opacity-50 cursor-not-allowed">
              Connect with Vet Now
            </button>
            
            <p className="text-xs text-center text-muted-foreground">
              Average response time: 2 minutes
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="card p-4 bg-orange-50 border border-orange-200">
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
        </div>
      </div>
    </div>
  );
}
