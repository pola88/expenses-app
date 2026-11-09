type InitialsProps = {
  name: string | null;
};

export function Initials({ name }: InitialsProps) {
  const letters = (name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
      {letters}
    </span>
  );
}
