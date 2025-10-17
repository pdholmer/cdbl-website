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
import { ArrowLeft, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";

const DivisionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    program_id: "",
    age_range: "",
    cost: "",
    season_length: "",
    schedule_notes: "",
    display_order: 0,
  });

  useEffect(() => {
    loadPrograms();
    if (id) {
      loadDivision();
    }
  }, [id]);

  const loadPrograms = async () => {
    const { data } = await supabase.from("programs").select("id, name");
    setPrograms(data || []);
  };

  const loadDivision = async () => {
    const { data, error } = await supabase
      .from("divisions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Failed to load division");
      return;
    }

    setFormData({
      name: data.name,
      program_id: data.program_id,
      age_range: data.age_range,
      cost: data.cost?.toString() || "",
      season_length: data.season_length || "",
      schedule_notes: data.schedule_notes || "",
      display_order: data.display_order || 0,
    });
    
    // Safely parse features as string array
    if (Array.isArray(data.features)) {
      setFeatures(data.features.filter((f): f is string => typeof f === 'string'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        cost: parseFloat(formData.cost),
        features: features,
      };

      if (id) {
        const { error } = await supabase
          .from("divisions")
          .update(payload)
          .eq("id", id);

        if (error) throw error;
        toast.success("Division updated successfully");
      } else {
        const { error } = await supabase
          .from("divisions")
          .insert([payload]);

        if (error) throw error;
        toast.success("Division created successfully");
      }

      navigate("/admin/divisions");
    } catch (error: any) {
      toast.error(error.message || "Failed to save division");
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-2xl">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/divisions">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Divisions
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{id ? "Edit Division" : "Create Division"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Division Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="program">Program</Label>
                <Select
                  value={formData.program_id}
                  onValueChange={(value) => setFormData({ ...formData, program_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age_range">Age Range</Label>
                  <Input
                    id="age_range"
                    value={formData.age_range}
                    onChange={(e) => setFormData({ ...formData, age_range: e.target.value })}
                    placeholder="e.g., 7-8"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="season_length">Season Length</Label>
                <Input
                  id="season_length"
                  value={formData.season_length}
                  onChange={(e) => setFormData({ ...formData, season_length: e.target.value })}
                  placeholder="e.g., 12-16 games"
                />
              </div>

              <div>
                <Label htmlFor="schedule_notes">Schedule Notes</Label>
                <Textarea
                  id="schedule_notes"
                  value={formData.schedule_notes}
                  onChange={(e) => setFormData({ ...formData, schedule_notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label>Features</Label>
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={feature} readOnly />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add a feature"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                    />
                    <Button type="button" variant="outline" onClick={addFeature}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
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
                  {loading ? "Saving..." : id ? "Update Division" : "Create Division"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/admin/divisions")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DivisionEdit;
