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
import { Plus, Package, TrendingUp, TrendingDown, Eye, CheckCircle, XCircle, AlertTriangle, Bell, Warehouse, Calendar, Search } from 'lucide-react';
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
      params.append('limit', '50');

      const response = await fetch(`/api/stock/products?${params}`);
      const result = await response.json();
      if (result.success) {
        setProducts(result.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
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
    fetchStockData();
  }, [statusFilter, warehouseFilter]);

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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Location</TableHead>
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
                        (stock.product?.CollectCode?.toLowerCase().includes(searchTerm.toLowerCase()))
                      )
                      .map((stock) => (
                      <TableRow key={stock.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {stock.product?.Photo1 && (
                              <img 
                                src={stock.product.Photo1} 
                                alt={stock.product.CollectCode}
                                className="h-10 w-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium">{stock.product?.CollectCode}</div>
                              <div className="text-sm text-muted-foreground">
                                {stock.product?.DesignName} - {stock.product?.NameDesc}
                              </div>
                              {stock.isExpiringSoon && (
                                <Badge variant="destructive" className="text-xs mt-1">
                                  Expiring Soon
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {stock.warehouse ? (
                            <div className="flex items-center gap-2">
                              <Warehouse className="h-4 w-4" />
                              <span>{stock.warehouse.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {stock.shelf ? (
                            <div className="text-sm">
                              {stock.shelf.code}
                              {stock.shelf.row && ` - Row ${stock.shelf.row}`}
                              {stock.shelf.column && ` - Col ${stock.shelf.column}`}
                              {stock.shelf.level && ` - Level ${stock.shelf.level}`}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{stock.availableQuantity}</TableCell>
                        <TableCell>{stock.qty_offer}</TableCell>
                        <TableCell className="font-medium">{stock.total}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(stock.status)}
                            {getStatusBadge(stock.status)}
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
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>
                                  Stock Details - {stock.product?.CollectCode}
                                </DialogTitle>
                                <DialogDescription>
                                  Detailed information for this stock item
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <Label>Product Information</Label>
                                    <div className="mt-2 space-y-2">
                                      <div><strong>Collect Code:</strong> {stock.product?.CollectCode}</div>
                                      <div><strong>Design:</strong> {stock.product?.DesignName}</div>
                                      <div><strong>Name:</strong> {stock.product?.NameDesc}</div>
                                      <div><strong>Category:</strong> {stock.product?.CategoryName}</div>
                                      <div><strong>Size:</strong> {stock.product?.SizeName}</div>
                                      <div><strong>Color:</strong> {stock.product?.ColorName}</div>
                                      <div><strong>Material:</strong> {stock.product?.MaterialName}</div>
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                  <Label htmlFor="product">Select Product</Label>
                  <Select
                    value={selectedProduct?.ID?.toString() || ''}
                    onValueChange={(value) => {
                      const product = products.find(p => p.ID === parseInt(value));
                      setSelectedProduct(product || null);
                      if (product) {
                        setIncomingStock(prev => ({ ...prev, productId: product.ID }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Search and select a product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.ID} value={product.ID.toString()}>
                          {product.CollectCode} - {product.DesignName} - {product.NameDesc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
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
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Management</CardTitle>
              <CardDescription>
                View and manage warehouse locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {warehouses.map((warehouse) => (
                  <Card key={warehouse.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                      <CardDescription>{warehouse.code}</CardDescription>
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Notifications</CardTitle>
              <CardDescription>
                Expiration warnings and stock alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p>Stock notifications will appear here</p>
                <p className="text-sm text-muted-foreground mt-2">
                  System will notify you about expiring stock and low inventory levels
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}