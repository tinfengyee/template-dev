import Query from './lib/query.js';
import AdvSearch from './lib/adv-search.js';
import DataTable from './lib/table.js';
import Upsert from './lib/upsert.js';
import RefreshBtn from './lib/refresh-btn';
import Flex1 from './lib/flex1';
import AddBtn from './lib/add-btn';
import MultiDeleteBtn from './lib/multi-delete-btn';
import AdvBtn from './lib/adv-btn';
import Pagination from './lib/pagination';
import SearchKey from './lib/search-key';
import { deepMerge, print, renderNode, cloneDeep } from '@/utils';
import { bootstrap } from './app';
import { __crud } from '../options';
import './assets/css/index.styl';

export default {
    name: 'cl-crud',

    provide() {
        return {
            crud: this
        };
    },

    data() {
        return {
            service: null,
            conf: {
                UPSERT_REFRESH: true,
                DELETE_REFRESH: true
            },
            permission: {},
            fn: {
                open: null,
                close: null,
                submit: null,
                refresh: null,
                delete: null,
                info: null,
                permission: null,
                advSearch: null,
                resize: null
            },
            dict: {
                api: {
                    list: 'list',
                    add: 'add',
                    update: 'update',
                    delete: 'delete',
                    info: 'info',
                    page: 'page'
                },
                pagination: {
                    page: 'page',
                    size: 'size'
                },
                search: {
                    keyWord: 'keyWord',
                    query: 'query'
                },
                sort: {
                    order: 'order',
                    prop: 'prop'
                },
                label: {
                    add: '添加',
                    delete: '删除',
                    update: '编辑',
                    refresh: '刷新',
                    advSearch: '高级搜素'
                }
            },
            tips: {
                add: {
                    success: '新增成功',
                    error: ''
                },
                update: {
                    success: '修改成功',
                    error: ''
                },
                delete: {
                    confirm: '此操作将永久删除选中数据，是否继续？',
                    success: '删除成功',
                    error: ''
                }
            },
            table: {
                visible: true,
                loading: false,
                data: [],
                columns: [],
                selection: [],
                props: {
                    border: true,
                    stripe: false,
                    size: 'mini',
                    'element-loading-text': '拼命加载中...',
                    'element-loading-background': 'rgba(255, 255, 255, 0.7)',
                    'element-loading-spinner': 'el-icon-loading'
                },
                on: {},
                op: {
                    props: {
                        width: 150,
                        align: 'center',
                        fixed: 'right',
                        label: '操作'
                    },

                    visible: true,

                    layout: ['edit', 'delete']
                },
                scopedSlots: {}
            },
            search: {
                query: {
                    list: [],
                    value: null,
                    multiple: false,
                    callback: null
                },

                key: {
                    placeholder: '请输入关键字',
                    selected: '',
                    value: '',
                    list: [],
                    props: {}
                },

                adv: {
                    title: '高级搜索',
                    visible: false,
                    type: 'drawer',
                    items: [],
                    form: {},
                    props: {
                        size: 'small',
                        'label-width': '120px'
                    },
                    op: {
                        visible: false,
                        confirmButtonText: '确定',
                        resetButtonText: '重置',
                        'label-width': '120px'
                    }
                }
            },
            upsert: {
                form: {},
                items: [],
                props: {
                    width: '',
                    'label-width': '80px',
                    'append-to-body': true,
                    'close-on-click-modal': false,
                    size: 'small',
                    'destroy-on-close': true,
                    drag: true
                },
                op: {
                    confirmButtonText: '保存',
                    cancelButtonText: '取消',

                    layout: ['cancel', 'confirm']
                }
            },
            pagination: {
                props: {
                    background: true,
                    small: false,
                    layout: 'total, sizes, prev, pager, next, jumper',
                    'page-sizes': [20, 50, 100, 200]
                },
                size: 20,
                page: 1,
                total: 0
            },
            layout: [
                [
                    'refresh-btn',
                    'add-btn',
                    'multi-delete-btn',
                    'query',
                    'flex1',
                    'search-key',
                    'adv-btn'
                ],
                ['data-table'],
                ['flex1', 'pagination']
            ],
            refs: {},
            params: {},
            temp: {
                refreshRd: null,
                sortLock: false
            },
            process: {
                status: false
            }
        };
    },

    components: {
        Query,
        AdvSearch,
        DataTable,
        Upsert,
        RefreshBtn,
        AddBtn,
        MultiDeleteBtn,
        SearchKey,
        AdvBtn,
        Pagination,
        Flex1
    },

    mounted() {
        this.$emit('load', bootstrap(deepMerge(this, __crud)));
    },

    methods: {
        // 检查是否有权限
        getPermission(key) {
            switch (key) {
                case 'edit':
                case 'update':
                    return this.permission['update'];
                default:
                    return this.permission[key];
            }
        },

        // 获取标签
        getLabel(key) {
            switch (key) {
                case 'edit':
                case 'update':
                    return this.dict.label['update'];
                default:
                    return this.dict.label[key];
            }
        },

        // 新增
        rowAdd() {
            this.$refs['upsert'].add();
        },

        // 编辑
        rowEdit(e) {
            this.$refs['upsert'].edit(e);
        },

        // 追加
        rowAppend(e) {
            this.$refs['upsert'].append(e);
        },

        // 关闭
        rowClose() {
            this.$refs['upsert'].hide();
        },

        // 删除
        rowDelete(...selection) {
            const tips = this.tips.delete;

            let params = {
                ids: selection.map(e => e.id).join(',')
            };

            const next = params => {
                return new Promise((resolve, reject) => {
                    this.$confirm(tips.confirm, '提示', {
                        type: 'warning'
                    })
                        .then(res => {
                            if (res == 'confirm') {
                                const reqName = this.dict.api.delete;

                                if (!this.service[reqName]) {
                                    return reject(`Request function '${reqName}' is not fount`);
                                }

                                this.service[reqName](params)
                                    .then(res => {
                                        this.$message.success(tips.success);

                                        if (this.conf['DELETE_REFRESH']) {
                                            this.refresh();
                                        }

                                        resolve(res);
                                    })
                                    .catch(err => {
                                        this.$message.error(tips.error || err);
                                        reject(err);
                                    });
                            }
                        })
                        .catch(() => {});
                });
            };

            if (this.fn.delete) {
                this.fn.delete(selection, { next });
            } else {
                next(params);
            }
        },

        // 批量删除
        deleteMulti() {
            this.rowDelete.apply(this, this.table.selection || []);
        },

        // 打开高级搜索
        openAdvSearch() {
            this.$refs['adv-search'].open();
        },

        // 关闭高级搜索
        closeAdvSearch() {
            this.$refs['adv-search'].close();
        },

        // 改变排序
        changeSort(prop, order) {
            if (order == 'desc') {
                order = 'descending';
            }

            if (order == 'asc') {
                order = 'ascending';
            }

            this.$refs['table'].sort(this.table.sort.prop, '');
            this.$refs['table'].sort(prop, order);

            this.table.sort = {
                prop,
                order
            };
        },

        // 排序刷新
        sortChange({ prop, order }) {
            if (order == 'descending') {
                order = 'desc';
            }

            if (order == 'ascending') {
                order = 'asc';
            }

            if (this.temp.sortLock) {
                this.refresh({
                    prop,
                    order,
                    page: 1
                });
            }
        },

        // 清空排序条件
        clearSort() {
            this.$refs['table'].clearSort();
        },

        // 替换请求参数字典
        paramsReplace(params) {
            const { pagination, search, sort } = this.dict;
            let a = { ...params };
            let b = { ...pagination, ...search, ...sort };

            for (let i in b) {
                if (a.hasOwnProperty(i)) {
                    if (i != b[i]) {
                        a[`_${b[i]}`] = a[i];

                        delete a[i];
                    }
                }
            }

            for (let i in a) {
                if (i[0] == '_') {
                    a[i.substr(1)] = a[i];

                    delete a[i];
                }
            }

            return a;
        },

        refresh(newParams) {
            // 分页属性
            this.params.page = this.pagination.page;
            this.params.size = this.pagination.size;

            // 设置参数
            let params = this.paramsReplace(deepMerge(this.params, newParams));

            print('请求参数', params);

            // Loading
            this.table.loading = true;

            // 预防脏数据
            let rd = (this.temp.refreshRd = Math.random());

            // 完成事件
            const done = () => {
                this.table.loading = false;
            };

            // 渲染列表
            const render = list => {
                this.table.data = list;
                done();
            };

            // 请求执行
            const next = params => {
                return new Promise((resolve, reject) => {
                    const reqName = this.dict.api.page;

                    if (!this.service[reqName]) {
                        this.table.loading = false;

                        return reject(`Request function '${reqName}' is not fount`);
                    }

                    this.service[reqName](params)
                        .then(res => {
                            if (rd != this.temp.refreshRd) {
                                return false;
                            }

                            Object.assign(this.pagination, res.pagination);

                            render(cloneDeep(res.list));
                            resolve(res);
                        })
                        .catch(err => {
                            this.$message.error(err);
                            reject(err);
                        })
                        .done(() => {
                            done();
                            this.temp.sortLock = true;
                        });
                });
            };

            if (this.fn.refresh) {
                this.fn.refresh(params, { next, done, render });
            } else {
                next(params);
            }
        },

        done() {
            this.process.status = true;
        }
    },

    render(h) {
        const rn = vnode => {
            if (vnode == 'data-table') {
                return (
                    <data-table
                        ref="table"
                        {...{
                            scopedSlots: this.$scopedSlots,
                            on: {
                                'sort-change': this.sortChange
                            }
                        }}
                    />
                );
            } else {
                return renderNode.call(this, vnode);
            }
        };

        const template = this.layout.map((e, i) => {
            if (e instanceof Array) {
                return (
                    <el-row type="flex" class={`el-row--${i}`}>
                        {e.map(rn)}
                    </el-row>
                );
            } else {
                return rn(e);
            }
        });

        return (
            this.process.status && (
                <div class="crud-index">
                    {template}

                    <adv-search ref="adv-search" />
                    <upsert ref="upsert" />
                </div>
            )
        );
    }
};
