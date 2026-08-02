/* eslint-disable @typescript-eslint/no-explicit-any -- Server-only Supabase projection row. */
import type { StudioSearchProvider } from "../search-provider";
import { searchOr } from "../search-utils";
import { db, limitResults } from "./provider-helpers";

export const fileSearchProvider: StudioSearchProvider = {
  id: "files",
  getLabel: () => "Dosyalar",
  getIcon: () => "files",
  getCategory: () => "files",
  getUrl: (row) => `/studio/projects/${row.project_id}/files/${row.id}`,
  async search(query, context) {
    const { data, error } = await db(context)
      .from("studio_project_files")
      .select("id,project_id,display_name,original_file_name,normalized_file_name,mime_type,extension,version_count,revision_code,project:studio_projects(name,code)")
      .eq("organization_id", context.organizationId)
      .eq("is_archived", false)
      .or(searchOr(["display_name", "original_file_name", "normalized_file_name", "mime_type", "revision_code"], query))
      .limit(40);
    if (error) throw error;
    return limitResults((data ?? []).map((row: any) => {
      const project = Array.isArray(row.project) ? row.project[0] : row.project;
      return {
        id: row.id,
        provider: this.id,
        category: this.getCategory(),
        categoryLabel: this.getLabel(),
        icon: this.getIcon(),
        title: row.display_name,
        subtitle: project?.name || row.original_file_name,
        breadcrumb: [project?.code, project?.name].filter(Boolean).join(" · "),
        badge: row.revision_code || `V${Math.max(1, row.version_count || 1)}`,
        url: this.getUrl(row),
        thumbnailUrl: `/studio/projects/${row.project_id}/files/${row.id}/thumbnail`,
        searchText: [row.display_name, row.original_file_name, row.normalized_file_name, row.mime_type, row.revision_code].join(" "),
      };
    }), query);
  },
};
