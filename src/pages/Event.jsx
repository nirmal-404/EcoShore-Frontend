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
  const {
    data: eventsData,
    isLoading: isEventLoading,
    isError: isEventError,
  } = useEvents();
  const {
    data: beachesData,
    isLoading: isBeachLoading,
    isError: isBeachError,
  } = useBeaches();

  const { mutate: addEvent } = useAddEvent();
  const { mutate: editEvent } = useEditEvent();
  const { mutate: deleteEvent } = useDeleteEvent();
  const { mutate: joinEvent } = useJoinEvent();
  const { mutate: leaveEvent } = useLeaveEvent();

  const beaches = beachesData?.data || [];
  const events = eventsData?.data?.events || [];

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

  if (isEventLoading || isBeachLoading) return <Spinner />;
  if (isEventError || isBeachError) return <p>Something went wrong.</p>;

  if (events.length === 0) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground">
            Beach Cleanup Events
          </h1>
          <p className="text-muted-foreground text-lg">
            Join community-driven initiatives to protect our coastlines.
          </p>
        </div>
        <div className="col-span-full text-center py-20 text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed border-border">
          No events are currently scheduled.
        </div>
      </div>
    );
  }

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
    };

    addEvent(payload, {
      onSuccess: () => {
        setFormData(initialFormData);
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
    };

    editEvent(
      { id: currentEditedId, updatedData: payload },
      {
        onSuccess: () => {
          setFormData(initialFormData);
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

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid md:grid-cols-3 gap-6">
          {events.map((event) => (
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

      {user?.role === 'organizer' && (
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
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? 'Edit Event' : 'Create New Event'}
            </SheetTitle>
          </SheetHeader>
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
