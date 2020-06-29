import { useEffect, useLayoutEffect, useMemo, useReducer } from 'react';

interface Action {
  type: string;
  payload: any;
}

interface Effect {
  fn: () => void;
  done: boolean;
}

interface Methods {
  [x: string]: (...args: any) => any;
}

interface Callbacks {
  [x: string]: (...args: any) => Promise<any>;
}

type Effects = Effect[];

const initialEffects: Effects = [];

const effectReducer = (methods: Methods) => (oldEffects: Effects, action: Action) => {
  const { type, payload } = action;

  if (type !== 'method') {
    throw new Error(`Unknown action type: "${type}"`);
  }

  const { name, args, reject, resolve } = payload;
  const method = methods[name];

  const fn = () => {
    try {
      resolve(method(...args));
    } catch (e) {
      reject(e);
    }
  };

  // Filter out already completed effects.
  const newEffects = oldEffects.filter((effect: Effect) => !effect.done);
  newEffects.push({ fn, done: false });

  return newEffects;
};

const runEffect = (effect: Effect) => {
  // Mark effect done in-place in order to skip unnecessary re-renders
  if (!effect.done) {
    effect.done = true;
    effect.fn();
  }
};

const useMethodCallbacks = (methods: Methods, dispatch: (action: Action) => void) => {
  const methodNames = useMemo(
    () =>
      Object.keys(methods)
        .filter((name) => typeof methods[name] === 'function')
        .sort(),
    [methods],
  );

  // Create stable callbacks according to the method names
  return useMemo(() => {
    const callbacks: Callbacks = {};
    methodNames.forEach((name) => {
      callbacks[name] = (...args) =>
        new Promise((resolve, reject) => {
          dispatch({ type: 'method', payload: { args, name, reject, resolve } });
        });
    });

    return callbacks;
  }, methodNames);
};

export function useEffectCallbacks(methods: Methods) {
  const [effects, dispatch] = useReducer(effectReducer(methods), initialEffects);

  useEffect(() => {
    effects.forEach(runEffect);
  }, [effects]);

  return useMethodCallbacks(methods, dispatch);
}

export function useLayoutEffectCallbacks(methods: Methods) {
  const [effects, dispatch] = useReducer(effectReducer(methods), initialEffects);

  useLayoutEffect(() => {
    effects.forEach(runEffect);
  }, [effects]);

  return useMethodCallbacks(methods, dispatch);
}
