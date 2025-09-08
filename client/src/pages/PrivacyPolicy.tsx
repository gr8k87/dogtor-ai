
import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-sm text-gray-500 mb-6">Last updated: January 18, 2025</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              When you use Dogtor AI, we may collect the following information:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Account information (email, name) when you create an account</li>
              <li>Pet information you provide (name, breed, age, symptoms)</li>
              <li>Photos you upload for diagnosis purposes</li>
              <li>Usage data and app performance metrics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide AI-powered veterinary guidance</li>
              <li>Improve our app and services</li>
              <li>Communicate with you about your account</li>
              <li>Ensure app security and prevent misuse</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Data Storage and Security</h2>
            <p className="mb-4">
              Your data is stored securely using industry-standard encryption. 
              Photos and personal information are encrypted both in transit and at rest.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
            <p className="mb-4">
              We do not sell, trade, or share your personal information with third parties 
              except as necessary to provide our services (such as AI processing) or as 
              required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Important Disclaimer</h2>
            <p className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
              <strong>Dogtor AI is not a veterinary service.</strong> Our app provides 
              guidance only and should never replace professional veterinary care. 
              Always consult with a licensed veterinarian for actual medical advice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
            <p className="mb-4">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mb-4">
              Email: privacy@hellodogtor.com<br />
              Website: app.hellodogtor.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
