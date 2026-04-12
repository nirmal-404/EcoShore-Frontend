import {
  useBeaches,
  useAddBeach,
  useDeleteBeach,
  useEditBeach,
} from '@/hooks/beaches.js';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const {
    data,
    isLoading,
    isError: isBechFetchError,
  } = useBeaches({ page, limit });
  const { mutate: addBeach } = useAddBeach();
  const { mutate: editBeach } = useEditBeach();
  const { mutate: deleteBeach } = useDeleteBeach();

  const beaches = data?.data || [];
  const pagination = data?.pagination || { page: 1, pages: 1 };

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

  if (isLoading) return <Spinner fullPage />;
  if (isBechFetchError) return <p>Something went wrong.</p>;

  if (beaches.length === 0) {
    return (
      <div className="col-span-full text-center py-20 text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed border-border">
        No beaches are currently registered in the system.
      </div>
    );
  }

  const onBeachAddSubmitSubmit = (event) => {
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
  };

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

  const handleEdit = (beach) => {
    setCurrentEditedId(beach.id);
    setOpenAddBeachDialog(true);

    const patchdata = {
      name: beach.name,
      address: beach.location.address,
      country: beach.location.country,
      city: beach.location.city,
      description: beach.description,
      image: beach.image,
    };

    setFormData(patchdata);
  };

  const onBeachEditSubmitSubmit = (event) => {
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
    };

    editBeach(
      { id: currentEditedId, updatedData: payload },
      {
        onSuccess: () => {
          setFormData(initialFormData);
          setImageFile(null);
          setUploadedImageUrl('');
          setIsSubmitting(false);
          setCurrentEditedId(null);
          setOpenAddBeachDialog(false);
          toast.success('Beach updated successfully');
        },
        onError: (error) => {
          setIsSubmitting(false);
          toast.error('Beach update failed', error?.message);
        },
      }
    );
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

      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-end bg-card p-4 rounded-xl border border-border mt-12">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {pagination.pages > 0 && (
            <div className="">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={
                        page === 1
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                  {[...Array(pagination.pages)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => setPage(i + 1)}
                        isActive={page === i + 1}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setPage((p) => Math.min(pagination.pages, p + 1))
                      }
                      className={
                        page === pagination.pages
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Results per page:
          </span>
          <Select
            value={limit.toString()}
            onValueChange={(val) => {
              setLimit(Number(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Page Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="16">16</SelectItem>
                <SelectItem value="32">32</SelectItem>
                <SelectItem value="64">64</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid md:grid-cols-4 gap-6">
        {beaches?.map((beach) => (
          <BeachCard
            key={beach.id}
            beach={beach}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      </div>

      {user?.role && user?.role === 'admin' && (
        <Button
          onClick={() => setOpenAddBeachDialog(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
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
          {currentEditedId !== null}
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
              onSubmit={
                currentEditedId
                  ? onBeachEditSubmitSubmit
                  : onBeachAddSubmitSubmit
              }
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
