import { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import { AppSidebar } from '../app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '../ui/sidebar';
import { Separator } from '../ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '../ui/breadcrumb';

const routeLabels: Record<string, string> = {
  '/catalog': 'Home',
  '/api-docs': 'APIs',
  '/docs': 'Docs',
  '/create': 'Create',
  '/search': 'Search',
  '/settings': 'Settings',
  '/notifications': 'Notifications',
  '/catalog-import': 'Import',
  '/catalog-graph': 'Graph',
};

function getPageLabel(pathname: string): string {
  // Check exact matches first
  if (routeLabels[pathname]) return routeLabels[pathname];
  // Check prefix matches (e.g. /catalog/default/component/foo)
  for (const [route, label] of Object.entries(routeLabels)) {
    if (pathname.startsWith(route)) return label;
  }
  return 'Backstage';
}

export const Root = ({ children }: PropsWithChildren<{}>) => {
  const location = useLocation();
  const pageLabel = getPageLabel(location.pathname);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header data-shadcn-header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{pageLabel}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
