import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialEntryForm } from "@/components/FinancialEntryForm";
import { RecentEntriesTable } from "@/components/RecentEntriesTable";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function IncomeExpenses() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const { toast } = useToast();
  
  const { data: entries, isLoading } = useQuery({
    queryKey: ['/api/entries'],
  });
  
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/entries', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
      toast({
        title: "Success",
        description: "Financial entry has been created",
      });
      setIsFormOpen(false);
      setEditingEntry(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create entry: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return await apiRequest('PUT', `/api/entries/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
      toast({
        title: "Success",
        description: "Financial entry has been updated",
      });
      setIsFormOpen(false);
      setEditingEntry(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update entry: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
      toast({
        title: "Success",
        description: "Financial entry has been deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete entry: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      deleteMutation.mutate(id);
    }
  };
  
  const handleSubmit = (data: any) => {
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data });
    } else {
      createMutation.mutate(data);
    }
  };
  
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Income & Expenses</h1>
          <p className="text-neutral-600">Manage your financial transactions</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" />
          Add Entry
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Financial Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {isFormOpen ? (
            <FinancialEntryForm 
              onSubmit={handleSubmit} 
              onCancel={() => {
                setIsFormOpen(false);
                setEditingEntry(null);
              }}
              entry={editingEntry}
              isPending={createMutation.isPending || updateMutation.isPending}
            />
          ) : (
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Entries</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                {isLoading ? (
                  <Skeleton className="h-[400px] w-full" />
                ) : (
                  <RecentEntriesTable 
                    entries={entries} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                  />
                )}
              </TabsContent>
              
              <TabsContent value="income">
                {isLoading ? (
                  <Skeleton className="h-[400px] w-full" />
                ) : (
                  <RecentEntriesTable 
                    entries={entries?.filter((entry: any) => entry.isIncome)} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                  />
                )}
              </TabsContent>
              
              <TabsContent value="expenses">
                {isLoading ? (
                  <Skeleton className="h-[400px] w-full" />
                ) : (
                  <RecentEntriesTable 
                    entries={entries?.filter((entry: any) => !entry.isIncome)} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                  />
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
