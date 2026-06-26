'use client'

import { GripVertical, ImagePlus, LogOut, Plus, Shield, Trash2, UserRound, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CategoryIcon, CATEGORY_ICON_OPTIONS } from '@/components/CategoryIcon'
import { InstallJuliusAction } from '@/components/InstallJuliusAction'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useCategories } from '@/hooks/useCategories'
import { useUserSettings } from '@/hooks/useUserSettings'
import { createClient } from '@/lib/supabase/client'
import type { Category, CategoryInput } from '@/lib/types'

const timezoneOptions = [
  { value: 'Europe/Lisbon', label: 'Lisbon, Portugal' },
  { value: 'Europe/Berlin', label: 'Munich, Germany' },
  { value: 'Europe/London', label: 'London, United Kingdom' },
  { value: 'Europe/Paris', label: 'Paris, France' },
  { value: 'America/Sao_Paulo', label: 'Sao Paulo, Brazil' },
  { value: 'America/New_York', label: 'New York, United States' },
  { value: 'America/Los_Angeles', label: 'Los Angeles, United States' },
  { value: 'UTC', label: 'UTC' },
]

const colorOptions = [
  '#2F9E6D',
  '#3B76D1',
  '#D95B59',
  '#7551C8',
  '#B8872D',
  '#218DA3',
  '#7C8191',
  '#A4497D',
]

function resizeAvatarFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Choose an image file.'))
      return
    }

    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      try {
        const size = 256
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Image processing failed.')

        const sourceSize = Math.min(image.naturalWidth, image.naturalHeight)
        const sourceX = Math.max(0, (image.naturalWidth - sourceSize) / 2)
        const sourceY = Math.max(0, (image.naturalHeight - sourceSize) / 2)

        context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      } catch (error) {
        reject(error)
      } finally {
        URL.revokeObjectURL(url)
      }
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that image.'))
    }

    image.src = url
  })
}

function resizeBackgroundFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Choose an image file.'))
      return
    }

    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      try {
        const maxWidth = 1080
        const maxHeight = 1600
        const scale = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight)
        const width = Math.max(1, Math.round(image.naturalWidth * scale))
        const height = Math.max(1, Math.round(image.naturalHeight * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Image processing failed.')

        context.drawImage(image, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.78))
      } catch (error) {
        reject(error)
      } finally {
        URL.revokeObjectURL(url)
      }
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that image.'))
    }

    image.src = url
  })
}

interface AuthUserSummary {
  id: string
  email?: string
  created_at?: string
  last_record_date?: string | null
  last_record_time?: string | null
}

interface AdminUserSummary extends AuthUserSummary {
  is_current_user?: boolean
}

function formatDateTime(value?: string): string {
  if (!value) return 'Never'
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatRecordDate(date?: string | null, time?: string | null): string {
  if (!date) return 'No records'
  const [year, month, day] = date.split('-')
  if (!year || !month || !day) return date
  return `${day}/${month}/${year}${time ? `, ${time.slice(0, 5)}` : ''}`
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] bg-julius-card p-4 shadow-[0_18px_42px_rgba(56,42,77,0.10)]">
      <h2 className="mb-4 text-sm font-semibold text-julius-text">{title}</h2>
      {children}
    </section>
  )
}

function CategoryForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Category
  submitLabel: string
  onSubmit: (input: CategoryInput) => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState(initial?.color ?? colorOptions[0])
  const [icon, setIcon] = useState(initial?.icon ?? CATEGORY_ICON_OPTIONS[0].id)

  useEffect(() => {
    setName(initial?.name ?? '')
    setColor(initial?.color ?? colorOptions[0])
    setIcon(initial?.icon ?? CATEGORY_ICON_OPTIONS[0].id)
  }, [initial])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), color, icon })
    if (!initial) setName('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Category name"
        className="w-full rounded-xl border border-julius-border bg-julius-raised px-3 py-2.5 text-sm text-julius-text placeholder:text-julius-muted focus:border-julius-accent focus:outline-none"
      />

      <div className="flex flex-wrap gap-2">
        {colorOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setColor(option)}
            aria-label={`Use ${option}`}
            className={`h-8 w-8 rounded-xl border transition ${color === option ? 'border-julius-text' : 'border-julius-border'}`}
            style={{ backgroundColor: option }}
          />
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {CATEGORY_ICON_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setIcon(option.id)}
            title={option.label}
            aria-label={`Use ${option.label} icon`}
            className={`flex h-10 items-center justify-center rounded-xl border transition ${
              icon === option.id
                ? 'border-julius-accent bg-julius-accent-soft text-julius-accent'
                : 'border-julius-border bg-julius-raised text-julius-muted'
            }`}
          >
            <CategoryIcon icon={option.id} className="h-4 w-4" />
          </button>
        ))}
      </div>

      <button
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-julius-accent py-2.5 text-sm font-medium text-julius-on-accent transition active:scale-[0.98]"
      >
        <Plus className="h-4 w-4" />
        {submitLabel}
      </button>
    </form>
  )
}

function CategoryEditSheet({
  category,
  onClose,
  onSubmit,
}: {
  category: Category | null
  onClose: () => void
  onSubmit: (input: CategoryInput) => void
}) {
  if (!category) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close category editor"
        className="absolute inset-0 bg-[rgba(38,29,52,0.42)]"
        onClick={onClose}
      />
      <div className="relative max-h-[88dvh] overflow-y-auto rounded-t-[28px] bg-julius-card shadow-[0_-20px_60px_rgba(56,42,77,0.22)]">
        <div className="sticky top-0 bg-julius-card px-4 pb-3 pt-4">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-julius-border" />
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-julius-text">Edit category</h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-julius-muted transition hover:bg-julius-raised hover:text-julius-text"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="px-4 pb-5">
          <CategoryForm initial={category} submitLabel="Save category" onSubmit={onSubmit} />
        </div>
      </div>
    </div>
  )
}

function reorderCategoryList(categories: Category[], activeId: string, targetIndex: number): Category[] {
  const fromIndex = categories.findIndex((category) => category.id === activeId)
  if (fromIndex < 0) return categories

  const next = [...categories]
  const [active] = next.splice(fromIndex, 1)
  const adjustedTarget = fromIndex < targetIndex ? targetIndex - 1 : targetIndex
  const insertIndex = Math.max(0, Math.min(next.length, adjustedTarget))
  next.splice(insertIndex, 0, active)
  return next
}

function isSameCategoryOrder(a: Category[], b: Category[]): boolean {
  return a.length === b.length && a.every((category, index) => category.id === b[index]?.id)
}

function CategoriesSection() {
  const { categories, createCategory, updateCategory, deleteCategory, reorderCategories } = useCategories()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [orderedCategories, setOrderedCategories] = useState<Category[]>(categories)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const orderedRef = useRef<Category[]>(categories)
  const draggingIdRef = useRef<string | null>(null)
  const editingCategory = useMemo(
    () => categories.find((category) => category.id === editingId) ?? null,
    [categories, editingId]
  )

  useEffect(() => {
    orderedRef.current = categories
    setOrderedCategories(categories)
  }, [categories])

  function setOrdered(next: Category[]) {
    orderedRef.current = next
    setOrderedCategories(next)
  }

  function handleDelete(category: Category) {
    if (category.is_fallback) return
    setDeleteTarget(category)
  }

  function handleDragStart(event: React.PointerEvent<HTMLButtonElement>, categoryId: string) {
    if (reorderCategories.isPending) return
    draggingIdRef.current = categoryId
    setDraggingId(categoryId)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handleDragMove(event: React.PointerEvent<HTMLButtonElement>) {
    const activeId = draggingIdRef.current
    if (!activeId) return

    const target = document.elementFromPoint(event.clientX, event.clientY)
    const row = target instanceof HTMLElement
      ? target.closest('[data-category-id]')
      : null
    if (!row) return

    const overId = row?.getAttribute('data-category-id')
    if (!overId || overId === activeId) return

    const rect = row.getBoundingClientRect()
    const overIndex = orderedRef.current.findIndex((category) => category.id === overId)
    if (overIndex < 0) return

    const targetIndex = event.clientY > rect.top + rect.height / 2 ? overIndex + 1 : overIndex
    const next = reorderCategoryList(orderedRef.current, activeId, targetIndex)
    if (!isSameCategoryOrder(next, orderedRef.current)) setOrdered(next)
  }

  function handleDragEnd(event: React.PointerEvent<HTMLButtonElement>) {
    const activeId = draggingIdRef.current
    draggingIdRef.current = null
    setDraggingId(null)

    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {}

    if (!activeId || isSameCategoryOrder(orderedRef.current, categories)) return
    reorderCategories.mutate(orderedRef.current.map((category) => category.id))
  }

  return (
    <SettingsSection title="Categories">
      <div className="space-y-2">
        {orderedCategories.map((category) => (
          <div
            key={category.id}
            data-category-id={category.id}
            className={`flex items-center gap-2 rounded-2xl bg-julius-raised px-2 py-3 transition ${
              draggingId === category.id ? 'bg-julius-accent-soft ring-2 ring-julius-accent/20' : ''
            }`}
          >
            <button
              type="button"
              onPointerDown={(event) => handleDragStart(event, category.id)}
              onPointerMove={handleDragMove}
              onPointerUp={handleDragEnd}
              onPointerCancel={handleDragEnd}
              disabled={reorderCategories.isPending}
              aria-label={`Reorder ${category.name}`}
              className="flex h-10 w-8 shrink-0 touch-none items-center justify-center rounded-xl text-julius-muted transition hover:bg-julius-card hover:text-julius-text disabled:opacity-35"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${category.color}22`, color: category.color }}
            >
              <CategoryIcon icon={category.icon} className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-julius-text">{category.name}</p>
              <p className="truncate text-xs text-julius-muted">{category.is_fallback ? 'Default fallback' : 'User category'}</p>
            </div>
            <button
              onClick={() => setEditingId(category.id)}
              disabled={category.is_fallback}
              className="shrink-0 rounded-xl border border-julius-border px-3 py-2 text-xs font-medium text-julius-muted transition hover:text-julius-text disabled:opacity-35"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(category)}
              disabled={category.is_fallback}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-julius-danger/30 bg-julius-danger-soft text-julius-danger transition disabled:opacity-35"
              aria-label={`Delete ${category.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-julius-border bg-julius-bg p-3">
        <p className="mb-3 text-xs font-medium text-julius-muted">Add category</p>
        <CategoryForm submitLabel="Add category" onSubmit={(input) => createCategory.mutate(input)} />
      </div>

      <CategoryEditSheet
        category={editingCategory?.is_fallback ? null : editingCategory}
        onClose={() => setEditingId(null)}
        onSubmit={(input) => {
          if (!editingCategory) return
          updateCategory.mutate({ id: editingCategory.id, input })
          setEditingId(null)
        }}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete category?"
        message={`${deleteTarget?.name ?? 'This category'} will be removed. Existing transactions and recurring costs will move to Other.`}
        confirmLabel="Delete"
        destructive
        busy={deleteCategory.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteCategory.mutate(deleteTarget.id)
          setDeleteTarget(null)
        }}
      />
    </SettingsSection>
  )
}

function AccountSection() {
  const [user, setUser] = useState<AuthUserSummary | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [avatarSaving, setAvatarSaving] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [backgroundSaving, setBackgroundSaving] = useState(false)
  const [backgroundError, setBackgroundError] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const backgroundInputRef = useRef<HTMLInputElement | null>(null)
  const {
    timezone,
    avatarDataUrl,
    chatBackgroundDataUrl,
    saveTimezone,
    saveAvatarDataUrl,
    saveChatBackgroundDataUrl,
  } = useUserSettings()

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email ?? undefined,
          created_at: currentUser.created_at,
        })
      }
    }
    loadUser()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error('Session expired.')

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const res = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: supabaseAnonKey,
          'Content-Type': 'application/json',
        },
      })
      if (!res.ok) throw new Error(`Delete failed with ${res.status}`)
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (err) {
      console.error('delete-account error:', err)
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setAvatarSaving(true)
    setAvatarError('')
    try {
      const dataUrl = await resizeAvatarFile(file)
      await saveAvatarDataUrl(dataUrl)
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : 'Could not save the image.')
    } finally {
      setAvatarSaving(false)
    }
  }

  async function handleRemoveAvatar() {
    setAvatarSaving(true)
    setAvatarError('')
    try {
      await saveAvatarDataUrl(null)
    } catch {
      setAvatarError('Could not remove the image.')
    } finally {
      setAvatarSaving(false)
    }
  }

  async function handleBackgroundChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setBackgroundSaving(true)
    setBackgroundError('')
    try {
      const dataUrl = await resizeBackgroundFile(file)
      await saveChatBackgroundDataUrl(dataUrl)
    } catch (error) {
      setBackgroundError(error instanceof Error ? error.message : 'Could not save the image.')
    } finally {
      setBackgroundSaving(false)
    }
  }

  async function handleRemoveBackground() {
    setBackgroundSaving(true)
    setBackgroundError('')
    try {
      await saveChatBackgroundDataUrl(null)
    } catch {
      setBackgroundError('Could not remove the image.')
    } finally {
      setBackgroundSaving(false)
    }
  }

  return (
    <SettingsSection title="My account">
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-3 rounded-2xl bg-julius-raised px-3 py-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-julius-border bg-julius-card text-julius-muted">
            {avatarDataUrl ? (
              <img src={avatarDataUrl} alt="Account avatar" className="h-full w-full object-cover" />
            ) : (
              <UserRound className="h-6 w-6" strokeWidth={1.8} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-julius-muted">Profile image</p>
            <p className="mt-1 truncate font-medium text-julius-text">{avatarDataUrl ? 'Custom image' : 'No image uploaded'}</p>
            {avatarError && <p className="mt-1 text-xs text-julius-danger">{avatarError}</p>}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarSaving}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-julius-border bg-julius-card text-julius-muted transition hover:text-julius-text disabled:opacity-45"
              aria-label="Upload profile image"
            >
              <ImagePlus className="h-4 w-4" />
            </button>
            {avatarDataUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={avatarSaving}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-julius-danger/30 bg-julius-danger-soft text-julius-danger transition disabled:opacity-45"
                aria-label="Remove profile image"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-julius-raised px-3 py-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-julius-border bg-julius-card">
            {chatBackgroundDataUrl ? (
              <img src={chatBackgroundDataUrl} alt="Chat background preview" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-[linear-gradient(135deg,oklch(0.955_0.014_305),oklch(0.985_0.006_112))]" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-julius-muted">Chat background</p>
            <p className="mt-1 truncate font-medium text-julius-text">{chatBackgroundDataUrl ? 'Custom image' : 'Default background'}</p>
            {backgroundError && <p className="mt-1 text-xs text-julius-danger">{backgroundError}</p>}
          </div>
          <input
            ref={backgroundInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBackgroundChange}
          />
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => backgroundInputRef.current?.click()}
              disabled={backgroundSaving}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-julius-border bg-julius-card text-julius-muted transition hover:text-julius-text disabled:opacity-45"
              aria-label="Upload chat background"
            >
              <ImagePlus className="h-4 w-4" />
            </button>
            {chatBackgroundDataUrl && (
              <button
                type="button"
                onClick={handleRemoveBackground}
                disabled={backgroundSaving}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-julius-danger/30 bg-julius-danger-soft text-julius-danger transition disabled:opacity-45"
                aria-label="Remove chat background"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="rounded-2xl bg-julius-raised px-3 py-3">
          <p className="text-xs text-julius-muted">Email</p>
          <p className="mt-1 truncate font-medium text-julius-text">{user?.email ?? 'Loading'}</p>
        </div>
        <div className="rounded-2xl bg-julius-raised px-3 py-3">
          <p className="text-xs text-julius-muted">User ID</p>
          <p className="mt-1 truncate font-mono text-xs text-julius-text">{user?.id ?? 'Loading'}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-julius-raised px-3 py-3">
            <p className="text-xs text-julius-muted">Currency</p>
            <p className="mt-1 font-medium text-julius-text">EUR (€)</p>
          </div>
          <div className="rounded-2xl bg-julius-raised px-3 py-3">
            <p className="text-xs text-julius-muted">Created</p>
            <p className="mt-1 truncate font-medium text-julius-text">{formatDateTime(user?.created_at)}</p>
          </div>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-julius-muted">Timezone</span>
          <div className="relative">
            <select
              value={timezone}
              onChange={(event) => saveTimezone(event.target.value)}
              className="w-full appearance-none rounded-xl border border-julius-border bg-julius-raised px-3 py-2.5 text-sm text-julius-text focus:border-julius-accent focus:outline-none"
            >
              {timezoneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-julius-muted">⌄</span>
          </div>
        </label>

        <InstallJuliusAction variant="row" />

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-xl border border-julius-border bg-julius-raised py-3 text-sm font-medium text-julius-muted transition hover:text-julius-text"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={deleting}
            className="flex items-center justify-center gap-2 rounded-xl border border-julius-danger/30 bg-julius-danger-soft py-3 text-sm font-medium text-julius-danger transition disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? 'Deleting' : 'Delete'}
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={confirmDelete}
        title="Delete account?"
        message="This deletes your account and all Julius data. This cannot be undone."
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDeleteAccount}
      />
    </SettingsSection>
  )
}

function AdminPanel() {
  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [functionUnavailable, setFunctionUnavailable] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminUserSummary | null>(null)

  function isLocalSupabaseUrl(value: string): boolean {
    return value.includes('127.0.0.1') || value.includes('localhost')
  }

  async function requestAdminUsers(method: 'GET' | 'POST', body?: unknown) {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) throw new Error('Session expired.')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const res = await fetch(`${supabaseUrl}/functions/v1/admin-users`, {
      method,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (res.status === 403 || res.status === 404) return null
    if (!res.ok) throw new Error(`Admin request failed with ${res.status}`)
    return res.json()
  }

  async function loadUsers() {
    setLoading(true)
    try {
      const data = await requestAdminUsers('GET')
      if (!data) {
        setFunctionUnavailable(true)
        return
      }
      setFunctionUnavailable(false)
      setIsAdmin(true)
      setUsers(data.users ?? [])
    } catch {
      setFunctionUnavailable(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function checkAdminAccess() {
      setLoading(true)
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          setIsAdmin(false)
          return
        }

        const { data } = await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!data) {
          setIsAdmin(false)
          return
        }

        setIsAdmin(true)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        if (isLocalSupabaseUrl(supabaseUrl)) {
          setFunctionUnavailable(true)
          return
        }
        await loadUsers()
      } catch {
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }
    checkAdminAccess()
  }, [])

  async function handleDelete(user: AdminUserSummary) {
    if (user.is_current_user) return
    setDeleteTarget(user)
  }

  async function confirmDeleteUser() {
    if (!deleteTarget) return
    setDeletingId(deleteTarget.id)
    try {
      await requestAdminUsers('POST', { target_user_id: deleteTarget.id })
      await loadUsers()
    } catch {
      setFunctionUnavailable(true)
    } finally {
      setDeletingId(null)
      setDeleteTarget(null)
    }
  }

  if (loading) {
    return (
      <SettingsSection title="Admin">
        <div className="h-14 animate-pulse rounded-2xl bg-julius-raised" />
      </SettingsSection>
    )
  }

  if (!isAdmin) return null

  return (
    <SettingsSection title="Admin">
      <div className="mb-3 flex items-center gap-2 rounded-2xl bg-julius-accent-soft px-3 py-2 text-sm text-julius-accent">
        <Shield className="h-4 w-4" />
        Felipe admin access
      </div>
      {functionUnavailable ? (
        <div className="rounded-2xl bg-julius-raised px-3 py-3 text-sm text-julius-muted">
          Admin user deletion is available when the admin Edge Function is running.
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-3 rounded-2xl bg-julius-raised px-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-julius-text">{user.email ?? user.id}</p>
                <p className="text-xs text-julius-muted">
                  Last record: {formatRecordDate(user.last_record_date, user.last_record_time)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(user)}
                disabled={user.is_current_user || deletingId === user.id}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-julius-danger/30 bg-julius-danger-soft text-julius-danger transition disabled:opacity-35"
                aria-label={`Delete ${user.email ?? user.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete user?"
        message={`${deleteTarget?.email ?? deleteTarget?.id ?? 'This user'} and all related Julius data will be deleted.`}
        confirmLabel="Delete"
        destructive
        busy={Boolean(deletingId)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteUser}
      />
    </SettingsSection>
  )
}

export default function SettingsPage() {
  return (
    <div className="space-y-4 px-4 py-4 pb-8">
      <AccountSection />
      <CategoriesSection />
      <AdminPanel />
    </div>
  )
}
