import {defineType, defineField} from 'sanity'

// Singleton content for the Nvim page intro under the "Nvim" heading.
// Keep it a single document — frontend reads `*[_type == "opusNvim"][0]`.
export default defineType({
  title: 'Opus Nvim',
  name: 'opusNvim',
  type: 'document',
  fields: [
    defineField({
      title: 'Description',
      name: 'description',
      type: 'text',
      description:
        'Intro paragraph(s) under the Nvim heading. Leave a blank line to start a new paragraph. Wrap words in **double asterisks** to bold them and *single asterisks* to italicize them.',
      validation: (Rule) => [
        Rule.required().error('Description is required'),
        Rule.min(10).error('Too short'),
        Rule.max(2000).error('Description cannot exceed 2000 characters'),
      ],
    }),
    defineField({
      title: 'Config Card',
      name: 'configCard',
      type: 'object',
      description: 'My Config card linking out to the nvim-config repo.',
      fields: [
        defineField({
          title: 'Title',
          name: 'title',
          type: 'string',
          validation: (Rule) => [
            Rule.required().error('Title is required'),
            Rule.max(80).error('Title cannot exceed 80 characters'),
          ],
        }),
        defineField({
          title: 'Description',
          name: 'description',
          type: 'text',
          rows: 2,
          validation: (Rule) => [
            Rule.required().error('Description is required'),
            Rule.max(300).error('Description cannot exceed 300 characters'),
          ],
        }),
      ],
      validation: (Rule) => Rule.required().error('Config card is required'),
    }),
    defineField({
      title: 'Plugins',
      name: 'plugins',
      type: 'array',
      description: 'Plugin list under the Plugins heading. Each item links out to its repo.',
      of: [
        {
          type: 'object',
          name: 'nvimPlugin',
          title: 'Plugin',
          fields: [
            defineField({
              title: 'Title',
              name: 'title',
              type: 'string',
              validation: (Rule) => [
                Rule.required().error('Title is required'),
                Rule.max(80).error('Title cannot exceed 80 characters'),
              ],
            }),
            defineField({
              title: 'Description',
              name: 'description',
              type: 'text',
              rows: 2,
              validation: (Rule) => [
                Rule.required().error('Description is required'),
                Rule.max(300).error('Description cannot exceed 300 characters'),
              ],
            }),
            defineField({
              title: 'Repo',
              name: 'repo',
              type: 'url',
              description: 'Link to the plugin repo.',
              validation: (Rule) => [
                Rule.required().error('Repo link is required'),
                Rule.uri({scheme: ['http', 'https']}).error('Must be a valid URL (http/https)'),
              ],
            }),
          ],
          preview: {
            select: {title: 'title', subtitle: 'repo'},
          },
        },
      ],
      validation: (Rule) => Rule.max(20).error('Maximum 20 plugins allowed'),
    }),
    defineField({
      title: 'Miscs',
      name: 'miscs',
      type: 'array',
      description: 'Misc list under the Miscs heading. Each item links out to its repo.',
      of: [
        {
          type: 'object',
          name: 'nvimMisc',
          title: 'Misc',
          fields: [
            defineField({
              title: 'Title',
              name: 'title',
              type: 'string',
              validation: (Rule) => [
                Rule.required().error('Title is required'),
                Rule.max(80).error('Title cannot exceed 80 characters'),
              ],
            }),
            defineField({
              title: 'Description',
              name: 'description',
              type: 'text',
              rows: 2,
              validation: (Rule) => [
                Rule.required().error('Description is required'),
                Rule.max(300).error('Description cannot exceed 300 characters'),
              ],
            }),
            defineField({
              title: 'Repo',
              name: 'repo',
              type: 'url',
              description: 'Link to the misc repo.',
              validation: (Rule) => [
                Rule.required().error('Repo link is required'),
                Rule.uri({scheme: ['http', 'https']}).error('Must be a valid URL (http/https)'),
              ],
            }),
          ],
          preview: {
            select: {title: 'title', subtitle: 'repo'},
          },
        },
      ],
      validation: (Rule) => Rule.max(20).error('Maximum 20 miscs allowed'),
    }),
  ],
  preview: {
    select: {title: 'description'},
  },
})
