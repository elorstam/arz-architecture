"use client";
import {useEffect,useRef} from "react";
import {recordRecentItemAction} from "@/app/studio/(protected)/quick-access/actions";
import type {StudioRecentEntityType} from "@/lib/studio/quick-access/quick-access-types";
export default function StudioRecentItemTracker({entityType,entityId}:{entityType:StudioRecentEntityType;entityId:string}){const sent=useRef(false);useEffect(()=>{if(sent.current)return;sent.current=true;void recordRecentItemAction(entityType,entityId);},[entityId,entityType]);return null;}
