import { NextRequest, NextResponse } from 'next/server'
import {
  getTestimonialWidgetById,
  getTestimonialsByIds,
  getAllTestimonials,
  getTestimonialsByForm,
} from '@/lib/db/testimonials'
import type { TestimonialRecord, TestimonialWidgetConfig } from '@/lib/db/schema'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// CORS headers for cross-origin embedding
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ widgetId: string }> }
) {
  const params = await context.params
  try {
    // Handle both with and without .js extension
    const widgetId = params.widgetId.replace('.js', '')

    // Get widget configuration
    const widget = await getTestimonialWidgetById(widgetId)

    if (!widget) {
      return new NextResponse('// Widget not found', {
        status: 404,
        headers: {
          'Content-Type': 'application/javascript',
          ...corsHeaders,
        },
      })
    }

    const config = (widget.config || {}) as TestimonialWidgetConfig

    // Fetch testimonials based on widget config
    let testimonials: TestimonialRecord[] = []

    // Priority 1: Specific selected IDs (in order)
    if (config.selectedIds && config.selectedIds.length > 0) {
      const fetched = await getTestimonialsByIds(config.selectedIds)
      // Preserve the order from selectedIds
      const orderMap = new Map(config.selectedIds.map((id, idx) => [id, idx]))
      testimonials = fetched
        .filter((t) => t.status === 'approved')
        .sort((a, b) => {
          const orderA = orderMap.get(a.id) ?? 999
          const orderB = orderMap.get(b.id) ?? 999
          return orderA - orderB
        })
    }
    // Priority 2: Filter by forms
    else if (config.filterByForms && config.filterByForms.length > 0) {
      const results = await Promise.all(
        config.filterByForms.map((formId) =>
          getTestimonialsByForm(formId, { status: 'approved' })
        )
      )
      testimonials = results.flat()
    }
    // Priority 3: All approved testimonials
    else {
      testimonials = await getAllTestimonials({
        status: 'approved',
        featured: config.onlyFeatured || undefined,
        limit: config.maxItems,
      })
    }

    // Apply featured filter if not already applied
    if (config.onlyFeatured && config.selectedIds?.length) {
      testimonials = testimonials.filter((t) => t.featured)
    }

    // Apply max items limit
    if (config.maxItems && testimonials.length > config.maxItems) {
      testimonials = testimonials.slice(0, config.maxItems)
    }

    // Generate JavaScript code
    const js = generateWidgetJS(widgetId, config, testimonials)

    return new NextResponse(js, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=60',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('Widget error:', error)
    const errorJs = `console.error('[CheckoutPanda Widget] Error:', ${JSON.stringify(String(error))});`
    return new NextResponse(errorJs, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
        ...corsHeaders,
      },
    })
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m] || m)
}

function renderStars(rating: number): string {
  return [1, 2, 3, 4, 5]
    .map(
      (i) => `
      <svg class="cp-star ${i <= rating ? 'filled' : 'empty'}" viewBox="0 0 24 24" width="16" height="16">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
      </svg>
    `
    )
    .join('')
}

function renderTestimonial(
  testimonial: TestimonialRecord,
  config: TestimonialWidgetConfig
): string {
  const showRating = config.showRating !== false
  const showCompany = config.showCompany !== false
  const showPhoto = config.showPhoto !== false

  // Generate initials for fallback avatar
  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')
    }
    return name.slice(0, 2).toUpperCase()
  }

  const initials = getInitials(testimonial.customerName)

  const renderAvatar = () => {
    if (testimonial.customerPhoto) {
      return `<img src="${escapeHtml(testimonial.customerPhoto)}" alt="${escapeHtml(testimonial.customerName)}" class="cp-avatar-img" />`
    }
    return `<span class="cp-avatar-initials">${initials}</span>`
  }

  return `
    <div class="cp-testimonial">
      ${showRating && testimonial.rating ? `<div class="cp-rating">${renderStars(testimonial.rating)}</div>` : ''}
      <div class="cp-content">${escapeHtml(testimonial.content)}</div>
      <div class="cp-customer">
        ${showPhoto ? `<div class="cp-avatar">${renderAvatar()}</div>` : ''}
        <div class="cp-customer-info">
          <div class="cp-customer-name">${escapeHtml(testimonial.customerName)}</div>
          ${showCompany && testimonial.customerCompany ? `<div class="cp-customer-company">${escapeHtml(testimonial.customerCompany)}</div>` : ''}
        </div>
      </div>
    </div>
  `
}

function generateWidgetJS(
  widgetId: string,
  config: TestimonialWidgetConfig,
  testimonials: TestimonialRecord[]
): string {
  if (testimonials.length === 0) {
    return `console.log('[CheckoutPanda Widget] No testimonials to display');`
  }

  const html = `
    <div class="cp-carousel">
      <div class="cp-carousel-inner">
        ${testimonials.map((t) => renderTestimonial(t, config)).join('')}
      </div>
      ${
        testimonials.length > 1
          ? `
        <button class="cp-nav cp-nav-prev" aria-label="Previous">
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </button>
        <button class="cp-nav cp-nav-next" aria-label="Next">
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
        </button>
        <div class="cp-dots">
          ${testimonials.map((_, i) => `<button class="cp-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>`).join('')}
        </div>
      `
          : ''
      }
    </div>
  `

  const css = `
    :host {
      display: block;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.5;
      color: #1f2937;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .cp-carousel {
      position: relative;
      overflow: hidden;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    }

    .cp-carousel-inner {
      display: flex;
      transition: transform 0.4s ease-in-out;
    }

    .cp-testimonial {
      flex: 0 0 100%;
      padding: 32px;
      min-width: 0;
    }

    .cp-rating {
      display: flex;
      gap: 2px;
      margin-bottom: 16px;
    }

    .cp-star {
      fill: #fbbf24;
    }

    .cp-star.empty {
      fill: #e5e7eb;
    }

    .cp-content {
      font-size: 16px;
      line-height: 1.7;
      color: #374151;
      margin-bottom: 20px;
      font-style: italic;
    }

    .cp-customer {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .cp-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
    }

    .cp-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    .cp-avatar-initials {
      color: #ffffff;
      font-weight: 600;
      font-size: 16px;
    }

    .cp-customer-info {
      flex: 1;
      min-width: 0;
    }

    .cp-customer-name {
      font-weight: 600;
      color: #1f2937;
      font-size: 15px;
    }

    .cp-customer-company {
      font-size: 13px;
      color: #6b7280;
      margin-top: 2px;
    }

    .cp-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
      z-index: 10;
    }

    .cp-nav:hover {
      background: #f9fafb;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .cp-nav svg {
      fill: #374151;
    }

    .cp-nav-prev {
      left: 12px;
    }

    .cp-nav-next {
      right: 12px;
    }

    .cp-dots {
      display: flex;
      justify-content: center;
      gap: 8px;
      padding: 0 32px 24px;
    }

    .cp-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: none;
      background: #d1d5db;
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 0;
    }

    .cp-dot:hover {
      background: #9ca3af;
    }

    .cp-dot.active {
      background: #667eea;
      width: 24px;
      border-radius: 4px;
    }

    @media (max-width: 640px) {
      .cp-testimonial {
        padding: 24px;
      }

      .cp-nav {
        width: 32px;
        height: 32px;
      }

      .cp-nav-prev {
        left: 8px;
      }

      .cp-nav-next {
        right: 8px;
      }

      .cp-content {
        font-size: 15px;
      }
    }
  `

  const js = `
(function() {
  console.log('[CheckoutPanda Widget] Loading widget ${widgetId}');

  var initialized = false;
  var autoplayInterval = null;

  function initWidget() {
    if (initialized) return true;

    var container = document.getElementById('cp-widget-${widgetId}');
    if (!container) return false;

    if (container.shadowRoot) {
      initialized = true;
      return true;
    }

    try {
      var shadow = container.attachShadow({ mode: 'open' });

      var style = document.createElement('style');
      style.textContent = \`${css.replace(/\\/g, '\\\\').replace(/`/g, '\\`')}\`;
      shadow.appendChild(style);

      var wrapper = document.createElement('div');
      wrapper.innerHTML = \`${html.replace(/\\/g, '\\\\').replace(/`/g, '\\`')}\`;
      shadow.appendChild(wrapper.firstElementChild || wrapper);

      initialized = true;
      console.log('[CheckoutPanda Widget] Widget rendered');

      ${
        testimonials.length > 1
          ? `
      // Carousel functionality
      var currentSlide = 0;
      var totalSlides = ${testimonials.length};
      var inner = shadow.querySelector('.cp-carousel-inner');
      var prevBtn = shadow.querySelector('.cp-nav-prev');
      var nextBtn = shadow.querySelector('.cp-nav-next');
      var dots = shadow.querySelectorAll('.cp-dot');

      function showSlide(index) {
        currentSlide = ((index % totalSlides) + totalSlides) % totalSlides;
        inner.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
        
        dots.forEach(function(dot, i) {
          dot.classList.toggle('active', i === currentSlide);
        });
      }

      function nextSlide() {
        showSlide(currentSlide + 1);
      }

      function prevSlide() {
        showSlide(currentSlide - 1);
      }

      function startAutoplay() {
        stopAutoplay();
        autoplayInterval = setInterval(nextSlide, 5000);
      }

      function stopAutoplay() {
        if (autoplayInterval) {
          clearInterval(autoplayInterval);
          autoplayInterval = null;
        }
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', function() {
          prevSlide();
          startAutoplay();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', function() {
          nextSlide();
          startAutoplay();
        });
      }

      dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
          showSlide(parseInt(dot.dataset.index, 10));
          startAutoplay();
        });
      });

      // Pause autoplay on hover
      var carousel = shadow.querySelector('.cp-carousel');
      if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);
      }

      // Start autoplay
      startAutoplay();
      `
          : ''
      }

      return true;
    } catch (e) {
      console.error('[CheckoutPanda Widget] Error:', e);
      return false;
    }
  }

  function tryInit() {
    if (initWidget()) return;

    var attempts = 0;
    var maxAttempts = 20;
    var interval = setInterval(function() {
      attempts++;
      if (initWidget() || attempts >= maxAttempts) {
        clearInterval(interval);
        if (attempts >= maxAttempts && !initialized) {
          console.warn('[CheckoutPanda Widget] Container not found: cp-widget-${widgetId}');
        }
      }
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }
})();
  `

  return js.trim()
}
