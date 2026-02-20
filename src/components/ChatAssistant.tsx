import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useLocation } from "react-router-dom";

interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
  errorType?: 'credits_exhausted' | 'rate_limited' | 'gateway_rate_limited' | 'server_error';
}

// Map routes to context labels for the AI
const getPageContext = (pathname: string): { page: string; module: string } => {
  if (pathname.startsWith('/admin')) {
    return { page: pathname, module: 'admin' };
  }
  if (pathname.startsWith('/coach')) {
    return { page: pathname, module: 'coach' };
  }
  if (pathname.startsWith('/in-house')) {
    return { page: pathname, module: 'in-house' };
  }
  if (pathname.startsWith('/travel')) {
    return { page: pathname, module: 'travel' };
  }
  
  // Map specific pages
  const pageMap: Record<string, string> = {
    '/': 'home',
    '/registration': 'registration',
    '/schedule': 'schedule',
    '/teams': 'teams',
    '/fields': 'fields',
    '/rules': 'rules',
    '/about': 'about',
    '/contact': 'contact',
    '/volunteer': 'volunteer',
    '/donate': 'donate',
    '/sponsors': 'sponsors',
    '/shop': 'shop',
  };
  
  return { 
    page: pageMap[pathname] || pathname, 
    module: 'public' 
  };
};

export const ChatAssistant = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m here to help you with questions about CDBL programs, registration, rules, and more. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch user roles when component mounts
  useEffect(() => {
    const fetchUserRoles = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);
        setUserRoles(roles?.map(r => r.role) || []);
      }
    };
    fetchUserRoles();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Get current page context
    const pageContext = getPageContext(location.pathname);

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          messages: [...messages.filter(m => m.role !== 'error'), { role: 'user', content: userMessage }],
          context: {
            page: pageContext.page,
            module: pageContext.module,
            userRoles: userRoles,
          }
        }
      });

      if (error) {
        // Handle FunctionsHttpError which contains the response
        const errorBody = error.context?.body ? JSON.parse(error.context.body) : null;
        if (errorBody?.error) {
          setMessages(prev => [...prev, { 
            role: 'error', 
            content: errorBody.message,
            errorType: errorBody.error
          }]);
          return;
        }
        throw error;
      }

      if (data?.error) {
        setMessages(prev => [...prev, { 
          role: 'error', 
          content: data.message,
          errorType: data.error
        }]);
        return;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Try to parse error response
      let errorMessage = 'Something went wrong. Please try again or visit our Contact page for assistance.';
      let errorType: Message['errorType'] = 'server_error';
      
      try {
        if (error?.message) {
          const parsed = JSON.parse(error.message);
          if (parsed.error) {
            errorType = parsed.error;
            errorMessage = parsed.message;
          }
        }
      } catch {
        // Use default error message
      }
      
      setMessages(prev => [...prev, { 
        role: 'error', 
        content: errorMessage,
        errorType
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "What's the difference between In-House and Travel?",
    "When does registration open?",
    "How much does it cost to join?"
  ];

  const renderMessage = (msg: Message, idx: number) => {
    if (msg.role === 'error') {
      return (
        <div key={idx} className="flex justify-start">
          <div className="max-w-[90%] rounded-lg p-3 bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm text-destructive">{msg.content}</p>
                <div className="flex flex-wrap gap-2">
                  <Link to="/contact">
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      Contact Us
                    </Button>
                  </Link>
                  <Link to="/registration">
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      View FAQ
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[80%] rounded-lg p-3 ${
          msg.role === 'user' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        }`}>
          {msg.content}
        </div>
      </div>
    );
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
          aria-label="Chat with CDBL Assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-xl z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">CDBL Assistant</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg, idx) => renderMessage(msg, idx))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              
              {messages.length === 1 && (
                <div className="space-y-2 mt-4">
                  <p className="text-sm text-muted-foreground">Try asking:</p>
                  {suggestedQuestions.map((q, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start h-auto py-2"
                      onClick={() => setInput(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question..."
                disabled={isLoading}
              />
              <Button onClick={handleSend} size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
