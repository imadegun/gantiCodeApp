'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Package, TrendingUp, TrendingDown, Eye, CheckCircle, XCircle, AlertTriangle, Bell, Warehouse, Calendar, Search, ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StockItem {
  id: string;
  productId: number;
  designCode: string;
  clientCode: string;
  nameCode?: string;
  categoryCode?: string;
  colorCode?: string;
  textureCode?: string;
  sizeCode?: string;
  materialCode?: string;
  photo1?: string;
  productType: 'SINGLE_ITEM' | 'SET_PRODUCT' | 'UNSET';
  qty_in: number;
  qty_offer: number;
  total: number;
  availableQuantity: number;
  isComplated_set: boolean;
  isBody_only: boolean;
  isLid_only: boolean;
  expirationYears: number;
  expirationDate?: string;
  status: 'available' | 'out_of_stock';
  notes?: string;
  warehouse?: {
    id: string;
    name: string;
    code: string;
  };
  shelf?: {
    id: string;
    code: string;
    row?: string;
    column?: string;
    level?: string;
  };
  product: any;
  isExpiringSoon?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
  location?: string;
  description?: string;
  isActive: boolean;
  shelves: any[];
  _count: {
    stocks: number;
  };
}

interface IncomingStock {
  productId: number;
  productType: 'SINGLE_ITEM' | 'SET_PRODUCT' | 'UNSET';
  qty_in: number;
  isComplated_set: boolean;
  isBody_only: boolean;
  isLid_only: boolean;
  expirationYears: number;
  warehouseId?: string;
  shelfId?: string;
  notes?: string;
}

interface Product {
  ID: number;
  CollectCode: string;
  DesignCode: string;
  NameCode: string;
  CategoryCode: string;
  SizeCode: string;
  ColorCode: string;
  TextureCode: string;
  MaterialCode: string;
  ClientCode: string;
  Photo1: string;
  Photo2: string;
  DesignName: string;
  NameDesc: string;
  CategoryName: string;
  ColorName: string;
  TextureName: string;
  SizeName: string;
  MaterialName: string;
}

interface Design {
  DesignCode: string;
  DesignName: string;
}

interface Category {
  CategoryCode: string;
  CategoryName: string;
}

interface ClientCode {
  ClientCode: string;
  ID: number;
}

interface Shelf {
  id: string;
  warehouseId: string;
  code: string;
  row?: string;
  column?: string;
  level?: string;
  description?: string;
  isActive: boolean;
  warehouse: {
    id: string;
    name: string;
    code: string;
  };
  _count: {
    stocks: number;
  };
}

// Shelf Form Component
function ShelfForm({ shelf, onSuccess, warehouses, setMessageDialog }: {
  shelf?: Shelf;
  onSuccess: () => void;
  warehouses: Warehouse[];
  setMessageDialog: (dialog: { open: boolean; title: string; message: string; type: 'success' | 'error' }) => void;
}) {
  const [formData, setFormData] = useState({
    warehouseId: shelf?.warehouseId || '',
    code: shelf?.code || '',
    row: shelf?.row || '',
    column: shelf?.column || '',
    level: shelf?.level || '',
    description: shelf?.description || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = shelf ? 'PUT' : 'POST';
      const body = shelf ? { id: shelf.id, ...formData } : formData;

      const response = await fetch('/api/stock/shelves', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (result.success) {
        setMessageDialog({
          open: true,
          title: 'Success',
          message: `Shelf ${shelf ? 'updated' : 'created'} successfully`,
          type: 'success'
        });
        onSuccess();
      } else {
        setMessageDialog({
          open: true,
          title: 'Error',
          message: result.error,
          type: 'error'
        });
      }
    } catch (error) {
      setMessageDialog({
        open: true,
        title: 'Error',
        message: 'Failed to save shelf',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="warehouse">Warehouse *</Label>
        <Select
          value={formData.warehouseId}
          onValueChange={(value) => setFormData(prev => ({ ...prev, warehouseId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select warehouse..." />
          </SelectTrigger>
          <SelectContent>
            {warehouses.map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id}>
                {warehouse.name} ({warehouse.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code">Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="row">Row</Label>
          <Input
            id="row"
            value={formData.row}
            onChange={(e) => setFormData(prev => ({ ...prev, row: e.target.value }))}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="column">Column</Label>
          <Input
            id="column"
            value={formData.column}
            onChange={(e) => setFormData(prev => ({ ...prev, column: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="level">Level</Label>
          <Input
            id="level"
            value={formData.level}
            onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : (shelf ? 'Update' : 'Create')} Shelf
      </Button>
    </form>
  );
}

// Shelf Card Component
function ShelfCard({ shelf, onUpdate, onDelete, warehouses, setMessageDialog }: {
  shelf: Shelf;
  onUpdate: () => void;
  onDelete: () => void;
  warehouses: Warehouse[];
  setMessageDialog: (dialog: { open: boolean; title: string; message: string; type: 'success' | 'error' }) => void;
}) {
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/stock/shelves?id=${shelf.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setMessageDialog({
          open: true,
          title: 'Success',
          message: 'Shelf deleted successfully',
          type: 'success'
        });
        onDelete();
      } else {
        setMessageDialog({
          open: true,
          title: 'Error',
          message: result.error,
          type: 'error'
        });
      }
    } catch (error) {
      setMessageDialog({
        open: true,
        title: 'Error',
        message: 'Failed to delete shelf',
        type: 'error'
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{shelf.code}</CardTitle>
            <CardDescription>{shelf.warehouse.name}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Shelf</DialogTitle>
                  <DialogDescription>
                    Update shelf information
                  </DialogDescription>
                </DialogHeader>
                <ShelfForm shelf={shelf} onSuccess={onUpdate} warehouses={warehouses} setMessageDialog={setMessageDialog} />
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="outline" onClick={handleDelete}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div><strong>Stock Items:</strong> {shelf._count.stocks}</div>
          {shelf.row && <div><strong>Row:</strong> {shelf.row}</div>}
          {shelf.column && <div><strong>Column:</strong> {shelf.column}</div>}
          {shelf.level && <div><strong>Level:</strong> {shelf.level}</div>}
          {shelf.description && (
            <div className="text-sm text-muted-foreground">{shelf.description}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Warehouse Form Component
function WarehouseForm({ warehouse, onSuccess, setMessageDialog }: {
  warehouse?: Warehouse;
  onSuccess: () => void;
  setMessageDialog: (dialog: { open: boolean; title: string; message: string; type: 'success' | 'error' }) => void;
}) {
  const [formData, setFormData] = useState({
    name: warehouse?.name || '',
    code: warehouse?.code || '',
    location: warehouse?.location || '',
    description: warehouse?.description || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = warehouse ? 'PUT' : 'POST';
      const body = warehouse ? { id: warehouse.id, ...formData } : formData;

      const response = await fetch('/api/stock/warehouses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (result.success) {
        setMessageDialog({
          open: true,
          title: 'Success',
          message: `Warehouse ${warehouse ? 'updated' : 'created'} successfully`,
          type: 'success'
        });
        onSuccess();
      } else {
        setMessageDialog({
          open: true,
          title: 'Error',
          message: result.error,
          type: 'error'
        });
      }
    } catch (error) {
      setMessageDialog({
        open: true,
        title: 'Error',
        message: 'Failed to save warehouse',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="code">Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : (warehouse ? 'Update' : 'Create')} Warehouse
      </Button>
    </form>
  );
}

// Warehouse Card Component
function WarehouseCard({ warehouse, onUpdate, onDelete, setMessageDialog }: {
  warehouse: Warehouse;
  onUpdate: () => void;
  onDelete: () => void;
  setMessageDialog: (dialog: { open: boolean; title: string; message: string; type: 'success' | 'error' }) => void;
}) {
  const [showShelves, setShowShelves] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete warehouse "${warehouse.name}"?`)) return;

    try {
      const response = await fetch(`/api/stock/warehouses?id=${warehouse.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Warehouse deleted successfully'
        });
        onDelete();
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete warehouse',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{warehouse.name}</CardTitle>
            <CardDescription>{warehouse.code}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Warehouse</DialogTitle>
                  <DialogDescription>
                    Update warehouse information
                  </DialogDescription>
                </DialogHeader>
                <WarehouseForm warehouse={warehouse} onSuccess={onUpdate} setMessageDialog={setMessageDialog} />
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="outline" onClick={handleDelete}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div><strong>Location:</strong> {warehouse.location || 'Not specified'}</div>
          <div><strong>Stock Items:</strong> {warehouse._count.stocks}</div>
          <div><strong>Shelves:</strong> {warehouse.shelves.length}</div>
          {warehouse.description && (
            <div className="text-sm text-muted-foreground">{warehouse.description}</div>
          )}
        </div>

        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShelves(!showShelves)}
          >
            {showShelves ? 'Hide' : 'Show'} Shelves ({warehouse.shelves.length})
          </Button>
        </div>

        {showShelves && (
          <div className="mt-4 space-y-2">
            {warehouse.shelves.length === 0 ? (
              <p className="text-sm text-muted-foreground">No shelves</p>
            ) : (
              warehouse.shelves.map((shelf) => (
                <div key={shelf.id} className="text-sm p-2 bg-muted rounded">
                  <div><strong>Code:</strong> {shelf.code}</div>
                  {shelf.row && <div><strong>Row:</strong> {shelf.row}</div>}
                  {shelf.column && <div><strong>Column:</strong> {shelf.column}</div>}
                  {shelf.level && <div><strong>Level:</strong> {shelf.level}</div>}
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Batch Expiration Manager Component
function BatchExpirationManager({ setMessageDialog, fetchStockData }: {
  setMessageDialog: (dialog: { open: boolean; title: string; message: string; type: 'success' | 'error' }) => void;
  fetchStockData: () => void;
}) {
  const [batchData, setBatchData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [newExpirationYears, setNewExpirationYears] = useState(2);
  const [filterType, setFilterType] = useState<'expiring' | 'expired'>('expired');
  const [filterValue, setFilterValue] = useState(2);

  const fetchBatchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType === 'expiring') {
        params.append('days', filterValue.toString());
      } else {
        params.append('yearsOld', filterValue.toString());
      }
      const response = await fetch(`/api/stock/batch-expiration?${params}`);
      const result = await response.json();
      if (result.success) {
        setBatchData(result.data);
      }
    } catch (error) {
      console.error('Error fetching batch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchData();
  }, [filterType, filterValue]);

  const handleBatchUpdate = async () => {
    if (selectedStocks.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select stocks to update',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/stock/batch-expiration', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockIds: selectedStocks,
          expirationYears: newExpirationYears
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: `${result.updatedCount} stocks updated successfully`
        });
        setSelectedStocks([]);
        fetchBatchData();
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to batch update expiration',
        variant: 'destructive'
      });
    }
  };

  const toggleStockSelection = (stockId: string) => {
    setSelectedStocks(prev =>
      prev.includes(stockId)
        ? prev.filter(id => id !== stockId)
        : [...prev, stockId]
    );
  };

  const handleCancelOffer = async (offerId: string) => {
    try {
      const response = await fetch('/api/stock/offers/enhanced', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, action: 'cancel' })
      });

      const result = await response.json();

      if (result.success) {
        setMessageDialog({
          open: true,
          title: 'Success',
          message: result.message || 'Reservation cancelled successfully. Stock has been returned.',
          type: 'success'
        });
        fetchBatchData(); // Refresh the batch data
        fetchStockData(); // Refresh the main stock list
      } else {
        setMessageDialog({
          open: true,
          title: 'Error',
          message: result.error || 'Failed to cancel reservation',
          type: 'error'
        });
      }
    } catch (error) {
      setMessageDialog({
        open: true,
        title: 'Error',
        message: 'Failed to cancel reservation',
        type: 'error'
      });
    }
  };

  const renderStockBatch = (stocks: any[], title: string, color: string) => {
    if (!stocks) stocks = [];
    return (
      <Card>
        <CardHeader>
          <CardTitle className={`text-lg ${color}`}>{title}</CardTitle>
          <CardDescription>{stocks.length} items</CardDescription>
        </CardHeader>
        <CardContent>
          {stocks.length === 0 ? (
            <p className="text-muted-foreground">No items in this batch</p>
          ) : (
            <div className="space-y-2">
              {stocks.map((stock) => (
                <div key={stock.id} className="flex items-center space-x-3 p-2 border rounded">
                  <Checkbox
                    checked={selectedStocks.includes(stock.id)}
                    onCheckedChange={() => toggleStockSelection(stock.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{stock.product?.CollectCode || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">
                      {stock.product?.DesignName} - Expires: {stock.expirationDate ? new Date(stock.expirationDate).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Warehouse: {stock.warehouse?.name || 'N/A'} | Available: {stock.availableQuantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Batch Expiration Management</h2>
          <p className="text-muted-foreground">Identify and manage expiring or expired stock in batches</p>
        </div>
        <Button onClick={() => fetchBatchData()} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Data'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div>
              <Label>Filter Type</Label>
              <Select
                value={filterType}
                onValueChange={(value: 'expiring' | 'expired') => setFilterType(value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expiring">Expiring Within</SelectItem>
                  <SelectItem value="expired">Older Than</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{filterType === 'expiring' ? 'Days' : 'Years'}</Label>
              <Input
                type="number"
                value={filterValue}
                onChange={(e) => setFilterValue(parseInt(e.target.value) || 0)}
                className="w-24"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {batchData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{batchData.criticalCount}</div>
              <p className="text-sm text-muted-foreground">
                {filterType === 'expiring' ? 'Critical (≤7 days)' : `${filterValue}+ Years Old`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{batchData.warningCount}</div>
              <p className="text-sm text-muted-foreground">
                {filterType === 'expiring' ? 'Warning (7-30 days)' : `${filterValue + 2}+ Years Old`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{batchData.upcomingCount}</div>
              <p className="text-sm text-muted-foreground">
                {filterType === 'expiring' ? 'Upcoming (30+ days)' : `${filterValue + 5}+ Years Old`}
              </p>
            </CardContent>
          </Card>
          {filterType === 'expiring' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-600">{batchData.offersTotal || 0}</div>
                <p className="text-sm text-muted-foreground">Expiring Offers</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {selectedStocks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Batch Update Expiration</CardTitle>
            <CardDescription>
              Update expiration dates for {selectedStocks.length} selected stocks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div>
                <Label htmlFor="batch-expiration">New Expiration Years</Label>
                <Select
                  value={newExpirationYears.toString()}
                  onValueChange={(value) => setNewExpirationYears(parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Years</SelectItem>
                    <SelectItem value="5">5 Years</SelectItem>
                    <SelectItem value="10">10 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleBatchUpdate}>
                Update {selectedStocks.length} Stocks
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {batchData && (
        <div className="space-y-6">
          {filterType === 'expiring' ? (
            <>
              {renderStockBatch(batchData.batches.critical, 'Critical Expiring (≤7 days)', 'text-red-600')}
              {renderStockBatch(batchData.batches.warning, 'Warning Expiring (7-30 days)', 'text-yellow-600')}
              {renderStockBatch(batchData.batches.upcoming, 'Upcoming Expiring (30+ days)', 'text-blue-600')}
            </>
          ) : (
            <>
              {renderStockBatch(batchData.batches.old, `${filterValue}+ Years Old`, 'text-red-600')}
              {renderStockBatch(batchData.batches.older, `${filterValue + 2}+ Years Old`, 'text-yellow-600')}
              {renderStockBatch(batchData.batches.very_old, `${filterValue + 5}+ Years Old`, 'text-blue-600')}
            </>
          )}
        </div>
      )}

      {batchData && filterType === 'expiring' && batchData.expiringOffers && batchData.expiringOffers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expiring Reservations</CardTitle>
            <CardDescription>Offers that will expire within {filterValue} days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {batchData.expiringOffers.map((offer: any) => (
                <div key={offer.id} className="flex items-center space-x-3 p-2 border rounded">
                  <div className="flex-1">
                    <div className="font-medium">{offer.product?.CollectCode || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">
                      {offer.product?.DesignName} - Expires: {offer.expiryDate ? new Date(offer.expiryDate).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Reserved by: {offer.creator?.name || 'Unknown'} | Quantity: {offer.quantity}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelOffer(offer.id)}
                  >
                    Cancel
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function EnhancedStockManagement() {
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [incomingStock, setIncomingStock] = useState<IncomingStock>({
    productId: 0,
    productType: 'SINGLE_ITEM',
    qty_in: 0,
    isComplated_set: false,
    isBody_only: false,
    isLid_only: false,
    expirationYears: 2,
    warehouseId: '',
    shelfId: '',
    notes: ''
  });
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [clientCodes, setClientCodes] = useState<ClientCode[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<string>('');
  const [selectedClientCode, setSelectedClientCode] = useState<string>('');
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    productType: 'SINGLE_ITEM' as 'SINGLE_ITEM' | 'SET_PRODUCT' | 'UNSET',
    qty_in: 0,
    isComplated_set: false,
    isBody_only: false,
    isLid_only: false,
    expirationYears: 2,
    warehouseId: '',
    shelfId: '',
    notes: ''
  });
  const [reservingStock, setReservingStock] = useState<StockItem | null>(null);
  const [reserveFormData, setReserveFormData] = useState({
    designCode: '',
    quantity: 0,
    notes: '',
    expiryDays: 7
  });
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [messageDialog, setMessageDialog] = useState<{ open: boolean; title: string; message: string; type: 'success' | 'error' }>({
    open: false,
    title: '',
    message: '',
    type: 'success'
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; stock: StockItem | null }>({ open: false, stock: null });

  // Fetch warehouses
  const fetchWarehouses = async () => {
    try {
      const response = await fetch('/api/stock/warehouses');
      const result = await response.json();
      if (result.success) {
        setWarehouses(result.data);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  // Fetch products
  const fetchProducts = async (search?: string) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const response = await fetch(`/api/stock/products?${params}`);
      const result = await response.json();
      if (result.success) {
        setProducts(result.data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Fetch designs
  const fetchDesigns = async () => {
    try {
      const response = await fetch('/api/designs');
      const result = await response.json();
      if (result.success) {
        setDesigns(result.data);
      }
    } catch (error) {
      console.error('Error fetching designs:', error);
    }
  };

  // Fetch client codes for selected design
  const fetchClientCodes = async (designCode: string) => {
    try {
      const response = await fetch(`/api/stock/products/client-codes?designCode=${designCode}`);
      const result = await response.json();
      if (result.success) {
        setClientCodes(result.data);
      }
    } catch (error) {
      console.error('Error fetching client codes:', error);
    }
  };

  // Fetch shelves
  const fetchShelves = async () => {
    try {
      const response = await fetch('/api/stock/shelves');
      const result = await response.json();
      if (result.success) {
        setShelves(result.data);
      }
    } catch (error) {
      console.error('Error fetching shelves:', error);
    }
  };

  // Check if stock already exists for a product
  const checkExistingStock = async (productId: number) => {
    try {
      const response = await fetch(`/api/stock/enhanced?productId=${productId}`);
      const result = await response.json();
      if (result.success && result.data.length > 0) {
        toast({
          title: 'Stock Already Exists',
          description: 'This product already has stock. You can add more quantity by editing the existing stock entry.',
          variant: 'default'
        });
      }
    } catch (error) {
      // Ignore error, not critical
    }
  };

  // Fetch stock data
  const fetchStockData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (warehouseFilter !== 'all') params.append('warehouseId', warehouseFilter);

      const response = await fetch(`/api/stock/enhanced?${params}`);
      const result = await response.json();

      console.log('Stock API Response:', result);

      if (result.success) {
        console.log('Stock data received:', result.data);
        setStockData(result.data);
      } else {
        console.error('Stock API Error:', result.error);
        setMessageDialog({
          open: true,
          title: 'Error',
          message: result.error || 'Failed to fetch stock data',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
      setMessageDialog({
        open: true,
        title: 'Error',
        message: 'Failed to fetch stock data',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
    fetchProducts();
    fetchDesigns();
    fetchShelves();
    fetchStockData();
  }, [statusFilter, warehouseFilter]);

  // Fetch client codes when design is selected
  useEffect(() => {
    if (selectedDesign) {
      fetchClientCodes(selectedDesign);
      // Reset dependent selections
      setSelectedClientCode('');
      setSelectedProduct(null);
    } else {
      setClientCodes([]);
      setSelectedClientCode('');
      setSelectedProduct(null);
    }
  }, [selectedDesign]);

  // Find product when client code is selected
  useEffect(() => {
    if (selectedDesign && selectedClientCode) {
      const product = products.find(p =>
        p.DesignCode === selectedDesign &&
        p.ClientCode === selectedClientCode
      );
      setSelectedProduct(product || null);
      if (product) {
        setIncomingStock(prev => ({ ...prev, productId: product.ID }));
        // Check if stock already exists for this product
        checkExistingStock(product.ID);
      }
    } else {
      setSelectedProduct(null);
    }
  }, [selectedDesign, selectedClientCode, products]);

  // Add incoming stock
   const handleAddStock = async () => {
     console.log('handleAddStock called', { selectedProduct, incomingStock });
     if (!incomingStock.productId || incomingStock.qty_in <= 0) {
       setMessageDialog({
         open: true,
         title: 'Validation Error',
         message: 'Please select a product and enter valid quantity',
         type: 'error'
       });
       return;
     }

     try {
       // Get current user ID
       console.log('Fetching user...');
       const userResponse = await fetch('/api/auth/me');
       const userResult = await userResponse.json();
       console.log('User result:', userResult);

       if (!userResult.success || !userResult.data?.user?.id) {
         setMessageDialog({
           open: true,
           title: 'Authentication Required',
           message: 'Please log in to add stock',
           type: 'error'
         });
         return;
       }

       console.log('Adding stock with data:', incomingStock);

       const requestData = {
         ...incomingStock,
         createdBy: userResult.data.user.id
       };
      console.log('Request data:', requestData);

      const response = await fetch('/api/stock/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      console.log('Add Stock API Response:', result);

      if (result.success) {
        setMessageDialog({
          open: true,
          title: 'Success',
          message: `Successfully added ${incomingStock.qty_in} units to stock`,
          type: 'success'
        });
        setIncomingStock({
          productId: 0,
          productType: 'SINGLE_ITEM',
          qty_in: 0,
          isComplated_set: false,
          isBody_only: false,
          isLid_only: false,
          expirationYears: 2,
          warehouseId: '',
          shelfId: '',
          notes: ''
        });
        setSelectedProduct(null);
        setSelectedDesign('');
        setSelectedClientCode('');
        fetchStockData();
      } else {
        console.error('Add Stock API Error:', result.error);
        setMessageDialog({
          open: true,
          title: 'Error',
          message: result.error || 'Failed to add stock',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      setMessageDialog({
        open: true,
        title: 'Error',
        message: 'Failed to add stock',
        type: 'error'
      });
    }
  };

  // Handle edit stock
   const handleEditStock = (stock: StockItem) => {
     setEditingStock(stock);
     setEditFormData({
       productType: stock.productType,
       qty_in: stock.qty_in,
       isComplated_set: stock.isComplated_set,
       isBody_only: stock.isBody_only,
       isLid_only: stock.isLid_only,
       expirationYears: stock.expirationYears,
       warehouseId: stock.warehouse?.id || '',
       shelfId: stock.shelf?.id || '',
       notes: stock.notes || ''
     });
   };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingStock) return;

    try {
      const response = await fetch(`/api/stock/enhanced?id=${editingStock.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });

      const result = await response.json();

      if (result.success) {
        setMessageDialog({
          open: true,
          title: 'Success',
          message: 'Stock updated successfully',
          type: 'success'
        });
        setEditingStock(null);
        fetchStockData();
      } else {
        setMessageDialog({
          open: true,
          title: 'Error',
          message: result.error,
          type: 'error'
        });
      }
    } catch (error) {
      setMessageDialog({
        open: true,
        title: 'Error',
        message: 'Failed to update stock',
        type: 'error'
      });
    }
  };

  // Handle reserve stock
  const handleReserveStock = (stock: StockItem) => {
    setReservingStock(stock);
    setReserveFormData({
      designCode: stock.designCode,
      quantity: 1,
      notes: '',
      expiryDays: 7
    });
  };

  // Handle save reservation
  const handleSaveReservation = async () => {
    if (!reservingStock) return;

    if (reserveFormData.quantity <= 0) {
      setMessageDialog({
        open: true,
        title: 'Validation Error',
        message: 'Please provide valid quantity',
        type: 'error'
      });
      return;
    }

    try {
      // Get current user for both clientId and createdBy
      const userResponse = await fetch('/api/auth/me');
      const userResult = await userResponse.json();

      if (!userResult.success || !userResult.data?.user?.id) {
        setMessageDialog({
          open: true,
          title: 'Authentication Required',
          message: 'Please log in to create reservations',
          type: 'error'
        });
        return;
      }

      const userId = userResult.data.user.id;

      const response = await fetch('/api/stock/offers/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockId: reservingStock.id,
          clientCode: reserveFormData.designCode,
          quantity: reserveFormData.quantity,
          notes: reserveFormData.notes || '',
          expiryDays: reserveFormData.expiryDays,
          createdBy: userId
        })
      });

      const result = await response.json();

      if (result.success) {
        setMessageDialog({
          open: true,
          title: 'Success',
          message: 'Stock reservation created successfully',
          type: 'success'
        });
        setReservingStock(null);
        fetchStockData();
      } else {
        setMessageDialog({
          open: true,
          title: 'Error',
          message: result.error,
          type: 'error'
        });
      }
    } catch (error) {
      setMessageDialog({
        open: true,
        title: 'Error',
        message: 'Failed to create reservation',
        type: 'error'
      });
    }
  };

  // Handle delete stock
   const handleDeleteStock = (stock: StockItem) => {
     setDeleteConfirm({ open: true, stock });
   };

   const confirmDeleteStock = async () => {
     if (!deleteConfirm.stock) return;

     try {
       const response = await fetch(`/api/stock/enhanced?id=${deleteConfirm.stock.id}`, {
         method: 'DELETE'
       });

       const result = await response.json();

       if (result.success) {
         setMessageDialog({
           open: true,
           title: 'Success',
           message: 'Stock deleted successfully',
           type: 'success'
         });
         fetchStockData();
       } else {
         setMessageDialog({
           open: true,
           title: 'Error',
           message: result.error,
           type: 'error'
         });
       }
     } catch (error) {
       setMessageDialog({
         open: true,
         title: 'Error',
         message: 'Failed to delete stock',
         type: 'error'
       });
     } finally {
       setDeleteConfirm({ open: false, stock: null });
     }
   };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'out_of_stock':
        return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'out_of_stock':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  // Get product type badge and icon
  const getProductTypeInfo = (productType: string) => {
    switch (productType) {
      case 'SINGLE_ITEM':
        return {
          badge: <Badge className="bg-blue-100 text-blue-800">Single</Badge>,
          icon: <Package className="h-4 w-4 text-blue-600" />,
          description: 'Standalone product'
        };
      case 'SET_PRODUCT':
        return {
          badge: <Badge className="bg-purple-100 text-purple-800">Set</Badge>,
          icon: <Package className="h-4 w-4 text-purple-600" />,
          description: 'Product that comes as a set'
        };
      case 'UNSET':
        return {
          badge: <Badge className="bg-orange-100 text-orange-800">Unset</Badge>,
          icon: <Package className="h-4 w-4 text-orange-600" />,
          description: 'Part'
        };
      default:
        return {
          badge: <Badge variant="secondary">Unknown</Badge>,
          icon: <Package className="h-4 w-4" />,
          description: 'Product type not specified'
        };
    }
  };

  // Calculate actual available stock based on product type
  // Qty handling clarification:
  // - SINGLE_ITEM: qty_in represents individual items, available = qty_in - qty_offer
  // - SET_PRODUCT: qty_in represents number of complete sets (if isComplated_set=true) or components,
  //   available = qty_in - qty_offer (in terms of sets)
  // - UNSET: qty_in represents spare parts/components, available = 0 (not for direct sale)
  const getActualAvailableStock = (stock: StockItem) => {
    switch (stock.productType) {
      case 'SINGLE_ITEM':
        return stock.availableQuantity; // Individual items available for sale
      case 'SET_PRODUCT':
        // For set products, availability depends on whether it's a complete set
        return stock.isComplated_set ? stock.availableQuantity : 0;
      case 'UNSET':
        // Unset items (spare parts) are not available for selling as complete products
        return 0;
      default:
        return stock.availableQuantity;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Stock Management</h1>
          <p className="text-muted-foreground">
            Manage product stock with warehouse tracking and expiration monitoring
          </p>
        </div>
        <Button onClick={() => setActiveTab('incoming')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Stock
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Stock Overview</TabsTrigger>
          <TabsTrigger value="incoming">Add Stock</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          <TabsTrigger value="shelves">Shelves</TabsTrigger>
          <TabsTrigger value="notifications">Expiring Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Filters</CardTitle>
              <CardDescription>Filter stock by status, warehouse, or search</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <div className="flex-1">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by product code, design, client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label>Warehouse</Label>
                <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Warehouses</SelectItem>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, stockData.length)} of {stockData.length} items
                  </span>
                  <Button variant="outline" size="sm" onClick={fetchStockData}>
                    Refresh
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.ceil(stockData.length / itemsPerPage) }, (_, i) => (
                      <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(stockData.length / itemsPerPage), prev + 1))}
                    disabled={currentPage === Math.ceil(stockData.length / itemsPerPage)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Overview Table */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Overview</CardTitle>
              <CardDescription>
                Current stock levels with warehouse and expiration tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p>Loading stock data...</p>
                </div>
              ) : stockData.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p>No stock data found</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Photo</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Design</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Size</TableHead>
                        {/* <TableHead>Texture</TableHead> */}
                        <TableHead>Color</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead title="Reserved (pending offers only)">Reserved</TableHead>
                        <TableHead title="Total (approved + pending reservations)">Total</TableHead>
                        <TableHead>Status</TableHead>
                        {/* <TableHead>Expiration</TableHead> */}
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockData
                        .filter(stock =>
                          searchTerm === '' ||
                          stock.designCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          stock.clientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (stock.product?.ClientCode?.toLowerCase().includes(searchTerm.toLowerCase()))
                        )
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((stock) => (
                        <TableRow key={stock.id}>
                          <TableCell>
                            {stock.product?.Photo1 ? (
                              <img 
                                src={stock.product.Photo1.startsWith('http') ? stock.product.Photo1 : `http://192.168.1.110/upload/${stock.product.Photo1}`}
                                alt={stock.product?.ClientCode || 'Product'}
                                className="h-24 w-24 rounded object-cover border"
                                onError={(e) => {
                                  e.currentTarget.src = '';
                                  e.currentTarget.alt = 'No image';
                                }}
                              />
                            ) : (
                              <div className="h-24 w-24 rounded border bg-muted flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {stock.product?.ClientCode || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{stock.product?.DesignName || '-'}</div>
                              <div className="text-muted-foreground">{stock.product?.NameDesc || '-'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getProductTypeInfo(stock.productType).badge}
                              {/* <div className="text-xs text-muted-foreground" title={getProductTypeInfo(stock.productType).description}>
                                {getProductTypeInfo(stock.productType).description}
                              </div> */}
                            </div>
                          </TableCell>
                          <TableCell>
                            {stock.product?.CategoryName || '-'}
                          </TableCell>
                          <TableCell>
                            {stock.product?.SizeName || '-'}
                          </TableCell>
                          {/* <TableCell>
                            {stock.product?.TextureName || '-'}
                          </TableCell> */}
                          <TableCell className="font-medium max-w-32 truncate" title={stock.product?.ColorName || '-'}>
                            {stock.product?.ColorName || '-'}
                          </TableCell>
                          <TableCell className="font-medium">
                            {getActualAvailableStock(stock)}
                          </TableCell>
                          <TableCell>
                            {stock.productType === 'UNSET' ? (
                              <span className="text-muted-foreground" title="Unset items are not reserved for offers">
                                N/A
                              </span>
                            ) : (
                              stock.qty_offer
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{stock.total}</span>
                              {stock.productType === 'SET_PRODUCT' && (
                                <span className="text-xs text-muted-foreground">
                                  Complete Sets: {stock.isComplated_set ? stock.availableQuantity : 0}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(stock.status)}
                                {getStatusBadge(stock.status)}
                              </div>
                              {(stock.isBody_only || stock.isLid_only || stock.isComplated_set) && (
                                <div className="flex gap-1">
                                  {stock.isBody_only && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">Body Only</Badge>
                                  )}
                                  {stock.isLid_only && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">Lid Only</Badge>
                                  )}
                                  {stock.isComplated_set && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">Set</Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          {/* <TableCell>
                            {stock.expirationDate ? (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm">
                                  {new Date(stock.expirationDate).toLocaleDateString()}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No expiration</span>
                            )}
                          </TableCell> */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedStock(stock)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Stock Details - {stock.product?.ClientCode}
                                    </DialogTitle>
                                    <DialogDescription>
                                      Detailed information for this stock item
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <div>
                                        <Label>Product Information</Label>
                                        <div className="mt-2 space-y-2">
                                          <div><strong>Code:</strong> {stock.product?.ClientCode}</div>
                                          <div><strong>Design:</strong> {stock.product?.DesignName}</div>
                                          <div><strong>Name:</strong> {stock.product?.NameDesc}</div>
                                          <div><strong>Category:</strong> {stock.product?.CategoryName}</div>
                                          <div><strong>Size:</strong> {stock.product?.SizeName}</div>
                                          <div><strong>Color:</strong> {stock.product?.ColorName}</div>
                                          <div><strong>Material:</strong> {stock.product?.MaterialName}</div>
                                          <div><strong>Texture:</strong> {stock.product?.TextureName}</div>
                                        </div>
                                      </div>
                                      <div>
                                        <Label>Stock Properties</Label>
                                        <div className="mt-2 space-y-2">
                                          <div><strong>Product Type:</strong> {getProductTypeInfo(stock.productType).badge}</div>
                                          <div><strong>Complete Set:</strong> {stock.isComplated_set ? 'Yes' : 'No'}</div>
                                          <div><strong>Body Only:</strong> {stock.isBody_only ? 'Yes' : 'No'}</div>
                                          <div><strong>Lid Only:</strong> {stock.isLid_only ? 'Yes' : 'No'}</div>
                                          <div><strong>Expiration Years:</strong> {stock.expirationYears}</div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="space-y-4">
                                      <div>
                                        <Label>Location</Label>
                                        <div className="mt-2 space-y-2">
                                          <div><strong>Warehouse:</strong> {stock.warehouse?.name || 'Unassigned'}</div>
                                          <div><strong>Shelf:</strong> {stock.shelf?.code || 'Unassigned'}</div>
                                          {stock.shelf?.row && <div><strong>Row:</strong> {stock.shelf.row}</div>}
                                          {stock.shelf?.column && <div><strong>Column:</strong> {stock.shelf.column}</div>}
                                          {stock.shelf?.level && <div><strong>Level:</strong> {stock.shelf.level}</div>}
                                        </div>
                                      </div>
                                      <div>
                                        <Label>Quantities</Label>
                                        <div className="mt-2 space-y-2">
                                          <div><strong>Total In:</strong> {stock.qty_in}</div>
                                          <div title="Dynamic total = approved reservations + pending reservations"><strong>Total (approved + pending):</strong> {stock.total}</div>
                                          <div title="Reserved by pending offers only"><strong>Reserved:</strong> {stock.qty_offer}</div>
                                          <div><strong>Available:</strong> {stock.availableQuantity}</div>
                                          <div><strong>Actual Available for Sale:</strong> {getActualAvailableStock(stock)}</div>
                                          {stock.productType === 'SET_PRODUCT' && (
                                            <div className="text-sm text-muted-foreground">
                                              Only complete sets (isComplated_set=true) are available for selling
                                            </div>
                                          )}
                                          {stock.productType === 'UNSET' && (
                                            <div className="text-sm text-muted-foreground">
                                              Unset items (spare parts) are not available for selling as complete products
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      {stock.notes && (
                                        <div>
                                          <Label>Notes</Label>
                                          <p className="mt-2 text-sm">{stock.notes}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`/products/${stock.productId}`, '_blank')}
                              >
                                <Package className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReserveStock(stock)}
                                disabled={stock.availableQuantity <= 0}
                              >
                                Reserve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditStock(stock)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteStock(stock)}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incoming" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Stock</CardTitle>
              <CardDescription>
                Add new stock or increase quantity for existing products with warehouse and expiration tracking.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="productType">Product Type</Label>
                  <Select
                    value={incomingStock.productType}
                    onValueChange={(value: 'SINGLE_ITEM' | 'SET_PRODUCT' | 'UNSET') =>
                      setIncomingStock(prev => ({ ...prev, productType: value }))}
                  >
                    <SelectTrigger id="productType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLE_ITEM">Single</SelectItem>
                      <SelectItem value="SET_PRODUCT">Set</SelectItem>
                      <SelectItem value="UNSET">Unset</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="design">Select Design</Label>
                  <Select
                    value={selectedDesign}
                    onValueChange={setSelectedDesign}
                  >
                    <SelectTrigger id="design">
                      <SelectValue placeholder="Select a design..." />
                    </SelectTrigger>
                    <SelectContent>
                      {designs.map((design) => (
                        <SelectItem key={design.DesignCode} value={design.DesignCode}>
                          {design.DesignName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedDesign && (
                  <div className="col-span-2">
                    <Label htmlFor="clientCode">Select Code</Label>
                    <Select
                      value={selectedClientCode}
                      onValueChange={setSelectedClientCode}
                    >
                      <SelectTrigger id="clientCode">
                        <SelectValue placeholder="Select a client code..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clientCodes.map((clientCode) => (
                          <SelectItem key={clientCode.ID} value={clientCode.ClientCode}>
                            {clientCode.ClientCode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedProduct && (
                  <div className="col-span-2">
                    <Label>Selected Product</Label>
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <div className="font-medium">{selectedProduct.CollectCode}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedProduct.DesignName} - {selectedProduct.NameDesc} - {selectedProduct.CategoryName}
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={incomingStock.qty_in || ''}
                    onChange={(e) => setIncomingStock(prev => ({ ...prev, qty_in: parseInt(e.target.value) || 0 }))}
                    placeholder="Enter quantity"
                  />
                </div>
                
                <div>
                  <Label htmlFor="warehouse">Warehouse</Label>
                  <Select
                    value={incomingStock.warehouseId || ''}
                    onValueChange={(value) => setIncomingStock(prev => ({ ...prev, warehouseId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse..." />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} ({warehouse.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="expiration">Expiration Years</Label>
                  <Select
                    value={incomingStock.expirationYears?.toString() || '2'}
                    onValueChange={(value) => setIncomingStock(prev => ({ ...prev, expirationYears: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Years</SelectItem>
                      <SelectItem value="5">5 Years</SelectItem>
                      <SelectItem value="10">10 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="complete-set"
                      checked={incomingStock.isComplated_set}
                      onCheckedChange={(checked) => setIncomingStock(prev => ({ ...prev, isComplated_set: checked as boolean }))}
                    />
                    <Label htmlFor="complete-set">Complete Set</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="body-only"
                      checked={incomingStock.isBody_only}
                      onCheckedChange={(checked) => setIncomingStock(prev => ({ ...prev, isBody_only: checked as boolean }))}
                    />
                    <Label htmlFor="body-only">Body Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lid-only"
                      checked={incomingStock.isLid_only}
                      onCheckedChange={(checked) => setIncomingStock(prev => ({ ...prev, isLid_only: checked as boolean }))}
                    />
                    <Label htmlFor="lid-only">Lid Only</Label>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={incomingStock.notes || ''}
                    onChange={(e) => setIncomingStock(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Enter any notes about this stock entry..."
                    rows={3}
                  />
                </div>
              </div>
              
              <Button onClick={handleAddStock} className="w-full" disabled={!selectedProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Add Stock
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouses" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Warehouse Management</h2>
              <p className="text-muted-foreground">Manage warehouses and shelves</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Warehouse
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Warehouse</DialogTitle>
                  <DialogDescription>
                    Create a new warehouse location
                  </DialogDescription>
                </DialogHeader>
                <WarehouseForm setMessageDialog={setMessageDialog} onSuccess={() => {
                  fetchWarehouses();
                }} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warehouses.map((warehouse) => (
              <WarehouseCard
                key={warehouse.id}
                warehouse={warehouse}
                onUpdate={fetchWarehouses}
                onDelete={fetchWarehouses}
                setMessageDialog={setMessageDialog}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shelves" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Shelf Management</h2>
              <p className="text-muted-foreground">Manage shelves within warehouses</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shelf
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Shelf</DialogTitle>
                  <DialogDescription>
                    Create a new shelf location
                  </DialogDescription>
                </DialogHeader>
                <ShelfForm warehouses={warehouses} setMessageDialog={setMessageDialog} onSuccess={() => {
                  fetchShelves();
                }} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shelves.map((shelf) => (
              <ShelfCard
                key={shelf.id}
                shelf={shelf}
                onUpdate={fetchShelves}
                onDelete={fetchShelves}
                warehouses={warehouses}
                setMessageDialog={setMessageDialog}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <BatchExpirationManager setMessageDialog={setMessageDialog} fetchStockData={fetchStockData} />
        </TabsContent>
      </Tabs>

      {/* Edit Stock Dialog */}
      <Dialog open={!!editingStock} onOpenChange={() => setEditingStock(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Stock Entry</DialogTitle>
            <DialogDescription>
              Update stock information for {editingStock?.product?.ClientCode}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="edit-productType">Product Type</Label>
                <Select
                  value={editFormData.productType}
                  onValueChange={(value: 'SINGLE_ITEM' | 'SET_PRODUCT' | 'UNSET') =>
                    setEditFormData(prev => ({ ...prev, productType: value }))}
                >
                  <SelectTrigger id="edit-productType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE_ITEM">Single Item</SelectItem>
                    <SelectItem value="SET_PRODUCT">Set Product</SelectItem>
                    <SelectItem value="UNSET">Unset</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="0"
                  value={editFormData.qty_in || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, qty_in: parseInt(e.target.value) || 0 }))}
                  placeholder="Enter new quantity"
                />
                {editingStock && (
                  <div className="text-sm text-muted-foreground mt-1 space-y-1">
                    <p>Current stock: {editingStock.qty_in} units</p>
                    <p title="Dynamic total = approved reservations + pending reservations">
                      Total (approved + pending): {editingStock.total} units
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="edit-expiration">Expiration Years</Label>
                <Select
                  value={editFormData.expirationYears?.toString() || '2'}
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, expirationYears: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Years</SelectItem>
                    <SelectItem value="5">5 Years</SelectItem>
                    <SelectItem value="10">10 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-warehouse">Warehouse</Label>
                <Select
                  value={editFormData.warehouseId || 'none'}
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, warehouseId: value === 'none' ? '' : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No warehouse</SelectItem>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-complete-set"
                    checked={editFormData.isComplated_set}
                    onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isComplated_set: checked as boolean }))}
                  />
                  <Label htmlFor="edit-complete-set">Complete Set</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-body-only"
                    checked={editFormData.isBody_only}
                    onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isBody_only: checked as boolean }))}
                  />
                  <Label htmlFor="edit-body-only">Body Only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-lid-only"
                    checked={editFormData.isLid_only}
                    onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isLid_only: checked as boolean }))}
                  />
                  <Label htmlFor="edit-lid-only">Lid Only</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editFormData.notes || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter any notes about this stock entry..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingStock(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reserve Stock Dialog */}
      <Dialog open={!!reservingStock} onOpenChange={() => setReservingStock(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reserve Stock</DialogTitle>
            <DialogDescription>
              Create a reservation for {reservingStock?.product?.ClientCode}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>DesignCode</Label>
              <div className="mt-2 p-2 bg-muted rounded text-sm font-medium">
                {reserveFormData.designCode}
              </div>
            </div>

            <div>
              <Label htmlFor="reserve-quantity">Quantity to Reserve</Label>
              <Input
                id="reserve-quantity"
                type="number"
                min="1"
                max={reservingStock ? reservingStock.availableQuantity : 0}
                value={reserveFormData.quantity || ''}
                onChange={(e) => setReserveFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
              />
              {reservingStock && (
                <p className="text-sm text-muted-foreground mt-1">
                  Available: {reservingStock.availableQuantity} units
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="reserve-expiry">Expiry Days</Label>
              <Select
                value={reserveFormData.expiryDays.toString()}
                onValueChange={(value) => setReserveFormData(prev => ({ ...prev, expiryDays: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reserve-notes">Notes</Label>
              <Textarea
                id="reserve-notes"
                value={reserveFormData.notes}
                onChange={(e) => setReserveFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes about this reservation"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReservingStock(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveReservation}>
                Create Reservation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={messageDialog.open} onOpenChange={(open) => setMessageDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {messageDialog.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              {messageDialog.title}
            </DialogTitle>
            <DialogDescription>
              {messageDialog.message}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setMessageDialog(prev => ({ ...prev, open: false }))}>
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete stock for {deleteConfirm.stock?.product?.ClientCode || 'this product'}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, stock: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteStock}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}