# ARZ Visualizer SketchUp Plugin (Phase 10B)

The future plugin will be Ruby + `HtmlDialog` and will live here. It will collect the current model, scenes and named cameras, correlate them to an ARZ project, prepare source data and trigger a render request.

It will **not** call ComfyUI directly. The future boundary is:

```text
SketchUp Plugin → ARZ Visualizer Agent / Studio API → Render Queue → ComfyUI
```

No Ruby implementation is included in Phase 10A.0.
