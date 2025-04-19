import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "@/hooks/useWeatherReducer";
import { formatDateForInput } from "@/utils/common";

interface DateRangeFilterProps {
  dateRange: DateRange;
  onDateChange: (field: "startTime" | "endTime", date: Date) => void;
  onApplyFilter: () => void;
  isLoading: boolean;
  title?: string;
}

export function DateRangeFilter({
  dateRange,
  onDateChange,
  onApplyFilter,
  isLoading,
  title = "Date Range Filter",
}: DateRangeFilterProps) {
  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "startTime" | "endTime"
  ) => {
    const inputValue = e.target.value; // Format: YYYY-MM-DD
    const date = new Date(inputValue);

    if (field === "startTime") {
      date.setHours(0, 0, 0, 0);
    } else {
      date.setHours(23, 59, 59, 999);
    }

    onDateChange(field, date);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="startDate" className="text-sm font-medium">
              Start Date:
            </label>
            <input
              id="startDate"
              type="date"
              className="border rounded p-2"
              value={formatDateForInput(dateRange.startTime)}
              onChange={(e) => handleDateChange(e, "startTime")}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label htmlFor="endDate" className="text-sm font-medium">
              End Date:
            </label>
            <input
              id="endDate"
              type="date"
              className="border rounded p-2"
              value={formatDateForInput(dateRange.endTime)}
              onChange={(e) => handleDateChange(e, "endTime")}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={onApplyFilter} disabled={isLoading}>
              Apply Filter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
