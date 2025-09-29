import { ResolvedPolicy, PolicyComponentWithState } from "../../../types/policy";
import { File } from "lucide-react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion";
import { RequiredBoolean } from "../../../forms/RequiredBoolean";
import { StringList } from "../../../forms/StringList";
import { LabelColumn } from "../LabelColumn";
import { ValueColumn } from "../ValueColumn";
import { WideValueColumn } from "../WideValueColumn";
import { EffectiveValueColumn } from "../EffectiveValueColumn";
import { EffectiveBooleanValue } from "../EffectiveBooleanValue";
import { EffectiveListValue } from "../EffectiveListValue";

interface FilesSectionProps {
  componentRef: React.RefObject<PolicyComponentWithState>;
  resolved: ResolvedPolicy;
  policyDefinitionPoint: (p: unknown) => React.ReactNode;
}

export function FilesSection({ componentRef, resolved, policyDefinitionPoint }: FilesSectionProps) {
  return (
    <AccordionItem value="files">
      <AccordionTrigger>
        <div className="flex items-center gap-2">
          <File className="h-4 w-4" />
          <span>Files/Directories</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {LabelColumn("Ignore cache directories:")}
            {ValueColumn(RequiredBoolean(componentRef, "", "files.ignoreCacheDirs"))}
            {EffectiveValueColumn(EffectiveBooleanValue("files.ignoreCacheDirs", resolved, policyDefinitionPoint))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {LabelColumn("Ignore rules:")}
            {WideValueColumn(StringList(componentRef, "", "files.ignore", { placeholder: "enter ignore rules" }))}
            {EffectiveValueColumn(EffectiveListValue("files.ignore", resolved, policyDefinitionPoint))}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
