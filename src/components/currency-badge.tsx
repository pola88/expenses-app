type CurrencyBadgeProp = { currency: 'ARS' | 'USD' };

export const CurrencyBadge = ({ currency }: CurrencyBadgeProp) => {
  return currency === 'USD' ? (
    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-800">
      USD
    </span>
  ) : (
    <span className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-800">
      ARS
    </span>
  );
};
