import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createActor } from 'xstate';
import dropableMachine from '../dropable';

describe('dropableMachine', () => {
  let element: HTMLElement;
  let dragElement1: HTMLElement;
  let dragElement2: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    element.classList.add = vi.fn();
    element.classList.remove = vi.fn();
    
    dragElement1 = document.createElement('div');
    dragElement1.id = 'drag1';
    
    dragElement2 = document.createElement('div');
    dragElement2.id = 'drag2';
    
    document.body.appendChild(element);
    document.body.appendChild(dragElement1);
    document.body.appendChild(dragElement2);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should start in dragOut state', () => {
      const actor = createActor(dropableMachine, {
        input: { element }
      });
      actor.start();

      expect(actor.getSnapshot().value).toBe('dragOut');
      actor.stop();
    });

    it('should initialize with provided element', () => {
      const actor = createActor(dropableMachine, {
        input: { element }
      });
      actor.start();

      expect(actor.getSnapshot().context.element).toBe(element);
      actor.stop();
    });

    it('should initialize with empty dragElements array', () => {
      const actor = createActor(dropableMachine, {
        input: { element }
      });
      actor.start();

      expect(actor.getSnapshot().context.dragElements).toEqual([]);
      actor.stop();
    });

    it('should remove drag-entered class on initialization', () => {
      const actor = createActor(dropableMachine, {
        input: { element }
      });
      actor.start();

      expect(element.classList.remove).toHaveBeenCalledWith('drag-entered');
      actor.stop();
    });
  });

  describe('dragEnter event', () => {
    it('should add element to dragElements array on dragEnter', () => {
      const actor = createActor(dropableMachine, {
        input: { element }
      });
      actor.start();

      actor.send({ type: 'dragEnter', element: dragElement1 });

      const snapshot = actor.getSnapshot();
      expect(snapshot.context.dragElements).toContain(dragElement1);
      actor.stop();
    });

    it('should transition to dragEntered state when element enters', () => {
      const actor = createActor(dropableMachine, {
        input: { element }
      });
      actor.start();

      actor.send({ type: 'dragEnter', element: dragElement1 });

      expect(actor.getSnapshot().value).toBe('dragEntered');
      actor.stop();
    });

    it('should add drag-entered class when element enters', () => {
      const actor = createActor(dropableMachine, {
        input: { element }
      });
      actor.start();

      actor.send({ type: 'dragEnter', element: dragElement1 });

      expect(element.classList.add).toHaveBeenCalledWith('drag-entered');
      actor.stop();
    });

    it('should not duplicate element if same element enters twice', () => {
      const actor = createActor(dropableMachine, {
        input: { element }
      });
      actor.start();

      actor.send({ type: 'dragEnter', element: dragElement1 });
      actor.send({ type: 'dragEnter', element: dragElement1 });

      const snapshot = actor.getSnapshot();
      expect(snapshot.context.dragElements.length).toBe(1);
      expect(snapshot.context.dragElements[0]).toBe(dragElement1);
      actor.stop();
    });

    it('should handle multiple different elements entering', () => {
      const actor = createActor(dropableMachine, {
        input: { element }
      });
      actor.start();

      actor.send({ type: 'dragEnter', element: dragElement1 });
      actor.send({ type: 'dragEnter', element: dragElement2 });

      const snapshot = actor.getSnapshot();
      expect(snapshot.context.dragElements).toHaveLength(2);
      expect(snapshot.context.dragElements).toContain(dragElement1);
      expect(snapshot.context.dragElements).toContain(dragElement2);
      actor.stop();
    });

    it('should remain in dragEntered state when multiple elements present', () => {
      const actor = createActor(dropableMachine, {
        input: { element }
      });
      actor.start();

      actor.send({ type: 'dragEnter', element: dragElement1 });
      actor.send({ type: 'dragEnter', element: dragElement2 });

      expect(actor.getSnapshot().value).toBe('dragEntered');
      actor.stop();
    });
  });

  describe('dragOut event', () => {
    it('should remove element from dragElements on dragOut', () => {
      const actor = createActor(dropableMachine, {
        input: { element }
      });
      actor.start();

      actor.send({ type: 'dragEnter', element: dragElement1 });
      actor.send({ type: 'dragOut', element: dragElement1 });

      const snapshot = actor.getSnapshot();
      expect(snapshot.context.dragElements).not.toContain(dragElement1);
      actor.stop();
    });

    it('should transition to dragOut state when all elements leave', () => {
      const actor = createActor(dropableMachine, {
        input: { element }
      });
      actor.start();

      actor.send({ type: 'dragEnter', element: dragElement1 });
      actor.send({ type: 'dragOut', element: dragElement1 });

      expect(actor.getSnapshot().value).toBe('dragOut');
      actor.stop();
    });

    it('should remove drag-entered class when all elements leave', () => {
      const actor = createActor(dropableMachine, {
        input: { element }
      });
      actor.start();

      actor.send({ type: 'dragEnter', element: dragElement1 });
      vi.clearAllMocks();
      actor.send({ type: 'dragOut', element: dragElement1 });

      expect(element.classList.remove).toHaveBeenCalledWith('drag-entered');
      actor.stop();
    });

    it('should remain in dragEntered when some elements still present', () => {
      const actor = createActor(dropableMachine, {
        input: { element }
      });
      actor.start();

      actor.send({ type: 'dragEnter', element: dragElement1 });
      actor.send({ type: 'dragEnter', element: dragElement2 });
      actor.send({ type: 'dragOut', element: dragElement1 });

      expect(actor.getSnapshot().value).toBe('dragEntered');
      expect(actor.getSnapshot().context.dragElements).toContain(dragElement2);
      expect(actor.getSnapshot().context.dragElements).not.toContain(dragElement1);
      actor.stop();
    });

    it('should handle dragOut for non-existent element gracefully', () => {
      const actor = createActor(dropableMachine, {
        input: { element }
      });
      actor.start();

      actor.send({ type: 'dragEnter', element: dragElement1 });
      
      const nonExistentElement = document.createElement('div');
      actor.send({ type: 'dragOut', element: nonExistentElement });

      expect(actor.getSnapshot().value).toBe('dragEntered');
      expect(actor.getSnapshot().context.dragElements).toContain(dragElement1);
      actor.stop();
    });
  });

  describe('state transitions', () => {
    it('should handle enter -> out -> enter sequence', () => {
      const actor = createActor(dropableMachine, {
        input: { element }
      });
      actor.start();

      // Enter
      actor.send({ type: 'dragEnter', element: dragElement1 });
      expect(actor.getSnapshot().value).toBe('dragEntered');

      // Out
      actor.send({ type: 'dragOut', element: dragElement1 });
      expect(actor.getSnapshot().value).toBe('dragOut');

      // Enter again
      actor.send({ type: 'dragEnter', element: dragElement1 });
      expect(actor.getSnapshot().value).toBe('dragEntered');

      actor.stop();
    });

    it('should handle multiple elements with overlapping lifecycles', () => {
      const actor = createActor(dropableMachine, {
        input: { element }
      });
      actor.start();

      actor.send({ type: 'dragEnter', element: dragElement1 });
      expect(actor.getSnapshot().value).toBe('dragEntered');
      
      actor.send({ type: 'dragEnter', element: dragElement2 });
      expect(actor.getSnapshot().value).toBe('dragEntered');
      
      actor.send({ type: 'dragOut', element: dragElement1 });
      expect(actor.getSnapshot().value).toBe('dragEntered');
      
      actor.send({ type: 'dragOut', element: dragElement2 });
      expect(actor.getSnapshot().value).toBe('dragOut');

      actor.stop();
    });
  });

  describe('guards', () => {
    it('should use hasDragElements guard correctly', () => {
      const actor = createActor(dropableMachine, {
        input: { element }
      });
      actor.start();

      // No elements - should be dragOut
      expect(actor.getSnapshot().value).toBe('dragOut');

      // Add element - should transition to dragEntered
      actor.send({ type: 'dragEnter', element: dragElement1 });
      expect(actor.getSnapshot().value).toBe('dragEntered');

      actor.stop();
    });

    it('should use hasNoDragElements guard correctly', () => {
      const actor = createActor(dropableMachine, {
        input: { element }
      });
      actor.start();

      actor.send({ type: 'dragEnter', element: dragElement1 });
      expect(actor.getSnapshot().value).toBe('dragEntered');

      // Remove all elements - should transition to dragOut
      actor.send({ type: 'dragOut', element: dragElement1 });
      expect(actor.getSnapshot().value).toBe('dragOut');

      actor.stop();
    });
  });

  describe('edge cases', () => {
    it('should handle rapid enter/exit events', () => {
      const actor = createActor(dropableMachine, {
        input: { element }
      });
      actor.start();

      for (let i = 0; i < 10; i++) {
        actor.send({ type: 'dragEnter', element: dragElement1 });
        actor.send({ type: 'dragOut', element: dragElement1 });
      }

      expect(actor.getSnapshot().value).toBe('dragOut');
      expect(actor.getSnapshot().context.dragElements).toHaveLength(0);
      actor.stop();
    });

    it('should handle many simultaneous elements', () => {
      const actor = createActor(dropableMachine, {
        input: { element }
      });
      actor.start();

      const elements: HTMLElement[] = [];
      for (let i = 0; i < 100; i++) {
        const el = document.createElement('div');
        el.id = `drag${i}`;
        elements.push(el);
        actor.send({ type: 'dragEnter', element: el });
      }

      expect(actor.getSnapshot().context.dragElements).toHaveLength(100);
      expect(actor.getSnapshot().value).toBe('dragEntered');

      // Remove all
      elements.forEach(el => {
        actor.send({ type: 'dragOut', element: el });
      });

      expect(actor.getSnapshot().value).toBe('dragOut');
      expect(actor.getSnapshot().context.dragElements).toHaveLength(0);
      actor.stop();
    });

    it('should maintain element order', () => {
      const actor = createActor(dropableMachine, {
        input: { element }
      });
      actor.start();

      actor.send({ type: 'dragEnter', element: dragElement1 });
      actor.send({ type: 'dragEnter', element: dragElement2 });

      const snapshot = actor.getSnapshot();
      expect(snapshot.context.dragElements[0]).toBe(dragElement1);
      expect(snapshot.context.dragElements[1]).toBe(dragElement2);
      actor.stop();
    });
  });
});