export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="relative mx-auto flex min-h-svh max-w-2xl flex-col px-4 pt-12 sm:px-5 sm:pt-20 lg:pt-24"
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
