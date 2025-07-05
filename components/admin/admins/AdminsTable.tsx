import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { useMemo } from "react";

interface School {
  id: string;
  name: string;
}

interface Admin {
  id: string;
  full_name: string;
  email: string;
  is_super_admin: boolean;
  school_ids: string[];
}

export function AdminsTable({ admins, schools, onRemove, onToggleSuperAdmin, onEdit }: {
  admins: Admin[]
  schools: School[]
  onRemove: (userId: string) => void
  onToggleSuperAdmin: (userId: string, isSuperAdmin: boolean) => void
  onEdit: (admin: Admin) => void
}) {
  console.log(admins);
  // Build a lookup map for schools to avoid repeated find calls
  const schoolMap = useMemo(() => {
    return new Map(schools.map((s: School) => [s.id, s]));
  }, [schools]);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="px-4 py-2 text-left text-xs font-semibold text-[#223152] uppercase">Name</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-[#223152] uppercase">Email</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-[#223152] uppercase">School Access</th>
            <th className="px-4 py-2"></th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id} className="border-b">
              <td className="px-4 py-2 text-sm">{admin.full_name}</td>
              <td className="px-4 py-2 text-sm">{admin.email}</td>
              <td className="px-4 py-2">
                {(admin.school_ids && admin.school_ids.length > 0 ? (
                  (admin.school_ids).map((id: any) => {
                    const school = schoolMap.get(id);
                    return (
                      <span key={id} className="inline-block bg-blue-100 text-blue-800 rounded px-2 py-1 mr-1 text-xs">
                        {school ? school.name : id}
                      </span>
                    )
                  })
                ) : (
                  <span className="text-gray-500 italic">No Schools</span>
                ))}
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