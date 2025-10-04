import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Tag, HelpCircle, ArrowRight } from "lucide-react";
import { searchContent } from "@/data/searchData";
import { Card } from "@/components/ui/card";

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Column 1: Live Search Results */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground mb-4">
                <FileText className="h-4 w-4" />
                <span>Search Results</span>
              </div>
              <div className="space-y-2">
                  {results.pages.length > 0 ? (
                    results.pages.map((page) => (
                      <Card
                        key={page.path}
                        className="p-4 cursor-pointer hover:bg-accent transition-colors group"
                        onClick={() => handleNavigate(page.path)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {page.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {page.description}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No results found</p>
                  )}
                </div>
            </div>

            {/* Column 2: Common Topics */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground mb-4">
                <Tag className="h-4 w-4" />
                <span>Common Topics</span>
              </div>
              <div className="space-y-3">
                  {results.topics.map((topic, index) => (
                    <div key={index}>
                      {index === 0 || topic.category !== results.topics[index - 1].category ? (
                        <div className="text-xs font-medium text-muted-foreground uppercase mb-2 mt-4 first:mt-0">
                          {topic.category}
                        </div>
                      ) : null}
                      <button
                        onClick={() => handleNavigate(topic.path)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors group flex items-center justify-between"
                      >
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {topic.title}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                      </button>
                    </div>
                  ))}
                </div>
            </div>

            {/* Column 3: FAQs */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground mb-4">
                <HelpCircle className="h-4 w-4" />
                <span>Frequently Asked</span>
              </div>
              <div className="space-y-3">
                  {results.faqs.map((faq, index) => (
                    <Card
                      key={index}
                      className="p-4 cursor-pointer hover:bg-accent transition-colors group"
                      onClick={() => handleNavigate(faq.link)}
                    >
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
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
