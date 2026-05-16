export type ResourceFilterState = {
  phase: string;
  status: string;
  user: string;
};

export const resourceFilter: ResourceFilterState = {
  phase: "all",
  status: "all",
  user: "all",
};
