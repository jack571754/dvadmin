import * as api from './api';
import {
    UserPageQuery,
    AddReq,
    DelReq,
    EditReq,
    CreateCrudOptionsProps,
    CreateCrudOptionsRet,
    dict
} from '@fast-crud/fast-crud';
import {commonCrudConfig} from "/@/utils/commonCrud";
import {computed,shallowRef} from "vue";
import dvaSelect from "/@/components/dvaSelect/index.vue";
import { useI18n } from 'vue-i18n';
export const createCrudOptions = function ({
                                               crudExpose,
                                               isEcharts,
                                               initChart
                                           }: CreateCrudOptionsProps): CreateCrudOptionsRet {
    const { t } = useI18n();
    const pageRequest = async (query: UserPageQuery) => {
        return await api.GetList(query);
    };
    const editRequest = async ({form, row}: EditReq) => {
        form.id = row.id;
        return await api.UpdateObj(form);
    };
    const delRequest = async ({row}: DelReq) => {
        return await api.DelObj(row.id);
    };
    const addRequest = async ({form}: AddReq) => {
        return await api.AddObj(form);
    };
    return {
        crudOptions: {
            request: {
                pageRequest,
                addRequest,
                editRequest,
                delRequest,
            },
            actionbar: {
                buttons: {
                    add: {
                        show: true,
                    },
                    showEcharts: {
                        type: 'warning',
                        text: computed(() => {
                            return isEcharts.value ? t('message.pages.demo.buttons.hideChart') : t('message.pages.demo.buttons.showChart')
                        }),
                        click: () => {
                            isEcharts.value = !isEcharts.value;
                        }
                    }
                },
            },
            rowHandle: {
                fixed: 'right',
                width: 100,
                buttons: {
                    view: {
                        type: 'text',
                    },
                    edit: {
                        show: false,
                    },
                    remove: {
                        show: false,
                    },
                },
            },
            columns: {
                _index: {
                    title: t('message.pages.demo.table.columns.index'),
                    form: {show: false},
                    column: {
                        //type: 'index',
                        align: 'center',
                        width: '70px',
                        columnSetDisabled: true, //禁止在列设置中选择
                        formatter: (context) => {
                            //计算序号,你可以自定义计算规则，此处为翻页累加
                            let index = context.index ?? 1;
                            let pagination = crudExpose!.crudBinding.value.pagination;
                            return ((pagination!.currentPage ?? 1) - 1) * pagination!.pageSize + index + 1;
                        },
                    },
                },
                search: {
                    title: t('message.pages.demo.table.columns.keyword'),
                    column: {
                        show: false,
                    },
                    search: {
                        show: true,
                        component: {
                            props: {
                                clearable: true,
                            },
                            placeholder: t('message.pages.demo.form.keywordPlaceholder'),
                        },
                    },
                    form: {
                        show: false,
                        component: {
                            props: {
                                clearable: true,
                            },
                        },
                    },
                },
                username: {
                    title: t('message.pages.demo.table.columns.testComponent'),
                    dict:dict({
                        url({form}){
                            return  '/api/system/role/'
                        },
                        label:'name',
                        value:'id'
                        }),
                    form: {
                        component: {
                            //局部引用子表格，要用shallowRef包裹
                            name: shallowRef(dvaSelect),
                        }
                    }
                },
                // username: {
                //     title: '登录用户名',
                //     search: {
                //         disabled: false,
                //     },
                //     type: 'input',
                //     column: {
                //         minWidth: 120,
                //     },
                //     form: {
                //         disabled: true,
                //         component: {
                //             placeholder: '请输入登录用户名',
                //         },
                //     },
                // },
                ip: {
                    title: t('message.pages.demo.table.columns.loginIp'),
                    search: {
                        disabled: false,
                    },
                    type: 'input',
                    column: {
                        minWidth: 120,
                    },
                    form: {
                        disabled: true,
                        component: {
                            placeholder: t('message.pages.demo.form.loginIpPlaceholder'),
                        },
                    },
                },
                isp: {
                    title: t('message.pages.demo.table.columns.isp'),
                    search: {
                        disabled: true,
                    },
                    disabled: true,
                    type: 'input',
                    column: {
                        minWidth: 120,
                    },
                    form: {
                        component: {
                            placeholder: t('message.pages.demo.form.ispPlaceholder'),
                        },
                    },
                },
                continent: {
                    title: t('message.pages.demo.table.columns.continent'),
                    type: 'input',
                    column: {
                        minWidth: 90,
                    },
                    form: {
                        disabled: true,
                        component: {
                            placeholder: t('message.pages.demo.form.continentPlaceholder'),
                        },
                    },
                    component: {props: {color: 'auto'}}, // 自动染色
                },
                country: {
                    title: t('message.pages.demo.table.columns.country'),
                    type: 'input',
                    column: {
                        minWidth: 90,
                    },
                    form: {
                        component: {
                            placeholder: t('message.pages.demo.form.countryPlaceholder'),
                        },
                    },
                    component: {props: {color: 'auto'}}, // 自动染色
                },
                province: {
                    title: t('message.pages.demo.table.columns.province'),
                    type: 'input',
                    column: {
                        minWidth: 80,
                    },
                    form: {
                        component: {
                            placeholder: t('message.pages.demo.form.provincePlaceholder'),
                        },
                    },
                    component: {props: {color: 'auto'}}, // 自动染色
                },
                city: {
                    title: t('message.pages.demo.table.columns.city'),
                    type: 'input',
                    column: {
                        minWidth: 80,
                    },
                    form: {
                        component: {
                            placeholder: t('message.pages.demo.form.cityPlaceholder'),
                        },
                    },
                    component: {props: {color: 'auto'}}, // 自动染色
                },
                district: {
                    title: t('message.pages.demo.table.columns.district'),
                    key: '',
                    type: 'input',
                    column: {
                        minWidth: 80,
                    },
                    form: {
                        component: {
                            placeholder: t('message.pages.demo.form.districtPlaceholder'),
                        },
                    },
                    component: {props: {color: 'auto'}}, // 自动染色
                },
                area_code: {
                    title: t('message.pages.demo.table.columns.area_code'),
                    type: 'input',
                    column: {
                        minWidth: 90,
                    },
                    form: {
                        component: {
                            placeholder: t('message.pages.demo.form.area_codePlaceholder'),
                        },
                    },
                    component: {props: {color: 'auto'}}, // 自动染色
                },
                country_english: {
                    title: t('message.pages.demo.table.columns.country_english'),
                    type: 'input',
                    column: {
                        minWidth: 120,
                    },
                    form: {
                        component: {
                            placeholder: t('message.pages.demo.form.country_englishPlaceholder'),
                        },
                    },
                    component: {props: {color: 'auto'}}, // 自动染色
                },
                country_code: {
                    title: t('message.pages.demo.table.columns.country_code'),
                    type: 'input',
                    column: {
                        minWidth: 100,
                    },
                    form: {
                        component: {
                            placeholder: t('message.pages.demo.form.country_codePlaceholder'),
                        },
                    },
                    component: {props: {color: 'auto'}}, // 自动染色
                },
                longitude: {
                    title: t('message.pages.demo.table.columns.longitude'),
                    type: 'input',
                    disabled: true,
                    column: {
                        minWidth: 100,
                    },
                    form: {
                        component: {
                            placeholder: t('message.pages.demo.form.longitudePlaceholder'),
                        },
                    },
                    component: {props: {color: 'auto'}}, // 自动染色
                },
                latitude: {
                    title: t('message.pages.demo.table.columns.latitude'),
                    type: 'input',
                    disabled: true,
                    column: {
                        minWidth: 100,
                    },
                    form: {
                        component: {
                            placeholder: t('message.pages.demo.form.latitudePlaceholder'),
                        },
                    },
                    component: {props: {color: 'auto'}}, // 自动染色
                },
                login_type: {
                    title: t('message.pages.demo.table.columns.login_type'),
                    type: 'dict-select',
                    search: {
                        disabled: false,
                    },
                    dict: dict({
                        data: [
                            {label: t('message.pages.demo.table.columns.normalLogin'), value: 1},
                            {label: t('message.pages.demo.table.columns.wechatLogin'), value: 2},
                        ],
                    }),
                    column: {
                        minWidth: 120,
                    },
                    form: {
                        component: {
                            placeholder: t('message.pages.demo.form.login_typePlaceholder'),
                        },
                    },
                },
                os: {
                    title: t('message.pages.demo.table.columns.os'),
                    type: 'input',
                    column: {
                        minWidth: 120,
                    },
                    form: {
                        component: {
                            placeholder: t('message.pages.demo.form.osPlaceholder'),
                        },
                    },
                },
                browser: {
                    title: t('message.pages.demo.table.columns.browser'),
                    type: 'input',
                    column: {
                        minWidth: 120,
                    },
                    form: {
                        component: {
                            placeholder: t('message.pages.demo.form.browserPlaceholder'),
                        },
                    },
                },
                agent: {
                    title: t('message.pages.demo.table.columns.agent'),
                    disabled: true,
                    type: 'input',
                    column: {
                        minWidth: 120,
                    },
                    form: {
                        component: {
                            placeholder: t('message.pages.demo.form.agentPlaceholder'),
                        },
                    },
                },
                ...commonCrudConfig({
                    create_datetime: {
                        search: true
                    }
                })
            },
        },
    };
};
