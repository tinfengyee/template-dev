import { isObject, isArray, renderNode } from '@/utils/index';

export default {
    name: 'data-table',

    inject: ['crud'],

    computed: {
        table() {
            return this.crud.table;
        }
    },

    data() {
        return {
            maxHeight: null
        };
    },

    methods: {
        columnValueHandler(scope) {
            let value = scope.row[scope.prop];

            if (scope.dict) {
                let item = scope.dict.find(d => d.value == value);

                if (item) {
                    value = item.label;
                }
            }

            return scope.slot ? '' : value || scope.emptyText;
        },

        columnRender() {
            return this.table.columns
                .filter(e => !e.hidden)
                .map(item => {
                    const deep = item => {
                        let params = {
                            props: item,
                            on: item.on
                        };

                        if (!item.type) {
                            params.scopedSlots = {
                                default: scope => {
                                    let slot = this.$scopedSlots[`table-column-${item.prop}`];

                                    let newScope = {
                                        ...scope,
                                        ...item
                                    };

                                    if (slot) {
                                        return slot({
                                            scope: newScope
                                        });
                                    } else {
                                        return this.columnValueHandler(newScope);
                                    }
                                },
                                header: scope => {
                                    let slot = this.$scopedSlots[`table-header-${item.prop}`];

                                    if (slot) {
                                        return slot({
                                            scope
                                        });
                                    } else {
                                        return scope.column.label;
                                    }
                                }
                            };
                        }

                        const childrenEl = item.children ? item.children.map(deep) : null;

                        return <el-table-column {...params}>{childrenEl}</el-table-column>;
                    };

                    return deep(item);
                });
        },

        opRender() {
            const { rowEdit, rowDelete, dict, getPermission, getLabel } = this.crud;
            const { on, op } = this.table;

            const render = scope => {
                return op.layout.map(vnode => {
                    if (['edit', 'update', 'delete'].includes(vnode)) {
                        // 获取权限
                        const perm = getPermission(vnode);

                        if (perm) {
                            // 标签名
                            const label = getLabel(vnode);
                            // 点击事件
                            const onclick = () => {
                                if (vnode == 'edit' || vnode == 'update') {
                                    rowEdit(scope.row);
                                } else if (vnode == 'delete') {
                                    rowDelete(scope.row);
                                }
                            };

                            if (op.name == 'dropdown-menu') {
                                return <p on-click={onclick}>{label}</p>;
                            } else {
                                return (
                                    <el-button size="mini" type="text" on-click={onclick}>
                                        {label}
                                    </el-button>
                                );
                            }
                        }
                    } else {
                        return renderNode.call(this, vnode, { scope });
                    }
                });
            };

            return (
                <el-table-column
                    {...{
                        props: op.props,
                        scopedSlots: {
                            default: scope => {
                                let el = null;

                                if (op.name == 'dropdown-menu') {
                                    const slot = this.$scopedSlots['table-op-dropdown-menu'];
                                    const { width } = op['dropdown-menu'] || {};
                                    const items = render(scope).map(e => {
                                        return <el-dropdown-item>{e}</el-dropdown-item>;
                                    });

                                    el = (
                                        <el-dropdown
                                            {...{
                                                on,
                                                props: {
                                                    trigger: 'click',
                                                    ...op.props
                                                }
                                            }}>
                                            {slot ? (
                                                slot({ scope })
                                            ) : (
                                                <span class="el-dropdown-link">
                                                    <span>更多操作</span>
                                                    <i class="el-icon-arrow-down el-icon--right"></i>
                                                </span>
                                            )}

                                            <el-dropdown-menu
                                                style={{ width }}
                                                {...{ slot: 'dropdown' }}>
                                                {items}
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                    );
                                } else {
                                    el = render(scope);
                                }

                                return (
                                    <div class="column-op" class={['column-op', `_${op.name}`]}>
                                        {el}
                                    </div>
                                );
                            }
                        }
                    }}
                />
            );
        },

        emptyRender(h) {
            const empty = this.$scopedSlots['table-empty'] || this.table.scopedSlots.empty;
            const scope = {
                h,
                scope: this.table
            };

            if (empty) {
                this.table.scopedSlots.empty = () => {
                    return empty(scope);
                };
            }
        },

        sort(prop, order) {
            this.$refs['table'].sort(prop, order);
        },

        clearSort() {
            this.$refs['table'].clearSort();
        },

        selectionChange(selection) {
            const { ['selection-change']: selectionChange } = this.table.on || {};
            this.table.selection = selection;

            if (selectionChange) {
                selectionChange(selection);
            }
        },

        sortChange(value) {
            this.$emit('sort-change', value);
        },

        calcHeight() {
            const el = document.querySelector('.crud-index');
            const { height = '' } = this.table.props || {};

            if (el) {
                let rows = document.querySelectorAll('.crud-index > .el-row');

                let h = 20;

                for (let i = 0; i < rows.length; i++) {
                    let f = true;

                    for (let j = 0; j < rows[i].childNodes.length; j++) {
                        if (rows[i].childNodes[j].className == 'crud-data-table') {
                            f = false;
                        }
                    }

                    if (f) {
                        h += rows[i].clientHeight + 10;
                    }
                }

                let h1 = Number(String(height).replace('px', ''));
                let h2 = el.clientHeight - h;

                this.maxHeight = h1 > h2 ? h1 : h2;
            }
        },

        resize() {
            this.calcHeight();

            const { resize } = this.crud.fn;

            if (resize) {
                resize({ tableMaxHeight: this.maxHeight });
            }
        },

        renderEl(h) {
            this.emptyRender(h);

            return {
                columnEl: this.columnRender(),
                opEl: this.opRender()
            };
        }
    },

    mounted() {
        window.removeEventListener('resize', function() {});
        window.addEventListener('resize', () => {
            this.resize();
        });

        this.resize();
    },

    render(h) {
        const { data, op, loading } = this.table;
        const { columnEl, opEl } = this.renderEl(h);

        return (
            this.table.visible && (
                <div class="crud-data-table">
                    {
                        <el-table
                            ref="table"
                            data={data}
                            on-selection-change={this.selectionChange}
                            on-sort-change={this.sortChange}
                            v-loading={loading}
                            max-height={this.maxHeight + 'px'}
                            {...this.table}>
                            {columnEl}
                            {op.visible && opEl}
                        </el-table>
                    }
                </div>
            )
        );
    }
};
