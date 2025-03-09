import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Bot, RefreshCw } from "lucide-react";

export function AiAdviceSection({ recentAdvice }: { recentAdvice?: any[] }) {
  const { toast } = useToast();
  
  const refreshAdviceMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/advice', {
        query: "Given my current financial situation, what's your top advice for improving my finances?"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advice'] });
      toast({
        title: "Success",
        description: "New financial advice has been generated",
      });
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
  
  // Get the most recent 3 advice items with responses
  const validAdvice = recentAdvice?.filter(item => item.response) || [];
  const topAdvice = validAdvice.slice(0, 3);
  
  // Function to determine the border color based on advice content
  const getBorderColor = (advice: string): string => {
    const lowerAdvice = advice.toLowerCase();
    
    if (lowerAdvice.includes("warning") || 
        lowerAdvice.includes("caution") || 
        lowerAdvice.includes("risk") || 
        lowerAdvice.includes("concern") ||
        lowerAdvice.includes("exceed") ||
        lowerAdvice.includes("overspend")) {
      return "border-red-500";
    }
    
    if (lowerAdvice.includes("opportunity") || 
        lowerAdvice.includes("consider") || 
        lowerAdvice.includes("might") || 
        lowerAdvice.includes("could")) {
      return "border-secondary";
    }
    
    return "border-primary";
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center">
          <Bot className="h-5 w-5 mr-2 text-primary" />
          AI Financial Advice
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => refreshAdviceMutation.mutate()}
          disabled={refreshAdviceMutation.isPending}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Advice
        </Button>
      </CardHeader>
      <CardContent>
        {topAdvice.length > 0 ? (
          <>
            {topAdvice.map((advice) => (
              <div 
                key={advice.id} 
                className={`bg-neutral-50 border-l-4 ${getBorderColor(advice.response)} p-3 rounded-r-lg mb-4 last:mb-0`}
              >
                <p className="text-sm text-neutral-600">{advice.response}</p>
              </div>
            ))}
          </>
        ) : refreshAdviceMutation.isPending ? (
          <div className="p-4 text-center">
            <p className="text-neutral-500">Generating financial advice...</p>
          </div>
        ) : (
          <div className="p-4 text-center">
            <p className="text-neutral-500 mb-2">No advice available yet</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refreshAdviceMutation.mutate()}
            >
              Get AI Advice
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
