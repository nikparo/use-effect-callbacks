
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

interface Context {
  addEffect: (effect: Effect) => void;
  effects: Effects;
};
