import React, { createContext, useContext, useState, useCallback } from 'react';

interface FeedbackContextType {
  isSliderOpen: boolean;
  openSlider: () => void;
  closeSlider: () => void;
  sourcePage: string;
  sourceModule: string;
  screenshot: string | null;
  setScreenshot: (screenshot: string | null) => void;
  captureScreenshot: () => Promise<void>;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

const moduleMap: Record<string, string> = {
  '/': 'Home',
  '/about': 'About',
  '/teams': 'Teams',
  '/schedule': 'Schedule',
  '/registration': 'Registration',
  '/in-house': 'In-House',
  '/in-house/registration': 'In-House Registration',
  '/in-house/schedule': 'In-House Schedule',
  '/in-house/teams': 'In-House Teams',
  '/in-house/rules': 'In-House Rules',
  '/travel': 'Travel',
  '/travel/teams': 'Travel Teams',
  
  '/travel/faq': 'Travel FAQ',
  '/fields': 'Fields',
  '/shop': 'Shop',
  '/volunteer': 'Volunteer',
  '/donate': 'Donate',
  '/sponsors': 'Sponsors',
  '/contact': 'Contact',
  '/new-to-cdbl': 'New to CDBL',
  '/rules': 'Rules',
  '/board': 'Board Info',
  '/admin': 'Admin Dashboard',
  '/admin/dashboard': 'Admin Dashboard',
  '/admin/players': 'Admin Players',
  '/admin/teams': 'Admin Teams',
  '/admin/coaches': 'Admin Coaches',
  '/admin/schedule': 'Admin Schedule',
  '/admin/programs': 'Admin Programs',
  '/admin/divisions': 'Admin Divisions',
  '/admin/venues': 'Admin Venues',
  '/admin/drafts': 'Admin Drafts',
  '/admin/reports': 'Admin Reports',
  '/admin/site-content': 'Admin Site Content',
  '/admin/faqs': 'Admin FAQs',
  '/admin/support': 'Admin Support',
  '/admin/commissioner': 'Commissioner',
  '/admin/feedback': 'Feedback Management',
  '/coach/dashboard': 'Coach Dashboard',
  '/coach/drafts': 'Coach Drafts',
};

function getModuleName(path: string): string {
  // Check exact match first
  if (moduleMap[path]) return moduleMap[path];
  
  // Check for partial matches (for dynamic routes)
  for (const [route, name] of Object.entries(moduleMap)) {
    if (path.startsWith(route) && route !== '/') {
      return name;
    }
  }
  
  return 'Unknown Page';
}

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [sourcePage, setSourcePage] = useState('');
  const [sourceModule, setSourceModule] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const captureScreenshot = useCallback(async () => {
    try {
      // Dynamically load html2canvas
      const html2canvas = (await import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.esm.min.js' as any)).default;
      
      const element = document.querySelector('main') || document.body;
      const canvas = await html2canvas(element as HTMLElement, {
        useCORS: true,
        scale: 1,
        ignoreElements: (el: Element) => 
          el.classList.contains('feedback-fab') || 
          el.hasAttribute('data-radix-portal') ||
          el.id === 'feedback-slider',
      });
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      setScreenshot(dataUrl);
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      setScreenshot(null);
    }
  }, []);

  const openSlider = useCallback(() => {
    const currentPath = window.location.pathname;
    setSourcePage(currentPath);
    setSourceModule(getModuleName(currentPath));
    captureScreenshot();
    setIsSliderOpen(true);
  }, [captureScreenshot]);

  const closeSlider = useCallback(() => {
    setIsSliderOpen(false);
    setScreenshot(null);
  }, []);

  return (
    <FeedbackContext.Provider
      value={{
        isSliderOpen,
        openSlider,
        closeSlider,
        sourcePage,
        sourceModule,
        screenshot,
        setScreenshot,
        captureScreenshot,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedbackContext() {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedbackContext must be used within a FeedbackProvider');
  }
  return context;
}
