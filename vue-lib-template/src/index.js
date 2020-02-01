import './common/index';
import { __crud, __vue } from './options';
import { deepMerge } from './utils/index';
import Crud from './crud/index';
import Form from './crud/lib/form';
import { DialogDrag } from './directive/index';

export const CRUD = {
    version: '1.4.0',

    install: function(Vue, options = {}) {
        const { crud, version = '' } = options;

        const Ver = name => {
            return `${name}${version}`;
        };

        deepMerge(__crud, crud);
        deepMerge(__vue, Vue);

        Vue.directive('dialog-drag', DialogDrag);

        Vue.component(Ver('cl-crud'), Crud);
        Vue.component(Ver('cl-form'), Form);
    }
};

export default CRUD;
