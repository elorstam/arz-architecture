import {StudioBadge} from "@/components/studio/ui";
import { STATUS_LABELS, type OfficialProcessStatus } from "@/lib/studio/official-processes/official-process-types";

const variants: Record<OfficialProcessStatus,"neutral"|"info"|"success"|"warning"|"archived"> = {
  waiting:"neutral",assessment_uploaded:"info",client_notified:"info",payment_waiting:"warning",receipt_uploaded:"info",paid:"success",document_received:"success",cancelled:"archived",
};

export default function StudioOfficialProcessStatusBadge({ status }: { status: OfficialProcessStatus }) {
  return <StudioBadge variant={variants[status]}>{STATUS_LABELS[status]}</StudioBadge>;
}

export function StudioOverdueBadge() {
  return <StudioBadge variant="danger">Gecikti</StudioBadge>;
}
