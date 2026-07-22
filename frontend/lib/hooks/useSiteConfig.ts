import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export interface SiteConfigType {
  // Brand & Theme
  primaryColor?: string;
  primaryColorHover?: string;
  fontFamily?: string;
  buttonRadius?: string;
  enableDarkMode?: boolean;
  
  // God Level Theme Extensions
  layoutDensity?: 'compact' | 'standard' | 'loose';
  buttonStyle?: 'pill' | 'rounded' | 'sharp' | 'soft-shadow' | 'neo-brutalism' | 'flat';
  animationSpeed?: 'instant' | 'smooth' | 'cinematic';
  glassmorphismLevel?: number;
  productCardStyle?: 'minimal' | 'detailed';
  customCss?: string;

  // Header & Footer
  logoUrl?: string;
  faviconUrl?: string;
  headerLayout?: string;
  ticker?: string;
  categories: Array<{ name: string; icon: string | null }>;
  whatsappNumber?: string;
  contactEmail?: string;
  instagramUrl?: string;
  footerText?: string;
  
  // God Level Engagement
  floatingWhatsApp?: boolean;
  enablePulseCTA?: boolean;
  topBannerActive?: boolean;
  topBannerText?: string;
  topBannerCountdown?: string;
  maintenanceMode?: boolean;

  // SEO
  siteTitle?: string;
  siteDesc?: string;

  // Homepage toggles & data
  showHeroSlider?: boolean;
  heroStyle?: string;
  
  showServiceBubbles?: boolean;
  bubbleRingColor?: string;
  bubbleSize?: 'sm' | 'md' | 'lg' | 'xl';   // Balon kutu boyutu: 60 / 76 / 92 / 108 px
  serviceBubbles?: Array<{
    id: number;
    title1: string;
    title2: string;
    iconUrl: string;
    link: string;
    bg: string;
    iconSize?: 'small' | 'medium' | 'large' | 'full';
  }>;

  showTrustBar?: boolean;
  trustBar: Array<{ icon: string; title: string; desc: string }>;

  // Admin / Commission Settings
  defaultCommissionRate?: number;
  inactivityThresholdDays?: number;

  // Homepage Feature Cards (Cihazını Sat, AI Finder, Trade-In)
  featureCards?: FeatureCardConfig[];
}

export interface FeatureCardConfig {
  id: 'sell' | 'ai-finder' | 'trade-in';
  enabled: boolean;
  title: string;
  description: string;
  badgeText: string;
  tag: string;
  features: [string, string, string];
  stat: string;
  statLabel: string;
  ctaText: string;
}

export function useSiteConfig() {
  return useQuery<{ settings: SiteConfigType }>({
    queryKey: ['site-config'],
    queryFn: async () => {
      const { data } = await apiClient.get('/site-config');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSiteConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSettings: SiteConfigType) => {
      const { data } = await apiClient.patch('/site-config', newSettings);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config'] });
    },
  });
}
