"use client"

import * as React from "react"
import {
  createColumnHelper,
  createPaginatedRowModel,
  FlexRender,
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  EllipsisVerticalIcon,
  MailIcon,
  SearchIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Dossier } from "@/components/sections/shared/Dossier"
import { Stamp } from "@/components/sections/shared/Stamp"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateQuote } from "@/actions/Ledger"
import type { Quote } from "@/data/Ledger"
import {
  quoteStatusLabels,
  quoteStatuses,
  type QuoteStatus,
} from "@/data/Lexicon"
import { formatDate } from "@/lib/Almanac"

const features = tableFeatures({
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
})

const columnHelper = createColumnHelper<typeof features, Quote>()

const statusItems = quoteStatuses.map((value) => ({
  value,
  label: quoteStatusLabels[value],
}))

const filterItems = [{ value: "all", label: "Todas" }, ...statusItems]

function QuoteActions({ quote }: { quote: Quote }) {
  const [pending, startTransition] = React.useTransition()

  const changeStatus = (status: QuoteStatus) =>
    startTransition(async () => {
      const result = await updateQuote(quote.id, { status })
      if (result.error) toast.error(result.error)
      else
        toast.success(
          `${quote.nombre}: ${quoteStatusLabels[status]}`
        )
    })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="flex size-8 text-muted-foreground data-open:bg-muted"
            size="icon"
            disabled={pending}
          />
        }
      >
        <EllipsisVerticalIcon />
        <span className="sr-only">Abrir menú</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Estado</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={quote.estado}
            onValueChange={(value) => changeStatus(value as QuoteStatus)}
          >
            {statusItems.map((item) => (
              <DropdownMenuRadioItem key={item.value} value={item.value}>
                {item.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<a href={`mailto:${quote.correo}`} />}>
          <MailIcon />
          Enviar correo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const columns = columnHelper.columns([
  columnHelper.accessor("nombre", {
    header: "Nombre",
    cell: ({ row }) => <Dossier quote={row.original} />,
  }),
  columnHelper.accessor("servicio", {
    header: "Servicio",
    cell: ({ row }) => (
      <div className="max-w-56 truncate">{row.original.servicio}</div>
    ),
  }),
  columnHelper.accessor("presupuesto", {
    header: "Presupuesto",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">{row.original.presupuesto}</span>
    ),
  }),
  columnHelper.accessor("plazo", {
    header: "Plazo",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {row.original.plazo}
      </span>
    ),
  }),
  columnHelper.accessor("estado", {
    header: "Estado",
    cell: ({ row }) => <Stamp status={row.original.estado} />,
  }),
  columnHelper.accessor("creada_en", {
    header: "Recibida",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {formatDate(row.original.creada_en)}
      </span>
    ),
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => <QuoteActions quote={row.original} />,
  }),
])

export function DataTable({
  quotes,
  compact = false,
}: {
  quotes: Quote[]
  compact?: boolean
}) {
  const [filter, setFilter] = React.useState("all")
  const [search, setSearch] = React.useState("")
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const counts = React.useMemo(() => {
    const totals: Record<string, number> = { all: quotes.length }
    for (const quote of quotes) {
      totals[quote.estado] = (totals[quote.estado] ?? 0) + 1
    }
    return totals
  }, [quotes])

  const data = React.useMemo(() => {
    const term = search.trim().toLowerCase()
    return quotes.filter(
      (quote) =>
        (filter === "all" || quote.estado === filter) &&
        (!term ||
          [quote.nombre, quote.correo, quote.telefono ?? "", quote.servicio].some(
            (value) => value.toLowerCase().includes(term)
          ))
    )
  }, [quotes, filter, search])

  const table = useTable({
    features,
    data,
    columns,
    state: { pagination },
    getRowId: (row) => row.id,
    onPaginationChange: setPagination,
  })

  const refine = (changes: { filter?: string; search?: string }) => {
    if (changes.filter !== undefined) setFilter(changes.filter)
    if (changes.search !== undefined) setSearch(changes.search)
    setPagination((current) => ({ ...current, pageIndex: 0 }))
  }

  const grid = (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder ? null : <FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {quotes.length
                  ? "Ninguna cotización coincide con este filtro."
                  : "Todavía no ha llegado ninguna solicitud."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )

  if (compact) {
    return (
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <h2 className="text-base font-semibold">Últimas cotizaciones</h2>
        {grid}
      </div>
    )
  }

  return (
    <Tabs
      value={filter}
      onValueChange={(value) => refine({ filter: String(value) })}
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 lg:px-6">
        <Label htmlFor="status-filter" className="sr-only">
          Estado
        </Label>
        <Select
          value={filter}
          onValueChange={(value) => {
            if (value) refine({ filter: value })
          }}
          items={filterItems}
        >
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="status-filter"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {filterItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <TabsList className="hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 @4xl/main:flex">
          {filterItems.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
              {counts[item.value] ? (
                <Badge variant="secondary">{counts[item.value]}</Badge>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => refine({ search: event.target.value })}
            placeholder="Busca por nombre, correo o servicio"
            aria-label="Buscar cotizaciones"
            className="h-8 w-56 pl-8 lg:w-72"
          />
        </div>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        {grid}
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {data.length} {data.length === 1 ? "cotización" : "cotizaciones"}
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Página {table.state.pagination.pageIndex + 1} de{" "}
              {Math.max(table.getPageCount(), 1)}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir a la primera página</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir a la página anterior</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir a la página siguiente</span>
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir a la última página</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Tabs>
  )
}
