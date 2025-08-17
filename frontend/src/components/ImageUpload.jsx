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
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Upload Dog Health Photo
        </h2>
        
        {preview ? (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-64 object-contain rounded-lg border"
              />
              {!isUploading && (
                <button
                  onClick={() => setPreview(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <i data-feather="x" className="w-4 h-4"></i>
                </button>
              )}
            </div>
            
            {isUploading && (
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                  <span className="text-blue-600">Uploading image...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
              ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            `}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <i data-feather="camera" className="w-8 h-8 text-gray-400"></i>
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop your image here, or click to select
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Take a clear photo of your dog's stool for AI analysis
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
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  <i data-feather="upload" className="w-5 h-5 mr-2"></i>
                  Select Image
                </label>
              </div>
              
              <div className="text-xs text-gray-400 space-y-1">
                <p>• Supported formats: JPG, PNG, WebP</p>
                <p>• Max size: 5MB (will be auto-resized if larger)</p>
                <p>• Best results: clear, well-lit photos</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageUpload
