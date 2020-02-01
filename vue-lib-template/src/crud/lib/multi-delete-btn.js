export default {
    name: 'multi-delete-btn',

    inject: ['crud'],

    render() {
        let { dict, deleteMulti, table, permission } = this.crud;

        return (
            permission.delete && (
                <el-button
                    size="mini"
                    type="danger"
                    disabled={table.selection.length == 0}
                    on-click={deleteMulti}>
                    {dict.label.delete}
                </el-button>
            )
        );
    }
};
