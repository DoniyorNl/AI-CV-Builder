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

const styles = StyleSheet.create({
	page: { padding: 0, fontFamily: 'Helvetica', fontSize: 9 },
	header: {
		backgroundColor: '#4f46e5',
		color: 'white',
		paddingHorizontal: 32,
		paddingVertical: 24,
	},
	name: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: 'white', marginBottom: 4 },
	contactRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
	contact: { fontSize: 8, color: '#c7d2fe' },
	body: { flexDirection: 'row', flex: 1 },
	main: { flex: 1, paddingHorizontal: 24, paddingVertical: 20, gap: 16 },
	sidebar: {
		width: 130,
		backgroundColor: '#f9fafb',
		paddingHorizontal: 16,
		paddingVertical: 20,
		gap: 16,
	},
	sectionTitle: {
		fontSize: 7,
		fontFamily: 'Helvetica-Bold',
		color: '#4f46e5',
		textTransform: 'uppercase',
		letterSpacing: 1.5,
		marginBottom: 6,
		borderBottomWidth: 0.5,
		borderColor: '#e0e7ff',
		paddingBottom: 3,
	},
	expTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#111827' },
	expCompany: { fontSize: 8, color: '#4f46e5', marginTop: 1 },
	expDate: { fontSize: 7, color: '#9ca3af' },
	bullet: { fontSize: 8, color: '#4b5563', marginTop: 2, marginLeft: 8 },
	summaryText: { fontSize: 8, color: '#374151', lineHeight: 1.5 },
	eduName: { fontFamily: 'Helvetica-Bold', fontSize: 8 },
	eduSub: { fontSize: 7, color: '#6b7280' },
	tag: {
		backgroundColor: '#e0e7ff',
		color: '#3730a3',
		fontSize: 7,
		paddingHorizontal: 4,
		paddingVertical: 1.5,
		borderRadius: 3,
		marginRight: 3,
		marginBottom: 3,
	},
	tagsRow: { flexDirection: 'row', flexWrap: 'wrap' },
})

export function ModernTemplate({ data, watermark }: { data: CVData; watermark?: boolean }) {
	const { personal, summary, experience, education, skills, projects } = data
	return (
		<Document>
			<Page size='A4' style={styles.page}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.name}>{personal.full_name}</Text>
					<View style={styles.contactRow}>
						{personal.email && <Text style={styles.contact}>{personal.email}</Text>}
						{personal.phone && <Text style={styles.contact}>{personal.phone}</Text>}
						{personal.city && <Text style={styles.contact}>{personal.city}</Text>}
						{personal.linkedin && <Text style={styles.contact}>{personal.linkedin}</Text>}
					</View>
				</View>

				<View style={styles.body}>
					{/* Main */}
					<View style={styles.main}>
						{summary.text ? (
							<View>
								<Text style={styles.sectionTitle}>Summary</Text>
								<Text style={styles.summaryText}>{summary.text}</Text>
							</View>
						) : null}

						{experience.length > 0 && (
							<View>
								<Text style={styles.sectionTitle}>Experience</Text>
								{experience.map(exp => (
									<View key={exp.id} style={{ marginBottom: 8 }}>
										<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
											<View>
												<Text style={styles.expTitle}>{exp.position}</Text>
												<Text style={styles.expCompany}>{exp.company}</Text>
											</View>
											<Text style={styles.expDate}>
												{exp.start_date} — {exp.current ? 'Present' : exp.end_date}
											</Text>
										</View>
										{exp.bullets.map((b, i) => (
											<Text key={i} style={styles.bullet}>
												• {b}
											</Text>
										))}
									</View>
								))}
							</View>
						)}

						{projects.length > 0 && (
							<View>
								<Text style={styles.sectionTitle}>Projects</Text>
								{projects.map(p => (
									<View key={p.id} style={{ marginBottom: 6 }}>
										<Text style={styles.expTitle}>
											{p.name}
											{p.link ? ` — ${p.link}` : ''}
										</Text>
										<Text style={styles.summaryText}>{p.description}</Text>
									</View>
								))}
							</View>
						)}
					</View>

					{/* Sidebar */}
					<View style={styles.sidebar}>
						{education.length > 0 && (
							<View>
								<Text style={styles.sectionTitle}>Education</Text>
								{education.map(e => (
									<View key={e.id} style={{ marginBottom: 6 }}>
										<Text style={styles.eduName}>{e.institution}</Text>
										<Text style={styles.eduSub}>{e.degree}</Text>
										<Text style={styles.eduSub}>{e.field}</Text>
										<Text style={[styles.eduSub, { color: '#9ca3af' }]}>
											{e.start_year} — {e.end_year}
										</Text>
									</View>
								))}
							</View>
						)}

						{skills.technical.length > 0 && (
							<View>
								<Text style={styles.sectionTitle}>Technical</Text>
								<View style={styles.tagsRow}>
									{skills.technical.map(s => (
										<Text key={s} style={styles.tag}>
											{s}
										</Text>
									))}
								</View>
							</View>
						)}

						{skills.soft.length > 0 && (
							<View>
								<Text style={styles.sectionTitle}>Soft Skills</Text>
								<View style={styles.tagsRow}>
									{skills.soft.map(s => (
										<Text
											key={s}
											style={[styles.tag, { backgroundColor: '#f3f4f6', color: '#374151' }]}
										>
											{s}
										</Text>
									))}
								</View>
							</View>
						)}
					</View>
				</View>

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
