import Link from "next/link";

export default function Home() {
  return (
    <div className="py-10">
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">
            Changi Airport Weather Report System
          </h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-6 bg-white">
              <p className="mb-6 text-gray-600">
                Welcome to the Weather Report System for Changi Airport. This
                application provides real-time weather data for Changi Airport
                (Lat: 1.3586° N, Long: 103.9899° E) using the OpenWeather API.
              </p>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-blue-900">
                      Generate Weather Report
                    </h3>
                    <div className="mt-2 text-sm text-blue-600">
                      <p>
                        Generate and view current weather data or for a specific
                        date.
                      </p>
                    </div>
                    <div className="mt-4">
                      <Link
                        href="/generate"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Generate Report
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-blue-900">
                      View Report History
                    </h3>
                    <div className="mt-2 text-sm text-blue-600">
                      <p>
                        Browse through previously generated weather reports.
                      </p>
                    </div>
                    <div className="mt-4">
                      <Link
                        href="/history"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View History
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-blue-900">
                      Compare Reports
                    </h3>
                    <div className="mt-2 text-sm text-blue-600">
                      <p>
                        Select two reports and compare their weather parameters.
                      </p>
                    </div>
                    <div className="mt-4">
                      <Link
                        href="/compare"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Compare Reports
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
