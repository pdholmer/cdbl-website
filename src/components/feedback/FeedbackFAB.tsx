import { MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFeedbackContext } from '@/contexts/FeedbackContext';

export function FeedbackFAB() {
  const { openSlider } = useFeedbackContext();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={openSlider}
          size="icon"
          className="feedback-fab fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90"
        >
          <MessageSquarePlus className="h-6 w-6" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>Send Feedback</p>
      </TooltipContent>
    </Tooltip>
  );
}
