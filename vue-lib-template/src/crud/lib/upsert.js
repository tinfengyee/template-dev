import {
    renderForm,
    renderNode,
    certainProperty,
    isArray,
    isObject,
    isString,
    cloneDeep,
    resetForm,
    clearForm
} from '@/utils';
import DialogMixin from '@/mixins/dialog';

export default {
    inject: ['crud'],
    mixins: [DialogMixin],

    data() {
        return {
            visible: false,
            loading: false,
            saving: false,
            isEdit: false,
            items: [],
            op: {},
            form: {},
            props: {}
        };
    },

    methods: {
        open(callback) {
            let { props, items, op, form } = this.crud.upsert;

            this.visible = true;

            this.form = form;
            this.items = items;
            this.props = props;
            this.op = op;

            if (!props.title) {
                props.title = this.isEdit ? '编辑' : '新增';
            }

            if (!props.top) {
                props.top = '15vh';
            }

            if (!props.width) {
                props.width = '50%';
            }

            this.dialog.fullscreen = props.fullscreen;

            this.items.forEach(e => {
                this.$set(this.form, e.prop, cloneDeep(e.value));
            });

            this.$nextTick(() => {
                if (callback) callback();
            });
        },

        close() {
            // reset value
            clearForm(this.form);

            // clear status
            this.visible = false;
            this.loading = false;
            this.saving = false;

            this.emit('close', this.isEdit);
        },

        clear() {
            clearForm(this.form);
        },

        reset() {
            this.resetForm(this.items, this.form);
        },

        emit(name, ...args) {
            const fn = this.crud.fn[name];

            if (fn) {
                fn.apply(this, args);
            }
        },

        edit(data) {
            const { fn, dict, service } = this.crud;

            const done = obj => {
                for (let i in obj) {
                    this.form[i] = obj[i];
                }

                this.emit('open', true, this.form);
                this.loading = false;
            };

            const next = data => {
                return new Promise((resolve, reject) => {
                    const reqName = dict.api.info;

                    if (!service[reqName]) {
                        this.loading = false;

                        return reject(`Request function '${reqName}' is not fount`);
                    }

                    service[reqName]({
                        id: data.id
                    })
                        .then(res => {
                            done(res);
                            resolve(res);
                        })
                        .catch(err => {
                            this.$message.error(err);
                            reject(err);
                        })
                        .done(() => {
                            this.loading = false;
                        });
                });
            };

            this.loading = true;
            this.isEdit = true;

            this.open(() => {
                if (fn.info) {
                    this.emit('info', data, { next, done });
                } else {
                    next(data);
                }
            });
        },

        add() {
            this.isEdit = false;

            this.open(() => {
                this.emit('open', false);
            });
        },

        append(data) {
            this.isEdit = false;

            this.open(() => {
                if (data) {
                    Object.assign(this.form, data);
                }

                this.emit('open', false, data);
            });
        },

        save() {
            this.$refs['form'].validate(async valid => {
                if (valid) {
                    const { conf, dict, service, fn } = this.crud;

                    const done = () => {
                        this.saving = false;
                    };

                    const next = data => {
                        const method = this.isEdit ? 'update' : 'add';
                        const tips = this.crud.tips[method];

                        return new Promise((resolve, reject) => {
                            const reqName = dict.api[method];

                            if (!service[reqName]) {
                                this.saving = false;

                                return reject(`Request function '${reqName}' is not fount`);
                            }

                            service[reqName](data)
                                .then(res => {
                                    this.$message.success(tips.success);
                                    this.close();

                                    if (conf['UPSERT_REFRESH']) {
                                        this.crud.refresh();
                                    }

                                    resolve(res);
                                })
                                .catch(err => {
                                    this.$message.error(tips.error || err);
                                    reject(err);
                                })
                                .done(() => {
                                    this.saving = false;
                                });
                        });
                    };

                    let data = cloneDeep(this.form);

                    this.saving = true;

                    if (fn.submit) {
                        this.emit('submit', this.isEdit, data, { next, done });
                    } else {
                        next(data);
                    }
                }
            });
        }
    },

    render() {
        const formEl = renderForm.call(this);
        const titleEl = this.renderTitleSlot();
        const { confirmButtonText, cancelButtonText, layout } = this.op;

        return (
            this.visible && (
                <el-dialog
                    class="crud-upsert-dialog"
                    {...{
                        props: this.props,

                        on: {
                            close: this.close
                        },

                        directives: [
                            {
                                name: 'dialog-drag',
                                value: certainProperty(this, ['props', 'dialog'])
                            }
                        ]
                    }}
                    visible={this.visible}>
                    {formEl}
                    <template slot="title">{titleEl}</template>

                    <template slot="footer">
                        {layout.map(vnode => {
                            if (vnode == 'confirm') {
                                return (
                                    <el-button
                                        size={this.props.size}
                                        type="success"
                                        {...{
                                            on: {
                                                click: this.save
                                            },

                                            props: {
                                                loading: this.saving,
                                                disabled: this.loading
                                            }
                                        }}>
                                        {confirmButtonText}
                                    </el-button>
                                );
                            } else if (vnode == 'cancel') {
                                return (
                                    <el-button size={this.props.size} on-click={this.close}>
                                        {cancelButtonText}
                                    </el-button>
                                );
                            } else {
                                return renderNode.call(this, vnode);
                            }
                        })}
                    </template>
                </el-dialog>
            )
        );
    }
};
