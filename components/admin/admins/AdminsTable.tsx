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
      <table className="min-w-full bg-white rounded-lg shadow-sm border border-gray-200">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="min-w-48 px-7 py-3 text-left text-xs font-semibold text-[#223152] uppercase rounded-tl-lg whitespace-nowrap">Name</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-[#223152] uppercase">Email</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-[#223152] uppercase">School Access</th>
            <th className="px-5 py-3 rounded-tr-lg"></th>
            <th className="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin, idx) => (
            <tr
              key={admin.id}
              className={`border-b transition-colors duration-150 ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50`}
            >
              <td className="px-7 py-3 text-sm font-medium text-[#223152] whitespace-nowrap">{admin.full_name}</td>
              <td className="px-5 py-3 text-sm text-gray-700">{admin.email}</td>
              <td className="px-5 py-3">
                {(admin.school_ids && admin.school_ids.length > 0 ? (
                  (admin.school_ids).map((id: any) => {
                    const school = schoolMap.get(id);
                    return (
                      <span
                        key={id}
                        className="inline-block bg-blue-100 text-blue-800 rounded-full px-3 py-1 mr-2 mb-1 text-xs font-semibold shadow-sm border border-blue-200"
                      >
                        {school ? school.name : id}
                      </span>
                    )
                  })
                ) : (
                  <span className="text-gray-400 italic">No Schools</span>
                ))}
              </td>
              <td className="px-5 py-3">
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
              <td className="px-5 py-3">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemove(admin.id)}
                  className="border-red-500 bg-red-500 text-white hover:bg-red-600 hover:text-white"
                  disabled={admin.is_super_admin}
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