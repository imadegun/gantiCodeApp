'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Image as ImageIcon, Package, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface ProductDetail {
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
  TechDraw?: string;
  DesignName: string;
  CategoryName: string;
  SizeName: string;
  Width?: number;
  Height?: number;
  Length?: number;
  Diameter?: number;
  SampCeramicVolume?: number;
  Clay?: number;
  ClayKG?: number;
  BuildTech?: string;
  BuildTechNote?: string;
  Rim?: string;
  Feet?: string;
  GlazeTemp?: number;
  GlazeTempNote?: string;
  Firing?: string;
  FiringNote?: string;
  History?: string;
  TextureName?: string;
  MaterialName?: string;
  ColorName?: string;
  ClayCode?: string;
  ClayDescription?: string;
  FinalSizeNote?: string;
  // Glaze fields
  Glaze1Code?: string;
  Glaze1Description?: string;
  Glaze2Code?: string;
  Glaze2Description?: string;
  Glaze3Code?: string;
  Glaze3Description?: string;
  Glaze4Code?: string;
  Glaze4Description?: string;
  GlazeDensity1?: string;
  GlazeDensity2?: string;
  GlazeDensity3?: string;
  GlazeDensity4?: string;
  GlazeNotes?: string;
  // Texture fields
  Texture1Code?: string;
  Texture1Description?: string;
  Texture1Photo?: string;
  Texture2Code?: string;
  Texture2Description?: string;
  Texture2Photo?: string;
  Texture3Code?: string;
  Texture3Description?: string;
  Texture3Photo?: string;
  Texture4Code?: string;
  Texture4Description?: string;
  Texture4Photo?: string;
  TextureNote?: string;
  // Engobe fields
  Engobe1Code?: string;
  Engobe1Description?: string;
  Engobe1Photo?: string;
  Engobe2Code?: string;
  Engobe2Description?: string;
  Engobe2Photo?: string;
  Engobe3Code?: string;
  Engobe3Description?: string;
  Engobe3Photo?: string;
  Engobe4Code?: string;
  Engobe4Description?: string;
  Engobe4Photo?: string;
  EngobeNote?: string;
  // Estruder fields
  Estruder1Code?: string;
  Estruder1Description?: string;
  Estruder1Photo?: string;
  Estruder2Code?: string;
  Estruder2Description?: string;
  Estruder2Photo?: string;
  Estruder3Code?: string;
  Estruder3Description?: string;
  Estruder3Photo?: string;
  Estruder4Code?: string;
  Estruder4Description?: string;
  Estruder4Photo?: string;
  EstruderNote?: string;
  // Tools fields
  Tools1Code?: string;
  Tools1Description?: string;
  Tools1Photo?: string;
  Tools2Code?: string;
  Tools2Description?: string;
  Tools2Photo?: string;
  Tools3Code?: string;
  Tools3Description?: string;
  Tools3Photo?: string;
  Tools4Code?: string;
  Tools4Description?: string;
  Tools4Photo?: string;
  ToolsNote?: string;
  Template?: string;
  TemplateNote?: string;
  BisqueNote?: string;
  Cone?: number;
  FiringPosition?: string;
}

interface RelatedItem {
  ID: number;
  ClientCode: string | null;
  Photo1: string | null;
  Photo2: string | null;
  Photo3: string | null;
  Photo4: string | null;
  DesignName: string;
  CategoryName: string;
  SizeName: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedItems, setRelatedItems] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const productId = params.id as string;

  // Get image URL
  const getImageUrl = (photoName: string | null) => {
    if (!photoName) return null;
    if (photoName.startsWith('http://') || photoName.startsWith('https://')) {
      return photoName;
    }
    const imageServerUrl = process.env.NEXT_PUBLIC_IMAGE_SERVER_URL || 'http://192.168.1.110/upload';
    return `${imageServerUrl}/${photoName}`;
  };

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        const result = await response.json();

        if (result.success) {
          setProduct(result.data.product);
          setRelatedItems(result.data.relatedItems || []);
        } else {
          toast.error('Failed to load product details');
          router.push('/collections');
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        toast.error('Failed to load product details');
        router.push('/collections');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    }
  }, [productId, router]);


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Product not found</p>
          <Button onClick={() => router.push('/')}>
            Back to Collections
          </Button>
        </div>
      </div>
    );
  }

  // Helper component for material display with photos
  const MaterialSection = ({
    title,
    items,
    notes
  }: {
    title: string;
    items: Array<{ code?: string; description?: string; photo?: string | null }>;
    notes?: string | null;
  }) => {
    // Check if any items have data
    const hasData = items.some(item => item.code);

    if (!hasData) {
      return null; // Return null if no data to display
    }

    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</h4>
        <div className="grid grid-cols-4 gap-4">
          {items.map((item, index) => (
            <div key={index} className="space-y-2">
              {item.code ? (
                <>
                  <div className="text-sm font-medium">
                    {item.code}
                  </div>
                  {item.photo && (
                    <div className="border rounded overflow-hidden bg-muted">
                      <img
                        src={getImageUrl(item.photo) || ''}
                        alt={`${title} ${index + 1}`}
                        className="w-full h-[80px] object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="w-full h-[80px] bg-muted flex items-center justify-center hidden">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  -
                </div>
              )}
            </div>
          ))}
        </div>
        {notes && (
          <div className="mt-4">
            <div className="text-sm whitespace-pre-wrap">{notes}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Collections
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-3xl font-bold text-foreground">
              {product.CategoryName}
            </h1>
            {product.ClientCode ? (
              <Badge variant="default" className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {product.ClientCode}
              </Badge>
            ) : (
              <Badge variant="secondary">No Code</Badge>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Left Column - Image Gallery */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Product Images</h3>

                {/* Main Technical Drawing - Mandatory Display */}
                <div className="mb-4">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1 px-2 pt-2">Technical Drawing</div>
                  {product.TechDraw ? (
                    <div className="border rounded-lg overflow-hidden bg-muted">
                      <img
                        src={getImageUrl(product.TechDraw) || ''}
                        alt="Technical Drawing"
                        className="w-full h-[500px] object-contain bg-white"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="w-full h-[500px] bg-white flex items-center justify-center hidden">
                        <ImageIcon className="w-16 h-16 text-muted-foreground" />
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-lg h-[500px] bg-white flex flex-col items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">No Technical Drawing Available</span>
                    </div>
                  )}
                </div>

                {/* Product Photos - Mandatory Thumbnails */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Product Photos</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[product.Photo1, product.Photo2, product.Photo3, product.Photo4].map((photo, index) => (
                      <div key={index} className="border rounded overflow-hidden bg-muted">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1 px-2 pt-2">
                          Photo {index + 1}
                        </div>
                        {photo ? (
                          <>
                            <img
                              src={getImageUrl(photo) || ''}
                              alt={`Product Photo ${index + 1}`}
                              className="w-full h-[80px] object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <div className="w-full h-[80px] bg-muted flex items-center justify-center hidden">
                              <ImageIcon className="w-6 h-6 text-muted-foreground" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-[80px] bg-muted flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="build">Build</TabsTrigger>
                    <TabsTrigger value="materials">Mat. & Tools</TabsTrigger>
                    <TabsTrigger value="glaze">Glaze & Firing</TabsTrigger>
                    <TabsTrigger value="others">Misc.</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Basic Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Design</label>
                          <p className="text-base">{product.DesignName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Category</label>
                          <p className="text-base">{product.CategoryName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Color</label>
                          <p className="text-base">{product.ColorName || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Texture</label>
                          <p className="text-base">{product.TextureName || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Size</label>
                          <p className="text-base">{product.SizeName || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Material</label>
                          <p className="text-base">{product.MaterialName || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="build" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Build Technology</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Clay</label>
                          <p className="text-base">{product.ClayCode || '-'} {product.ClayDescription ? `- ${product.ClayDescription}` : ''}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Kg</label>
                          <p className="text-base">{product.ClayKG || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Build Tech</label>
                          <p className="text-base">{product.BuildTech || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Rim</label>
                          <p className="text-base">{product.Rim || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Feet</label>
                          <p className="text-base">{product.Feet || '-'}</p>
                        </div>
                      </div>
                      {product.BuildTechNote && (
                        <div className="mt-4">
                          <label className="text-sm font-medium">Build Tech Notes</label>
                          <div className="mt-1 p-3 bg-muted/30 rounded">
                            <div className="text-sm whitespace-pre-wrap">{product.BuildTechNote}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="materials" className="space-y-6 mt-6">
                    <div className="space-y-6">
                      {/* Texture Section */}
                      <MaterialSection
                        title="Texture"
                        items={[
                          { code: product.Texture1Code, description: product.Texture1Description, photo: product.Texture1Photo },
                          { code: product.Texture2Code, description: product.Texture2Description, photo: product.Texture2Photo },
                          { code: product.Texture3Code, description: product.Texture3Description, photo: product.Texture3Photo },
                          { code: product.Texture4Code, description: product.Texture4Description, photo: product.Texture4Photo }
                        ]}
                        notes={product.TextureNote}
                      />

                      {/* Engobe Section */}
                      <MaterialSection
                        title="Engobe"
                        items={[
                          { code: product.Engobe1Code, description: product.Engobe1Description, photo: product.Engobe1Photo },
                          { code: product.Engobe2Code, description: product.Engobe2Description, photo: product.Engobe2Photo },
                          { code: product.Engobe3Code, description: product.Engobe3Description, photo: product.Engobe3Photo },
                          { code: product.Engobe4Code, description: product.Engobe4Description, photo: product.Engobe4Photo }
                        ]}
                        notes={product.EngobeNote}
                      />

                      {/* Estruder Section */}
                      <MaterialSection
                        title="Estruder"
                        items={[
                          { code: product.Estruder1Code, description: product.Estruder1Description, photo: product.Estruder1Photo },
                          { code: product.Estruder2Code, description: product.Estruder2Description, photo: product.Estruder2Photo },
                          { code: product.Estruder3Code, description: product.Estruder3Description, photo: product.Estruder3Photo },
                          { code: product.Estruder4Code, description: product.Estruder4Description, photo: product.Estruder4Photo }
                        ]}
                        notes={product.EstruderNote}
                      />

                      {/* Tools Section */}
                      <MaterialSection
                        title="Tools"
                        items={[
                          { code: product.Tools1Code, description: product.Tools1Description, photo: product.Tools1Photo },
                          { code: product.Tools2Code, description: product.Tools2Description, photo: product.Tools2Photo },
                          { code: product.Tools3Code, description: product.Tools3Description, photo: product.Tools3Photo },
                          { code: product.Tools4Code, description: product.Tools4Description, photo: product.Tools4Photo }
                        ]}
                        notes={product.ToolsNote}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="glaze" className="space-y-6 mt-6">
                    <div className="space-y-6">
                      {/* 1. CodeGlaze Section */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Glaze</h4>
                        <div className="grid grid-cols-4 gap-4">
                          {[
                            { code: product.Glaze1Code },
                            { code: product.Glaze2Code },
                            { code: product.Glaze3Code },
                            { code: product.Glaze4Code }
                          ].map((glaze, index) => (
                            <div key={index} className="text-sm font-medium">
                              {glaze.code || '-'}
                            </div>
                          ))}
                        </div>
                         <div className="grid grid-cols-4 gap-4">
                          {[
                            { description: product.Glaze1Description },
                            { description: product.Glaze2Description },
                            { description: product.Glaze3Description },
                            { description: product.Glaze4Description }
                          ].map((glaze, index) => (
                            <div key={index} className="text-sm">
                              {glaze.description || '-'}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 2. GlazeDescription Section
                      <div className="space-y-4">
                        { <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">GlazeDescription</h4> */}
                        {/* <div className="grid grid-cols-4 gap-4">
                          {[
                            { description: product.Glaze1Description },
                            { description: product.Glaze2Description },
                            { description: product.Glaze3Description },
                            { description: product.Glaze4Description }
                          ].map((glaze, index) => (
                            <div key={index} className="text-sm">
                              {glaze.description || '-'}
                            </div>
                          ))}</div>
                      </div>  */}

                      {/* 3. Density Section */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Density</h4>
                        <div className="grid grid-cols-4 gap-4">
                          {[
                            { density: product.GlazeDensity1 },
                            { density: product.GlazeDensity2 },
                            { density: product.GlazeDensity3 },
                            { density: product.GlazeDensity4 }
                          ].map((glaze, index) => (
                            <div key={index} className="text-sm">
                              {glaze.density || '-'}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 4. Firing Section */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Firing</h4>
                        <div className="text-base">
                          {product.Firing || '-'}
                        </div>
                      </div>

                      {/* 5. Temp Section */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Temp</h4>
                        <div className="text-base">
                          {product.GlazeTemp ? `${product.GlazeTemp}°C` : '-'}
                        </div>
                      </div>

                      {/* 6. Firing Note Section */}
                      {product.FiringNote && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Firing Note</h4>
                          <div className="text-sm whitespace-pre-wrap">
                            {product.FiringNote}
                          </div>
                        </div>
                      )}

                      {/* Glaze Notes */}
                      {product.GlazeNotes && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Glaze Notes</h4>
                          <div className="text-sm whitespace-pre-wrap">
                            {product.GlazeNotes}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="others" className="space-y-6 mt-6">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Final Size</h4>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <label className="text-sm font-medium">Diameter</label>
                            <p className="text-base">{product.Diameter || '-'} cm</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Height</label>
                            <p className="text-base">{product.Height || '-'} cm</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Width</label>
                            <p className="text-base">{product.Width || '-'} cm</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Length</label>
                            <p className="text-base">{product.Length || '-'} cm</p>
                          </div>
                        </div>
                        {product.FinalSizeNote && (
                          <div className="mt-4">
                            <label className="text-sm font-medium">Final Size Notes</label>
                            <div className="mt-1 p-3 bg-muted/30 rounded">
                              <div className="text-sm whitespace-pre-wrap">{product.FinalSizeNote}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">History</h4>
                        {product.History ? (
                          <div className="p-3 bg-muted/30 rounded">
                            <div className="text-sm whitespace-pre-wrap">{product.History}</div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No history available</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Related Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedItems.map((item) => (
                  <Card key={item.ID} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/collections/${item.ID}`)}>
                    <CardContent className="p-4">
                      <div className="aspect-square mb-3">
                        {item.Photo1 ? (
                          <img
                            src={getImageUrl(item.Photo1) || ''}
                            alt="Product"
                            className="w-full h-full object-cover rounded-md"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-medium text-sm mb-1">{item.DesignName}</h4>
                      <p className="text-xs text-muted-foreground">{item.CategoryName}</p>
                      <p className="text-xs text-muted-foreground">{item.SizeName || '-'}</p>
                      {item.ClientCode && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {item.ClientCode}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}