import type { CVData } from '@/types/cv.types'
import type { DocumentProps } from '@react-pdf/renderer'
import type { ReactElement } from 'react'

/**
 * Called server-side inside the /api/cv/export route.
 * Returns raw PDF bytes as a Buffer.
 *
 * React-PDF renders entirely in Node — no headless browser needed.
 */
export async function generatePDFBuffer(
	cvData: CVData,
	template: 'modern' | 'minimal' | 'classic',
	watermark = false,
): Promise<Buffer> {
	// Dynamic import keeps React-PDF out of the browser bundle.
	const { renderToBuffer } = await import('@react-pdf/renderer')
	const React = (await import('react')).default

	type TemplateProps = { data: CVData; watermark?: boolean }
	let TemplateComponent: React.ComponentType<TemplateProps>

	if (template === 'modern') {
		const mod = await import('@/components/templates/ModernTemplate')
		TemplateComponent = mod.ModernTemplate
	} else if (template === 'minimal') {
		const mod = await import('@/components/templates/MinimalTemplate')
		TemplateComponent = mod.MinimalTemplate
	} else {
		const mod = await import('@/components/templates/ClassicTemplate')
		TemplateComponent = mod.ClassicTemplate
	}

	const element = React.createElement(TemplateComponent, { data: cvData, watermark })
	// React-PDF's renderToBuffer expects ReactElement<DocumentProps>. Each
	// template wraps content in <Document>, but createElement infers the
	// component's own prop type. We assert via the shared interface.
	const buffer = await renderToBuffer(element as ReactElement<DocumentProps>)
	return Buffer.from(buffer)
}
