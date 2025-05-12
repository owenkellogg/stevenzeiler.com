export default function ScheduledYogaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-950 to-earth-950">
      {children}
    </div>
  );
} 