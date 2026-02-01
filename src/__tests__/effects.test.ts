import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { updateElementPosition, resetElement } from '../effects';

describe('effects', () => {
  describe('updateElementPosition', () => {
    let element: HTMLElement;
    let rafSpy: any;

    beforeEach(() => {
      element = document.createElement('div');
      document.body.appendChild(element);
      rafSpy = vi.spyOn(window, 'requestAnimationFrame');
    });

    afterEach(() => {
      document.body.innerHTML = '';
      rafSpy.mockRestore();
    });

    it('should set position to fixed on first call', () => {
      const mousePosition = { x: 100, y: 50 };
      
      updateElementPosition(element, mousePosition);
      
      expect(element.style.position).toBe('fixed');
      expect(element.style.cursor).toBe('grabbing');
      expect(element.style.zIndex).toBe('9999');
    });

    it('should not reset position styles if already fixed', () => {
      element.style.position = 'fixed';
      element.style.cursor = 'grabbing';
      element.style.zIndex = '9999';
      
      const mousePosition = { x: 200, y: 150 };
      updateElementPosition(element, mousePosition);
      
      expect(element.style.position).toBe('fixed');
      expect(element.style.cursor).toBe('grabbing');
      expect(element.style.zIndex).toBe('9999');
    });

    it('should call requestAnimationFrame to update position', () => {
      const mousePosition = { x: 100, y: 50 };
      
      updateElementPosition(element, mousePosition);
      
      expect(rafSpy).toHaveBeenCalledTimes(1);
      expect(rafSpy).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should center element on mouse position', () => {
      // Set element dimensions
      Object.defineProperty(element, 'getBoundingClientRect', {
        value: () => ({
          width: 100,
          height: 50,
          top: 0,
          left: 0,
          bottom: 50,
          right: 100,
          x: 0,
          y: 0,
          toJSON: () => {}
        }),
        configurable: true
      });

      const mousePosition = { x: 200, y: 150 };
      
      updateElementPosition(element, mousePosition);
      
      // Execute the RAF callback
      const rafCallback = rafSpy.mock.calls[0][0] as FrameRequestCallback;
      rafCallback(0);
      
      // Element should be centered on mouse: mouseY - height/2, mouseX - width/2
      expect(element.style.top).toBe('125px'); // 150 - 25
      expect(element.style.left).toBe('150px'); // 200 - 50
    });

    it('should handle zero dimensions', () => {
      Object.defineProperty(element, 'getBoundingClientRect', {
        value: () => ({
          width: 0,
          height: 0,
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          x: 0,
          y: 0,
          toJSON: () => {}
        }),
        configurable: true
      });

      const mousePosition = { x: 100, y: 100 };
      
      updateElementPosition(element, mousePosition);
      
      const rafCallback = rafSpy.mock.calls[0][0] as FrameRequestCallback;
      rafCallback(0);
      
      expect(element.style.top).toBe('100px');
      expect(element.style.left).toBe('100px');
    });

    it('should handle negative mouse positions', () => {
      Object.defineProperty(element, 'getBoundingClientRect', {
        value: () => ({
          width: 50,
          height: 50,
          top: 0,
          left: 0,
          bottom: 50,
          right: 50,
          x: 0,
          y: 0,
          toJSON: () => {}
        }),
        configurable: true
      });

      const mousePosition = { x: -10, y: -20 };
      
      updateElementPosition(element, mousePosition);
      
      const rafCallback = rafSpy.mock.calls[0][0] as FrameRequestCallback;
      rafCallback(0);
      
      expect(element.style.top).toBe('-45px'); // -20 - 25
      expect(element.style.left).toBe('-35px'); // -10 - 25
    });

    it('should handle very large coordinates', () => {
      Object.defineProperty(element, 'getBoundingClientRect', {
        value: () => ({
          width: 100,
          height: 100,
          top: 0,
          left: 0,
          bottom: 100,
          right: 100,
          x: 0,
          y: 0,
          toJSON: () => {}
        }),
        configurable: true
      });

      const mousePosition = { x: 999999, y: 999999 };
      
      updateElementPosition(element, mousePosition);
      
      const rafCallback = rafSpy.mock.calls[0][0] as FrameRequestCallback;
      rafCallback(0);
      
      expect(element.style.top).toBe('999949px');
      expect(element.style.left).toBe('999949px');
    });

    it('should update position multiple times correctly', () => {
      Object.defineProperty(element, 'getBoundingClientRect', {
        value: () => ({
          width: 50,
          height: 50,
          top: 0,
          left: 0,
          bottom: 50,
          right: 50,
          x: 0,
          y: 0,
          toJSON: () => {}
        }),
        configurable: true
      });

      // First update
      updateElementPosition(element, { x: 100, y: 100 });
      let rafCallback = rafSpy.mock.calls[0][0] as FrameRequestCallback;
      rafCallback(0);
      
      expect(element.style.top).toBe('75px');
      expect(element.style.left).toBe('75px');

      // Second update
      updateElementPosition(element, { x: 200, y: 200 });
      rafCallback = rafSpy.mock.calls[1][0] as FrameRequestCallback;
      rafCallback(0);
      
      expect(element.style.top).toBe('175px');
      expect(element.style.left).toBe('175px');
    });

    it('should handle fractional coordinates', () => {
      Object.defineProperty(element, 'getBoundingClientRect', {
        value: () => ({
          width: 33.5,
          height: 45.7,
          top: 0,
          left: 0,
          bottom: 45.7,
          right: 33.5,
          x: 0,
          y: 0,
          toJSON: () => {}
        }),
        configurable: true
      });

      const mousePosition = { x: 100.3, y: 150.8 };
      
      updateElementPosition(element, mousePosition);
      
      const rafCallback = rafSpy.mock.calls[0][0] as FrameRequestCallback;
      rafCallback(0);
      
      expect(parseFloat(element.style.top)).toBeCloseTo(127.95);
      expect(parseFloat(element.style.left)).toBeCloseTo(83.55);
    });
  });

  describe('resetElement', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('div');
      document.body.appendChild(element);
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should remove z-index property', () => {
      element.style.zIndex = '9999';
      
      resetElement(element);
      
      expect(element.style.zIndex).toBe('');
    });

    it('should remove cursor property', () => {
      element.style.cursor = 'grabbing';
      
      resetElement(element);
      
      expect(element.style.cursor).toBe('');
    });

    it('should remove both z-index and cursor properties', () => {
      element.style.zIndex = '9999';
      element.style.cursor = 'grabbing';
      element.style.position = 'fixed';
      element.style.top = '100px';
      
      resetElement(element);
      
      expect(element.style.zIndex).toBe('');
      expect(element.style.cursor).toBe('');
      // Other properties should remain
      expect(element.style.position).toBe('fixed');
      expect(element.style.top).toBe('100px');
    });

    it('should work on element without those properties set', () => {
      expect(() => resetElement(element)).not.toThrow();
      expect(element.style.zIndex).toBe('');
      expect(element.style.cursor).toBe('');
    });

    it('should handle element with many other styles', () => {
      element.style.zIndex = '9999';
      element.style.cursor = 'grabbing';
      element.style.backgroundColor = 'red';
      element.style.width = '100px';
      element.style.height = '100px';
      element.style.margin = '10px';
      
      resetElement(element);
      
      expect(element.style.zIndex).toBe('');
      expect(element.style.cursor).toBe('');
      expect(element.style.backgroundColor).toBe('red');
      expect(element.style.width).toBe('100px');
      expect(element.style.height).toBe('100px');
      expect(element.style.margin).toBe('10px');
    });

    it('should be idempotent', () => {
      element.style.zIndex = '9999';
      element.style.cursor = 'grabbing';
      
      resetElement(element);
      resetElement(element);
      resetElement(element);
      
      expect(element.style.zIndex).toBe('');
      expect(element.style.cursor).toBe('');
    });
  });
});