export type FormColumn = { form?: boolean | { show?: unknown } };

/**
 * The submit allowlist is derived from the CRUD schema, so a field the form can render is
 * never silently dropped on submit. Virtual columns (`_index`) never hold form data.
 */
export function deriveUserFormKeys(columns: Record<string, FormColumn>): string[] {
  return Object.entries(columns)
    .filter(([key, column]) => !key.startsWith('_') && column?.form !== false
      && (typeof column?.form !== 'object' || column.form.show !== false))
    .map(([key]) => key);
}
