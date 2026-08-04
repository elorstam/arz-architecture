import {StudioIconSurface,type StudioIconTone} from "@/components/studio/ui";
import type {StudioIconName} from "@/components/studio/StudioIcons";

const groups:Record<string,{label:string;icon:StudioIconName;tone:StudioIconTone}>={
 pdf:{label:"PDF",icon:"file-text",tone:"red"},dwg:{label:"DWG",icon:"revision",tone:"blue"},dxf:{label:"CAD",icon:"revision",tone:"blue"},skp:{label:"SKP",icon:"render",tone:"purple"},ifc:{label:"3D",icon:"building",tone:"purple"},jpg:{label:"JPG",icon:"image",tone:"orange"},jpeg:{label:"JPG",icon:"image",tone:"orange"},png:{label:"PNG",icon:"image",tone:"green"},webp:{label:"WEBP",icon:"image",tone:"green"},zip:{label:"ZIP",icon:"archive",tone:"slate"},rar:{label:"RAR",icon:"archive",tone:"slate"},docx:{label:"DOCX",icon:"file-text",tone:"blue"},xlsx:{label:"XLSX",icon:"chart",tone:"green"},mp4:{label:"MP4",icon:"render",tone:"red"},
};
export default function StudioFileTypeIcon({extension,size="md"}:{extension:string;size?:"sm"|"md"|"lg"}){const key=extension.toLowerCase();const group=groups[key]??{label:key.slice(0,4).toUpperCase()||"FILE",icon:"files" as const,tone:"slate" as const};return <span className="studio-file-type-icon" title={`${group.label} dosyası`}><StudioIconSurface icon={group.icon} tone={group.tone} size={size}/><small>{group.label}</small></span>}
