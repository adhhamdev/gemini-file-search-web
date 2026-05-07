'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { listStores, createStore, deleteStore, listDocuments, uploadDocument, deleteDocument } from '@/app/actions';
import { Loader2, FolderOpen, Trash2, FilePlus, ChevronLeft, RefreshCcw } from 'lucide-react';

export default function ClientApp() {
  const [stores, setStores] = useState<any[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  
  const [activeStore, setActiveStore] = useState<any | null>(null);
  
  const [docs, setDocs] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  // Store creation
  const [newStoreName, setNewStoreName] = useState('');
  const [isCreatingStore, setIsCreatingStore] = useState(false);
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);

  // Document upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const fetchStores = async () => {
    setIsLoadingStores(true);
    try {
      const data = await listStores();
      setStores(data || []);
    } catch (e: any) {
      toast.error('Failed to fetch stores: ' + e.message);
    } finally {
      setIsLoadingStores(false);
    }
  };

  const fetchDocs = async (storeName: string) => {
    setIsLoadingDocs(true);
    try {
      const data = await listDocuments(storeName);
      setDocs(data || []);
    } catch (e: any) {
      toast.error('Failed to fetch documents: ' + e.message);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchStores();
  }, []);

  useEffect(() => {
    if (activeStore) {
      // eslint-disable-next-line
      fetchDocs(activeStore.name);
    }
  }, [activeStore]);

  const handleCreateStore = async () => {
    if (!newStoreName.trim()) return;
    setIsCreatingStore(true);
    try {
      await createStore(newStoreName);
      toast.success('Store created successfully');
      setNewStoreName('');
      setIsStoreDialogOpen(false);
      fetchStores();
    } catch (e: any) {
      toast.error('Failed to create store: ' + e.message);
    } finally {
      setIsCreatingStore(false);
    }
  };

  const handleDeleteStore = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this store?')) return;
    try {
      await deleteStore(name);
      toast.success('Store deleted');
      fetchStores();
    } catch (err: any) {
      toast.error('Failed to delete store: ' + err.message);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !activeStore) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      await uploadDocument(formData, activeStore.name);
      toast.success('Document uploaded successfully');
      setUploadFile(null);
      setIsUploadDialogOpen(false);
      fetchDocs(activeStore.name);
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (name: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument(name);
      toast.success('Document deleted');
      if (activeStore) fetchDocs(activeStore.name);
    } catch (err: any) {
      toast.error('Failed to delete document: ' + err.message);
    }
  };

  if (activeStore) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => setActiveStore(null)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-semibold">{activeStore.displayName || 'Unnamed Store'}</h2>
            <p className="text-sm text-gray-500 font-mono">{activeStore.name}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium tracking-tight">Documents</h3>
          <div className="flex space-x-3">
             <Button variant="outline" size="icon" onClick={() => fetchDocs(activeStore.name)}>
               <RefreshCcw className="w-4 h-4" />
             </Button>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
                  <FilePlus className="w-4 h-4 mr-2" /> Upload Document
            </Button>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>
                    Upload a file to this File Search Store to be processed for semantic retrieval.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUploadDocument} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="file">File</Label>
                    <Input id="file" type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} required />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isUploading || !uploadFile}>
                      {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Upload
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Display Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Mime Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingDocs ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </TableCell>
                </TableRow>
              ) : docs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No documents found in this store.
                  </TableCell>
                </TableRow>
              ) : (
                docs.map((doc) => (
                  <TableRow key={doc.name}>
                    <TableCell className="font-medium">{doc.displayName || 'Unnamed File'}</TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {doc.sizeBytes ? (parseInt(doc.sizeBytes) / 1024).toFixed(2) + ' KB' : 'N/A'}
                    </TableCell>
                    <TableCell>
                       <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800">
                         {doc.state || 'UNKNOWN'}
                       </span>
                    </TableCell>
                    <TableCell className="text-gray-500 font-mono text-xs">{doc.mimeType || 'UNKNOWN'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc.name)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">File Search Stores</h2>
        <div className="flex space-x-3">
             <Button variant="outline" size="icon" onClick={() => fetchStores()}>
               <RefreshCcw className="w-4 h-4" />
             </Button>
        <Button onClick={() => setIsStoreDialogOpen(true)}>
              <FolderOpen className="w-4 h-4 mr-2" /> New Store
        </Button>
        <Dialog open={isStoreDialogOpen} onOpenChange={setIsStoreDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create File Search Store</DialogTitle>
              <DialogDescription>
                File Search Stores are corpora containing documents for semantic retrieval.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Sales Playbooks"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateStore} disabled={isCreatingStore || !newStoreName.trim()}>
                {isCreatingStore && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Store
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {isLoadingStores ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : stores.length === 0 ? (
        <Card className="border-dashed border-2 bg-gray-50/50">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <FolderOpen className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No stores found</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">Create your first File Search Store to get started.</p>
            <Button onClick={() => setIsStoreDialogOpen(true)}>Create Store</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <Card 
              key={store.name} 
              className="cursor-pointer hover:shadow-md transition-all group bg-white border-gray-200"
              onClick={() => setActiveStore(store)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg overflow-hidden text-ellipsis whitespace-nowrap">
                    {store.displayName || 'Unnamed Store'}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 hover:bg-red-50 -mt-2 -mr-2"
                    onClick={(e) => handleDeleteStore(store.name, e)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription className="font-mono text-xs truncate">
                  {store.name}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-0 text-sm text-gray-500 flex justify-between">
                 <span>Active Docs: {store.activeDocumentsCount || 0}</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
