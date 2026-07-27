import { useLocation, useNavigationType } from "react-router-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * PageTransition — wraps route content and replays a direction-aware
 * slide+fade whenever the URL pathname changes:
 *   PUSH / REPLACE → content enters from the leading edge (forward)
 *   POP (back)     → content enters from the trailing edge (backward)
 *
 * CSS-driven (see page-transitions.css) so no framer-motion dependency is
 * added to the critical path, and RTL-aware through logical properties.
 *
 * Chat is excluded because it owns its own message-level animation
 * choreography and a container-level cross-fade would fight it.
 */
const PageTransition = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navType = useNavigationType();
  const [key, setKey] = useState(location.pathname);
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const lastPathRef = useRef(location.pathname);

  useEffect(() => {
    if (lastPathRef.current !== location.pathname) {
      lastPathRef.current = location.pathname;
      setDir(navType === "POP" ? "back" : "fwd");
      setKey(location.pathname);
    }
  }, [location.pathname, navType]);

  // Skip the animation while inside surfaces that own their own motion.
  const skip =
    location.pathname.startsWith("/chat") || location.pathname.startsWith("/welcome");

  return (
    <div
      key={key}
      className={skip ? undefined : dir === "back" ? "ng-page-enter ng-page-enter--back" : "ng-page-enter"}
    >
      {children}
    </div>
  );
};

export default PageTransition;
