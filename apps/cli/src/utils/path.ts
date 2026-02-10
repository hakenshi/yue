export function shortCwd(): string {
  const cwd = process.cwd()
  const home = process.env.HOME ?? ""
  if (home && cwd.startsWith(home)) return "~" + cwd.slice(home.length)
  return cwd
}
