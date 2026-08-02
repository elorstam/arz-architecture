import "server-only";
export function logSafeServerDiagnostic(event:string,payload:Record<string,unknown>){if(process.env.NODE_ENV!=="production")process.emitWarning(`${event} ${JSON.stringify(payload)}`);}
