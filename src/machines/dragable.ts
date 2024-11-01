import { assign, emit, enqueueActions, setup } from 'xstate';
import { resetElement, updateElementPosition } from '../effects';


const draggableMachine = setup({
    types: {
        context: {} as {
            element?: HTMLElement,
            mousePosition?: { x: number, y: number },
            onDrop?: CallableFunction
        },
        events: {} as
            | { type: 'mouseleave'; mousePosition: { x: number, y: number } }
            | { type: 'mousemove'; mousePosition: { x: number, y: number } }
            | { type: 'mousedown' }
            | { type: 'mouseup' }
            | { type: 'reset' },
        emitted: {} as
            | { type: string; data?: HTMLElement; }
    },
    actions: {
        // side effects
        updateElementPosition: ({ context }) => {
            if (context.element && context.mousePosition) {
                updateElementPosition(context.element, context.mousePosition)
            }
        },
        resetElementStyles: ({ context }) => {
            if (context.element) {
                resetElement(context.element);
            }
        },
        emitPositionChangeEvent: emit(({ context }) => ({
            type: 'positionChange',
            data: context.element
        })),
        // side effects
        addElementDraggingState: ({ context }) => {
            context.element?.classList.add('dragging');
        },
        removeElementDraggingState: ({ context }) => {
            context.element?.classList.remove('dragging');
        },
        runOnDropCallback: ({ context }) => {
            context.onDrop?.(context.element);
        }
    }
}).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAYlQHsBXWScgd3wG0AGAXUVAAdzZcAXXOXwcQAD0QAWAEwAaEAE9EUgOzKAdAA4AnAFYNE5VJ3NmGgGw6dAXyty0WPIVIAnOGD4t2SEN14ChIuIIALTKOppSZloSZqaRymYqcooIUgDMaWoAjGnMaVq5EjpSElpmaTZ2GDgExGoQzuhQUARQZFQ0FABuYJ4ivvyCwt5BaWFqpUbMBhqmusw6yYhpRZr5Y1ILJcZpZpUg9jVO9Y3Nre3UYJScfd4D-sOgQSWZ+gUFOllZKqpLCDFmNQ6AxRBb6dYVfb4cgQOAiQ6OYj9HiDAIjRDBb6vSLRWIaeKJZR-YJSLJqKJpKQaMLfCSU0kSfYI2pENS4CAAGzAyL8Q0CGOUmRypMMZXyFgWfyypgiWiMn0+BmYcqZ1URrIaTRa+CgPNRjzEiG+gL0eRicukK2kfwsE0FaQ0aSyOjMEmYZkFqocLJOWtavqgAElOdy7iiHvyEFllBIgbMVlESukJNaFEbiuS3dMncpHVmpF6jnVNWcdQGALLkHp6iPohDFQEaJsZV2WKZEtOpV1qLTKHLMBJaLLUjSF9UB7VQAMAUXwEBrfLrDc0zd2RWKxg7KRTZLKdMduw9YUhNiAA */
    context: ({ input }) => ({
        // @ts-ignore
        element: input?.element,
        // @ts-ignore
        onDrop: input?.onDrop
    }),
    initial: 'idle',
    on: {
        mousedown: {
            target: '.dragging'
        },
        reset: {
            target: '.idle'
        }
    },
    states: {
        idle: {
            id: 'idle'
        },
        dragging: {
            initial: 'dragIdle',
            on: {
                mousemove: {
                    target: '.dragMove',
                    actions: assign({
                        mousePosition: ({ event }) => event.mousePosition,
                    }),
                },
                mouseup: {
                    target: '.dragEnd'
                }
            },
            states: {
                dragIdle: {
                    entry: enqueueActions(({ enqueue }) => {
                        enqueue({
                            type: 'addElementDraggingState'
                        });
                    }),
                },
                dragMove: {
                    entry: enqueueActions(({ enqueue }) => {
                        enqueue({
                            type: 'updateElementPosition'
                        });
                        enqueue({
                            type: 'emitPositionChangeEvent'
                        })
                    })
                },
                dragEnd: {
                    entry: enqueueActions(({ enqueue }) => {
                        enqueue({
                            type: 'resetElementStyles'
                        });
                        enqueue({
                            type: 'removeElementDraggingState'
                        });
                        enqueue({
                            type: 'runOnDropCallback'
                        });
                        // go back to initial state
                        enqueue.raise({ type: 'reset' });
                    }),
                    type: 'final'
                }
            }
        },
    }
});

export default draggableMachine;