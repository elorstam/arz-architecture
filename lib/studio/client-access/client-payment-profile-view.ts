import type {ClientProjectAccess} from "@/lib/studio/client-access/client-access-repository";
import type {StudioClientPaymentProfile} from "@/lib/studio/client-access/client-payment-profile";

export function mergeActiveClientPaymentProfiles(accesses:ClientProjectAccess[],profiles:StudioClientPaymentProfile[]):StudioClientPaymentProfile[]{
 const profilesByUserId=new Map(profiles.map(profile=>[profile.userId,profile]));
 return accesses.filter(access=>access.revokedAt===null).map(access=>profilesByUserId.get(access.userId)??{userId:access.userId,fullName:access.fullName??"",email:access.email??"",gsmNumber:"",identityNumber:"",registrationAddress:"",city:"",country:"Turkey",zipCode:"",isComplete:false});
}
