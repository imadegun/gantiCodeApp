'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, TrendingUp, TrendingDown, Eye, CheckCircle, XCircle, AlertTriangle, Search, ImageIcon } from 'lucide-react';

interface PublicStockItem {
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
  status: 'available' | 'low_stock' | 'out_of_stock';
  notes?: string;
  product: any;
  isExpiringSoon?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PublicStockPage() {
  const [stockData, setStockData] = useState<PublicStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Fetch public stock data
  const fetchStockData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/stock/public?${params}`);
      const result = await response.json();

      if (result.success) {
        setStockData(result.data);
      } else {
        console.error('Failed to fetch public stock data');
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, [statusFilter]);

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

  // Get product type badge
  const getProductTypeInfo = (productType: string) => {
    switch (productType) {
      case 'SINGLE_ITEM':
        return {
          badge: <Badge className="bg-blue-100 text-blue-800">Single Item</Badge>,
          description: 'Standalone product (e.g., tea cup, plate)'
        };
      case 'SET_PRODUCT':
        return {
          badge: <Badge className="bg-purple-100 text-purple-800">Set Product</Badge>,
          description: 'Product that comes as a set (e.g., tea pot with lid)'
        };
      case 'UNSET':
        return {
          badge: <Badge className="bg-orange-100 text-orange-800">Unset</Badge>,
          description: 'Spare part or replacement component'
        };
      default:
        return {
          badge: <Badge variant="secondary">Unknown</Badge>,
          description: 'Product type not specified'
        };
    }
  };

  // Calculate actual available stock based on product type
  const getActualAvailableStock = (stock: PublicStockItem) => {
    switch (stock.productType) {
      case 'SINGLE_ITEM':
        return stock.availableQuantity;
      case 'SET_PRODUCT':
        return stock.availableQuantity;
      case 'UNSET':
        return 0;
      default:
        return stock.availableQuantity;
    }
  };

  // Filter data based on search term
  const filteredData = stockData.filter(stock =>
    searchTerm === '' ||
    stock.designCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.clientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (stock.product?.ClientCode?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (stock.product?.DesignName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (stock.product?.CategoryName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Paginate data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Available Stock</h1>
          <p className="text-muted-foreground">
            Browse our current product inventory
          </p>
        </div>
        <Button onClick={fetchStockData} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Products</CardTitle>
          <CardDescription>Find the products you're looking for</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product code, design, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex-1">
            <Label>Availability</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stock Overview Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>
            {filteredData.length} products found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p>Loading products...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p>No products found matching your criteria</p>
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
                    <TableHead>Color</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((stock) => (
                    <TableRow key={stock.id}>
                      <TableCell>
                        {stock.product?.Photo1 ? (
                          <img
                            src={stock.product.Photo1.startsWith('http') ? stock.product.Photo1 : `http://192.168.1.110/upload/${stock.product.Photo1}`}
                            alt={stock.product?.ClientCode || 'Product'}
                            className="h-16 w-16 rounded object-cover border"
                            onError={(e) => {
                              e.currentTarget.src = '';
                              e.currentTarget.alt = 'No image';
                            }}
                          />
                        ) : (
                          <div className="h-16 w-16 rounded border bg-muted flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
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
                        {getProductTypeInfo(stock.productType).badge}
                      </TableCell>
                      <TableCell>
                        {stock.product?.CategoryName || '-'}
                      </TableCell>
                      <TableCell>
                        {stock.product?.SizeName || '-'}
                      </TableCell>
                      <TableCell className="font-medium max-w-32 truncate" title={stock.product?.ColorName || '-'}>
                        {stock.product?.ColorName || '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {getActualAvailableStock(stock)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(stock.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} products
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
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}