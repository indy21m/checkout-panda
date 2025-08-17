import { SignIn } from '@clerk/nextjs'
import { AuthLayout } from '@/components/auth/auth-layout'

export default function SignInPage() {
  return (
    <AuthLayout>
      <SignIn
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md mx-auto',
            card: 'bg-transparent shadow-none p-0 w-full',
            headerTitle: 'text-2xl font-bold text-center w-full',
            headerSubtitle: 'text-text-secondary text-center w-full',
            socialButtonsBlockButton:
              'bg-background border border-border hover:bg-background-secondary transition-colors',
            socialButtonsBlockButtonText: 'text-text font-medium',
            dividerLine: 'bg-border',
            dividerText: 'text-text-tertiary bg-background px-2',
            formFieldLabel: 'text-text-secondary text-sm font-medium',
            formFieldInput: 'form-input w-full',
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
