import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";

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

type Step = "form" | "confirm" | "success";

const VolunteerSignupModal = ({ open, onOpenChange, preselectedInterest }: VolunteerSignupModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    preselectedInterest ? [preselectedInterest] : []
  );

  // Reset when modal opens with new preselected interest
  useEffect(() => {
    if (open && preselectedInterest) {
      setSelectedInterests([preselectedInterest]);
    }
  }, [open, preselectedInterest]);

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
    setStep("form");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedInterests.length === 0) {
      alert("Please select at least one interest area");
      return;
    }

    setStep("confirm");
  };

  const handleConfirmSubmit = async () => {
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

      setStep("success");
    } catch (error) {
      console.error("Error submitting volunteer signup:", error);
      alert("Something went wrong. Please try again or contact us directly at info@cdbaseball.org");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInterestLabel = (id: string) => {
    return INTEREST_OPTIONS.find(opt => opt.id === id)?.label || id;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Volunteer Interest Form</DialogTitle>
              <DialogDescription>
                Tell us about yourself and how you'd like to help. We'll match you with the right opportunity!
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleFormSubmit} className="space-y-6 mt-4">
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

              <Button type="submit" size="lg" className="w-full">
                Review & Submit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </>
        )}

        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Confirm Your Submission</DialogTitle>
              <DialogDescription>
                Please review your information before submitting.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{email}</p>
                </div>
                {phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Areas of Interest</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedInterests.map(id => (
                      <Badge key={id} variant="secondary">
                        {getInterestLabel(id)}
                      </Badge>
                    ))}
                  </div>
                </div>
                {experience && (
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-medium text-sm">{experience}</p>
                  </div>
                )}
                {notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Additional Notes</p>
                    <p className="font-medium text-sm">{notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep("form")} 
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  onClick={handleConfirmSubmit} 
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Confirm & Submit"}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="text-center py-8 space-y-4 animate-in fade-in-50 slide-in-from-bottom-2">
            <div className="inline-flex p-4 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-700">Thank You!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your volunteer interest has been submitted. We'll reach out to <strong>{email}</strong> with 
              opportunities that match your interests:
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {selectedInterests.map(id => (
                <Badge key={id} variant="secondary">
                  {getInterestLabel(id)}
                </Badge>
              ))}
            </div>
            <div className="pt-4">
              <Button onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VolunteerSignupModal;
