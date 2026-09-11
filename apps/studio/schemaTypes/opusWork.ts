import {defineType, defineField} from 'sanity'

// Mirrors the hardcoded `Work` shape in `apps/web/src/lib/data/works.ts`.
// New CMS surface for Selected Works + Works. `work` / `workRoot` are untouched.
export default defineType({
  title: 'Opus Work',
  name: 'opusWork',
  type: 'document',
  fields: [
    defineField({
      title: 'Title',
      name: 'title',
      type: 'string',
      validation: (Rule) => [
        Rule.required().error('Title is required'),
        Rule.min(3).error('Title must be at least 3 characters long'),
        Rule.max(200).error('Title cannot exceed 200 characters'),
        Rule.custom((value) => {
          if (!value) return true
          if (value.trim().length === 0) return 'Title cannot be only whitespace'
          const invalidChars = /[<>|~@#$%^*[\]{}\\]/
          if (invalidChars.test(value)) return 'Title contains invalid characters'
          return true
        }),
      ],
    }),
    defineField({
      title: 'Slug',
      name: 'slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required().error('Slug is required'),
    }),
    defineField({
      title: 'Description',
      name: 'description',
      type: 'text',
      validation: (Rule) => [
        Rule.required().error('Description is required'),
        Rule.min(10).error('Too short'),
        Rule.max(5000).error('Description cannot exceed 5000 characters'),
        Rule.custom((value) => {
          if (!value) return true
          if (value.trim().length === 0) return 'Description cannot be only whitespace'
          return true
        }),
      ],
    }),
    defineField({
      title: 'Selected Work',
      name: 'selected',
      type: 'boolean',
      description: 'On = Selected Works, Off = Works.',
      initialValue: false,
    }),
    defineField({
      title: 'Order',
      name: 'order',
      type: 'number',
      description: 'Position inside its own list (Selected or Works).',
      validation: (Rule) => [
        Rule.required().error('Order is required'),
        Rule.integer().error('Must be a whole number'),
        Rule.min(1).error('Order must start at 1'),
      ],
    }),
    defineField({
      title: 'Preview',
      name: 'preview',
      type: 'number',
      description: '1/2 = force full-width, 3 = last cell full-width, 4 = single-col grid.',
      options: {
        list: [
          {title: '1', value: 1},
          {title: '2', value: 2},
          {title: '3', value: 3},
          {title: '4', value: 4},
        ],
      },
      initialValue: 4,
      validation: (Rule) => Rule.required().error('Preview is required'),
    }),
    defineField({
      title: 'Preview Cells',
      name: 'cells',
      type: 'array',
      description: 'Card preview grid. Mirrors hardcoded `cells`.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              title: 'Image',
              name: 'image',
              type: 'image',
              options: {hotspot: true},
              validation: (Rule) => Rule.required().error('Cell image is required'),
            }),
            defineField({title: 'Alt', name: 'alt', type: 'string'}),
            defineField({
              title: 'Full-width cell',
              name: 'wide',
              type: 'boolean',
              description: 'On = span both columns.',
              initialValue: false,
            }),
            defineField({
              title: 'Ratio',
              name: 'ratio',
              type: 'string',
              description: 'Fallback when dimensions are unknown (e.g. 16 / 9).',
            }),
            defineField({title: 'Width override', name: 'width', type: 'number'}),
            defineField({title: 'Height override', name: 'height', type: 'number'}),
          ],
        },
      ],
      validation: (Rule) => [
        Rule.required().error('At least one preview cell is required'),
        Rule.min(1).error('At least one preview cell is required'),
        Rule.max(8).error('Maximum 8 preview cells allowed'),
      ],
    }),
    defineField({
      title: 'Detail Gallery',
      name: 'gallery',
      type: 'array',
      description: 'Detail page gallery. Falls back to preview cells when empty.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              title: 'Image',
              name: 'image',
              type: 'image',
              options: {hotspot: true},
              validation: (Rule) => Rule.required().error('Gallery image is required'),
            }),
            defineField({title: 'Alt', name: 'alt', type: 'string'}),
            defineField({
              title: 'Full-width cell',
              name: 'wide',
              type: 'boolean',
              description: 'On = span both columns.',
              initialValue: false,
            }),
            defineField({
              title: 'Ratio',
              name: 'ratio',
              type: 'string',
              description: 'Fallback when dimensions are unknown (e.g. 16 / 9).',
            }),
            defineField({title: 'Width override', name: 'width', type: 'number'}),
            defineField({title: 'Height override', name: 'height', type: 'number'}),
          ],
        },
      ],
      validation: (Rule) => Rule.max(12).error('Maximum 12 gallery images allowed'),
    }),
    defineField({
      title: 'Quote',
      name: 'quote',
      type: 'object',
      fields: [
        defineField({title: 'Text', name: 'text', type: 'text'}),
        defineField({title: 'By', name: 'by', type: 'string'}),
        defineField({title: 'Link', name: 'href', type: 'url'}),
        defineField({title: 'Avatar', name: 'avatar', type: 'image'}),
      ],
    }),
    defineField({
      title: 'Meta',
      name: 'meta',
      type: 'object',
      description: 'Fixed info rows: Role, Platform, Year, Stack, Status.',
      fields: [
        defineField({
          title: 'Role',
          name: 'role',
          type: 'string',
          validation: (Rule) => Rule.required().error('Role is required'),
        }),
        defineField({
          title: 'Platform',
          name: 'platform',
          type: 'string',
          validation: (Rule) => Rule.required().error('Platform is required'),
        }),
        defineField({
          title: 'Year',
          name: 'year',
          type: 'string',
          validation: (Rule) => Rule.required().error('Year is required'),
        }),
        defineField({
          title: 'Stack',
          name: 'stack',
          type: 'string',
          validation: (Rule) => Rule.required().error('Stack is required'),
        }),
        defineField({
          title: 'Status',
          name: 'status',
          type: 'string',
          validation: (Rule) => Rule.required().error('Status is required'),
        }),
      ],
      validation: (Rule) => Rule.required().error('Meta is required'),
    }),
  ],
})
