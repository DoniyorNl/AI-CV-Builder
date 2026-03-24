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
	page: { padding: '36 48', fontFamily: 'Helvetica', fontSize: 9.5 },
	header: {
		alignItems: 'center',
		borderBottomWidth: 1,
		borderColor: '#d1d5db',
		paddingBottom: 10,
		marginBottom: 14,
	},
	name: {
		fontSize: 18,
		fontFamily: 'Helvetica-Bold',
		textTransform: 'uppercase',
		letterSpacing: 1,
		color: '#111827',
	},
	contacts: {
		flexDirection: 'row',
		gap: 8,
		marginTop: 4,
		flexWrap: 'wrap',
		justifyContent: 'center',
	},
	contact: { fontSize: 8, color: '#6b7280' },
	section: { marginBottom: 11 },
	sTitle: {
		fontSize: 8,
		fontFamily: 'Helvetica-Bold',
		textTransform: 'uppercase',
		borderBottomWidth: 0.75,
		borderColor: '#9ca3af',
		paddingBottom: 2,
		marginBottom: 6,
		color: '#374151',
		letterSpacing: 0.5,
	},
	expRow: { flexDirection: 'row', justifyContent: 'space-between' },
	expTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9.5 },
	date: { fontSize: 8, color: '#9ca3af' },
	bullet: { fontSize: 8.5, color: '#374151', marginLeft: 8, marginTop: 1.5, lineHeight: 1.4 },
	text: { fontSize: 8.5, color: '#374151', lineHeight: 1.5 },
	skillLabel: { fontFamily: 'Helvetica-Bold', fontSize: 8.5 },
})

export function ClassicTemplate({ data, watermark }: { data: CVData; watermark?: boolean }) {
	const { personal, summary, experience, education, skills, projects } = data
	return (
		<Document>
			<Page size='A4' style={s.page}>
				<View style={s.header}>
					<Text style={s.name}>{personal.full_name}</Text>
					<View style={s.contacts}>
						{personal.email && <Text style={s.contact}>{personal.email}</Text>}
						{personal.phone && <Text style={s.contact}>| {personal.phone}</Text>}
						{personal.city && <Text style={s.contact}>| {personal.city}</Text>}
						{personal.linkedin && <Text style={s.contact}>| {personal.linkedin}</Text>}
					</View>
				</View>

				{summary.text ? (
					<View style={s.section}>
						<Text style={s.sTitle}>Professional Summary</Text>
						<Text style={s.text}>{summary.text}</Text>
					</View>
				) : null}

				{experience.length > 0 && (
					<View style={s.section}>
						<Text style={s.sTitle}>Work Experience</Text>
						{experience.map(exp => (
							<View key={exp.id} style={{ marginBottom: 8 }}>
								<View style={s.expRow}>
									<Text style={s.expTitle}>
										{exp.position}, {exp.company}
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
							<View key={e.id} style={{ ...s.expRow, marginBottom: 4 }}>
								<View>
									<Text style={s.expTitle}>{e.institution}</Text>
									<Text style={s.text}>
										{e.degree}, {e.field}
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
						{skills.technical.length > 0 && (
							<Text style={s.text}>
								<Text style={s.skillLabel}>Technical: </Text>
								{skills.technical.join(', ')}
							</Text>
						)}
						{skills.soft.length > 0 && (
							<Text style={s.text}>
								<Text style={s.skillLabel}>Soft: </Text>
								{skills.soft.join(', ')}
							</Text>
						)}
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
								<Text style={s.text}>{p.description}</Text>
								{p.technologies.length > 0 && (
									<Text style={[s.text, { color: '#9ca3af' }]}>
										Technologies: {p.technologies.join(', ')}
									</Text>
								)}
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
