'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Check, ChevronsUpDown, Package, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';

interface ProductDetail {
    ID: number;
    ClientCode: string | null;
    DesignCode: string;
    NameCode: string;
    CategoryName: string;
    Photo1: string | null;
    // Add other fields as needed
}

export default function StockCapturePage() {
    const [designCodes, setDesignCodes] = useState<string[]>([]);
    const [selectedDesign, setSelectedDesign] = useState<string>('');
    const [clients, setClients] = useState<ProductDetail[]>([]);
    const [selectedClient, setSelectedClient] = useState<string>('');
    const [productDetails, setProductDetails] = useState<ProductDetail | null>(null);

    // Stock Input State
    const [department, setDepartment] = useState('');
    const [region, setRegion] = useState('');
    const [availableQty, setAvailableQty] = useState(0);
    const [reservedQty, setReservedQty] = useState(0);
    const [notes, setNotes] = useState('');

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [openCombobox, setOpenCombobox] = useState(false);

    // 1. Fetch Design Codes on Mount
    useEffect(() => {
        const fetchDesigns = async () => {
            try {
                const res = await fetch('/api/master/designs');
                const data = await res.json();
                if (data.success) {
                    setDesignCodes(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch designs', error);
            }
        };
        fetchDesigns();
    }, []);

    // 2. Fetch Clients when DesignCode changes
    useEffect(() => {
        if (!selectedDesign) {
            setClients([]);
            return;
        }

        const fetchClients = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/master/details?designCode=${selectedDesign}`);
                const data = await res.json();
                if (data.success) {
                    setClients(data.data);
                    // If only one client, auto-select? Maybe better to let user choose explicitly.
                }
            } catch (error) {
                toast({ title: 'Error', description: 'Failed to fetch client codes', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
        // Reset subsequent selections
        setSelectedClient('');
        setProductDetails(null);
    }, [selectedDesign]);

    // 3. Update Details when ClientCode changes
    useEffect(() => {
        if (!selectedClient) {
            setProductDetails(null);
            return;
        }
        const clientData = clients.find(c => c.ClientCode === selectedClient);
        setProductDetails(clientData || null);
    }, [selectedClient, clients]);

    // 4. Submit Handler
    const handleSubmit = async () => {
        if (!selectedDesign || !selectedClient) {
            toast({ title: 'Validation Error', description: 'Please select Design and Client codes', variant: 'destructive' });
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                designCode: selectedDesign,
                clientCode: selectedClient,
                department,
                region,
                availableQuantity: availableQty,
                reservedQuantity: reservedQty,
                totalQuantity: availableQty + reservedQty,
                notes
            };

            const res = await fetch('/api/stock/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();

            if (result.success) {
                toast({ title: 'Success', description: 'Stock captured successfully' });
                // Reset form
                setSelectedClient('');
                setProductDetails(null);
                setDepartment('');
                setRegion('');
                setAvailableQty(0);
                setReservedQty(0);
                setNotes('');
            } else {
                toast({ title: 'Error', description: result.error, variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save stock', variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Package className="h-8 w-8" />
                    Stock Capture
                </h1>
                <p className="text-muted-foreground">
                    Select Design and Client codes to capture stock into the system.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column: Selection */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>1. Select Product</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Design Code Combobox */}
                            <div className="space-y-2">
                                <Label>Design Code</Label>
                                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openCombobox}
                                            className="w-full justify-between"
                                        >
                                            {selectedDesign ? selectedDesign : "Select design code..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search design code..." />
                                            <CommandList>
                                                <CommandEmpty>No design found.</CommandEmpty>
                                                <CommandGroup>
                                                    {designCodes.map((code) => (
                                                        <CommandItem
                                                            key={code}
                                                            value={code}
                                                            onSelect={(currentValue) => {
                                                                setSelectedDesign(currentValue === selectedDesign ? "" : currentValue);
                                                                setOpenCombobox(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedDesign === code ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {code}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Client Code Select */}
                            <div className="space-y-2">
                                <Label>Client Code {loading && <Loader2 className="inline h-3 w-3 animate-spin" />}</Label>
                                <Select disabled={!selectedDesign} value={selectedClient} onValueChange={setSelectedClient}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select client code" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((c) => (
                                            <SelectItem key={c.ID} value={c.ClientCode || 'UNKNOWN'}>
                                                {c.ClientCode || 'No Client Code'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Product Preview */}
                    {productDetails && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="aspect-square bg-muted rounded-md overflow-hidden relative border">
                                    {productDetails.Photo1 ? (
                                        <img
                                            src={productDetails.Photo1}
                                            alt="Product"
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="font-semibold">Name:</div>
                                    <div>{productDetails.NameCode || '-'}</div>
                                    <div className="font-semibold">Category:</div>
                                    <div>{productDetails.CategoryName || '-'}</div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Stock Input */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>2. Stock Details</CardTitle>
                            <CardDescription>Enter inventory information for this item.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Department</Label>
                                    <Input
                                        placeholder="e.g. Warehouse A"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Region</Label>
                                    <Input
                                        placeholder="e.g. North"
                                        value={region}
                                        onChange={(e) => setRegion(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Available Qty</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={availableQty}
                                        onChange={(e) => setAvailableQty(parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Reserved Qty</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={reservedQty}
                                        onChange={(e) => setReservedQty(parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            <div className="p-2 bg-muted rounded-md text-sm text-center">
                                Total Quantity: <span className="font-bold">{availableQty + reservedQty}</span>
                            </div>

                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea
                                    placeholder="Additional notes..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleSubmit}
                                disabled={submitting || !selectedClient}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save to Stock
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
