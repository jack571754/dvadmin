import { createPermissionStore } from '../shared/access/permissionStore';
import { onSessionChanged } from '../shared/access/sessionEvents';
import { request } from '/@/utils/service';
import { Session } from '/@/utils/storage';

// Permissions are session-bound; never restore them from persisted state.
export const BtnPermissionStore = createPermissionStore(async () => {
  const response: { data: unknown } = await request({
    url: '/api/system/menu_button/menu_button_all_permission/',
    method: 'get',
  });
  return response.data;
}, { getToken: () => Session.get('token'), subscribe: onSessionChanged });
