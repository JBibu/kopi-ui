import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { SetupRepository } from "../components/SetupRepository";
import { PolicyEditor } from "../components/policy-editor/PolicyEditor";
import { NotificationEditor } from "../components/notifications/NotificationEditor";
import { KopiaTable } from "../components/KopiaTable";

export function ComponentsDemo() {
  const [activeTab, setActiveTab] = useState("setup-new");

  // Sample data for table demos
  const sampleTableData = [
    { id: 1, name: "John Doe", email: "john@example.com", status: "active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", status: "inactive" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", status: "active" },
    { id: 4, name: "Alice Williams", email: "alice@example.com", status: "active" },
    { id: 5, name: "Charlie Brown", email: "charlie@example.com", status: "inactive" },
  ];

  const tableColumns = [
    { accessorKey: "id", header: "ID", enableSorting: true },
    { accessorKey: "name", header: "Name", enableSorting: true },
    { accessorKey: "email", header: "Email", enableSorting: true },
    { accessorKey: "status", header: "Status", enableSorting: true },
  ];

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Component Refactoring Demo</h1>
        <p className="text-muted-foreground text-lg">
          Comparison of original and refactored components with improved architecture
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup-new">Setup Repository</TabsTrigger>
          <TabsTrigger value="policy-new">Policy Editor</TabsTrigger>
          <TabsTrigger value="notification-new">Notifications</TabsTrigger>
          <TabsTrigger value="table-new">Enhanced Table</TabsTrigger>
        </TabsList>

        <TabsContent value="setup-new" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>SetupRepository - Modern Architecture</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary">useReducer</Badge>
                  <Badge variant="secondary">React Hook Form</Badge>
                  <Badge variant="secondary">Modular</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                </div>
              </div>
              <CardDescription>
                Modern architecture with useReducer for state management, separated into focused sub-components, using
                React Hook Form for validation, and full TypeScript support.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Key Features:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Reduced from 922 lines to 160 lines (83% reduction)</li>
                    <li>State management centralized with useReducer</li>
                    <li>Split into ProviderSelection, ProviderConfiguration, and AdvancedOptions</li>
                    <li>Form validation with React Hook Form</li>
                    <li>Better separation of concerns</li>
                    <li>Improved TypeScript typing with dedicated types file</li>
                  </ul>
                </div>
                <SetupRepository />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policy-new" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>PolicyEditor - Modern Implementation</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary">Custom Hook</Badge>
                  <Badge variant="secondary">Section Components</Badge>
                  <Badge variant="secondary">Modular</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                </div>
              </div>
              <CardDescription>
                Modern architecture with custom hook for business logic, separated sections into individual components,
                and full TypeScript support for better type safety.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Key Features:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Reduced from 527 lines to modular components</li>
                    <li>Business logic extracted to usePolicyEditor custom hook</li>
                    <li>Policy sections split into dedicated components</li>
                    <li>Cleaner component structure with better separation</li>
                    <li>Easier to test and maintain individual sections</li>
                    <li>Full TypeScript support with proper interfaces</li>
                  </ul>
                </div>
                <PolicyEditor />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notification-new" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>NotificationEditor - Modern Implementation</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary">Custom Hook</Badge>
                  <Badge variant="secondary">React Hook Form</Badge>
                  <Badge variant="secondary">Modular</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                </div>
              </div>
              <CardDescription>
                Complete refactor with custom hook for state management, React Hook Form for validation, and modular
                method-specific forms.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Key Features:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Reduced from 393 lines to modular components</li>
                    <li>State management with useNotificationEditor hook</li>
                    <li>Separate ProfileList and ProfileEditor components</li>
                    <li>Method-specific forms (Email, Webhook, Pushover)</li>
                    <li>React Hook Form for validation</li>
                    <li>Full TypeScript support</li>
                  </ul>
                </div>
                <NotificationEditor />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table-new" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>KopiaTable - Enhanced Version</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary">Custom Hook</Badge>
                  <Badge variant="secondary">TanStack Table</Badge>
                  <Badge variant="secondary">Advanced Features</Badge>
                </div>
              </div>
              <CardDescription>
                Enhanced table component with custom hook, global filtering, column visibility, row selection, and
                improved pagination.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">New Features:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>useKopiaTable custom hook for state management</li>
                    <li>Global search/filtering capability</li>
                    <li>Column visibility toggles</li>
                    <li>Row selection with checkbox</li>
                    <li>Column-level filtering</li>
                    <li>Enhanced pagination UI</li>
                    <li>Full TypeScript support</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Enhanced Version with Advanced Features:</h4>
                  <KopiaTable
                    columns={tableColumns}
                    data={sampleTableData}
                    enableGlobalFilter
                    enableRowSelection
                    enableColumnVisibility
                    title="Sample Data Table"
                    description="Demonstration of enhanced table features including search, selection, and column visibility"
                  />

                  <h4 className="font-semibold mt-6">Standard Version:</h4>
                  <KopiaTable columns={tableColumns} data={sampleTableData} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
