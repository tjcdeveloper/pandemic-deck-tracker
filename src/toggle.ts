interface Binds {
    elBtn: HTMLElement,
    elContent: HTMLElement,
}

let bindings: Binds[] = [];

export default function bindToggles() {
    document.querySelectorAll('.ts-toggle').forEach(wrapper => {
        const elBtn: HTMLElement | null = wrapper.querySelector('.ts-toggle-btn');
        const elCont: HTMLElement | null = wrapper.querySelector('.ts-toggle-content');
        if (elBtn === null || elCont === null) return;
        const binds: Binds = {
            elBtn: elBtn,
            elContent: elCont,
        };
        binds.elContent.classList.add('hidden');

        binds.elBtn.onclick = (ev) => {
            ev.preventDefault();
            let newText = binds.elBtn.dataset.altText ?? binds.elBtn.innerText;
            binds.elBtn.dataset.altText = binds.elBtn.innerText;
            binds.elBtn.innerText = newText;

            if (binds.elContent.classList.contains('hidden')) {
                binds.elContent.classList.remove('hidden');
            } else {
                binds.elContent.classList.add('hidden');
            }
        };

        bindings.push(binds);
    });
}
