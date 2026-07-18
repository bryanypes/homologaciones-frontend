import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';

export default function Reveal({ children, className, delay = 0, as: As = 'div' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <As
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={cn('js-reveal', visible && 'js-reveal-visible', className)}
    >
      {children}
    </As>
  );
}
