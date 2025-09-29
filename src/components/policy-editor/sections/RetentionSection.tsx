import React from 'react';
import { CalendarDays } from 'lucide-react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { OptionalNumberField } from '../../../forms/OptionalNumberField';
import { LabelColumn } from '../LabelColumn';
import { ValueColumn } from '../ValueColumn';
import { EffectiveValueColumn } from '../EffectiveValueColumn';
import { EffectiveValue } from '../EffectiveValue';
import { SectionHeaderRow } from '../SectionHeaderRow';

interface RetentionSectionProps {
  componentRef: any;
  resolved: any;
  policyDefinitionPoint: (p: any) => React.ReactNode;
}

export const RetentionSection: React.FC<RetentionSectionProps> = ({
  componentRef,
  resolved,
  policyDefinitionPoint,
}) => {
  return (
    <AccordionItem value="retention">
      <AccordionTrigger>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          <span>Snapshot Retention</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SectionHeaderRow("Keep Daily", "Effective", "")}
          <div className="grid grid-cols-3 gap-4">
            {LabelColumn("Daily snapshots to keep:")}
            {ValueColumn(OptionalNumberField(componentRef, "", "retention.keepDaily", { placeholder: "keep forever if not set" }))}
            {EffectiveValueColumn(EffectiveValue("retention.keepDaily", resolved, policyDefinitionPoint))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {LabelColumn("Weekly snapshots to keep:")}
            {ValueColumn(OptionalNumberField(componentRef, "", "retention.keepWeekly", { placeholder: "keep forever if not set" }))}
            {EffectiveValueColumn(EffectiveValue("retention.keepWeekly", resolved, policyDefinitionPoint))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {LabelColumn("Monthly snapshots to keep:")}
            {ValueColumn(OptionalNumberField(componentRef, "", "retention.keepMonthly", { placeholder: "keep forever if not set" }))}
            {EffectiveValueColumn(EffectiveValue("retention.keepMonthly", resolved, policyDefinitionPoint))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {LabelColumn("Annual snapshots to keep:")}
            {ValueColumn(OptionalNumberField(componentRef, "", "retention.keepAnnual", { placeholder: "keep forever if not set" }))}
            {EffectiveValueColumn(EffectiveValue("retention.keepAnnual", resolved, policyDefinitionPoint))}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};