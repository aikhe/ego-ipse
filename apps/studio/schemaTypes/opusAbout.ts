import {defineType, defineField} from 'sanity'

// Singleton content for the About page intro under the "About" heading.
// Keep it a single document — frontend reads `*[_type == "opusAbout"][0]`.
export default defineType({
  title: 'Opus About',
  name: 'opusAbout',
  type: 'document',
  fields: [
    defineField({
      title: 'Description',
      name: 'description',
      type: 'text',
      description:
        'Intro paragraph(s) under the About heading. Leave a blank line to start a new paragraph. Wrap words in **double asterisks** to bold them.',
      validation: (Rule) => [
        Rule.required().error('Description is required'),
        Rule.min(10).error('Too short'),
        Rule.max(2000).error('Description cannot exceed 2000 characters'),
      ],
    }),
  ],
  preview: {
    select: {title: 'description'},
  },
})
