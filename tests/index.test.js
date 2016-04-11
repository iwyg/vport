import ViewPort, {watch} from '../src/index.js';

describe('Viewport exports', function () {
  it('should export viewport as default.', function () {
    expect(typeof ViewPort).toBe('function');
    expect(ViewPort.prototype.constructor.name).toEqual('ViewPort');
  });

  it('should export viewport as default.', function () {
    expect(typeof watch).toBe('object');
    expect(typeof watch.start).toBe('function');
  });
});
