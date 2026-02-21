import {
  EntitySwitch,
  isComponentType,
  isKind,
  hasCatalogProcessingErrors,
  isOrphan,
  hasRelationWarnings,
} from '@backstage/plugin-catalog';
import { CustomEntityLayout as EntityLayout } from './CustomEntityLayout';
import {
  RELATION_API_CONSUMED_BY,
  RELATION_API_PROVIDED_BY,
  RELATION_CONSUMES_API,
  RELATION_DEPENDS_ON,
  RELATION_HAS_PART,
  RELATION_PROVIDES_API,
} from '@backstage/catalog-model';
import { EntityTechdocsContent } from '@backstage/plugin-techdocs';
import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
import { ReportIssue } from '@backstage/plugin-techdocs-module-addons-contrib';
import {
  EntityKubernetesContent,
  isKubernetesAvailable,
} from '@backstage/plugin-kubernetes';

import {
  AboutCard,
  LinksCard,
  RelationsCard,
  ApiDefinitionCard,
  EmptyState,
  UserProfileCard,
  GroupProfileCard,
  MembersListCard,
  OwnershipCard,
  OrphanWarning,
  ProcessingErrorsPanel,
  RelationWarning,
} from './entity-cards';

/* ------------------------------------------------------------------ */
/*  Shared content blocks                                              */
/* ------------------------------------------------------------------ */

const techdocsContent = (
  <EntityTechdocsContent>
    <TechDocsAddons>
      <ReportIssue />
    </TechDocsAddons>
  </EntityTechdocsContent>
);

const cicdContent = (
  <EmptyState
    title="No CI/CD available for this entity"
    description="You need to add an annotation to your component if you want to enable CI/CD for it. You can read more about annotations in Backstage by clicking the button below."
    action={
      <a
        href="https://backstage.io/docs/features/software-catalog/well-known-annotations"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
      >
        Read more
      </a>
    }
  />
);

const entityWarningContent = (
  <>
    <EntitySwitch>
      <EntitySwitch.Case if={isOrphan}>
        <div className="col-span-12">
          <OrphanWarning />
        </div>
      </EntitySwitch.Case>
    </EntitySwitch>

    <EntitySwitch>
      <EntitySwitch.Case if={hasRelationWarnings}>
        <div className="col-span-12">
          <RelationWarning />
        </div>
      </EntitySwitch.Case>
    </EntitySwitch>

    <EntitySwitch>
      <EntitySwitch.Case if={hasCatalogProcessingErrors}>
        <div className="col-span-12">
          <ProcessingErrorsPanel />
        </div>
      </EntitySwitch.Case>
    </EntitySwitch>
  </>
);

/* ------------------------------------------------------------------ */
/*  Overview content                                                   */
/* ------------------------------------------------------------------ */

const overviewContent = (
  <div className="grid grid-cols-12 gap-4">
    {entityWarningContent}
    <div className="col-span-12 md:col-span-6">
      <AboutCard />
    </div>
    <div className="col-span-12 md:col-span-6">
      <RelationsCard
        title="Relations"
        emptyMessage="No relations"
      />
    </div>
    <div className="col-span-12">
      <LinksCard />
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Service entity page                                                */
/* ------------------------------------------------------------------ */

const serviceEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/ci-cd" title="CI/CD">
      {cicdContent}
    </EntityLayout.Route>

    <EntityLayout.Route
      path="/kubernetes"
      title="Kubernetes"
      if={isKubernetesAvailable}
    >
      <EntityKubernetesContent />
    </EntityLayout.Route>

    <EntityLayout.Route path="/api" title="API">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-6">
          <RelationsCard
            title="Provided APIs"
            relationType={RELATION_PROVIDES_API}
            emptyMessage="No provided APIs"
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <RelationsCard
            title="Consumed APIs"
            relationType={RELATION_CONSUMES_API}
            emptyMessage="No consumed APIs"
          />
        </div>
      </div>
    </EntityLayout.Route>

    <EntityLayout.Route path="/dependencies" title="Dependencies">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-6">
          <RelationsCard
            title="Depends on components"
            relationType={RELATION_DEPENDS_ON}
            kind="component"
            emptyMessage="No component dependencies"
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <RelationsCard
            title="Depends on resources"
            relationType={RELATION_DEPENDS_ON}
            kind="resource"
            emptyMessage="No resource dependencies"
          />
        </div>
      </div>
    </EntityLayout.Route>

    <EntityLayout.Route path="/docs" title="Docs">
      {techdocsContent}
    </EntityLayout.Route>
  </EntityLayout>
);

/* ------------------------------------------------------------------ */
/*  Website entity page                                                */
/* ------------------------------------------------------------------ */

const websiteEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/ci-cd" title="CI/CD">
      {cicdContent}
    </EntityLayout.Route>

    <EntityLayout.Route
      path="/kubernetes"
      title="Kubernetes"
      if={isKubernetesAvailable}
    >
      <EntityKubernetesContent />
    </EntityLayout.Route>

    <EntityLayout.Route path="/dependencies" title="Dependencies">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-6">
          <RelationsCard
            title="Depends on components"
            relationType={RELATION_DEPENDS_ON}
            kind="component"
            emptyMessage="No component dependencies"
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <RelationsCard
            title="Depends on resources"
            relationType={RELATION_DEPENDS_ON}
            kind="resource"
            emptyMessage="No resource dependencies"
          />
        </div>
      </div>
    </EntityLayout.Route>

    <EntityLayout.Route path="/docs" title="Docs">
      {techdocsContent}
    </EntityLayout.Route>
  </EntityLayout>
);

/* ------------------------------------------------------------------ */
/*  Default entity page                                                */
/* ------------------------------------------------------------------ */

const defaultEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/docs" title="Docs">
      {techdocsContent}
    </EntityLayout.Route>
  </EntityLayout>
);

/* ------------------------------------------------------------------ */
/*  Component page (switches by type)                                  */
/* ------------------------------------------------------------------ */

const componentPage = (
  <EntitySwitch>
    <EntitySwitch.Case if={isComponentType('service')}>
      {serviceEntityPage}
    </EntitySwitch.Case>

    <EntitySwitch.Case if={isComponentType('website')}>
      {websiteEntityPage}
    </EntitySwitch.Case>

    <EntitySwitch.Case>{defaultEntityPage}</EntitySwitch.Case>
  </EntitySwitch>
);

/* ------------------------------------------------------------------ */
/*  API entity page                                                    */
/* ------------------------------------------------------------------ */

const apiPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <div className="grid grid-cols-12 gap-4">
        {entityWarningContent}
        <div className="col-span-12 md:col-span-6">
          <AboutCard />
        </div>
        <div className="col-span-12 md:col-span-6">
          <LinksCard />
        </div>
        <div className="col-span-12 md:col-span-6">
          <RelationsCard
            title="Providing components"
            relationType={RELATION_API_PROVIDED_BY}
            emptyMessage="No providing components"
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <RelationsCard
            title="Consuming components"
            relationType={RELATION_API_CONSUMED_BY}
            emptyMessage="No consuming components"
          />
        </div>
      </div>
    </EntityLayout.Route>

    <EntityLayout.Route path="/definition" title="Definition">
      <ApiDefinitionCard />
    </EntityLayout.Route>
  </EntityLayout>
);

/* ------------------------------------------------------------------ */
/*  User page                                                          */
/* ------------------------------------------------------------------ */

const userPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <div className="grid grid-cols-12 gap-4">
        {entityWarningContent}
        <div className="col-span-12 md:col-span-6">
          <UserProfileCard />
        </div>
        <div className="col-span-12 md:col-span-6">
          <OwnershipCard />
        </div>
      </div>
    </EntityLayout.Route>
  </EntityLayout>
);

/* ------------------------------------------------------------------ */
/*  Group page                                                         */
/* ------------------------------------------------------------------ */

const groupPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <div className="grid grid-cols-12 gap-4">
        {entityWarningContent}
        <div className="col-span-12 md:col-span-6">
          <GroupProfileCard />
        </div>
        <div className="col-span-12 md:col-span-6">
          <OwnershipCard />
        </div>
        <div className="col-span-12 md:col-span-6">
          <MembersListCard />
        </div>
        <div className="col-span-12 md:col-span-6">
          <LinksCard />
        </div>
      </div>
    </EntityLayout.Route>
  </EntityLayout>
);

/* ------------------------------------------------------------------ */
/*  System page                                                        */
/* ------------------------------------------------------------------ */

const systemPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <div className="grid grid-cols-12 gap-4">
        {entityWarningContent}
        <div className="col-span-12 md:col-span-6">
          <AboutCard />
        </div>
        <div className="col-span-12 md:col-span-6">
          <LinksCard />
        </div>
        <div className="col-span-12 md:col-span-8">
          <RelationsCard
            title="Components"
            relationType={RELATION_HAS_PART}
            kind="component"
            emptyMessage="No components"
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <RelationsCard
            title="APIs"
            relationType={RELATION_HAS_PART}
            kind="api"
            emptyMessage="No APIs"
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <RelationsCard
            title="Resources"
            relationType={RELATION_HAS_PART}
            kind="resource"
            emptyMessage="No resources"
          />
        </div>
      </div>
    </EntityLayout.Route>
  </EntityLayout>
);

/* ------------------------------------------------------------------ */
/*  Domain page                                                        */
/* ------------------------------------------------------------------ */

const domainPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <div className="grid grid-cols-12 gap-4">
        {entityWarningContent}
        <div className="col-span-12 md:col-span-6">
          <AboutCard />
        </div>
        <div className="col-span-12 md:col-span-6">
          <LinksCard />
        </div>
        <div className="col-span-12 md:col-span-6">
          <RelationsCard
            title="Systems"
            relationType={RELATION_HAS_PART}
            kind="system"
            emptyMessage="No systems"
          />
        </div>
      </div>
    </EntityLayout.Route>
  </EntityLayout>
);

/* ------------------------------------------------------------------ */
/*  Root entity page switch                                            */
/* ------------------------------------------------------------------ */

export const entityPage = (
  <EntitySwitch>
    <EntitySwitch.Case if={isKind('component')} children={componentPage} />
    <EntitySwitch.Case if={isKind('api')} children={apiPage} />
    <EntitySwitch.Case if={isKind('group')} children={groupPage} />
    <EntitySwitch.Case if={isKind('user')} children={userPage} />
    <EntitySwitch.Case if={isKind('system')} children={systemPage} />
    <EntitySwitch.Case if={isKind('domain')} children={domainPage} />

    <EntitySwitch.Case>{defaultEntityPage}</EntitySwitch.Case>
  </EntitySwitch>
);
