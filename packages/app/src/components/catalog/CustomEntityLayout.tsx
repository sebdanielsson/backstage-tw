import React, { PropsWithChildren, useMemo } from 'react';
import {
  useNavigate,
  useLocation,
  useParams,
  useRoutes,
  matchRoutes,
} from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { useElementFilter } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { EntityLayout } from '@backstage/plugin-catalog';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

/**
 * Component data key used by EntityLayout.Route to mark itself as a valid
 * child of EntityLayout. We use the same key so that `useElementFilter` can
 * discover the routes declared via `<EntityLayout.Route>`.
 */
const ROUTE_DATA_KEY = 'plugin.catalog.entityLayoutRoute';

interface ExtractedRoute {
  path: string;
  title: string;
  children: React.ReactNode;
}

/**
 * Drop-in replacement for `EntityLayout` from `@backstage/plugin-catalog`.
 *
 * Differences:
 * - Renders shadcn Tabs instead of MUI HeaderTabs
 * - Does NOT wrap content in Backstage `<Page>` / `<Content>` (avoids double
 *   scrollbar when nested inside our Root layout)
 * - Does NOT render the Backstage page header (we render our own in Root.tsx)
 */
export function CustomEntityLayout({ children }: PropsWithChildren<{}>) {
  const { entity } = useEntity();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const params = useParams();

  // Extract routes from <EntityLayout.Route> children using the same
  // component-data introspection that the original EntityLayout uses.
  const routes: ExtractedRoute[] = useElementFilter(
    children,
    elements =>
      elements
        .selectByComponentData({ key: ROUTE_DATA_KEY })
        .getElements()
        .flatMap(({ props }: any) => {
          if (props.if && !props.if(entity)) return [];
          return [
            {
              path: props.path as string,
              title: props.title as string,
              children: props.children as React.ReactNode,
            },
          ];
        }),
    [entity],
  );

  // Build React Router route objects for sub-route rendering
  const routeObjects: RouteObject[] = useMemo(
    () =>
      routes.map(r => ({
        path: r.path === '/' ? '*' : `${r.path.replace(/^\//, '')}/*`,
        element: r.children,
      })),
    [routes],
  );

  // Render the matched sub-route content
  const element = useRoutes(routeObjects);

  // Compute the entity base path (everything before the sub-route portion)
  const subPath = params['*'] || '';
  const basePath = subPath
    ? pathname.slice(0, pathname.lastIndexOf(subPath))
    : pathname.endsWith('/')
      ? pathname
      : `${pathname}/`;

  // Determine which tab is currently active
  const matchedRoutes = matchRoutes(routeObjects, `/${subPath}`);
  let selectedIndex = 0;
  if (matchedRoutes?.length) {
    const matchedPath = matchedRoutes[0].route.path;
    const idx = routeObjects.findIndex(r => r.path === matchedPath);
    if (idx >= 0) selectedIndex = idx;
  }

  const selectedRoute = routes[selectedIndex];

  const handleTabChange = (value: string) => {
    const tabPath = value === '/' ? '' : value.replace(/^\//, '');
    navigate(`${basePath}${tabPath}`);
  };

  return (
    <div className="flex flex-col">
      <Tabs
        value={selectedRoute?.path || '/'}
        onValueChange={handleTabChange}
      >
        <TabsList
          variant="line"
          className="w-full justify-start border-b border-border"
        >
          {routes.map(route => (
            <TabsTrigger key={route.path} value={route.path}>
              {route.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="pt-6">{element}</div>
    </div>
  );
}

// Re-export Route from the original EntityLayout so existing
// <EntityLayout.Route> declarations continue to work unchanged.
CustomEntityLayout.Route = EntityLayout.Route;
