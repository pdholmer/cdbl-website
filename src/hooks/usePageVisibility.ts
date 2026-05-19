import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PageVisibility {
  id: string;
  page_slug: string;
  page_label: string;
  is_visible: boolean;
  hidden_message: string | null;
  hidden_by: string | null;
  hidden_at: string | null;
  updated_at: string;
}

export const usePageVisibility = () => {
  return useQuery({
    queryKey: ['page-visibility'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_visibility')
        .select('*')
        .order('page_label');
      if (error) throw error;
      return data as PageVisibility[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useIsPageVisible = (slug: string) => {
  const { data } = usePageVisibility();
  if (!data) return { isVisible: true, message: null, isLoading: true };
  const page = data.find(p => p.page_slug === slug);
  if (!page) return { isVisible: true, message: null, isLoading: false };
  return { isVisible: page.is_visible, message: page.hidden_message, isLoading: false };
};

// Map route paths to page_visibility slugs
export const routeToSlug: Record<string, string> = {
  '/registration': 'registration',
  '/teams': 'teams',
  '/travel': 'travel',
  '/travel/registration': 'travel-registration',
  '/travel/faq': 'travel-faq',
  '/in-house': 'in-house',
  '/in-house/teams': 'in-house-teams',
  '/in-house/schedule': 'in-house-schedule',
  '/in-house/rules': 'in-house-rules',
  '/schedule': 'schedule',
  '/fields': 'fields',
  '/shop': 'shop',
  '/volunteer': 'volunteer',
  '/donate': 'donate',
  '/sponsors': 'sponsors',
  '/contact': 'contact',
  '/about': 'about',
  '/board': 'board',
  '/new-to-cdbl': 'new-to-cdbl',
  '/rules': 'rules',
};

export const useHiddenSlugs = () => {
  const { data } = usePageVisibility();
  const hiddenSlugs = new Set(
    data?.filter(p => !p.is_visible).map(p => p.page_slug) || []
  );
  return hiddenSlugs;
};
