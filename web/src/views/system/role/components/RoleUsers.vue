<template>
	<el-transfer
		v-model="RoleUsers.$state.right_users"
		filterable
		:filter-method="filterMethod"
		:filter-placeholder="$t('message.pages.user.form.usernamePlaceholder')"
		:titles="[$t('message.pages.role.transfer.unassignedUsers'), $t('message.pages.role.transfer.assignedUsers')]"
		:data="RoleUsers.$state.all_users"
		:props="{
			key: 'id',
			label: 'name',
		}"
		@change="handleChange"
	/>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus';
import { RoleDrawerStores } from '../stores/RoleDrawerStores';
import { RoleUsersStores } from '../stores/RoleUsersStores';
import { setRoleUsers } from './api';
const RoleDrawer = RoleDrawerStores(); // 抽屉参数
const RoleUsers = RoleUsersStores(); // 角色-用户

const filterMethod = (query: string, item: any) => {
	return item.name.toLowerCase().includes(query.toLowerCase());
};

/**
 *
 * @param value 当前右侧选中的用户
 * @param direction 移动的方向
 * @param movedKeys 移动的用户
 */
const handleChange = (value: number[] | string[], direction: 'left' | 'right', movedKeys: string[] | number[]) => {
	setRoleUsers(RoleDrawer.$state.roleId, { direction, movedKeys }).then((res:any) => {
		RoleDrawer.set_state(res.data)
		ElMessage({ message: res.msg, type: 'success' });
	});
};
</script>
