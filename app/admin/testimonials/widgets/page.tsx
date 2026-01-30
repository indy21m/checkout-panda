import { db } from '@/lib/db'
import { testimonialWidgets, testimonialForms } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { TestimonialWidgetsTable } from '@/components/admin/TestimonialWidgetsTable'
import type { TestimonialWidgetConfig } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

export default async function TestimonialWidgetsPage() {
  // Fetch all widgets
  const widgets = await db
    .select({
      id: testimonialWidgets.id,
      name: testimonialWidgets.name,
      config: testimonialWidgets.config,
      createdAt: testimonialWidgets.createdAt,
    })
    .from(testimonialWidgets)
    .orderBy(desc(testimonialWidgets.createdAt))

  // Get all forms to map IDs to names
  const forms = await db
    .select({
      id: testimonialForms.id,
      name: testimonialForms.name,
    })
    .from(testimonialForms)

  const formNameMap = new Map(forms.map((f) => [f.id, f.name]))

  // Add source info to each widget
  const widgetsWithInfo = widgets.map((widget) => {
    const config = widget.config as TestimonialWidgetConfig | null
    let sourceInfo = 'All testimonials'

    if (config?.selectedIds && config.selectedIds.length > 0) {
      sourceInfo = `${config.selectedIds.length} hand-picked`
    } else if (config?.filterByForms && config.filterByForms.length > 0) {
      const formNames = config.filterByForms
        .map((id) => formNameMap.get(id))
        .filter(Boolean)
        .slice(0, 3)
      if (formNames.length < (config.filterByForms.length || 0)) {
        sourceInfo = `${formNames.join(', ')} +${config.filterByForms.length - formNames.length} more`
      } else {
        sourceInfo = formNames.join(', ')
      }
    }

    return {
      ...widget,
      sourceInfo,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Display Widgets</h2>
        <p className="text-sm text-gray-500">
          Create and configure widgets to display testimonials on your pages.
        </p>
      </div>

      <TestimonialWidgetsTable widgets={widgetsWithInfo} />
    </div>
  )
}
