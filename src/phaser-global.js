// phaser3-rex-plugins reference a global `Phaser` at module-evaluation time
// (e.g. `const GetValue = Phaser.Utils.Objects.GetValue`). Since we consume Phaser
// as an ES module, we must publish it to the global scope BEFORE any rex plugin is
// imported. Import this module first, ahead of any rex import.
import Phaser from 'phaser';

if (typeof window !== 'undefined' && !window.Phaser) {
  window.Phaser = Phaser;
}

export default Phaser;
