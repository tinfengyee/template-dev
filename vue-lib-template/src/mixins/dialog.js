export default {
    data() {
        return {
            dialog: {
                fullscreen: false
            }
        };
    },

    methods: {
        onFullScreen() {
            const { width, top } = this.props;
            const { fullscreen } = this.dialog;

            const dlg = this.$el.querySelector('.el-dialog');

            this.dialog.fullscreen = !fullscreen;

            if (!fullscreen) {
                dlg.style.marginTop = 0;
                dlg.style.marginBottom = 0;
                dlg.style.left = 0;
                dlg.style.top = 0;
                dlg.style['min-height'] = '100%';
                dlg.style.width = '100%';
            } else {
                dlg.style['min-height'] = 'auto';
                dlg.style.height = 'auto';
                dlg.style.width = width;
                dlg.style.top = top;
                dlg.style.left = 0;
                dlg.style.marginBottom = '50px';
            }
        },

        renderTitleSlot() {
            const { drag, title } = this.props;
            const { fullscreen } = this.dialog;

            return (
                <div class="el-dialog__header-slot">
                    <span
                        class={{
                            'el-dialog__header-slot-title': true,
                            _drag: drag && !fullscreen
                        }}
                        on-dblclick={this.onFullScreen}>
                        {title}
                    </span>

                    <div class="el-dialog__header-slot-button">
                        {fullscreen ? (
                            <button class="minimize" on-click={this.onFullScreen}>
                                <i class="el-icon-minus" />
                            </button>
                        ) : (
                            <button class="maximize" on-click={this.onFullScreen}>
                                <i class="el-icon-full-screen" />
                            </button>
                        )}
                        <button class="close" on-click={this.close}>
                            <i class="el-icon-close" />
                        </button>
                    </div>
                </div>
            );
        }
    }
};
