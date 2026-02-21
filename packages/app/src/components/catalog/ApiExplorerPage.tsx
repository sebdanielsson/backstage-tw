import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '@backstage/core-plugin-api';
import {
  catalogApiRef,
  useStarredEntities,
} from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import {
  Star,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { cn } from '../../lib/utils';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const API_TYPES = [
  { value: '', label: 'All types' },
  { value: 'openapi', label: 'OpenAPI' },
  { value: 'asyncapi', label: 'AsyncAPI' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'grpc', label: 'gRPC' },
] as const;

const PAGE_SIZE = 20;

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function entityHref(entity: Entity): string {
  const kind = entity.kind.toLowerCase();
  const ns = (entity.metadata.namespace ?? 'default').toLowerCase();
  const name = entity.metadata.name;
  return `/catalog/${ns}/${kind}/${name}`;
}

function entityRef(entity: Entity): string {
  return `${entity.kind}:${entity.metadata.namespace ?? 'default'}/${entity.metadata.name}`.toLowerCase();
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function ApiExplorerPage() {
  const catalogApi = useApi(catalogApiRef);
  const { toggleStarredEntity, isStarredEntity } = useStarredEntities();

  const [entities, setEntities] = useState<Entity[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [apiType, setApiType] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const searchTerm = useDebouncedValue(searchInput, 300);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const filter: Record<string, string> = { kind: 'API' };
        if (apiType) filter['spec.type'] = apiType;

        const response = await catalogApi.queryEntities({
          filter,
          limit: PAGE_SIZE,
          offset,
          ...(searchTerm ? { fullTextFilter: { term: searchTerm } } : {}),
          orderFields: [{ field: 'metadata.name', order: 'asc' as const }],
        });
        if (!cancelled) {
          setEntities(response.items);
          setTotalItems(response.totalItems);
        }
      } catch (err) {
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [catalogApi, apiType, searchTerm, offset]);

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">APIs</h1>
        <p className="text-sm text-muted-foreground">
          Explore and discover APIs across your organization.
        </p>
      </div>

      <Separator />

      {/* Filters row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        {/* API type pills */}
        <div className="flex flex-wrap gap-1">
          {API_TYPES.map(opt => (
            <button
              key={opt.value}
              onClick={() => {
                setApiType(opt.value);
                setOffset(0);
              }}
              className={cn(
                'inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                apiType === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search APIs…"
            value={searchInput}
            onChange={e => {
              setSearchInput(e.target.value);
              setOffset(0);
            }}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 pl-9 pr-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                setOffset(0);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="size-10 text-destructive/50 mb-3" />
          <p className="text-sm text-destructive font-medium">
            Failed to load APIs
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {error.message}
          </p>
        </div>
      )}

      {!loading && !error && entities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <Search className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            {searchTerm
              ? `No APIs found matching "${searchTerm}"`
              : 'No APIs found'}
          </p>
        </div>
      )}

      {!loading && !error && entities.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">
            {totalItems} result{totalItems !== 1 ? 's' : ''}
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Name</TableHead>
                <TableHead>System</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Lifecycle</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Description
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entities.map(entity => {
                const ref = entityRef(entity);
                const starred = isStarredEntity(ref);
                const spec = entity.spec as Record<string, unknown> | undefined;
                return (
                  <TableRow key={ref}>
                    <TableCell>
                      <button
                        onClick={() => toggleStarredEntity(ref)}
                        className="text-muted-foreground hover:text-yellow-500 transition-colors"
                      >
                        <Star
                          className={cn(
                            'size-4',
                            starred && 'fill-yellow-500 text-yellow-500',
                          )}
                        />
                      </button>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={entityHref(entity)}
                        className="font-medium text-sm hover:underline text-foreground"
                      >
                        {entity.metadata.title || entity.metadata.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {(spec?.system as string) ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {(spec?.owner as string) ?? '—'}
                    </TableCell>
                    <TableCell>
                      {spec?.type ? (
                        <Badge variant="outline" className="text-xs">
                          {spec.type as string}
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {spec?.lifecycle ? (
                        <Badge variant="secondary" className="text-xs">
                          {spec.lifecycle as string}
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-xs truncate">
                      {entity.metadata.description ?? '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                  disabled={offset === 0}
                  className="gap-1"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(offset + PAGE_SIZE)}
                  disabled={offset + PAGE_SIZE >= totalItems}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
