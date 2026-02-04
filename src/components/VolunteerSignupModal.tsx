import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const INTEREST_OPTIONS = [
  { id: "coaching", label: "Coaching" },
  { id: "umpiring", label: "Umpiring" },
  { id: "field_operations", label: "Field Operations" },
  { id: "event_support", label: "Event Support" },
  { id: "team_parent", label: "Team Parent" },
  { id: "board_positions", label: "Board Positions" },
  { id: "concessions", label: "Concession Stand" },
  { id: "sponsorship", label: "Sponsorship/Fundraising" },
];

interface VolunteerSignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedInterest?: string;
}

const VolunteerSignupModal = ({ open, onOpenChange, preselectedInterest }: VolunteerSignupModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    preselectedInterest ? [preselectedInterest] : []
  );

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setExperience("");
    setNotes("");
    setSelectedInterests(preselectedInterest ? [preselectedInterest] : []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedInterests.length === 0) {
      toast({
        title: "Please select at least one interest area",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("volunteer_signups")
        .insert({
          name,
          email,
          phone: phone || null,
          interest_areas: selectedInterests,
          experience: experience || null,
          notes: notes || null,
        });

      if (error) throw error;

      toast({
        title: "Thank you for volunteering!",
        description: "We'll be in touch soon about opportunities that match your interests.",
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting volunteer signup:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly at info@cdbaseball.org",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Volunteer Interest Form</DialogTitle>
          <DialogDescription>
            Tell us about yourself and how you'd like to help. We'll match you with the right opportunity!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="volunteer-name">Name *</Label>
            <Input
              id="volunteer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="volunteer-email">Email *</Label>
            <Input
              id="volunteer-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="volunteer-phone">Phone</Label>
            <Input
              id="volunteer-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="space-y-3">
            <Label>Areas of Interest *</Label>
            <div className="grid grid-cols-2 gap-3">
              {INTEREST_OPTIONS.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={selectedInterests.includes(option.id)}
                    onCheckedChange={() => handleInterestToggle(option.id)}
                  />
                  <Label htmlFor={option.id} className="text-sm font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="volunteer-experience">Relevant Experience</Label>
            <Textarea
              id="volunteer-experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Tell us about any relevant experience (coaching, sports, working with kids, etc.)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="volunteer-notes">Additional Notes</Label>
            <Textarea
              id="volunteer-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything else you'd like us to know (availability, questions, etc.)"
              rows={2}
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Volunteer Interest"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VolunteerSignupModal;
