import React from 'react';
import { Settings } from 'lucide-react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { ActionRowScript } from '../ActionRowScript';
import { ActionRowTimeout } from '../ActionRowTimeout';
import { ActionRowMode } from '../ActionRowMode';

interface ActionsSectionProps {
  componentRef: any;
  resolved: any;
  policyDefinitionPoint: (p: any) => React.ReactNode;
}

export const ActionsSection: React.FC<ActionsSectionProps> = ({
  componentRef,
  resolved,
  policyDefinitionPoint,
}) => {
  return (
    <AccordionItem value="actions">
      <AccordionTrigger>
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span>Actions</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          {ActionRowScript(componentRef, "Before snapshot (snapshot root)", "actions.beforeSnapshotRoot", resolved, policyDefinitionPoint)}
          {ActionRowScript(componentRef, "After snapshot (snapshot root)", "actions.afterSnapshotRoot", resolved, policyDefinitionPoint)}
          {ActionRowTimeout(componentRef, "Action timeout", "actions.timeout", resolved, policyDefinitionPoint)}
          {ActionRowMode(componentRef, "Action on error", "actions.mode", resolved, policyDefinitionPoint)}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};