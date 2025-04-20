export const ComparisonRow = ({
  label,
  value1,
  value2,
  deviation,
  formatValue = (val: number) => val?.toString(),
  icon,
  color1 = "blue",
  color2 = "green",
}: {
  label: string;
  value1: number;
  value2: number;
  deviation: number;
  formatValue?: (val: number) => string;
  icon?: React.ReactNode;
  color1?: "blue" | "green" | "red" | "amber";
  color2?: "blue" | "green" | "red" | "amber";
}) => {
  // Determine if value1 is higher, lower, or same as value2
  const getComparisonIndicator = () => {
    if (Math.abs(deviation) < 0.001) return null;
    if (value1 > value2) return <span className="text-red-500">↑</span>;
    if (value1 < value2) return <span className="text-green-500">↓</span>;
    return null;
  };

  // Determine background color for deviation based on its magnitude
  const getDeviationClass = () => {
    const absDeviation = Math.abs(deviation);
    // Adjust these thresholds based on your data ranges
    if (absDeviation > 10) return "bg-red-50";
    if (absDeviation > 5) return "bg-amber-50";
    if (absDeviation > 2) return "bg-yellow-50";
    return "bg-green-50";
  };

  const textColorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    red: "text-red-600",
    amber: "text-amber-600",
  };

  return (
    <div className="grid grid-cols-3 gap-6 p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-center">
        <div className="mr-4 text-xl flex-shrink-0">{icon}</div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{label}</h3>
          <p className={`text-xl font-semibold ${textColorClasses[color1]}`}>
            {formatValue(value1)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div
          className={`text-center px-6 py-4 rounded-full ${getDeviationClass()}`}
        >
          <h3 className="text-sm font-medium text-gray-500">Difference</h3>
          <p className="text-xl font-semibold text-gray-700 flex items-center justify-center">
            {formatValue(Math.abs(deviation))} {getComparisonIndicator()}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <div className="mr-4 text-xl flex-shrink-0">{icon}</div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{label}</h3>
          <p className={`text-xl font-semibold ${textColorClasses[color2]}`}>
            {formatValue(value2)}
          </p>
        </div>
      </div>
    </div>
  );
};
