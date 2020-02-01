export default {
    name: 'search-key',

    inject: ['crud'],

    methods: {
        onKeyup({ keyCode }) {
            if (keyCode === 13) {
                this.search();
            }
        },

        onChange() {
            this.crud.search.key.value = '';
        },

        search() {
            const { value, selected, list } = this.crud.search.key;

            list.forEach(e => {
                this.crud.params[e.value] = '';
            });

            this.crud.refresh({
                [selected || 'keyWord']: value,
                page: 1
            });
        }
    },

    render() {
        const { search } = this.crud;
        let { list, placeholder } = search.key;

        let options = [];

        list.forEach((e, i) => {
            options.push(<el-option key={i} label={e.label} value={e.value} />);
        });

        return (
            <div class="crud-search-key">
                <el-select
                    class="crud-search-key__select"
                    v-model={this.crud.search.key.selected}
                    filterable
                    size="mini"
                    on-change={this.onChange}
                    v-show={options.length > 0}>
                    {options}
                </el-select>

                <el-input
                    class="crud-search-key__input"
                    v-model={this.crud.search.key.value}
                    placeholder={placeholder}
                    nativeOnKeyup={this.onKeyup}
                    clearable
                    size="mini"
                />

                <el-button
                    class="crud-search-key__button"
                    type="primary"
                    size="mini"
                    on-click={this.search}>
                    搜索
                </el-button>
            </div>
        );
    }
};
