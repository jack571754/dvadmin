// 引入fast-crud
import {FastCrud, useTypes} from '@fast-crud/fast-crud';
import { i18n } from '/@/i18n';

const {getType} = useTypes();
import '@fast-crud/fast-crud/dist/style.css';
// Admin CRUD surface layer — must load after fast-crud's own styles to win on equal specificity.
import '/@/theme/fastCrud.scss';
import {setLogger} from '@fast-crud/fast-crud';
import {getBaseURL} from '/@/utils/baseUrl';
// element
import ui from '@fast-crud/ui-element';
import {request} from '/@/utils/service';
import { Session } from '/@/utils/storage';
//扩展包
import {FsExtendsEditor, FsExtendsUploader } from '@fast-crud/fast-extends';
import '@fast-crud/fast-extends/dist/style.css';
import {feedback} from '/@/shared/ui/feedback';
import {h} from 'vue';
import EmptyState from '/@/shared/ui/EmptyState.vue';
import XEUtils from "xe-utils";
export default {
    async install(app: any, options: any) {
        // 先安装ui
        app.use(ui);
        // 然后安装FastCrud
        app.use(FastCrud, {
            i18n, // fast-crud 国际化，支持 search/reset 按钮、操作列等界面文字
            // 此处配置公共的dictRequest（字典请求）
            async dictRequest({dict,url}: any) {
                const {isTree} = dict
                //根据dict的url，异步返回一个字典数组
                return await request({url: url, params: dict.params || {}}).then((res: any) => {
                    if (isTree) {
                        return XEUtils.toArrayTree(res.data, {parentKey: 'parent'})
                    }
                    return res.data
                });
            },
            //公共crud配置
            commonOptions() {
                return {
                    request: {
                        //接口请求配置
                        //你项目后台接口大概率与fast-crud所需要的返回结构不一致，所以需要配置此项
                        //请参考文档http://fast-crud.docmirror.cn/api/crud-options/request.html
                        transformQuery: ({page, form, sort}: any) => {
                            if (sort.asc !== undefined) {
                                form['ordering'] = `${sort.asc ? '' : '-'}${sort.prop}`;
                            }
                            //转换为你pageRequest所需要的请求参数结构
                            return {page: page.currentPage, limit: page.pageSize, ...form};
                        },
                        transformRes: ({res}: any) => {
                            //将pageRequest的返回数据，转换为fast-crud所需要的格式
                            //return {records,currentPage,pageSize,total};
                            return {records: res.data, currentPage: res.page, pageSize: res.limit, total: res.total};
                        },
                    },
                    form: {
                        afterSubmit(ctx: any) {
                            const {res} = ctx
                            // 保存成功是"用户刚触发的动作"，走 toast 而不是占右上角通知位
                            if (res?.code == 2000) {
                                feedback({ level: 'toast', tone: 'success', message: ctx.res.msg });
                            } else {
                                return
                            }
                        },
                    },
                    // 表格：去掉斑马纹与竖线。V2 用细分隔线 + 悬停底色区分行，
                    // 斑马纹会和状态标签的底色互相干扰。fast-crud 默认 stripe/border 均为 true。
                    table: {
                        stripe: false,
                        border: false,
                        bordered: false,
                        // 全局空态，替换 Element 默认的裸"暂无数据"。
                        // el-table 的 empty 插槽不带作用域，拿不到搜索条件，所以全局只给
                        // variant='empty'，且不给按钮（这里接不到新增动作，放个按钮就是点了没反应）。
                        // 页面已知筛选/出错/无权限时，用自己的 table.slots.empty 覆盖即可：
                        //   slots: { empty: () => h(EmptyState, { variant: 'filtered', onAction: clearFilters }) }
                        slots: {
                            empty: () => h(EmptyState, { variant: 'empty', actionText: '' }),
                        },
                    },
                    // 分页：去掉背景块与快速跳转，靠右对齐由 theme/fastCrud.scss 负责。
                    // 默认 layout 含 jumper，在每页 20 条的规模下是多余的。
                    pagination: {
                        background: false,
                        layout: 'total, sizes, prev, pager, next',
                        showQuickJumper: false,
                    },
                    // 搜索区：默认 col.span=4（一行 6 个），字段通常只有 2~4 个，
                    // 一行排 4 个更稳。注意布局参数必须写在 container 下面，
                    // 直接写在 search 顶级（旧写法）不会生效。
                    search: {
                        container: {
                            // 显式写出默认布局组件名，避免合并策略变化时丢字段
                            is: 'fs-search-layout-default',
                            collapse: true,
                            col: {
                                span: 6,
                            },
                        },
                    },
                    // 工具栏：内置的「列设置」按钮先关掉。
                    // fast-crud 1.28 的按钮逻辑在点击时调用 columnsFilterRef.start()，而这个面板
                    // 组件（fs-table-columns-filter）在 @fast-crud/fast-crud 与 @fast-crud/ui-element
                    // 里都没有实现，只有引用了它而不存在的代码路径，点下去直接抛错。
                    // 列自定义会在 shared/ui 里自建后重新接上（见 docs/frontend-visual-v2.md）。
                    toolbar: {
                        buttons: {
                            columns: {
                                show: false,
                            },
                        },
                    },
                };
            },
            logger: { off: { tableColumns: false } }
        });
        //富文本
        app.use(FsExtendsEditor, {
            wangEditor: {
                width: 300,
            },
        });
        // 文件上传
        app.use(FsExtendsUploader, {
            defaultType: "form",
            form: {
                action: `/api/system/file/`,
                name: "file",
                withCredentials: false,
                uploadRequest: async ({ action, file, onProgress }: { action: string; file: any; onProgress: Function }) => {
                    // @ts-ignore
                    const data = new FormData();
                    data.append("file", file);
                    return await request({
                        url: action,
                        method: "post",
                        timeout: 60000,
                        headers: {
                            "Content-Type": "multipart/form-data",
                            "Authorization": "JWT " + Session.get('token')
                        },
                        data,
                        onUploadProgress: (p: any) => {
                            onProgress({percent: Math.round((p.loaded / p.total) * 100)});
                        }
                    });
                },
                successHandle(ret: any) {
                    // 上传完成后的结果处理， 此处应返回格式为{url:xxx,key:xxx}
                    return {
                        url: getBaseURL(ret.data.url),
                        key: ret.data.id,
                        ...ret.data
                    };
                }
            },
                valueBuilder(context: any){
                    const { row, key } = context
                    return getBaseURL(row[key])
                }
        })

        setLogger({level: 'error'});
        // 设置自动染色
        const dictComponentList = ['dict-cascader', 'dict-checkbox', 'dict-radio', 'dict-select', 'dict-switch', 'dict-tree'];
        dictComponentList.forEach((val) => {
            getType(val).column.component.color = 'auto';
            getType(val).column.align = 'center';
        });
        // 设置placeholder 的默认值
        const placeholderComponentList = [
            {key: 'text', placeholder: "请输入"},
            {key: 'textarea', placeholder: "请输入"},
            {key: 'input', placeholder: "请输入"},
            {key: 'password', placeholder: "请输入"}
        ]
        placeholderComponentList.forEach((val) => {
            if (getType(val.key)?.search?.component) {
                getType(val.key).search.component.placeholder = val.placeholder;
            } else if (getType(val.key)?.search) {
                getType(val.key).search.component = {placeholder: val.placeholder};
            }
            if (getType(val.key)?.form?.component) {
                getType(val.key).form.component.placeholder = val.placeholder;
            } else if (getType(val.key)?.form) {
                getType(val.key).form.component = {placeholder: val.placeholder};
            }
            // 这里不再给文本类列表列强制 align: 'center'。长文本居中会
            // 让每行起始位置参差不齐，是表格看起来零碎的主要原因。
            // 字典/开关这类短内容仍居中（见上方 dictComponentList）。
        });
    },
};
