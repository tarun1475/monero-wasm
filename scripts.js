let squarer;

function loadWebAssembly(fileName) {
  return fetch(fileName)
    .then(response => response.arrayBuffer())
    .then(buffer => WebAssembly.compile(buffer))
    .then(module => {
      return new WebAssembly.Instance(module);
    });
}

loadWebAssembly("simple.wasm").then(instance => {
  const seed = "9f9ad282eec2f01adf6d5b947eb28225";
  const mnemonic = instance.exports.wallet_mnemonic_from_seed(seed);

  console.log(mnemonic);
});
