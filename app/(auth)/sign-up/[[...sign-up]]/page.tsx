import { SignUp } from '@clerk/nextjs'
import { AuthLayout } from '@/components/auth/auth-layout'

export default function SignUpPage() {
  return (
    <AuthLayout>
      <SignUp
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'bg-white shadow-xl rounded-xl p-8',
            headerTitle: 'text-2xl font-bold text-center',
            headerSubtitle: 'text-text-secondary text-center',
            socialButtonsBlockButton:
              'bg-background border border-border hover:bg-background-secondary transition-colors',
            socialButtonsBlockButtonText: 'text-text font-medium',
            dividerLine: 'bg-border',
            dividerText: 'text-text-tertiary bg-background px-2',
            formFieldLabel: 'text-text-secondary text-sm font-medium',
            formFieldInput: 'form-input',
            formButtonPrimary: 'bg-primary hover:bg-primary-hover text-white font-medium',
            footerActionLink: 'text-primary hover:text-primary-hover',
            identityPreviewEditButton: 'text-primary hover:text-primary-hover',
            formFieldSuccessText: 'text-success',
            formFieldErrorText: 'text-accent',
            otpCodeFieldInput: 'form-input',
            formResendCodeLink: 'text-primary hover:text-primary-hover',
          },
          layout: {
            socialButtonsPlacement: 'top',
          },
        }}
      />
    </AuthLayout>
  )
}
