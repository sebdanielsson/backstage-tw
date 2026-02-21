import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '@backstage/core-plugin-api';
import {
  catalogApiRef,
  useStarredEntities,
} from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import {
  Search,
  Star,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Blocks,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 24;

const TYPE_FILTERS = [
  { value: '', label: 'All' },
  { value: 'service', label: 'Service' },
  { value: 'website', label: 'Website' },
  { value: 'library', label: 'Library' },
  { value: 'other', label: 'Other' },
] as const;

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function entityRef(entity: Entity): string {
  return `${entity.kind}:${entity.metadata.namespace ?? 'default'}/${entity.metadata.name}`.toLowerCase();
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function ScaffolderPage() {
  const catalogApi = useApi(catalogApiRef);
  const { toggleStarredEntity, isStarredEntity } = useStarredEntities();

  const [templates, setTemplates] = useState<Entity[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [typeFilter, setTypeFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const searchTerm = useDebouncedValue(searchInput, 300);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const filter: Record<string, string> = { kind: 'Template' };
        if (typeFilter) filter['spec.type'] = typeFilter;

        const response = await catalogApi.queryEntities({
          filter,
          limit: PAGE_SIZE,
          offset,
          ...(searchTerm ? { fullTextFilter: { term: searchTerm } } : {}),
          orderFields: [{ field: 'metadata.name', order: 'asc' as const }],
        });
        if (!cancelled) {
          setTemplates(response.items);
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
  }, [catalogApi, typeFilter, searchTerm, offset]);

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="p-6 w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Blocks className="size-5" />
          <h1 className="text-xl font-semibold tracking-tight">
            Create a new component
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose a template to create a new software component.
        </p>
      </div>

      <Separator />

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        {/* Type pills */}
        <div className="flex flex-wrap gap-1">
          {TYPE_FILTERS.map(t => (
            <button
              key={t.value}
              onClick={() => {
                setTypeFilter(t.value);
                setOffset(0);
              }}
              className={cn(
                'inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                typeFilter === t.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search templates…"
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
            Failed to load templates
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {error.message}
          </p>
        </div>
      )}

      {!loading && !error && templates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <Blocks className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            {searchTerm
              ? `No templates found matching "${searchTerm}"`
              : 'No templates found'}
          </p>
        </div>
      )}

      {!loading && !error && templates.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">
            {totalItems} template{totalItems !== 1 ? 's' : ''}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => {
              const ref = entityRef(template);
              const starred = isStarredEntity(ref);
              const spec = template.spec as
                | Record<string, unknown>
                | undefined;
              const templateType = (spec?.type as string) ?? '';

              return (
                <Card
                  key={ref}
                  className="group relative transition-colors hover:bg-accent/50 border-border"
                >
                  {/* Star button */}
                  <button
                    onClick={e => {
                      e.preventDefault();
                      toggleStarredEntity(ref);
                    }}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-yellow-500 transition-colors z-10"
                  >
                    <Star
                      className={cn(
                        'size-4',
                        starred && 'fill-yellow-500 text-yellow-500',
                      )}
                    />
                  </button>

                  <CardContent className="py-5 space-y-3">
                    {/* Header */}
                    <div className="space-y-1 pr-8">
                      <h3 className="text-sm font-semibold truncate">
                        {template.metadata.title ||
                          template.metadata.name}
                      </h3>
                      {template.metadata.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {template.metadata.description}
                        </p>
                      )}
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {templateType && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] capitalize"
                        >
                          {templateType}
                        </Badge>
                      )}
                      {(spec?.owner as string) && (
                        <span className="text-[10px] text-muted-foreground">
                          by {spec!.owner as string}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {template.metadata.tags &&
                      template.metadata.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {template.metadata.tags
                            .slice(0, 4)
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

                    {/* Action */}
                    <div className="pt-1">
                      <Button asChild size="sm" className="w-full">
                        <Link
                          to={`/create/templates/${template.metadata.namespace ?? 'default'}/${template.metadata.name}`}
                        >
                          Choose
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
