/* eslint-disable @typescript-eslint/no-explicit-any -- Server-only Supabase projection row. */
import type { StudioSearchProvider } from "../search-provider";
import { searchOr } from "../search-utils";
import { db, limitResults } from "./provider-helpers";

export const fileVersionSearchProvider: StudioSearchProvider = {
  id: "file_versions",
  getLabel: () => "Dosyalar",
  getIcon: () => "versions",
  getCategory: () => "files",
  getUrl: (row) => `/studio/projects/${row.project_id}/files/${row.file_id}/versions/${row.id}`,
  async search(query, context) {
    const { data, error } = await db(context).from("studio_project_file_versions")
      .select("id,file_id,project_id,version_number,revision_code,revision_title,revision_note,original_file_name,normalized_file_name,mime_type,status,file:studio_project_files(display_name),project:studio_projects(name,code)")
      .eq("organization_id", context.organizationId).eq("status", "ready")
      .or(searchOr(["revision_code", "revision_title", "revision_note", "original_file_name", "normalized_file_name", "mime_type"], query)).limit(40);
    if (error) throw error;
    return limitResults((data ?? []).map((row: any) => {
      const file = Array.isArray(row.file) ? row.file[0] : row.file;
      const project = Array.isArray(row.project) ? row.project[0] : row.project;
      return {
        id: row.id,
        provider: this.id,
        category: this.getCategory(),
        categoryLabel: this.getLabel(),
        icon: this.getIcon(),
        title: file?.display_name || row.original_file_name,
        subtitle: project?.name || row.revision_title || "Dosya sürümü",
        breadcrumb: [project?.code, `V${row.version_number}`].filter(Boolean).join(" · "),
        badge: row.revision_code || `V${row.version_number}`,
        url: this.getUrl(row),
        thumbnailUrl: `/studio/projects/${row.project_id}/files/${row.file_id}/thumbnail?version=${row.id}`,
        searchText: [file?.display_name, row.original_file_name, row.normalized_file_name, row.revision_code, row.revision_title, row.revision_note, row.mime_type].join(" "),
      };
    }), query);
  },
};
