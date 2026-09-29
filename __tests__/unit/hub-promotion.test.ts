import {
  HUB_PROMOTION_RATE,
  HUB_PROMOTION_START_HOUR,
  HUB_PROMOTION_END_HOUR,
  isHubPromotionActive,
  getHubPromotionalFare,
} from '../../lib/promotions.ts';

describe('Hub promotion rules', () => {
  it('UT-HUB-01: promotion is active inside the configured window', () => {
    const active = new Date();
    active.setHours(HUB_PROMOTION_START_HOUR + 1, 0, 0, 0);
    expect(isHubPromotionActive(active)).toBe(true);
  });

  it('UT-HUB-02: promotion is inactive before the window', () => {
    const early = new Date();
    early.setHours(HUB_PROMOTION_START_HOUR - 1, 0, 0, 0);
    expect(isHubPromotionActive(early)).toBe(false);
  });

  it('UT-HUB-03: promotion is inactive after the window', () => {
    const late = new Date();
    late.setHours(HUB_PROMOTION_END_HOUR + 1, 0, 0, 0);
    expect(isHubPromotionActive(late)).toBe(false);
  });

  it('UT-HUB-04: fare is discounted when promotion is active', () => {
    const active = new Date();
    active.setHours(HUB_PROMOTION_START_HOUR + 1, 0, 0, 0);
    const discounted = getHubPromotionalFare(100, active);
    expect(discounted).toBeCloseTo(100 * (1 - HUB_PROMOTION_RATE), 2);
  });

  it('UT-HUB-05: fare is unchanged outside the promotion window', () => {
    const inactive = new Date();
    inactive.setHours(HUB_PROMOTION_START_HOUR - 2, 0, 0, 0);
    expect(getHubPromotionalFare(100, inactive)).toBe(100);
  });
});