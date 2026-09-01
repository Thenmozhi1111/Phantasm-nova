import { useState, useEffect } from 'react';

// Change this to your symposium's actual date
const TARGET_DATE = new Date('2026-09-19T00:00:00');

function getTimeLeft() {
  const now = new Date();
  const diff = TARGET_DATE - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function CountdownTimer() {
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  const units = [
    { label: 'DAYS', value: time.days },
    { label: 'HOURS', value: time.hours },
    { label: 'MINUTES', value: time.minutes },
    { label: 'SECONDS', value: time.seconds },
  ];

  return (
    <div className="flex gap-3 md:gap-4">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 border border-blue-500/50 rounded-md bg-blue-500/20 shadow-glow backdrop-blur-sm"
        >
          <span className="font-serif2 text-xl md:text-2xl text-white font-semibold">
            {String(unit.value).padStart(2, '0')}
          </span>
          <span className="text-[8px] md:text-[9px] text-blue-500 tracking-wider mt-1">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
