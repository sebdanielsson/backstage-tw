import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '@backstage/core-plugin-api';
import {
  catalogApiRef,
  CATALOG_FILTER_EXISTS,
} from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import {
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 20;

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function docsHref(entity: Entity): string {
  const kind = entity.kind.toLowerCase();
  const ns = (entity.metadata.namespace ?? 'default').toLowerCase();
  const name = entity.metadata.name;
  return `/docs/${ns}/${kind}/${name}`;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function TechDocsIndexPage() {
  const catalogApi = useApi(catalogApiRef);

  const [entities, setEntities] = useState<Entity[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const searchTerm = useDebouncedValue(searchInput, 300);
  const [offset, setOffset] = useState(0);
  const [kindFilter, setKindFilter] = useState('');

  const KINDS = ['', 'Component', 'API', 'System'] as const;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const filter: Record<string, string | symbol> = {
          'metadata.annotations.backstage.io/techdocs-ref':
            CATALOG_FILTER_EXISTS,
        };
        if (kindFilter) filter.kind = kindFilter;

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
  }, [catalogApi, kindFilter, searchTerm, offset]);

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="p-6 w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <FileText className="size-5" />
          <h1 className="text-xl font-semibold tracking-tight">
            Documentation
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Browse technical documentation for your organization's software.
        </p>
      </div>

      <Separator />

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        {/* Kind pills */}
        <div className="flex flex-wrap gap-1">
          {KINDS.map(k => (
            <button
              key={k}
              onClick={() => {
                setKindFilter(k);
                setOffset(0);
              }}
              className={cn(
                'inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                kindFilter === k
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {k || 'All'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documentation…"
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
            Failed to load documentation
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {error.message}
          </p>
        </div>
      )}

      {!loading && !error && entities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            {searchTerm
              ? `No documentation found matching "${searchTerm}"`
              : 'No documented entities found'}
          </p>
        </div>
      )}

      {!loading && !error && entities.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">
            {totalItems} result{totalItems !== 1 ? 's' : ''}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {entities.map(entity => {
              const spec = entity.spec as
                | Record<string, unknown>
                | undefined;
              return (
                <Link
                  key={`${entity.kind}:${entity.metadata.namespace ?? 'default'}/${entity.metadata.name}`}
                  to={docsHref(entity)}
                  className="group"
                >
                  <Card className="h-full transition-colors group-hover:bg-accent/50 border-border">
                    <CardContent className="py-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <FileText className="size-4 text-muted-foreground shrink-0" />
                          <h3 className="text-sm font-medium group-hover:underline truncate">
                            {entity.metadata.title ||
                              entity.metadata.name}
                          </h3>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] shrink-0"
                        >
                          {entity.kind}
                        </Badge>
                      </div>

                      {entity.metadata.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {entity.metadata.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        {spec?.type ? (
                          <Badge
                            variant="secondary"
                            className="text-[10px]"
                          >
                            {String(spec.type)}
                          </Badge>
                        ) : null}
                        {spec?.owner ? (
                          <span className="text-[10px] text-muted-foreground">
                            {String(spec.owner)}
                          </span>
                        ) : null}
                      </div>

                      {entity.metadata.tags &&
                        entity.metadata.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {entity.metadata.tags
                              .slice(0, 3)
                              .map(tag => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {tag}
                                </Badge>
                              ))}
                          </div>
                        )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setOffset(Math.max(0, offset - PAGE_SIZE))
                  }
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
