"use client";

import Image from "next/image";
import Link from "next/link";

export function HomeFeatures() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="grid gap-8 md:grid-cols-3">
          <FeatureCard
            title="Generate Weather Report"
            description="Generate and view current weather data or view historical data collected every 5 minutes."
            icon="/file.svg"
            href="/generate"
            color="blue"
          />

          <FeatureCard
            title="Report History"
            description="View your previously generated weather reports and access historical data."
            icon="/globe.svg"
            href="/history"
            color="purple"
          />

          <FeatureCard
            title="Compare Reports"
            description="Select and compare two weather reports to analyze differences and trends."
            icon="/window.svg"
            href="/comparison"
            color="orange"
          />
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: "blue" | "purple" | "orange";
}

function FeatureCard({
  title,
  description,
  icon,
  href,
  color,
}: FeatureCardProps) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-900",
      description: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-900",
      description: "text-purple-600",
      button: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-900",
      description: "text-orange-600",
      button: "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500",
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={`${colors.bg} overflow-hidden shadow rounded-lg hover:shadow-md transition-all duration-300`}
    >
      <div className="px-6 py-5 sm:p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-md bg-white shadow-sm">
            <Image src={icon} alt={title} width={24} height={24} />
          </div>
          <h3 className={`ml-3 text-lg leading-6 font-semibold ${colors.text}`}>
            {title}
          </h3>
        </div>
        <div className="mt-2 text-sm">
          <p className={colors.description}>{description}</p>
        </div>
        <div className="mt-5">
          <Link
            href={href}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${colors.button} focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            Explore Now
          </Link>
        </div>
      </div>
    </div>
  );
}
