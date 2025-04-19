import { Button } from "@/components/ui/button";

interface HourFilterProps {
  selectedHour: number | null;
  onHourSelect: (hour: number | null) => void;
}

export function HourFilter({ selectedHour, onHourSelect }: HourFilterProps) {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
      <Button
        variant={selectedHour === null ? "default" : "outline"}
        size="sm"
        onClick={() => onHourSelect(null)}
      >
        All Hours
      </Button>
      {Array.from(
        new Set(
          Array.from({ length: 24 }, (_, i) => i) // Generate all 24 hours
        )
      )
        .sort((a, b) => a - b)
        .map((hour) => (
          <Button
            key={hour}
            variant={selectedHour === hour ? "default" : "outline"}
            size="sm"
            onClick={() => onHourSelect(hour)}
          >
            {hour}:00
          </Button>
        ))}
    </div>
  );
}
