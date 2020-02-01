import { deepMerge, isFunction, dataset, certainProperty } from '@/utils';
import { __crud } from '../options';

export const bootstrap = that => {
    // eslint-disable-next-line
    const {
        table,
        upsert,
        tips,
        dict,
        conf,
        search,
        layout,
        refresh,
        params,
        pagination,
        permission,
        fn
    } = that;

    const app = {
        refs(k) {
            const { upsert, table, [`adv-search`]: advSearch } = that.$refs;

            const refs = (that.refs = {
                table: table.$refs['table'],
                upsert: upsert.$refs['form'],
                'adv-search': advSearch.$refs['form']
            });

            return k ? refs[k] : refs;
        },

        component() {
            return that;
        },

        data(p) {
            return dataset(
                certainProperty(that, [
                    'service',
                    'conf',
                    'tips',
                    'dict',
                    'table',
                    'search',
                    'upsert',
                    'pagination',
                    'params',
                    'layout'
                ]),
                p
            );
        },

        setData(p, d) {
            deepMerge(
                that,
                dataset(
                    certainProperty(that, [
                        'service',
                        'conf',
                        'tips',
                        'dict',
                        'table',
                        'search',
                        'upsert',
                        'pagination',
                        'params',
                        'layout'
                    ]),
                    p,
                    d
                )
            );
        },

        setForm(k, v) {
            that.$refs['upsert'].form[k] = v;
        },

        changeSort(prop, order) {
            that.changeSort(prop, order);
        },

        clearSort() {
            that.clearSort();
        },

        delete(...d) {
            that.rowDelete.apply(this, d);
        },

        info(d) {
            return that.service.info(d);
        },

        add(d) {
            that.rowAdd(d);
        },

        append(d) {
            that.rowAppend(d);
        },

        edit(d) {
            that.rowEdit(d);
        },

        close(d) {
            that.rowClose(d);
        },

        reset() {
            that.reset();
        },

        renderList(d) {
            that.table.data = d;
            that.table.loading = false;
        },

        refresh(d) {
            isFunction(d) ? d(that.params, refresh) : refresh(d);
        }
    };

    const ctx = data => {
        deepMerge(that, data);

        return ctx;
    };

    ctx.conf = d => {
        deepMerge(conf, d);

        return ctx;
    };

    ctx.service = d => {
        that.service = d;

        return ctx;
    };

    ctx.permission = x => {
        if (isFunction(x)) {
            x();
        } else {
            deepMerge(that.permission, x);
        }

        return ctx;
    };

    ctx.set = (n, x) => {
        let a = that[n];
        let b = isFunction(x) ? x(a) : x;

        if (n == 'table') {
            if (b.props) {
                const { order, prop } = b.props['default-sort'] || {};

                params.order = !order ? '' : order == 'descending' ? 'desc' : 'asc';
                params.prop = prop;
            }
        }

        if (n == 'adv') {
            a = that.search.adv;
        }

        if (n == 'layout') {
            that[n] = b;
        } else {
            deepMerge(a, b);
        }

        return ctx;
    };

    ctx.on = (name, fn) => {
        that.fn[name] = fn;

        return ctx;
    };

    ctx.done = async cb => {
        const next = async () => {
            that.done();

            if (fn.permission) {
                that.permission = deepMerge(await fn.permission(that), that.permission);
            }
        };

        if (isFunction(cb)) {
            await cb(next);
        } else {
            next();
        }
    };

    return { ctx, app };
};
