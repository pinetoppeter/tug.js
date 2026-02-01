import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createActor } from 'xstate';
import draggableMachine from '../dragable';
import * as effects from '../../effects';

vi.mock('../../effects');

describe('draggableMachine', () => {
  let element: HTMLElement;
  let onDropMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    element = document.createElement('div');
    element.classList.add = vi.fn();
    element.classList.remove = vi.fn();
    document.body.appendChild(element);
    onDropMock = vi.fn();
    
    vi.mocked(effects.updateElementPosition).mockImplementation(() => {});
    vi.mocked(effects.resetElement).mockImplementation(() => {});
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should start in idle state', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      expect(actor.getSnapshot().value).toBe('idle');
      actor.stop();
    });

    it('should initialize with provided element', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      expect(actor.getSnapshot().context.element).toBe(element);
      actor.stop();
    });

    it('should initialize with provided onDrop callback', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      expect(actor.getSnapshot().context.onDrop).toBe(onDropMock);
      actor.stop();
    });

    it('should handle missing onDrop callback', () => {
      const actor = createActor(draggableMachine, {
        input: { element }
      });
      actor.start();

      expect(actor.getSnapshot().context.onDrop).toBeUndefined();
      actor.stop();
    });
  });

  describe('mousedown event', () => {
    it('should transition from idle to dragging state on mousedown', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      actor.send({ type: 'mousedown' });

      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ dragging: 'dragIdle' });
      actor.stop();
    });

    it('should add dragging class when entering drag state', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      actor.send({ type: 'mousedown' });

      expect(element.classList.add).toHaveBeenCalledWith('dragging');
      actor.stop();
    });
  });

  describe('mousemove event during drag', () => {
    it('should transition to dragMove state on mousemove', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      actor.send({ type: 'mousedown' });
      actor.send({ type: 'mousemove', mousePosition: { x: 100, y: 50 } });

      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toEqual({ dragging: 'dragMove' });
      actor.stop();
    });

    it('should update mouse position in context', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      actor.send({ type: 'mousedown' });
      actor.send({ type: 'mousemove', mousePosition: { x: 150, y: 200 } });

      const snapshot = actor.getSnapshot();
      expect(snapshot.context.mousePosition).toEqual({ x: 150, y: 200 });
      actor.stop();
    });

    it('should call updateElementPosition', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      actor.send({ type: 'mousedown' });
      actor.send({ type: 'mousemove', mousePosition: { x: 100, y: 50 } });

      expect(effects.updateElementPosition).toHaveBeenCalledWith(
        element,
        { x: 100, y: 50 }
      );
      actor.stop();
    });

    it('should emit positionChange event', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      
      const eventListener = vi.fn();
      actor.on('positionChange', eventListener);
      actor.start();

      actor.send({ type: 'mousedown' });
      actor.send({ type: 'mousemove', mousePosition: { x: 100, y: 50 } });

      expect(eventListener).toHaveBeenCalled();
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'positionChange',
          data: element
        })
      );
      actor.stop();
    });

    it('should handle multiple mousemove events', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      actor.send({ type: 'mousedown' });
      actor.send({ type: 'mousemove', mousePosition: { x: 100, y: 50 } });
      actor.send({ type: 'mousemove', mousePosition: { x: 150, y: 75 } });
      actor.send({ type: 'mousemove', mousePosition: { x: 200, y: 100 } });

      expect(effects.updateElementPosition).toHaveBeenCalledTimes(3);
      expect(actor.getSnapshot().context.mousePosition).toEqual({ x: 200, y: 100 });
      actor.stop();
    });
  });

  describe('mouseup event', () => {
    it('should transition to dragEnd state on mouseup', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      actor.send({ type: 'mousedown' });
      actor.send({ type: 'mousemove', mousePosition: { x: 100, y: 50 } });
      actor.send({ type: 'mouseup' });

      // Should transition back to idle after dragEnd
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toBe('idle');
      actor.stop();
    });

    it('should call resetElement on mouseup', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      actor.send({ type: 'mousedown' });
      actor.send({ type: 'mouseup' });

      expect(effects.resetElement).toHaveBeenCalledWith(element);
      actor.stop();
    });

    it('should remove dragging class on mouseup', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      actor.send({ type: 'mousedown' });
      actor.send({ type: 'mouseup' });

      expect(element.classList.remove).toHaveBeenCalledWith('dragging');
      actor.stop();
    });

    it('should call onDrop callback on mouseup', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      actor.send({ type: 'mousedown' });
      actor.send({ type: 'mouseup' });

      expect(onDropMock).toHaveBeenCalledWith(element);
      actor.stop();
    });

    it('should not throw if onDrop is undefined', () => {
      const actor = createActor(draggableMachine, {
        input: { element }
      });
      actor.start();

      expect(() => {
        actor.send({ type: 'mousedown' });
        actor.send({ type: 'mouseup' });
      }).not.toThrow();
      actor.stop();
    });

    it('should return to idle state after mouseup', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      actor.send({ type: 'mousedown' });
      actor.send({ type: 'mousemove', mousePosition: { x: 100, y: 50 } });
      actor.send({ type: 'mouseup' });

      expect(actor.getSnapshot().value).toBe('idle');
      actor.stop();
    });
  });

  describe('reset event', () => {
    it('should return to idle state on reset from dragging', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      actor.send({ type: 'mousedown' });
      actor.send({ type: 'reset' });

      expect(actor.getSnapshot().value).toBe('idle');
      actor.stop();
    });

    it('should stay in idle state on reset from idle', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      actor.send({ type: 'reset' });

      expect(actor.getSnapshot().value).toBe('idle');
      actor.stop();
    });
  });

  describe('complete drag sequence', () => {
    it('should handle full drag lifecycle', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      const eventListener = vi.fn();
      actor.on('positionChange', eventListener);
      actor.start();

      // Start drag
      expect(actor.getSnapshot().value).toBe('idle');
      actor.send({ type: 'mousedown' });
      expect(actor.getSnapshot().value).toEqual({ dragging: 'dragIdle' });
      expect(element.classList.add).toHaveBeenCalledWith('dragging');

      // Move
      actor.send({ type: 'mousemove', mousePosition: { x: 100, y: 50 } });
      expect(actor.getSnapshot().value).toEqual({ dragging: 'dragMove' });
      expect(effects.updateElementPosition).toHaveBeenCalled();
      expect(eventListener).toHaveBeenCalled();

      // Drop
      actor.send({ type: 'mouseup' });
      expect(actor.getSnapshot().value).toBe('idle');
      expect(effects.resetElement).toHaveBeenCalled();
      expect(element.classList.remove).toHaveBeenCalledWith('dragging');
      expect(onDropMock).toHaveBeenCalledWith(element);

      actor.stop();
    });

    it('should handle drag without move', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      actor.send({ type: 'mousedown' });
      actor.send({ type: 'mouseup' });

      expect(actor.getSnapshot().value).toBe('idle');
      expect(onDropMock).toHaveBeenCalled();
      actor.stop();
    });

    it('should handle rapid successive drags', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      // First drag
      actor.send({ type: 'mousedown' });
      actor.send({ type: 'mousemove', mousePosition: { x: 100, y: 50 } });
      actor.send({ type: 'mouseup' });

      // Second drag
      actor.send({ type: 'mousedown' });
      actor.send({ type: 'mousemove', mousePosition: { x: 200, y: 100 } });
      actor.send({ type: 'mouseup' });

      expect(onDropMock).toHaveBeenCalledTimes(2);
      expect(actor.getSnapshot().value).toBe('idle');
      actor.stop();
    });
  });

  describe('edge cases', () => {
    it('should handle mousemove without prior mousedown', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      // This should not cause transition or errors
      actor.send({ type: 'mousemove', mousePosition: { x: 100, y: 50 } });

      expect(actor.getSnapshot().value).toBe('idle');
      expect(effects.updateElementPosition).not.toHaveBeenCalled();
      actor.stop();
    });

    it('should handle mouseup without prior mousedown', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      actor.send({ type: 'mouseup' });

      expect(actor.getSnapshot().value).toBe('idle');
      expect(onDropMock).not.toHaveBeenCalled();
      actor.stop();
    });

    it('should handle negative coordinates', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      actor.send({ type: 'mousedown' });
      actor.send({ type: 'mousemove', mousePosition: { x: -50, y: -100 } });

      expect(actor.getSnapshot().context.mousePosition).toEqual({ x: -50, y: -100 });
      expect(effects.updateElementPosition).toHaveBeenCalledWith(element, { x: -50, y: -100 });
      actor.stop();
    });

    it('should handle very large coordinates', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      actor.send({ type: 'mousedown' });
      actor.send({ type: 'mousemove', mousePosition: { x: 999999, y: 999999 } });

      expect(actor.getSnapshot().context.mousePosition).toEqual({ x: 999999, y: 999999 });
      actor.stop();
    });

    it('should handle zero coordinates', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      actor.send({ type: 'mousedown' });
      actor.send({ type: 'mousemove', mousePosition: { x: 0, y: 0 } });

      expect(actor.getSnapshot().context.mousePosition).toEqual({ x: 0, y: 0 });
      actor.stop();
    });

    it('should handle fractional coordinates', () => {
      const actor = createActor(draggableMachine, {
        input: { element, onDrop: onDropMock }
      });
      actor.start();

      actor.send({ type: 'mousedown' });
      actor.send({ type: 'mousemove', mousePosition: { x: 100.5, y: 50.7 } });

      expect(actor.getSnapshot().context.mousePosition).toEqual({ x: 100.5, y: 50.7 });
      actor.stop();
    });
  });
});