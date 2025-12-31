import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useVenue } from "@/hooks/useVenues";
import { useVenueMutations } from "@/hooks/useVenueMutations";
import { useVenueFields, useVenueFieldMutations } from "@/hooks/useVenueFields";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function VenueEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  
  const { data: venue, isLoading } = useVenue(id);
  const { data: fields = [] } = useVenueFields(id);
  const { createVenue, updateVenue } = useVenueMutations();
  const { createField, updateField, deleteField } = useVenueFieldMutations();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "IL",
    zip_code: "",
    field_count: 1,
    has_lights: false,
    has_restrooms: true,
    has_concessions: false,
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    parking_info: "",
    directions: "",
    status: "active",
  });

  const [localFields, setLocalFields] = useState<any[]>([]);

  useEffect(() => {
    if (venue) {
      setFormData({
        name: venue.name || "",
        address: venue.address || "",
        city: venue.city || "",
        state: venue.state || "IL",
        zip_code: venue.zip_code || "",
        field_count: venue.field_count || 1,
        has_lights: venue.has_lights || false,
        has_restrooms: venue.has_restrooms || false,
        has_concessions: venue.has_concessions || false,
        contact_name: venue.contact_name || "",
        contact_phone: venue.contact_phone || "",
        contact_email: venue.contact_email || "",
        parking_info: venue.parking_info || "",
        directions: venue.directions || "",
        status: venue.status || "active",
      });
    }
  }, [venue]);

  useEffect(() => {
    if (fields.length > 0) {
      setLocalFields(fields);
    }
  }, [fields]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isNew) {
      createVenue.mutate(formData, {
        onSuccess: (data) => {
          // Save fields after venue is created
          localFields.forEach((field) => {
            createField.mutate({
              venue_id: data.id,
              field_number: field.field_number,
              field_name: field.field_name,
              divisions: field.divisions || [],
              status: field.status || "open",
              notes: field.notes,
            });
          });
          navigate("/admin/facilities");
        },
      });
    } else if (id) {
      updateVenue.mutate(
        { id, updates: formData },
        {
          onSuccess: () => {
            // Update fields
            localFields.forEach((field) => {
              if (field.id) {
                updateField.mutate({
                  id: field.id,
                  updates: {
                    field_number: field.field_number,
                    field_name: field.field_name,
                    divisions: field.divisions,
                    status: field.status,
                    notes: field.notes,
                  },
                });
              } else {
                createField.mutate({
                  venue_id: id,
                  field_number: field.field_number,
                  field_name: field.field_name,
                  divisions: field.divisions || [],
                  status: field.status || "open",
                  notes: field.notes,
                });
              }
            });
    navigate("/admin/facilities");
          },
        }
      );
    }
  };

  const addField = () => {
    setLocalFields([
      ...localFields,
      {
        field_number: `${localFields.length + 1}`,
        field_name: "",
        divisions: [],
        status: "open",
        notes: "",
      },
    ]);
  };

  const removeField = (index: number) => {
    const field = localFields[index];
    if (field.id) {
      deleteField.mutate(field.id);
    }
    setLocalFields(localFields.filter((_, i) => i !== index));
  };

  const updateLocalField = (index: number, key: string, value: any) => {
    const updated = [...localFields];
    updated[index] = { ...updated[index], [key]: value };
    setLocalFields(updated);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      open: "default",
      closed: "destructive",
      maintenance: "secondary",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/facilities")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{isNew ? "Add New Facility" : "Edit Facility"}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Facility Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="zip_code">Zip Code</Label>
                  <Input
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Features</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_lights"
                      checked={formData.has_lights}
                      onCheckedChange={(checked) => setFormData({ ...formData, has_lights: checked as boolean })}
                    />
                    <Label htmlFor="has_lights">Lights</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_restrooms"
                      checked={formData.has_restrooms}
                      onCheckedChange={(checked) => setFormData({ ...formData, has_restrooms: checked as boolean })}
                    />
                    <Label htmlFor="has_restrooms">Restrooms</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_concessions"
                      checked={formData.has_concessions}
                      onCheckedChange={(checked) => setFormData({ ...formData, has_concessions: checked as boolean })}
                    />
                    <Label htmlFor="has_concessions">Concessions</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_name">Contact Name</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Phone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="contact_email">Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="parking_info">Parking Information</Label>
                <Textarea
                  id="parking_info"
                  value={formData.parking_info}
                  onChange={(e) => setFormData({ ...formData, parking_info: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="directions">Directions</Label>
                <Textarea
                  id="directions"
                  value={formData.directions}
                  onChange={(e) => setFormData({ ...formData, directions: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Individual Fields</CardTitle>
              <Button type="button" size="sm" onClick={addField}>
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {localFields.map((field, index) => (
                <div key={field.id || index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Field {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Field Number</Label>
                      <Input
                        value={field.field_number}
                        onChange={(e) => updateLocalField(index, "field_number", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Field Name</Label>
                      <Input
                        value={field.field_name || ""}
                        onChange={(e) => updateLocalField(index, "field_name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select
                        value={field.status}
                        onValueChange={(value) => updateLocalField(index, "status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Divisions (comma-separated)</Label>
                      <Input
                        value={field.divisions?.join(", ") || ""}
                        onChange={(e) =>
                          updateLocalField(
                            index,
                            "divisions",
                            e.target.value.split(",").map((d) => d.trim())
                          )
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={field.notes || ""}
                        onChange={(e) => updateLocalField(index, "notes", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {localFields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No fields added yet. Click "Add Field" to create one.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit">Save Facility</Button>
            <Button type="button" variant="outline" onClick={() => navigate("/admin/facilities")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
