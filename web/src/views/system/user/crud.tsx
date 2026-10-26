import * as api from './api';
import type { UserPageContext } from './context';
import {
    dict,
    UserPageQuery,
    AddReq,
    DelReq,
    EditReq,
    compute,
    CreateCrudOptionsProps,
    CreateCrudOptionsRet
} from '@fast-crud/fast-crud';
import { request } from '/@/utils/service';
import { dictionary } from '/@/utils/dictionary';
import { successMessage } from '/@/utils/message';
import { auth } from '/@/utils/authFunction';
import { SystemConfigStore } from "/@/stores/systemConfig";
import { storeToRefs } from "pinia";
import { computed, h } from "vue";
import UserFormFeedback from '/@/features/users/UserFormFeedback.vue';
import { commonCrudConfig } from "/@/utils/commonCrud";
import { ElMessageBox } from 'element-plus';
import { exportData } from "./api";
import { createConfirmedAction } from '/@/features/users/confirmedAction';
import { captureSession } from '/@/shared/access/sessionEvents';
export const createCrudOptions = function ({ crudExpose, context }: CreateCrudOptionsProps): CreateCrudOptionsRet {
    if (!context) throw new Error('User page context is required');
    const page = context as UserPageContext;
    const { t } = page.i18n;
    const statusMutation = page.statusMutation;
    const confirmedAction = createConfirmedAction(statusMutation.pending, auth, captureSession);
    let closePrompt = false;
    const beforeFormClose = (scope: { formRef?: { isDirty?: () => boolean }; close: () => Promise<void> }) => {
        if (page.formSession.busy.value || closePrompt) return false;
        if (!scope.formRef?.isDirty?.()) return true;
        closePrompt = true;
        const assertCurrent = captureSession();
        // FastCrud invokes beforeClose synchronously; close directly after explicit discard.
        void ElMessageBox.confirm(t('message.design.userLeaveDraft'), t('message.design.roleUnsaved'), {
            confirmButtonText: t('message.design.roleDiscard'), cancelButtonText: t('message.design.roleStay'), type: 'warning',
        }).then(async () => { assertCurrent(); if (!page.formSession.busy.value) await scope.close(); })
            .catch(() => {}).finally(() => { closePrompt = false; });
        return false;
    };
    const confirm = async (message: string, title: string) => {
        try { await ElMessageBox.confirm(message, title, {
            confirmButtonText: t('message.pages.user.buttons.confirm'), cancelButtonText: t('message.pages.user.buttons.cancel'), type: 'warning',
        }); return true; } catch { return false; }
    };
    const pageRequest = async (query: UserPageQuery) => {
        return page.listRequest(query);
    };
    const editRequest = async ({ form, row }: EditReq) => {
        return page.submitUser('edit', form, row.id);
    };
    const delRequest = async ({ row }: DelReq) => {
        return await api.DelObj(row.id);
    };
    const addRequest = async ({ form }: AddReq) => {
        return page.submitUser('add', form);
    };

    const exportRequest = async (query: UserPageQuery) => {
        return await api.exportData(query)
    }

    const resetToDefaultPasswordRequest = async (row: EditReq) => {
        await api.resetToDefaultPassword(row.id)
        successMessage(t('message.pages.user.dialog.resetPasswordSuccess'))
    }

    const systemConfigStore = SystemConfigStore()
    const { systemConfig } = storeToRefs(systemConfigStore)
    const getSystemConfig = computed(() => {
        // console.log(systemConfig.value)
        return systemConfig.value
    })


    return {
        crudOptions: {
            table: {
                remove: {
                    confirmMessage: t('message.pages.user.dialog.deleteConfirm'),
                },
            },
            request: {
                pageRequest,
                addRequest,
                editRequest,
                delRequest,
            },
            form: {
                initialForm: {
                    password: computed(() => {
                        return systemConfig.value['base.default_password']
                    }),
                },
                beforeValidate: async ({ mode }) => { page.assertFormAccess(mode); return true; },
                wrapper: {
                    saveDraft: false,
                    beforeClose: beforeFormClose,
                    onOpen: () => { page.startForm(); },
                    onClosed: () => { page.formSession.clear(); },
                    slots: {
                        'form-body-top': () => h(UserFormFeedback, {
                            message: page.formSession.message.value,
                            fields: page.formSession.fields.value,
                            titles: { username: t('message.pages.user.table.columns.username'), name: t('message.pages.user.table.columns.name'),
                                email: t('message.pages.user.table.columns.email'), mobile: t('message.pages.user.table.columns.mobile'),
                                password: t('message.pages.user.form.password'), dept: t('message.pages.user.table.columns.dept'),
                                role: t('message.pages.user.table.columns.role') },
                            fallbackTitle: t('message.design.formFeedbackTitle') }),
                    },
                    buttons: {
                        ok: {
                            disabled: compute(({ mode }) => !auth(mode === 'add' ? 'user:Create' : 'user:Update')),
                            click: (scope) => page.formSession.run(() => scope.submit(), page.focusFormError),
                        },
                        reset: { disabled: computed(() => page.formSession.busy.value) },
                        cancel: { disabled: computed(() => page.formSession.busy.value) },
                    },
                },
            },
            actionbar: {
                buttons: {
                    add: {
                        text: t('message.pages.user.buttons.add'),
                        show: computed(() => auth('user:Create')),
                        click: () => page.openUserForm('add'),
                    },
                    export: {
                        text: t('message.pages.user.buttons.export'),
                        title: t('message.pages.user.dialog.exportTitle'),
                        show: computed(() => auth('user:Export')),
                        disabled: computed(() => statusMutation.pending.has('__export__')),
                        click: () => {
                            const query = { ...crudExpose.getSearchFormData() };
                            return confirmedAction('__export__', 'user:Export',
                                () => confirm(t('message.pages.user.dialog.exportConfirm'), t('message.pages.user.dialog.exportTitle')),
                                () => exportData(query, page.onExportTask));
                        },
                    }
                }
            },
            rowHandle: {
                //固定右侧
                fixed: 'right',
                width: 220,
                buttons: {
                    view: {
                        show: false,
                    },
                    edit: {
                        text: t('message.pages.user.buttons.edit'),
                        iconRight: 'Edit',
                        type: 'text',
                        show: computed(() => auth('user:Update')),
                        click: ({ row, index }) => page.openUserForm('edit', row, index),
                    },
                    remove: {
                        text: t('message.pages.user.buttons.delete'),
                        iconRight: 'Delete',
                        type: 'text',
                        show: computed(() => auth('user:Delete')),
                        disabled: compute(({ row }) => statusMutation.pending.has(row.id)),
                        click: ({ row }) => confirmedAction(row.id, 'user:Delete',
                            () => confirm(t('message.pages.user.dialog.deleteConfirm'), t('message.pages.user.buttons.delete')),
                            async () => { await api.DelObj(row.id); successMessage(t('message.pages.user.messages.deleteSuccess')); await crudExpose.doRefresh(); }),
                    },
                    platformPermission: {
                        text: "平台权限", type: "text", iconRight: "Key",
                        show: computed(() => auth("user:PlatformPermission")),
                        click: ({ row }) => page.openPlatformPermissions(row),
                    },
                    resetDefaultPwd: {
                        text: t('message.pages.user.buttons.resetPassword'),
                        type: 'text',
                        iconRight: 'Setting',
                        show: computed(() => auth('user:ResetDefaultPassword')),
                        disabled: compute(({ row }) => statusMutation.pending.has(row.id)),
                        click: ({ row }) => confirmedAction(row.id, 'user:ResetDefaultPassword',
                            () => confirm(t('message.pages.user.dialog.resetPasswordConfirm'), t('message.pages.user.dialog.resetPassword')),
                            () => resetToDefaultPasswordRequest(row)),
                    },
                },
            },
            columns: {
                _index: {
                    title: t('message.pages.user.table.columns.index'),
                    form: { show: false },
                    column: {
                        type: 'index',
                        align: 'center',
                        width: '70px',
                        columnSetDisabled: true, //禁止在列设置中选择
                    },
                },
                username: {
                    title: t('message.pages.user.table.columns.username'),
                    search: {
                        show: true,
                    },
                    type: 'input',
                    column: {
                        minWidth: 100, //最小列宽
                    },
                    form: {
                        rules: [
                            // 表单校验规则
                            {
                                required: true,
                                message: t('message.pages.user.validation.usernameRequired'),
                            },
                        ],
                        component: {
                            placeholder: t('message.pages.user.form.usernamePlaceholder'),
                        },
                    },
                },
                password: {
                    title: t('message.pages.user.form.password'),
                    type: 'password',
                    column: {
                        show: false,
                    },
                    editForm: {
                        show: false,
                    },
                    form: {
                        rules: [
                            // 表单校验规则
                            {
                                required: true,
                                message: t('message.pages.user.validation.passwordRequired'),
                            },
                        ],
                        component: {

                            span: 12,
                            showPassword: true,
                            placeholder: t('message.pages.user.form.passwordPlaceholder'),
                        },
                    },

                },
                name: {
                    title: t('message.pages.user.table.columns.name'),
                    search: {
                        show: true,
                    },
                    type: 'input',
                    column: {
                        minWidth: 100, //最小列宽
                    },
                    form: {
                        rules: [
                            // 表单校验规则
                            {
                                required: true,
                                message: t('message.pages.user.validation.nameRequired'),
                            },
                        ],
                        component: {
                            span: 12,
                            placeholder: t('message.pages.user.form.namePlaceholder'),
                        },
                    },
                },
                dept: {
                    title: t('message.pages.user.table.columns.dept'),
                    type: 'dict-tree',
                    dict: dict({
                        isTree: true,
                        url: '/api/system/dept/all_dept/',
                        value: 'id',
                        label: 'name'
                    }),
                    column: {
                        minWidth: 300, //最小列宽
                        formatter({ value, row, index }) {
                            return row.dept_name_all
                        }
                    },
                    form: {
                        rules: [
                            // 表单校验规则
                            {
                                required: true,
                                message: t('message.pages.user.validation.deptRequired'),
                            },
                        ],
                        component: {
                            filterable: true,
                            placeholder: t('message.pages.user.form.deptPlaceholder'),
                            props: {
                                checkStrictly: true,
                                props: {
                                    value: 'id',
                                    label: 'name',
                                },
                            },
                        },
                    },
                },
                manage_dept: {
                    title: t('message.pages.user.table.columns.manageDept'),
                    type: 'dict-tree',
                    dict: dict({
                        isTree: true,
                        url: '/api/system/dept/all_dept/',
                        value: 'id',
                        label: 'name'
                    }),
                    column: {
                        minWidth: 300
                    },
                    form: {
                        value: [],
                        component: {
                            filterable: true,
                            multiple: true,
                            placeholder: t('message.pages.user.form.manageDeptPlaceholder'),
                            clearable: true,
                            collapseTags: true,
                            maxCollapseTags: 2,
                            collapseTagsTooltip: true,
                            props: {
                                checkStrictly: true,
                                props: {
                                    value: 'id',
                                    label: 'name',
                                },
                            },
                        },
                        helper: t('message.pages.user.validation.manageDeptHelper'),
                    },
                },
                role: {
                    title: t('message.pages.user.table.columns.role'),
                    search: {
                        disabled: true,
                    },
                    type: 'dict-select',
                    dict: dict({
                        getData: async () => {
                            if (!auth('role:Search')) return [];
                            const response = await request({ url: '/api/system/role/', method: 'get' });
                            return response.data;
                        },
                        value: 'id',
                        label: 'name',
                    }),
                    column: {
                        minWidth: 200, //最小列宽
                        formatter({ row }) {
                            return (row.role_info || []).map((role: { name: string }) => role.name).join(', ');
                        },
                    },
                    form: {
                        rules: [
                            // 表单校验规则
                            {
                                required: true,
                                message: t('message.pages.user.validation.roleRequired'),
                            },
                        ],
                        component: {
                            multiple: true,
                            filterable: true,
                            placeholder: t('message.pages.user.form.rolePlaceholder'),
                        },
                    },
                },
                mobile: {
                    title: t('message.pages.user.table.columns.mobile'),
                    search: {
                        show: true,
                    },
                    type: 'input',
                    column: {
                        minWidth: 120, //最小列宽
                    },
                    form: {
                        rules: [
                            {
                                max: 20,
                                message: t('message.pages.user.validation.mobileInvalid'),
                                trigger: 'blur',
                            },
                            {
                                pattern: /^1[3-9]\d{9}$/,
                                message: t('message.pages.user.validation.mobileInvalid'),
                            },
                        ],
                        component: {
                            placeholder: t('message.pages.user.form.mobilePlaceholder'),
                        },
                    },
                },
                email: {
                    title: t('message.pages.user.table.columns.email'),
                    column: {
                        width: 260,
                    },
                    form: {
                        rules: [
                            {
                                type: 'email',
                                message: t('message.pages.user.validation.emailInvalid'),
                                trigger: ['blur', 'change'],
                            },
                        ],
                        component: {
                            placeholder: t('message.pages.user.form.emailPlaceholder'),
                        },
                    },
                },
                gender: {
                    title: t('message.pages.user.table.columns.gender'),
                    type: 'dict-select',
                    dict: dict({
                        data: dictionary('gender'),
                    }),
                    form: {
                        value: 1,
                        component: {
                            span: 12,
                        },
                    },
                    component: { props: { color: 'auto' } }, // 自动染色
                },
                user_type: {
                    title: t('message.pages.user.table.columns.userType'),
                    search: {
                        show: true,
                    },
                    type: 'dict-select',
                    dict: dict({
                        data: dictionary('user_type'),
                    }),
                    column: {
                        minWidth: 100, //最小列宽
                    },
                    form: {
                        show: false,
                        value: 0,
                        component: {
                            span: 12,
                        },
                    },
                },
                is_active: {
                    title: t('message.pages.user.table.columns.status'),
                    search: {
                        show: true,
                    },
                    type: 'dict-radio',
                    column: {
                        component: {
                            name: 'fs-dict-switch',
                            activeText: '',
                            inactiveText: '',
                            style: '--el-switch-on-color: var(--admin-accent); --el-switch-off-color: var(--admin-border-strong)',
                            disabled: compute((context) => !auth('user:Update') || page.canUpdateField('is_active') === false || statusMutation.pending.has(context.row.id)),
                            loading: compute((context) => statusMutation.pending.has(context.row.id)),
                            beforeChange: compute((context) => () => {
                                if (!auth('user:Update')) return false;
                                return statusMutation.run(context.row.id, async () => {
                                    const next = { ...context.row, is_active: !context.row.is_active };
                                    const res = await api.UpdateObj(page.statusPayload(next));
                                    successMessage(res.msg as string);
                                });
                            }),
                        },
                    },
                    dict: dict({
                        data: dictionary('button_status_bool'),
                    }),
                    form: {
                        value: true
                    }
                },
                avatar: {
                    title: t('message.pages.user.table.columns.avatar'),
                    type: 'avatar-uploader',
                    align: 'center',
                    form: {
                        show: false,
                    },
                    column: {
                        minWidth: 100, //最小列宽
                    },
                },
                ...commonCrudConfig({
                    dept_belong_id: {
                        form: false,
                        table: false
                    }
                })
            },
        },
    };
};
