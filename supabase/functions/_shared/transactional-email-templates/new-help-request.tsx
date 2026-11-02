import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  kind?: string
  name?: string
  email?: string
  summary?: string
  details?: string
  page?: string
  link?: string
}

const kindLabel = (k?: string) => (k === 'problem' ? 'Problem report' : k === 'feedback' ? 'Feedback' : 'Help request')

const Email = ({ kind, name, email, summary, details, page, link }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`${kindLabel(kind)} from ${name || 'a visitor'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>Central District Baseball League</Text>
        <Heading style={h1}>{kindLabel(kind)} from {name || 'a visitor'}</Heading>
        <Text style={lead}>{summary || 'No summary given.'}</Text>
        <Section style={card}>
          <Text style={row}><strong>From:</strong> {name || 'Not given'} ({email || 'no email'})</Text>
          <Text style={row}><strong>Page:</strong> {page || 'Not given'}</Text>
          {details ? <Text style={row}><strong>Details:</strong> {details}</Text> : null}
        </Section>
        {link ? <Button href={link} style={button}>Open the request</Button> : null}
        <Text style={foot}>Reply to this email to answer {name || 'them'} directly.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `${kindLabel(d.kind)}: ${String(d.summary ?? '').slice(0, 80)}`,
  displayName: 'New help request (to league owner)',
  to: 'pdholmer@gmail.com',
  previewData: {
    kind: 'problem', name: 'Jane Rivera', email: 'jane@example.com',
    summary: 'The schedule page shows the wrong field for Saturday.',
    details: 'Saturday 10am Pinto game says Field 2 but the coach said Field 4.',
    page: '/schedule', link: 'https://www.cdbaseball.org/admin/requests',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Montserrat, Arial, sans-serif' }
const container = { padding: '24px 24px', maxWidth: '560px' }
const eyebrow = { color: '#013882', fontSize: '13px', fontWeight: 600, margin: '0 0 8px' }
const h1 = { color: '#0f172a', fontSize: '22px', fontWeight: 700, margin: '0 0 12px' }
const lead = { color: '#334155', fontSize: '16px', lineHeight: '24px', margin: '0 0 16px' }
const card = { backgroundColor: '#f1f5fb', borderRadius: '16px', padding: '12px 16px', margin: '0 0 20px' }
const row = { color: '#334155', fontSize: '14px', lineHeight: '20px', margin: '6px 0' }
const button = { backgroundColor: '#013882', color: '#ffffff', borderRadius: '999px', padding: '12px 20px', fontSize: '15px', fontWeight: 600, textDecoration: 'none' }
const foot = { color: '#64748b', fontSize: '13px', margin: '20px 0 0' }
