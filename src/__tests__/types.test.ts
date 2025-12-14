import { describe, it, expect } from 'vitest';
import type { DragAndDropProps, DragProps, DropProps } from '../types';

describe('Type definitions', () => {
  describe('DragAndDropProps', () => {
    it('should accept valid configuration with selector only', () => {
      const props: DragAndDropProps = {
        selector: '.draggable'
      };
      
      expect(props.selector).toBe('.draggable');
      expect(props.options).toBeUndefined();
    });

    it('should accept configuration with observe option', () => {
      const props: DragAndDropProps = {
        selector: '.draggable',
        options: {
          observe: true
        }
      };
      
      expect(props.options?.observe).toBe(true);
    });

    it('should accept configuration with string dragHandle', () => {
      const props: DragAndDropProps = {
        selector: '.draggable',
        options: {
          dragHandle: '.handle'
        }
      };
      
      expect(props.options?.dragHandle).toBe('.handle');
    });

    it('should accept configuration with array dragHandle', () => {
      const props: DragAndDropProps = {
        selector: '.draggable',
        options: {
          dragHandle: ['.handle1', '.handle2']
        }
      };
      
      expect(props.options?.dragHandle).toEqual(['.handle1', '.handle2']);
    });

    it('should accept configuration with all options', () => {
      const props: DragAndDropProps = {
        selector: '.draggable',
        options: {
          observe: false,
          dragHandle: '.handle'
        }
      };
      
      expect(props.selector).toBe('.draggable');
      expect(props.options?.observe).toBe(false);
      expect(props.options?.dragHandle).toBe('.handle');
    });
  });

  describe('DragProps', () => {
    it('should extend DragAndDropProps', () => {
      const props: DragProps = {
        selector: '.draggable'
      };
      
      expect(props.selector).toBe('.draggable');
    });

    it('should accept onDrop callback', () => {
      const onDrop = vi.fn();
      const props: DragProps = {
        selector: '.draggable',
        onDrop
      };
      
      expect(props.onDrop).toBe(onDrop);
    });

    it('should accept all options including onDrop', () => {
      const onDrop = vi.fn();
      const props: DragProps = {
        selector: '.draggable',
        options: {
          observe: true,
          dragHandle: '.handle'
        },
        onDrop
      };
      
      expect(props.selector).toBe('.draggable');
      expect(props.options?.observe).toBe(true);
      expect(props.options?.dragHandle).toBe('.handle');
      expect(props.onDrop).toBe(onDrop);
    });

    it('should work without onDrop', () => {
      const props: DragProps = {
        selector: '.draggable',
        options: {
          observe: true
        }
      };
      
      expect(props.onDrop).toBeUndefined();
    });
  });

  describe('DropProps', () => {
    it('should extend DragAndDropProps', () => {
      const props: DropProps = {
        selector: '.dropable'
      };
      
      expect(props.selector).toBe('.dropable');
    });

    it('should accept all DragAndDropProps options', () => {
      const props: DropProps = {
        selector: '.dropable',
        options: {
          observe: false,
          dragHandle: ['.handle1', '.handle2']
        }
      };
      
      expect(props.selector).toBe('.dropable');
      expect(props.options?.observe).toBe(false);
      expect(props.options?.dragHandle).toEqual(['.handle1', '.handle2']);
    });
  });

  describe('Type safety', () => {
    it('should enforce selector as string', () => {
      // This test validates at compile time
      const props: DragAndDropProps = {
        selector: '.test'
      };
      
      expect(typeof props.selector).toBe('string');
    });

    it('should allow observe to be boolean or undefined', () => {
      const props1: DragAndDropProps = {
        selector: '.test',
        options: { observe: true }
      };
      
      const props2: DragAndDropProps = {
        selector: '.test',
        options: { observe: false }
      };
      
      const props3: DragAndDropProps = {
        selector: '.test',
        options: {}
      };
      
      expect(typeof props1.options?.observe).toBe('boolean');
      expect(typeof props2.options?.observe).toBe('boolean');
      expect(props3.options?.observe).toBeUndefined();
    });

    it('should allow dragHandle to be string, array, or undefined', () => {
      const props1: DragAndDropProps = {
        selector: '.test',
        options: { dragHandle: '.handle' }
      };
      
      const props2: DragAndDropProps = {
        selector: '.test',
        options: { dragHandle: ['.h1', '.h2'] }
      };
      
      const props3: DragAndDropProps = {
        selector: '.test',
        options: {}
      };
      
      expect(typeof props1.options?.dragHandle).toBe('string');
      expect(Array.isArray(props2.options?.dragHandle)).toBe(true);
      expect(props3.options?.dragHandle).toBeUndefined();
    });
  });
});