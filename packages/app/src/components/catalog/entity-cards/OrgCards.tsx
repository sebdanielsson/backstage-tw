import {
  useEntity,
  getEntityRelations,
  entityRouteRef,
} from '@backstage/plugin-catalog-react';
import { useRouteRef, useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import {
  RELATION_MEMBER_OF,
  RELATION_HAS_MEMBER,
  RELATION_CHILD_OF,
  RELATION_PARENT_OF,
  Entity,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Loader2, Mail, User, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';

/* ------------------------------------------------------------------ */
/*  UserProfileCard                                                    */
/* ------------------------------------------------------------------ */

export function UserProfileCard() {
  const { entity } = useEntity();
  const entityRoute = useRouteRef(entityRouteRef);

  const spec = entity.spec as Record<string, unknown> | undefined;
  const profile = spec?.profile as
    | { displayName?: string; email?: string; picture?: string }
    | undefined;
  const memberOf = getEntityRelations(entity, RELATION_MEMBER_OF, {
    kind: 'group',
  });

  const displayName = profile?.displayName || entity.metadata.name;
  const email = profile?.email;
  const picture = profile?.picture;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center gap-3">
          <Avatar className="h-20 w-20">
            {picture && <AvatarImage src={picture} alt={displayName} />}
            <AvatarFallback className="text-lg">
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{displayName}</h3>
            {email && (
              <a
                href={`mailto:${email}`}
                className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1 mt-1"
              >
                <Mail className="h-3 w-3" />
                {email}
              </a>
            )}
          </div>
          {memberOf.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {memberOf.map(r => (
                <a
                  key={`${r.kind}:${r.namespace}/${r.name}`}
                  href={entityRoute({
                    kind: r.kind,
                    namespace: r.namespace,
                    name: r.name,
                  })}
                >
                  <Badge variant="secondary" className="text-xs">
                    {r.name}
                  </Badge>
                </a>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  GroupProfileCard                                                    */
/* ------------------------------------------------------------------ */

export function GroupProfileCard() {
  const { entity } = useEntity();
  const entityRoute = useRouteRef(entityRouteRef);

  const spec = entity.spec as Record<string, unknown> | undefined;
  const profile = spec?.profile as
    | { displayName?: string; email?: string; picture?: string }
    | undefined;
  const parentOf = getEntityRelations(entity, RELATION_PARENT_OF, {
    kind: 'group',
  });
  const childOf = getEntityRelations(entity, RELATION_CHILD_OF, {
    kind: 'group',
  });

  const displayName = profile?.displayName || entity.metadata.name;
  const description = entity.metadata.description;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{displayName}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          {childOf.length > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Parent: </span>
              {childOf.map(r => (
                <a
                  key={`${r.kind}:${r.namespace}/${r.name}`}
                  href={entityRoute({
                    kind: r.kind,
                    namespace: r.namespace,
                    name: r.name,
                  })}
                  className="text-primary hover:underline"
                >
                  {r.name}
                </a>
              ))}
            </div>
          )}
          {parentOf.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              <span className="text-xs text-muted-foreground w-full">
                Child groups:
              </span>
              {parentOf.map(r => (
                <a
                  key={`${r.kind}:${r.namespace}/${r.name}`}
                  href={entityRoute({
                    kind: r.kind,
                    namespace: r.namespace,
                    name: r.name,
                  })}
                >
                  <Badge variant="outline" className="text-xs">
                    {r.name}
                  </Badge>
                </a>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  MembersListCard                                                    */
/* ------------------------------------------------------------------ */

export function MembersListCard() {
  const { entity } = useEntity();
  const entityRoute = useRouteRef(entityRouteRef);
  const catalogApi = useApi(catalogApiRef);

  const memberRefs = getEntityRelations(entity, RELATION_HAS_MEMBER, {
    kind: 'user',
  });

  const [members, setMembers] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (memberRefs.length === 0) {
      setLoading(false);
      return;
    }
    Promise.all(
      memberRefs.map(ref =>
        catalogApi
          .getEntityByRef(stringifyEntityRef(ref))
          .catch(() => undefined),
      ),
    ).then(results => {
      setMembers(results.filter((e): e is Entity => e !== undefined));
      setLoading(false);
    });
  }, [catalogApi, memberRefs.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Members ({memberRefs.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && members.length === 0 && (
          <p className="text-sm text-muted-foreground">No members</p>
        )}
        {!loading && members.length > 0 && (
          <div className="space-y-2">
            {members.map(member => {
              const profile = (member.spec as any)?.profile;
              const name =
                profile?.displayName || member.metadata.name;
              const email = profile?.email;
              const picture = profile?.picture;
              return (
                <a
                  key={member.metadata.name}
                  href={entityRoute({
                    kind: member.kind,
                    namespace: member.metadata.namespace || 'default',
                    name: member.metadata.name,
                  })}
                  className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    {picture && (
                      <AvatarImage src={picture} alt={name} />
                    )}
                    <AvatarFallback className="text-xs">
                      {name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{name}</p>
                    {email && (
                      <p className="text-xs text-muted-foreground truncate">
                        {email}
                      </p>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  OwnershipCard                                                      */
/* ------------------------------------------------------------------ */

export function OwnershipCard() {
  const { entity } = useEntity();
  const entityRoute = useRouteRef(entityRouteRef);
  const catalogApi = useApi(catalogApiRef);

  const [owned, setOwned] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  const entityRef = stringifyEntityRef(entity);

  useEffect(() => {
    catalogApi
      .getEntities({
        filter: { 'relations.ownedBy': entityRef },
        fields: [
          'kind',
          'metadata.name',
          'metadata.namespace',
          'metadata.description',
          'spec.type',
        ],
      })
      .then(response => {
        setOwned(response.items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [catalogApi, entityRef]);

  // Group by kind
  const grouped = owned.reduce(
    (acc, e) => {
      const kind = e.kind;
      if (!acc[kind]) acc[kind] = [];
      acc[kind].push(e);
      return acc;
    },
    {} as Record<string, Entity[]>,
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Ownership</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && owned.length === 0 && (
          <p className="text-sm text-muted-foreground">No owned entities</p>
        )}
        {!loading && owned.length > 0 && (
          <div className="space-y-4">
            {Object.entries(grouped).map(([kind, entities]) => (
              <div key={kind}>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  {kind}s ({entities.length})
                </h4>
                <div className="space-y-1">
                  {entities.slice(0, 10).map(e => (
                    <a
                      key={stringifyEntityRef(e)}
                      href={entityRoute({
                        kind: e.kind,
                        namespace: e.metadata.namespace || 'default',
                        name: e.metadata.name,
                      })}
                      className="block text-sm text-primary hover:underline truncate"
                    >
                      {e.metadata.name}
                    </a>
                  ))}
                  {entities.length > 10 && (
                    <p className="text-xs text-muted-foreground">
                      and {entities.length - 10} more...
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
