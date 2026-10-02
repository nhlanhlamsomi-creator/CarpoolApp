import {
    HUB_PROMOTION_RATE,
    getHubPromotionalFare,
} from '../../lib/promotions.ts';

describe('Hub promotion rules', () => {
  it('UT-HUB-01: applies the hub discount without a time restriction', () => {
    expect(getHubPromotionalFare(100)).toBeCloseTo(
      100 * (1 - HUB_PROMOTION_RATE),
      2,
    );
  });

  it('UT-HUB-02: rounds discounted fare to cents', () => {
    expect(getHubPromotionalFare(10.01)).toBe(9.01);
  });
});