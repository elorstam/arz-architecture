import type {StudioIconName} from "@/components/studio/StudioIcons";

export type FocusItem = {
  count: number;
  label: string;
  context: string;
  icon: StudioIconName;
  priority: "high" | "medium" | "normal";
};

export type Metric = {
  label: string;
  value: string;
  detail: string;
  note: string;
  icon: StudioIconName;
};

export type ProjectOverviewItem = {
  code: string;
  name: string;
  client: string;
  stage: string;
  status: string;
  progress: number;
  updatedAt: string;
  owner: string;
};

export type WorkflowItem = {
  project: string;
  item: string;
  state: string;
  due: string;
  owner: string;
};

export type ScheduleItem = {
  day: string;
  month: string;
  time: string;
  title: string;
  context: string;
};

export type ActivityItem = {
  project: string;
  event: string;
  type: string;
  actor: string;
  time: string;
};

export const focusItems: FocusItem[] = [
  {count: 2, label: "render onayı bekliyor", context: "Vespera Port ve Barlas Antrepo", icon: "render", priority: "high"},
  {count: 1, label: "müşteri revizyonu gecikmiş", context: "Zeynep Hanım Apartmanı", icon: "revision", priority: "high"},
  {count: 3, label: "proje bugün güncellendi", context: "Son değişiklikleri inceleyin", icon: "folder", priority: "normal"},
  {count: 1, label: "teklif hazırlanmalı", context: "Özger Apartmanı uygulama teklifi", icon: "money", priority: "medium"},
];

export const metrics: Metric[] = [
  {label: "Aktif Projeler", value: "12", detail: "4 proje uygulama aşamasında", note: "Bu hafta 3 güncelleme", icon: "folder"},
  {label: "Bekleyen Revizyonlar", value: "5", detail: "1 revizyon hedef tarihi geçti", note: "Öncelik gerektiriyor", icon: "revision"},
  {label: "Render Kuyruğu", value: "8", detail: "2 çalışma onaya hazır", note: "3 aktif üretim", icon: "render"},
  {label: "Bu Ay Tahsilat", value: "₺ —", detail: "Finans modülü henüz aktif değil", note: "Yakında", icon: "payments"},
];

export const projects: ProjectOverviewItem[] = [
  {code: "VP", name: "Vespera Port", client: "Vespera", stage: "Uygulama", status: "Aktif", progress: 72, updatedAt: "2 saat önce", owner: "EA"},
  {code: "BA", name: "Barlas Antrepo Açık Çalışma Alanı", client: "Barlas Lojistik", stage: "Görselleştirme", status: "Render", progress: 58, updatedAt: "Bugün, 09:40", owner: "MÖ"},
  {code: "ZH", name: "Zeynep Hanım Apartmanı", client: "Zeynep Hanım", stage: "Revizyon", status: "Gecikmiş", progress: 41, updatedAt: "Dün, 17:15", owner: "SK"},
  {code: "ÖA", name: "Özger Apartmanı", client: "Özger Yapı", stage: "Teklif", status: "Planlandı", progress: 18, updatedAt: "28 Temmuz", owner: "EA"},
];

export const revisions: WorkflowItem[] = [
  {project: "Zeynep Hanım Apartmanı", item: "Cephe malzeme alternatifleri", state: "Müşteri geri bildirimi bekleniyor", due: "1 gün gecikti", owner: "SK"},
  {project: "Vespera Port", item: "Lobi yerleşim revizyonu", state: "İç ekip revizyonunda", due: "Bugün", owner: "EA"},
  {project: "Özger Apartmanı", item: "Tip kat planı R02", state: "Onaya hazır", due: "Yarın", owner: "MÖ"},
];

export const renderQueue: WorkflowItem[] = [
  {project: "Barlas Antrepo", item: "Açık çalışma alanı — açı 03", state: "Render hazırlanıyor", due: "Bugün, 17:00", owner: "MÖ"},
  {project: "Vespera Port", item: "Giriş holü gece görünümü", state: "Onaya hazır", due: "Bugün", owner: "EA"},
  {project: "Zeynep Hanım Apartmanı", item: "Cephe gün ışığı çalışması", state: "Teslim edildi", due: "Dün", owner: "SK"},
];

export const schedule: ScheduleItem[] = [
  {day: "03", month: "Ağu", time: "10:00", title: "Haftalık proje değerlendirmesi", context: "Studio toplantı odası"},
  {day: "04", month: "Ağu", time: "14:30", title: "Vespera Port müşteri sunumu", context: "Çevrim içi sunum"},
  {day: "05", month: "Ağu", time: "17:00", title: "Barlas Antrepo render teslimi", context: "Görselleştirme ekibi"},
  {day: "06", month: "Ağu", time: "09:30", title: "Belediye evrak kontrolü", context: "Zeynep Hanım Apartmanı"},
];

export const activities: ActivityItem[] = [
  {project: "Vespera Port", event: "Lobi planına R04 revizyonu yüklendi", type: "Dosya güncellendi", actor: "EA", time: "18 dk önce"},
  {project: "Barlas Antrepo", event: "Açı 03 renderı onaya gönderildi", type: "Render", actor: "MÖ", time: "1 sa önce"},
  {project: "Zeynep Hanım Apartmanı", event: "Müşteri notları proje ekibine aktarıldı", type: "Revizyon", actor: "SK", time: "3 sa önce"},
  {project: "Özger Apartmanı", event: "Uygulama teklifi için görev oluşturuldu", type: "Teklif", actor: "EA", time: "Dün"},
];
