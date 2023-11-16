export function trim(value: string): string {
  return value
    .replace(/^\s+/, "")
    .replace(/\s+$/, "")
    .replace(/\s{2,}/g, " ");
}

/*
 * these functions are not referenced or used anywhere
 * in the codebase, hence in the prod build process
 * optimiation.usedExports = true will remove these dead code (tree shake)
 * from the bundle
 */
export function capitalizeeeeeeee(): string {
  return "Capitalizeeee";
}

export function uppercaseeeee(): string {
  return "UPPERCASEEEEEEE";
}
