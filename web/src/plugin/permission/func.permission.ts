import { auth, authAll } from '/@/utils/authFunction';

export default {
  hasPermissions(value: string | string[]) {
    if (!import.meta.env.VITE_PM_ENABLED) return true;
    return Array.isArray(value) ? authAll(value) : auth(value);
  },
};
