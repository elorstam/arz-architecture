import {NextResponse} from 'next/server';
import {isAdmin} from '@/lib/admin-auth';
import {deleteManagedProject,getManagedProjects,saveManagedProject} from '@/lib/project-store';
export async function GET(){if(!await isAdmin())return NextResponse.json({error:'Yetkisiz'},{status:401});return NextResponse.json(await getManagedProjects());}
export async function POST(req:Request){if(!await isAdmin())return NextResponse.json({error:'Yetkisiz'},{status:401});return NextResponse.json(await saveManagedProject(await req.json()));}
export async function DELETE(req:Request){if(!await isAdmin())return NextResponse.json({error:'Yetkisiz'},{status:401});const {id}=await req.json();await deleteManagedProject(id);return NextResponse.json({ok:true});}
