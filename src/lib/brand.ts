const fallbackSiteUrl = 'http://localhost:3000';

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? fallbackSiteUrl;
  try {
    return new URL(raw).toString().replace(/\/$/, '');
  } catch {
    return fallbackSiteUrl;
  }
}

export const BRAND = {
  ownerName: 'Alireza Safaei',
  masterBrandName: 'ASDEV',
  productName: 'NexaVPN',
  productNameFa: 'نکسا وی پی ان',
  positioningEn:
    'NexaVPN by ASDEV provides secure subscription delivery with operationally stable infrastructure and support automation.',
  positioningFa:
    'NexaVPN محصول ASDEV برای ارائه سرویس اشتراکی امن با پایداری عملیاتی و اتوماسیون پشتیبانی است.',
  siteUrl: resolveSiteUrl(),
  primaryContactPath: '/',
  supportTelegram: '@nexavpn_support',
};
