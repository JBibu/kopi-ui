import React, { useContext } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ThemeSelector } from "../components/ThemeSelector";
import { NotificationEditor } from "../components/notifications/NotificationEditor";
import { UIPreferencesContext } from "../contexts/UIPreferencesContext";
import { Palette, Type, Binary, Info } from "lucide-react";

/**
 * Preferences page with appearance and notification settings
 */
export function Preferences(): JSX.Element {
  const { bytesStringBase2, fontSize, setByteStringBase, setFontSize } =
    useContext(UIPreferencesContext);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Preferences</h1>
        <p className="text-muted-foreground">Customize your Kopia UI experience</p>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="mt-6 space-y-6">
          {/* Theme Selection Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                <CardTitle>Theme</CardTitle>
              </div>
              <CardDescription>Choose your preferred color theme</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSelector variant="radio" />
            </CardContent>
          </Card>

          {/* Display Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>Adjust display preferences for better readability</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fontSizeInput" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Font Size
                </Label>
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger id="fontSizeInput">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-sm">Small</SelectItem>
                    <SelectItem value="text-base">Medium</SelectItem>
                    <SelectItem value="text-lg">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bytesBaseInput" className="flex items-center gap-2">
                  <Binary className="h-4 w-4" />
                  Byte Representation
                </Label>
                <Select value={bytesStringBase2.toString()} onValueChange={setByteStringBase}>
                  <SelectTrigger id="bytesBaseInput">
                    <SelectValue placeholder={bytesStringBase2 ? "Base-2" : "Base-10"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Base-2 (KiB, MiB, GiB, TiB)</SelectItem>
                    <SelectItem value="false">Base-10 (KB, MB, GB, TB)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                <CardTitle>Build Information</CardTitle>
              </div>
              <CardDescription>Application version information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center py-3 px-4 bg-muted/30 rounded-md">
                <span className="text-sm font-medium">Vite Version</span>
                <span className="text-sm font-mono text-muted-foreground">
                  {import.meta.env.VITE_FULL_VERSION_INFO || "Development"}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}