import { AnyEventObject, createActor, StateMachine } from "xstate";
import draggableMachine from "./machines/dragable";
import { DragAndDropProps, DragProps, DropProps } from "./types";
import dropableMachine from "./machines/dropable";

const dropables: any[] = [];

export const Tug = {
    makeDragable(props: DragProps): void {
        initDragOrDropForElement(initDragableForElement(props), props)
    },
    makeDropable(props: DropProps): void {
        initDragOrDropForElement(initDropableForElement(props), props)
    }
}

const initDragOrDropForElement = (dragOrDropCallback: CallableFunction, props: DragAndDropProps): void => {
    const observer = new MutationObserver((mutationRecords: MutationRecord[]) => {
        mutationRecords.forEach((record: MutationRecord) => {

            if (record.addedNodes?.length) {
                for (let i = 0; i < record.addedNodes.length; i++) {
                    const addedNode = record.addedNodes[i] as HTMLElement;

                    if (addedNode?.matches(props.selector)) {
                        initForElement(dragOrDropCallback, addedNode);
                    }
                }
            }
        });
    });

    if (props.options?.observe || props.options?.observe === undefined) {
        if (!document.body) {
            console.error('body not found');
            return;
        }
        // start observing
        observer.observe(document.body, { childList: true, subtree: true });
    }

    addEventListener('load', () => {
        // by waiting we increase our changes 
        // of having all needed DOM elements ready
        let waitCounter = 5;

        (function wait() {
            setTimeout(() => {

                const elements = document.querySelectorAll(props.selector);
                if (elements?.length) {
                    initForElement(dragOrDropCallback, elements);
                    waitCounter = 0;
                }
                waitCounter--;

                if (waitCounter < 1) {
                    return;
                }

                wait();
            }, 100);
        })();

    });
}

const initForElement = (
    initialiser: CallableFunction,
    element: HTMLElement | NodeListOf<Element>): void => {

    if (!element || (NodeList.prototype.isPrototypeOf(element)
        && !(element as NodeListOf<Element>).length)) {
        return;
    }

    if (NodeList.prototype.isPrototypeOf(element)) {
        (element as NodeListOf<Element>).forEach(el => initialiser(el as HTMLElement))
    }
    else {
        initialiser(element as HTMLElement);
    }
}

const initDragableForElement = (props: DragProps) => (element: HTMLElement) => {
    if (element.dataset.draggable) {
        // already initialised
        return;
    }

    element.dataset.draggable = 'initialised';

    const actor = createActor(draggableMachine, { 
        input: { 
            element,
            onDrop: props.onDrop
        } 
    });
    actor.start();
    actor.on('positionChange', handleDragablePositionChange);

    if (props.options?.dragHandle) {
        if (Array.isArray(props.options.dragHandle)) {
            console.log(props.options.dragHandle)
            props.options.dragHandle.forEach(dragHandle => {
                const dragHandles = element.querySelectorAll(dragHandle) ?? [];
                listenForDragStart(dragHandles, actor);
            });
        }
        else {
            const dragHandleEl = element.querySelectorAll(props.options.dragHandle) ?? []; 
            listenForDragStart(dragHandleEl, actor)
        }
    }
    else {
        listenForDragStart([element] as unknown as NodeListOf<Element>, actor);
    }

    // mousemove has to be sent also 
    // to avoid inadvertently dropping
    // in case the cursor outruns the element
    window.addEventListener('mousemove', (event: MouseEvent) => {
        actor.send({ type: 'mousemove', mousePosition: { x: event.pageX, y: event.pageY } });
    });
    // send global mouseup event to all actors to ensure elements are eventually dropped
    window.addEventListener('mouseup', () => actor.send({ type: 'mouseup' }));
}

const listenForDragStart = (elements: NodeListOf<Element>, actor: any) => {
    elements.forEach(element => element.addEventListener('mousedown', () => {
        actor.send({ type: 'mousedown' });
    }));
} 

const handleDragablePositionChange = (event: AnyEventObject): void => {
    const intersectingRect = event.data?.getBoundingClientRect();

    if (!intersectingRect) {
        return;
    }

    for (let i = 0; i < dropables.length; i++) {
        const dropableElement = dropables[i].getSnapshot().context.element;

        if (dropableElement.isEqualNode(event.data)) {
            return;
        }

        const dropableRect = dropableElement.getBoundingClientRect();

        if (dropableRect.bottom > intersectingRect.top
            && dropableRect.right > intersectingRect.left
            && dropableRect.top < intersectingRect.bottom
            && dropableRect.left < intersectingRect.right) {
            dropables[i].send({ type: 'dragEnter', element: event.data });
        }
        else {
            dropables[i].send({ type: 'dragOut', element: event.data });
        }
    }
}

const initDropableForElement = (props?: DropProps) => (element: HTMLElement): void => {
    if (element.dataset.dropable) {
        // already initialised
        return;
    }

    element.dataset.dropable = 'initialised';

    const actor = createActor(dropableMachine, { input: { element } });
    actor.start();

    dropables.push(actor);
}