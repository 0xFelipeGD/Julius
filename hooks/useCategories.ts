'use client'

import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { DEFAULT_CATEGORIES, normalizeCategoryName, toCategorySeed } from '@/lib/categories'
import type { Category, CategoryInput } from '@/lib/types'

export const categoriesQueryKey = ['categories']

export function useCategories() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const ensureDefaultCategories = useCallback(async (): Promise<Category[]> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const seeds = DEFAULT_CATEGORIES.map((category) => toCategorySeed(user.id, category))
    const { error } = await supabase
      .from('user_categories')
      .upsert(seeds, { onConflict: 'user_id,normalized_name', ignoreDuplicates: true })

    if (error) throw error

    const { data, error: fetchError } = await supabase
      .from('user_categories')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (fetchError) throw fetchError
    return (data ?? []) as Category[]
  }, [supabase])

  const query = useQuery<Category[]>({
    queryKey: categoriesQueryKey,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('user_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      if (data?.length) return data as Category[]
      return ensureDefaultCategories()
    },
  })

  const createCategory = useMutation({
    mutationFn: async (input: CategoryInput) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Session expired.')

      const categories = queryClient.getQueryData<Category[]>(categoriesQueryKey) ?? []
      const nextSort = Math.max(0, ...categories.map((category) => category.sort_order)) + 10
      const { error } = await supabase.from('user_categories').insert({
        user_id: user.id,
        name: input.name.trim(),
        normalized_name: normalizeCategoryName(input.name),
        color: input.color,
        icon: input.icon,
        sort_order: nextSort,
        is_fallback: false,
      })

      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoriesQueryKey }),
  })

  const updateCategory = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: CategoryInput & { sort_order?: number } }) => {
      const { error } = await supabase
        .from('user_categories')
        .update({
          name: input.name.trim(),
          normalized_name: normalizeCategoryName(input.name),
          color: input.color,
          icon: input.icon,
          sort_order: input.sort_order,
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesQueryKey })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] })
    },
  })

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('delete_user_category', { category_id_to_delete: id })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesQueryKey })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] })
    },
  })

  return {
    ...query,
    categories: query.data ?? [],
    ensureDefaultCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
