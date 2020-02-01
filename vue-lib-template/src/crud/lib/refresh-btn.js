export default {
    name: 'refresh-btn',

    inject: ['crud'],

    render() {
        return (
            <el-button
                size="mini"
                on-click={() => {
                    this.crud.refresh();
                }}>
                {this.crud.dict.label.refresh}
            </el-button>
        );
    }
};
