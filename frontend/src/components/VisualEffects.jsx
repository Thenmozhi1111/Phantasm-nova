<<<<<<< HEAD
import { Suspense, lazy } from "react";

const AnimatedBackdrop = lazy(() => import("./AnimatedBackdrop.jsx"));
const CursorTrail = lazy(() => import("./CursorTrail.jsx"));

export default function VisualEffects() {
  return (
    <Suspense fallback={null}>
      <AnimatedBackdrop />
      <CursorTrail />
    </Suspense>
  );
}
=======
import { Suspense, lazy } from "react";

const AnimatedBackdrop = lazy(() => import("./AnimatedBackdrop.jsx"));
const CursorTrail = lazy(() => import("./CursorTrail.jsx"));

export default function VisualEffects() {
  return (
    <Suspense fallback={null}>
      <AnimatedBackdrop />
      <CursorTrail />
    </Suspense>
  );
}
>>>>>>> 16840363 (Payment Updated)
