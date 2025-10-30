import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChatBubble } from "@/components/ChatBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { getTeamsByLeague, TeamOption } from "@/data/teamData";
import { Check } from "lucide-react";

interface FindMyTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamSelected: (teamId: string, teamName: string, league: 'in-house' | 'travel') => void;
}

type Step = 'welcome' | 'league-selection' | 'team-selection' | 'confirmation';

export const FindMyTeamModal = ({ open, onOpenChange, onTeamSelected }: FindMyTeamModalProps) => {
  const [step, setStep] = useState<Step>('welcome');
  const [selectedLeague, setSelectedLeague] = useState<'in-house' | 'travel' | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamOption | null>(null);
  const [showTyping, setShowTyping] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; type: 'bot' | 'user' }>>([]);

  useEffect(() => {
    if (open) {
      // Reset state when modal opens
      setStep('welcome');
      setSelectedLeague(null);
      setSelectedTeam(null);
      setMessages([]);
      
      // Show welcome message after brief delay
      setTimeout(() => {
        setMessages([{ text: "Hi there! Which league is your team in?", type: 'bot' }]);
        setStep('league-selection');
      }, 300);
    }
  }, [open]);

  const handleLeagueSelect = (league: 'in-house' | 'travel') => {
    setSelectedLeague(league);
    const leagueName = league === 'in-house' ? 'In-House League' : 'Travel League';
    setMessages(prev => [...prev, { text: leagueName, type: 'user' }]);
    
    setShowTyping(true);
    setTimeout(() => {
      setShowTyping(false);
      setMessages(prev => [...prev, { text: "Great! Which team are you looking for?", type: 'bot' }]);
      setStep('team-selection');
    }, 800);
  };

  const handleTeamSelect = (team: TeamOption) => {
    setSelectedTeam(team);
    setMessages(prev => [...prev, { text: team.name, type: 'user' }]);
    
    setShowTyping(true);
    setTimeout(() => {
      setShowTyping(false);
      setMessages(prev => [...prev, { 
        text: `Perfect! Loading schedule for ${team.name}...`, 
        type: 'bot' 
      }]);
      setStep('confirmation');
      
      setTimeout(() => {
        onTeamSelected(team.id, team.name, team.league);
        onOpenChange(false);
      }, 1200);
    }, 800);
  };

  const availableTeams = selectedLeague ? getTeamsByLeague(selectedLeague) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Find My Team 🧢</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 py-4 px-1">
          {messages.map((msg, idx) => (
            <ChatBubble key={idx} message={msg.text} type={msg.type} />
          ))}
          
          {showTyping && <TypingIndicator />}
          
          {step === 'league-selection' && !showTyping && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 animate-fade-in">
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleLeagueSelect('in-house')}
                className="h-auto py-4 px-6 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary transition-all"
              >
                <span className="text-2xl">🧢</span>
                <span className="font-semibold">In-House League</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleLeagueSelect('travel')}
                className="h-auto py-4 px-6 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary transition-all"
              >
                <span className="text-2xl">🚀</span>
                <span className="font-semibold">Travel League</span>
              </Button>
            </div>
          )}
          
          {step === 'team-selection' && !showTyping && (
            <div className="grid grid-cols-1 gap-2 pt-2 animate-fade-in">
              {availableTeams.map((team) => (
                <Button
                  key={team.id}
                  size="lg"
                  variant="outline"
                  onClick={() => handleTeamSelect(team)}
                  className="h-auto py-3 justify-start hover:bg-primary/10 hover:border-primary transition-all"
                >
                  <span className="font-semibold">{team.name}</span>
                  {team.division && (
                    <span className="text-xs text-muted-foreground ml-2">({team.division})</span>
                  )}
                </Button>
              ))}
            </div>
          )}
          
          {step === 'confirmation' && (
            <div className="flex items-center justify-center py-8 animate-fade-in">
              <div className="flex items-center gap-3 text-primary">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center animate-scale-in">
                  <Check className="w-6 h-6" />
                </div>
                <span className="font-semibold">All set!</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
