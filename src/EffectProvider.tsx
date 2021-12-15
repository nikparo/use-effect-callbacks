import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactChild } from 'react';

const initialEffects: Effects = [];

const defaultContext = Object.freeze({
  effects: initialEffects,
  addEffect(effect: Effect) {
    throw new Error('EffectContext must be given a value');
  },
});

const EffectContext = createContext<Context>(defaultContext);

const EffectRunner = ({ context }: { context: Context }): null => {
  const [effects, setEffects] = useState<Effects>(context.effects);
  // const context = useContext(Effe)

  context.addEffect = useCallback((effect: Effect) => {
    setEffects(cur => [...cur, effect])
  }, []);

  useEffect(() => {
    effects.forEach(effect => {
      try {
        effect.fn()
      } catch (e) {
        console.error(e);
      }
    });
    // Remove effects in place in order to not trigger another re-render???
    // May not matter much, this is a minimal component..
    // effects.splice(0, effects.length);
    setEffects(initialEffects);
  }, [effects]);

  return null;
};


export function EffectProvider({ children }: { children: ReactChild}): JSX.Element {
  const contextRef = useRef({
    effects: initialEffects,
    addEffect(effect: Effect) {
      this.effects = [...this.effects, effect];
    },
  });

  return (
    <EffectContext.Provider value={contextRef.current}>
      <EffectRunner context={contextRef.current} />
      {children}
    </EffectContext.Provider>
  );
}
