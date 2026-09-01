import { events } from '../../data/events';
import EventSignpost from './EventSignpost';

export default function EventSignposts() {
  return (
    <group>
      {events.map((ev) => (
        <EventSignpost key={ev.id} z={ev.z} side={ev.side} title={ev.title} />
      ))}
    </group>
  );
}
