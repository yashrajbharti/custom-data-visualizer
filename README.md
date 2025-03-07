## 3D Data Visualizer

A custom data viz made using JS (without any dependencies) and just 10kb bundle size offering rich interactions and 60fps.

🎥  [3D Custom Data Viz Video Intro | Under 2 minutes ](https://youtu.be/MxIcZMYH0DU)

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

will give 10240 = 10 KB when gzipped, truly compact for a 3D data viz that has all such controls and custom interactions.

<img width="719" alt="gzipped size" src="https://github.com/user-attachments/assets/31507ab7-0199-4068-8b9d-9a542cadbb54" />

## 60 FPS 

The whole data viz runs at 60 FPS and allows us to add upto 100K+ data points via something called "compartments". The sphere is divided into 64 such compartments and upon Zooming in it loads up more points from the nearest compartment. Also it keeps the maximum number of points on a zoomed out view to remain `MAX_BATCH_SIZE` which is 5000 data points.

<img width="1822" alt="3D Sphere Data Vizualization" src="https://github.com/user-attachments/assets/398c262d-342b-4eb3-85a7-655d5acaaba3" />

## Performance

Performance for the desktop devices is around `88` for this data visualizer as per Chrome lighthouse report. While the main target is to use it on phone where it offers the best perfomance possible with the best practices on the web with a Performance score of `100`.

<img width="1501" alt="Perfomance on phone" src="https://github.com/user-attachments/assets/255b81d9-36b9-4a5f-bfff-c446167449ec" />

