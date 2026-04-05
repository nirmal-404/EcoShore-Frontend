import { useState } from 'react';
import { useAgents } from '@/hooks/agent.js';
import { useAssignAgent } from '@/hooks/events.js';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, User } from 'lucide-react';
import { toast } from 'sonner';

function AssignAgentModal({ eventId, beachId, eventTitle, onClose, isOpen }) {
  const { data: agentsData, isLoading: isLoadingAgents } = useAgents();
  const { mutate: assignAgent, isPending: isAssigning } = useAssignAgent();
  const [selectedAgentId, setSelectedAgentId] = useState(null);

  // Filter agents by beach
  const beachAgents =
    agentsData?.data?.agents?.filter(
      (agent) => agent.assignedBeach && agent.assignedBeach.id === beachId
    ) || [];

  const handleAssign = () => {
    if (!selectedAgentId) {
      toast.error('Please select an agent');
      return;
    }

    assignAgent(
      { eventId, agentId: selectedAgentId },
      {
        onSuccess: () => {
          toast.success('Agent assigned successfully');
          setSelectedAgentId(null);
          onClose();
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message || 'Failed to assign agent'
          );
        },
      }
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="overflow-auto">
        <SheetHeader>
          <SheetTitle>Assign Agent to Event</SheetTitle>
          <SheetDescription>
            Select an agent for &quot;{eventTitle}&quot; from the available
            agents assigned to this beach.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          {isLoadingAgents ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : beachAgents.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No agents assigned to this beach
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {beachAgents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`
                    p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${
                      selectedAgentId === agent.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 rounded-lg bg-primary/10">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{agent.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {agent.email}
                      </p>
                      {agent.assignedBeach && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            📍 {agent.assignedBeach.name}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="mt-1">
                      <div
                        className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center
                          ${
                            selectedAgentId === agent.id
                              ? 'border-primary bg-primary'
                              : 'border-border'
                          }
                        `}
                      >
                        {selectedAgentId === agent.id && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={isAssigning}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={
              !selectedAgentId || isAssigning || beachAgents.length === 0
            }
          >
            {isAssigning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign Agent'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default AssignAgentModal;
