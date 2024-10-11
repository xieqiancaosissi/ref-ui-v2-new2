import { useEffect, useMemo, useState } from "react";
import { isMobile } from "@/utils/device";
import MenuPc from "./menuPc";
import MenuMobile from "./menuMobile";

export default function Menu() {
  const mobile = isMobile();
  const [is_mobile, set_is_mobile] = useState<boolean>(false);
  useEffect(() => {
    if (mobile) {
      set_is_mobile(true);
    }
  }, [mobile]);
  if (is_mobile) return <MenuMobile />;
  return <MenuPc />;
}
