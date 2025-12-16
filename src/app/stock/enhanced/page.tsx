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
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  Eye, 
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { StockStatus, OfferStatus } from '@prisma/client';

interface Product {
  ID: number;
  CollectCode: string;
  ClientCode: string | null;
  DesignCode: string;
  NameCode: string;
  CategoryCode: string;
  SizeCode: string;
  Photo1: string | null;
  Photo2: string | null;
  DesignName: string;
  CategoryName: string;
  SizeName: string;
  Width?: number;
  Height?: number;
  Length?: number;
  Diameter?: number;
}

interface StockEntry {
  id: string;
  clientCode: string;
  designCode: string;
  productId: number;
  department?: string | null;
  region?: string | null;
  quantityIn: number;
  isStockInSetComplete: boolean;
  isLid: boolean;
  isBody: boolean;
  status: StockStatus;
  notes?: string | null;
  expirationYears: number;
  expirationDate: string;
  createdAt: string;
  updatedAt: string;
  product: Product | null;
  totalOffered: number;
  availableQuantity: number;
  creator: {
    id: string;
    username: string;
    name?: string | null;
  };
  offers: Array<{
    id: string;
    quantity: number;
    clientId: string;
    status: OfferStatus;
    expiryDate: string;
  }>;
}

interface StockOffer {
  id: string;
  stockEntryId: string;
  clientId: string;
  quantity: number;
  status: OfferStatus;
  offerDate: string;
  expiryDate: string;
  notes?: string | null;
  stockEntry: StockEntry;
  creator: {
    id: string;
    username: string;
    name?: string | null;
  };
}

export default function EnhancedStockManagement() {
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<StockOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockEntry | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    clientCode: '',
    category: '',
    department: '',
    region: '',
    status: 'all',
    search: ''
  });
  
  // Form states
  const [formData, setFormData] = useState({
    clientCode: '',
    productId: 0,
    department: '',
    region: '',
    quantityIn: 0,
    isStockInSetComplete: false,
    isLid: false,
    isBody: false,
    notes: '',
    expirationYears: 2
  });
  
  const [offerData, setOfferData] = useState({
    stockEntryId: '',
    clientId: '',
    quantity: 0,
    notes: '',
    expiryDays: 7
  });

  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Fetch stock entries
  const fetchStockEntries = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') params.append(key, value);
      });
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const response = await fetch(`/api/stock/enhanced?${params}`);
      const result = await response.json();

      if (result.success) {
        setStockEntries(result.data.entries);
        setPagination(result.data.pagination);
      } else {
        toast.error(result.error || 'Failed to fetch stock entries');
      }
    } catch (error) {
      console.error('Error fetching stock entries:', error);
      toast.error('Failed to fetch stock entries');
    }
  };

  // Fetch products for selection
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/stock/products');
      const result = await response.json();

      if (result.success) {
        setProducts(result.data.products);
      } else {
        toast.error(result.error || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    }
  };

  // Fetch offers
  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/stock/offers');
      const result = await response.json();

      if (result.success) {
        setOffers(result.data);
      } else {
        toast.error(result.error || 'Failed to fetch offers');
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('Failed to fetch offers');
    }
  };

  useEffect(() => {
    fetchStockEntries();
    fetchProducts();
    fetchOffers();
  }, [filters, pagination.page, pagination.limit]);

  // Create stock entry
  const handleCreateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/stock/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          productId: selectedProduct.ID
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Stock entry created successfully');
        setCreateDialogOpen(false);
        setFormData({
          clientCode: '',
          productId: 0,
          department: '',
          region: '',
          quantityIn: 0,
          isStockInSetComplete: false,
          isLid: false,
          isBody: false,
          notes: '',
          expirationYears: 2
        });
        setSelectedProduct(null);
        fetchStockEntries();
      } else {
        toast.error(result.error || 'Failed to create stock entry');
      }
    } catch (error) {
      console.error('Error creating stock entry:', error);
      toast.error('Failed to create stock entry');
    } finally {
      setSubmitting(false);
    }
  };

  // Create stock offer
  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/stock/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Stock offer created successfully');
        setOfferDialogOpen(false);
        setOfferData({
          stockEntryId: '',
          clientId: '',
          quantity: 0,
          notes: '',
          expiryDays: 7
        });
        fetchStockEntries();
        fetchOffers();
      } else {
        toast.error(result.error || 'Failed to create stock offer');
      }
    } catch (error) {
      console.error('Error creating stock offer:', error);
      toast.error('Failed to create stock offer');
    } finally {
      setSubmitting(false);
    }
  };

  // Update offer status
  const handleUpdateOffer = async (offerId: string, status: 'approved' | 'rejected' | 'cancelled') => {
    try {
      const response = await fetch('/api/stock/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, status })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Offer ${status} successfully`);
        fetchOffers();
        fetchStockEntries();
      } else {
        toast.error(result.error || 'Failed to update offer');
      }
    } catch (error) {
      console.error('Error updating offer:', error);
      toast.error('Failed to update offer');
    }
  };

  // Get status badge
  const getStatusBadge = (status: StockStatus) => {
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

  // Get offer status badge
  const getOfferStatusBadge = (status: OfferStatus) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Check if stock is expiring soon
  const isExpiringSoon = (expirationDate: string) => {
    const expDate = new Date(expirationDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30; // Expiring within 30 days
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            Enhanced Stock Management
          </h1>
          <p className="text-muted-foreground">Manage stock with client selection and product integration</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Stock Entry
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Stock Overview</TabsTrigger>
          <TabsTrigger value="offers">Stock Offers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div>
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search stock..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label>Client Code</Label>
                  <Input
                    placeholder="Filter by client code"
                    value={filters.clientCode}
                    onChange={(e) => setFilters(prev => ({ ...prev, clientCode: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input
                    placeholder="Filter by department"
                    value={filters.department}
                    onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Region</Label>
                  <Input
                    placeholder="Filter by region"
                    value={filters.region}
                    onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
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
                  <Button onClick={fetchStockEntries} variant="outline">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Entries Table */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Entries</CardTitle>
              <CardDescription>
                Current stock levels with product information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading stock data...</p>
                </div>
              ) : stockEntries.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No stock entries found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client Code</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expiration</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">{entry.clientCode}</TableCell>
                          <TableCell>
                            {entry.product ? (
                              <div className="text-sm">
                                <div className="font-medium">{entry.product.DesignName}</div>
                                <div className="text-muted-foreground">{entry.product.CategoryName}</div>
                                {entry.product.Photo1 && (
                                  <img 
                                    src={entry.product.Photo1} 
                                    alt="Product" 
                                    className="w-8 h-8 object-cover rounded mt-1"
                                  />
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No product info</span>
                            )}
                          </TableCell>
                          <TableCell>{entry.department || '-'}</TableCell>
                          <TableCell>{entry.region || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{entry.availableQuantity}</span>
                              {entry.totalOffered > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {entry.totalOffered} offered
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{entry.quantityIn}</TableCell>
                          <TableCell>{getStatusBadge(entry.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span className="text-sm">
                                {new Date(entry.expirationDate).toLocaleDateString()}
                              </span>
                              {isExpiringSoon(entry.expirationDate) && (
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedStock(entry)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setOfferData({
                                    stockEntryId: entry.id,
                                    clientId: '',
                                    quantity: Math.min(entry.availableQuantity, 1),
                                    notes: '',
                                    expiryDays: 7
                                  });
                                  setOfferDialogOpen(true);
                                }}
                                disabled={entry.availableQuantity === 0}
                              >
                                <TrendingUp className="h-4 w-4" />
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

        <TabsContent value="offers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Offers</CardTitle>
              <CardDescription>
                Manage and track stock offers to clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              {offers.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No stock offers found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Offer Date</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {offers.map((offer) => (
                        <TableRow key={offer.id}>
                          <TableCell className="font-medium">{offer.clientId}</TableCell>
                          <TableCell>
                            {offer.stockEntry?.product ? (
                              <div className="text-sm">
                                <div className="font-medium">{offer.stockEntry.product.DesignName}</div>
                                <div className="text-muted-foreground">{offer.stockEntry.product.CategoryName}</div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No product info</span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{offer.quantity}</TableCell>
                          <TableCell>{getOfferStatusBadge(offer.status)}</TableCell>
                          <TableCell>
                            {new Date(offer.offerDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">
                                {new Date(offer.expiryDate).toLocaleDateString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {offer.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateOffer(offer.id, 'approved')}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateOffer(offer.id, 'rejected')}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
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

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Analytics</CardTitle>
              <CardDescription>
                Insights and reports about stock levels and movements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Analytics coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Stock Entry Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Stock Entry</DialogTitle>
            <DialogDescription>
              Add new stock entry with product selection and detailed information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateStock} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Client Code</Label>
                <Input
                  value={formData.clientCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientCode: e.target.value }))}
                  placeholder="Enter client code"
                  required
                />
              </div>
              <div>
                <Label>Product</Label>
                <Select onValueChange={(value) => {
                  const product = products.find(p => p.ID === parseInt(value));
                  setSelectedProduct(product || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.ID} value={product.ID.toString()}>
                        {product.DesignName} - {product.CategoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Department</Label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Enter department"
                />
              </div>
              <div>
                <Label>Region</Label>
                <Input
                  value={formData.region}
                  onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                  placeholder="Enter region"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={formData.quantityIn}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantityIn: parseInt(e.target.value) || 0 }))}
                  placeholder="Enter quantity"
                  min="1"
                  required
                />
              </div>
              <div>
                <Label>Expiration Years</Label>
                <Select value={formData.expirationYears.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, expirationYears: parseInt(value) }))}>
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

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isStockInSetComplete"
                  checked={formData.isStockInSetComplete}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isStockInSetComplete: checked as boolean }))}
                />
                <Label htmlFor="isStockInSetComplete">Set Complete</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isLid"
                  checked={formData.isLid}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isLid: checked as boolean }))}
                />
                <Label htmlFor="isLid">Includes Lid</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isBody"
                  checked={formData.isBody}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isBody: checked as boolean }))}
                />
                <Label htmlFor="isBody">Includes Body</Label>
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Enter any additional notes"
                rows={3}
              />
            </div>

            {selectedProduct && (
              <Alert>
                <Package className="h-4 w-4" />
                <AlertDescription>
                  <strong>Selected Product:</strong> {selectedProduct.DesignName} - {selectedProduct.CategoryName}
                  {selectedProduct.Photo1 && (
                    <img 
                      src={selectedProduct.Photo1} 
                      alt="Product" 
                      className="w-16 h-16 object-cover rounded mt-2"
                    />
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting || !selectedProduct} className="flex-1">
                {submitting ? 'Creating...' : 'Create Stock Entry'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Offer Dialog */}
      <Dialog open={offerDialogOpen} onOpenChange={setOfferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Stock Offer</DialogTitle>
            <DialogDescription>
              Offer stock to a client with specified quantity and expiry
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateOffer} className="space-y-4">
            <div>
              <Label>Client ID</Label>
              <Input
                value={offerData.clientId}
                onChange={(e) => setOfferData(prev => ({ ...prev, clientId: e.target.value }))}
                placeholder="Enter client ID"
                required
              />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={offerData.quantity}
                onChange={(e) => setOfferData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                placeholder="Enter quantity"
                min="1"
                required
              />
            </div>
            <div>
              <Label>Expiry Days</Label>
              <Select value={offerData.expiryDays.toString()} onValueChange={(value) => setOfferData(prev => ({ ...prev, expiryDays: parseInt(value) }))}>
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
              <Label>Notes</Label>
              <Textarea
                value={offerData.notes}
                onChange={(e) => setOfferData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Enter any notes for this offer"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Creating...' : 'Create Offer'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOfferDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}