import { useContext, React } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Label } from "../components/ui/label";
import { NotificationEditor } from "../components/notifications/NotificationEditor";
import { UIPreferencesContext } from "../contexts/UIPreferencesContext";

/**
 * Class that exports preferences
 */
export function Preferences() {
  const { theme, bytesStringBase2, fontSize, setByteStringBase, setTheme, setFontSize } =
    useContext(UIPreferencesContext);

  return (
    <Tabs defaultValue="appearance" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="appearance" className="mt-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="themeSelector" className="required">Theme</Label>
              <select
                className="form-select form-select-sm w-full"
                title="Select theme"
                id="themeSelector"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="light">light</option>
                <option value="dark">dark</option>
                <option value="pastel">pastel</option>
                <option value="ocean">ocean</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontSizeInput" className="required">Appearance</Label>
              <select
                className="form-select form-select-sm w-full"
                title="Select font size"
                id="fontSizeInput"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
              >
                <option value="fs-6">small</option>
                <option value="fs-5">medium</option>
                <option value="fs-4">large</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bytesBaseInput" className="required">Byte representation</Label>
              <select
                className="form-select form-select-sm w-full"
                title="Select byte representation"
                id="bytesBaseInput"
                value={bytesStringBase2}
                onChange={(e) => setByteStringBase(e.target.value)}
              >
                <option value="true">Base-2 (KiB, MiB, GiB, TiB)</option>
                <option value="false">Base-10 (KB, MB, GB, TB)</option>
              </select>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="notifications" className="mt-6">
        <div className="tab-content-fix">
          <div className="container mx-auto px-4">
            <NotificationEditor />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
