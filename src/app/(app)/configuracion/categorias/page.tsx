'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { EmojiPicker, EmojiPickerSearch, EmojiPickerContent } from '@/components/ui/emoji-picker'
import { apiFetch } from '@/lib/fetch'

type Category = { id: string; name: string; icon: string; color: string }

const baseCategorySchema = z.object({
  name: z.string().min(1).max(50),
  icon: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
})
type CategoryInput = z.infer<typeof baseCategorySchema>

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
  const t = useTranslations('settings.categories')
  const [pickerOpen, setPickerOpen] = useState(false)

  const schema = z.object({
    name: z.string().min(1, t('nameRequired')).max(50),
    icon: z.string().min(1),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  })

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<CategoryInput>({
      resolver: zodResolver(schema),
      defaultValues: { icon: '🛒', color: '#3b82f6', name: '', ...defaultValues },
    })

  const icon = watch('icon')
  const color = watch('color')
  const name = watch('name')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>{t('name')}</Label>
        <Input {...register('name')} placeholder={t('namePlaceholder')} autoFocus />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t('icon')}</Label>
        <Popover open={pickerOpen} onOpenChange={setPickerOpen} modal={true}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted/50 transition-colors"
            >
              <span className="text-xl">{icon}</span>
              <span className="text-muted-foreground">{t('changeIcon')}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <EmojiPicker
              className="overflow-visible h-105"
              onEmojiSelect={({ emoji }) => {
                setValue('icon', emoji)
                setPickerOpen(false)
              }}
            >
              <EmojiPickerSearch />
              <EmojiPickerContent />
            </EmojiPicker>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t('color')}</Label>
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
            {name || <span className="text-muted-foreground">{t('preview')}</span>}
          </span>
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? t('saving') : t('save')}
      </Button>
    </form>
  )
}

export default function CategoriasPage() {
  const t = useTranslations('settings.categories')
  const qc = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiFetch<Category[]>('/api/categories'),
  })

  const createMutation = useMutation({
    mutationFn: (data: CategoryInput) =>
      apiFetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      setDialogOpen(false)
      toast.success(t('created'))
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryInput }) =>
      apiFetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      setDialogOpen(false)
      setEditing(null)
      toast.success(t('updated'))
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      setConfirmDeleteId(null)
      toast.success(t('deleted'))
    },
    onError: (err: Error) => {
      setConfirmDeleteId(null)
      toast.error(err.message)
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
          {t('title')}
        </h1>
        <Button size="sm" onClick={openCreate} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> {t('new')}
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
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
          <Button size="sm" variant="outline" onClick={openCreate}>
            {t('emptyCta')}
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
                    {t('deleteConfirm')}
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
              {editing ? t('editTitle') : t('newTitle')}
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
