import Link from 'next/link';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Smart Preach
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A modern, responsive web application designed for church preaching, allowing pastors to instantly display Bible verses during services.
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Live Verse Search
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Search for Bible verses by keyword, phrase, or verse reference with a smooth 300ms debounced search experience.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Verse Display Screen
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Large, readable verse display with smooth animations and fullscreen mode for congregation viewing.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Verse Suggestion Panel
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Shows search results, recently used verses, and favorites in a collapsible sidebar.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Bible API Integration
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Uses bible-api.com for King James Version verses with graceful error handling.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Turso Database
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Stores search history, recent verses, and favorites for quick access.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Responsive Design
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Optimized for desktop, tablet, and mobile devices with adaptive layouts.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Fullscreen Mode
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Presentation-ready layout for congregation viewing with distraction-free display.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Dark Mode Support
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Friendly for different lighting conditions with toggleable dark mode.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Voice Recognition
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Allows pastors to search for verses using voice commands for hands-free operation.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Notes Management
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Create and manage notes with associated Bible verses for sermon preparation.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Presentations
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Create and manage presentations with multiple verses for organized sermon delivery.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Tech Stack
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Frontend
                </h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                  <li>Next.js (App Router) - React framework</li>
                  <li>Tailwind CSS - Styling</li>
                  <li>TypeScript - Type safety</li>
                  <li>lucide-react - Icons</li>
                  <li>Web Speech API - Voice recognition</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Backend
                </h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                  <li>Turso (SQLite + libSQL) - Database</li>
                  <li>Server Actions - Database operations</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Get Started
            </h2>
            <div className="space-y-4">
              <Link
                href="/login"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                Register
              </Link>
              <Link
                href="/"
                className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                Go to Application
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}