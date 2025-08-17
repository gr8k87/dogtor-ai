
import React, { useState, useRef } from 'react'
import { FiCamera, FiUpload, FiArrowLeft } from 'react-icons/fi'

function ImageUpload({ onImageUpload, onBack, isLoading, error }) {
  const [selectedImage, setSelectedImage] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUpload = () => {
    const file = fileInputRef.current.files[0]
    if (file && onImageUpload) {
      onImageUpload(file)
    }
  }

  const handleCameraCapture = () => {
    fileInputRef.current.setAttribute('capture', 'environment')
    fileInputRef.current.click()
  }

  const handleBrowseFiles = () => {
    fileInputRef.current.removeAttribute('capture')
    fileInputRef.current.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-6">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">Upload Photo</h1>
            <p className="text-sm text-gray-600">Take or select a clear photo</p>
          </div>
          <div className="w-10 h-10"></div>
        </div>

        {/* Upload Area */}
        <div className="space-y-6">
          
          {/* Preview or Upload Zone */}
          {selectedImage ? (
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <img
                src={selectedImage}
                alt="Selected"
                className="w-full h-64 object-cover rounded-xl"
              />
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => {
                    setSelectedImage(null)
                    fileInputRef.current.value = ''
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Change Photo
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    'Analyze Photo'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`
                bg-white rounded-2xl shadow-lg p-8 border-2 border-dashed transition-all duration-200
                ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUpload className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload a Photo
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  Drag and drop an image here, or click to browse
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleCameraCapture}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FiCamera className="w-5 h-5" />
                    <span>Take Photo</span>
                  </button>
                  
                  <button
                    onClick={handleBrowseFiles}
                    className="w-full px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FiUpload className="w-5 h-5" />
                    <span>Browse Files</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Photo Guidelines</h4>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Take a clear, well-lit photo</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Ensure the subject is in focus</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Include relevant context if needed</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Avoid blurry or dark images</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    </div>
  )
}

export default ImageUpload
