'use client'

import { ClassicPreview } from '@/components/templates/previews/ClassicPreview'
import { MinimalPreview } from '@/components/templates/previews/MinimalPreview'
import { ModernPreview } from '@/components/templates/previews/ModernPreview'
import type { CVData, Template } from '@/types/cv.types'

interface Props {
	data: CVData
	template: Template
}

export function CVPreviewPanel({ data, template }: Props) {
	return (
		<div className='bg-gray-200 rounded-2xl p-6 min-h-full'>
			<div className='max-w-2xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden'>
				{template === 'modern' && <ModernPreview data={data} />}
				{template === 'minimal' && <MinimalPreview data={data} />}
				{template === 'classic' && <ClassicPreview data={data} />}
			</div>
		</div>
	)
}
