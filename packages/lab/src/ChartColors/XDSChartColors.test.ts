import {describe, it, expect} from 'vitest';
import {XDSChartColors} from './XDSChartColors';

describe('XDSChartColors', () => {
  describe('categorical', () => {
    it('returns empty for n=0', () => {
      expect(XDSChartColors.categorical(0)).toEqual([]);
    });

    it('returns curated colors for small n', () => {
      const colors = XDSChartColors.categorical(3);
      expect(colors).toHaveLength(3);
      expect(colors[0]).toBe('#0171E3');
      expect(colors[1]).toBe('#EB6E00');
      expect(colors[2]).toBe('#6B1EFD');
    });

    it('returns all 10 curated colors', () => {
      const colors = XDSChartColors.categorical(10);
      expect(colors).toHaveLength(10);
      colors.forEach(c => expect(c).toMatch(/^#[0-9A-Fa-f]{6}$/));
    });

    it('caps at 10', () => {
      expect(XDSChartColors.categorical(20)).toHaveLength(10);
    });
  });

  describe('sequential', () => {
    it('returns single midpoint for n=1', () => {
      const colors = XDSChartColors.sequential.blue(1);
      expect(colors).toHaveLength(1);
      expect(colors[0]).toBe('#2694FE'); // blue-3
    });

    it('returns 2-stop ramp (darkest + lightest)', () => {
      const colors = XDSChartColors.sequential.blue(2);
      expect(colors).toHaveLength(2);
      expect(colors[0]).toBe('#02165E');
      expect(colors[1]).toBe('#DBECFF');
    });

    it('returns full 5-step ramp', () => {
      const colors = XDSChartColors.sequential.blue(5);
      expect(colors).toHaveLength(5);
      expect(colors[0]).toBe('#02165E');
      expect(colors[4]).toBe('#DBECFF');
    });

    it('caps at 5', () => {
      expect(XDSChartColors.sequential.blue(10)).toHaveLength(5);
    });

    it('all hues are available', () => {
      const hues = [
        'blue',
        'shamrock',
        'orange',
        'pink',
        'purple',
        'red',
        'teal',
        'yellow',
        'gray',
      ] as const;
      hues.forEach(hue => {
        const colors = XDSChartColors.sequential[hue](3);
        expect(colors).toHaveLength(3);
        colors.forEach(c => expect(c).toMatch(/^#[0-9A-Fa-f]{6}$/));
      });
    });
  });

  describe('diverging', () => {
    it('positiveNegative returns correct size', () => {
      const colors = XDSChartColors.diverging.positiveNegative(5);
      expect(colors).toHaveLength(5);
      // Center is gray-1
      expect(colors[2]).toBe('#F1F4F7');
    });

    it('coldHot returns correct size', () => {
      const colors = XDSChartColors.diverging.coldHot(7);
      expect(colors).toHaveLength(7);
      expect(colors[3]).toBe('#F1F4F7');
    });

    it('custom allows different hues', () => {
      const colors = XDSChartColors.diverging.custom('blue', 'orange', 5);
      expect(colors).toHaveLength(5);
      expect(colors[2]).toBe('#F1F4F7');
    });

    it('custom allows custom midpoint', () => {
      const colors = XDSChartColors.diverging.custom(
        'blue',
        'orange',
        5,
        '#ffffff',
      );
      expect(colors).toHaveLength(5);
      expect(colors[2]).toBe('#ffffff');
    });

    it('returns midpoint for n=1', () => {
      const colors = XDSChartColors.diverging.positiveNegative(1);
      expect(colors).toEqual(['#F1F4F7']);
    });

    it('even n has no center', () => {
      const colors = XDSChartColors.diverging.positiveNegative(4);
      expect(colors).toHaveLength(4);
      // No gray-1 in the middle
      expect(colors).not.toContain('#F1F4F7');
    });
  });

  describe('semantic', () => {
    it('has all four semantic colors', () => {
      expect(XDSChartColors.semantic.positive).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(XDSChartColors.semantic.negative).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(XDSChartColors.semantic.warning).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(XDSChartColors.semantic.neutral).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});
