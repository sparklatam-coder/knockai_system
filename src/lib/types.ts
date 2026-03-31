export type PackageTier = "entry" | "basic" | "standard" | "premium" | "platinum";

export type NodeStatus = "inactive" | "in_progress" | "active";

export type ActionType =
  | "status_change"
  | "task_complete"
  | "note"
  | "file_upload";

export type LogType = "memo" | "work";

export type AuthRole = "super_admin" | "admin" | "client" | "guest";

export type NodeGroup = "pipeline" | "cs360";

export type NodeKey =
  | "awareness"
  | "lead_capture"
  | "lead_nurture"
  | "new_patient"
  | "cs_onboarding"
  | "cs_upsell"
  | "cs_support"
  | "cs_education"
  | "cs_community"
  | "cs_analytics";

export interface NodeMeta {
  label: string;
  emoji: string;
  description: string;
  group: NodeGroup;
  order: number;
}

export interface Client {
  id: string;
  name: string;
  region: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  package_tier: PackageTier;
  contract_start: string | null;
  auth_user_id: string | null;
  logo_url: string | null;
  memo: string | null;
  solapi_pfid: string | null;
  solapi_sender_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface NodeRecord {
  id: string;
  client_id: string;
  node_key: NodeKey;
  status: NodeStatus;
  updated_at: string;
  updated_by: string | null;
}

export interface GuideLink {
  label: string;
  url: string;
}

export interface SubNode {
  id: string;
  client_id: string;
  node_key: NodeKey;
  label: string;
  is_done: boolean;
  done_at: string | null;
  sort_order: number;
  guide_content: string | null;
  guide_links: GuideLink[];
}

export interface ActivityLog {
  id: string;
  client_id: string;
  node_key: NodeKey;
  action_type: ActionType;
  log_type: LogType;
  content: string;
  attachment_url: string | null;
  image_urls: string[];
  created_by: string | null;
  created_at: string;
  visible_to_client: boolean;
}

export interface Inquiry {
  id: string;
  client_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ClientCreateInput {
  name: string;
  region: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  package_tier: PackageTier;
  contract_start: string;
  login_email: string;
  memo: string;
}

export interface ClientUpdateInput extends ClientCreateInput {
  auth_user_id?: string | null;
}

export interface ClientListItem extends Client {
  last_activity_at: string | null;
  node_statuses: Partial<Record<NodeKey, NodeStatus>>;
}

export interface ClientDashboardData {
  client: Client;
  nodes: NodeRecord[];
  subNodes: SubNode[];
  activityLogs: ActivityLog[];
}

/* ── Messaging ── */

export type MsgType = "alimtalk" | "friendtalk";
export type MsgTemplateStatus = "draft" | "review" | "approved" | "rejected";
export type MsgCampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "cancelled";
export type MsgLogStatus = "success" | "sms_fallback" | "fail";
export type PatientGroup = "6m" | "1y" | "2y" | "2y+";

export interface MsgPatient {
  id: string;
  client_id: string;
  name: string;
  phone: string;
  last_visit: string | null;
  treatment: string | null;
  is_channel_friend: boolean;
  patient_group: PatientGroup | null;
  created_at: string;
  updated_at: string;
}

export interface MsgTemplate {
  id: string;
  client_id: string;
  name: string;
  type: MsgType;
  subtype: string | null;
  status: MsgTemplateStatus;
  body: string;
  button_name: string | null;
  button_url: string | null;
  solapi_template_id: string | null;
  created_at: string;
}

export interface MsgCampaign {
  id: string;
  client_id: string;
  name: string;
  template_id: string | null;
  type: MsgType;
  target_group: string | null;
  target_count: number;
  scheduled_at: string | null;
  status: MsgCampaignStatus;
  wave: number | null;
  sent_count: number;
  success_count: number;
  fail_count: number;
  created_at: string;
}

export interface MsgLog {
  id: string;
  client_id: string;
  campaign_id: string | null;
  patient_id: string | null;
  type: string;
  template_name: string | null;
  status: MsgLogStatus;
  solapi_message_id: string | null;
  sent_at: string;
  patient?: MsgPatient;
}
