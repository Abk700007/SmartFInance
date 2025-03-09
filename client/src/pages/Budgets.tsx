import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { expenseCategories } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

const budgetFormSchema = z.object({
  category: z.string().min(1, "Category is required"),
  limit: z.string().min(1, "Budget limit is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Budget limit must be a positive number"
  ),
  month: z.string().min(1, "Month is required"),
  year: z.string().min(1, "Year is required"),
});

export default function Budgets() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const { toast } = useToast();
  
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['/api/summary'],
  });
  
  const { data: budgets, isLoading: isBudgetsLoading } = useQuery({
    queryKey: ['/api/budgets'],
  });
  
  const form = useForm<z.infer<typeof budgetFormSchema>>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      category: "",
      limit: "",
      month: currentMonth.toString(),
      year: currentYear.toString(),
    },
  });
  
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        limit: parseFloat(data.limit),
        month: parseInt(data.month),
        year: parseInt(data.year),
      };
      return await apiRequest('POST', '/api/budgets', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budgets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
      toast({
        title: "Success",
        description: "Budget has been created",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create budget: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const payload = {
        ...data,
        limit: parseFloat(data.limit),
        month: parseInt(data.month),
        year: parseInt(data.year),
      };
      return await apiRequest('PUT', `/api/budgets/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budgets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
      toast({
        title: "Success",
        description: "Budget has been updated",
      });
      setIsDialogOpen(false);
      setEditingBudget(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update budget: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/budgets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budgets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
      toast({
        title: "Success",
        description: "Budget has been deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete budget: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: z.infer<typeof budgetFormSchema>) => {
    if (editingBudget) {
      updateMutation.mutate({ id: editingBudget.id, data });
    } else {
      createMutation.mutate(data);
    }
  };
  
  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    form.reset({
      category: budget.category,
      limit: budget.limit.toString(),
      month: budget.month.toString(),
      year: budget.year.toString(),
    });
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this budget?")) {
      deleteMutation.mutate(id);
    }
  };
  
  const getBudgetProgress = (category: string) => {
    if (!summary?.budgetStatus) return null;
    
    return summary.budgetStatus.find((b: any) => b.category === category);
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  // Filter budgets for current month and year
  const currentBudgets = budgets?.filter((budget: any) => {
    return budget.month === currentMonth && budget.year === currentYear;
  });
  
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Budget Planning</h1>
          <p className="text-neutral-600">Set and track your spending limits</p>
        </div>
        <Button onClick={() => {
          setEditingBudget(null);
          form.reset({
            category: "",
            limit: "",
            month: currentMonth.toString(),
            year: currentYear.toString(),
          });
          setIsDialogOpen(true);
        }} className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" />
          Add Budget
        </Button>
      </div>
      
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Month Budget Progress</CardTitle>
            <CardDescription>
              {format(new Date(currentYear, currentMonth - 1), 'MMMM yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSummaryLoading || isBudgetsLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="mb-4">
                  <Skeleton className="h-6 w-full mb-1" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))
            ) : currentBudgets?.length > 0 ? (
              currentBudgets.map((budget: any) => {
                const progress = getBudgetProgress(budget.category);
                const amount = progress?.amount || 0;
                const percentage = progress?.percentage || 0;
                
                let progressColor = "bg-primary";
                if (percentage > 100) {
                  progressColor = "bg-red-500";
                } else if (percentage > 90) {
                  progressColor = "bg-amber-500";
                } else if (percentage > 75) {
                  progressColor = "bg-amber-400";
                } else {
                  progressColor = "bg-green-500";
                }
                
                return (
                  <div key={budget.id} className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-700">{budget.category}</span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleEdit(budget)}
                            className="text-neutral-500 hover:text-primary"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(budget.id)}
                            className="text-neutral-500 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-neutral-700">
                        {formatCurrency(amount)} / {formatCurrency(parseFloat(budget.limit.toString()))}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div className={`${progressColor} h-2 rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-neutral-500">
                <p>No budgets set for this month.</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => {
                    setEditingBudget(null);
                    form.reset({
                      category: "",
                      limit: "",
                      month: currentMonth.toString(),
                      year: currentYear.toString(),
                    });
                    setIsDialogOpen(true);
                  }}
                >
                  Create a budget
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBudget ? "Edit Budget" : "Create Budget"}</DialogTitle>
            <DialogDescription>
              Set a spending limit for a specific category.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={!!editingBudget}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {expenseCategories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Limit ($)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="0.00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingBudget(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingBudget ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
