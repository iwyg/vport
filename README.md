**Note: this is in a very alpha state.**


## Basic usage

```javascript

import ViewPort, {watch} from 'vport';

const vp = new ViewPort;

ViewPort.registerElements(document.querySelectorAll('.vpelements'), () => {
    // handles viewport enter event.
});

let cancel = watch.start();

// to cancel viewport events:
cancel();
```

### Register a single element.

```javascript

ViewPort.registerElement(document.getElementById('vp1'), () => {
    // handles viewport enter event.
});
```

### Remove elements from viewport.

```javascript

const elements = document.querySelectorAll('.vpelements');

//…

ViewPort.removeElements(elements);
```

### Remove single element from viewport.

```javascript

const elements = document.getElementById('vp1');

//…

ViewPort.removeElement(element);
```
