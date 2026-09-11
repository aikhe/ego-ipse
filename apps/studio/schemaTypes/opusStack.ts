import {defineType, defineField} from 'sanity'

// Singleton content for the Stack page: intro under the "Stack" heading plus
// categorized logo grids. Keep it a single document — frontend reads
// `*[_type == "opusStack"][0]`. Each category renders its own numbered
// section (02, 03, ...) with a logo grid inside.
export default defineType({
  title: 'Opus Stack',
  name: 'opusStack',
  type: 'document',
  fields: [
    defineField({
      title: 'Description',
      name: 'description',
      type: 'text',
      description:
        'Intro paragraph(s) under the Stack heading. Leave a blank line to start a new paragraph. Wrap words in **double asterisks** to bold them and *single asterisks* to italicize them.',
      validation: (Rule) => [
        Rule.required().error('Description is required'),
        Rule.min(10).error('Too short'),
        Rule.max(2000).error('Description cannot exceed 2000 characters'),
      ],
    }),
    defineField({
      title: 'Categories',
      name: 'categories',
      type: 'array',
      description:
        'Each category adds a new numbered section (e.g. Design). Add items with a name, optional link, light/dark brand icons, and an optional single preview.',
      of: [
        {
          type: 'object',
          name: 'stackCategory',
          title: 'Category',
          fields: [
            defineField({
              title: 'Category Title',
              name: 'title',
              type: 'string',
              description: 'e.g. Design, Frontend, Backend.',
              validation: (Rule) => [
                Rule.required().error('Category title is required'),
                Rule.max(60).error('Category title cannot exceed 60 characters'),
              ],
            }),
            defineField({
              title: 'Items',
              name: 'items',
              type: 'array',
              description: 'Logos shown in this category grid.',
              of: [
                {
                  type: 'object',
                  name: 'stackItem',
                  title: 'Item',
                  fields: [
                    defineField({
                      title: 'Name',
                      name: 'name',
                      type: 'string',
                      description: 'Tool name (e.g. Figma). Used for alt text + tooltip.',
                      validation: (Rule) => [
                        Rule.required().error('Name is required'),
                        Rule.max(60).error('Name cannot exceed 60 characters'),
                      ],
                    }),
                    defineField({
                      title: 'Link',
                      name: 'href',
                      type: 'url',
                      description: 'Optional link to the tool docs/site.',
                      validation: (Rule) =>
                        Rule.uri({scheme: ['http', 'https']}).error(
                          'Must be a valid URL (http/https)',
                        ),
                    }),
                    defineField({
                      title: 'Size',
                      name: 'size',
                      type: 'number',
                      description:
                        'Tweak logo size to match the others (1 = default, 0.8 = smaller, 1.2 = larger).',
                      initialValue: 1,
                      validation: (Rule) => [
                        Rule.min(0.5).error('Size cannot be smaller than 0.5'),
                        Rule.max(2).error('Size cannot exceed 2'),
                      ],
                    }),
                    defineField({
                      title: 'Icon (Light Mode)',
                      name: 'iconLight',
                      type: 'image',
                      description: 'SVG shown in light theme.',
                      options: {accept: 'image/svg+xml'},
                      validation: (Rule) => Rule.required().error('Light mode icon is required'),
                    }),
                    defineField({
                      title: 'Icon (Dark Mode)',
                      name: 'iconDark',
                      type: 'image',
                      description: 'SVG shown in dark theme.',
                      options: {accept: 'image/svg+xml'},
                      validation: (Rule) => Rule.required().error('Dark mode icon is required'),
                    }),
                    defineField({
                      title: 'Preview',
                      name: 'preview',
                      type: 'image',
                      description:
                        'Optional SVG shown by default in both themes. When set, it replaces the muted silhouette until hover, when the Icon above is revealed. Must be fully opaque and share the exact footprint of the icons, or the mark will visibly shift on hover.',
                      options: {accept: 'image/svg+xml'},
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'name',
                      subtitle: 'href',
                      media: 'iconLight',
                      mediaDark: 'iconDark',
                    },
                    prepare({
                      title,
                      subtitle,
                      media,
                      mediaDark,
                    }: {
                      title?: string
                      subtitle?: string
                      media?: unknown
                      mediaDark?: unknown
                    }) {
                      return {
                        title,
                        subtitle,
                        media: media ?? mediaDark,
                      }
                    },
                  },
                },
              ],
              validation: (Rule) => [
                Rule.required().error('At least one item is required'),
                Rule.min(1).error('At least one item is required'),
                Rule.max(25).error('Maximum 25 items per category'),
              ],
            }),
          ],
          preview: {
            select: {title: 'title'},
          },
        },
      ],
      validation: (Rule) => Rule.max(8).error('Maximum 8 categories allowed'),
    }),
  ],
  preview: {
    select: {title: 'description'},
  },
})
