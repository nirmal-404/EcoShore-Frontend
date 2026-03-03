import { useBeaches } from '@/hooks/beaches.js';
import Spinner from '@/components/common/LoadingSpinner.jsx';
import BeachCard from '@/components/beach/BeachCard.jsx';
import CommonForm from '@/components/common/Form.jsx';
import { beachFormControls } from '@/config/index.js';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ImageUpload from '@/components/common/ImageUpload.jsx';

const initialFormData = {
  image: null,
  name: '',
  country: '',
  city: '',
  description: '',
};

export default function BeachesPage() {
  const { data, isLoading, isError } = useBeaches();
  const beaches = data?.data || [];

  const [formData, setFormData] = useState(initialFormData);
  const [openAddBeachDialog, setOpenAddBeachDialog] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);

  if (isLoading) return <Spinner />;
  if (isError) return <p>Something went wrong.</p>;

  if (data.length === 0) {
    return (
      <div className="col-span-full text-center py-20 text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed border-border">
        No beaches are currently registered in the system.
      </div>
    );
  }

  function onSubmit(event) {
    event.preventDefault();
    //   TODO: implement beach add
    console.log('Beach add function: not implemented.');
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground">
          Our Beaches
        </h1>
        <p className="text-muted-foreground text-lg">
          Discover the coastlines we're working to protect.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {beaches &&
          beaches.map((beach) => <BeachCard key={beach.id} beach={beach} />)}
      </div>

      <Button
        onClick={() => setOpenAddBeachDialog(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Sheet
        open={openAddBeachDialog}
        onOpenChange={() => {
          setOpenAddBeachDialog(false);
          setCurrentEditedId(null);
          setFormData(initialFormData);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? 'Edit Beach' : 'Add New Beach'}
            </SheetTitle>
          </SheetHeader>
          <ImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            imageLoadingState={imageLoadingState}
            setImageLoadingState={setImageLoadingState}
            isEditMode={currentEditedId !== null}
          />
          <div className="py-6">
            <CommonForm
              formControls={beachFormControls}
              buttonText={'Add Beach'}
              formData={formData}
              setFormData={setFormData}
              onSubmit={onSubmit}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
