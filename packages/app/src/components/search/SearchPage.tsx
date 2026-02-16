import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@backstage/plugin-search-react';
import {
  Search as SearchIcon,
  FileText,
  Box,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import {
  Card,
  CardContent,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';

/* ------------------------------------------------------------------ */
/*  Type filter pills                                                  */
/* ------------------------------------------------------------------ */

const TYPE_OPTIONS = [
  { value: 'software-catalog', label: 'Software Catalog', icon: Box },
  { value: 'techdocs', label: 'Documentation', icon: FileText },
] as const;

function TypeFilters({
  active,
  onChange,
}: {
  active: string[];
  onChange: (types: string[]) => void;
}) {
  const toggle = (value: string) => {
    if (active.includes(value)) {
      onChange(active.filter(t => t !== value));
    } else {
      onChange([...active, value]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {TYPE_OPTIONS.map(opt => {
        const Icon = opt.icon;
        const isActive = active.length === 0 || active.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <Icon className="size-3.5" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Kind / Lifecycle filter selects                                    */
/* ------------------------------------------------------------------ */

function FilterSelect({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string;
  name: string;
  options: string[];
  value: string | undefined;
  onChange: (name: string, value: string | undefined) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <select
        value={value ?? ''}
        onChange={e => onChange(name, e.target.value || undefined)}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="">All</option>
        {options.map(opt => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Single result item                                                 */
/* ------------------------------------------------------------------ */

function ResultItem({
  result,
}: {
  result: {
    type: string;
    document: {
      title: string;
      text: string;
      location: string;
      kind?: string;
      lifecycle?: string;
      owner?: string;
      namespace?: string;
      [key: string]: unknown;
    };
  };
}) {
  const navigate = useNavigate();
  const { document, type } = result;

  const handleClick = () => {
    navigate(document.location);
  };

  const typeLabel =
    type === 'software-catalog'
      ? 'Catalog'
      : type === 'techdocs'
        ? 'Docs'
        : type;

  const kind = document.kind as string | undefined;
  const lifecycle = document.lifecycle as string | undefined;
  const owner = document.owner as string | undefined;

  return (
    <button
      onClick={handleClick}
      className="w-full text-left group"
    >
      <Card className="transition-colors group-hover:bg-accent/50 border-border">
        <CardContent className="py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-medium group-hover:underline truncate">
                  {document.title}
                </h3>
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  {typeLabel}
                </Badge>
                {kind && (
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {kind}
                  </Badge>
                )}
              </div>
              {document.text && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {document.text}
                </p>
              )}
              {(lifecycle || owner) && (
                <div className="flex items-center gap-3 pt-1">
                  {lifecycle && (
                    <span className="text-xs text-muted-foreground">
                      Lifecycle: {lifecycle}
                    </span>
                  )}
                  {owner && (
                    <span className="text-xs text-muted-foreground">
                      Owner: {owner}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Search Page                                                   */
/* ------------------------------------------------------------------ */

const CustomSearchPage = () => {
  const {
    term,
    setTerm,
    types,
    setTypes,
    filters,
    setFilters,
    result,
    fetchNextPage,
    fetchPreviousPage,
  } = useSearch();

  const handleFilterChange = useCallback(
    (name: string, value: string | undefined) => {
      setFilters(prev => {
        const next = { ...prev };
        if (value === undefined) {
          delete next[name];
        } else {
          next[name] = value;
        }
        return next;
      });
    },
    [setFilters],
  );

  const clearSearch = () => {
    setTerm('');
    setTypes([]);
    setFilters({});
  };

  const results = result.value?.results ?? [];
  const hasResults = results.length > 0;
  const isLoading = result.loading;
  const error = result.error;

  return (
    <div className="p-6 w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <SearchIcon className="size-5" />
          <h1 className="text-xl font-semibold tracking-tight">Search</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Search across the software catalog and documentation.
        </p>
      </div>

      <Separator />

      {/* Search input */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          value={term}
          onChange={e => setTerm(e.target.value)}
          autoFocus
          className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 pl-10 pr-10 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        {term && (
          <button
            onClick={() => setTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <TypeFilters active={types} onChange={setTypes} />

        <div className="flex gap-3">
          <FilterSelect
            label="Kind"
            name="kind"
            options={['Component', 'Template', 'API', 'System', 'Domain', 'Group', 'User']}
            value={filters.kind as string | undefined}
            onChange={handleFilterChange}
          />
          <FilterSelect
            label="Lifecycle"
            name="lifecycle"
            options={['experimental', 'production', 'deprecated']}
            value={filters.lifecycle as string | undefined}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Active filters summary */}
      {(types.length > 0 || Object.keys(filters).length > 0) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {types.map(t => (
            <Badge key={t} variant="secondary" className="gap-1 text-xs">
              {TYPE_OPTIONS.find(o => o.value === t)?.label ?? t}
              <button
                onClick={() => setTypes(prev => prev.filter(x => x !== t))}
                className="ml-0.5 hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          {Object.entries(filters).map(([key, val]) => (
            <Badge key={key} variant="secondary" className="gap-1 text-xs">
              {key}: {String(val)}
              <button
                onClick={() => handleFilterChange(key, undefined)}
                className="ml-0.5 hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          <button
            onClick={clearSearch}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="size-10 text-destructive/50 mb-3" />
            <p className="text-sm text-destructive font-medium">
              Search failed
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {error.message}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && !hasResults && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <SearchIcon className="size-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              {term
                ? `No results found for "${term}"`
                : 'Start typing to search'}
            </p>
          </div>
        )}

        {/* Result list */}
        {!isLoading && hasResults && (
          <>
            <p className="text-xs text-muted-foreground">
              {result.value?.numberOfResults != null
                ? `${result.value.numberOfResults} results`
                : `${results.length} results`}
            </p>
            <div className="space-y-2">
              {results.map((r, i) => (
                <ResultItem key={`${r.document.location}-${i}`} result={r as any} />
              ))}
            </div>

            {/* Pagination */}
            {(fetchPreviousPage || fetchNextPage) && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchPreviousPage}
                  disabled={!fetchPreviousPage}
                  className="gap-1"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchNextPage}
                  disabled={!fetchNextPage}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const searchPage = <CustomSearchPage />;
