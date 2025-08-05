import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package, 
  BarChart3, 
  LogOut,
  AlertTriangle
} from 'lucide-react';
import InventoryTable from './InventoryTable';
import InventoryForm from './InventoryForm';
// import { supabase } from '@/integrations/supabase/client';

export interface InventoryItem {
  id: string;
  sku: string;
  item_name: string;
  quantity_counted: number;
  unit_of_measure: string;
  location_in_warehouse: string;
  category: string;
  condition_notes?: string;
  last_count_date: string;
  reorder_level: number;
  supplier?: string;
}

interface InventoryDashboardProps {
  onLogout: () => void;
}

const InventoryDashboard = ({ onLogout }: InventoryDashboardProps) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Sample data for demonstration
  const sampleData: InventoryItem[] = [
    {
      id: '1',
      sku: 'SKU001',
      item_name: 'Industrial Safety Helmet',
      quantity_counted: 45,
      unit_of_measure: 'pcs',
      location_in_warehouse: 'Aisle 1, Shelf A',
      category: 'Safety Gear',
      condition_notes: 'Good condition, regular stock rotation',
      last_count_date: '2024-01-15',
      reorder_level: 10,
      supplier: 'SafetyFirst Corp',
    },
    {
      id: '2',
      sku: 'SKU002',
      item_name: 'Heavy Duty Work Gloves',
      quantity_counted: 5,
      unit_of_measure: 'pairs',
      location_in_warehouse: 'Aisle 1, Shelf B',
      category: 'Safety Gear',
      condition_notes: 'Various sizes available',
      last_count_date: '2024-01-14',
      reorder_level: 20,
      supplier: 'ProtectCo',
    },
    {
      id: '3',
      sku: 'SKU003',
      item_name: 'Forklift Battery',
      quantity_counted: 8,
      unit_of_measure: 'units',
      location_in_warehouse: 'Aisle 3, Floor Storage',
      category: 'Equipment',
      condition_notes: 'Requires special handling',
      last_count_date: '2024-01-13',
      reorder_level: 2,
      supplier: 'PowerTech Ltd',
    },
    {
      id: '4',
      sku: 'SKU004',
      item_name: 'Cardboard Boxes (Large)',
      quantity_counted: 500,
      unit_of_measure: 'boxes',
      location_in_warehouse: 'Aisle 5, Bulk Storage',
      category: 'Packaging',
      condition_notes: 'Stacked high, good condition',
      last_count_date: '2024-01-12',
      reorder_level: 100,
      supplier: 'PackRight Inc',
    },
    {
      id: '5',
      sku: 'SKU005',
      item_name: 'Cleaning Solvent',
      quantity_counted: 25,
      unit_of_measure: 'gallons',
      location_in_warehouse: 'Chemical Storage, Zone C',
      category: 'Chemicals',
      condition_notes: 'Hazardous material - proper ventilation required',
      last_count_date: '2024-01-11',
      reorder_level: 5,
      supplier: 'ChemClean Solutions',
    },
  ];

  // Load initial data
  const fetchItems = async () => {
    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load from localStorage or use sample data
      const savedItems = localStorage.getItem('warehouse-inventory');
      const initialItems = savedItems ? JSON.parse(savedItems) : sampleData;
      
      setItems(initialItems);
      setFilteredItems(initialItems);
    } catch (error) {
      console.error('Error loading items:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory items.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save to localStorage whenever items change
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('warehouse-inventory', JSON.stringify(items));
    }
  }, [items]);

  useEffect(() => {
    fetchItems();
  }, []);

  // Filter items based on search term
  useEffect(() => {
    const filtered = items.filter(item =>
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [items, searchTerm]);

  const handleAddItem = async (itemData: Omit<InventoryItem, 'id'>) => {
    try {
      const newItem: InventoryItem = {
        ...itemData,
        id: Date.now().toString(), // Simple ID generation
      };

      setItems(prev => [newItem, ...prev]);
      setIsFormOpen(false);
      toast({
        title: "Success",
        description: "Item added successfully!",
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add item.",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = async (itemData: Omit<InventoryItem, 'id'>) => {
    if (!editingItem) return;

    try {
      const updatedItem: InventoryItem = {
        ...itemData,
        id: editingItem.id,
      };

      setItems(prev => prev.map(item => 
        item.id === editingItem.id ? updatedItem : item
      ));
      setEditingItem(null);
      setIsFormOpen(false);
      toast({
        title: "Success",
        description: "Item updated successfully!",
      });
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update item.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Item deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item.",
        variant: "destructive",
      });
    }
  };

  const openEditForm = (item: InventoryItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  // Calculate statistics
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity_counted, 0);
  const lowStockItems = items.filter(item => item.quantity_counted <= item.reorder_level);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Package className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Warehouse Inventory</h1>
            </div>
            <Button onClick={onLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">
                Unique inventory items
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuantity.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Items in warehouse
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{lowStockItems.length}</div>
              <p className="text-xs text-muted-foreground">
                Items below reorder level
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by item name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card className="mb-6 border-warning bg-warning/5">
            <CardHeader>
              <CardTitle className="flex items-center text-warning">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Low Stock Alert
              </CardTitle>
              <CardDescription>
                {lowStockItems.length} item(s) are at or below their reorder level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.map(item => (
                  <Badge key={item.id} variant="outline" className="border-warning text-warning">
                    {item.item_name} ({item.quantity_counted} left)
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>
              Manage your warehouse inventory items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryTable
              items={filteredItems}
              onEdit={openEditForm}
              onDelete={handleDeleteItem}
            />
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Form Modal */}
      {isFormOpen && (
        <InventoryForm
          item={editingItem}
          onSubmit={editingItem ? handleEditItem : handleAddItem}
          onClose={closeForm}
        />
      )}
    </div>
  );
};

export default InventoryDashboard;