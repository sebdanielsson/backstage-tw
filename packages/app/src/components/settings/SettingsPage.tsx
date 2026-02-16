import { Settings, Palette, Shield, Flag } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Separator } from '../ui/separator';
import { ThemeToggle } from './ThemeToggle';
import { UserProfileCard } from './UserProfileCard';
import { AuthProvidersCard } from './AuthProvidersCard';
import { FeatureFlagsCard } from './FeatureFlagsCard';

/**
 * Custom Settings page built entirely with shadcn components.
 * Replaces the default Backstage UserSettingsPage.
 *
 * Uses Backstage APIs under the hood:
 * - appThemeApiRef (theme switching)
 * - identityApiRef (user profile & sign-out)
 * - configApiRef (auth provider discovery)
 * - featureFlagsApiRef (feature flag toggles)
 */
export function SettingsPage() {
  return (
    <div className="p-6 w-full max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Settings className="size-5" />
          <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general" className="gap-1.5">
            <Palette className="size-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="auth" className="gap-1.5">
            <Shield className="size-4" />
            Authentication
          </TabsTrigger>
          <TabsTrigger value="flags" className="gap-1.5">
            <Flag className="size-4" />
            Feature Flags
          </TabsTrigger>
        </TabsList>

        {/* General tab */}
        <TabsContent value="general">
          <div className="space-y-6">
            <UserProfileCard />

            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Theme</label>
                  <p className="text-xs text-muted-foreground">
                    Select which theme to use for the application
                  </p>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Auth Providers tab */}
        <TabsContent value="auth">
          <AuthProvidersCard />
        </TabsContent>

        {/* Feature Flags tab */}
        <TabsContent value="flags">
          <FeatureFlagsCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
