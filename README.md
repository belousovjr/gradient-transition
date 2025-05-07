# gradient-transition

A JavaScript library to smoothly animate background-image gradients.

## Table of Contents

* [Installation](#installation)
* [Quick Start](#quick-start)
* [Supported Features and Limitations](#supported-features-and-limitations)
* [Performance Considerations](#performance-considerations)

## Installation

Install via npm or yarn:

```bash
npm install gradient-transition --save
# or
yarn add gradient-transition
```

**CDN:**
```html
<script src="https://unpkg.com/gradient-transition@0.0.5/dist/gradient-transition.umd.cjs"></script>
```
> **Note**: This will expose the library globally as `GradientTransition`.
---

## Quick Start

1. **Add the markup**:

   ```html
   <div class="gt-wrap my-wrapper">
     <span class="gt-render my-gradient"></span>
     <span>Some Content</span>
   </div>
   ```

    * `.gt-wrap` and `.gt-render` are reserved classes required by the library.
    * `.my-gradient` and `.my-wrapper` are your custom classes for gradients styling.

2. **Define your CSS gradient** on the `.gt-render.my-gradient` element:

   ```css
   /* Initial gradient */
   .my-wrapper .my-gradient {
     background-image: linear-gradient(90deg, green, white, red);
     /* Optional: customize transition properties */
     transition: background-image 1s ease-in-out;
   }
   /* On hover, triggers a smooth transition */
   .my-wrapper:hover .my-gradient {
     background-image: linear-gradient(black, red, yellow);
   }
   ```

3. **Initialize** with JavaScript:

   ```js
   import { attach, detach, reset } from 'gradient-transition';
   // Attach gradient transition to all matching wrappers
   attach('.gt-wrap.my-wrapper');
   // To detach
   detach('.gt-wrap.my-wrapper');
   // To reset all transitions
   reset();
   ```
---

## Supported Features and Limitations

* **Gradient types**: `linear-gradient`, `radial-gradient`.
* **Angle units**: `deg`, `rad`.
* **Color stop units**: `px`, `%`, `em`.

---

## Performance Considerations

Animating gradients in real time is computationally intensive. **Use with caution in production**, especially on devices with limited CPU/GPU resources. Thoroughly test performance in your target environments.

---

*Issues, suggestions, and pull requests are welcome!  
Feel free to check out the  [GitHub](https://github.com/belousovjr/gradient-transition).*
