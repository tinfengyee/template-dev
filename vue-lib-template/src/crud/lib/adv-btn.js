import AdvSearch from './adv-search.js';

export default {
    name: 'adv-btn',

    inject: ['crud'],

    components: {
        AdvSearch
    },

    render() {
        const { openAdvSearch, dict } = this.crud;

        return (
            <div class="crud-adv-btn">
                <el-button size="mini" on-click={openAdvSearch}>
                    <i class="el-icon-search" />
                    {dict.label.advSearch}
                </el-button>
            </div>
        );
    }
};
