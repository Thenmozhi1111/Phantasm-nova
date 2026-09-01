import { useRef, useState } from 'react';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';

export default function App() {
  const [activeEventId, setActiveEventId] = useState(null);
  const savedScroll = useRef(0);

  function handleSelectEvent(id) {
    savedScroll.current = window.scrollY;
    setActiveEventId(id);
    window.scrollTo(0, 0);
  }

  function handleBack() {
    setActiveEventId(null);
    // Wait a frame so the journey page has re-mounted before restoring
    // scroll — otherwise the tall track div isn't there yet to scroll into.
    requestAnimationFrame(() => {
      window.scrollTo(0, savedScroll.current);
    });
  }

  return activeEventId ? (
    <EventDetails eventId={activeEventId} onBack={handleBack} />
  ) : (
    <Events onSelectEvent={handleSelectEvent} />
  );
}
