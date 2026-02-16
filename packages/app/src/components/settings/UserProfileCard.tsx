import { useApi, identityApiRef } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import { LogOut, User } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

/**
 * User profile card showing avatar, name, email, entity ref,
 * and a sign-out button. Uses Backstage's identityApiRef.
 */
export function UserProfileCard() {
  const identityApi = useApi(identityApiRef);

  const { value, loading } = useAsync(async () => {
    const [profile, identity] = await Promise.all([
      identityApi.getProfileInfo(),
      identityApi.getBackstageIdentity(),
    ]);
    return { profile, identity };
  }, [identityApi]);

  const profile = value?.profile;
  const identity = value?.identity;

  const displayName =
    profile?.displayName ?? identity?.userEntityRef ?? 'Guest';
  const initials = displayName
    .split(/[\s@]+/)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase() ?? '')
    .join('');

  const handleSignOut = async () => {
    await identityApi.signOut();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your user identity and profile info</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-muted animate-pulse" />
              <div className="h-3 w-48 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-12">
                {profile?.picture && (
                  <AvatarImage src={profile.picture} alt={displayName} />
                )}
                <AvatarFallback>
                  {initials || <User className="size-5" />}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <p className="text-sm font-medium leading-none">
                  {displayName}
                </p>
                {profile?.email && (
                  <p className="text-sm text-muted-foreground">
                    {profile.email}
                  </p>
                )}
              </div>
            </div>

            {identity?.userEntityRef && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Entity Ref
                    </span>
                    <span className="text-sm font-mono">
                      {identity.userEntityRef}
                    </span>
                  </div>
                  {identity.ownershipEntityRefs &&
                    identity.ownershipEntityRefs.length > 0 && (
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-sm text-muted-foreground shrink-0">
                          Ownership
                        </span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {identity.ownershipEntityRefs.map(ref => (
                            <span
                              key={ref}
                              className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-mono"
                            >
                              {ref}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </>
            )}

            <Separator />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
