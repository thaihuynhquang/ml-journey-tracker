export type ResourceUserEntry = {
  purchased?: boolean;
  verified?: boolean;
  needsSubstitute?: boolean;
};

export type AppState = {
  checked: Record<string, boolean>;
  notes: Record<string, string>;
  resourceUserFlags: Record<string, ResourceUserEntry>;
  startDate: string;
  dailyHours: number;
  daysPerWeek: number;
};
