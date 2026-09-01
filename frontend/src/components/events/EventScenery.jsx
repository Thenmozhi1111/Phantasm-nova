import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { cloneGltfScene } from '../../utils/cloneGltf';
import { useFittedGLTF } from '../../utils/fitModel';
import { events } from '../../data/events';
import { MODEL_PATHS, MODEL_FIT } from './config';

/**
 * Hand-placed scenery, replacing the old full-track procedural scatter
 * (Ruins.jsx / Debris.jsx / GroundClutter.jsx, and the earlier randomly-
 * tiled AncientTree.jsx + RuinedTowers.jsx — all removed per feedback).
 *
 * Full 8-event layout per the brief (gate side comes from
 * trackLayout.js's alternating right/left/right/left... pattern, so
 * "same"/"opposite" below is always relative to that event's own gate,
 * not a hardcoded left/right):
 *
 *   Event 1 (gate right): ruined towers OPPOSITE the gate (left).
 *   Event 2 (gate left):  tree OPPOSITE the gate (right).
 *   Event 3 (gate right): ruined tower OPPOSITE (left) + ancient temple
 *                          SAME side as the gate (right).
 *   Event 4 (gate left):  tree SAME side as the gate (left) + ruined
 *                          towers OPPOSITE (right).
 *   Event 5 (gate right): ancient temple OPPOSITE the gate (left).
 *   Event 6 (gate left):  ruined towers OPPOSITE the gate (right).
 *   Event 7 (gate right): tree SAME side as the gate (right) + ancient
 *                          ruins/temple OPPOSITE (left).
 *   Event 8 (gate left):  ancient temple OPPOSITE the gate (right) +
 *                          tree SAME side as the gate (left).
 */
const PLACEMENTS = [
  { eventId: 1, type: 'tower', side: 'opposite' },
  { eventId: 2, type: 'tree', side: 'opposite' },
  { eventId: 3, type: 'tower', side: 'opposite' },
  { eventId: 3, type: 'temple', side: 'same' },
  { eventId: 4, type: 'tree', side: 'same' },
  { eventId: 4, type: 'tower', side: 'opposite' },
  { eventId: 5, type: 'temple', side: 'opposite' },
  { eventId: 6, type: 'tower', side: 'opposite' },
  { eventId: 7, type: 'tree', side: 'same' },
  { eventId: 7, type: 'temple', side: 'opposite' },
  { eventId: 8, type: 'temple', side: 'opposite' },
  { eventId: 8, type: 'tree', side: 'same' },
];

// Distance from the centerline. Close to the rail (near-track, per the
// brief) while staying clear of every gate's own footprint — a spur only
// reaches this far out much closer to the mainline fork than to the gate
// itself (see trackLayout.js), and at each placement's own Z (= the
// gate's Z) the spur on its side is already out at eventSideOffset (12),
// so there's no overlap. Towers/temple get a little extra room since
// they're the largest scenery pieces (MODEL_FIT targets 7 / 6.5 vs the
// tree's 5.5).
const OFFSET = { tree: 4.5, tower: 6, temple: 6 };

export default function EventScenery() {
  const tree = useFittedGLTF(MODEL_PATHS.tree, MODEL_FIT.tree);
  const towers = useFittedGLTF(MODEL_PATHS.towers, MODEL_FIT.towers);
  const temple = useFittedGLTF(MODEL_PATHS.temple, MODEL_FIT.temple);

  const items = useMemo(
    () =>
      PLACEMENTS.map((p, i) => {
        const ev = events.find((e) => e.id === p.eventId);
        if (!ev) return null;
        const gateSign = ev.side === 'right' ? 1 : -1;
        const itemSign = p.side === 'same' ? gateSign : -gateSign;
        const { scene, fit } =
          p.type === 'tree' ? tree : p.type === 'tower' ? towers : temple;
        return {
          key: `${p.eventId}-${p.type}-${i}`,
          clone: cloneGltfScene(scene),
          fit,
          pos: [itemSign * OFFSET[p.type], 0, ev.z],
        };
      }).filter(Boolean),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tree.scene, towers.scene, temple.scene]
  );

  return (
    <group>
      {items.map((item) => (
        <group key={item.key} position={item.pos}>
          <group scale={item.fit.scale}>
            <primitive object={item.clone} position={item.fit.offset} />
          </group>
        </group>
      ))}
    </group>
  );
}

useGLTF.preload(MODEL_PATHS.tree);
useGLTF.preload(MODEL_PATHS.towers);
useGLTF.preload(MODEL_PATHS.temple);
