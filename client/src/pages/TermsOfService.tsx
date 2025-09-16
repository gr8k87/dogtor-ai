import React from "react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Terms of Service
        </h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-sm text-gray-500 mb-6">
            Last updated: January 18, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="mb-4">
              By using Dogtor AI, you agree to these Terms of Service. If you
              don't agree with any part of these terms, please don't use our
              app.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              2. Description of Service
            </h2>
            <p className="mb-4">
              Dogtor AI is an AI-powered app that provides preliminary guidance
              about pet health concerns. We analyze photos and symptoms to offer
              suggestions for further care.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              3. Important Medical Disclaimer
            </h2>
            <div className="p-6 bg-red-50 border-l-4 border-red-400 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">
                NOT A VETERINARY SERVICE
              </h3>
              <p className="text-red-700">
                <strong>
                  Dogtor AI is not a replacement for professional veterinary
                  care.
                </strong>
                Our app provides guidance only and should never be used as a
                substitute for professional veterinary diagnosis, treatment, or
                advice. Always consult with a licensed veterinarian for actual
                medical care of your pet.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              4. User Responsibilities
            </h2>
            <p className="mb-4">You agree to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide accurate information about your pet</li>
              <li>
                Use the app responsibly and not rely solely on our guidance
              </li>
              <li>Seek professional veterinary care when needed</li>
              <li>Not misuse the app or attempt to harm our systems</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              5. Limitation of Liability
            </h2>
            <p className="mb-4">
              Dogtor AI and its creators are not liable for any consequences
              resulting from the use of our app. Our guidance is provided "as
              is" without warranties of any kind.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Privacy</h2>
            <p className="mb-4">
              Your privacy is important to us. Please review our Privacy Policy
              to understand how we collect and use your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              7. Emergency Situations
            </h2>
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 mb-4">
              <p className="text-yellow-800">
                <strong>In case of pet emergency:</strong> Do not use this app.
                Contact your local emergency veterinary clinic immediately.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
            <p className="mb-4">
              We may update these terms from time to time. Continued use of the
              app constitutes acceptance of any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              9. Contact Information
            </h2>
            <p className="mb-4">For questions about these Terms of Service:</p>
            <p className="mb-4">
              Email: support@hellodogtor.com
              <br />
              Website: app.hellodogtor.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
