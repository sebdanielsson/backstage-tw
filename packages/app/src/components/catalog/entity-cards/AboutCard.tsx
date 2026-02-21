import { useEntity } from '@backstage/plugin-catalog-react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { entityRouteRef } from '@backstage/plugin-catalog-react';
import {
  RELATION_OWNED_BY,
  RELATION_PART_OF,
} from '@backstage/catalog-model';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { getEntityRelations } from '@backstage/plugin-catalog-react';

export function AboutCard() {
  const { entity } = useEntity();
  const entityRoute = useRouteRef(entityRouteRef);

  const spec = entity.spec as Record<string, unknown> | undefined;
  const metadata = entity.metadata;

  const description = metadata.description || 'No description';
  const type = spec?.type as string | undefined;
  const lifecycle = spec?.lifecycle as string | undefined;
  const tags = metadata.tags ?? [];
  const labels = metadata.labels ?? {};

  const ownerRelations = getEntityRelations(entity, RELATION_OWNED_BY);
  const systemRelations = getEntityRelations(entity, RELATION_PART_OF, {
    kind: 'system',
  });
  const domainRelations = getEntityRelations(entity, RELATION_PART_OF, {
    kind: 'domain',
  });

  const rows: { label: string; value: React.ReactNode }[] = [];

  if (description) {
    rows.push({ label: 'Description', value: description });
  }

  if (ownerRelations.length > 0) {
    rows.push({
      label: 'Owner',
      value: (
        <div className="flex flex-wrap gap-1">
          {ownerRelations.map(r => (
            <a
              key={`${r.kind}:${r.namespace}/${r.name}`}
              href={entityRoute({ kind: r.kind, namespace: r.namespace, name: r.name })}
              className="text-primary hover:underline"
            >
              {r.name}
            </a>
          ))}
        </div>
      ),
    });
  }

  if (systemRelations.length > 0) {
    rows.push({
      label: 'System',
      value: (
        <div className="flex flex-wrap gap-1">
          {systemRelations.map(r => (
            <a
              key={`${r.kind}:${r.namespace}/${r.name}`}
              href={entityRoute({ kind: r.kind, namespace: r.namespace, name: r.name })}
              className="text-primary hover:underline"
            >
              {r.name}
            </a>
          ))}
        </div>
      ),
    });
  }

  if (domainRelations.length > 0) {
    rows.push({
      label: 'Domain',
      value: (
        <div className="flex flex-wrap gap-1">
          {domainRelations.map(r => (
            <a
              key={`${r.kind}:${r.namespace}/${r.name}`}
              href={entityRoute({ kind: r.kind, namespace: r.namespace, name: r.name })}
              className="text-primary hover:underline"
            >
              {r.name}
            </a>
          ))}
        </div>
      ),
    });
  }

  if (type) {
    rows.push({ label: 'Type', value: type });
  }

  if (lifecycle) {
    rows.push({ label: 'Lifecycle', value: lifecycle });
  }

  if (Object.keys(labels).length > 0) {
    rows.push({
      label: 'Labels',
      value: (
        <div className="flex flex-wrap gap-1">
          {Object.entries(labels).map(([k, v]) => (
            <Badge key={k} variant="secondary" className="text-xs">
              {k}: {v}
            </Badge>
          ))}
        </div>
      ),
    });
  }

  if (tags.length > 0) {
    rows.push({
      label: 'Tags',
      value: (
        <div className="flex flex-wrap gap-1">
          {tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      ),
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">About</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <dl className="space-y-3">
          {rows.map(row => (
            <div key={row.label}>
              <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {row.label}
              </dt>
              <dd className="mt-0.5 text-sm">{row.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
