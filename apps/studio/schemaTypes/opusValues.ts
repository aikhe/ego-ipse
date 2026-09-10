import {defineType, defineField} from 'sanity'

// Singleton content for the Opus landing "Values" section:
// description + two (or more) titled lists + closing quote.
// Keep it a single document — frontend reads `*[_type == "opusValues"][0]`.
export default defineType({
  title: 'Opus Values',
  name: 'opusValues',
  type: 'document',
  fields: [
    defineField({
      title: 'Description',
      name: 'description',
      type: 'text',
      description:
        'Intro paragraph(s) above the lists. Leave a blank line to start a new paragraph. Wrap words in **double asterisks** to bold them and *single asterisks* to italicize them.',
      validation: (Rule) => [
        Rule.required().error('Description is required'),
        Rule.min(10).error('Too short'),
        Rule.max(2000).error('Description cannot exceed 2000 characters'),
      ],
    }),
    defineField({
      title: 'Columns',
      name: 'columns',
      type: 'array',
      description: 'Titled lists (e.g. Capabilities, Elsewhere).',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              title: 'List Title',
              name: 'title',
              type: 'string',
              validation: (Rule) => [
                Rule.required().error('List title is required'),
                Rule.max(100).error('List title cannot exceed 100 characters'),
              ],
            }),
            defineField({
              title: 'Items',
              name: 'items',
              type: 'array',
              of: [
                {
                  type: 'string',
                  validation: (Rule) => [
                    Rule.min(1).error('Item must be at least 1 character long'),
                    Rule.max(200).error('Item cannot exceed 200 characters'),
                  ],
                },
              ],
              validation: (Rule) => [
                Rule.required().error('At least one item is required'),
                Rule.min(1).error('At least one item is required'),
                Rule.max(12).error('Maximum 12 items per list'),
              ],
            }),
          ],
          preview: {
            select: {title: 'title'},
          },
        },
      ],
      validation: (Rule) => [
        Rule.required().error('At least one list is required'),
        Rule.min(1).error('At least one list is required'),
        Rule.max(4).error('Maximum 4 lists allowed'),
      ],
    }),
    defineField({
      title: 'Quote',
      name: 'quote',
      type: 'object',
      description: 'Closing quote block under the lists.',
      fields: [
        defineField({
          title: 'Text',
          name: 'text',
          type: 'text',
          validation: (Rule) => [
            Rule.required().error('Quote text is required'),
            Rule.max(1000).error('Quote cannot exceed 1000 characters'),
          ],
        }),
        defineField({
          title: 'Author',
          name: 'by',
          type: 'string',
          description: 'Attribution line under the quote.',
          validation: (Rule) => [
            Rule.required().error('Quote author is required'),
            Rule.max(200).error('Author cannot exceed 200 characters'),
          ],
        }),
      ],
      validation: (Rule) => Rule.required().error('Quote is required'),
    }),
  ],
  preview: {
    select: {title: 'quote.by', subtitle: 'description'},
  },
})
