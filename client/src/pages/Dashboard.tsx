import { useQuery } from "@tanstack/react-query";
import { FinancialSummary } from "@/components/FinancialSummary";
import { ExpenseBreakdownChart } from "@/components/ExpenseBreakdownChart";
import { IncomeVsExpensesChart } from "@/components/IncomeVsExpensesChart";
import { BudgetProgress } from "@/components/BudgetProgress";
import { AiAdviceSection } from "@/components/AiAdviceSection";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: summary, isLoading: isSummaryLoading } = useQuery({ 
    queryKey: ['/api/summary'],
  });

  const { data: adviceRequests, isLoading: isAdviceLoading } = useQuery({ 
    queryKey: ['/api/advice'],
  });

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Dashboard Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Financial Dashboard</h1>
        <p className="text-neutral-600">Overview of your financial health</p>
      </div>

      {/* Financial Summary Section */}
      {isSummaryLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <FinancialSummary summary={summary} />
      )}

      {/* Charts and Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {isSummaryLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : (
          <ExpenseBreakdownChart expensesByCategory={summary?.expensesByCategory} />
        )}

        {isSummaryLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : (
          <IncomeVsExpensesChart />
        )}

        {isSummaryLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : (
          <BudgetProgress budgetStatus={summary?.budgetStatus} />
        )}

        {isAdviceLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : (
          <AiAdviceSection recentAdvice={adviceRequests} />
        )}
      </div>
    </div>
  );
}
