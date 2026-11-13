import { useState, useRef } from 'react'
import api from '../api/axiosConfig'

export default function ImageUploader({
  onUploadSuccess,
  endpoint,
  multiple = true,
  label = 'Upload Images'
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState('')
  const [preview, setPreview]     = useState([])
  const fileInputRef              = useRef()

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Show preview immediately
    const previews = files.map(f => URL.createObjectURL(f))
    setPreview(previews)

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append(multiple ? 'files' : 'file', file)
      })

      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      onUploadSuccess(res.data)
      setPreview([])

    } catch (err) {
      setError('Upload failed. Please try again.')
      console.error(err)
    } finally {
      setUploading(false)
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      {/* Upload area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300
                   rounded-xl p-6 text-center cursor-pointer
                   hover:border-primary-400 hover:bg-primary-50
                   transition-all duration-200">

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-primary-500
                            border-t-transparent rounded-full
                            animate-spin" />
            <p className="text-primary-500 text-sm">Uploading...</p>
          </div>
        ) : (
          <>
            <p className="text-3xl mb-2">📸</p>
            <p className="text-gray-600 font-medium text-sm">
              {label}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Click to select {multiple ? 'images' : 'image'}
            </p>
            <p className="text-gray-300 text-xs mt-1">
              JPG, PNG up to 10MB
            </p>
          </>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Preview */}
      {preview.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {preview.map((src, i) => (
            <div key={i}
                 className="w-16 h-16 rounded-xl overflow-hidden
                            border border-gray-200">
              <img src={src} alt=""
                   className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-500 text-xs mt-2">⚠️ {error}</p>
      )}
    </div>
  )
}