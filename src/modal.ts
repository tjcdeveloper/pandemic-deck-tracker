interface Modal {
    modal: HTMLDivElement,
    trigger: HTMLElement,
}

interface ModalArray {[index: string]: Modal}

const modals: ModalArray = {};

export function bindModals() {
    document.querySelectorAll<HTMLDivElement>('.modal').forEach(modal => {
        const trigger = document.querySelector<HTMLElement>(`#${modal.dataset.modalTriggerId}`);
        if (trigger === null) return;

        trigger.onclick = (event) => {
            event.preventDefault();
            openModal(modal.id);
        }

        modal.querySelectorAll<HTMLButtonElement>('button.modal-close').forEach((closeBtn) => {
            closeBtn.onclick = () => closeModal(modal.id)
        });
        modal.querySelectorAll<HTMLButtonElement>('button.modal-ok').forEach((okBtn) => {
            const callback = ("callback" in okBtn.dataset) ? <Function><unknown>window[<any>okBtn.dataset.callback!] : null;
            okBtn.onclick = () => closeModal(modal.id, callback);
        });

        modals[modal.id] = {
            modal,
            trigger
        };
    })
}

function openModal(id: string) {
    modals[id].modal.classList.add('open');
}

export function closeModal(id: string, callback?: Function | null): void {
    modals[id].modal.classList.remove('open');
    if (typeof callback === 'function') {
        callback();
    }
}