export const updateElementPosition = (element: HTMLElement, mousePosition: {x: number, y: number}) => {
    window.requestAnimationFrame(() => {
        if (mousePosition && element) {
            element.style.setProperty('position', 'fixed');
            element.style.setProperty('cursor', 'grabbing');
            element.style.setProperty('z-index', '9999');
            element.style.setProperty('top', `${mousePosition.y - 20}px`);
            element.style.setProperty('left', `${mousePosition.x - 20}px`);
        }
    });
}

export const resetElement = (element: HTMLElement) => {
    element.style.removeProperty('z-index');
    element.style.removeProperty('cursor');
}