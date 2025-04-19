export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-1 mr-2 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 text-white"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 9.75a6 6 0 0111.573-2.226 3.75 3.75 0 014.133 4.303A4.5 4.5 0 0118 20.25H6.75a5.25 5.25 0 01-2.23-10.004 6.072 6.072 0 01-.02-.496z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600">
                Weather Report System
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              © {new Date().getFullYear()} Weather Report. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
