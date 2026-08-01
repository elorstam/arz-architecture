import type {StudioSearchCategory,StudioSearchContext,StudioSearchResult} from "./search-types";
export interface StudioSearchProvider{readonly id:string;search(query:string,context:StudioSearchContext,signal?:AbortSignal):Promise<StudioSearchResult[]>;getLabel():string;getIcon():string;getUrl(row:Record<string,unknown>):string;getCategory():StudioSearchCategory;}
