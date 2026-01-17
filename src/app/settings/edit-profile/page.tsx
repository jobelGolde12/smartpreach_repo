'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowLeft, Upload, User, X, Camera, Check, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { updateUserData, getUserData } from '@/lib/serverActions'

export default function EditProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    churchName: '',
    bio: '',
    profilePic: null as string | null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    setIsLoadingProfile(true)
    try {
      const userId = localStorage.getItem('userId')

      if (userId) {
        const userData = await getUserData(userId)
        if (userData) {
          setFormData({
            name: userData.name || '',
            email: userData.email,
            contactNumber: userData.contact_number || '',
            churchName: userData.church_name || '',
            bio: userData.bio || '',
            profilePic: userData.profile_pic || null,
          })
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoadingProfile(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setImageError(null)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      validateAndProcessImage(file)
    }
  }

  const validateAndProcessImage = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('Please upload an image file (JPEG, PNG, etc.)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setFormData(prev => ({ ...prev, profilePic: base64 }))
      setImageError(null)
    }
    reader.onerror = () => {
      setImageError('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageError(null)
      validateAndProcessImage(file)
    }
  }

  const removeProfilePic = () => {
    setFormData(prev => ({ ...prev, profilePic: null }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        alert('User not logged in')
        return
      }

      const result = await updateUserData(userId, {
        name: formData.name,
        email: formData.email,
        profile_pic: formData.profilePic,
        contact_number: formData.contactNumber || null,
        church_name: formData.churchName || null,
        bio: formData.bio || null,
      })

      if (result.success) {
        // Show success feedback
        const submitBtn = e.currentTarget.querySelector('button[type="submit"]')
        if (submitBtn) {
          const originalText = submitBtn.textContent
          submitBtn.textContent = 'Saved!'
          submitBtn.classList.add('bg-green-600')
          setTimeout(() => {
            submitBtn.textContent = originalText
            submitBtn.classList.remove('bg-green-600')
          }, 1500)
        }
        setTimeout(() => router.push('/settings/account'), 1600)
      } else {
        alert('Failed to update profile: ' + result.error)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/settings/account"
              className="group p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:translate-x-[-2px] transition-transform" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Update your personal information</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                 <div>
                   <h3 className="font-semibold text-gray-900 dark:text-white">Profile Picture <span className="text-sm font-normal text-gray-500">(Optional)</span></h3>
                   <p className="text-sm text-gray-500 dark:text-gray-400">Upload or drag & drop an image</p>
                 </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Image Preview */}
                <div className="relative">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-600">
                    {formData.profilePic ? (
                      <img
                        src={formData.profilePic}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={() => setImageError('Failed to load image')}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-16 h-16 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {formData.profilePic && (
                    <button
                      type="button"
                      onClick={removeProfilePic}
                      className="absolute -top-2 -right-2 w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Upload Area */}
                <div className="flex-1 w-full">
                  <div
                    ref={dropZoneRef}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer
                      ${isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
                      }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {isDragging ? (
                        <Upload className="w-8 h-8 text-blue-500 animate-bounce" />
                      ) : (
                        <Upload className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {isDragging ? 'Drop your image here' : 'Click to upload or drag & drop'}
                      </p>
                       <p className="text-sm text-gray-500 dark:text-gray-400">
                         PNG, JPG, GIF up to 5MB (Optional)
                       </p>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="profile-pic-upload"
                    />
                    
                    <button
                      type="button"
                      className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors duration-200"
                    >
                      <Upload className="w-4 h-4" />
                      Choose File
                    </button>
                  </div>

                  {imageError && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <p className="text-red-600 dark:text-red-400 text-sm">{imageError}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Update your contact details</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                     Contact Number <span className="text-gray-500">(Optional)</span>
                   </label>
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    placeholder="Enter your contact number"
                  />
                </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                     Church Name <span className="text-gray-500">(Optional)</span>
                   </label>
                  <input
                    type="text"
                    value={formData.churchName}
                    onChange={(e) => handleInputChange('churchName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    placeholder="Enter your church name"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                       Bio <span className="text-gray-500">(Optional)</span>
                     </label>
                    <span className="text-sm text-gray-500">{formData.bio.length}/500</span>
                  </div>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-colors"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Removed sticky positioning */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/settings/account"
                className="flex-1 py-4 px-6 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-center flex items-center justify-center gap-2"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading || isLoadingProfile}
                className="flex-1 py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 