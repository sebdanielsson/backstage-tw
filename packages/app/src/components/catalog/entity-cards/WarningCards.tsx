import { useEntity } from '@backstage/plugin-catalog-react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  EntityWarnings – replaces EntityOrphanWarning,                     */
/*  EntityProcessingErrorsPanel, EntityRelationWarning                 */
/* ------------------------------------------------------------------ */

export function OrphanWarning() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
      <div>
        <h4 className="text-sm font-medium text-amber-500">Orphan entity</h4>
        <p className="text-sm text-muted-foreground mt-1">
          This entity is not referenced by any location and may have been
          created by accident, or the reference to it may have been removed.
        </p>
      </div>
    </div>
  );
}

export function ProcessingErrorsPanel() {
  const { entity } = useEntity();
  const status = (entity as any).status;
  const errors =
    status?.items?.filter(
      (item: any) => item.level === 'error' || item.type === 'error',
    ) ?? [];

  if (errors.length === 0) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
      <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
      <div>
        <h4 className="text-sm font-medium text-destructive">
          Processing errors
        </h4>
        <ul className="mt-1 space-y-1">
          {errors.map((err: any, i: number) => (
            <li key={i} className="text-sm text-muted-foreground">
              {err.message || err.error?.message || 'Unknown error'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function RelationWarning() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
      <Info className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
      <div>
        <h4 className="text-sm font-medium text-amber-500">
          Relation warning
        </h4>
        <p className="text-sm text-muted-foreground mt-1">
          Some relations of this entity could not be resolved. This may indicate
          missing or misconfigured entities in the catalog.
        </p>
      </div>
    </div>
  );
}
