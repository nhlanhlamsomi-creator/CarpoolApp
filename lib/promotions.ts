export const HUB_PROMOTION_RATE = 0.1;
export const HUB_PROMOTION_START_HOUR = 10;
export const HUB_PROMOTION_END_HOUR = 16;

export const isHubPromotionActive = (date = new Date()) => {
  const hour = date.getHours();
  return (
    hour >= HUB_PROMOTION_START_HOUR && hour < HUB_PROMOTION_END_HOUR
  );
};

export const getHubPromotionalFare = (amount: number, date = new Date()) => {
  if (!isHubPromotionActive(date)) return amount;
  return Math.round(amount * (1 - HUB_PROMOTION_RATE) * 100) / 100;
};
