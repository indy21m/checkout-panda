import { SignIn } from '@clerk/nextjs'
import { AuthLayout } from '@/components/auth/auth-layout'

export default function SignInPage() {
  return (
    <AuthLayout>
      <SignIn
        appearance={{
          elements: {
            rootBox: 'w-full min-w-[350px]',
            card: 'bg-transparent shadow-none p-0 w-full min-w-[350px]',
            headerTitle: 'text-2xl font-bold text-center whitespace-normal',
            headerSubtitle: 'text-text-secondary text-center whitespace-normal',
            socialButtonsBlockButton:
              'bg-background border border-border hover:bg-background-secondary transition-colors w-full',
            socialButtonsBlockButtonText: 'text-text font-medium',
            dividerLine: 'bg-border',
            dividerText: 'text-text-tertiary bg-background px-2',
            formFieldLabel: 'text-text-secondary text-sm font-medium block w-full',
            formFieldInput: 'form-input w-full min-w-0',
            formButtonPrimary: 'bg-primary hover:bg-primary-hover text-white font-medium w-full',
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
