export default {
    name: 'pagination',

    inject: ['crud'],

    methods: {
        currentChange(index) {
            this.crud.refresh({
                page: index
            });
        },

        sizeChange(size) {
            this.crud.pagination.size = size;

            this.crud.refresh({
                size
            });
        }
    },

    render() {
        const { pagination } = this.crud;
        const { props, page, size, total } = pagination;

        return (
            <el-pagination
                on-size-change={this.sizeChange}
                on-current-change={this.currentChange}
                {...props}
                layout={props.layout}
                current-page={page}
                page-size={size}
                total={total}
            />
        );
    }
};
