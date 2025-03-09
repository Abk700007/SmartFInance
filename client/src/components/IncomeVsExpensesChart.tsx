import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import Chart from "chart.js/auto";

export function IncomeVsExpensesChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  // This would be better if we had API endpoint for historical data
  // For now, we'll mock reasonable values based on current data
  const { data: summary } = useQuery({ 
    queryKey: ['/api/summary'],
  });
  
  useEffect(() => {
    if (!chartRef.current || !summary) return;
    
    // Clean up previous chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const currentIncome = summary.income || 0;
    const currentExpenses = summary.expenses || 0;
    
    // Create some reasonable historical data based on current values
    // This would be replaced with actual API data in a real application
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const incomeData = months.map((_, i) => {
      const baseFactor = 0.85 + (i * 0.03);
      return Math.round(currentIncome * baseFactor);
    });
    
    const expensesData = months.map((_, i) => {
      const baseFactor = 0.8 + (i * 0.04);
      return Math.round(currentExpenses * baseFactor);
    });
    
    // Create the chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Income',
              data: incomeData,
              backgroundColor: 'hsl(150, 50%, 37%)', // secondary
              borderRadius: 4
            },
            {
              label: 'Expenses',
              data: expensesData,
              backgroundColor: 'hsl(354, 70%, 54%)', // red
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: {
                display: false
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value.toLocaleString();
                }
              }
            }
          },
          plugins: {
            legend: {
              position: 'top'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  return `${label}: $${value.toLocaleString()}`;
                }
              }
            }
          }
        }
      });
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [summary]);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Income vs Expenses</CardTitle>
        <Select defaultValue="last6Months">
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last6Months">Last 6 Months</SelectItem>
            <SelectItem value="lastYear">Last Year</SelectItem>
            <SelectItem value="ytd">Year to Date</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div style={{ height: '280px', position: 'relative' }}>
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
}
