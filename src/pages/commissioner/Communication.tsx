import { useState } from "react";
import { Send, Users, Mail, History } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCommissionerAssignments } from "@/hooks/useCommissionerAssignments";
import { usePrograms } from "@/hooks/usePrograms";
import { toast } from "sonner";

export default function CommissionerCommunication() {
  const { data: assignments } = useCommissionerAssignments();
  const { programs } = usePrograms();
  
  const [recipientType, setRecipientType] = useState<string>("all_coaches");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const programIds = assignments?.map(a => a.program_id) || [];
  const assignedPrograms = programs?.filter(p => programIds.includes(p.id)) || [];

  const handleSendMessage = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in subject and message");
      return;
    }

    setIsSending(true);
    
    // In a real implementation, this would call an edge function to send emails
    // For now, we'll just show a success message
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Message sent successfully");
    setSubject("");
    setMessage("");
    setIsSending(false);
  };

  // Mock message history
  const messageHistory = [
    {
      id: '1',
      subject: 'Practice Schedule Update',
      recipientType: 'all_coaches',
      sentAt: new Date().toISOString(),
      status: 'delivered',
    },
    {
      id: '2',
      subject: 'Game Cancellation Notice',
      recipientType: 'all_parents',
      sentAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'delivered',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Communication</h1>
        <p className="text-muted-foreground">
          Send announcements to coaches and parents
        </p>
      </div>

      <Tabs defaultValue="compose">
        <TabsList>
          <TabsTrigger value="compose">
            <Send className="h-4 w-4 mr-2" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>New Announcement</CardTitle>
              <CardDescription>
                Send a message to coaches or parents in your league
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="recipients">Recipients</Label>
                <Select value={recipientType} onValueChange={setRecipientType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_coaches">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        All Coaches
                      </div>
                    </SelectItem>
                    <SelectItem value="all_parents">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        All Parents
                      </div>
                    </SelectItem>
                    <SelectItem value="everyone">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Everyone
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {recipientType === 'all_coaches' && "Message will be sent to all coaches in your assigned programs."}
                  {recipientType === 'all_parents' && "Message will be sent to all parents of registered players."}
                  {recipientType === 'everyone' && "Message will be sent to all coaches and parents."}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject line"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={8}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSubject("");
                    setMessage("");
                  }}
                >
                  Clear
                </Button>
                <Button onClick={handleSendMessage} disabled={isSending}>
                  <Send className="h-4 w-4 mr-2" />
                  {isSending ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Templates</CardTitle>
              <CardDescription>
                Use a template to quickly compose a message
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <Button
                  variant="outline"
                  className="h-auto py-3 justify-start"
                  onClick={() => {
                    setSubject("Practice Reminder");
                    setMessage("This is a reminder that practice is scheduled for [DATE] at [TIME] at [LOCATION]. Please arrive 15 minutes early.");
                  }}
                >
                  <div className="text-left">
                    <div className="font-medium">Practice Reminder</div>
                    <div className="text-xs text-muted-foreground">Remind about upcoming practice</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 justify-start"
                  onClick={() => {
                    setSubject("Game Cancellation");
                    setMessage("Unfortunately, the game scheduled for [DATE] has been cancelled due to [REASON]. We will notify you when it has been rescheduled.");
                  }}
                >
                  <div className="text-left">
                    <div className="font-medium">Game Cancellation</div>
                    <div className="text-xs text-muted-foreground">Notify about cancelled game</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 justify-start"
                  onClick={() => {
                    setSubject("Schedule Update");
                    setMessage("Please note that the schedule has been updated. Check the league website for the latest game times and locations.");
                  }}
                >
                  <div className="text-left">
                    <div className="font-medium">Schedule Update</div>
                    <div className="text-xs text-muted-foreground">Announce schedule changes</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Message History</CardTitle>
              <CardDescription>
                Previously sent announcements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {messageHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No messages sent yet
                </div>
              ) : (
                <div className="space-y-4">
                  {messageHistory.map((msg) => (
                    <div key={msg.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{msg.subject}</div>
                        <div className="text-sm text-muted-foreground">
                          Sent to {msg.recipientType.replace('_', ' ')} • {new Date(msg.sentAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant={msg.status === 'delivered' ? 'default' : 'secondary'}>
                        {msg.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
