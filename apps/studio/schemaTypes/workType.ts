import {defineType, defineField} from 'sanity'

export default defineType({
  title: 'Works',
  name: 'work',
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

          if (value && value.trim().length === 0) {
            return 'Title cannot be only whitespace'
          }

          const invalidChars = /[<>|~@#$%^*[]{}\]/
          if (invalidChars.test(value)) {
            return 'Title contains invalid characters'
          }

          return true
        }),
      ],
    }),
    defineField({
      title: 'Duration',
      name: 'duration',
      type: 'object',
      fields: [
        defineField({
          title: 'Start Date',
          name: 'start',
          type: 'date',
          options: {
            dateFormat: 'YYYY-MM-DD',
          },
          validation: (Rule) => Rule.required().error('Start date is required'),
        }),
        defineField({
          title: 'End Date',
          name: 'end',
          type: 'date',
          options: {
            dateFormat: 'YYYY-MM-DD',
          },
          description: 'Leave blank if still ongoing (Present)',
        }),
      ],
      validation: (Rule) => Rule.required().error('Duration is required'),
    }),
    defineField({
      title: 'Brief Description',
      name: 'brief',
      type: 'string',
      description: 'Short summary for previews (SEO/Cards)',
      validation: (Rule) => [
        Rule.required().error('Brief description is required'),
        Rule.min(10).error('Too short'),
        Rule.max(160).error('Brief description cannot exceed 160 characters'),
        Rule.custom((value) => {
          if (value && value.trim().length === 0) return 'Cannot be only whitespace'
          return true
        }),
      ],
    }),
    defineField({
      title: 'Project Type',
      name: 'projectType',
      type: 'string',
      options: {
        list: [
          {title: 'Web', value: 'web'},
          {title: 'Mobile', value: 'mobile'},
          {title: '3D', value: '3d'},
          {title: 'Design', value: 'design'},
          {title: 'Experiment', value: 'experiment'},
        ],
      },
      validation: (Rule) => Rule.required().error('Project type is required'),
    }),
    defineField({
      title: 'Tech Stack',
      name: 'techStack',
      type: 'array',
      of: [{type: 'string'}],
      validation: (Rule) => [
        Rule.required().error('Tech stack is required'),
        Rule.min(1).error('At least one technology required'),
        Rule.unique().error('No duplicates allowed'),
      ],
    }),
    defineField({
      title: 'Project URL',
      name: 'url',
      type: 'url',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['http', 'https'],
        }).error('Must be a valid URL (http/https)'),
    }),
    defineField({
      title: 'GitHub Repository',
      name: 'githubUrl',
      type: 'url',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['http', 'https'],
        }).error('Must be a valid URL (http/https)'),
    }),
    defineField({
      title: 'Category',
      name: 'category',
      type: 'string',
      options: {
        list: [
          {title: 'aikhe', value: 'aikhe'},
          {title: 'acedia', value: 'acedia'},
          {title: 'elapse', value: 'elapse'},
          {title: 'miscs', value: 'miscs'},
        ],
      },
      validation: (Rule) => Rule.required().error('Category is required'),
    }),
    defineField({
      title: 'Description',
      name: 'description',
      type: 'text',
      description: 'A dramatic description for the Blog',
      validation: (Rule) => [
        Rule.max(5000).error('Description cannot exceed 5000 characters'),
        Rule.custom((value) => {
          if (!value) return true

          if (value && value.trim().length === 0) {
            return 'Description cannot be only whitespace'
          }

          return true
        }),
      ],
    }),
    defineField({
      title: 'Cover Image',
      name: 'cover',
      type: 'image',
      validation: (Rule) => [Rule.required().error('Cover Image is required')],
    }),
    defineField({
      title: 'Content',
      name: 'content',
      type: 'array',
      of: [
        {
          type: 'block',
        },
        {
          type: 'image',
          fields: [
            {
              title: 'Alternative text',
              name: 'alt',
              type: 'string',
              description: 'Important for SEO and accessibility',
              validation: (Rule) => Rule.required().error('Alt text is required for accessibility'),
              options: {
                isHighlighted: true,
              },
            },
            {
              title: 'Caption',
              name: 'caption',
              type: 'string',
            },
          ],
        },
      ],
      validation: (Rule) => [
        Rule.required().error('Content is required'),
        Rule.custom((blocks) => {
          if (!Array.isArray(blocks)) return true

          const content = blocks as {_type?: string}[]

          if (content.length === 0) return true

          if (content[0]?._type === 'image') {
            return 'Please start with text before adding images.'
          }

          return true
        }),
      ],
    }),
    defineField({
      title: 'Tags',
      name: 'tags',
      type: 'array',
      of: [
        {
          type: 'string',
          validation: (Rule) => [
            Rule.min(2).error('Tag must be at least 2 characters long'),
            Rule.max(200).error('Tag cannot exceed 200 characters'),
            Rule.custom((value) => {
              if (typeof value !== 'string') return true

              if (value.trim().length === 0) {
                return 'Tag cannot be only whitespace'
              }

              return true
            }),
          ],
        },
      ],
      validation: (Rule) => [
        Rule.min(1).error('At least one tag must be specified'),
        Rule.max(20).error('Maximum 20 tags allowed'),
        Rule.unique().error('No duplicate tags allowed'),
        Rule.custom((tags) => {
          if (!Array.isArray(tags)) return true

          return tags.some((tag) => typeof tag !== 'string' || tag.trim().length === 0)
            ? 'Tags should be named'
            : true
        }),
      ],
    }),
  ],
})
