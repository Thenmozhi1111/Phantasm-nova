import { Html, useProgress } from '@react-three/drei';

export default function Loader() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="loader">
        <div className="loader-title">PHANTASM</div>
        <div className="loader-sub">ENTERING THE RUINS</div>
        <div className="loader-pct">{Math.round(progress)}%</div>
        <div className="loader-bar">
          <div className="loader-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </Html>
  );
}
