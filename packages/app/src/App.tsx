import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import {
  apiDocsPlugin,
  ApiExplorerPage as PluginApiExplorerPage,
} from '@backstage/plugin-api-docs';
import {
  CatalogEntityPage,
  CatalogIndexPage as PluginCatalogIndexPage,
  catalogPlugin,
} from '@backstage/plugin-catalog';
import {
  CatalogImportPage,
  catalogImportPlugin,
} from '@backstage/plugin-catalog-import';
import { scaffolderPlugin, ScaffolderPage } from '@backstage/plugin-scaffolder';
import { orgPlugin } from '@backstage/plugin-org';
import { SearchPage } from '@backstage/plugin-search';
import {
  techdocsPlugin,
  TechDocsIndexPage as PluginTechDocsIndexPage,
  TechDocsReaderPage,
} from '@backstage/plugin-techdocs';
import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
import { ReportIssue } from '@backstage/plugin-techdocs-module-addons-contrib';
import {
  NotificationsPage as PluginNotificationsPage,
} from '@backstage/plugin-notifications';
import { apis } from './apis';
import { entityPage } from './components/catalog/EntityPage';
import { searchPage } from './components/search/SearchPage';
import { Root } from './components/Root';
import { SettingsPage } from './components/settings/SettingsPage';
import { CatalogIndexPage } from './components/catalog/CatalogIndexPage';
import { ApiExplorerPage } from './components/catalog/ApiExplorerPage';
import { NotificationsPage } from './components/notifications/NotificationsPage';
import { TechDocsIndexPage } from './components/techdocs/TechDocsIndexPage';

import {
  AlertDisplay,
  OAuthRequestDialog,
  SignInPage,
} from '@backstage/core-components';
import {
  attachComponentData,
  getComponentData,
} from '@backstage/core-plugin-api';
import { createApp } from '@backstage/app-defaults';
import { AppRouter, FlatRoutes } from '@backstage/core-app-api';
import { CatalogGraphPage } from '@backstage/plugin-catalog-graph';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import { SignalsDisplay } from '@backstage/plugin-signals';
import { UnifiedThemeProvider } from '@backstage/theme';
import LightModeIcon from '@material-ui/icons/WbSunny';
import DarkModeIcon from '@material-ui/icons/Brightness2';
import { shadcnLightTheme, shadcnDarkTheme } from './themes';

/**
 * Copy the 'core.mountPoint' route ref from original Backstage plugin pages
 * to our custom page components so that FlatRoutes can bind route refs
 * correctly (required for EntityLayout, breadcrumbs, cross-plugin links, etc.)
 */
function copyMountPoint(
  from: React.ComponentType<any>,
  to: React.ComponentType<any>,
) {
  const mountPoint = getComponentData(
    React.createElement(from),
    'core.mountPoint',
  );
  if (mountPoint) {
    attachComponentData(to, 'core.mountPoint', mountPoint);
  }
}

copyMountPoint(PluginCatalogIndexPage, CatalogIndexPage);
copyMountPoint(PluginApiExplorerPage, ApiExplorerPage);
copyMountPoint(PluginNotificationsPage, NotificationsPage);
copyMountPoint(PluginTechDocsIndexPage, TechDocsIndexPage);

const app = createApp({
  apis,
  themes: [
    {
      id: 'light',
      title: 'Light',
      variant: 'light',
      icon: <LightModeIcon />,
      Provider: ({ children }) => (
        <UnifiedThemeProvider theme={shadcnLightTheme} children={children} />
      ),
    },
    {
      id: 'dark',
      title: 'Dark',
      variant: 'dark',
      icon: <DarkModeIcon />,
      Provider: ({ children }) => (
        <UnifiedThemeProvider theme={shadcnDarkTheme} children={children} />
      ),
    },
  ],
  bindRoutes({ bind }) {
    bind(catalogPlugin.externalRoutes, {
      createComponent: scaffolderPlugin.routes.root,
      viewTechDoc: techdocsPlugin.routes.docRoot,
      createFromTemplate: scaffolderPlugin.routes.selectedTemplate,
    });
    bind(apiDocsPlugin.externalRoutes, {
      registerApi: catalogImportPlugin.routes.importPage,
    });
    bind(scaffolderPlugin.externalRoutes, {
      registerComponent: catalogImportPlugin.routes.importPage,
      viewTechDoc: techdocsPlugin.routes.docRoot,
    });
    bind(orgPlugin.externalRoutes, {
      catalogIndex: catalogPlugin.routes.catalogIndex,
    });
  },
  components: {
    SignInPage: props => <SignInPage {...props} auto providers={['guest']} />,
  },
});

const routes = (
  <FlatRoutes>
    <Route path="/" element={<Navigate to="catalog" />} />
    <Route path="/catalog" element={<CatalogIndexPage />} />
    <Route
      path="/catalog/:namespace/:kind/:name"
      element={<CatalogEntityPage />}
    >
      {entityPage}
    </Route>
    <Route path="/docs" element={<TechDocsIndexPage />} />
    <Route
      path="/docs/:namespace/:kind/:name/*"
      element={<TechDocsReaderPage />}
    >
      <TechDocsAddons>
        <ReportIssue />
      </TechDocsAddons>
    </Route>
    <Route path="/create" element={<ScaffolderPage />} />
    <Route path="/api-docs" element={<ApiExplorerPage />} />
    <Route
      path="/catalog-import"
      element={
        <RequirePermission permission={catalogEntityCreatePermission}>
          <CatalogImportPage />
        </RequirePermission>
      }
    />
    <Route path="/search" element={<SearchPage />}>
      {searchPage}
    </Route>
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/catalog-graph" element={<CatalogGraphPage />} />
    <Route path="/notifications" element={<NotificationsPage />} />
  </FlatRoutes>
);

export default app.createRoot(
  <>
    <AlertDisplay />
    <OAuthRequestDialog />
    <SignalsDisplay />
    <AppRouter>
      <Root>{routes}</Root>
    </AppRouter>
  </>,
);
