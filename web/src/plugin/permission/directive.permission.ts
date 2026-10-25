import permissionUtil from './func.permission';
import { permissionDirective } from '/@/directive/authDirective';

export default permissionDirective(permissionUtil.hasPermissions);
