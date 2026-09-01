import { events } from '../../data/events';
import EventGate from './EventGate';

export default function EventGates({ onSelect, cameraState }) {
  return (
    <group>
      {events.map((ev) => (
        <EventGate
          key={ev.id}
          id={ev.id}
          z={ev.z}
          side={ev.side}
          code={ev.code}
          facingY={ev.facingY}
          onSelect={onSelect}
          cameraState={cameraState}
        />
      ))}
    </group>
  );
}