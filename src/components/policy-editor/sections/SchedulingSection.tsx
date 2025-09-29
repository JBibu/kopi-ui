import React from 'react';
import { Clock } from 'lucide-react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { OptionalNumberField } from '../../../forms/OptionalNumberField';
import { TimesOfDayList } from '../../../forms/TimesOfDayList';
import { LabelColumn } from '../LabelColumn';
import { ValueColumn } from '../ValueColumn';
import { WideValueColumn } from '../WideValueColumn';
import { EffectiveValueColumn } from '../EffectiveValueColumn';
import { EffectiveValue } from '../EffectiveValue';
import { EffectiveTimesOfDayValue } from '../EffectiveTimesOfDayValue';
import { UpcomingSnapshotTimes } from '../UpcomingSnapshotTimes';

interface SchedulingSectionProps {
  componentRef: any;
  resolved: any;
  policyDefinitionPoint: (p: any) => React.ReactNode;
}

export const SchedulingSection: React.FC<SchedulingSectionProps> = ({
  componentRef,
  resolved,
  policyDefinitionPoint,
}) => {
  return (
    <AccordionItem value="scheduling">
      <AccordionTrigger>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Scheduling</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {LabelColumn("Snapshot frequency:")}
            {ValueColumn(OptionalNumberField(componentRef, "", "scheduling.intervalSeconds", { placeholder: "number of seconds" }))}
            {EffectiveValueColumn(EffectiveValue("scheduling.intervalSeconds", resolved, policyDefinitionPoint))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {LabelColumn("Times of day:")}
            {WideValueColumn(TimesOfDayList(componentRef, "", "scheduling.timeOfDay"))}
            {EffectiveValueColumn(EffectiveTimesOfDayValue("scheduling.timeOfDay", resolved, policyDefinitionPoint))}
          </div>
          {resolved && (
            <UpcomingSnapshotTimes times={resolved.upcomingSnapshotTimes} />
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};