// v4.5 unified app page header: mono eyebrow + Bricolage 800 title,
// consistent spacing, optional action slot on the right.
export function PageHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-1 font-heading text-2xl font-extrabold">{title}</h2>
      </div>
      {action}
    </div>
  );
}
