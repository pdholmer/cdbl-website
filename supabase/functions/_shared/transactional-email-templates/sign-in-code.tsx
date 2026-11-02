import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  code?: string
  minutes?: number
}

const Email = ({ code = '000000', minutes = 10 }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Your CDBL sign-in code is ${code}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>Central District Baseball League</Text>
        <Heading style={h1}>Your sign-in code</Heading>
        <Text style={lead}>Type this code on the sign-in screen to finish signing in.</Text>
        <Section style={card}>
          <Text style={codeStyle}>{code}</Text>
        </Section>
        <Text style={row}>It works for {minutes} minutes, and only the newest code works.</Text>
        <Text style={foot}>
          Didn't try to sign in? Someone may know your password. Reset it from the sign-in page and tell the league admin.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `${d.code ?? ''} is your CDBL sign-in code`.trim(),
  displayName: 'Sign-in code (two-step)',
  previewData: { code: '482913', minutes: 10 },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Barlow, Arial, sans-serif' }
const container = { padding: '24px 24px', maxWidth: '520px' }
const eyebrow = { color: '#003DA5', fontSize: '13px', fontWeight: 600, margin: '0 0 8px' }
const h1 = { color: '#14171C', fontSize: '24px', fontWeight: 700, margin: '0 0 12px' }
const lead = { color: '#5A6272', fontSize: '16px', lineHeight: '24px', margin: '0 0 16px' }
const card = { backgroundColor: '#EEF1F5', border: '1px solid #DCE2EA', borderRadius: '12px', padding: '16px', margin: '0 0 16px', textAlign: 'center' as const }
const codeStyle = { color: '#14171C', fontSize: '34px', fontWeight: 700, letterSpacing: '8px', margin: 0, fontFamily: 'Menlo, Consolas, monospace' }
const row = { color: '#5A6272', fontSize: '14px', lineHeight: '20px', margin: '0 0 12px' }
const foot = { color: '#5A6272', fontSize: '13px', lineHeight: '19px', margin: '16px 0 0' }
