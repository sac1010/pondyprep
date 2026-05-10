import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatScore(score: number, total: number): string {
  return `${score}/${total}`
}

export function formatAccuracy(score: number, total: number): string {
  return `${Math.round((score / total) * 100)}%`
}
