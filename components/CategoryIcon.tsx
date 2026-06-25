'use client'

import type { LucideIcon } from 'lucide-react'
import {
  Archive,
  BookOpen,
  Briefcase,
  Building2,
  Calculator,
  Car,
  CircleDot,
  Clapperboard,
  Coffee,
  Dumbbell,
  Fuel,
  Gift,
  HeartPulse,
  Home,
  Landmark,
  Plane,
  Receipt,
  Shirt,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Tv,
  Utensils,
  Wallet,
  Wifi,
} from 'lucide-react'

export interface CategoryIconOption {
  id: string
  label: string
  icon: LucideIcon
}

export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { id: 'utensils', label: 'Food', icon: Utensils },
  { id: 'shopping-cart', label: 'Market', icon: ShoppingCart },
  { id: 'coffee', label: 'Coffee', icon: Coffee },
  { id: 'car', label: 'Car', icon: Car },
  { id: 'fuel', label: 'Fuel', icon: Fuel },
  { id: 'heart-pulse', label: 'Health', icon: HeartPulse },
  { id: 'sparkles', label: 'Leisure', icon: Sparkles },
  { id: 'tv', label: 'Streaming', icon: Tv },
  { id: 'clapperboard', label: 'Netflix', icon: Clapperboard },
  { id: 'home', label: 'Home', icon: Home },
  { id: 'building-2', label: 'Rent', icon: Building2 },
  { id: 'landmark', label: 'Taxes', icon: Landmark },
  { id: 'calculator', label: 'Accountant', icon: Calculator },
  { id: 'receipt', label: 'Bills', icon: Receipt },
  { id: 'wifi', label: 'Internet', icon: Wifi },
  { id: 'smartphone', label: 'Phone', icon: Smartphone },
  { id: 'dumbbell', label: 'Gym', icon: Dumbbell },
  { id: 'shirt', label: 'Clothes', icon: Shirt },
  { id: 'plane', label: 'Travel', icon: Plane },
  { id: 'book-open', label: 'Education', icon: BookOpen },
  { id: 'briefcase', label: 'Work', icon: Briefcase },
  { id: 'gift', label: 'Gifts', icon: Gift },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'archive', label: 'Other', icon: Archive },
]

const iconMap = new Map(CATEGORY_ICON_OPTIONS.map((option) => [option.id, option.icon]))

interface CategoryIconProps {
  icon: string
  className?: string
  strokeWidth?: number
}

export function CategoryIcon({ icon, className = 'h-4 w-4', strokeWidth = 1.9 }: CategoryIconProps) {
  const Icon = iconMap.get(icon) ?? CircleDot
  return <Icon className={className} strokeWidth={strokeWidth} />
}
