
import React from 'react';
import { Mail, Globe, MessageCircle } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact & Support</h1>
        
        <div className="space-y-6">
          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-4">
              <Mail className="w-5 h-5 text-blue-500 mr-3" />
              <h2 className="text-xl font-semibold">Email Support</h2>
            </div>
            <p className="text-gray-600 mb-2">
              For technical support, account issues, or general inquiries:
            </p>
            <a 
              href="mailto:support@hellodogtor.com" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              support@hellodogtor.com
            </a>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-4">
              <MessageCircle className="w-5 h-5 text-green-500 mr-3" />
              <h2 className="text-xl font-semibold">Privacy & Legal</h2>
            </div>
            <p className="text-gray-600 mb-2">
              For privacy policy questions or legal matters:
            </p>
            <a 
              href="mailto:privacy@hellodogtor.com" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              privacy@hellodogtor.com
            </a>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-4">
              <Globe className="w-5 h-5 text-purple-500 mr-3" />
              <h2 className="text-xl font-semibold">Website</h2>
            </div>
            <p className="text-gray-600 mb-2">
              Visit our website for more information:
            </p>
            <a 
              href="https://app.hellodogtor.com" 
              className="text-blue-600 hover:text-blue-800 font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              app.hellodogtor.com
            </a>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Emergency Disclaimer</h3>
            <p className="text-yellow-700 text-sm">
              For pet emergencies, do not use this app. Contact your local emergency 
              veterinary clinic immediately. Dogtor AI is not a veterinary service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
