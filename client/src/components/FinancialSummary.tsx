import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, Scale, BarChart3 } from "lucide-react";

export function FinancialSummary({ summary }: { summary: any }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  const formatPercentage = (value: number) => {
    return value.toFixed(1) + '%';
  };
  
  // Calculate budget status
  const overBudgetCount = summary?.budgetStatus?.filter((b: any) => b.status === 'over-budget').length || 0;
  const nearLimitCount = summary?.budgetStatus?.filter((b: any) => b.status === 'near-limit').length || 0;
  const onTrackCount = summary?.budgetStatus?.filter((b: any) => b.status === 'on-track').length || 0;
  
  let budgetStatusText = 'On Track';
  let budgetStatusColor = 'text-green-500';
  
  if (overBudgetCount > 0) {
    budgetStatusText = `Over Budget (${overBudgetCount} categories)`;
    budgetStatusColor = 'text-red-500';
  } else if (nearLimitCount > 0) {
    budgetStatusText = `Near Limit (${nearLimitCount} categories)`;
    budgetStatusColor = 'text-amber-500';
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Income card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-600">Monthly Income</h3>
            <ArrowUpCircle className="h-5 w-5 text-secondary" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 font-mono">
            {formatCurrency(summary?.income || 0)}
          </p>
        </CardContent>
      </Card>
      
      {/* Expenses card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-600">Monthly Expenses</h3>
            <ArrowDownCircle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 font-mono">
            {formatCurrency(summary?.expenses || 0)}
          </p>
        </CardContent>
      </Card>
      
      {/* Savings rate card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-600">Savings Rate</h3>
            <Scale className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 font-mono">
            {formatPercentage(summary?.savingsRate || 0)}
          </p>
        </CardContent>
      </Card>
      
      {/* Budget status card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-600">Budget Status</h3>
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <p className={`text-2xl font-bold ${budgetStatusColor} font-mono`}>
            {budgetStatusText}
          </p>
          <div className="flex items-center mt-2 text-xs">
            <span className="text-neutral-600">
              {onTrackCount} categories on track
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
