# use-effect-callbacks

**🚨 This is experimental code not suitable for a production environment.**

A react hook for stable callbacks executed as effects.

Give the hook an object of callbacks, and it will return a stable object of similarly named stable methods. A method takes the same arguments as responding callback, and it returns a promise that resolves to whatever the callback returned.

### Pros:
- It should be concurrent safe.
- The methods are stable as long as the callback names are stable.
- It is quite straightforward and simple to use.

### Cons:
- Calling a method will trigger the component to re-render. (Not a problem if you expect it to re-render anyway, e.g. due to a setState call)
- The methods are not suitable as event listeners since they execute later, and any react event would have been recycled. (They can however very well be called from event listeners)

## How to install

```bash
npm install use-effect-callbacks
```

## Dependencies

- React v16.8+
- Some variety of ES6-Promise

## Example: Get latest state

```js
// Within parent component
const [state, setState] = useState({ foo: 'bar' });
const { getState } = useEffectCallbacks({
  getState: () => state,
});

// ...

// Within memoized child component
const handleClick = async () => {
  setState({ foo: 'baz' });
  const latestState = await getState();
  console.log(latestState); // -> { foo: 'baz' }
};
```
