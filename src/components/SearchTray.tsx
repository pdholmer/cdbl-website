import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, HelpCircle, ArrowRight } from "lucide-react";
import { searchContent } from "@/data/searchData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SearchTrayProps {
  isOpen: boolean;
  searchQuery: string;
  onClose: () => void;
}

const SearchTray = ({ isOpen, searchQuery, onClose }: SearchTrayProps) => {
  const navigate = useNavigate();
  const trayRef = useRef<HTMLDivElement>(null);
  
  const results = searchContent(searchQuery);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed left-0 right-0 bottom-0 top-[144px] bg-background/80 backdrop-blur-sm z-30 animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Search Tray */}
      <div
        ref={trayRef}
        className="fixed left-0 right-0 top-[144px] z-40 bg-background border-b border-border shadow-2xl animate-in fade-in duration-300"
        role="dialog"
        aria-label="Search results"
      >
        <div className="container mx-auto px-4 py-8 max-h-[calc(100vh-144px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Column 1: Live Search Results */}
            <Card className="space-y-4 bg-card p-6 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground mb-4">
                <FileText className="h-4 w-4" />
                <span>Search Results</span>
              </div>
              <div className="space-y-3">
                  {results.pages.length > 0 ? (
                    results.pages.map((page) => (
                      <Card
                        key={page.path}
                        className="p-4 cursor-pointer hover:bg-primary transition-colors group"
                        onClick={() => handleNavigate(page.path)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {page.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {page.category}
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-bold text-base text-foreground group-hover:text-white transition-colors mb-1">
                              {page.title}
                            </h3>
                            <p className="text-sm text-muted-foreground group-hover:text-white/90 transition-colors">
                              {page.description}
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-white transition-all group-hover:translate-x-1 flex-shrink-0 mt-1" />
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No results found</p>
                  )}
                </div>
            </Card>

            {/* Column 2: FAQs with Primary Blue Background */}
            <div className="space-y-4 bg-primary p-6 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase text-white mb-4">
                <HelpCircle className="h-4 w-4" />
                <span>Frequently Asked</span>
              </div>
              <div className="space-y-3">
                  {results.faqs.map((faq, index) => (
                    <Card
                      key={index}
                      className="p-4 cursor-pointer bg-white hover:shadow-lg transition-all group"
                      onClick={() => handleNavigate(faq.link)}
                    >
                      <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                        {faq.question}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {faq.answer}
                      </p>
                    </Card>
                  ))}
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchTray;
