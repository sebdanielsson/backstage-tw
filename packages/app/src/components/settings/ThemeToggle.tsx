import { useApi, appThemeApiRef } from '@backstage/core-plugin-api';
import { useObservable } from 'react-use';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Theme toggle using Backstage's appThemeApi to switch between
 * registered themes. Renders a segmented control with icons.
 */
export function ThemeToggle() {
  const appThemeApi = useApi(appThemeApiRef);
  const activeThemeId = useObservable(
    appThemeApi.activeThemeId$(),
    appThemeApi.getActiveThemeId(),
  );

  const themes = appThemeApi.getInstalledThemes();

  // Map theme variant to icon
  const getIcon = (variant: string) => {
    switch (variant) {
      case 'light':
        return <Sun className="size-4" />;
      case 'dark':
        return <Moon className="size-4" />;
      default:
        return <Monitor className="size-4" />;
    }
  };

  // Build options: one per theme + auto
  const options = [
    ...themes.map(theme => ({
      id: theme.id,
      label: theme.title,
      icon: getIcon(theme.variant),
    })),
    {
      id: 'auto',
      label: 'Auto',
      icon: <Monitor className="size-4" />,
    },
  ];

  const selected = activeThemeId ?? 'auto';

  return (
    <div className="inline-flex items-center rounded-lg border bg-muted p-0.5">
      {options.map(option => (
        <button
          key={option.id}
          onClick={() =>
            appThemeApi.setActiveThemeId(
              option.id === 'auto' ? undefined : option.id,
            )
          }
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
            selected === option.id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}
