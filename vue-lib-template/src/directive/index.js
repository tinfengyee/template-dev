function onPass(el, binding) {
    const dlg = el.querySelector('.el-dialog');
    const { dialog, props } = binding.value;
    const { clientHeight } = document.body;

    if (dialog.fullscreen) {
        return false;
    }

    if (!props.drag) {
        return false;
    }

    // 超出禁用拖动
    let top = 0;

    if (['vh', '%'].some(e => props.marginTop.includes(e))) {
        top = clientHeight * (parseInt(props.marginTop) / 100);
    }

    if (props.marginTop.includes('px')) {
        top = props.marginTop;
    }

    if (dlg.clientHeight > clientHeight - 50 - top) {
        return false;
    }

    return true;
}

export const DialogDrag = {
    bind(el, binding) {
        const dlg = el.querySelector('.el-dialog');
        const hdr = el.querySelector('.el-dialog__header-slot-title');
        const sty = dlg.currentStyle || window.getComputedStyle(dlg, null);
        const pad = 5;
        const { props, dialog } = binding.value;

        if (!props.marginTop) {
            props.marginTop = '15vh';
        }

        dlg.style.marginTop = 0;
        dlg.style.top = props.fullscreen ? 0 : props.marginTop;

        const moveDown = e => {
            const { clientWidth, clientHeight } = document.body;
            const isDrag = onPass(el, binding);

            if (isDrag) {
                dlg.style.marginBottom = 0;
                hdr.style.cursor = 'move';
            } else {
                hdr.style.cursor = 'text';
                return (dlg.style.marginBottom = dialog.fullscreen ? 0 : '50px');
            }

            const disX = e.clientX - hdr.offsetLeft;
            const disY = e.clientY - hdr.offsetTop;

            let styL, styT;

            if (sty.left.includes('%')) {
                styL = +clientWidth * (+sty.left.replace(/\%/g, '') / 100);
                styT = +clientHeight * (+sty.top.replace(/\%/g, '') / 100);
            } else {
                styL = +sty.left.replace(/\px/g, '');
                styT = +sty.top.replace(/\px/g, '');
            }

            const minL = -(clientWidth - dlg.clientWidth) / 2 + pad;
            const maxL =
                (dlg.clientWidth >= clientWidth / 2
                    ? dlg.clientWidth / 2 - (dlg.clientWidth - clientWidth / 2)
                    : dlg.clientWidth / 2 + clientWidth / 2 - dlg.clientWidth) - pad;

            const minT = pad;
            const maxT = clientHeight - dlg.clientHeight - pad;

            document.onmousemove = function(e) {
                let l = e.clientX - disX + styL;
                let t = e.clientY - disY + styT;

                if (l < minL) {
                    l = minL;
                } else if (l >= maxL) {
                    l = maxL;
                }

                if (t < minT) {
                    t = minT;
                } else if (t >= maxT) {
                    t = maxT;
                }

                dlg.style.top = t + 'px';
                dlg.style.left = l + 'px';
            };

            document.onmouseup = function() {
                document.onmousemove = null;
                document.onmouseup = null;
            };
        };

        hdr.onmousedown = moveDown;
    }
};
