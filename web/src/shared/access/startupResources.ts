import { isCancellation } from '../api/errors.ts';

export interface StartupResource {
  /** Stable name used in diagnostics. */
  name: string;
  load: () => Promise<unknown>;
}

/**
 * Start resources that enrich the shell without gating it. The returned promise never rejects:
 * a failed optional resource is reported once, a cancelled one is ignored, and the rest still load.
 * Callers that must fail closed keep those resources out of this list.
 */
export function startOptionalStartupResources(
  resources: StartupResource[],
  onFailure: (name: string, error: unknown) => void,
): Promise<void> {
  return Promise.allSettled(resources.map(resource => Promise.resolve().then(resource.load))).then(results => {
    results.forEach((result, index) => {
      if (result.status === 'rejected' && !isCancellation(result.reason)) onFailure(resources[index].name, result.reason);
    });
  });
}
