import type { CVData } from '@/types/cv.types'

/**
 * Called server-side inside the /api/cv/export route.
 * Returns raw PDF bytes as a Buffer.
 *
 * React-PDF renders entirely in Node — no headless browser needed.
 */
export async function generatePDFBuffer(
	cvData: CVData,
	template: 'modern' | 'minimal' | 'classic',
): Promise<Buffer> {
	// Dynamic import keeps React-PDF out of the browser bundle.
	const { renderToBuffer } = await import('@react-pdf/renderer')
	const React = (await import('react')).default

	let TemplateComponent: React.ComponentType<{ data: CVData }>

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

	const element = React.createElement(TemplateComponent, { data: cvData })
	const buffer = await renderToBuffer(element)
	return Buffer.from(buffer)
}
