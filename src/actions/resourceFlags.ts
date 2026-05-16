import { showToast } from "../toast";
import { saveState, state } from "../state/storage";

export function getResourceFlags(resourceId: string): {
  purchased: boolean;
  verified: boolean;
  needsSubstitute: boolean;
} {
  const f = state.resourceUserFlags[resourceId];
  if (!f || typeof f !== "object") {
    return { purchased: false, verified: false, needsSubstitute: false };
  }
  return {
    purchased: !!f.purchased,
    verified: !!f.verified,
    needsSubstitute: !!f.needsSubstitute,
  };
}

export function toggleResourceFlag(resourceId: string, flag: "purchased" | "verified" | "needsSubstitute"): void {
  if (!state.resourceUserFlags[resourceId]) {
    state.resourceUserFlags[resourceId] = {};
  }
  const entry = state.resourceUserFlags[resourceId];
  const next = !entry[flag];
  entry[flag] = next;

  if (next && flag === "needsSubstitute") {
    entry.verified = false;
  }
  if (next && flag === "verified") {
    entry.needsSubstitute = false;
  }

  if (!entry.purchased && !entry.verified && !entry.needsSubstitute) {
    delete state.resourceUserFlags[resourceId];
  }

  saveState();
  showToast("Updated");
}
