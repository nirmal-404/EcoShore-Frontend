import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonForm from '@/components/common/Form.jsx';
import { agentFormControls } from '@/config/index.js';
import { createAgent } from '@/api/agentApi.js';
import { useBeaches } from '@/hooks/beaches.js';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const initialFormData = {
  name: '',
  email: '',
  nic: '',
  assignedBeach: '',
};

export default function AgentRegister() {
  const [formData, setFormData] = useState(initialFormData);
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formControls, setFormControls] = useState(agentFormControls);
  const navigate = useNavigate();

  // Fetch beaches using the hook (useQuery)
  const { data: beachesData, isLoading: beachesLoading } = useBeaches();

  // Update form controls with beaches options
  useEffect(() => {
    if (beachesData?.data) {
      const beachOptions = beachesData.data.map((beach) => ({
        id: beach._id || beach.id,
        label: `${beach.name} (${beach.assignedAgents?.length || 0} agents)`,
      }));

      setFormControls(
        agentFormControls.map((control) =>
          control.name === 'assignedBeach'
            ? { ...control, options: beachOptions }
            : control
        )
      );
    }
  }, [beachesData]);

  async function onSubmit(e) {
    e.preventDefault();
    setIsError(false);
    setError(null);
    setIsSuccess(false);

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.nic ||
      !formData.assignedBeach
    ) {
      setIsError(true);
      setError({
        response: { data: { error: 'Please fill in all required fields.' } },
      });
      return;
    }

    setIsPending(true);

    try {
      const response = await createAgent({
        name: formData.name,
        email: formData.email,
        nic: formData.nic,
        assignedBeach: formData.assignedBeach,
      });

      setIsSuccess(true);
      setFormData(initialFormData);

      // Redirect to user management after 2 seconds
      setTimeout(() => {
        navigate('/usermanagement', { replace: true });
      }, 2000);
    } catch (err) {
      setIsError(true);
      setError(err);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/usermanagement')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Register New Agent</h1>
      </div>

      {/* Content Card */}
      <div className="max-w-md mx-auto bg-white shadow-md rounded-2xl p-6">
        <p className="text-gray-600 text-sm mb-6">
          Fill in the form below to create a new agent account.
        </p>

        {/* Loading Beaches */}
        {beachesLoading && (
          <p className="text-center text-gray-500 mb-4">Loading beaches...</p>
        )}

        {/* Form */}
        <CommonForm
          formControls={formControls}
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
          isBtnDisabled={isPending || beachesLoading}
          buttonText={isPending ? 'Creating Agent...' : 'Create Agent'}
        />

        {/* Success Message */}
        {isSuccess && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-2xl text-center">
            <p className="text-sm font-medium text-green-600">
              ✓ Agent created successfully! Redirecting...
            </p>
          </div>
        )}

        {/* Error Message */}
        {isError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-center">
            <p className="text-sm font-medium text-red-600">
              {error?.response?.data?.error ||
                error?.message ||
                'Failed to create agent. Please try again.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
