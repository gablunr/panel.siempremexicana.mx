"use client"

import * as React from "react"
import Link from "next/link"
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
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  Dossier,
  useDossier,
  type DossierHandle,
} from "@/components/sections/shared/Dossier"
import { Stamp } from "@/components/sections/shared/Stamp"
import { Ticket } from "@/components/sections/shared/Ticket"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DrawerTrigger } from "@/components/ui/drawer"
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

const columnClass: Record<string, string> = {
  presupuesto: "hidden @min-[60rem]/main:table-cell",
  plazo: "hidden @min-[70rem]/main:table-cell",
}

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
        <span className="sr-only">Opciones de {quote.nombre}</span>
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

const columnsFor = (dossier: DossierHandle) =>
  columnHelper.columns([
    columnHelper.accessor("nombre", {
      header: "Nombre",
      cell: ({ row }) => (
        <DrawerTrigger
          handle={dossier}
          payload={row.original}
          render={
            <Button variant="link" className="w-fit px-0 text-left text-foreground" />
          }
        >
          {row.original.nombre}
        </DrawerTrigger>
      ),
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

function Count({ value }: { value: number | undefined }) {
  return value ? (
    <span className="ml-auto text-muted-foreground tabular-nums">{value}</span>
  ) : null
}

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
  const dossier = useDossier()
  const listRef = React.useRef<HTMLDivElement>(null)
  const searchRef = React.useRef<HTMLInputElement>(null)
  const columns = React.useMemo(() => columnsFor(dossier), [dossier])

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

  const lastPage = Math.max(Math.ceil(data.length / pagination.pageSize) - 1, 0)
  const pageIndex = Math.min(pagination.pageIndex, lastPage)
  const pageCount = lastPage + 1
  const filtered = filter !== "all" || search.trim() !== ""

  const table = useTable({
    features,
    data,
    columns,
    state: { pagination: { ...pagination, pageIndex } },
    getRowId: (row) => row.id,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
  })

  const rows = table.getRowModel().rows

  const refine = (changes: { filter?: string; search?: string }) => {
    if (changes.filter !== undefined) setFilter(changes.filter)
    if (changes.search !== undefined) setSearch(changes.search)
    setPagination((current) => ({ ...current, pageIndex: 0 }))
  }

  const goTo = (index: number) => {
    setPagination((current) => ({ ...current, pageIndex: index }))
    const list = listRef.current
    if (list && list.getBoundingClientRect().top < 0) {
      list.scrollIntoView({ block: "start" })
    }
  }

  const empty = (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-sm text-muted-foreground">
        {quotes.length
          ? "Ninguna cotización coincide con este filtro."
          : "Todavía no ha llegado ninguna solicitud."}
      </p>
      {filtered ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => refine({ filter: "all", search: "" })}
        >
          Quitar filtros
        </Button>
      ) : null}
    </div>
  )

  const list = (
    <div ref={listRef} className="scroll-mt-16">
      {rows.length ? (
        <ul
          role="list"
          aria-label={compact ? "Últimas cotizaciones" : "Cotizaciones"}
          className="grid grid-cols-1 gap-3 @xl/main:grid-cols-2 @3xl/main:hidden"
        >
          {rows.map((row) => (
            <Ticket
              key={row.id}
              quote={row.original}
              dossier={dossier}
              actions={<QuoteActions quote={row.original} />}
            />
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed px-4 py-10 @3xl/main:hidden">
          {empty}
        </div>
      )}
      <div className="hidden overflow-hidden rounded-lg border @3xl/main:block">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={columnClass[header.column.id]}
                  >
                    {header.isPlaceholder ? null : <FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={columnClass[cell.column.id]}
                    >
                      <FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  {empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )

  if (compact) {
    return (
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Últimas cotizaciones</h2>
          <Button
            variant="ghost"
            size="sm"
            className="-mr-2"
            nativeButton={false}
            render={<Link href="/dashboard/quotes" />}
          >
            Ver todas
            <ChevronRightIcon data-icon="inline-end" />
          </Button>
        </div>
        {list}
        <Dossier handle={dossier} quotes={quotes} />
      </div>
    )
  }

  return (
    <Tabs
      value={filter}
      onValueChange={(value) => refine({ filter: String(value) })}
      className="w-full flex-col justify-start gap-6 @max-xl/main:gap-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 lg:px-6 @max-xl/main:flex-col @max-xl/main:items-stretch">
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
            className="flex w-fit @max-xl/main:w-full @4xl/main:hidden"
            id="status-filter"
          >
            <SelectValue>
              {(value: string) => (
                <>
                  {filterItems.find((item) => item.value === value)?.label}
                  <Count value={counts[value]} />
                </>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {filterItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                  <Count value={counts[item.value]} />
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
        <div className="relative w-64 lg:w-72 @max-xl/main:w-full">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchRef}
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            value={search}
            onChange={(event) => refine({ search: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur()
            }}
            placeholder="Nombre, correo o servicio"
            aria-label="Buscar cotizaciones"
            className="appearance-none pl-8 not-placeholder-shown:pr-10 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
          />
          {search ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Borrar búsqueda"
              className="absolute inset-y-0 right-1 my-auto text-muted-foreground"
              onClick={() => {
                refine({ search: "" })
                searchRef.current?.focus()
              }}
            >
              <XIcon />
            </Button>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        {list}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 @3xl/main:px-4">
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {data.length} {data.length === 1 ? "cotización" : "cotizaciones"}
          </p>
          {pageCount > 1 ? (
            <div className="flex items-center gap-4 @3xl/main:gap-8">
              <p className="text-sm font-medium tabular-nums">
                Página {pageIndex + 1} de {pageCount}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => goTo(0)}
                  disabled={pageIndex === 0}
                >
                  <span className="sr-only">Ir a la primera página</span>
                  <ChevronsLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => goTo(pageIndex - 1)}
                  disabled={pageIndex === 0}
                >
                  <span className="sr-only">Ir a la página anterior</span>
                  <ChevronLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => goTo(pageIndex + 1)}
                  disabled={pageIndex === lastPage}
                >
                  <span className="sr-only">Ir a la página siguiente</span>
                  <ChevronRightIcon />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => goTo(lastPage)}
                  disabled={pageIndex === lastPage}
                >
                  <span className="sr-only">Ir a la última página</span>
                  <ChevronsRightIcon />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <Dossier handle={dossier} quotes={quotes} />
    </Tabs>
  )
}
