import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { testimonialWidgets, testimonialForms, type TestimonialWidgetConfig } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import {
  createTestimonialWidget,
  updateTestimonialWidget,
  deleteTestimonialWidget,
  getTestimonialWidgetById,
} from '@/lib/db/testimonials'

// Schema for widget config
const widgetConfigSchema = z.object({
  filterByForms: z.array(z.string()).optional(),
  selectedIds: z.array(z.string()).optional(),
  testimonialOrder: z.enum(['newest', 'oldest', 'rating', 'random']).optional(),
  maxItems: z.number().optional(),
  onlyFeatured: z.boolean().optional(),
  layout: z.enum(['grid', 'carousel', 'list', 'masonry']).optional(),
  showRating: z.boolean().optional(),
  showCompany: z.boolean().optional(),
  showPhoto: z.boolean().optional(),
})

const createWidgetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  config: widgetConfigSchema.optional(),
})

const updateWidgetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  config: widgetConfigSchema.optional(),
})

export interface TestimonialWidgetWithInfo {
  id: string
  name: string
  config: TestimonialWidgetConfig | null
  createdAt: Date | null
  sourceInfo?: string
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // If id is provided, return single widget with forms
    if (id) {
      const widget = await getTestimonialWidgetById(id)
      if (!widget) {
        return NextResponse.json({ error: 'Widget not found' }, { status: 404 })
      }

      // Get forms for filter info
      const forms = await db
        .select({
          id: testimonialForms.id,
          name: testimonialForms.name,
          slug: testimonialForms.slug,
        })
        .from(testimonialForms)
        .orderBy(desc(testimonialForms.createdAt))

      return NextResponse.json({ widget, forms })
    }

    // Get all widgets
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
    const widgetsWithInfo: TestimonialWidgetWithInfo[] = widgets.map((widget) => {
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

    return NextResponse.json({ widgets: widgetsWithInfo, forms })
  } catch (error) {
    console.error('Failed to fetch testimonial widgets:', error)
    return NextResponse.json({ error: 'Failed to fetch testimonial widgets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const data = createWidgetSchema.parse(body)

    const widget = await createTestimonialWidget({
      name: data.name,
      config: data.config ?? {},
    })

    return NextResponse.json({ widget }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Failed to create testimonial widget:', error)
    return NextResponse.json({ error: 'Failed to create testimonial widget' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const data = updateWidgetSchema.parse(body)

    const widget = await updateTestimonialWidget(data.id, {
      name: data.name,
      config: data.config,
    })

    if (!widget) {
      return NextResponse.json({ error: 'Widget not found' }, { status: 404 })
    }

    return NextResponse.json({ widget })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Failed to update testimonial widget:', error)
    return NextResponse.json({ error: 'Failed to update testimonial widget' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Widget ID is required' }, { status: 400 })
    }

    const deleted = await deleteTestimonialWidget(id)

    if (!deleted) {
      return NextResponse.json({ error: 'Widget not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete testimonial widget:', error)
    return NextResponse.json({ error: 'Failed to delete testimonial widget' }, { status: 500 })
  }
}
