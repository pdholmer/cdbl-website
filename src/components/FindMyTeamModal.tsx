import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChatBubble } from "@/components/ChatBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { useTeamHierarchy, Program, Division, Team } from "@/hooks/useTeamHierarchy";
import { Check } from "lucide-react";

interface FindMyTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamSelected: (teamId: string, teamName: string, divisionId: string, programId: string) => void;
  onScrollToSchedule?: () => void;
}

type Step = 'welcome' | 'program-selection' | 'division-selection' | 'team-selection' | 'confirmation';

export const FindMyTeamModal = ({ open, onOpenChange, onTeamSelected, onScrollToSchedule }: FindMyTeamModalProps) => {
  const [step, setStep] = useState<Step>('welcome');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showTyping, setShowTyping] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; type: 'bot' | 'user' }>>([]);
  
  const { programs, getDivisionsByProgram, getTeamsByDivision } = useTeamHierarchy();

  useEffect(() => {
    if (open) {
      // Reset state when modal opens
      setStep('welcome');
      setSelectedProgram(null);
      setSelectedDivision(null);
      setSelectedTeam(null);
      setMessages([]);
      
      // Show welcome message after brief delay
      setTimeout(() => {
        setMessages([{ text: "Hi there! Which program is your team in?", type: 'bot' }]);
        setStep('program-selection');
      }, 300);
    }
  }, [open]);

  const handleProgramSelect = (program: Program) => {
    setSelectedProgram(program);
    setMessages(prev => [...prev, { text: program.name, type: 'user' }]);
    
    setShowTyping(true);
    setTimeout(() => {
      setShowTyping(false);
      setMessages(prev => [...prev, { text: "Great! Which division are you in?", type: 'bot' }]);
      setStep('division-selection');
    }, 800);
  };

  const handleDivisionSelect = (division: Division) => {
    setSelectedDivision(division);
    setMessages(prev => [...prev, { text: division.name, type: 'user' }]);
    
    setShowTyping(true);
    setTimeout(() => {
      setShowTyping(false);
      setMessages(prev => [...prev, { text: "Perfect! Which team are you looking for?", type: 'bot' }]);
      setStep('team-selection');
    }, 800);
  };

  const handleTeamSelect = (team: Team) => {
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
        if (selectedProgram && selectedDivision) {
          onTeamSelected(team.id, team.name, selectedDivision.id, selectedProgram.id);
          onScrollToSchedule?.();
          onOpenChange(false);
        }
      }, 1200);
    }, 800);
  };

  const availableDivisions = selectedProgram ? getDivisionsByProgram(selectedProgram.id) : [];
  const availableTeams = selectedDivision ? getTeamsByDivision(selectedDivision.id) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Find My Team</DialogTitle>
          <DialogDescription className="sr-only">Guided selection: Program, Division, Team</DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 py-4 px-1">
          {messages.map((msg, idx) => (
            <ChatBubble key={idx} message={msg.text} type={msg.type} />
          ))}
          
          {showTyping && <TypingIndicator />}
          
          {step === 'program-selection' && !showTyping && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 animate-fade-in">
              {programs?.map((program) => (
                <Button
                  key={program.id}
                  size="lg"
                  variant="outline"
                  onClick={() => handleProgramSelect(program)}
                  className="h-auto py-4 px-6 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                >
                  <span className="text-2xl">{program.type === 'in_house' ? '🧢' : '🚀'}</span>
                  <span className="font-semibold">{program.name}</span>
                </Button>
              ))}
            </div>
          )}
          
          {step === 'division-selection' && !showTyping && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 animate-fade-in">
              {availableDivisions.map((division) => (
                <Button
                  key={division.id}
                  size="lg"
                  variant="outline"
                  onClick={() => handleDivisionSelect(division)}
                  className="h-auto py-3 justify-start hover:bg-primary/10 hover:border-primary transition-all"
                >
                  <span className="font-semibold">{division.name}</span>
                </Button>
              ))}
            </div>
          )}
          
          {step === 'team-selection' && !showTyping && (
            <div className="grid grid-cols-1 gap-2 pt-2 animate-fade-in max-h-[300px] overflow-y-auto">
              {availableTeams.map((team) => (
                <Button
                  key={team.id}
                  size="lg"
                  variant="outline"
                  onClick={() => handleTeamSelect(team)}
                  className="h-auto py-3 justify-start hover:bg-primary/10 hover:border-primary transition-all"
                >
                  <span className="font-semibold">{team.name}</span>
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
