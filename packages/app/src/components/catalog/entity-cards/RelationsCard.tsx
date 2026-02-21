import { Entity, parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';
import {
  useEntity,
  useRelatedEntities,
  entityRouteRef,
  catalogApiRef,
} from '@backstage/plugin-catalog-react';
import { useRouteRef, useApi } from '@backstage/core-plugin-api';
import { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Badge } from '../../ui/badge';

interface RelationsCardProps {
  title: string;
  /** If omitted, shows ALL relations from the entity. */
  relationType?: string;
  kind?: string;
  columns?: ColumnDef[];
  emptyMessage?: string;
}

interface ColumnDef {
  header: string;
  value: (entity: Entity) => React.ReactNode;
}

const defaultColumns: ColumnDef[] = [
  {
    header: 'Name',
    value: (entity: Entity) => entity.metadata.name,
  },
  {
    header: 'Kind',
    value: (entity: Entity) => entity.kind,
  },
  {
    header: 'Type',
    value: (entity: Entity) => {
      const type = (entity.spec as Record<string, unknown>)?.type as
        | string
        | undefined;
      return type ? (
        <Badge variant="secondary" className="text-xs">
          {type}
        </Badge>
      ) : (
        '—'
      );
    },
  },
  {
    header: 'Description',
    value: (entity: Entity) => entity.metadata.description || '—',
  },
];

/* ------------------------------------------------------------------ */
/*  Internal hook: resolve ALL entity.relations into full Entity objs  */
/* ------------------------------------------------------------------ */
function useAllRelatedEntities(entity: Entity, kindFilter?: string) {
  const catalogApi = useApi(catalogApiRef);
  const [entities, setEntities] = useState<Entity[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  const refs = useMemo(() => {
    const seen = new Set<string>();
    return (entity.relations ?? [])
      .map(r => r.targetRef)
      .filter(ref => {
        if (seen.has(ref)) return false;
        seen.add(ref);
        if (!kindFilter) return true;
        try {
          const parsed = parseEntityRef(ref);
          return parsed.kind.toLowerCase() === kindFilter.toLowerCase();
        } catch {
          return true;
        }
      });
  }, [entity.relations, kindFilter]);

  useEffect(() => {
    if (refs.length === 0) {
      setEntities([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all(
      refs.map(ref =>
        catalogApi.getEntityByRef(ref).catch(() => undefined),
      ),
    ).then(results => {
      if (!cancelled) {
        setEntities(results.filter((e): e is Entity => e !== undefined));
        setLoading(false);
      }
    }).catch(err => {
      if (!cancelled) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [refs, catalogApi]);

  return { entities, loading, error };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function RelationsCard({
  title,
  relationType,
  kind,
  columns = defaultColumns,
  emptyMessage = 'No entities found',
}: RelationsCardProps) {
  const { entity } = useEntity();
  const entityRoute = useRouteRef(entityRouteRef);

  // When a specific relationType is given, use the Backstage hook (faster, cached).
  // When omitted, resolve all relations ourselves.
  const filtered = useRelatedEntities(entity, {
    type: relationType ?? '',
    kind,
  });
  const all = useAllRelatedEntities(entity, kind);

  const { entities, loading, error } = relationType ? filtered : all;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && (
          <p className="text-sm text-destructive">
            Failed to load: {error.message}
          </p>
        )}
        {!loading && !error && (!entities || entities.length === 0) && (
          <p className="text-sm text-muted-foreground py-4">{emptyMessage}</p>
        )}
        {!loading && !error && entities && entities.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(col => (
                  <TableHead key={col.header}>{col.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entities.map(e => {
                const ref = stringifyEntityRef(e);
                return (
                  <TableRow key={ref}>
                    {columns.map((col, i) => (
                      <TableCell key={col.header}>
                        {i === 0 ? (
                          <a
                            href={entityRoute({
                              kind: e.kind,
                              namespace:
                                e.metadata.namespace || 'default',
                              name: e.metadata.name,
                            })}
                            className="text-primary hover:underline font-medium"
                          >
                            {col.value(e)}
                          </a>
                        ) : (
                          col.value(e)
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
