import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Tug } from '../lib';

describe('Tug library', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('makeDragable', () => {
    it('should initialize drag functionality for matching elements', () => {
      const element = document.createElement('div');
      element.className = 'draggable';
      document.body.appendChild(element);

      // Trigger load event
      window.dispatchEvent(new Event('load'));
      
      Tug.makeDragable({
        selector: '.draggable',
        options: { observe: false }
      });

      // Fast-forward timers for wait loop
      vi.advanceTimersByTime(600);

      expect(element.dataset.draggable).toBe('initialised');
    });

    it('should handle elements not present on initialization', () => {
      Tug.makeDragable({
        selector: '.draggable',
        options: { observe: false }
      });

      window.dispatchEvent(new Event('load'));
      vi.advanceTimersByTime(600);

      // Should not throw even if no elements match
      expect(document.querySelectorAll('.draggable').length).toBe(0);
    });

    it('should initialize multiple elements', () => {
      const element1 = document.createElement('div');
      element1.className = 'draggable';
      const element2 = document.createElement('div');
      element2.className = 'draggable';
      
      document.body.appendChild(element1);
      document.body.appendChild(element2);

      window.dispatchEvent(new Event('load'));
      
      Tug.makeDragable({
        selector: '.draggable',
        options: { observe: false }
      });

      vi.advanceTimersByTime(600);

      expect(element1.dataset.draggable).toBe('initialised');
      expect(element2.dataset.draggable).toBe('initialised');
    });

    it('should not reinitialize already initialized elements', () => {
      const element = document.createElement('div');
      element.className = 'draggable';
      element.dataset.draggable = 'initialised';
      document.body.appendChild(element);

      const spy = vi.spyOn(element.dataset, 'draggable', 'set');

      window.dispatchEvent(new Event('load'));
      
      Tug.makeDragable({
        selector: '.draggable',
        options: { observe: false }
      });

      vi.advanceTimersByTime(600);

      // Should not set the attribute again
      expect(spy).not.toHaveBeenCalled();
    });

    it('should handle custom drag handles', () => {
      const element = document.createElement('div');
      element.className = 'draggable';
      const handle = document.createElement('div');
      handle.className = 'handle';
      element.appendChild(handle);
      document.body.appendChild(element);

      window.dispatchEvent(new Event('load'));
      
      Tug.makeDragable({
        selector: '.draggable',
        options: { 
          observe: false,
          dragHandle: '.handle'
        }
      });

      vi.advanceTimersByTime(600);

      expect(element.dataset.draggable).toBe('initialised');
    });

    it('should handle multiple drag handles', () => {
      const element = document.createElement('div');
      element.className = 'draggable';
      const handle1 = document.createElement('div');
      handle1.className = 'handle1';
      const handle2 = document.createElement('div');
      handle2.className = 'handle2';
      element.appendChild(handle1);
      element.appendChild(handle2);
      document.body.appendChild(element);

      window.dispatchEvent(new Event('load'));
      
      Tug.makeDragable({
        selector: '.draggable',
        options: { 
          observe: false,
          dragHandle: ['.handle1', '.handle2']
        }
      });

      vi.advanceTimersByTime(600);

      expect(element.dataset.draggable).toBe('initialised');
    });

    it('should call onDrop callback when provided', () => {
      const onDropMock = vi.fn();
      const element = document.createElement('div');
      element.className = 'draggable';
      document.body.appendChild(element);

      window.dispatchEvent(new Event('load'));
      
      Tug.makeDragable({
        selector: '.draggable',
        options: { observe: false },
        onDrop: onDropMock
      });

      vi.advanceTimersByTime(600);

      // Simulate drag and drop
      element.dispatchEvent(new MouseEvent('mousedown'));
      window.dispatchEvent(new MouseEvent('mouseup'));

      expect(onDropMock).toHaveBeenCalled();
    });

    it('should observe DOM for new elements when observe is true', () => {
      Tug.makeDragable({
        selector: '.draggable',
        options: { observe: true }
      });

      window.dispatchEvent(new Event('load'));
      vi.advanceTimersByTime(600);

      // Add element after initialization
      const element = document.createElement('div');
      element.className = 'draggable';
      document.body.appendChild(element);

      // MutationObserver should catch this
      vi.advanceTimersByTime(100);
      
      expect(element.dataset.draggable).toBe('initialised');
    });

    it('should observe by default when observe option not specified', () => {
      Tug.makeDragable({
        selector: '.draggable'
      });

      window.dispatchEvent(new Event('load'));
      vi.advanceTimersByTime(600);

      const element = document.createElement('div');
      element.className = 'draggable';
      document.body.appendChild(element);

      vi.advanceTimersByTime(100);
      
      expect(element.dataset.draggable).toBe('initialised');
    });
  });

  describe('makeDropable', () => {
    it('should initialize drop functionality for matching elements', () => {
      const element = document.createElement('div');
      element.className = 'dropable';
      document.body.appendChild(element);

      window.dispatchEvent(new Event('load'));
      
      Tug.makeDropable({
        selector: '.dropable',
        options: { observe: false }
      });

      vi.advanceTimersByTime(600);

      expect(element.dataset.dropable).toBe('initialised');
    });

    it('should initialize multiple dropable elements', () => {
      const element1 = document.createElement('div');
      element1.className = 'dropable';
      const element2 = document.createElement('div');
      element2.className = 'dropable';
      
      document.body.appendChild(element1);
      document.body.appendChild(element2);

      window.dispatchEvent(new Event('load'));
      
      Tug.makeDropable({
        selector: '.dropable',
        options: { observe: false }
      });

      vi.advanceTimersByTime(600);

      expect(element1.dataset.dropable).toBe('initialised');
      expect(element2.dataset.dropable).toBe('initialised');
    });

    it('should not reinitialize already initialized elements', () => {
      const element = document.createElement('div');
      element.className = 'dropable';
      element.dataset.dropable = 'initialised';
      document.body.appendChild(element);

      const spy = vi.spyOn(element.dataset, 'dropable', 'set');

      window.dispatchEvent(new Event('load'));
      
      Tug.makeDropable({
        selector: '.dropable',
        options: { observe: false }
      });

      vi.advanceTimersByTime(600);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should observe DOM for new elements when observe is true', () => {
      Tug.makeDropable({
        selector: '.dropable',
        options: { observe: true }
      });

      window.dispatchEvent(new Event('load'));
      vi.advanceTimersByTime(600);

      const element = document.createElement('div');
      element.className = 'dropable';
      document.body.appendChild(element);

      vi.advanceTimersByTime(100);
      
      expect(element.dataset.dropable).toBe('initialised');
    });
  });

  describe('integration scenarios', () => {
    it('should handle draggable and dropable elements together', () => {
      const draggable = document.createElement('div');
      draggable.className = 'draggable';
      const dropable = document.createElement('div');
      dropable.className = 'dropable';
      
      document.body.appendChild(draggable);
      document.body.appendChild(dropable);

      window.dispatchEvent(new Event('load'));
      
      Tug.makeDragable({
        selector: '.draggable',
        options: { observe: false }
      });

      Tug.makeDropable({
        selector: '.dropable',
        options: { observe: false }
      });

      vi.advanceTimersByTime(600);

      expect(draggable.dataset.draggable).toBe('initialised');
      expect(dropable.dataset.dropable).toBe('initialised');
    });

    it('should handle elements added after initialization with observe', () => {
      Tug.makeDragable({
        selector: '.draggable',
        options: { observe: true }
      });

      Tug.makeDropable({
        selector: '.dropable',
        options: { observe: true }
      });

      window.dispatchEvent(new Event('load'));
      vi.advanceTimersByTime(600);

      const draggable = document.createElement('div');
      draggable.className = 'draggable';
      const dropable = document.createElement('div');
      dropable.className = 'dropable';
      
      document.body.appendChild(draggable);
      document.body.appendChild(dropable);

      vi.advanceTimersByTime(100);

      expect(draggable.dataset.draggable).toBe('initialised');
      expect(dropable.dataset.dropable).toBe('initialised');
    });
  });

  describe('error handling', () => {
    it('should handle missing body gracefully', () => {
      const originalBody = document.body;
      // @ts-ignore - testing edge case
      delete document.body;

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        Tug.makeDragable({
          selector: '.draggable',
          options: { observe: true }
        });
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('body not found');

      // Restore
      // @ts-ignore
      document.body = originalBody;
      consoleSpy.mockRestore();
    });

    it('should handle invalid selectors gracefully', () => {
      expect(() => {
        Tug.makeDragable({
          selector: '.nonexistent',
          options: { observe: false }
        });
        window.dispatchEvent(new Event('load'));
        vi.advanceTimersByTime(600);
      }).not.toThrow();
    });

    it('should handle null element in NodeList', () => {
      document.body.innerHTML = '';
      
      expect(() => {
        Tug.makeDragable({
          selector: '.draggable',
          options: { observe: false }
        });
        window.dispatchEvent(new Event('load'));
        vi.advanceTimersByTime(600);
      }).not.toThrow();
    });
  });
});