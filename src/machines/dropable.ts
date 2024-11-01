import { assign, enqueueActions, setup } from 'xstate';


const dropableMachine = setup({
    types: {
        context: {} as {
            element: HTMLElement;
            dragElements: HTMLElement[]
        },
        events: {} as
            | { type: 'dragEnter'; element: HTMLElement }
            | { type: 'dragOut'; element: HTMLElement }
    },
    actions: {
        // side effects
        addElementEnterState: ({ context }) => {
            context.element.classList.add('drag-entered');
        },
        removeElementEnterState: ({ context }) => {
            context.element.classList.remove('drag-entered');
        }
    },
    guards: {
        hasDragElements: ({ context }) => {
            return context.dragElements.length > 0;
        },
        hasNoDragElements: ({ context }) => {
            return context.dragElements.length < 1;
        }
    }
}).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAYggCd0oBRfAFzHIG0AGAXUVAAcB7WXOrh75OIAB6IAnADoA7LICsLAGyzlAZnUAmACzKW6yQBoQAT0QBaZVuk6dARnvLl9rQsnaHAXy8m0WPEJSVg4kEF5+QWFRCQQLWXtpdQ0dFXtJZwAOFmMzRAcZTKU3e1kddTtDHz8MHAJiEiZ7UO4+ASERMNjXTLldBXTZNy1lSUkdE3MELVkWJIUlBJZl611qkH86oOkKKloGckgySigAeQBXOhDRCPborvzM5VscmYrlTMcMycR1e3VpJIlMlku5RmofL4QPgeBA4KJNoFiDc2lFOqBYhYvkkUmkMh8cj8EKpAR90uoVE8FhV1oj6kQdicLnQUZEOjFfvZeo51NlMmNtLJNET7AtpP8dEUPAZlA49LTakiGbsaPRGJBWXd0eJEFpskl0nYtOlloLlESdAodHJLUNxvo9LJxpCvEA */
    context: ({ input }) => ({
        // @ts-ignore
        element: input?.element,
        dragElements: []
    }),
    initial: 'dragOut',
    on: {
        // dragEnter is always possible, event if an element already entered
        dragEnter: {
            actions: assign({
                dragElements: ({ context, event }) => {
                    return !context.dragElements.includes(event.element)
                        ? context.dragElements.concat([event.element])
                        : context.dragElements;
                }
            })
        },
    },
    always: [
        {
            guard: 'hasDragElements',
            target: '.dragEntered'
        },
        {
            guard: 'hasNoDragElements',
            target: '.dragOut'
        },
    ],
    states: {
        dragOut: {
            entry: enqueueActions(({ enqueue }) => {
                enqueue({
                    type: 'removeElementEnterState'
                });
            })
        },
        dragEntered: {
            entry: enqueueActions(({ enqueue }) => {
                enqueue({
                    type: 'addElementEnterState'
                });
            }),
            on: {
                dragOut: {
                    actions: assign({
                        dragElements: ({ context, event }) => context.dragElements.filter(item => item !== event.element)
                    })
                }
            }
        }
    }
});

export default dropableMachine;