"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

export interface AnalyticsSelectOption {
  value: string;
  label: string;
  group?: string;
}

interface AnalyticsSelectProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: AnalyticsSelectOption[];
  id?: string;
}

export function AnalyticsSelect({ value, onChange, label, options, id }: AnalyticsSelectProps) {
  const ungrouped = options.filter(option => !option.group);
  const groups = [...new Set(options.flatMap(option => option.group ? [option.group] : []))];
  return <Select value={value} onValueChange={onChange}>
    <SelectTrigger id={id} aria-label={label} className="w-full min-w-0"><SelectValue placeholder={label} /></SelectTrigger>
    <SelectContent>
      {ungrouped.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
      {groups.map(group => <SelectGroup key={group}>
        <SelectLabel>{group}</SelectLabel>
        {options.filter(option => option.group === group).map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
      </SelectGroup>)}
    </SelectContent>
  </Select>;
}
