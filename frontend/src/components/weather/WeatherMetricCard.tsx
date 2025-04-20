interface WeatherMetricCardProps {
  title: string;
  value: string;
  icon: string;
}

export function WeatherMetricCard({
  title,
  value,
  icon,
}: WeatherMetricCardProps) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 flex items-center">
      <div className="mr-4 text-2xl">{icon}</div>
      <div>
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
