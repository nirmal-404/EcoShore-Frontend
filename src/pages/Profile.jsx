import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useChangePassword, useDeleteAccount } from '@/hooks/userProfile';
import { logout } from '@/store/authSlice';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAlert from '@/components/common/Alert';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { ShieldAlert, KeyRound, User } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { mutate: changePassword, isPending: isChangingPassword } =
    useChangePassword();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    changePassword(
      {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      },
      {
        onSuccess: () => {
          toast.success('Password updated successfully');
          setPasswords({
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.error || 'Failed to update password'
          );
        },
      }
    );
  };

  const handleDeleteAccount = () => {
    deleteAccount(undefined, {
      onSuccess: () => {
        toast.success('Account deleted successfully');
        dispatch(logout());
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to delete account');
      },
    });
  };

  if (!user) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Profile Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account preferences and security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Info Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {user.name || 'User'}
                  </CardTitle>
                  <CardDescription className="uppercase text-xs font-bold tracking-wider mt-1">
                    {user.role}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-1">
                    Email
                  </span>
                  <p className="font-medium">{user.email}</p>
                </div>
                {user.phone && (
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-1">
                      Phone
                    </span>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                )}
                {user.address && (
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-1">
                      Address
                    </span>
                    <p className="font-medium">{user.address}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Main Area */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Current Password</Label>
                  <Input
                    type="password"
                    id="oldPassword"
                    value={passwords.oldPassword}
                    onChange={(e) =>
                      setPasswords((p) => ({
                        ...p,
                        oldPassword: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      type="password"
                      id="newPassword"
                      value={passwords.newPassword}
                      onChange={(e) =>
                        setPasswords((p) => ({
                          ...p,
                          newPassword: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      type="password"
                      id="confirmPassword"
                      value={passwords.confirmPassword}
                      onChange={(e) =>
                        setPasswords((p) => ({
                          ...p,
                          confirmPassword: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="mt-2"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated personal
                data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <Button
                variant="destructive"
                className="text-background"
                onClick={(e) => {
                  e.preventDefault();
                  setIsDeleteDialogOpen(true);
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <CustomAlert
        openAlertDialog={isDeleteDialogOpen}
        setOpenAlertDialog={setIsDeleteDialogOpen}
        title="Are you absolutely sure?"
        descrption="This action cannot be undone. This will permanently delete your account and remove your personal data from our active servers."
        closeBtnTxt="Cancel"
        okBtnTxt="Yes, delete my account"
        action={handleDeleteAccount}
      />
    </div>
  );
}
