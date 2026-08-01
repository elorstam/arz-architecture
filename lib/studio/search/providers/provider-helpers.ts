/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase schema is untyped; this cast stays in the server-only adapter. */
import type {StudioSearchResult} from "../search-types";
import {matchesStudioSearch} from "../search-utils";
export const limitResults=(rows:StudioSearchResult[],query:string)=>rows.filter(row=>matchesStudioSearch(row.searchText,query)).slice(0,10);
export function db(context:{supabase:unknown}){return context.supabase as {from:(table:string)=>any};}
