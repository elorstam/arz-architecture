import type{StudioSearchProvider}from"../search-provider";
export const decisionSearchProvider:StudioSearchProvider={id:"decisions",getLabel:()=>"Karar Günlüğü",getIcon:()=>"activity",getCategory:()=>"decisions",getUrl:()=>"/studio",async search(){return[];}};
