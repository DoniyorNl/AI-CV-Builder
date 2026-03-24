import type { CVData } from '@/types/cv.types'
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

const watermarkStyle = StyleSheet.create({
	overlay: {
		position: 'absolute',
		top: 310,
		left: 60,
		right: 60,
		alignItems: 'center',
		transform: 'rotate(-45deg)',
	},
	text: {
		fontSize: 58,
		fontFamily: 'Helvetica-Bold',
		color: '#e5e7eb',
		letterSpacing: 8,
	},
})

const s = StyleSheet.create({
	page: { padding: '40 50', fontFamily: 'Times-Roman', fontSize: 10 },
	header: { borderBottomWidth: 1.5, borderColor: '#111827', paddingBottom: 10, marginBottom: 16 },
	name: { fontSize: 22, fontFamily: 'Times-Bold', color: '#111827', letterSpacing: -0.5 },
	contacts: { flexDirection: 'row', gap: 10, marginTop: 4, flexWrap: 'wrap' },
	contact: { fontSize: 8, color: '#6b7280' },
	summary: {
		fontSize: 9,
		color: '#374151',
		lineHeight: 1.6,
		fontStyle: 'italic',
		marginBottom: 12,
	},
	section: { marginBottom: 12 },
	sTitle: {
		fontSize: 7.5,
		fontFamily: 'Times-Bold',
		textTransform: 'uppercase',
		letterSpacing: 1.5,
		color: '#9ca3af',
		marginBottom: 6,
		borderBottomWidth: 0.5,
		borderColor: '#d1d5db',
		paddingBottom: 2,
	},
	expRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
	expTitle: { fontFamily: 'Times-Bold', fontSize: 10 },
	expSub: { fontSize: 9, color: '#6b7280' },
	date: { fontSize: 8, color: '#9ca3af' },
	bullet: { fontSize: 9, color: '#4b5563', marginLeft: 10, marginTop: 1 },
	skillsLine: { fontSize: 9, color: '#374151', lineHeight: 1.4 },
})

export function MinimalTemplate({ data, watermark }: { data: CVData; watermark?: boolean }) {
	const { personal, summary, experience, education, skills, projects } = data
	return (
		<Document>
			<Page size='A4' style={s.page}>
				{/* Header */}
				<View style={s.header}>
					<Text style={s.name}>{personal.full_name}</Text>
					<View style={s.contacts}>
						{personal.email && <Text style={s.contact}>{personal.email}</Text>}
						{personal.phone && <Text style={s.contact}>· {personal.phone}</Text>}
						{personal.city && <Text style={s.contact}>· {personal.city}</Text>}
						{personal.linkedin && <Text style={s.contact}>· {personal.linkedin}</Text>}
					</View>
				</View>

				{summary.text ? <Text style={s.summary}>{summary.text}</Text> : null}

				{experience.length > 0 && (
					<View style={s.section}>
						<Text style={s.sTitle}>Work Experience</Text>
						{experience.map(exp => (
							<View key={exp.id} style={{ marginBottom: 7 }}>
								<View style={s.expRow}>
									<Text style={s.expTitle}>
										{exp.position} — <Text style={s.expSub}>{exp.company}</Text>
									</Text>
									<Text style={s.date}>
										{exp.start_date} – {exp.current ? 'Present' : exp.end_date}
									</Text>
								</View>
								{exp.bullets.map((b, i) => (
									<Text key={i} style={s.bullet}>
										• {b}
									</Text>
								))}
							</View>
						))}
					</View>
				)}

				{education.length > 0 && (
					<View style={s.section}>
						<Text style={s.sTitle}>Education</Text>
						{education.map(e => (
							<View key={e.id} style={{ ...s.expRow, marginBottom: 5 }}>
								<View>
									<Text style={s.expTitle}>{e.institution}</Text>
									<Text style={s.expSub}>
										{e.degree} in {e.field}
									</Text>
								</View>
								<Text style={s.date}>
									{e.start_year} – {e.end_year}
								</Text>
							</View>
						))}
					</View>
				)}

				{(skills.technical.length > 0 || skills.soft.length > 0) && (
					<View style={s.section}>
						<Text style={s.sTitle}>Skills</Text>
						<Text style={s.skillsLine}>{[...skills.technical, ...skills.soft].join(' · ')}</Text>
					</View>
				)}

				{projects.length > 0 && (
					<View style={s.section}>
						<Text style={s.sTitle}>Projects</Text>
						{projects.map(p => (
							<View key={p.id} style={{ marginBottom: 5 }}>
								<Text style={s.expTitle}>
									{p.name}
									{p.link ? ` — ${p.link}` : ''}
								</Text>
								<Text style={s.skillsLine}>{p.description}</Text>
							</View>
						))}
					</View>
				)}
				{/* Watermark overlay — visible on Free plan exports */}
				{watermark && (
					<View fixed style={watermarkStyle.overlay}>
						<Text style={watermarkStyle.text}>FREE PLAN</Text>
					</View>
				)}
			</Page>
		</Document>
	)
}
