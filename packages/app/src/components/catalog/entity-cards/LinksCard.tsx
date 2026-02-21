import { useEntity } from '@backstage/plugin-catalog-react';
import {
  ExternalLink,
  Globe,
  Users,
  HelpCircle,
  LayoutDashboard,
  Cloud,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

const iconMap: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  group: Users,
  help: HelpCircle,
  cloud: Cloud,
  docs: BookOpen,
  chat: MessageSquare,
  user: Users,
};

function getLinkIcon(icon?: string) {
  if (icon && iconMap[icon]) {
    const Icon = iconMap[icon];
    return <Icon className="h-4 w-4 shrink-0" />;
  }
  return <Globe className="h-4 w-4 shrink-0" />;
}

export function LinksCard() {
  const { entity } = useEntity();
  const links = entity.metadata.links ?? [];

  if (links.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Links</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">No links defined</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Links</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors group"
            >
              {getLinkIcon(link.icon)}
              <span className="truncate">{link.title || link.url}</span>
              <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-50 transition-opacity ml-auto" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
