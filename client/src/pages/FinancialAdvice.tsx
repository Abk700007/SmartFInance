import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Bot, Send } from "lucide-react";

export default function FinancialAdvice() {
  const [query, setQuery] = useState("");
  const { toast } = useToast();
  
  const { data: adviceRequests = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/advice'],
  });
  
  const requestAdviceMutation = useMutation({
    mutationFn: async (data: { query: string }) => {
      return await apiRequest('POST', '/api/advice', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advice'] });
      toast({
        title: "Success",
        description: "Your financial advice has been generated",
      });
      setQuery("");
    },
    onError: (error: any) => {
      // Check if the error is because of missing API key
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes("HuggingFace API key is not configured")) {
        toast({
          title: "API Key Required",
          description: "A HuggingFace API key is needed for AI financial advice.",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to get AI advice: ${error}`,
          variant: "destructive",
        });
      }
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }
    
    requestAdviceMutation.mutate({ query: query.trim() });
  };
  
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex items-center mb-6">
        <Bot className="h-6 w-6 text-primary mr-2" />
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">AI Financial Advice</h1>
          <p className="text-neutral-600">Get personalized financial guidance powered by AI</p>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ask for Financial Advice</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Textarea
                placeholder="Example: How can I save more for retirement? Should I pay off debt or invest? How do I create a budget?"
                rows={3}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="resize-none"
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="flex items-center gap-1"
                disabled={requestAdviceMutation.isPending}
              >
                {requestAdviceMutation.isPending ? (
                  <span>Generating...</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Get AI Advice
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <h2 className="text-xl font-semibold text-neutral-800 mb-4">Previous Advice</h2>
      
      {isLoading ? (
        [...Array(3)].map((_, i) => (
          <Card key={i} className="mb-4">
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))
      ) : adviceRequests?.length > 0 ? (
        adviceRequests.slice().reverse().map((request: any) => (
          <Card key={request.id} className="mb-4">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3 mb-4">
                <Bot className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-neutral-800">Your Question</h4>
                  <p className="text-sm text-neutral-700 mt-1">{request.query}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {format(new Date(request.date), 'MMMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-start space-x-3">
                <Bot className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-neutral-800">SmartFinance AI</h4>
                  {request.response ? (
                    <p className="text-sm text-neutral-700 mt-1">{request.response}</p>
                  ) : (
                    <p className="text-sm text-neutral-500 italic mt-1">
                      Generating response...
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-neutral-500">
            <p>You haven't requested any financial advice yet.</p>
            <p className="text-sm mt-2">Ask a question above to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
