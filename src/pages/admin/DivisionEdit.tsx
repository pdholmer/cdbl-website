import { hasFullAccess, useMyRoles } from "@/lib/adminAccess";
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
    capacity: "",
    waitlist_enabled: true,
  });
  const [feeHistory, setFeeHistory] = useState<{ id: string; old_cost: number | null; new_cost: number | null; changed_at: string; who: string }[]>([]);
  const [feeHistoryError, setFeeHistoryError] = useState(false);

  useEffect(() => {
    loadPrograms();
    if (id) {
      loadDivision();
    }
  }, [id]);

  const loadPrograms = async () => {
    const { data } = await supabase.from("programs").select("id, name, seasons!programs_league_season_fkey(year)");
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
      capacity: data.capacity?.toString() ?? "",
      waitlist_enabled: data.waitlist_enabled ?? true,
    });
    loadFeeHistory();
    
    // Safely parse features as string array
    if (Array.isArray(data.features)) {
      setFeatures(data.features.filter((f): f is string => typeof f === 'string'));
    }
  };

  const loadFeeHistory = async () => {
    const { data, error } = await supabase
      .from("division_fee_changes")
      .select("id, old_cost, new_cost, changed_at, changed_by")
      .eq("division_id", id!)
      .order("changed_at", { ascending: false });
    if (error) { setFeeHistoryError(true); return; }
    setFeeHistoryError(false);
    const ids = [...new Set((data ?? []).map((r) => r.changed_by).filter(Boolean))] as string[];
    const names = new Map<string, string>();
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, display_name, email").in("id", ids);
      (profs ?? []).forEach((p: any) => names.set(p.id, p.display_name || p.email));
    }
    setFeeHistory((data ?? []).map((r) => ({
      id: r.id, old_cost: r.old_cost, new_cost: r.new_cost, changed_at: r.changed_at,
      who: (r.changed_by && names.get(r.changed_by)) || "System",
    })));
  };

  const money = (v: number | null) => (v === null ? "no fee" : `$${Number(v).toFixed(2)}`);

  const roles = useMyRoles();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        cost: formData.cost.trim() === "" ? null : parseFloat(formData.cost),
        capacity: formData.capacity.trim() === "" ? null : parseInt(formData.capacity, 10),
        features: features,
      };

      if (id && roles && !hasFullAccess(roles) && roles.includes("treasurer")) {
        // Treasurer: fee only, through the narrow database function.
        const { error } = await supabase.rpc("set_division_fee", { _division_id: id, _cost: payload.cost as number });
        if (error) throw error;
        toast.success("Fee updated");
      } else if (id) {
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
    <AdminLayout>
      <div className="max-w-2xl">
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
                <Label htmlFor="program_id">Program</Label>
                <Select
                  value={formData.program_id}
                  onValueChange={(value) => setFormData({ ...formData, program_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}{program.seasons?.year ? ` (${program.seasons.year})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="age_range">Age Range</Label>
                <Input
                  id="age_range"
                  value={formData.age_range}
                  onChange={(e) => setFormData({ ...formData, age_range: e.target.value })}
                  placeholder="e.g., 8-10"
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
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  Leave blank to keep this division hidden from registration.
                </p>
                {id && (
                  <div className="mt-3 rounded-xl border p-3">
                    <p className="text-sm font-semibold">Fee history</p>
                    {feeHistoryError ? (
                      <p className="mt-1 text-sm text-destructive">Couldn't load fee history.</p>
                    ) : feeHistory.length === 0 ? (
                      <p className="mt-1 text-sm text-muted-foreground">No fee changes recorded yet.</p>
                    ) : (
                      <ul className="mt-2 space-y-1 text-sm">
                        {feeHistory.map((h) => (
                          <li key={h.id}>
                            {new Date(h.changed_at).toLocaleString()}: {h.who} changed {money(h.old_cost)} to {money(h.new_cost)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min={0}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="No limit"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl border p-3 sm:mt-6">
                  <Label htmlFor="waitlist">Waitlist when full</Label>
                  <Switch
                    id="waitlist"
                    checked={formData.waitlist_enabled}
                    onCheckedChange={(v) => setFormData({ ...formData, waitlist_enabled: v })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="season_length">Season Length</Label>
                <Input
                  id="season_length"
                  value={formData.season_length}
                  onChange={(e) => setFormData({ ...formData, season_length: e.target.value })}
                  placeholder="e.g., 12 weeks"
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
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...features];
                          newFeatures[index] = e.target.value;
                          setFeatures(newFeatures);
                        }}
                        placeholder="Enter feature"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addFeature}>
                    <Plus className="mr-2 h-4 w-4" /> Add Feature
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  required
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
    </AdminLayout>
  );
};

export default DivisionEdit;
