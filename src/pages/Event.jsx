import {
  useEvents,
  useAddEvent,
  useDeleteEvent,
  useEditEvent,
  useJoinEvent,
  useLeaveEvent,
} from '@/hooks/events.js';
import { useBeaches } from '@/hooks/beaches.js';
import Spinner from '@/components/common/LoadingSpinner.jsx';
import EventCard from '@/components/event/EventCard.jsx';
import EventCalendar from '@/components/event/EventCalendar.jsx';
import CommonForm from '@/components/common/Form.jsx';
import ImageUpload from '@/components/common/ImageUpload.jsx';
import { eventFormControls } from '@/config/index.js';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Plus, Grid3x3, Calendar } from 'lucide-react';
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
  title: '',
  description: '',
  beachId: '',
  startDate: '',
  endDate: '',
  maxVolunteers: 50,
  tags: '',
};

const initialAlertDialogState = {
  open: false,
  title: '',
  description: '',
  closeBtnTxt: '',
  okBtnTxt: '',
  action: null,
};

export default function EventsPage() {
  const { user } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [status, setStatus] = useState('ALL');

  const queryParams = { page, limit };
  if (status !== 'ALL') queryParams.status = status;

  const {
    data: eventsData,
    isLoading: isEventLoading,
    isError: isEventError,
  } = useEvents(queryParams);
  const {
    data: beachesData,
    isLoading: isBeachLoading,
    isError: isBeachError,
  } = useBeaches({ limit: 100 });

  const { mutate: addEvent } = useAddEvent();
  const { mutate: editEvent } = useEditEvent();
  const { mutate: deleteEvent } = useDeleteEvent();
  const { mutate: joinEvent } = useJoinEvent();
  const { mutate: leaveEvent } = useLeaveEvent();

  const beaches = beachesData?.data || [];
  const events = eventsData?.data?.events || [];
  const pagination = eventsData?.data?.pagination || { page: 1, pages: 1 };

  const eventFormControlsWithBeachesData = eventFormControls.map((control) => {
    if (control.label === 'Beach') {
      return {
        ...control,
        options: beaches.map((beach) => ({
          id: beach.id,
          label: beach.name,
        })),
      };
    }
    return control;
  });

  const [formData, setFormData] = useState(initialFormData);
  const [openAddEventDialog, setOpenAddEventDialog] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertDialogConfig, setAlertDialogConfig] = useState(
    initialAlertDialogState
  );
  const [loadingEventIds, setLoadingEventIds] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'calendar'
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [imageLoadingState, setImageLoadingState] = useState(false);

  if (isEventLoading || isBeachLoading) return <Spinner fullPage />;
  if (isEventError || isBeachError) return <p>Something went wrong.</p>;

  const onEventAddSubmit = (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const tagsArray = formData.tags
      ? formData.tags.split(',').map((tag) => tag.trim())
      : [];

    const payload = {
      title: formData.title,
      description: formData.description,
      beachId: formData.beachId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      maxVolunteers: parseInt(formData.maxVolunteers),
      tags: tagsArray,
      imageUrls: uploadedImageUrl ? [uploadedImageUrl] : [],
    };

    addEvent(payload, {
      onSuccess: () => {
        setFormData(initialFormData);
        setImageFile(null);
        setUploadedImageUrl('');
        setIsSubmitting(false);
        setOpenAddEventDialog(false);
        toast.success('Event created successfully');
      },
      onError: (error) => {
        setIsSubmitting(false);
        toast.error('Event creation failed', error?.message);
      },
    });
  };

  const handleDelete = (id, title) => {
    setAlertDialogConfig({
      open: true,
      title: 'Are you sure?',
      description: `Delete "${title}"? This action cannot be undone.`,
      closeBtnTxt: 'Cancel',
      okBtnTxt: 'Delete',
      action: () => {
        deleteEvent(id, {
          onSuccess: () => {
            toast.success('Event deleted successfully');
          },
          onError: (error) => {
            toast.error('Event deletion failed', error?.message);
          },
        });
        setAlertDialogConfig(initialAlertDialogState);
      },
    });
  };

  const handleEdit = (event) => {
    setCurrentEditedId(event._id);
    setOpenAddEventDialog(true);

    const patchData = {
      title: event.title,
      description: event.description,
      beachId: event.beachId?._id || event.beachId,
      startDate: event.startDate,
      endDate: event.endDate,
      maxVolunteers: event.maxVolunteers,
      tags: event.tags?.join(', ') || '',
    };

    if (event.imageUrls && event.imageUrls.length > 0) {
      setUploadedImageUrl(event.imageUrls[0]);
    } else {
      setUploadedImageUrl('');
    }

    setFormData(patchData);
  };

  const onEventEditSubmit = (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const tagsArray = formData.tags
      ? formData.tags.split(',').map((tag) => tag.trim())
      : [];

    const payload = {
      title: formData.title,
      description: formData.description,
      beachId: formData.beachId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      maxVolunteers: parseInt(formData.maxVolunteers),
      tags: tagsArray,
      imageUrls: uploadedImageUrl ? [uploadedImageUrl] : [],
    };

    editEvent(
      { id: currentEditedId, updatedData: payload },
      {
        onSuccess: () => {
          setFormData(initialFormData);
          setImageFile(null);
          setUploadedImageUrl('');
          setIsSubmitting(false);
          setOpenAddEventDialog(false);
          setCurrentEditedId(null);
          toast.success('Event updated successfully');
        },
        onError: (error) => {
          setIsSubmitting(false);
          toast.error('Event update failed', error?.message);
        },
      }
    );
  };

  const handleJoin = (eventId) => {
    setLoadingEventIds((prev) => new Set(prev).add(eventId));

    joinEvent(eventId, {
      onSuccess: () => {
        setLoadingEventIds((prev) => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
        toast.success('Successfully joined the event');
      },
      onError: (error) => {
        setLoadingEventIds((prev) => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
        toast.error('Failed to join event', error?.message);
      },
    });
  };

  const handleLeave = (eventId) => {
    setLoadingEventIds((prev) => new Set(prev).add(eventId));

    leaveEvent(eventId, {
      onSuccess: () => {
        setLoadingEventIds((prev) => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
        toast.success('Successfully left the event');
      },
      onError: (error) => {
        setLoadingEventIds((prev) => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
        toast.error('Failed to leave event', error?.message);
      },
    });
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground">
            Beach Cleanup Events
          </h1>
          <p className="text-muted-foreground text-lg">
            Join community-driven initiatives to protect our coastlines.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="gap-2"
          >
            <Grid3x3 className="w-4 h-4" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className="gap-2"
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Filter Status:
          </span>
          <Select
            value={status}
            onValueChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="UPCOMING">Upcoming</SelectItem>
                <SelectItem value="ONGOING">Ongoing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
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
                  {[...new Array(pagination.pages)].map((_, i) => (
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
        <div className="flex items-center gap-3 w-full sm:w-auto">
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
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="48">48</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      {events.length === 0 && (
        <div className="container mx-auto px-6 py-12">
          <div className="col-span-full text-center py-20 text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed border-border">
            No events are currently scheduled.
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid md:grid-cols-3 gap-6">
          {events &&
            events.length > 0 &&
            events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onJoin={handleJoin}
                onLeave={handleLeave}
                isLoading={loadingEventIds.has(event._id)}
              />
            ))}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && <EventCalendar events={events} />}

      {(user?.role === 'organizer' || user?.role === 'admin') && (
        <Button
          onClick={() => setOpenAddEventDialog(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      <Sheet
        open={openAddEventDialog}
        onOpenChange={() => {
          setOpenAddEventDialog(false);
          setCurrentEditedId(null);
          setFormData(initialFormData);
          setImageFile(null);
          setUploadedImageUrl('');
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? 'Edit Event' : 'Create New Event'}
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
              formControls={eventFormControlsWithBeachesData}
              isBtnDisabled={isSubmitting}
              buttonText={
                currentEditedId
                  ? isSubmitting
                    ? 'Saving Changes...'
                    : 'Update Event'
                  : isSubmitting
                    ? 'Creating Event...'
                    : 'Create Event'
              }
              formData={formData}
              setFormData={setFormData}
              onSubmit={currentEditedId ? onEventEditSubmit : onEventAddSubmit}
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
