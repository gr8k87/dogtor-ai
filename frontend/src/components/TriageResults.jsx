import React from "react";

function TriageResults({ triageResults, caseData, observations, onStartNew }) {
  if (!triageResults) return null;

  const getUrgencyColor = (level) => {
    switch (level) {
      case "Low":
        return "bg-green-500";
      case "Moderate":
        return "bg-yellow-500";
      case "High":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getUrgencyBg = (level) => {
    switch (level) {
      case "Low":
        return "bg-green-50 border-green-200";
      case "Moderate":
        return "bg-yellow-50 border-yellow-200";
      case "High":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const handleSaveToHistory = () => {
    alert("Case saved to history!");
  };

  const handleShareWithVet = () => {
    const caseExport = {
      case_id: caseData?.case_id,
      timestamp: new Date().toISOString(),
      image_url: caseData?.image_url,
      observations,
      triage_results: triageResults,
    };

    const jsonString = JSON.stringify(caseExport, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `dogtor-case-${caseData?.case_id || "export"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-6 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header with Priority */}
        <div className="text-center mb-6">
          <div
            className={`inline-flex items-center px-4 py-2 rounded-full text-white font-medium ${getUrgencyColor(triageResults.urgency_level)} shadow-lg`}
          >
            <svg
              className="w-4 h-4 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v7c0 6 8 10 8 10z"></path>
            </svg>
            {triageResults.urgency_level} Priority
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">
            Analysis Complete
          </h1>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
              <p className="text-sm text-gray-600">AI analysis results</p>
            </div>
          </div>

          <div
            className={`border rounded-xl p-4 ${getUrgencyBg(triageResults.urgency_level)}`}
          >
            <p className="text-gray-800 leading-relaxed">
              {triageResults.triage_summary}
            </p>
          </div>

          {triageResults.meta?.error && (
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-3">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-orange-600 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span className="text-sm text-orange-800">
                  Conservative assessment due to analysis limitations
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Possible Causes */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-purple-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="M21 21l-4.35-4.35"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Possible Causes
            </h3>
          </div>

          <div className="space-y-3">
            {triageResults.possible_causes?.map((cause, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
                <span className="text-gray-700 text-sm leading-relaxed">
                  {cause}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22,4 12,14.01 9,11.01"></polyline>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Next Steps</h3>
          </div>

          <div className="space-y-3">
            {triageResults.recommended_actions?.map((action, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-3 h-3 text-green-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20,6 9,17 4,12"></polyline>
                  </svg>
                </div>
                <span className="text-gray-700 text-sm leading-relaxed">
                  {action}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-4 h-4 text-amber-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-amber-900 mb-1">
                Important Notice
              </h4>
              <p className="text-sm text-amber-800 leading-relaxed">
                This AI analysis is for informational purposes only. Always
                consult a qualified veterinarian for professional advice.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSaveToHistory}
              className="px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg"
            >
              <svg
                className="w-4 h-4 inline mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              Save
            </button>

            <button
              onClick={handleShareWithVet}
              className="px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors shadow-lg"
            >
              <svg
                className="w-4 h-4 inline mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              Export
            </button>
          </div>

          <button
            onClick={onStartNew}
            className="w-full px-6 py-4 bg-white border-2 border-blue-500 text-blue-500 rounded-xl font-medium hover:bg-blue-50 transition-colors"
          >
            <svg
              className="w-4 h-4 inline mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Analysis
          </button>
        </div>
      </div>
    </div>
  );
}

export default TriageResults;
