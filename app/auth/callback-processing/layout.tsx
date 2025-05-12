export default function CallbackProcessingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full">
      {children}
    </div>
  );
} 