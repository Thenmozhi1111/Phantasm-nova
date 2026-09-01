import * as THREE from 'three';

/**
 * Fills an archway opening with darkness without ever reading as a flat
 * "card" floating behind it.
 *
 * The old approach (still present in git history) was a single flat plane
 * a couple units behind the opening. Looking straight through the arch
 * that looked fine, but the plane is a finite flat rectangle with real
 * edges — as the minecart travels past the gate at an angle (rather than
 * straight on), those edges and the plane's face at a grazing angle become
 * visible as an obviously flat black rectangle sitting behind the stonework
 * instead of inside it.
 *
 * Fix: build a short open-ended box instead of one plane — a back wall
 * plus two side walls and a roof (no front face, no floor). Whichever
 * angle the opening is seen from while moving, there's still a dark
 * surface roughly aligned with the line of sight (the near side wall
 * catches grazing views that would otherwise skate past a single flat
 * plane's edge), so it reads as "a dark passage" rather than "a black
 * rectangle someone left floating there". All faces are unlit
 * (meshBasicMaterial, toneMapped off) so they stay flat black regardless
 * of the scene's torches/moonlight — that's what makes the entrance itself
 * still read as dark from outside.
 */
export default function GateVoid({
  width = 5,
  height = 5.5,
  depth = 3.5,
  centerY,
  frontZ = -0.3,
  color = '#0a0d16',
}) {
  const halfW = width / 2;
  const cy = centerY ?? height / 2;
  const matProps = { color, toneMapped: false, side: THREE.DoubleSide };

  return (
    <group position={[0, cy, frontZ]}>
      {/* Back wall — the deepest, most-visible-when-straight-on surface. */}
      <mesh position={[0, 0, -depth]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial {...matProps} />
      </mesh>
      {/* Side walls — close the box so grazing/side views (the case while
          the cart is moving past rather than looking straight through)
          still land on a dark surface instead of skating past the back
          wall's edge into whatever is rendered beyond it. */}
      <mesh position={[-halfW, 0, -depth / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, height]} />
        <meshBasicMaterial {...matProps} />
      </mesh>
      <mesh position={[halfW, 0, -depth / 2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[depth, height]} />
        <meshBasicMaterial {...matProps} />
      </mesh>
      {/* Roof — covers the view from slightly above (camera looks down
          at the track), same reasoning as the side walls. */}
      <mesh position={[0, height / 2, -depth / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial {...matProps} />
      </mesh>
      {/* Floor — was missing, which left the box open on the bottom.
          Against this scene's ground plane that open edge showed up as a
          hard seam/gap right at the base of the arch rather than a clean
          dark interior — the "black spot" artifact reported at the event
          gates. Closing it off removes that seam entirely. */}
      <mesh position={[0, -height / 2, -depth / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial {...matProps} />
      </mesh>
    </group>
  );
}
