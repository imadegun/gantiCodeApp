'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Filter, Plus, Eye, Edit, ClipboardList, Calendar, Package } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/db';

interface PurchaseOrder {
  id: string;
  poNo: string;
  clientId: string;
  deliveryDate: Date;
  qtyOrdered: number;
  status: 'draft' | 'confirmed' | 'in_production' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Design {
  DesignCode: string;
  DesignName: string;
}

export default function ProductionPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    poNo: '',
    clientId: '',
    deliveryDate: '',
    qtyOrdered: '',
    notes: ''
  });

  // Fetch data
  useEffect(() => {
    Promise.all([
      fetchPurchaseOrders(),
      fetchDesigns()
    ]).finally(() => {
      setLoading(false);
    });
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      const response = await fetch('/api/production');
      const result = await response.json();
      if (result.success) {
        setPurchaseOrders(result.data);
      }
    } catch (error) {
      console.error('Error fetching POs:', error);
      toast.error('Failed to load purchase orders');
    }
  };

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

  // Filter POs
  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = searchTerm === '' ||
      po.poNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.clientId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || po.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Handle form submission
  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/production', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          poNo: formData.poNo,
          clientId: formData.clientId,
          deliveryDate: new Date(formData.deliveryDate),
          qtyOrdered: parseInt(formData.qtyOrdered),
          notes: formData.notes
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Purchase order created successfully');
        setCreateDialogOpen(false);
        setFormData({
          poNo: '',
          clientId: '',
          deliveryDate: '',
          qtyOrdered: '',
          notes: ''
        });
        fetchPurchaseOrders();
      } else {
        toast.error(result.error || 'Failed to create PO');
      }
    } catch (error) {
      console.error('Error creating PO:', error);
      toast.error('Failed to create purchase order');
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      confirmed: 'default',
      in_production: 'outline',
      completed: 'default',
      cancelled: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  // Get design name by code
  const getDesignName = (designCode: string) => {
    const design = designs.find(d => d.DesignCode === designCode);
    return design ? design.DesignName : designCode;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading production data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
            <ClipboardList className="h-10 w-10 text-primary" />
            Production Management
          </h1>
          <p className="text-muted-foreground text-lg">Manage purchase orders and production details</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{purchaseOrders.length}</div>
              <p className="text-sm text-muted-foreground">Total POs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {purchaseOrders.filter(po => po.status === 'in_production').length}
              </div>
              <p className="text-sm text-muted-foreground">In Production</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {purchaseOrders.filter(po => po.status === 'completed').length}
              </div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {purchaseOrders.filter(po => po.status === 'confirmed').length}
              </div>
              <p className="text-sm text-muted-foreground">Confirmed</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search POs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_production">In Production</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Create PO Button */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create PO
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
                <DialogDescription>
                  Create a new purchase order for production
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreatePO} className="space-y-4">
                <div>
                  <Label htmlFor="poNo">PO Number</Label>
                  <Input
                    id="poNo"
                    value={formData.poNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, poNo: e.target.value }))}
                    placeholder="Enter PO number"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="clientId">Client (Design)</Label>
                  <Select value={formData.clientId} onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
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

                <div>
                  <Label htmlFor="deliveryDate">Delivery Date</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="qtyOrdered">Quantity Ordered</Label>
                  <Input
                    id="qtyOrdered"
                    type="number"
                    value={formData.qtyOrdered}
                    onChange={(e) => setFormData(prev => ({ ...prev, qtyOrdered: e.target.value }))}
                    placeholder="Enter quantity"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create PO</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* POs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">PO Number</TableHead>
                    <TableHead className="w-48">Client</TableHead>
                    <TableHead className="w-32">Quantity</TableHead>
                    <TableHead className="w-32">Delivery Date</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-32">Created</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPOs.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell>
                        <span className="font-mono font-medium">{po.poNo}</span>
                      </TableCell>
                      <TableCell>{getDesignName(po.clientId)}</TableCell>
                      <TableCell>{po.qtyOrdered}</TableCell>
                      <TableCell>
                        {new Date(po.deliveryDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(po.status)}</TableCell>
                      <TableCell>
                        {new Date(po.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 mr-2"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredPOs.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No purchase orders found</p>
                <p className="text-sm text-muted-foreground">Create your first PO to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-12 py-6 border-t border-border">
          <div className="text-center text-sm text-muted-foreground">
            <p>Production Management - Track orders and production details</p>
          </div>
        </footer>
      </div>
    </div>
  );
}