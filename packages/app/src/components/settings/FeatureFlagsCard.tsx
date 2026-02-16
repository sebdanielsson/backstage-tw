import React from 'react';
import {
  useApi,
  featureFlagsApiRef,
  FeatureFlagState,
} from '@backstage/core-plugin-api';
import { Search, Flag } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';

/**
 * Feature flags card. Lists all registered feature flags with
 * toggle switches to enable/disable them.
 */
export function FeatureFlagsCard() {
  const featureFlagsApi = useApi(featureFlagsApiRef);
  const flags = featureFlagsApi.getRegisteredFlags();

  const [search, setSearch] = React.useState('');
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  // Filter flags by search term
  const filtered = flags.filter(
    f =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.description?.toLowerCase().includes(search.toLowerCase()),
  );

  // Sort active flags to the top
  const sorted = [...filtered].sort((a, b) => {
    const aActive = featureFlagsApi.isActive(a.name) ? 0 : 1;
    const bActive = featureFlagsApi.isActive(b.name) ? 0 : 1;
    return aActive - bActive;
  });

  const handleToggle = (flagName: string) => {
    const newState = featureFlagsApi.isActive(flagName)
      ? FeatureFlagState.None
      : FeatureFlagState.Active;

    featureFlagsApi.save({
      states: { [flagName]: newState },
      merge: true,
    });

    forceUpdate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Flags</CardTitle>
        <CardDescription>
          Toggle experimental features on or off
        </CardDescription>
      </CardHeader>
      <CardContent>
        {flags.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Flag className="size-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              No feature flags registered.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Feature flags can be registered by plugins or in the app.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {flags.length >= 10 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search feature flags..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            )}

            <div className="space-y-1">
              {sorted.map((flag, index) => {
                const isActive = featureFlagsApi.isActive(flag.name);
                return (
                  <React.Fragment key={flag.name}>
                    {index > 0 && <Separator />}
                    <div className="flex items-center justify-between py-3">
                      <div className="space-y-0.5 pr-4">
                        <Label
                          htmlFor={`flag-${flag.name}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {flag.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {flag.description ||
                            (flag.pluginId === ''
                              ? 'Registered in application'
                              : `Registered in plugin "${flag.pluginId}"`)}
                        </p>
                      </div>
                      <Switch
                        id={`flag-${flag.name}`}
                        checked={isActive}
                        onCheckedChange={() => handleToggle(flag.name)}
                      />
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {search && sorted.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No flags matching "{search}"
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
