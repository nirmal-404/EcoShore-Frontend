import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Tag,
  Pencil,
  Trash2,
  Plus,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { useState } from 'react';
import AssignAgentModal from './AssignAgentModal.jsx';

function EventCard({ event, onDelete, onEdit, onJoin, onLeave, isLoading }) {
  const { user } = useSelector((state) => state.auth);
  const [isAssignAgentModalOpen, setIsAssignAgentModalOpen] = useState(false);

  const isJoinedVolunteer = event.volunteers?.includes(user?._id);
  const volunteerCount = event.volunteers?.length || 0;
  const isFull = volunteerCount >= event.maxVolunteers;

  const getStatusColor = (status) => {
    switch (status) {
      case 'UPCOMING':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'ONGOING':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'COMPLETED':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <div className="group rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-xl transition-all h-full flex flex-col overflow-hidden">
      {/* Image Section */}
      {event.imageUrls && event.imageUrls.length > 0 && (
        <div className="w-full h-48 overflow-hidden relative bg-muted">
          <img
            src={event.imageUrls[0]}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Badge
            className={`absolute top-3 right-3 ${getStatusColor(event.status)} border`}
          >
            {event.status}
          </Badge>
        </div>
      )}

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {!event.imageUrls?.length && (
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Calendar className="w-5 h-5" />
              </div>
              <Badge className={`${getStatusColor(event.status)} border`}>
                {event.status}
              </Badge>
            </div>
          )}

          <h3 className="text-lg font-bold mb-2">{event.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {event.description}
          </p>

          {/* Event Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 mr-2 text-primary" />
              <span className="font-medium">
                {event.beachId?.name || 'Beach'}
              </span>
            </div>

            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="w-3 h-3 mr-2 text-primary" />
              <span>
                {format(new Date(event.startDate), 'MMM dd, yyyy • h:mm a')}
              </span>
            </div>

            <div className="flex items-center text-xs text-muted-foreground">
              <Users className="w-3 h-3 mr-2 text-primary" />
              <span>
                {volunteerCount} / {event.maxVolunteers} volunteers
                {isFull && ' • Full'}
              </span>
            </div>

            {event.agentId && (
              <div className="flex items-center text-xs text-muted-foreground">
                <User className="w-3 h-3 mr-2 text-primary" />
                <span className="font-medium">
                  Assigned:{' '}
                  {typeof event.agentId === 'object'
                    ? event.agentId.name
                    : event.agentId}
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {event.tags.slice(0, 4).map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-secondary/50"
                >
                  <Tag className="w-2.5 h-2.5 mr-1" />
                  {tag}
                </Badge>
              ))}
              {event.tags.length > 4 && (
                <Badge variant="outline" className="text-xs bg-secondary/50">
                  +{event.tags.length - 4}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
          {user && (user.role === 'organizer' || user.role === 'admin') ? (
            <div className="flex gap-1 w-full">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 flex-1 text-blue-500 hover:text-blue-600"
                onClick={() => onEdit(event)}
              >
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 flex-1 relative group"
                onClick={() => setIsAssignAgentModalOpen(true)}
                title="Assign Agent"
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs">Agent</span>
                  <Plus className="w-3 h-3" />
                </div>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 flex-1 text-red-500 hover:text-red-600"
                onClick={() => onDelete(event._id, event.title)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          ) : user && user.role === 'volunteer' ? (
            <div className="w-full">
              {isJoinedVolunteer ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8"
                  onClick={() => onLeave(event._id)}
                >
                  {isLoading ? 'Leaving Event...' : 'Leave event'}
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="w-full h-8"
                  onClick={() => onJoin(event._id)}
                  disabled={isFull || event.status !== 'UPCOMING'}
                >
                  {isFull
                    ? 'Event Full'
                    : isLoading
                      ? 'Joining Event...'
                      : 'Join Event'}
                </Button>
              )}
            </div>
          ) : (
            <div className="w-full text-center text-xs text-muted-foreground">
              Login to join
            </div>
          )}
        </div>
      </div>

      {/* Assign Agent Modal */}
      <AssignAgentModal
        eventId={event._id}
        beachId={event.beachId?._id || event.beachId}
        eventTitle={event.title}
        isOpen={isAssignAgentModalOpen}
        onClose={() => setIsAssignAgentModalOpen(false)}
      />
    </div>
  );
}

export default EventCard;
