export type SocialPlatform = 'linkedin' | 'facebook' | 'x';

export interface SocialTrackingParams {
  articleUrl: string;
  platform: SocialPlatform;
  campaign?: string;
  content?: string;
}

export function buildSocialTrackingUrl({
  articleUrl,
  platform,
  campaign = 'modern-php-mastery',
  content,
}: SocialTrackingParams): string {
  const url = new URL(articleUrl);
  url.searchParams.set('utm_source', platform);
  url.searchParams.set('utm_medium', 'social');
  url.searchParams.set('utm_campaign', campaign);
  if (content) {
    url.searchParams.set('utm_content', content);
  }
  return url.toString();
}
