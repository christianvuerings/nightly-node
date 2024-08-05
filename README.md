# Nightly Node

Run the latest Node.js nightly build

## Usage

```bash
npx nightly-node --version
```

## Test

```bash
npm test
```

### Watch mode

```bash
node --test --watch
```

## Debug

```bash
NODE_DEBUG=nightly-node npx nightly-node --version
```

## FAQ

### Benefits over [node-nightly](https://github.com/hemanth/node-nightly)

- ✅ Downloads latest version of Node.js nightly build supported by your operating system
- ✅ No external dependencies

### Why does this package exist?

- To test the latest Node.js features without having to manually download and install the nightly build.
- [node-nightly](https://github.com/hemanth/node-nightly) did not work for me since it always fetched a version of Node.js that was not supported by my operating system.
- Tools like [nvm](https://github.com/nvm-sh/nvm) [do not support running nightly builds](https://github.com/nvm-sh/nvm/issues/1053)

## License

MIT

## Inspiration

This project was inspired by [node-nightly](https://github.com/hemanth/node-nightly)
