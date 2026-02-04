import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useConcessionInventory,
  useInventoryMutations,
  useConcessionEmployees,
  useEmployeeMutations,
  useConcessionShifts,
  useShiftMutations,
  CATEGORY_LABELS,
  ROLE_LABELS,
  SHIFT_STATUS_LABELS,
  type InventoryCategory,
  type UnitType,
  type EmployeeRole,
  type ShiftStatus,
  type InventoryItem,
  type ConcessionEmployee,
} from "@/hooks/useConcessions";
import { Plus, Package, Users, Calendar, AlertTriangle, DollarSign } from "lucide-react";
import { format } from "date-fns";

const Concessions = () => {
  const [activeTab, setActiveTab] = useState("inventory");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Concession Management</h1>
          <p className="text-muted-foreground">
            Manage inventory, employees, and shifts for concession operations
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="shifts" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Shifts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <InventoryTab />
          </TabsContent>

          <TabsContent value="employees" className="space-y-4">
            <EmployeesTab />
          </TabsContent>

          <TabsContent value="shifts" className="space-y-4">
            <ShiftsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

// Inventory Tab Component
function InventoryTab() {
  const { data: items = [], isLoading } = useConcessionInventory(false);
  const { createItem, updateItem, restockItem } = useInventoryMutations();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    item_name: "",
    category: "food" as InventoryCategory,
    unit_type: "each" as UnitType,
    current_quantity: 0,
    minimum_quantity: 5,
    unit_cost: "",
    sale_price: "",
    vendor: "",
  });

  const lowStockItems = items.filter((i) => i.is_active && i.current_quantity <= i.minimum_quantity);
  const totalValue = items.reduce((sum, i) => sum + (i.current_quantity * (i.unit_cost || 0)), 0);

  const handleSubmit = async () => {
    await createItem.mutateAsync({
      item_name: formData.item_name,
      category: formData.category,
      unit_type: formData.unit_type,
      current_quantity: formData.current_quantity,
      minimum_quantity: formData.minimum_quantity,
      unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
      sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
      vendor: formData.vendor || null,
      notes: null,
      is_active: true,
      last_restocked_at: null,
    });
    setIsOpen(false);
    setFormData({
      item_name: "",
      category: "food",
      unit_type: "each",
      current_quantity: 0,
      minimum_quantity: 5,
      unit_cost: "",
      sale_price: "",
      vendor: "",
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.filter(i => i.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Inventory Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="flex items-center justify-center">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Inventory Item</DialogTitle>
                <DialogDescription>Add a new item to inventory</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Item Name *</Label>
                  <Input
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: InventoryCategory) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Unit Type</Label>
                    <Select
                      value={formData.unit_type}
                      onValueChange={(value: UnitType) =>
                        setFormData({ ...formData, unit_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="each">Each</SelectItem>
                        <SelectItem value="case">Case</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                        <SelectItem value="pack">Pack</SelectItem>
                        <SelectItem value="lb">Pound</SelectItem>
                        <SelectItem value="oz">Ounce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Current Qty</Label>
                    <Input
                      type="number"
                      value={formData.current_quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, current_quantity: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Min Qty (Alert)</Label>
                    <Input
                      type="number"
                      value={formData.minimum_quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, minimum_quantity: parseInt(e.target.value) || 5 })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Unit Cost ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.unit_cost}
                      onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sale Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.sale_price}
                      onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Vendor</Label>
                  <Input
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.item_name}>
                  Add Item
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Cost</TableHead>
              <TableHead>Sale Price</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No inventory items
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const isLowStock = item.current_quantity <= item.minimum_quantity;
                return (
                  <TableRow key={item.id} className={isLowStock ? "bg-orange-50" : ""}>
                    <TableCell className="font-medium">{item.item_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{CATEGORY_LABELS[item.category]}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={isLowStock ? "text-orange-600 font-medium" : ""}>
                        {item.current_quantity} {item.unit_type}
                      </span>
                      {isLowStock && (
                        <span className="text-xs text-orange-500 ml-2">(min: {item.minimum_quantity})</span>
                      )}
                    </TableCell>
                    <TableCell>{item.unit_cost ? `$${item.unit_cost.toFixed(2)}` : "-"}</TableCell>
                    <TableCell>{item.sale_price ? `$${item.sale_price.toFixed(2)}` : "-"}</TableCell>
                    <TableCell>{item.vendor || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={item.is_active ? "default" : "secondary"}>
                        {item.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}

// Employees Tab Component
function EmployeesTab() {
  const { data: employees = [], isLoading } = useConcessionEmployees(false);
  const { createEmployee, updateEmployee } = useEmployeeMutations();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "volunteer" as EmployeeRole,
  });

  const handleSubmit = async () => {
    await createEmployee.mutateAsync({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email || null,
      phone: formData.phone || null,
      role: formData.role,
      status: "active",
      user_id: null,
      notes: null,
    });
    setIsOpen(false);
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "volunteer",
    });
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Card className="px-6 py-4">
            <div className="text-sm text-muted-foreground">Active</div>
            <div className="text-2xl font-bold">{employees.filter((e) => e.status === "active").length}</div>
          </Card>
          <Card className="px-6 py-4">
            <div className="text-sm text-muted-foreground">Managers</div>
            <div className="text-2xl font-bold">
              {employees.filter((e) => e.role === "manager" && e.status === "active").length}
            </div>
          </Card>
          <Card className="px-6 py-4">
            <div className="text-sm text-muted-foreground">Volunteers</div>
            <div className="text-2xl font-bold">
              {employees.filter((e) => e.role === "volunteer" && e.status === "active").length}
            </div>
          </Card>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Employee</DialogTitle>
              <DialogDescription>Add a new concession stand employee</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: EmployeeRole) =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.first_name || !formData.last_name}
              >
                Add Employee
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No employees
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">
                    {emp.first_name} {emp.last_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={emp.role === "manager" ? "default" : "secondary"}>
                      {ROLE_LABELS[emp.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>{emp.email || "-"}</TableCell>
                  <TableCell>{emp.phone || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={emp.status === "active" ? "default" : "secondary"}>
                      {emp.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}

// Shifts Tab Component
function ShiftsTab() {
  const { data: shifts = [], isLoading } = useConcessionShifts();
  const { data: employees = [] } = useConcessionEmployees();
  const { createShift, updateShift, deleteShift } = useShiftMutations();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    shift_date: "",
    start_time: "09:00",
    end_time: "13:00",
  });

  const handleSubmit = async () => {
    await createShift.mutateAsync({
      employee_id: formData.employee_id,
      shift_date: formData.shift_date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      status: "scheduled",
      notes: null,
    });
    setIsOpen(false);
    setFormData({
      employee_id: "",
      shift_date: "",
      start_time: "09:00",
      end_time: "13:00",
    });
  };

  const handleStatusChange = async (shiftId: string, newStatus: ShiftStatus) => {
    await updateShift.mutateAsync({ id: shiftId, status: newStatus });
  };

  // Filter to show upcoming shifts first
  const today = format(new Date(), "yyyy-MM-dd");
  const upcomingShifts = shifts.filter((s) => s.shift_date >= today);
  const pastShifts = shifts.filter((s) => s.shift_date < today);

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Card className="px-6 py-4">
            <div className="text-sm text-muted-foreground">Upcoming</div>
            <div className="text-2xl font-bold">{upcomingShifts.length}</div>
          </Card>
          <Card className="px-6 py-4">
            <div className="text-sm text-muted-foreground">Today</div>
            <div className="text-2xl font-bold">
              {shifts.filter((s) => s.shift_date === today).length}
            </div>
          </Card>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Shift
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Shift</DialogTitle>
              <DialogDescription>Create a new shift</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Employee *</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.shift_date}
                  onChange={(e) => setFormData({ ...formData, shift_date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.employee_id || !formData.shift_date}
              >
                Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Shifts</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : upcomingShifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No upcoming shifts
                </TableCell>
              </TableRow>
            ) : (
              upcomingShifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell className="font-medium">
                    {format(new Date(shift.shift_date), "EEE, MMM d")}
                  </TableCell>
                  <TableCell>
                    {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                  </TableCell>
                  <TableCell>
                    {shift.employee
                      ? `${shift.employee.first_name} ${shift.employee.last_name}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        shift.status === "completed"
                          ? "default"
                          : shift.status === "cancelled" || shift.status === "no_show"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {SHIFT_STATUS_LABELS[shift.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={shift.status}
                      onValueChange={(value: ShiftStatus) => handleStatusChange(shift.id, value)}
                    >
                      <SelectTrigger className="h-8 w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SHIFT_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}

export default Concessions;
