'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '@/components/ui/select';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { 
  Search, 
  Filter, 
  Eye, 
  XCircle, 
  Calendar, 
  Package, 
  AlertCircle 
} from 'lucide-react';

interface StockOffer {
  id: string;
  clientId: string;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';
  offerDate: string;
  expiryDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  stock: {
    id: string;
    productId: number;
    categoryName: string;
    designCode: string; 
    designName: string;   
    clientCode: string;
    nameCode?: string;
    photo1?: string;
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
    product: {
      DesignName?: string;
      CategoryName?: string;
      SizeName?: string;
      [key: string]: any; // Allow other properties
    }; // Product data from MySQL
  };
  creator: {
    id: string;
    name: string;
    username: string;
  };
}

export default function ReservationsPage() {
  const [offers, setOffers] = useState<StockOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedOffer, setSelectedOffer] = useState<StockOffer | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [offerToCancel, setOfferToCancel] = useState<string | null>(null);

  // Fetch reservations data
  const fetchOffers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (clientFilter && clientFilter !== 'all') params.append('clientId', clientFilter);
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());

      const response = await fetch(`/api/stock/offers/enhanced?${params}`);
      const result = await response.json();

      if (result.success) {
        setOffers(result.data);
        setTotalPages(result.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [searchTerm, clientFilter, currentPage, itemsPerPage]);

  // Handle offer cancellation
  const handleCancelOffer = async (offerId: string) => {
    try {
      const response = await fetch('/api/stock/offers/enhanced', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId,
          action: 'cancel'
        })
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the offers list
        fetchOffers();
      }
    } catch (error) {
      console.error('Error cancelling offer:', error);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
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
        return <Badge className="bg-gray-200 text-gray-600">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Filter unique clients for the select dropdown
  const uniqueClients = Array.from(new Set(offers.map(offer => offer.clientId)));

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Stock Reservations</h1>
        <p className="text-muted-foreground">
          Manage all stock reservations and pending offers
        </p>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by client, design code, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="w-full sm:w-64">
            <div className="relative">
              <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="pl-8">
                  <SelectValue placeholder="Filter by Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {uniqueClients.map(clientId => (
                    <SelectItem key={clientId} value={clientId}>
                      {clientId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={fetchOffers}>
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Offers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reservation List</CardTitle>
          <CardDescription>
            {offers.length} reservation{offers.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No reservations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Design</TableHead>
                    <TableHead>Photo</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">{offer.stock.designName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {offer.stock.photo1 && (
                            <img 
                              src={offer.stock.photo1} 
                              alt="Product" 
                              className="w-8 h-8 object-cover rounded"
                            />
                          )}
                          <div>
                            <div>{offer.stock.clientCode}</div>
                            <div className="text-xs text-muted-foreground">
                              {offer.stock.categoryName}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{offer.stock.product?.SizeName || 'N/A'}</TableCell>
                      <TableCell>{offer.quantity}</TableCell>
                      <TableCell>
                        {new Date(offer.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(offer.expiryDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(offer.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedOffer(offer)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Reservation Details</DialogTitle>
                                <DialogDescription>
                                  Detailed information about this reservation
                                </DialogDescription>
                              </DialogHeader>
                              {selectedOffer && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium mb-1">Client</h4>
                                      <p>{selectedOffer.stock.clientCode}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-1">Status</h4>
                                      <div>{getStatusBadge(selectedOffer.status)}</div>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-1">Quantity</h4>
                                      <p>{selectedOffer.quantity}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-1">Created</h4>
                                      <p>{new Date(selectedOffer.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-1">Expiry Date</h4>
                                      <p>{new Date(selectedOffer.expiryDate).toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-1">Creator</h4>
                                      <p>{selectedOffer.creator.name} ({selectedOffer.creator.username})</p>
                                    </div>
                                  </div>
                                  
                                  {selectedOffer.notes && (
                                    <div>
                                      <h4 className="font-medium mb-1">Notes</h4>
                                      <p className="text-sm">{selectedOffer.notes}</p>
                                    </div>
                                  )}
                                  
                                  <div>
                                    <h4 className="font-medium mb-1">Product Details</h4>
                                    <div className="border rounded p-3">
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div><span className="font-medium">Design Name:</span> {selectedOffer.stock.designName}</div>
                                        <div><span className="font-medium">Client Code:</span> {selectedOffer.stock.clientCode}</div>
                                        <div><span className="font-medium">Category:</span> {selectedOffer.stock.categoryName}</div>
                                        <div><span className="font-medium">Size:</span> {selectedOffer.stock.product?.SizeName || 'N/A'}</div>
                                        {selectedOffer.stock.warehouse && (
                                          <div><span className="font-medium">Warehouse:</span> {selectedOffer.stock.warehouse.name}</div>
                                        )}
                                        {selectedOffer.stock.shelf && (
                                          <div><span className="font-medium">Shelf:</span> {selectedOffer.stock.shelf.code}</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          {offer.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setOfferToCancel(offer.id);
                                setShowCancelDialog(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, offers.length)} of {offers.length} reservations
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const startPage = Math.max(1, currentPage - 2);
                      const pageNum = startPage + i;
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink 
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={currentPage === pageNum}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this reservation? This will return the reserved stock to available inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (offerToCancel) {
                  handleCancelOffer(offerToCancel);
                  setOfferToCancel(null);
                  setShowCancelDialog(false);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}