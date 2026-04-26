export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="relative mx-auto flex min-h-svh max-w-2xl flex-col px-2 pt-24 lg:pt-32"
      id="scrollable"
    >
      {/* progressive blur top */}
      {/* <ProgressiveBlur
        direction="top"
        className="fixed top-0 left-0 h-12 w-full"
      /> */}
      {children}
      {/* <Footer /> */}
    </main>
  );
}
