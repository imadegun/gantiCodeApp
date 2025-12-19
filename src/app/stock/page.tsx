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
import { Plus, Package, TrendingUp, TrendingDown, Eye, CheckCircle, XCircle, AlertTriangle, Bell, Warehouse, Calendar } from 'lucide-react';
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
  shelves: Shelf[];
  _count: {
    stocks: number;
  };
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

interface Notification {
  id: string;
  stockId: string;
  type: 'EXPIRATION_WARNING' | 'EXPIRATION_NOTICE' | 'LOW_STOCK' | 'OFFER_EXPIRY';
  message: string;
  isRead: boolean;
  sentAt: string;
  readAt?: string;
  stock?: StockItem;
}

export default function StockManagement() {
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stockType, setStockType] = useState<'all' | 'clientcode' | 'designcode'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [incomingStock, setIncomingStock] = useState<IncomingStock>({
    type: 'clientcode',
    code: '',
    quantity: 0,
    source: 'manual'
  });
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    stock: StockItem | null;
    action: 'offer' | 'confirm_sale' | 'cancel_offer' | null;
  }>({ open: false, stock: null, action: null });

  // Fetch stock data
  const fetchStockData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (stockType !== 'all') params.append('type', stockType);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/stock?${params}`);
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
    fetchStockData();
  }, [stockType, statusFilter]);

  // Add incoming stock
  const handleAddStock = async () => {
    if (!incomingStock.code || incomingStock.quantity <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please provide valid code and quantity',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incomingStock)
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: `Added ${incomingStock.quantity} units to ${incomingStock.type} stock`
        });
        setIncomingStock({ type: 'clientcode', code: '', quantity: 0, source: 'manual' });
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

  // Perform stock action
  const handleStockAction = async () => {
    if (!actionDialog.stock || !actionDialog.action) return;

    const { stock, action } = actionDialog;
    const quantity = prompt(`Enter quantity for ${action}:`);
    const quantityNum = parseInt(quantity || '0');

    if (!quantityNum || quantityNum <= 0) return;

    try {
      const response = await fetch('/api/stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: stock.type,
          code: stock.code,
          action: action,
          quantity: quantityNum
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message
        });
        setActionDialog({ open: false, stock: null, action: null });
        fetchStockData();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to perform stock action',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error performing stock action:', error);
      toast({
        title: 'Error',
        description: 'Failed to perform stock action',
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

  // Get quantity display
  const getQuantityDisplay = (stock: StockItem) => {
    if (stock.type === 'clientcode') {
      return {
        available: stock.quantityAvailable || 0,
        reserved: stock.quantityReserved || 0,
        total: (stock.quantityAvailable || 0) + (stock.quantityReserved || 0)
      };
    } else {
      return {
        available: stock.availableQuantity || 0,
        reserved: stock.reservedQuantity || 0,
        total: stock.totalQuantity || 0
      };
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Stock Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage product stock levels with dual tracking (ClientCode + DesignCode)
          </p>
        </div>
        <Button onClick={() => setActiveTab('incoming')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Stock
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Stock Overview</TabsTrigger>
          <TabsTrigger value="incoming">Incoming Stock</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Filters</CardTitle>
              <CardDescription>Filter stock by type and status</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <div className="flex-1">
                <Label>Stock Type</Label>
                <Select value={stockType} onValueChange={(value: any) => setStockType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="clientcode">Code</SelectItem>
                    <SelectItem value="designcode">Design</SelectItem>
                  </SelectContent>
                </Select>
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
                Current stock levels for all tracked items
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
                      <TableHead>Type</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Product Info</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Reserved</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockData.map((stock) => {
                      const quantities = getQuantityDisplay(stock);
                      return (
                        <TableRow key={stock.id}>
                          <TableCell>
                            <Badge variant="outline">
                              {stock.type === 'clientcode' ? 'ClientCode' : 'DesignCode'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{stock.code}</TableCell>
                          <TableCell>
                            {stock.product ? (
                              <div className="text-sm">
                                {stock.type === 'clientcode' ? (
                                  <>
                                    <div>{stock.product.CollectCode}</div>
                                    <div className="text-muted-foreground">
                                      {stock.product.DesignCode} - {stock.product.NameCode}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div>{stock.product.DesignName}</div>
                                    <div className="text-muted-foreground">
                                      {stock.product.productCount} products
                                    </div>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No product info</span>
                            )}
                          </TableCell>
                          <TableCell>{quantities.available}</TableCell>
                          <TableCell>{quantities.reserved}</TableCell>
                          <TableCell className="font-medium">{quantities.total}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(stock.status)}
                              {getStatusBadge(stock.status)}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(stock.lastUpdated).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
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
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Stock Details - {stock.code}
                                    </DialogTitle>
                                    <DialogDescription>
                                      Detailed information and actions for this stock item
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Type</Label>
                                        <p className="text-sm">{stock.type}</p>
                                      </div>
                                      <div>
                                        <Label>Code</Label>
                                        <p className="text-sm">{stock.code}</p>
                                      </div>
                                      <div>
                                        <Label>Available Quantity</Label>
                                        <p className="text-sm">{quantities.available}</p>
                                      </div>
                                      <div>
                                        <Label>Reserved Quantity</Label>
                                        <p className="text-sm">{quantities.reserved}</p>
                                      </div>
                                      <div>
                                        <Label>Total Quantity</Label>
                                        <p className="text-sm">{quantities.total}</p>
                                      </div>
                                      <div>
                                        <Label>Status</Label>
                                        <div className="mt-1">
                                          {getStatusBadge(stock.status)}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => setActionDialog({
                                          open: true,
                                          stock,
                                          action: 'offer'
                                        })}
                                        disabled={quantities.available === 0}
                                      >
                                        <TrendingDown className="h-4 w-4 mr-1" />
                                        Offer to Client
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() => setActionDialog({
                                          open: true,
                                          stock,
                                          action: 'confirm_sale'
                                        })}
                                        disabled={quantities.reserved === 0}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Confirm Sale
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() => setActionDialog({
                                          open: true,
                                          stock,
                                          action: 'cancel_offer'
                                        })}
                                        disabled={quantities.reserved === 0}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Cancel Offer
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                Manually add stock from remaining production or other sources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Stock Type</Label>
                  <Select
                    value={incomingStock.type}
                    onValueChange={(value: any) => setIncomingStock(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clientcode">Code</SelectItem>
                      <SelectItem value="designcode">Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="code">
                    {incomingStock.type === 'clientcode' ? 'ClientCode' : 'DesignCode'}
                  </Label>
                  <Input
                    id="code"
                    value={incomingStock.code}
                    onChange={(e) => setIncomingStock(prev => ({ ...prev, code: e.target.value }))}
                    placeholder={`Enter ${incomingStock.type === 'clientcode' ? 'ClientCode' : 'DesignCode'}`}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={incomingStock.quantity || ''}
                    onChange={(e) => setIncomingStock(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    placeholder="Enter quantity"
                  />
                </div>
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select
                    value={incomingStock.source}
                    onValueChange={(value) => setIncomingStock(prev => ({ ...prev, source: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="return">Returns</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAddStock} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Stock
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Reports</CardTitle>
              <CardDescription>
                Analytics and insights about stock levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p>Stock reports and analytics coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stock Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ open, stock: null, action: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stock Action</DialogTitle>
            <DialogDescription>
              Confirm {actionDialog.action} for {actionDialog.stock?.code}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This action will affect the stock levels. Please confirm the quantity in the next step.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={handleStockAction} className="flex-1">
                Confirm
              </Button>
              <Button
                variant="outline"
                onClick={() => setActionDialog({ open: false, stock: null, action: null })}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}