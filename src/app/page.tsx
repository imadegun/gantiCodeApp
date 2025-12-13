'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Eye, Image as ImageIcon, Package, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface ProductItem {
  ID: number;
  CollectCode: string;
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
  Width?: number;
  Height?: number;
  Length?: number;
  Diameter?: number;
  SampCeramicVolume?: number;
  Clay?: number;
  BuildTech?: string;
  Glaze1?: number;
  Glaze2?: number;
  Glaze3?: number;
  Glaze4?: number;
  GlazeTemp?: number;
  Firing?: string;
  History?: string;
}

interface Category {
  CategoryCode: string;
  CategoryName: string;
}

interface Design {
  DesignCode: string;
  DesignName: string;
}

interface ProductDetail extends ProductItem {
  TechDraw?: string;
  TextureName?: string;
  MaterialName?: string;
  ColorName?: string;
  ClayDescription?: string;
  GlazeDescription?: string[];
  ToolsDescription?: string[];
  EngobeDescription?: string[];
  StainOxideDescription?: string[];
  LustreDescription?: string[];
  CastingDescription?: string[];
  EstruderDescription?: string[];
}

export default function CollectionsPage() {
  const [data, setData] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDesign, setSelectedDesign] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

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
      toast.error('Failed to load collections data');
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  // Filter data
  const filteredData = data.filter(item => {
    const matchesSearch = searchTerm === '' ||
      (item.ClientCode && item.ClientCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.CollectCode && item.CollectCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.DesignName && item.DesignName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.CategoryName && item.CategoryName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.ID.toString().includes(searchTerm);

    const matchesCategory = selectedCategory === 'all' || item.CategoryCode === selectedCategory;
    const matchesDesign = selectedDesign === 'all' || item.DesignCode === selectedDesign;

    return matchesSearch && matchesCategory && matchesDesign;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Get image URL
  const getImageUrl = (photoName: string | null) => {
    if (!photoName) return null;
    if (photoName.startsWith('http://') || photoName.startsWith('https://')) {
      return photoName;
    }
    const imageServerUrl = process.env.NEXT_PUBLIC_IMAGE_SERVER_URL || 'http://192.168.1.110/upload';
    return `${imageServerUrl}/${photoName}`;
  };


  // Handle view details - navigate to dedicated page
  const handleViewDetails = (product: ProductItem) => {
    window.location.href = `/collections/${product.ID}`;
  };

  // Pagination component
  const PaginationComponent = () => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const pages: (number | string)[] = [];
      const showPages = 5; // Number of page buttons to show
      
      if (totalPages <= showPages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= showPages; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - showPages + 1; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        }
      }
      return pages;
    };

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-3 py-1 text-sm text-muted-foreground">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page as number)}
                  className="min-w-[40px]"
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading collections...</p>
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
            <Package className="h-10 w-10 text-primary" />
            Ceramic Collections
          </h1>
          <p className="text-muted-foreground text-lg">Explore our comprehensive ceramic product catalog</p>
        </div>

        {/* Stats Cards - Removed Active Products card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{data.length}</div>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <p className="text-sm text-muted-foreground">Categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{designs.length}</div>
              <p className="text-sm text-muted-foreground">Design Collections</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Browse Collections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={(value) => {
                setSelectedCategory(value);
                setCurrentPage(1);
              }}>
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
              <Select value={selectedDesign} onValueChange={(value) => {
                setSelectedDesign(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Designs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Designs</SelectItem>
                  {designs.map((design) => (
                    <SelectItem key={design.DesignCode} value={design.DesignName}>
                      {design.DesignName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Results count */}
              <div className="flex items-center justify-center">
                <Badge variant="secondary" className="px-3 py-1">
                  {filteredData.length} products found
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Product Catalog</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Photo</TableHead>
                    <TableHead className="w-32">Collect Code</TableHead>
                    <TableHead className="w-48">Design</TableHead>
                    <TableHead className="w-32">Size</TableHead>
                    <TableHead className="w-48">Category</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((item) => (
                    <TableRow key={item.ID}>
                      <TableCell>
                        {item.Photo1 ? (
                          <div className="w-[60px] h-[60px] bg-muted rounded-md flex items-center justify-center overflow-hidden">
                            <img
                              src={getImageUrl(item.Photo1) || ''}
                              alt="Product"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <ImageIcon className="w-6 h-6 text-muted-foreground hidden" />
                          </div>
                        ) : (
                          <div className="w-[60px] h-[60px] bg-muted rounded-md flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.ClientCode ? (
                          <Badge variant="default" className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {item.ClientCode}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">No Code</Badge>
                        )}
                      </TableCell>
                      <TableCell>{item.DesignName}</TableCell>
                      <TableCell>{item.SizeName || '-'}</TableCell>
                      <TableCell>{item.CategoryName}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          title="View Details"
                          onClick={() => handleViewDetails(item)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Improved Pagination */}
            <PaginationComponent />
          </CardContent>
        </Card>


        {/* Footer */}
        <footer className="mt-12 py-6 border-t border-border">
          <div className="text-center text-sm text-muted-foreground">
            <p>Ceramic Collections - Browse our complete product catalog</p>
          </div>
        </footer>
      </div>
    </div>
  );
}