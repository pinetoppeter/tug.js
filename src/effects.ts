export const updateElementPosition = (element: HTMLElement, mousePosition: { x: number, y: number }) => {
    if (element.style.position !== 'fixed') {
        element.style.setProperty('position', 'fixed');
        element.style.setProperty('cursor', 'grabbing');
        element.style.setProperty('z-index', '9999');
    }

    window.requestAnimationFrame(() => {
        // get element top and left coords
        const clientRect: DOMRect = element.getBoundingClientRect();
        element.style.setProperty('top', `${mousePosition.y - clientRect.height / 2}px`);
        element.style.setProperty('left', `${mousePosition.x - clientRect.width / 2}px`);
    });
}

export const resetElement = (element: HTMLElement) => {
    element.style.removeProperty('z-index');
    element.style.removeProperty('cursor');
}