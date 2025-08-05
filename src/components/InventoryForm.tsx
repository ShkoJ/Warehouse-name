import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InventoryItem } from './InventoryDashboard';

interface InventoryFormProps {
  item?: InventoryItem | null;
  onSubmit: (item: Omit<InventoryItem, 'id'>) => void;
  onClose: () => void;
}

const categories = [
  'Electronics',
  'Hardware',
  'Safety Gear',
  'Chemicals',
  'Packaging',
  'Equipment',
  'Tools',
  'Office Supplies',
  'Cleaning Supplies',
  'Other'
];

const unitsOfMeasure = [
  'pcs',
  'boxes',
  'pairs',
  'gallons',
  'liters',
  'units',
  'kg',
  'lbs',
  'meters',
  'feet',
  'rolls',
  'sets'
];

const InventoryForm = ({ item, onSubmit, onClose }: InventoryFormProps) => {
  const [formData, setFormData] = useState({
    sku: '',
    item_name: '',
    quantity_counted: 0,
    unit_of_measure: '',
    location_in_warehouse: '',
    category: '',
    condition_notes: '',
    last_count_date: new Date().toISOString().split('T')[0],
    reorder_level: 0,
    supplier: '',
    image_url: '',
  });
  const [customCategory, setCustomCategory] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setFormData({
        sku: item.sku,
        item_name: item.item_name,
        quantity_counted: item.quantity_counted,
        unit_of_measure: item.unit_of_measure,
        location_in_warehouse: item.location_in_warehouse,
        category: item.category,
        condition_notes: item.condition_notes || '',
        last_count_date: item.last_count_date,
        reorder_level: item.reorder_level,
        supplier: item.supplier || '',
        image_url: item.image_url || '',
      });
      
      // Check if category is custom (not in predefined list)
      if (item.category && !categories.includes(item.category)) {
        setCustomCategory(item.category);
      }
    }
  }, [item]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Only require essential fields
    if (!formData.item_name.trim()) {
      newErrors.item_name = 'Item name is required';
    }
    if (formData.quantity_counted < 0) {
      newErrors.quantity_counted = 'Quantity must be 0 or greater';
    }
    if (formData.reorder_level < 0) {
      newErrors.reorder_level = 'Reorder level must be 0 or greater';
    }
    if (!formData.last_count_date) {
      newErrors.last_count_date = 'Last count date is required';
    }
    
    // Category validation (either select or custom)
    if (!formData.category && !customCategory.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Use custom category if provided, otherwise use selected category
      const finalCategory = customCategory.trim() || formData.category;
      onSubmit({
        ...formData,
        category: finalCategory,
      });
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </DialogTitle>
          <DialogDescription>
            {item ? 'Update the details of this inventory item.' : 'Enter the details for the new inventory item.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="image_url">Item Picture (URL)</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                placeholder="Enter image URL (optional)"
              />
              {formData.image_url && (
                <div className="mt-2">
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="w-20 h-20 object-cover rounded-lg border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU/Item ID</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                placeholder="Enter SKU (optional)"
                className={errors.sku ? 'border-destructive' : ''}
              />
              {errors.sku && <p className="text-sm text-destructive">{errors.sku}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="item_name">Item Name *</Label>
              <Input
                id="item_name"
                value={formData.item_name}
                onChange={(e) => handleInputChange('item_name', e.target.value)}
                placeholder="Enter item name"
                className={errors.item_name ? 'border-destructive' : ''}
              />
              {errors.item_name && <p className="text-sm text-destructive">{errors.item_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity_counted">Quantity Counted *</Label>
              <Input
                id="quantity_counted"
                type="number"
                min="0"
                value={formData.quantity_counted}
                onChange={(e) => handleInputChange('quantity_counted', parseInt(e.target.value) || 0)}
                placeholder="Enter quantity"
                className={errors.quantity_counted ? 'border-destructive' : ''}
              />
              {errors.quantity_counted && <p className="text-sm text-destructive">{errors.quantity_counted}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_of_measure">Unit of Measure</Label>
              <Select
                value={formData.unit_of_measure}
                onValueChange={(value) => handleInputChange('unit_of_measure', value)}
              >
                <SelectTrigger className={errors.unit_of_measure ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select unit (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {unitsOfMeasure.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit_of_measure && <p className="text-sm text-destructive">{errors.unit_of_measure}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_in_warehouse">Location in Warehouse</Label>
              <Input
                id="location_in_warehouse"
                value={formData.location_in_warehouse}
                onChange={(e) => handleInputChange('location_in_warehouse', e.target.value)}
                placeholder="e.g., Aisle 1, Shelf 3 (optional)"
                className={errors.location_in_warehouse ? 'border-destructive' : ''}
              />
              {errors.location_in_warehouse && <p className="text-sm text-destructive">{errors.location_in_warehouse}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={customCategory ? '' : formData.category}
                onValueChange={(value) => {
                  if (value === 'custom') {
                    setCustomCategory('');
                    handleInputChange('category', '');
                  } else {
                    setCustomCategory('');
                    handleInputChange('category', value);
                  }
                }}
              >
                <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select or add custom category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">+ Add Custom Category</SelectItem>
                </SelectContent>
              </Select>
              
              {(customCategory !== '' || (!formData.category && !categories.includes(formData.category))) && (
                <Input
                  placeholder="Enter custom category"
                  value={customCategory}
                  onChange={(e) => {
                    setCustomCategory(e.target.value);
                    handleInputChange('category', '');
                  }}
                  className="mt-2"
                />
              )}
              
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_count_date">Last Count Date *</Label>
              <Input
                id="last_count_date"
                type="date"
                value={formData.last_count_date}
                onChange={(e) => handleInputChange('last_count_date', e.target.value)}
                className={errors.last_count_date ? 'border-destructive' : ''}
              />
              {errors.last_count_date && <p className="text-sm text-destructive">{errors.last_count_date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorder_level">Reorder Level *</Label>
              <Input
                id="reorder_level"
                type="number"
                min="0"
                value={formData.reorder_level}
                onChange={(e) => handleInputChange('reorder_level', parseInt(e.target.value) || 0)}
                placeholder="Enter reorder level"
                className={errors.reorder_level ? 'border-destructive' : ''}
              />
              {errors.reorder_level && <p className="text-sm text-destructive">{errors.reorder_level}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                placeholder="Enter supplier name"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="condition_notes">Condition/Notes</Label>
              <Textarea
                id="condition_notes"
                value={formData.condition_notes}
                onChange={(e) => handleInputChange('condition_notes', e.target.value)}
                placeholder="Enter any notes about condition, handling requirements, etc."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {item ? 'Update Item' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryForm;