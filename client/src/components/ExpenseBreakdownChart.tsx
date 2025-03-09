import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Chart from "chart.js/auto";

export function ExpenseBreakdownChart({ expensesByCategory }: { expensesByCategory?: Record<string, number> }) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  const colors = [
    'hsl(222, 63%, 40%)', // primary
    'hsl(150, 50%, 37%)',  // secondary
    'hsl(52, 100%, 50%)',  // accent
    'hsl(210, 9%, 45%)',   // neutral
    'hsl(354, 70%, 54%)',  // red
    'hsl(271, 49%, 51%)'   // purple
  ];
  
  useEffect(() => {
    if (!chartRef.current || !expensesByCategory) return;
    
    // Clean up previous chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const categories = Object.keys(expensesByCategory);
    const values = Object.values(expensesByCategory);
    const totalExpenses = values.reduce((sum, value) => sum + value, 0);
    
    // Calculate percentages
    const percentages = values.map(value => ((value / totalExpenses) * 100).toFixed(1));
    
    // Create the chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: categories,
          datasets: [{
            data: values,
            backgroundColor: colors.concat(colors).slice(0, categories.length),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.formattedValue;
                  const percentage = percentages[context.dataIndex];
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          },
          cutout: '70%'
        }
      });
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [expensesByCategory]);
  
  if (!expensesByCategory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <p className="text-neutral-500">No expense data available</p>
        </CardContent>
      </Card>
    );
  }
  
  const entries = Object.entries(expensesByCategory);
  const totalExpenses = Object.values(expensesByCategory).reduce((sum, value) => sum + value, 0);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Expense Breakdown</CardTitle>
        <Select defaultValue="thisMonth">
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="lastMonth">Last Month</SelectItem>
            <SelectItem value="last3Months">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div style={{ height: '200px', position: 'relative' }}>
          <canvas ref={chartRef} />
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          {entries.map(([category, amount], index) => {
            const percentage = ((amount / totalExpenses) * 100).toFixed(1);
            const colorIndex = index % colors.length;
            
            return (
              <div key={category} className="flex items-center">
                <span 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: colors[colorIndex] }}
                />
                <span className="text-xs text-neutral-700">
                  {category} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
