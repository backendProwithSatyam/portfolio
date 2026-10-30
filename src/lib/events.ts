/** Tiny cross-component events, so the palette/terminal can trigger UI owned elsewhere. */
export const OPEN_CRM_DEMO = 'portfolio:open-crm-demo'
export const OPEN_PALETTE = 'portfolio:open-palette'

export const emit = (name: string) => window.dispatchEvent(new Event(name))
