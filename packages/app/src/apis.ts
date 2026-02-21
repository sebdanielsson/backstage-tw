import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import {
  notificationsApiRef,
  NotificationsClient,
} from '@backstage/plugin-notifications';

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  ScmAuth.createDefaultApiFactory(),
  // Notifications API — registered explicitly because we use a custom
  // NotificationsPage instead of the plugin's built-in one, so the plugin's
  // API factory isn't auto-discovered from the route tree.
  createApiFactory({
    api: notificationsApiRef,
    deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
    factory: ({ discoveryApi, fetchApi }) =>
      new NotificationsClient({ discoveryApi, fetchApi }),
  }),
];
