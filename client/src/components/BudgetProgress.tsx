import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

export function BudgetProgress({ budgetStatus }: { budgetStatus?: any[] }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  const currentMonth = format(new Date(), 'MMMM yyyy');
  
  if (!budgetStatus || budgetStatus.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Progress</CardTitle>
          <CardDescription>{currentMonth}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-48">
          <p className="text-neutral-500 mb-2">No budget data available</p>
          <p className="text-sm text-neutral-400">Set up budgets to track your spending</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Budget Progress</CardTitle>
          <CardDescription>{currentMonth}</CardDescription>
        </div>
        <Select defaultValue="thisMonth">
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="lastMonth">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {budgetStatus.map((budget) => {
          let progressColor = "bg-primary";
          
          if (budget.percentage > 100) {
            progressColor = "bg-red-500";
          } else if (budget.percentage > 90) {
            progressColor = "bg-amber-500";
          } else if (budget.percentage > 75) {
            progressColor = "bg-amber-400";
          } else {
            progressColor = "bg-green-500";
          }
          
          return (
            <div key={budget.category} className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-neutral-700">{budget.category}</span>
                <span className="text-sm font-medium text-neutral-700">
                  {formatCurrency(budget.amount)} / {formatCurrency(budget.limit)}
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div 
                  className={`${progressColor} h-2 rounded-full`} 
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
