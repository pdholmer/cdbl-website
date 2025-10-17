import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ProgramEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "in_house" as "in_house" | "travel",
    overview: "",
    season_start: "",
    season_end: "",
    registration_open: false,
    registration_url: "",
  });

  useEffect(() => {
    if (id) {
      loadProgram();
    }
  }, [id]);

  const loadProgram = async () => {
    const { data, error } = await supabase
      .from("programs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Failed to load program");
      return;
    }

    setFormData({
      name: data.name,
      type: data.type,
      overview: data.overview || "",
      season_start: data.season_start || "",
      season_end: data.season_end || "",
      registration_open: data.registration_open || false,
      registration_url: data.registration_url || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        const { error } = await supabase
          .from("programs")
          .update(formData)
          .eq("id", id);

        if (error) throw error;
        toast.success("Program updated successfully");
      } else {
        const { error } = await supabase
          .from("programs")
          .insert([formData]);

        if (error) throw error;
        toast.success("Program created successfully");
      }

      navigate("/admin/programs");
    } catch (error: any) {
      toast.error(error.message || "Failed to save program");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/programs">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Programs
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{id ? "Edit Program" : "Create Program"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Program Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Program Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "in_house" | "travel") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_house">In-House</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="overview">Overview</Label>
                <Textarea
                  id="overview"
                  value={formData.overview}
                  onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="season_start">Season Start</Label>
                  <Input
                    id="season_start"
                    type="date"
                    value={formData.season_start}
                    onChange={(e) => setFormData({ ...formData, season_start: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="season_end">Season End</Label>
                  <Input
                    id="season_end"
                    type="date"
                    value={formData.season_end}
                    onChange={(e) => setFormData({ ...formData, season_end: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="registration_url">Registration URL</Label>
                <Input
                  id="registration_url"
                  type="url"
                  value={formData.registration_url}
                  onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="registration_open"
                  checked={formData.registration_open}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, registration_open: checked })
                  }
                />
                <Label htmlFor="registration_open">Registration Open</Label>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : id ? "Update Program" : "Create Program"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/admin/programs")}>
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

export default ProgramEdit;
