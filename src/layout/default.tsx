import { useEffect, useState } from "react";

export default function DefaultLayout({
  children,
  isClientRender,
}: {
  children: React.ReactNode;
  isClientRender?: boolean;
}) {
  const [clientReady, setClientReady] = useState<boolean>(false);
  useEffect(() => {
    setClientReady(true);
  }, []);
  if (isClientRender) {
    if (clientReady) return <>{children}</>;
    return null;
  }
  return <>{children}</>;
}
