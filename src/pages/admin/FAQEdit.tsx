import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";

const FAQEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    program_id: "",
    display_order: 0,
  });

  useEffect(() => {
    loadPrograms();
    if (id) {
      loadFAQ();
    }
  }, [id]);

  const loadPrograms = async () => {
    const { data } = await supabase.from("programs").select("id, name");
    setPrograms(data || []);
  };

  const loadFAQ = async () => {
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Failed to load FAQ");
      return;
    }

    setFormData({
      question: data.question,
      answer: data.answer,
      program_id: data.program_id || "",
      display_order: data.display_order || 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        program_id: formData.program_id || null,
      };

      if (id) {
        const { error } = await supabase
          .from("faqs")
          .update(payload)
          .eq("id", id);

        if (error) throw error;
        toast.success("FAQ updated successfully");
      } else {
        const { error } = await supabase
          .from("faqs")
          .insert([payload]);

        if (error) throw error;
        toast.success("FAQ created successfully");
      }

      navigate("/admin/faqs");
    } catch (error: any) {
      toast.error(error.message || "Failed to save FAQ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/faqs">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to FAQs
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{id ? "Edit FAQ" : "Create FAQ"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="answer">Answer</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="program">Program (Optional)</Label>
                <Select
                  value={formData.program_id}
                  onValueChange={(value) => setFormData({ ...formData, program_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="General (all programs)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">General (all programs)</SelectItem>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : id ? "Update FAQ" : "Create FAQ"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/admin/faqs")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default FAQEdit;
