import "server-only";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import {buildQuotePdfDefinition,quotePdfFileName} from "./quote-pdf-document";
import type {StudioQuote} from "./quote-types";

pdfMake.addVirtualFileSystem(pdfFonts);
export async function generateQuotePdf(quote:StudioQuote,organizationName:string){return pdfMake.createPdf(buildQuotePdfDefinition(quote,organizationName)).getBuffer();}
export {quotePdfFileName};
