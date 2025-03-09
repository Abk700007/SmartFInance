import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Edit, Trash } from "lucide-react";

export function RecentEntriesTable({ 
  entries = [], 
  onEdit, 
  onDelete 
}: { 
  entries?: any[];
  onEdit: (entry: any) => void;
  onDelete: (id: number) => void;
}) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-500">No financial entries found.</p>
        <p className="text-sm text-neutral-400 mt-1">Add a new entry to see it here.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.slice().sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          }).map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="whitespace-nowrap">
                {format(new Date(entry.date), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>{entry.category}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {entry.description || "-"}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(parseFloat(entry.amount.toString()))}
              </TableCell>
              <TableCell>
                {entry.isIncome ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Income
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    Expense
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEdit(entry)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => onDelete(entry.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
