export type VisualizerRenderQuality="draft"|"standard"|"ultra_final";
export type VisualizerComputeMode="auto"|"local"|"cloud";
export type VisualizerJobStatus="queued"|"assigned"|"running"|"paused"|"completed"|"failed"|"cancelled";
export type VisualizerMachineStatus="online"|"busy"|"offline"|"disabled";
export type VisualizerRenderMode="interior"|"exterior";
export type VisualizerTimeOfDay="day"|"golden_hour"|"night";
export type VisualizerWeather="clear"|"cloudy"|"rain";

export type VisualizerVector3={x:number;y:number;z:number};
export type VisualizerCamera={id:string;name:string;fov:number;lensMm:number;position:VisualizerVector3;target:VisualizerVector3;height:number;locked:boolean};
export type VisualizerReferenceType="image"|"material"|"lighting"|"composition"|"camera";
export type VisualizerReference={id:string;type:VisualizerReferenceType;source:string;weight?:number;metadata?:Record<string,unknown>};
export type VisualizerRenderSettings={width:number;height:number;steps?:number;seed?:number;upscale?:number;sampler?:string;denoise?:number;[key:string]:unknown};
export type VisualizerRenderDNA={seed?:number;model?:string;workflowVersion:string;prompt:string;negativePrompt?:string;references:VisualizerReference[];settings:VisualizerRenderSettings;camera?:VisualizerCamera;quality:VisualizerRenderQuality;compute:VisualizerComputeMode;machineId?:string;createdBy:string;createdAt:string};
export type VisualizerRenderRequest={organizationId:string;projectId:string;sceneId?:string;cameraId?:string;camera?:VisualizerCamera;quality:VisualizerRenderQuality;compute:VisualizerComputeMode;mode:VisualizerRenderMode;timeOfDay:VisualizerTimeOfDay;weather:VisualizerWeather;prompt:string;negativePrompt?:string;references?:VisualizerReference[];settings:VisualizerRenderSettings};
export type VisualizerMachine={id:string;name:string;hostname:string;os:string;agentVersion:string;gpuName:string;gpuVramMb:number;status:VisualizerMachineStatus;lastHeartbeatAt?:string;maxConcurrentJobs:number;currentJobCount:number};
