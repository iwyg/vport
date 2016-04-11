import ViewPort, {watch} from '../src/viewport.js';

describe('Viewport register', function () {
  var divs = [];

  beforeEach(function () {
    var style = {
      width: '100%',
      height: '100%',
    };

    var div;
    for (var i = 0; i < 4; i++) {
      div = document.createElement('div');
      div.className = 'vp';
      div.id = 'vp'+i;
      div.style = style;
      divs.push(div);
      document.body.appendChild(div);
    }

    document.body.style = style;
  });

  afterEach(function () {
    document.body.innerHTML = '';
    divs = [];
  });

  it('should register elements', function () {
    var elements = document.querySelectorAll('.vp');
    var vp = new ViewPort;
    vp.registerElements(divs);
    expect(vp.elements.length).toBe(4);
  });

  it('should remove elements', function () {
    var rmDiv = divs[2];
    var elements = document.querySelectorAll('.vp');
    var vp = new ViewPort;
    vp.registerElements(elements);
    vp.removeElement(rmDiv);
    expect(vp.elements.length).toBe(3);
  })
});

describe('tick', function () {
  it('should only start once if already stared', function () {
    var cancel = watch.start();
    expect(typeof cancel).toBe('function');
    expect(watch.start()).toBe(false);

    cancel();

    expect(typeof watch.start()).toBe('function');
  });
});
