import type {VisualizerComputeMode,VisualizerRenderQuality} from "./types";
export const VISUALIZER_RENDER_QUALITIES=["draft","standard","ultra_final"] as const;
export const VISUALIZER_COMPUTE_MODES=["auto","local","cloud"] as const;
export const VISUALIZER_CLOUD_CACHE_RETENTION_DAYS=15;
export const VISUALIZER_LOCAL_STORAGE_DIR="Documents/ARZ Visualizer";
export const VISUALIZER_QUALITY_LABELS:Record<VisualizerRenderQuality,string>={draft:"Draft",standard:"Standard",ultra_final:"Ultra Final"};
export const VISUALIZER_COMPUTE_LABELS:Record<VisualizerComputeMode,string>={auto:"Auto",local:"Local",cloud:"Cloud"};
