import { createSessionBootstrap } from '../shared/access/bootstrap';
import { sessionRevision } from '../shared/access/sessionEvents';
import { Session } from '../utils/storage';

export const routeBootstrap = createSessionBootstrap(() => {
  const token = Session.get('token');
  return token ? `${sessionRevision.value}:${token}` : null;
});
