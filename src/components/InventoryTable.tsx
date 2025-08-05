import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';
import { InventoryItem } from './InventoryDashboard';

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

type SortField = 'item_name' | 'sku' | 'quantity_counted' | 'category' | 'last_count_date';
type SortDirection = 'asc' | 'desc';

const InventoryTable = ({ items, onEdit, onDelete }: InventoryTableProps) => {
  const [sortField, setSortField] = useState<SortField>('item_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle different data types
    if (sortField === 'quantity_counted') {
      aValue = Number(aValue);
      bValue = Number(bValue);
    } else if (sortField === 'last_count_date') {
      aValue = new Date(aValue as string).getTime();
      bValue = new Date(bValue as string).getTime();
    } else {
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isLowStock = (item: InventoryItem) => {
    return item.quantity_counted <= item.reorder_level;
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No inventory items found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 select-none"
              onClick={() => handleSort('sku')}
            >
              <div className="flex items-center">
                SKU
                <SortIcon field="sku" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 select-none"
              onClick={() => handleSort('item_name')}
            >
              <div className="flex items-center">
                Item Name
                <SortIcon field="item_name" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 select-none"
              onClick={() => handleSort('quantity_counted')}
            >
              <div className="flex items-center">
                Quantity
                <SortIcon field="quantity_counted" />
              </div>
            </TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Location</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 select-none"
              onClick={() => handleSort('category')}
            >
              <div className="flex items-center">
                Category
                <SortIcon field="category" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 select-none"
              onClick={() => handleSort('last_count_date')}
            >
              <div className="flex items-center">
                Last Count
                <SortIcon field="last_count_date" />
              </div>
            </TableHead>
            <TableHead>Reorder Level</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.map((item) => (
            <TableRow 
              key={item.id} 
              className={isLowStock(item) ? "bg-low-stock-bg border-low-stock/20" : ""}
            >
              <TableCell className="font-medium">{item.sku}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  {item.item_name}
                  {isLowStock(item) && (
                    <AlertTriangle className="h-4 w-4 text-low-stock ml-2" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span className={isLowStock(item) ? "text-low-stock font-medium" : ""}>
                    {item.quantity_counted.toLocaleString()}
                  </span>
                  {isLowStock(item) && (
                    <Badge variant="outline" className="ml-2 text-xs border-low-stock text-low-stock">
                      Low Stock
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{item.unit_of_measure}</TableCell>
              <TableCell>{item.location_in_warehouse}</TableCell>
              <TableCell>
                <Badge variant="outline">{item.category}</Badge>
              </TableCell>
              <TableCell>{formatDate(item.last_count_date)}</TableCell>
              <TableCell>{item.reorder_level.toLocaleString()}</TableCell>
              <TableCell>{item.supplier || '-'}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Item</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{item.item_name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(item.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InventoryTable;