import { useBeaches, useAddBeach, useDeleteBeach } from '@/hooks/beaches.js';
import Spinner from '@/components/common/LoadingSpinner.jsx';
import BeachCard from '@/components/beach/BeachCard.jsx';
import CommonForm from '@/components/common/Form.jsx';
import { beachFormControls } from '@/config/index.js';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ImageUpload from '@/components/common/ImageUpload.jsx';
import CustomAlert from '@/components/common/Alert';
import { toast } from 'sonner';

const initialFormData = {
  name: '',
  country: '',
  city: '',
  description: '',
};

const initialAletDialogState = {
  open: false,
  title: '',
  description: '',
  closeBtnTxt: '',
  okBtnTxt: '',
  action: null,
};

export default function BeachesPage() {
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading, isError: isBechFetchError } = useBeaches();
  const { mutate: addBeach } = useAddBeach();
  const { mutate: deleteBeach } = useDeleteBeach();

  const beaches = data?.data || [];

  const [formData, setFormData] = useState(initialFormData);
  const [openAddBeachDialog, setOpenAddBeachDialog] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertDialogConfig, setAlertDialogConfig] = useState(
    initialAletDialogState
  );

  if (isLoading) return <Spinner />;
  if (isBechFetchError) return <p>Something went wrong.</p>;

  if (beaches.length === 0) {
    return (
      <div className="col-span-full text-center py-20 text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed border-border">
        No beaches are currently registered in the system.
      </div>
    );
  }

  function onSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    const {
      name,
      description,
      address,
      city,
      country,
      lat = 1,
      lon = 1,
    } = formData;

    const payload = {
      name,
      description,
      location: {
        address,
        city,
        country,
        coordinates: {
          type: 'Point',
          coordinates: [lon, lat],
        },
      },
      image: uploadedImageUrl,
    };

    addBeach(payload, {
      onSuccess: () => {
        setFormData(initialFormData);
        setImageFile(null);
        setUploadedImageUrl('');
        setIsSubmitting(false);
        setOpenAddBeachDialog(false);
      },
      onError: (error) => {
        setIsSubmitting(false);
        console.error('Failed to add beach:', error);
      },
    });

    console.log('Beach add function: not implemented.');
  }

  const handleDelete = (id, name) => {
    setAlertDialogConfig({
      open: true,
      title: 'Are you sure?',
      description: `Delete ${name}? This action cannot be undone.`,
      closeBtnTxt: 'Cancel',
      okBtnTxt: 'Delete',
      action: () => {
        deleteBeach(id, {
          onSuccess: () => {
            toast.success('Beach deleted successfully');
          },
          onError: (error) => {
            toast.error('Beach deletion failed', error?.message);
          },
        });

        setAlertDialogConfig(initialAletDialogState);
      },
    });
  };

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
          beaches.map((beach) => (
            <BeachCard key={beach.id} beach={beach} onDelete={handleDelete} />
          ))}
      </div>

      <Button
        onClick={() => setOpenAddBeachDialog(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg flex items-center justify-center ${user.role != 'admin' ? 'invisible' : ''}`}
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
              isBtnDisabled={isSubmitting}
              buttonText={
                currentEditedId
                  ? isSubmitting
                    ? 'Saving Changes...'
                    : 'Edit Beach'
                  : isSubmitting
                    ? 'Adding Beach...'
                    : 'Add Beach'
              }
              formData={formData}
              setFormData={setFormData}
              onSubmit={onSubmit}
            />
          </div>
        </SheetContent>
      </Sheet>

      <CustomAlert
        openAlertDialog={alertDialogConfig.open}
        setOpenAlertDialog={(val) =>
          setAlertDialogConfig((prev) => ({ ...prev, open: val }))
        }
        title={alertDialogConfig.title}
        description={alertDialogConfig.description}
        closeBtnTxt={alertDialogConfig.closeBtnTxt}
        okBtnTxt={alertDialogConfig.okBtnTxt}
        action={alertDialogConfig.action}
      />
    </div>
  );
}
