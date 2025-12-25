'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image as ImageIcon, Package, Ruler, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  ID: number;
  ClientCode: string | null;
  DesignCode: string;
  CategoryCode: string;
  SizeCode: string;
  TechDraw: string | null;
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
  BuildTech: string | null;
  BuildTechNote: string | null;
  Clay: number | null;
  ClayKG: number | null;
  ClayNote: string | null;
  Rim: string | null;
  Feet: string | null;
  Firing: string | null;
  FiringNote: string | null;
  GlazeTemp: number | null;
  GlazeTempNote: string | null;
  BisqueTemp: number | null;
  BisqueTempNote: string | null;
  LustreTemp: number | null;
  LustreTempNote: string | null;
}

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await fetch('/api/products/' + params.id);
        const result = await response.json();

        if (result.success) {
          setProduct(result.data.product);
          // Set main image to TechDraw or first available photo
          const product = result.data.product;
          setMainImage(product.TechDraw || product.Photo1 || product.Photo2 || product.Photo3 || product.Photo4);
        } else {
          toast.error('Failed to load product details');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProductData();
    }
  }, [params.id]);

  const handleBack = () => {
    router.push('/');
  };

  const formatValue = (value: string | null, unit?: string) => {
    if (!value) return '-';
    return unit ? `${value} ${unit}` : value;
  };

  // Format long text with proper line breaks and special character handling
  const formatLongText = (value: string | null) => {
    if (!value) return 'No description available';
    
    // Replace special formatting characters with proper formatting
    let formattedValue = value
      .replace(/={10,}/g, '\n────────────────────\n') // Replace sequences of = with a line separator
      .replace(/spacy/gi, '\n(spacy)\n') // Add line breaks around 'spacy'
      .replace(/\|\|/g, '\n'); // Replace || with newlines
    
    return formattedValue;
  };

  const formatDescriptionWithTruncation = (value: string | null, maxLength: number = 200) => {
    if (!value) return { full: 'No description available', truncated: 'No description available' };
    
    // Replace special formatting characters with proper formatting
    let formattedValue = value
      .replace(/={10,}/g, '\n────────────────────\n') // Replace sequences of = with a line separator
      .replace(/spacy/gi, '\n(spacy)\n') // Add line breaks around 'spacy'
      .replace(/\|\|/g, '\n'); // Replace || with newlines
    
    // Truncate if too long (only if there are no line breaks)
    if (formattedValue.length > maxLength && !formattedValue.includes('\n')) {
      return {
        full: formattedValue,
        truncated: formattedValue.substring(0, maxLength) + '...'
      };
    }
    
    return {
      full: formattedValue,
      truncated: formattedValue
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
              <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
              <Button onClick={handleBack} variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Product List
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button onClick={handleBack} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Product List
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Product Details</h1>
            <p className="text-muted-foreground">View comprehensive product information and technical specifications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="lg:col-span-1 space-y-4">
            {/* Main Image */}
            <Card>
              <CardContent className="p-4">
                <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
                  {mainImage ? (
                    <img
                      src={mainImage.startsWith('http') ? mainImage : `http://192.168.1.110/upload/${mainImage}`}
                      alt={product.DesignName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <div className="hidden w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Thumbnails */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {[product.Photo1, product.Photo2, product.Photo3, product.Photo4].map((photo, index) => (
                    <div key={index} className="relative group cursor-pointer">
                      {photo ? (
                        <div
                          className={`aspect-square overflow-hidden rounded border bg-muted ${mainImage === photo ? 'ring-2 ring-primary' : ''}`}
                          onClick={() => setMainImage(photo)}
                        >
                          <img
                            src={photo.startsWith('http') ? photo : `http://192.168.1.110/upload/${photo}`}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <ImageIcon className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-square overflow-hidden rounded border bg-muted flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="hidden w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="build">Build & Tools</TabsTrigger>
                <TabsTrigger value="material">Material</TabsTrigger>
                <TabsTrigger value="firing">Firing</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Product ID</h3>
                        <p className="text-lg font-semibold">{product.ID}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Code</h3>
                        <p className="text-lg font-semibold">{product.ClientCode || 'Not assigned'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Design Name</h3>
                        <p className="text-lg font-semibold">{product.DesignName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                        <p className="text-lg font-semibold">{product.CategoryName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Size</h3>
                        <p className="text-lg font-semibold">{product.SizeName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Unit</h3>
                        <p className="text-lg font-semibold">{product.UnitValue || '-'}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                      <div className="prose prose-sm max-w-none whitespace-pre-line text-lg font-semibold bg-muted/30 p-4 rounded-md border border-muted-foreground/20 min-h-[40px]">
                        <p className="mb-0">{formatLongText(product.NameDesc)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="build" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Build & Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Build Technique</h3>
                        <p className="text-lg font-semibold">{product.BuildTech || '-'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Clay</h3>
                        <p className="text-lg font-semibold">{product.Clay ? `${product.Clay} (${product.ClayKG}kg)` : '-'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Rim</h3>
                        <p className="text-lg font-semibold">{product.Rim || '-'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Feet</h3>
                        <p className="text-lg font-semibold">{product.Feet || '-'}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Build Technique Notes</h3>
                      <div className="prose prose-sm max-w-none whitespace-pre-line text-muted-foreground bg-muted/30 p-4 rounded-md border border-muted-foreground/20 min-h-[40px]">
                        <p className="mb-0">{formatLongText(product.BuildTechNote)}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Clay Notes</h3>
                      <div className="prose prose-sm max-w-none whitespace-pre-line text-muted-foreground bg-muted/30 p-4 rounded-md border border-muted-foreground/20 min-h-[40px]">
                        <p className="mb-0">{formatLongText(product.ClayNote)}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Tools Description</h3>
                      <div className="prose prose-sm max-w-none whitespace-pre-line text-muted-foreground bg-muted/30 p-4 rounded-md border border-muted-foreground/20 min-h-[40px]">
                        <p className="mb-0">{formatLongText(product.ToolsDescription)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="material" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Material & Finishes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Material</h3>
                        <p className="text-lg font-semibold">{product.MaterialName || '-'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Texture</h3>
                        <p className="text-lg font-semibold">{product.TextureName || '-'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Color</h3>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded border" style={{ backgroundColor: product.ColorName || '#ccc' }}></div>
                          <span>{product.ColorName || '-'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Glaze Description</h3>
                      <div className="prose prose-sm max-w-none whitespace-pre-line text-muted-foreground bg-muted/30 p-4 rounded-md border border-muted-foreground/20 min-h-[40px]">
                        <p className="mb-0">{formatLongText(product.GlazeDescription)}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Stain/Oxide Description</h3>
                      <div className="prose prose-sm max-w-none whitespace-pre-line text-muted-foreground bg-muted/30 p-4 rounded-md border border-muted-foreground/20 min-h-[40px]">
                        <p className="mb-0">{formatLongText(product.StainOxideDescription)}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Lustre Description</h3>
                      <div className="prose prose-sm max-w-none whitespace-pre-line text-muted-foreground bg-muted/30 p-4 rounded-md border border-muted-foreground/20 min-h-[40px]">
                        <p className="mb-0">{formatLongText(product.LustreDescription)}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Engobe Description</h3>
                      <div className="prose prose-sm max-w-none whitespace-pre-line text-muted-foreground bg-muted/30 p-4 rounded-md border border-muted-foreground/20 min-h-[40px]">
                        <p className="mb-0">{formatLongText(product.EngobeDescription)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="firing" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Firing Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Firing Type</h3>
                        <p className="text-lg font-semibold">{product.Firing || '-'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Bisque Temperature</h3>
                        <p className="text-lg font-semibold">{product.BisqueTemp ? `${product.BisqueTemp}°C` : '-'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Glaze Temperature</h3>
                        <p className="text-lg font-semibold">{product.GlazeTemp ? `${product.GlazeTemp}°C` : '-'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Lustre Temperature</h3>
                        <p className="text-lg font-semibold">{product.LustreTemp ? `${product.LustreTemp}°C` : '-'}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Firing Notes</h3>
                      <div className="prose prose-sm max-w-none whitespace-pre-line text-muted-foreground bg-muted/30 p-4 rounded-md border border-muted-foreground/20 min-h-[40px]">
                        <p className="mb-0">{formatLongText(product.FiringNote)}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Bisque Notes</h3>
                      <div className="prose prose-sm max-w-none whitespace-pre-line text-muted-foreground bg-muted/30 p-4 rounded-md border border-muted-foreground/20 min-h-[40px]">
                        <p className="mb-0">{formatLongText(product.BisqueTempNote)}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Glaze Temperature Notes</h3>
                      <div className="prose prose-sm max-w-none whitespace-pre-line text-muted-foreground bg-muted/30 p-4 rounded-md border border-muted-foreground/20 min-h-[40px]">
                        <p className="mb-0">{formatLongText(product.GlazeTempNote)}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Lustre Temperature Notes</h3>
                      <div className="prose prose-sm max-w-none whitespace-pre-line text-muted-foreground bg-muted/30 p-4 rounded-md border border-muted-foreground/20 min-h-[40px]">
                        <p className="mb-0">{formatLongText(product.LustreTempNote)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}