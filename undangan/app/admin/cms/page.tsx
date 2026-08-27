import AdminGuard from "@/components/admin/AdminGuard";
import CmsAdmin from "@/components/admin/CmsAdmin";

export default function CmsPage() {
  return (
    <AdminGuard>
      <CmsAdmin />
    </AdminGuard>
  );
}
