**Full Stack Technical Assessment: Changi Airport Weather Report
System** (codename "Scanner")

**Overview**

As a Full Stack Developer, your task is to build a **Weather Report
Application** that provides users with real-time weather reports for
**Changi Airport (Lat: 1.3586° N, Long: 103.9899° E)** using the
[OpenWeather API](https://openweathermap.org/).

The application should allow users to:

- Generate and view weather reports.

- Store reports in a history log for future reference.

- Select two reports and compare their deviations.

The report should only consist of the following data from OpenWeather
API:

- Temperature (°C)

- Pressure (hPa)

- Humidity (%)

- Cloud Cover (%)

**Features & Requirements**

**Frontend**

**Weather Report Generation Page**

- UI to generate and display a weather report for the current timestamp
  or a designated date.

- Report should be displayed in an orderly manner to the user once it is
  generated.

**History Page**

- Displays a list/table of all previously generated weather reports.

- Each report should include:

  - **Timestamp**

  - **Temperature (°C)**

  - **Pressure (hPa)**

  - **Humidity (%)**

  - **Cloud Cover (%)**

- Optional: Filters & sorting feature for each report item can be
  included in the list/table optionally.

- Allow users to select two reports for comparison.

**Comparison Page**

- Displays two selected reports side by side in a structured table
  format.

- Includes a **Deviation Column** for each weather parameter (excluding
  timestamp) to highlight differences.

- A sample display is as follows:

|             | Report 1             | Report 2             | Deviation |
|-------------|----------------------|----------------------|-----------|
| Timestamp   | 12 Dec 2025 12:00:01 | 13 Dec 2025 16:00:10 | **-**     |
| Temperature | 30                   | 40                   | **10**    |

**Navigation & UX**

- Basic navigation should be included between pages.

- Include loading elements in the UI if applicable.

**Backend**

**Server Implementation**

- Set up a backend to handle API requests and store weather reports in a
  database.

- Retrieve weather data from the [OpenWeather
  API](https://openweathermap.org/api).

**Data Handling**

- Accept frontend inputs and fetch relevant weather data.

- Store weather reports in a database for historical reference.

- Return formatted data to the frontend for display.

**Technology Stack**

- **Frontend**: HTML, CSS, JavaScript (or React, Vue, etc.)

- **Backend**: Golang (preferred) or Node.js

- **Database**: PostgreSQL / MongoDB / MySQL

- **API Integration**: OpenWeather API

**Project Deliverables**

1.  **Code**

- Store all source code in a **public GitHub repository** (or similar
  platform).

- Organize the project into appropriate frontend and backend
  directories.

- Provide a README.md with setup instructions.

2.  **Documentation**

- Briefly explain the approach used to implement the project.

- If additional components (e.g., caching, security, or optimizations)
  are included, document them.

3.  **Testing *(optional but recommended)***

- Include **unit tests** for both frontend and backend.

**Assessment Criteria**

1.  **Technical Skills**

- Coding Proficiency -- Ability to write clean, efficient and correct
  code.

- Problem-Solving -- Logical Thinking and approach to solving problems.

- Functionality -- Is the system functional? Are all possible errors
  handled appropriately?

2.  **Code Quality**

- Readability -- Clean, well-structured, and understandable code.

- Maintainability -- Code that is easy to modify and extend

- Best Practices -- Adherence to industry standards and best practices.

3.  **Deployment & Documentation**

- README & Instructions -- Does the README clearly explain how to setup
  and use the project?
