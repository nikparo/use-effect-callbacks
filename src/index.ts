import { useEffect, useLayoutEffect, useMemo, useReducer } from 'react';

interface Action {
  type: string;
  payload: any;
}

interface Effect {
  fn: () => void;
  done: boolean;
}

interface Callbacks {
  [x: string]: (...args: any) => any;
}

interface Methods {
  [x: string]: (...args: any) => Promise<any>;
}

type Effects = Effect[];

const initialEffects: Effects = [];

const effectReducer = (callbacks: Callbacks) => (oldEffects: Effects, action: Action) => {
  const { type, payload } = action;

  if (type !== 'method') {
    throw new Error(`Unknown action type: "${type}"`);
  }

  const { name, args, reject, resolve } = payload;
  const cb = callbacks[name];

  const fn = () => {
    try {
      resolve(cb(...args));
    } catch (e) {
      reject(e);
    }
  };

  const effect: Effect = { fn, done: false };

  // Either all or none of the effects have run
  const keepOld = !!oldEffects.length && !oldEffects[0].done;

  return keepOld ? [...oldEffects, effect] : [effect];
};

const runEffect = (effect: Effect) => {
  // Mark effect done in-place in order to skip unnecessary re-renders
  if (!effect.done) {
    effect.done = true;
    effect.fn();
  }
};

const useStableMethods = (callbacks: Callbacks, dispatch: (action: Action) => void) => {
  const callbackNames = useMemo(
    () =>
      Object.keys(callbacks)
        .filter((name) => typeof callbacks[name] === 'function')
        .sort(),
    [callbacks],
  );

  // Create stable methods according to the method names
  return useMemo(() => {
    const methods: Methods = {};
    callbackNames.forEach((name) => {
      methods[name] = (...args) =>
        new Promise((resolve, reject) => {
          dispatch({ type: 'method', payload: { args, name, reject, resolve } });
        });
    });
    return methods;
  }, callbackNames);
};

export function useEffectCallbacks(callbacks: Callbacks) {
  const [effects, dispatch] = useReducer(effectReducer(callbacks), initialEffects);

  useEffect(() => {
    effects.forEach(runEffect);
  }, [effects]);

  return useStableMethods(callbacks, dispatch);
}

export function useLayoutEffectCallbacks(callbacks: Callbacks) {
  const [effects, dispatch] = useReducer(effectReducer(callbacks), initialEffects);

  useLayoutEffect(() => {
    effects.forEach(runEffect);
  }, [effects]);

  return useStableMethods(callbacks, dispatch);
}
