import { useEntity } from '@backstage/plugin-catalog-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';

export function ApiDefinitionCard() {
  const { entity } = useEntity();
  const spec = entity.spec as Record<string, unknown> | undefined;
  const definition = spec?.definition as string | undefined;
  const apiType = spec?.type as string | undefined;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">
            API Definition
          </CardTitle>
          {apiType && (
            <Badge variant="secondary" className="text-xs">
              {apiType}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {definition ? (
          <pre className="bg-muted rounded-md p-4 overflow-auto text-xs font-mono max-h-[600px] border">
            <code>{definition}</code>
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">
            No API definition available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
