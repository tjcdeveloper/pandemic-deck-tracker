import {invoke} from "@tauri-apps/api/tauri";
import bindModals from "./modal.ts";
import bindToggles from "./toggle.ts";

enum CardColour {
    BLACK = "BLACK",
    BLUE = "BLUE",
    YELLOW = "YELLOW"
}

interface Card {
    id: number,
    card_name: string,
    number_of_copies: number,
    colour: CardColour,
}

let deck: Array<Card> = [];
let unknownCards: number[] = [];
let knownCards: number[] = [];
let discardPile: number[] = [];
let elUnknownCards: HTMLDivElement;
let elKnownCards: HTMLDivElement;
let elDiscardCards: HTMLDivElement;
let elCardsTotalUnknown: HTMLDivElement;
let elCardsTotalKnown: HTMLDivElement;
let elCardsTotalDiscard: HTMLDivElement;

function cloneNode<T extends Node>(node: T): T {
    return <T>node.cloneNode(true);
}

async function loadDeck(): Promise<void> {
    await invoke<string>("load_deck")
        .then(response => {
            deck = JSON.parse(response);
            deck.sort((a: Card, b: Card) => {
                if (a.card_name < b.card_name) return -1;
                if (a.card_name > b.card_name) return 1;
                return 0;
            });
        })
        .catch(error => {
            console.error(error);
        });
}

function addCitiesToEpidemicModal() {
    const elField = document.querySelector<HTMLFieldSetElement>('#ts-epidemic-modal fieldset#ts-epidemic-cities');
    if (elField === null) {
        console.error("FATAL ERROR: Unable to find fieldset for epidemic modal radio buttons!");
        return;
    }

    const elDiv = document.createElement('div');
    elDiv.classList.add('epidemic-modal_city');
    const elRadio = document.createElement('input');
    elRadio.setAttribute('type', 'radio');
    elRadio.name = 'epidemicCity';

    deck.forEach(card => {
        const tDiv = cloneNode(elDiv);
        const tRadio = cloneNode(elRadio);
        const tLabel = document.createElement('label');
        tRadio.id = `ts-epidemic-radio-${card.id.toString()}`;
        tLabel.innerText = card.card_name;
        tLabel.setAttribute('for', tRadio.id);
        tDiv.classList.add(card.colour.toLowerCase());
        tDiv.append(tRadio, tLabel);

        tRadio.value = card.id.toString();
        elField.append(tDiv);
    });
}

function drawAndBindButtons(): void {
    const elDivBtns: HTMLDivElement | null = document.querySelector('#draw-buttons');
    if (elDivBtns === null) {
        console.error("FATAL ERROR: Unable to find container for buttons!");
        return;
    }
    const elBtn: HTMLButtonElement = document.createElement('button');
    elBtn.classList.add('btn', 'draw-btn');
    deck.forEach(card => {
        const tBtn = cloneNode(elBtn);
        tBtn.classList.add('btn-' + card.colour.toLowerCase())
        tBtn.innerText = card.card_name;
        tBtn.onclick = () => {
            moveCard(card.id);
            updateCardNumbers();
        };
        elDivBtns.append(tBtn);
    });
}

function drawTable(): void {
    const elRow = document.createElement('div');
    elRow.classList.add('row', 'card-row');
    const elDivName = document.createElement('div');
    elDivName.classList.add('col-grow');
    const elDivNum = document.createElement('div');
    elDivNum.innerText = '0';

    deck.forEach(card => {
        unknownCards[card.id] = card.number_of_copies;
        knownCards[card.id] = discardPile[card.id] = 0;

        const tNameU = cloneNode(elDivName);
        const tNumU = cloneNode(elDivNum);
        const tRowU = cloneNode(elRow);
        tNameU.innerText = `${card.card_name}:`;
        tNumU.id = `ts-num-cards-unknown-${card.id}`;
        tRowU.append(tNameU, tNumU);

        const tNameK = cloneNode(tNameU);
        const tNumK = cloneNode(elDivNum);
        const tRowK = cloneNode(elRow);
        tNumK.id = `ts-num-cards-known-${card.id}`;
        tRowK.append(tNameK, tNumK);

        const tNameD = cloneNode(tNameU);
        const tNumD = cloneNode(elDivNum);
        const tRowD = cloneNode(elRow);
        tNumD.id = `ts-num-cards-discard-${card.id}`;
        tRowD.append(tNameD, tNumD);

        elUnknownCards.append(tRowU);
        elKnownCards.append(tRowK);
        elDiscardCards.append(tRowD);
    });
    elRow.classList.add('card-total');
    elDivName.innerText = 'Total:';

    const tNameK = cloneNode(elDivName);
    elCardsTotalKnown = cloneNode(elDivNum);
    const tRowK = cloneNode(elRow);
    elCardsTotalKnown.id = 'ts-cards-total-known';
    tRowK.append(tNameK, elCardsTotalKnown);

    const tNameD = cloneNode(elDivName);
    elCardsTotalDiscard = cloneNode(elDivNum);
    const tRowD = cloneNode(elRow);
    elCardsTotalDiscard.id = 'ts-cards-total-discard';
    tRowD.append(tNameD, elCardsTotalDiscard);

    elDivNum.id = 'ts-cards-total-unknown';
    elCardsTotalUnknown = elDivNum;
    elRow.append(elDivName, elCardsTotalUnknown);

    elUnknownCards.append(elRow);
    elKnownCards.append(tRowK);
    elDiscardCards.append(tRowD);
}

function moveCard(id: number, forceFromUnknownDeck = false): void {
    if (knownCards[id] === 0 && unknownCards[id] === 0) {
        return;
    }

    (!forceFromUnknownDeck && knownCards[id] > 0) ? knownCards[id]-- : unknownCards[id]--;
    discardPile[id]++;
}

function updateCardNumbers(): void {
    let totalU: number = 0;
    let totalK: number = 0;
    let totalD: number = 0;
    unknownCards.forEach((num, id) => {
        updateNumberInCell('unknown', id, num);
        totalU += num;
    });
    knownCards.forEach((num, id) => {
        updateNumberInCell('known', id, num);
        totalK += num;
    });
    discardPile.forEach((num, id) => {
        updateNumberInCell('discard', id, num);
        totalD += num;
    });

    elCardsTotalUnknown.innerText = totalU.toString();
    elCardsTotalKnown.innerText = totalK.toString();
    elCardsTotalDiscard.innerText = totalD.toString();
}

function updateNumberInCell(col: string, id: number, num: number) {
    const div: HTMLDivElement | null = document.querySelector(`#ts-num-cards-${col}-${id}`);
    if (div === null) return;
    div.innerText = num.toString();
}

window.addEventListener("DOMContentLoaded", () => {
    loadDeck().then(() => {
        console.log("Deck loaded");
        addCitiesToEpidemicModal();
        drawTable();
        drawAndBindButtons();
        updateCardNumbers();
    });
    let elUn: HTMLDivElement | null = document.querySelector('#ts-cards-unknown');
    let elKn: HTMLDivElement | null = document.querySelector('#ts-cards-known');
    let elDi: HTMLDivElement | null = document.querySelector('#ts-cards-discard');
    if (elUn === null || elKn === null || elDi === null) {
        console.error("FATAL ERROR: Missing div for cards. Cannot continue.");
        return;
    }
    elUnknownCards = elUn;
    elKnownCards = elKn;
    elDiscardCards = elDi;

    bindModals();
    bindToggles();
});

declare global {
    interface Window { doEpidemic: Function }
}
window.doEpidemic = () => {
    console.log("Doing epidemic");
    const elCity = document.querySelector<HTMLInputElement>('#ts-epidemic-cities input:checked');
    console.log(elCity);
    if (elCity !== null) {
        moveCard(Number(elCity.value), true);
    }

    discardPile.forEach((num, id) => {
        console.log(`Moving ${num} for city ${id}`);
        knownCards[id] += num;
        discardPile[id] = 0;
    });

    updateCardNumbers();
}
