
import React, { useState, useCallback } from 'react'
import { uploadCaseImage } from '../services/api'

function ImageUpload({ onUploadComplete, onUploadStart }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleFiles = useCallback(async (files) => {
    const file = files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 10MB client-side, server will resize)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file too large. Please select a smaller image.')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)

    // Upload
    setIsUploading(true)
    if (onUploadStart) onUploadStart()

    try {
      const result = await uploadCaseImage(file)
      if (onUploadComplete) {
        onUploadComplete(result)
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
      setPreview(null)
    } finally {
      setIsUploading(false)
    }
  }, [onUploadComplete, onUploadStart])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleFileInput = useCallback((e) => {
    handleFiles(e.target.files)
  }, [handleFiles])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Health Check</h1>
          <p className="text-gray-600">Take a photo for AI analysis</p>
        </div>
        
        {preview ? (
          <div className="space-y-6">
            <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-cover"
              />
              {!isUploading && (
                <button
                  onClick={() => setPreview(null)}
                  className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
            
            {isUploading && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                  <span className="text-blue-600 font-medium">Analyzing image...</span>
                </div>
                <div className="mt-3 bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-700 text-center">Our AI is examining the photo for health indicators</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                bg-white rounded-2xl shadow-lg p-8 text-center cursor-pointer transition-all duration-200
                ${isDragging ? 'bg-blue-50 border-2 border-dashed border-blue-300 scale-105' : 'hover:shadow-xl'}
              `}
            >
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16,16 12,12 8,16"></polyline>
                    <line x1="12" y1="12" x2="12" y2="21"></line>
                    <path d="M20.39 18.39A5 5 0 0 0 16 12h-1.38A7 7 0 1 0 9 20z"></path>
                  </svg>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload Photo
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Drag and drop or tap to select
                  </p>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                    Choose Photo
                  </label>
                </div>
              </div>
            </div>
            
            {/* Tips Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21h6"></path>
                    <path d="M12 3C8.5 3 6 5.5 6 9c0 1 0 3 3 5h6c3-2 3-4 3-5 0-3.5-2.5-6-6-6z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-amber-900 mb-1">Photo Tips</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Clear, well-lit photos work best</li>
                    <li>• Avoid shadows and reflections</li>
                    <li>• JPG, PNG formats supported</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageUpload
