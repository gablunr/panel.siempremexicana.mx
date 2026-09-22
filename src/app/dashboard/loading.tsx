import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div role="status" className="flex flex-col gap-4 px-4 md:gap-6 lg:px-6">
      <span className="sr-only">Cargando</span>
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-72 rounded-xl" />
    </div>
  )
}
