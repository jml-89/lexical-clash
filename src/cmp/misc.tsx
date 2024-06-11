import { memo, useState, useRef, useEffect, useCallback } from "react";

import Image from "next/image";

import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  useAnimate,
  animate,
} from "framer-motion";

export const HealthBar = memo(function HealthBar({
  badguy,
  health,
  healthMax,
}: {
  badguy: boolean;
  health: number;
  healthMax: number;
}) {
  const barcolor = badguy ? "bg-red-800" : "bg-lime-500";
  const healthpct = Math.floor((health / healthMax) * 100.0);

  return (
    <div
      className={[
        "h-6",
        "shadow-slate-900 shadow-sm border-1 border-black",
        "bg-zinc-400",
        "grid",
      ].join(" ")}
    >
      {healthpct > 0 && (
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${healthpct}%` }}
          transition={{ duration: 0.6 }}
          className={`${barcolor} row-start-1 col-start-1`}
        />
      )}
      <div className="text-black text-sm font-medium row-start-1 col-start-1 flex flex-row justify-center items-center">
        {health}/{healthMax}
      </div>
    </div>
  );
});

export function TapGlass({
  children,
  className,
  onClick,
  repeat,
}: {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  repeat?: boolean;
}) {
  return (
    <SquishyButton onClick={onClick} manyClick={repeat}>
      <OnDarkGlass className={className}>{children}</OnDarkGlass>
    </SquishyButton>
  );
}

export function OnDarkGlass({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  let cn = "backdrop-blur-lg bg-black/50 border border-black";
  if (className) {
    cn = `${cn} ${className}`;
  }
  return <div className={cn}>{children}</div>;
}

export function SquishyButton({
  children,
  onClick,
  className,
  manyClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  manyClick?: boolean;
}) {
  const [clicked, setClicked] = useState(false);

  const done = !manyClick && clicked;

  const myOnClick = onClick
    ? () => {
        if (done) {
          return;
        }
        setClicked(true);
        onClick();
      }
    : undefined;

  return (
    <motion.button
      onClick={myOnClick}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0 }}
      animate={done ? { scale: 0 } : { scale: [1.0, 0.95, 1.0] }}
      transition={done ? { duration: 1 } : { repeat: Infinity, duration: 3 }}
      className="shadow-lg shadow-slate-900"
    >
      {children}
    </motion.button>
  );
}

export function ButtonX({
  children,
  onClick,
  scary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  scary?: boolean;
}) {
  let colorway = "text-black bg-amber-400";
  if (scary) {
    colorway = "text-yellow bg-red-800";
  }

  return (
    <button
      className={`m-2 self-center ${colorway} rounded-lg p-4 text-2xl shadow-lg shadow-slate-900`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function useStateShim<Thing>(
  thing: Thing,
  setThing: (thing: Thing) => Promise<void>,
): [Thing, (thing: Thing) => Promise<void>] {
  interface History {
    param: Thing;
    local?: Thing;
  }
  const [shim, setShim] = useState<History>({ param: thing });
  if (!Object.is(thing, shim.param)) {
    setShim({ param: thing });
  }

  const returnHandler = async (next: Thing): Promise<void> => {
    if (!(shim.local && Object.is(shim.local, next))) {
      setShim({ ...shim, local: next });
    }
    await setThing(next);
  };

  return [shim.local ? shim.local : thing, returnHandler];
}

function LazyBackground({ bg }: { bg: string }) {
  const [me, setMe] = useState({
    prev: "",
    curr: bg,
    loaded: false,
  });

  if (me.loaded && bg != me.curr) {
    setMe({
      prev: me.curr,
      curr: bg,
      loaded: false,
    });
  }

  return (
    <div className="size-full grid">
      {me.prev == "" ? (
        <div
          key="blank"
          className="bg-black/50 row-start-1 col-start-1 size-full"
        />
      ) : (
        <div
          key={me.prev}
          className="brightness-50 row-start-1 col-start-1 relative"
        >
          <Image
            src={me.prev}
            alt="A stale old background"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
      )}
      <motion.div
        key={me.curr}
        className="row-start-1 col-start-1 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: me.loaded ? 1 : 0 }}
        transition={{ duration: 1 }}
      >
        <Image
          src={me.curr}
          alt="A beautiful new background!"
          fill
          priority
          onLoad={() => setMe({ ...me, loaded: true })}
          className="object-cover object-center"
        />
      </motion.div>
    </div>
  );
}

export function OnBackground({
  bg,
  children,
}: {
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 grid">
      <div className="row-start-1 col-start-1">
        <LazyBackground bg={bg} />
      </div>
      <div className="row-start-1 col-start-1 flex flex-col z-10">
        {children}
      </div>
    </div>
  );
}
