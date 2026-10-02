export const HUB_PROMOTION_RATE = 0.1;

export const getHubPromotionalFare = (amount: number) => {
  return Math.round(amount * (1 - HUB_PROMOTION_RATE) * 100) / 100;
};
