import { useApi, configApiRef } from '@backstage/core-plugin-api';
import {
  googleAuthApiRef,
  microsoftAuthApiRef,
  githubAuthApiRef,
  gitlabAuthApiRef,
  oktaAuthApiRef,
  bitbucketAuthApiRef,
  oneloginAuthApiRef,
  atlassianAuthApiRef,
  bitbucketServerAuthApiRef,
} from '@backstage/core-plugin-api';
import type {
  ApiRef,
  ProfileInfoApi,
  SessionApi,
} from '@backstage/core-plugin-api';
import { useApi as useApiSafe } from '@backstage/core-plugin-api';
import { useObservable, useAsync } from 'react-use';
import { LogIn, LogOut, ShieldCheck } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

/** Provider config: maps config key → API ref + display info */
const PROVIDER_MAP: Record<
  string,
  {
    title: string;
    description: string;
    apiRef: ApiRef<ProfileInfoApi & SessionApi>;
  }
> = {
  google: {
    title: 'Google',
    description: 'Sign in with Google',
    apiRef: googleAuthApiRef,
  },
  microsoft: {
    title: 'Microsoft',
    description: 'Sign in with Microsoft',
    apiRef: microsoftAuthApiRef,
  },
  github: {
    title: 'GitHub',
    description: 'Sign in with GitHub',
    apiRef: githubAuthApiRef,
  },
  gitlab: {
    title: 'GitLab',
    description: 'Sign in with GitLab',
    apiRef: gitlabAuthApiRef,
  },
  okta: {
    title: 'Okta',
    description: 'Sign in with Okta',
    apiRef: oktaAuthApiRef,
  },
  bitbucket: {
    title: 'Bitbucket',
    description: 'Sign in with Bitbucket',
    apiRef: bitbucketAuthApiRef,
  },
  onelogin: {
    title: 'OneLogin',
    description: 'Sign in with OneLogin',
    apiRef: oneloginAuthApiRef,
  },
  atlassian: {
    title: 'Atlassian',
    description: 'Sign in with Atlassian',
    apiRef: atlassianAuthApiRef,
  },
  bitbucketServer: {
    title: 'Bitbucket Server',
    description: 'Sign in with Bitbucket Server',
    apiRef: bitbucketServerAuthApiRef,
  },
};

/**
 * Single auth provider row: shows session status, profile info,
 * and sign-in / sign-out buttons.
 */
function ProviderRow({
  title,
  description,
  apiRef,
}: {
  title: string;
  description: string;
  apiRef: ApiRef<ProfileInfoApi & SessionApi>;
}) {
  let api: (ProfileInfoApi & SessionApi) | undefined;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    api = useApiSafe(apiRef);
  } catch {
    // API not registered — provider configured but no factory
    return null;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const sessionState = useObservable(api.sessionState$(), undefined);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { value: profile } = useAsync(async () => {
    if (!api) return undefined;
    try {
      return await api.getProfile({ optional: true });
    } catch {
      return undefined;
    }
  }, [api, sessionState]);

  const isSignedIn = sessionState?.toString() === 'SignedIn';

  const handleSignIn = async () => {
    await api?.signIn();
  };

  const handleSignOut = async () => {
    await api?.signOut();
  };

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        {isSignedIn && profile?.picture ? (
          <Avatar className="size-9">
            <AvatarImage src={profile.picture} alt={title} />
            <AvatarFallback>{title[0]}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex size-9 items-center justify-center rounded-full bg-muted">
            <ShieldCheck className="size-4 text-muted-foreground" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{title}</p>
            {isSignedIn ? (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                Not connected
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isSignedIn && profile?.displayName
              ? `${profile.displayName}${
                  profile.email ? ` · ${profile.email}` : ''
                }`
              : description}
          </p>
        </div>
      </div>
      <div>
        {isSignedIn ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="gap-1.5"
          >
            <LogOut className="size-3.5" />
            Sign out
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignIn}
            className="gap-1.5"
          >
            <LogIn className="size-3.5" />
            Sign in
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Auth providers card. Lists all providers that are configured
 * in app-config under `auth.providers`.
 */
export function AuthProvidersCard() {
  const configApi = useApi(configApiRef);

  let configuredProviders: string[] = [];
  try {
    const providersConfig = configApi.getOptionalConfig('auth.providers');
    configuredProviders = providersConfig?.keys() ?? [];
  } catch {
    // no auth providers configured
  }

  // Filter to only providers we know about
  const providers = configuredProviders.filter(key => key in PROVIDER_MAP);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Providers</CardTitle>
        <CardDescription>
          Manage your connected authentication providers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {providers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ShieldCheck className="size-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              No authentication providers configured.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Authentication providers can be added in{' '}
              <code className="text-xs">app-config.yaml</code> under{' '}
              <code className="text-xs">auth.providers</code>.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {providers.map(key => {
              const provider = PROVIDER_MAP[key];
              return (
                <ProviderRow
                  key={key}
                  title={provider.title}
                  description={provider.description}
                  apiRef={provider.apiRef}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
