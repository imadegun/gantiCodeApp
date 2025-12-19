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
  qty_in: number;
  qty_offer: number;
  total: number;
  availableQuantity: number;
  isComplated_set: boolean;
  isBody_only: boolean;
  isLid_only: boolean;
  expirationYears: number;
  expirationDate?: string;
  status: 'available' | 'low_stock' | 'out_of_stock';
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
  qty_in: number;
  isComplated_set: boolean;
  isBody_only: boolean;
  isLid_only: boolean;
  expirationYears: number;
  warehouseId?: string;
  shelfId?: string;
  notes?: string;
  createdBy: string;
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

// Warehouse Form Component
function WarehouseForm({ warehouse, onSuccess }: { warehouse?: Warehouse; onSuccess: () => void }) {
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
        toast({
          title: 'Success',
          description: `Warehouse ${warehouse ? 'updated' : 'created'} successfully`
        });
        onSuccess();
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
        description: 'Failed to save warehouse',
        variant: 'destructive'
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
function WarehouseCard({ warehouse, onUpdate, onDelete }: {
  warehouse: Warehouse;
  onUpdate: () => void;
  onDelete: () => void;
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
                <WarehouseForm warehouse={warehouse} onSuccess={onUpdate} />
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
function BatchExpirationManager() {
  const [batchData, setBatchData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [newExpirationYears, setNewExpirationYears] = useState(2);

  const fetchBatchData = async (days = 90) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/stock/batch-expiration?days=${days}`);
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
  }, []);

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

  const renderStockBatch = (stocks: any[], title: string, color: string) => (
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Batch Expiration Management</h2>
          <p className="text-muted-foreground">Identify and manage expiring stock in batches</p>
        </div>
        <Button onClick={() => fetchBatchData()} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Data'}
        </Button>
      </div>

      {batchData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{batchData.criticalCount}</div>
              <p className="text-sm text-muted-foreground">Critical (≤7 days)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{batchData.warningCount}</div>
              <p className="text-sm text-muted-foreground">Warning (7-30 days)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{batchData.upcomingCount}</div>
              <p className="text-sm text-muted-foreground">Upcoming (30+ days)</p>
            </CardContent>
          </Card>
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
          {renderStockBatch(batchData.batches.critical, 'Critical Expiring (≤7 days)', 'text-red-600')}
          {renderStockBatch(batchData.batches.warning, 'Warning Expiring (7-30 days)', 'text-yellow-600')}
          {renderStockBatch(batchData.batches.upcoming, 'Upcoming Expiring (30+ days)', 'text-blue-600')}
        </div>
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
  const [incomingStock, setIncomingStock] = useState<IncomingStock>({
    productId: 0,
    qty_in: 0,
    isComplated_set: false,
    isBody_only: false,
    isLid_only: false,
    expirationYears: 2,
    warehouseId: '',
    shelfId: '',
    notes: '',
    createdBy: 'current-user' // This should come from auth context
  });
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [clientCodes, setClientCodes] = useState<ClientCode[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<string>('');
  const [selectedClientCode, setSelectedClientCode] = useState<string>('');

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

  // Fetch stock data
  const fetchStockData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (warehouseFilter !== 'all') params.append('warehouseId', warehouseFilter);

      const response = await fetch(`/api/stock/enhanced?${params}`);
      const result = await response.json();

      if (result.success) {
        setStockData(result.data);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch stock data',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch stock data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
    fetchProducts();
    fetchDesigns();
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
      }
    } else {
      setSelectedProduct(null);
    }
  }, [selectedDesign, selectedClientCode, products]);

  // Add incoming stock
  const handleAddStock = async () => {
    if (!incomingStock.productId || incomingStock.qty_in <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select a product and enter valid quantity',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/stock/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incomingStock)
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: `Added ${incomingStock.qty_in} units to stock`
        });
        setIncomingStock({
          productId: 0,
          qty_in: 0,
          isComplated_set: false,
          isBody_only: false,
          isLid_only: false,
          expirationYears: 2,
          warehouseId: '',
          shelfId: '',
          notes: '',
          createdBy: 'current-user'
        });
        setSelectedProduct(null);
        setSelectedDesign('');
        setSelectedClientCode('');
        fetchStockData();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to add stock',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      toast({
        title: 'Error',
        description: 'Failed to add stock',
        variant: 'destructive'
      });
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'low_stock':
        return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
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
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'out_of_stock':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4" />;
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Stock Overview</TabsTrigger>
          <TabsTrigger value="incoming">Add Stock</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
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
                    <SelectItem value="low_stock">Low Stock</SelectItem>
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
              <div className="flex items-end">
                <Button variant="outline" onClick={fetchStockData}>
                  Refresh
                </Button>
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
                        <TableHead>Category</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Texture</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead>Reserved</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expiration</TableHead>
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
                              <div className="flex gap-1 mt-1">
                                {stock.isBody_only && (
                                  <Badge variant="secondary" className="text-xs">Body Only</Badge>
                                )}
                                {stock.isLid_only && (
                                  <Badge variant="secondary" className="text-xs">Lid Only</Badge>
                                )}
                                {stock.isComplated_set && (
                                  <Badge variant="secondary" className="text-xs">Complete Set</Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {stock.product?.CategoryName || '-'}
                          </TableCell>
                          <TableCell>
                            {stock.product?.SizeName || '-'}
                          </TableCell>
                          <TableCell>
                            {stock.product?.TextureName || '-'}
                          </TableCell>
                          <TableCell className="font-medium"> {stock.product?.ColorName || '-'}</TableCell>
                          <TableCell className="font-medium">
                            {stock.isBody_only || stock.isLid_only ? (
                              <span className="text-muted-foreground" title="Not counted as available stock as it's not a complete item">
                                N/A
                              </span>
                            ) : (
                              stock.availableQuantity
                            )}
                          </TableCell>
                          <TableCell>
                            {stock.isBody_only || stock.isLid_only ? (
                              <span className="text-muted-foreground" title="Not counted in reservations as it's not a complete item">
                                N/A
                              </span>
                            ) : (
                              stock.qty_offer
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {stock.isBody_only || stock.isLid_only ? (
                              <span className="text-muted-foreground line-through" title="Excluded from total stock as it's not a complete item">
                                {stock.total}
                              </span>
                            ) : (
                              stock.total
                            )}
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
                                    <Badge variant="outline" className="text-xs px-1 py-0">Body</Badge>
                                  )}
                                  {stock.isLid_only && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">Lid</Badge>
                                  )}
                                  {stock.isComplated_set && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">Set</Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
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
                          </TableCell>
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
                                          <div><strong>Reserved:</strong> {stock.qty_offer}</div>
                                          <div><strong>Available:</strong> {stock.availableQuantity}</div>
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
              <CardTitle>Add Incoming Stock</CardTitle>
              <CardDescription>
                Add new stock with warehouse and expiration tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="clientCode">Select Client Code</Label>
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
                <WarehouseForm onSuccess={() => {
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
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <BatchExpirationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}