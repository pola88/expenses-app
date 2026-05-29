import Link from 'next/link'
import { Tag, Users, ChevronRight } from 'lucide-react'

const items = [
  {
    href: '/configuracion/categorias',
    icon: Tag,
    label: 'Categorías',
    description: 'Creá y editá las categorías de gastos del household',
  },
  {
    href: '/configuracion/household',
    icon: Users,
    label: 'Household',
    description: 'Miembros y código de invitación',
  },
]

export default function ConfiguracionPage() {
  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 max-w-2xl mx-auto w-full">
      <h1 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Configuración
      </h1>

      <div className="flex flex-col gap-2">
        {items.map(({ href, icon: Icon, label, description }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-xl border border-border bg-background px-4 py-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-medium">{label}</span>
              <span className="text-xs text-muted-foreground">{description}</span>
            </div>
            <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  )
}
