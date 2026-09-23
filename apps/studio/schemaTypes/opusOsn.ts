import {defineType, defineField} from 'sanity'

// Singleton content for the Osn page intro under the "Osn" heading.
// Keep it a single document — frontend reads `*[_type == "opusOsn"][0]`.
export default defineType({
  title: 'Opus Osn',
  name: 'opusOsn',
  type: 'document',
  fields: [
    defineField({
      title: 'Description',
      name: 'description',
      type: 'text',
      description:
        'Intro paragraph(s) under the Osn heading. Leave a blank line to start a new paragraph. Wrap words in **double asterisks** to bold them and *single asterisks* to italicize them.',
      validation: (Rule) => [
        Rule.required().error('Description is required'),
        Rule.min(10).error('Too short'),
        Rule.max(2000).error('Description cannot exceed 2000 characters'),
      ],
    }),
    defineField({
      title: 'Figures',
      name: 'images',
      type: 'array',
      description:
        'Figure gallery below the intro. Each image spans the full content column with a Fig 01 label.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              title: 'Image',
              name: 'image',
              type: 'image',
              options: {hotspot: true},
              validation: (Rule) => Rule.required().error('Figure image is required'),
            }),
            defineField({title: 'Alt', name: 'alt', type: 'string'}),
          ],
        },
      ],
      validation: (Rule) => Rule.max(12).error('Maximum 12 figures allowed'),
    }),
  ],
  preview: {
    select: {title: 'description'},
  },
})
