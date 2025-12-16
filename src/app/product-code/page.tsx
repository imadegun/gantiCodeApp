'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, Edit2, Save, X, Image as ImageIcon, CheckSquare, Square, Eye, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MasterItem {
  ID: number;
  ClientCode: string | null;
  DesignCode: string;
  CategoryCode: string;
  SizeCode: string;
  Photo1: string | null;
  DesignName: string;
  CategoryName: string;
  SizeName: string;
}

interface Category {
  CategoryCode: string;
  CategoryName: string;
}

interface Design {
  DesignCode: string;
  DesignName: string;
}

interface EditingState {
  [key: number]: string; // ID -> ClientCode value
}

interface ProductDetail {
  ID: number;
  ClientCode: string | null;
  DesignCode: string;
  CategoryCode: string;
  SizeCode: string;
  Photo1: string | null;
  Photo2: string | null;
  Photo3: string | null;
  Photo4: string | null;
  DesignName: string;
  CategoryName: string;
  SizeName: string;
  TextureName: string;
  MaterialName: string;
  ColorName: string;
  GlazeDescription: string;
  StainOxideDescription: string;
  LustreDescription: string;
  EngobeDescription: string;
  ToolsDescription: string;
  UnitValue: string;
  NameDesc: string;
  Width?: number;
  Height?: number;
  Length?: number;
  Diameter?: number;
  SampCeramicVolume?: number;
  GlazeTechnique?: string;
  LastUpdate?: string;
}

export default function Home() {
  const [data, setData] = useState<MasterItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDesign, setSelectedDesign] = useState<string>('all');
  const [clientCodeStatus, setClientCodeStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // New state for enhanced bulk edit
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [editingState, setEditingState] = useState<EditingState>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: number]: string}>({});
  const [selectAll, setSelectAll] = useState(false);

  // Product detail dialog state
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const itemsPerPage = 20;

  // Fetch data
  useEffect(() => {
    Promise.all([
      fetch('/api/master').then(res => res.json()),
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/designs').then(res => res.json())
    ]).then(([masterData, categoriesData, designsData]) => {
      if (masterData.success) setData(masterData.data);
      if (categoriesData.success) setCategories(categoriesData.data);
      if (designsData.success) setDesigns(designsData.data);
    }).catch(error => {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  // Filter data
  const filteredData = data.filter(item => {
    const matchesSearch = searchTerm === '' || 
      (item.ClientCode && item.ClientCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.DesignName && item.DesignName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.CategoryName && item.CategoryName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.SizeName && item.SizeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.ID.toString().includes(searchTerm);

    const matchesCategory = selectedCategory === 'all' || item.CategoryCode === selectedCategory;
    const matchesDesign = selectedDesign === 'all' || item.DesignCode === selectedDesign;
    
    // ClientCode status filtering
    let matchesClientCodeStatus = true;
    if (clientCodeStatus === 'with') {
      matchesClientCodeStatus = item.ClientCode !== null && item.ClientCode !== '';
    } else if (clientCodeStatus === 'without') {
      matchesClientCodeStatus = item.ClientCode === null || item.ClientCode === '';
    }

    return matchesSearch && matchesCategory && matchesDesign && matchesClientCodeStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedDesign, clientCodeStatus]);

  // Check ClientCode uniqueness
  const checkClientCodeUniqueness = async (clientCode: string, excludeId?: number) => {
    if (!clientCode.trim()) return true; // Allow empty codes
    
    try {
      const response = await fetch('/api/master/check-clientcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientCode, excludeId }),
      });

      const result = await response.json();
      return result.success ? result.isUnique : false;
    } catch (error) {
      console.error('Error checking ClientCode uniqueness:', error);
      return false;
    }
  };

  // Validate ClientCode for a specific item
  const validateClientCode = async (id: number, clientCode: string) => {
    const isUnique = await checkClientCodeUniqueness(clientCode, id);
    
    if (!isUnique && clientCode.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        [id]: 'ClientCode already exists!'
      }));
      return false;
    } else {
      setValidationErrors(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      return true;
    }
  };

  // Handle ClientCode change with validation
  const handleClientCodeChange = async (id: number, value: string) => {
    setEditingState(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear previous error for this item
    setValidationErrors(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
    
    // Validate if not empty
    if (value.trim()) {
      await validateClientCode(id, value);
    }
  };

  // Handle individual ClientCode update
  const handleUpdateClientCode = async (id: number, newClientCode: string) => {
    // Validate before saving
    const isValid = await validateClientCode(id, newClientCode);
    if (!isValid) {
      toast.error('ClientCode already exists! Please use a different code.');
      return;
    }
    
    setSaving(id);
    try {
      const response = await fetch('/api/master/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, clientCode: newClientCode }),
      });

      const result = await response.json();
      
      if (result.success) {
        setData(prevData => 
          prevData.map(item => 
            item.ID === id ? { ...item, ClientCode: newClientCode } : item
          )
        );
        toast.success('ClientCode updated successfully');
        
        // Remove from editing state after successful save
        setEditingState(prev => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
        
        // Auto-uncheck the checkbox when saved
        setSelectedItems(prev => prev.filter(item => item !== id));
        
        // Update select all state if needed
        if (selectedItems.includes(id) && selectedItems.length === 1) {
          setSelectAll(false);
        }
      } else {
        toast.error(result.error || 'Failed to update ClientCode');
      }
    } catch (error) {
      console.error('Error updating ClientCode:', error);
      toast.error('Failed to update ClientCode');
    } finally {
      setSaving(null);
    }
  };

  // Handle bulk save
  const handleBulkSave = async () => {
    // Get all items that have been edited
    const editedItems = Object.entries(editingState).map(([id, clientCode]) => ({
      id: parseInt(id),
      clientCode
    }));

    if (editedItems.length === 0) {
      toast.error('No changes to save');
      return;
    }

    // Validate all items before saving
    const validationPromises = editedItems.map(item => 
      validateClientCode(item.id, item.clientCode)
    );
    
    const validationResults = await Promise.all(validationPromises);
    const hasErrors = validationResults.some(result => !result);

    if (hasErrors) {
      toast.error('Please fix validation errors before bulk saving');
      return;
    }

    setBulkSaving(true);
    try {
      const response = await fetch('/api/master/bulk-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates: editedItems }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local data
        setData(prevData => 
          prevData.map(item => {
            const editedItem = editedItems.find(e => e.id === item.ID);
            return editedItem ? { ...item, ClientCode: editedItem.clientCode } : item;
          })
        );
        
        toast.success(result.message || `Successfully updated ${result.updatedCount} items`);
        
        // Clear all editing states
        setEditingState({});
        setValidationErrors({});
        setSelectedItems([]);
        setSelectAll(false);
      } else {
        if (result.duplicateCodes && result.duplicateCodes.length > 0) {
          toast.error(`Duplicate ClientCodes found: ${result.duplicateCodes.join(', ')}`);
        } else {
          toast.error(result.error || 'Failed to save items');
        }
      }
    } catch (error) {
      console.error('Error in bulk save:', error);
      toast.error('Failed to save items');
    } finally {
      setBulkSaving(false);
    }
  };

  // Handle item selection (checkbox)
  const handleItemSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
      // Activate editing for this item
      setEditingState(prev => ({
        ...prev,
        [id]: data.find(item => item.ID === id)?.ClientCode || ''
      }));
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id));
      // Deactivate editing for this item
      setEditingState(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const allIds = paginatedData.map(item => item.ID);
      setSelectedItems(allIds);
      
      // Activate editing for all items
      const newEditingState: EditingState = {};
      paginatedData.forEach(item => {
        newEditingState[item.ID] = item.ClientCode || '';
      });
      setEditingState(newEditingState);
    } else {
      setSelectedItems([]);
      setEditingState({});
    }
  };

  // Save specific item
  const saveItem = (id: number) => {
    const clientCode = editingState[id];
    if (clientCode !== undefined) {
      handleUpdateClientCode(id, clientCode);
    }
  };

  // Cancel editing for specific item
  const cancelEditing = (id: number) => {
    setEditingState(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
    
    // Clear validation errors for this item
    setValidationErrors(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
    
    // Also uncheck the item
    setSelectedItems(prev => prev.filter(item => item !== id));
  };

  // Get image URL - handle server images and filename-only records
  const getImageUrl = (photoName: string | null) => {
    if (!photoName) return null;

    // If it's already a full URL, return as is
    if (photoName.startsWith('http://') || photoName.startsWith('https://')) {
      return photoName;
    }

    // If it's just a filename, construct the server URL
    // Your server images are at: http://192.168.1.110/upload/
    // You can also use environment variable: process.env.NEXT_PUBLIC_IMAGE_SERVER_URL
    const imageServerUrl = process.env.NEXT_PUBLIC_IMAGE_SERVER_URL || 'http://192.168.1.110/upload';
    return `${imageServerUrl}/${photoName}`;
  };

  // Open product detail dialog
  const openProductDetail = async (productId: number) => {
    setDetailLoading(true);
    setDetailDialogOpen(true);

    try {
      const response = await fetch(`/api/products/${productId}`);
      const result = await response.json();

      if (result.success) {
        setSelectedProduct(result.data.product);
      } else {
        toast.error('Failed to load product details');
        setDetailDialogOpen(false);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to load product details');
      setDetailDialogOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading data...</p>
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
            <Tag className="h-10 w-10 text-primary" />
            Product Code Management
          </h1>
          <p className="text-muted-foreground text-lg">Manage and update ClientCode assignments for ceramic products</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{data.length}</div>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {data.filter(item => item.ClientCode).length}
              </div>
              <p className="text-sm text-muted-foreground">Items with ClientCode</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {data.filter(item => !item.ClientCode).length}
              </div>
              <p className="text-sm text-muted-foreground">Items without ClientCode</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <p className="text-sm text-muted-foreground">Categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ClientCode, Design Name, Category Name, Size Name, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.CategoryCode} value={category.CategoryCode}>
                      {category.CategoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Design Filter */}
              <Select value={selectedDesign} onValueChange={setSelectedDesign}>
                <SelectTrigger>
                  <SelectValue placeholder="All Designs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Designs</SelectItem>
                  {designs.map((design) => (
                    <SelectItem key={design.DesignCode} value={design.DesignCode}>
                      {design.DesignName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* ClientCode Status Filter */}
              <Select value={clientCodeStatus} onValueChange={setClientCodeStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Client Code Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="with">With Client Code</SelectItem>
                  <SelectItem value="without">Without Client Code</SelectItem>
                </SelectContent>
              </Select>

              {/* Results count */}
              <div className="flex items-center justify-center">
                <Badge variant="secondary">
                  {filteredData.length} items found
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Info */}
        {selectedItems.length > 0 && (
          <Card className="mb-6 border-2 border-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  <span className="font-medium">
                    {selectedItems.length} items activated for editing. Enter unique ClientCode for each item and click save.
                  </span>
                </div>
                <div className="flex gap-2">
                  {Object.keys(editingState).length > 0 && (
                    <Button
                      onClick={handleBulkSave}
                      disabled={bulkSaving || Object.values(validationErrors).some(error => error)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {bulkSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Bulk Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Bulk Save ({Object.keys(editingState).length})
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedItems([]);
                      setEditingState({});
                      setValidationErrors({});
                      setSelectAll(false);
                    }}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Collection Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-20">Photo</TableHead>
                    <TableHead className="w-40">ClientCode</TableHead>
                    <TableHead className="w-48">Design Name</TableHead>
                    <TableHead className="w-32">Size Name</TableHead>
                    <TableHead className="w-48">Category Name</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((item) => (
                    <TableRow key={item.ID}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(item.ID)}
                          onCheckedChange={(checked) => handleItemSelect(item.ID, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        {item.Photo1 ? (
                          <div className="w-[50px] h-[50px] bg-muted rounded-md flex items-center justify-center overflow-hidden">
                            <img 
                              src={getImageUrl(item.Photo1) || ''} 
                              alt="Item" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <ImageIcon className="w-6 h-6 text-muted-foreground hidden" />
                          </div>
                        ) : (
                          <div className="w-[50px] h-[50px] bg-muted rounded-md flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingState[item.ID] !== undefined ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingState[item.ID]}
                                onChange={(e) => handleClientCodeChange(item.ID, e.target.value)}
                                className={`flex-1 ${validationErrors[item.ID] ? 'border-red-500' : ''}`}
                                placeholder="Enter unique ClientCode"
                                autoFocus
                              />
                              {saving === item.ID ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              ) : (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    onClick={() => saveItem(item.ID)}
                                    disabled={saving === item.ID || !!validationErrors[item.ID]}
                                    className="h-8 px-2"
                                    title="Save"
                                  >
                                    <Save className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => cancelEditing(item.ID)}
                                    className="h-8 px-2"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            {validationErrors[item.ID] && (
                              <div className="text-red-500 text-xs font-medium">
                                {validationErrors[item.ID]}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className={item.ClientCode ? 'font-medium' : 'text-muted-foreground italic'}>
                            {item.ClientCode || 'Not set'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <button                     
                        >
                          {item.DesignName}
                        </button>
                      </TableCell>
                      <TableCell>{item.SizeName || '-'}</TableCell>
                      <TableCell>{item.CategoryName}</TableCell>
                      <TableCell>
                        {editingState[item.ID] === undefined && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleItemSelect(item.ID, true)}
                            className="h-8 px-2"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {/* Smart pagination with ellipsis */}
                    {totalPages <= 7 ? (
                      // Show all pages if 7 or fewer
                      Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))
                    ) : (
                      // Show smart pagination with ellipsis for many pages
                      <>
                        {/* First page */}
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => setCurrentPage(1)}
                            isActive={currentPage === 1}
                            className="cursor-pointer"
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                        
                        {/* Ellipsis or pages around current */}
                        {currentPage > 3 && (
                          <PaginationItem>
                            <span className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground">
                              ...
                            </span>
                          </PaginationItem>
                        )}
                        
                        {/* Pages around current */}
                        {Array.from({ length: Math.max(0, Math.min(5, totalPages - 2)) }, (_, i) => {
                          let pageNum;
                          if (currentPage <= 3) {
                            pageNum = i + 2;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 6 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          if (pageNum <= 1 || pageNum >= totalPages) return null;
                          
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => setCurrentPage(pageNum)}
                                isActive={currentPage === pageNum}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        {/* Ellipsis if needed */}
                        {currentPage < totalPages - 2 && (
                          <PaginationItem>
                            <span className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground">
                              ...
                            </span>
                          </PaginationItem>
                        )}
                        
                        {/* Last page */}
                        {totalPages > 1 && (
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => setCurrentPage(totalPages)}
                              isActive={currentPage === totalPages}
                              className="cursor-pointer"
                            >
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        )}
                      </>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Footer */}
        <footer className="mt-12 py-6 border-t border-border">
          <div className="text-center text-sm text-muted-foreground">
            <p>madegun@2025</p>
          </div>
        </footer>

        {/* Product Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Product Details
              </DialogTitle>
              <DialogDescription>
                View comprehensive product information and technical specifications
              </DialogDescription>
            </DialogHeader>

            {detailLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading product details...</span>
              </div>
            ) : selectedProduct ? (
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="technical">Technical</TabsTrigger>
                  <TabsTrigger value="materials">Materials</TabsTrigger>
                  <TabsTrigger value="additional">Additional</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Product Code</h3>
                      <p className="text-lg font-semibold">{selectedProduct.ID}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Client Code</h3>
                      <p className="text-lg font-semibold">{selectedProduct.ClientCode || 'Not assigned'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Design Name</h3>
                      <p className="text-lg font-semibold">{selectedProduct.DesignName}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                      <p className="text-lg font-semibold">{selectedProduct.CategoryName}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Size</h3>
                      <p className="text-lg font-semibold">{selectedProduct.SizeName}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Unit</h3>
                      <p className="text-lg font-semibold">{selectedProduct.UnitValue || '-'}</p>
                    </div>
                  </div>

                  {/* Product Images */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Product Images</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {[selectedProduct.Photo1, selectedProduct.Photo2, selectedProduct.Photo3, selectedProduct.Photo4].map((photo, index) => (
                        <div key={index} className="aspect-square overflow-hidden rounded-lg border bg-muted">
                          {photo ? (
                            <img
                              src={getImageUrl(photo) || ''}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="technical" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Dimensions</h3>
                      <div className="space-y-1">
                        <div>Width: {selectedProduct.Width ? `${selectedProduct.Width} ${selectedProduct.UnitValue}` : '-'}</div>
                        <div>Height: {selectedProduct.Height ? `${selectedProduct.Height} ${selectedProduct.UnitValue}` : '-'}</div>
                        <div>Length: {selectedProduct.Length ? `${selectedProduct.Length} ${selectedProduct.UnitValue}` : '-'}</div>
                        <div>Diameter: {selectedProduct.Diameter ? `${selectedProduct.Diameter} ${selectedProduct.UnitValue}` : '-'}</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Volume</h3>
                      <p>{selectedProduct.SampCeramicVolume ? `${selectedProduct.SampCeramicVolume} cm³` : '-'}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="materials" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Material</h3>
                      <p className="text-lg font-semibold">{selectedProduct.MaterialName || '-'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Texture</h3>
                      <p className="text-lg font-semibold">{selectedProduct.TextureName || '-'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Color</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded border" style={{ backgroundColor: selectedProduct.ColorName || '#ccc' }}></div>
                        <span>{selectedProduct.ColorName || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Glaze</h3>
                    <p>{selectedProduct.GlazeDescription || 'No description available'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Stain/Oxide</h3>
                    <p>{selectedProduct.StainOxideDescription || 'No description available'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Lustre</h3>
                    <p>{selectedProduct.LustreDescription || 'No description available'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Engobe</h3>
                    <p>{selectedProduct.EngobeDescription || 'No description available'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Tools</h3>
                    <p>{selectedProduct.ToolsDescription || 'No description available'}</p>
                  </div>
                </TabsContent>

                <TabsContent value="additional" className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p>{selectedProduct.NameDesc || 'No description available'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Glaze Technique</h3>
                    <p>{selectedProduct.GlazeTechnique || '-'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Update</h3>
                    <p>{selectedProduct.LastUpdate || '-'}</p>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No product selected</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}