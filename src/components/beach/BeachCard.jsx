import { Trash2, MapPin, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Waves } from 'lucide-react';
import React from 'react';
import { useSelector } from 'react-redux';

function BeachCard({ beach, onDelete, onEdit }) {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="group rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-xl transition-all h-full flex flex-col overflow-hidden">
      {/* Image Section */}
      {beach.image && (
        <div className="w-full h-48 overflow-hidden relative bg-muted">
          <img
            src={beach.image}
            alt={beach.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {!beach.image && (
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <Waves className="w-5 h-5" />
            </div>
          )}
          <h3 className="text-lg font-bold mb-2">{beach.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {beach.description ||
              'A beautiful beach location prioritized for cleanup efforts.'}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center text-xs font-medium text-muted-foreground">
            <MapPin className="w-3 h-3 mr-1 text-primary" />
            {beach.location?.city || 'View on Map'}
          </div>
          {user?.role && user?.role === 'admin' && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-blue-500 hover:text-blue-600"
                onClick={() => onEdit(beach)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-red-500 hover:text-red-600"
                onClick={() => onDelete(beach.id, beach.name)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BeachCard;
