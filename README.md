# tug.js

## Usage

### Init drag and drop for dom nodes
```html
<div class="dragable">drag me!</div>
<div class="dragable">or me!</div>
<div class="dropable">drop zone</div>
<div class="dropable dragable">dragable drop zone</div>
```

```javascript
import { Tug } from "tug.js";

Tug.makeDragable({ selector: '.dragable', onDrop: (element) => {
    console.log('i just got dropped', element);
}});

Tug.makeDropable({ selector: '.dropable' });
```