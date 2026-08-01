export function normalizeStudioTagName(value:string){return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("tr-TR").replace(/ı/g,"i").replace(/[^a-z0-9]+/g," ").trim();}
