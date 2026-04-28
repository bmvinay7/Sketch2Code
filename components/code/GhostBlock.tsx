export function GhostBlock({ children }: { children: React.ReactNode }) {
  return <div className="border-l-2 border-warning pl-3 opacity-60">{children}</div>;
}
