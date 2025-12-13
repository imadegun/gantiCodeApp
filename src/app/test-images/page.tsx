'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, ExternalLink } from 'lucide-react';

export default function ImageTestPage() {
  const [testFilename, setTestFilename] = useState('imagename.jpg');
  const [imageServerUrl] = useState(
    process.env.NEXT_PUBLIC_IMAGE_SERVER_URL || 'http://192.168.1.110/upload'
  );

  const testImageUrl = `${imageServerUrl}/${testFilename}`;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Image Server Configuration Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Configuration Info */}
          <Card>
            <CardHeader>
              <CardTitle>Current Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Image Server URL:</label>
                <p className="text-sm text-muted-foreground font-mono break-all">
                  {imageServerUrl}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Test Filename:</label>
                <Input
                  value={testFilename}
                  onChange={(e) => setTestFilename(e.target.value)}
                  placeholder="Enter image filename"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Full URL:</label>
                <p className="text-sm text-muted-foreground font-mono break-all">
                  {testImageUrl}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => window.open(testImageUrl, '_blank')}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Test URL in New Tab
              </Button>
            </CardContent>
          </Card>

          {/* Image Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Image Preview (50x50px)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-[50px] h-[50px] bg-muted rounded-md flex items-center justify-center overflow-hidden border">
                    <img 
                      src={testImageUrl}
                      alt="Test Image"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <ImageIcon className="w-6 h-6 text-muted-foreground hidden" />
                  </div>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  {testFilename ? `Testing: ${testFilename}` : 'Enter a filename to test'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Troubleshooting */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">If images don't load:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Check if the image server is running at {imageServerUrl}</li>
                <li>Verify the image file exists in the server's upload directory</li>
                <li>Ensure the server allows cross-origin requests (CORS)</li>
                <li>Test the URL directly in your browser</li>
                <li>Check network tab in browser developer tools for errors</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Database format should be:</h4>
              <code className="text-sm bg-muted p-2 rounded block">
                Photo1 column: "imagename.jpg" (filename only)
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}