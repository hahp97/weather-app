import dynamic from "next/dynamic";
import Link from "next/link";

const WeatherDisplay = dynamic(
  () => import("@/components/weather/WeatherDisplay")
);

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
          {/* Weather Display Component */}
          <div className="px-4 py-4 sm:px-0">
            <WeatherDisplay />
          </div>

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
                        Generate and view current weather data or view
                        historical data collected every 5 minutes.
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

                <div className="bg-purple-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-purple-900">
                      Report History
                    </h3>
                    <div className="mt-2 text-sm text-purple-600">
                      <p>
                        View your previously generated weather reports and
                        compare them.
                      </p>
                    </div>
                    <div className="mt-4">
                      <Link
                        href="/history"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        View History
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-orange-900">
                      Compare Reports
                    </h3>
                    <div className="mt-2 text-sm text-orange-600">
                      <p>
                        Select and compare two weather reports to analyze
                        differences.
                      </p>
                    </div>
                    <div className="mt-4">
                      <Link
                        href="/compare"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
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
