# 3D Data Visualizer

A custom data viz made using JS (without any dependencies) and just 10kb bundle size offering rich interactions and 60fps.

🎥  [3D Custom Data Viz Youtube Intro | Under 2 minutes](https://youtu.be/MxIcZMYH0DU)

<img width="1822" alt="Custom Data Viz as a 3D sphere" src="https://github.com/user-attachments/assets/6328ed98-699d-4156-9527-3b409399aaf0" />

## Problem Statement for UXE

!["The Data Viz question"](https://github.com/user-attachments/assets/9fd54ddf-63aa-4ffd-870e-ebdd8802abc5)

## **Shortcut Table**

| **Action**             | **Laptop**                          | **Phone**                       |
|------------------------|-------------------------------------|---------------------------------|
| **Drag a Dot**         | `Click + Drag`                      | `Touch + Move`                  |
| **Drag Focused Dot**   | `Arrow Keys`                        | `Touch + Move`                  |
| **Rotate the Sphere**  | `Hold Shift + Mouse Drag/Arrow Keys`| `Two-Finger Touch & Rotate`     |
| **Nest a Dot**         | `Drag and Hold (1.2s)`              | `Touch & Hold (1.2s)`           |
| **Nest a Dot**         | `Ctrl + M (while dragging)`         | `Touch & Hold (1.2s)`           |
| **Burst a Dot**        | `Double Click` / `Ctrl + Shift + M` | `Double Tap`                    |
| **Undo Last Action**   | `Ctrl + Z`                          | *Not applicable*                |
| **Redo Last Action**   | `Ctrl + Shift + Z`                  | *Not applicable*                |

> [!TIP]
> Some data points will not be clickable as they are at the back of the sphere. Rotate the sphere to click them.

## **Bundle Size**

Running the following command:

```bash
tar -czf - app.js module/*.mjs | wc -c
```

It will give 10240 = **10 KB** when gzipped, truly compact for a 3D data viz that has all such controls and custom interactions!

<img width="719" alt="gzipped size" src="https://github.com/user-attachments/assets/31507ab7-0199-4068-8b9d-9a542cadbb54" />

## 60 FPS

The whole data viz runs at `60 FPS` and allows us to add upto **100K+** data points via something called "compartments". The sphere is divided into 64 such compartments and upon Zooming in it loads up more points from the nearest compartment. Also it keeps the maximum number of points on a zoomed out view to remain `MAX_BATCH_SIZE` which is 5000 data points.

<img width="1822" alt="3D Sphere Data Vizualization" src="https://github.com/user-attachments/assets/398c262d-342b-4eb3-85a7-655d5acaaba3" />

## Performance

Performance for the desktop devices is around `88` for this data visualizer as per Chrome lighthouse report. While the main target is to use it on phone where it offers the best perfomance possible with the best practices on the web with a Performance score of `100`.

<img width="1501" alt="Perfomance on phone" src="https://github.com/user-attachments/assets/255b81d9-36b9-4a5f-bfff-c446167449ec" />

## Deep level nesting | Drag and Drop

The data points can be nested to any depth with a simple drag and drop of one point on top of the other. Hold for `1200ms` to nest them. 

![Deep level drag and drop nesting](https://github.com/user-attachments/assets/ce61bebf-2b40-4618-ac96-1c2761ed076c)

### Nest and Burst

Nested dots can be bursted with a double click / double tap. We can also use the shortcuts `Ctrl + Shift + M` to burst them.

![Nest and Burst](https://github.com/user-attachments/assets/ef9d1a97-e6d7-4e32-a664-50e5eab94eda)


### Burst a Dot into Multiple Dots

In this example, I burst a dot having deep nesting into multiple dots using keyboard shortcuts `Ctrl + M` and `Ctrl + Shift + M` to nest and burst respectively.

![Burst Multple Dots from a Dot](https://github.com/user-attachments/assets/6ed1f68d-fc7b-45b0-8d04-2d197681b75f)

### Accessibility

The 3D data visualizer has keyboard support, proper semantic HTML, contrasting colors, and multiple shortcuts you may find useful. One can use `TAB` or `Shift + TAB` to visit all the data points and move them with `Up`, `Down`, `Right` and `Left` arrow keys, while pressing `Shift + Arrow keys` can rotate the 3D sphere. The touch gestures to move dots with one finger and rotate sphere with two fingers are also intuitive and works similar to how Google Maps does it. 

### License

The 3D Sphere Custom Data Viz is licensed under the [MIT license](https://opensource.org/licenses/MIT).

