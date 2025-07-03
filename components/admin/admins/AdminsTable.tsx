import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

export function AdminsTable({ admins, schools, onRemove, onToggleSuperAdmin, onEdit }: {
  admins: any[]
  schools: any[]
  onRemove: (userId: string) => void
  onToggleSuperAdmin: (userId: string, isSuperAdmin: boolean) => void
  onEdit: (admin: any) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="px-4 py-2 text-left text-xs font-semibold text-[#223152] uppercase">Name</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-[#223152] uppercase">Email</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-[#223152] uppercase">Super Admin</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-[#223152] uppercase">School Access</th>
            <th className="px-4 py-2"></th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id} className="border-b">
              <td className="px-4 py-2">{admin.full_name}</td>
              <td className="px-4 py-2">{admin.email}</td>
              <td className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={admin.is_super_admin}
                  onChange={e => onToggleSuperAdmin(admin.id, e.target.checked)}
                />
              </td>
              <td className="px-4 py-2">
                {admin.is_super_admin
                  ? <span className="text-green-700 font-semibold">All Schools</span>
                  : (admin.user_school_access || []).map((a: any) => {
                      const school = schools.find((s: any) => s.id === a.school_id)
                      return (
                        <span key={a.school_id} className="inline-block bg-blue-100 text-blue-800 rounded px-2 py-1 mr-1 text-xs">
                          {school ? school.name : a.school_id}
                        </span>
                      )
                    })
                }
              </td>
              <td className="px-4 py-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(admin)}
                  className="border-[#223152] text-[#223152] hover:bg-[#223152] hover:text-white mr-2"
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </td>
              <td className="px-4 py-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemove(admin.id)}
                  className="border-red-500 bg-red-500 text-white hover:bg-red-600 hover:text-white"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
