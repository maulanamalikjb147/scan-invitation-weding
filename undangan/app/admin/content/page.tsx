import AdminGuard from "@/components/admin/AdminGuard";
import ContentCms from "@/components/admin/ContentCms";

export default function AdminContentPage() {
  return (
    <AdminGuard>
      <ContentCms />
    </AdminGuard>
  );
}
