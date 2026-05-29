'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type Category = { id: string; name: string; icon: string; color: string }

const categorySchema = z.object({
  name: z.string().min(1, 'Requerido').max(50),
  icon: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
})
type CategoryInput = z.infer<typeof categorySchema>

const ICONS = [
  '🛒', '🍕', '🚗', '🚌', '✈️', '🏠', '💊', '☕',
  '🎬', '👕', '💡', '📱', '🐶', '💰', '🎓', '🏋️',
  '🎮', '🍺', '💇', '🔧', '🎁', '🏥', '🌿', '🎵',
  '🍔', '⚽', '📚', '🍷',
]

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6',
  '#ec4899', '#6b7280', '#059669', '#dc2626',
]

function CategoryForm({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues?: Partial<CategoryInput>
  onSubmit: (data: CategoryInput) => void
  isPending: boolean
}) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<CategoryInput>({
      resolver: zodResolver(categorySchema),
      defaultValues: { icon: '🛒', color: '#3b82f6', name: '', ...defaultValues },
    })

  const icon = watch('icon')
  const color = watch('color')
  const name = watch('name')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Nombre</Label>
        <Input {...register('name')} placeholder="ej: Supermercado" autoFocus />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Ícono</Label>
        <div className="grid grid-cols-7 gap-1">
          {ICONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setValue('icon', e)}
              className={`rounded-lg p-1.5 text-xl transition-colors ${
                icon === e
                  ? 'bg-muted border border-foreground/20'
                  : 'hover:bg-muted/60'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setValue('color', c)}
              className={`h-7 w-7 rounded-full transition-transform ${
                color === c
                  ? 'scale-125 ring-2 ring-offset-2 ring-foreground/30'
                  : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm font-medium text-foreground">
            {name || <span className="text-muted-foreground">Vista previa</span>}
          </span>
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Guardando...' : 'Guardar'}
      </Button>
    </form>
  )
}

export default function CategoriasPage() {
  const qc = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()),
  })

  const createMutation = useMutation({
    mutationFn: (data: CategoryInput) =>
      fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      setDialogOpen(false)
      toast.success('Categoría creada')
    },
  })

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryInput }) =>
      fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      setDialogOpen(false)
      setEditing(null)
      toast.success('Categoría actualizada')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/categories/${id}`, { method: 'DELETE' }).then(async (r) => {
        if (!r.ok) {
          const body = await r.json()
          throw new Error(body.error ?? 'Error al eliminar')
        }
        return r.json()
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      setConfirmDeleteId(null)
      toast.success('Categoría eliminada')
    },
    onError: (e: Error) => {
      setConfirmDeleteId(null)
      toast.error(e.message)
    },
  })

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setDialogOpen(true)
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Categorías
        </h1>
        <Button size="sm" onClick={openCreate} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Nueva
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-14 text-center">
          <span className="text-4xl">🏷️</span>
          <p className="text-sm text-muted-foreground">
            Todavía no hay categorías.
          </p>
          <Button size="sm" variant="outline" onClick={openCreate}>
            Crear primera categoría
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group relative flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3"
              onMouseLeave={() => {
                if (confirmDeleteId === cat.id) setConfirmDeleteId(null)
              }}
            >
              <span className="text-xl">{cat.icon}</span>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-sm font-medium">{cat.name}</span>
                <span
                  className="h-2 w-5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
              </div>

              <div className="absolute right-2 top-2 hidden items-center gap-0.5 group-hover:flex">
                <button
                  type="button"
                  onClick={() => openEdit(cat)}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                {confirmDeleteId === cat.id ? (
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(cat.id)}
                    disabled={deleteMutation.isPending}
                    className="rounded px-1.5 py-1 text-[11px] font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                  >
                    ¿Borrar?
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(cat.id)}
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v)
          if (!v) setEditing(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar categoría' : 'Nueva categoría'}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            key={editing?.id ?? 'new'}
            defaultValues={editing ?? undefined}
            onSubmit={(data) =>
              editing
                ? editMutation.mutate({ id: editing.id, data })
                : createMutation.mutate(data)
            }
            isPending={createMutation.isPending || editMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
