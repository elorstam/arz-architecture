import fs from "node:fs";
import path from "node:path";
import {createClient} from "@supabase/supabase-js";
import {z} from "zod";

function loadLocalEnv() {
  const filename=path.join(process.cwd(),".env.local");
  if(!fs.existsSync(filename))return;
  for(const line of fs.readFileSync(filename,"utf8").split(/\r?\n/)){
    const trimmed=line.trim();if(!trimmed||trimmed.startsWith("#"))continue;
    const separator=trimmed.indexOf("=");if(separator<1)continue;
    const key=trimmed.slice(0,separator).trim();let value=trimmed.slice(separator+1).trim();
    if((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'")))value=value.slice(1,-1);
    if(!process.env[key])process.env[key]=value;
  }
}
loadLocalEnv();

const schema=z.object({
  NEXT_PUBLIC_SUPABASE_URL:z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY:z.string().min(20),
  STUDIO_OWNER_EMAIL:z.string().email(),
  STUDIO_OWNER_PASSWORD:z.string().min(12),
  STUDIO_OWNER_FULL_NAME:z.string().min(2),
  STUDIO_ORGANIZATION_NAME:z.string().min(2),
  STUDIO_ORGANIZATION_SLUG:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});
const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.log(parsed.error.issues);
  process.exit(1);
}
const env=parsed.data;
const supabase=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:false,persistSession:false}});

async function findUserByEmail(email:string){
  for(let page=1;page<=20;page++){
    const{data,error}=await supabase.auth.admin.listUsers({page,perPage:100});
    if(error)throw error;
    const match=data.users.find(user=>user.email?.toLowerCase()===email.toLowerCase());
    if(match)return match;
    if(data.users.length<100)return null;
  }
  throw new Error("Owner search exceeded the safe page limit.");
}

async function main() {
  let user = await findUserByEmail(env.STUDIO_OWNER_EMAIL);
  let created = false;

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: env.STUDIO_OWNER_EMAIL,
      password: env.STUDIO_OWNER_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: env.STUDIO_OWNER_FULL_NAME,
      },
    });

    if (error || !data.user) {
      throw error || new Error("Owner auth user could not be created.");
    }

    user = data.user;
    created = true;
  } else {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password: env.STUDIO_OWNER_PASSWORD,
      user_metadata: {
        full_name: env.STUDIO_OWNER_FULL_NAME,
      },
    });

    if (error || !data.user) {
      throw error || new Error("Owner password could not be updated.");
    }

    user = data.user;
  }

  const { data: organizationId, error } = await supabase.rpc(
    "studio_bootstrap_owner",
    {
      owner_user_id: user.id,
      owner_email: env.STUDIO_OWNER_EMAIL,
      owner_full_name: env.STUDIO_OWNER_FULL_NAME,
      organization_name: env.STUDIO_ORGANIZATION_NAME,
      organization_slug: env.STUDIO_ORGANIZATION_SLUG,
    },
  );

  if (error) {
    if (created) {
      await supabase.auth.admin.deleteUser(user.id).catch(() => null);
    }

    throw error;
  }

  console.log(
    `Studio owner bootstrap completed. Organization: ${organizationId}`,
  );
}

main().catch((error) => {
  console.error(
    "Studio owner bootstrap failed:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
