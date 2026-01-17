'use client'

import { useState } from 'react'
import { Type, Volume2, Palette, Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

type Theme = 'light' | 'dark' | 'system'

export default function Settings() {
  const [fontSize, setFontSize] = useState('medium')
  const { theme, setTheme } = useTheme()

  if (theme === undefined) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Customize your experience</p>
        </div>

        <div className="space-y-6">
          {/* Font Size Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Type className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Text Size</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Adjust interface text size</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between gap-4">
                {['small', 'medium', 'large'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-xl transition-all duration-200 ${
                      fontSize === size
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-400'
                        : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-end gap-1">
                      <div className={`rounded-full ${
                        size === 'small' ? 'w-2 h-2' :
                        size === 'medium' ? 'w-3 h-3' :
                        'w-4 h-4'
                      } ${fontSize === size ? 'bg-blue-600 dark:bg-blue-400' : 'bg-gray-400 dark:bg-gray-500'}`} />
                      <div className={`rounded-full ${
                        size === 'small' ? 'w-3 h-3' :
                        size === 'medium' ? 'w-4 h-4' :
                        'w-5 h-5'
                      } ${fontSize === size ? 'bg-blue-600 dark:bg-blue-400' : 'bg-gray-400 dark:bg-gray-500'}`} />
                      <div className={`rounded-full ${
                        size === 'small' ? 'w-4 h-4' :
                        size === 'medium' ? 'w-5 h-5' :
                        'w-6 h-6'
                      } ${fontSize === size ? 'bg-blue-600 dark:bg-blue-400' : 'bg-gray-400 dark:bg-gray-500'}`} />
                    </div>
                    <span className={`text-sm font-medium ${
                      fontSize === size
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Theme Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Theme</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred theme</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                {(['light', 'dark', 'system'] as Theme[]).map((t) => {
                  const Icon = t === 'light' ? Sun : t === 'dark' ? Moon : Monitor
                  return (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`flex flex-col items-center gap-4 p-5 rounded-xl transition-all duration-200 ${
                        theme === t
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500 dark:border-purple-400'
                          : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        theme === t
                          ? 'bg-purple-100 dark:bg-purple-800/30'
                          : 'bg-gray-100 dark:bg-gray-600'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          theme === t
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <div className="text-center">
                        <span className={`text-sm font-medium ${
                          theme === t
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Current Selection Display */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Current Preferences</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <Type className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">Text Size</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {fontSize}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-3">
                  {theme === 'light' ? (
                    <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  ) : theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Monitor className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                  <span className="text-gray-700 dark:text-gray-300">Theme</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {theme}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}