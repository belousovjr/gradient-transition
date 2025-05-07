# gradient-transition

A JavaScript library to smoothly animate background-image gradients.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Supported Features and Limitations](#supported-features-and-limitations)
- [Performance Considerations](#performance-considerations)

## Installation

Install via npm or yarn:

```bash
npm install gradient-transition --save
# or
yarn add gradient-transition
```

**CDN:**

```html
<script src="https://unpkg.com/gradient-transition@0.0.6/dist/gradient-transition.umd.cjs"></script>
```

> **Note**: This will expose the library globally as `GradientTransition`.

---

## Quick Start

1. **Add the markup**:

   ```html
   <div class="gt-wrap my-wrapper" style="height: 200px; width: 200px;">
     <span class="gt-render my-gradient"></span>
     SOME CONTENT
   </div>
   ```

   - `.gt-wrap` and `.gt-render` are reserved classes required by the library.

2. **Define your CSS gradient transition** on the `.my-gradient` element:

   ```css
   .my-wrapper .my-gradient {
     background-image: linear-gradient(90deg, green, white, red);
     transition: background-image 1s ease-in-out;
   }
   .my-wrapper:hover .my-gradient {
     background-image: linear-gradient(to bottom, black, red, yellow);
   }
   ```

3. **Initialize** with JavaScript:

   ```js
   import { attach, detach, reset } from "gradient-transition";
   attach(".gt-wrap.my-wrapper"); // Attach to all matching wrappers
   detach(".gt-wrap.my-wrapper"); // To detach
   reset(); // To reset all
   ```

[👉 Live Demo on CodePen](https://codepen.io/belousowork/pen/KwwBwrQ)

---

## Supported Features and Limitations

- **Gradient types**: `linear-gradient`, `radial-gradient`.
- **Angle units**: `deg`, `rad`.
- **Color stop units**: `px`, `%`, `em`.

---

## Performance Considerations

Animating gradients in real time is computationally intensive. **Use with caution in production**, especially on devices with limited CPU/GPU resources. Thoroughly test performance in your target environments.

---

_Issues, suggestions, and pull requests are welcome!  
Feel free to check out the [GitHub](https://github.com/belousovjr/gradient-transition)._
