import { format } from 'date-fns'

/**
 * Booking confirmation email sent to the guest
 */
export function bookingConfirmationEmail(data: {
  guestName: string
  startTime: Date
  endTime: Date
  meetingType: string
}): { subject: string; html: string } {
  const date = format(data.startTime, 'EEEE, MMMM d, yyyy')
  const time = `${format(data.startTime, 'h:mm a')} – ${format(data.endTime, 'h:mm a')}`

  return {
    subject: 'Your booking is confirmed',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #111; margin-bottom: 8px;">Booking Confirmed</h2>
        <p style="color: #555; margin-bottom: 24px;">Hi ${escapeHtml(data.guestName)}, your booking has been confirmed.</p>
        <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0; color: #333;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 0 0 8px 0; color: #333;"><strong>Time:</strong> ${time}</p>
          <p style="margin: 0; color: #333;"><strong>Type:</strong> ${escapeHtml(data.meetingType)}</p>
        </div>
        <p style="color: #888; font-size: 14px;">If you need to cancel or reschedule, please reply to this email.</p>
      </div>
    `,
  }
}

/**
 * Booking cancellation email sent to the guest
 */
export function bookingCancellationEmail(data: {
  guestName: string
  startTime: Date
  reason?: string
}): { subject: string; html: string } {
  const date = format(data.startTime, 'EEEE, MMMM d, yyyy')
  const time = format(data.startTime, 'h:mm a')

  return {
    subject: 'Your booking has been cancelled',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #111; margin-bottom: 8px;">Booking Cancelled</h2>
        <p style="color: #555; margin-bottom: 24px;">Hi ${escapeHtml(data.guestName)}, your booking on ${date} at ${time} has been cancelled.</p>
        ${data.reason ? `<p style="color: #555;">Reason: ${escapeHtml(data.reason)}</p>` : ''}
        <p style="color: #888; font-size: 14px;">Feel free to book a new time if needed.</p>
      </div>
    `,
  }
}

/**
 * Admin message email sent to the guest
 */
export function adminMessageEmail(data: {
  guestName: string
  message: string
}): { subject: string; html: string } {
  return {
    subject: 'Message regarding your booking',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #111; margin-bottom: 8px;">Message About Your Booking</h2>
        <p style="color: #555; margin-bottom: 24px;">Hi ${escapeHtml(data.guestName)},</p>
        <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0; color: #333; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
        </div>
      </div>
    `,
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
