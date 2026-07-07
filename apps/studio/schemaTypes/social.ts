import {defineType, defineField} from 'sanity'

export default defineType({
  title: 'Socials',
  name: 'social',
  type: 'document',
  fields: [
    defineField({
      title: 'Name',
      name: 'name',
      type: 'string',
      validation: (Rule) => [
        Rule.required().error('Name is required'),
        Rule.min(2).error('Name must be at least 2 characters long'),
        Rule.max(100).error('Name cannot exceed 100 characters'),
      ],
    }),
    defineField({
      title: 'URL',
      name: 'href',
      type: 'url',
      validation: (Rule) => [
        Rule.required().error('URL is required'),
        Rule.uri({
          scheme: ['http', 'https'],
        }).error('Must be a valid URL (http/https)'),
      ],
    }),
    defineField({
      title: 'External Link',
      name: 'external',
      type: 'boolean',
      description: 'Open in new tab?',
      initialValue: true,
      validation: (Rule) => Rule.required().error('Required'),
    }),
    defineField({
      title: 'Handle',
      name: 'handle',
      type: 'string',
      description: 'Social handle (e.g. @username)',
    }),
    defineField({
      title: 'Bio Prefix',
      name: 'bioPrefix',
      type: 'string',
      description: 'Short label before the bio highlight (e.g. BIO, OS, VOID)',
      validation: (Rule) => Rule.max(20).warning('Should be under 20 characters'),
    }),
    defineField({
      title: 'Bio Highlight',
      name: 'bioHighlight',
      type: 'string',
      description: 'Catchphrase or bio line for the hover card',
      validation: (Rule) => Rule.max(100).warning('Should be under 100 characters'),
    }),
    defineField({
      title: 'Stats',
      name: 'stats',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              title: 'Label',
              name: 'label',
              type: 'string',
              validation: (Rule) => Rule.required().error('Label is required'),
            }),
            defineField({
              title: 'Value',
              name: 'value',
              type: 'string',
              validation: (Rule) => Rule.required().error('Value is required'),
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'value',
            },
          },
        },
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
            Rule.min(1).error('Tag must be at least 1 character long'),
            Rule.max(50).error('Tag cannot exceed 50 characters'),
          ],
        },
      ],
    }),
    defineField({
      title: 'Status',
      name: 'status',
      type: 'string',
      description: 'Status text shown on hover card (e.g. ACTIVE..., ONLINE...)',
      validation: (Rule) => Rule.max(50).warning('Should be under 50 characters'),
    }),
    defineField({
      title: 'Icon Image',
      name: 'image',
      type: 'image',
      description: 'Platform icon / avatar image',
      validation: (Rule) => Rule.required().error('Icon image is required'),
    }),
    defineField({
      title: 'Index Position',
      name: 'index',
      type: 'string',
      description: 'Position in the socials list (3 is reserved)',
      options: {
        list: [
          {title: '1', value: '1'},
          {title: '2', value: '2'},
          {title: '4', value: '4'},
          {title: '5', value: '5'},
          {title: '6', value: '6'},
        ],
      },
      validation: (Rule) =>
        Rule.required().custom(async (value, context) => {
          if (!value) return true
          const client = (context as any).getClient({apiVersion: '2022-03-07'})
          const id = context.document?._id || ''
          const baseId = id.startsWith('drafts.') ? id.slice(7) : id
          const count = await client.fetch(
            `count(*[_type == "social" && index == $index && !(_id in [$id, $baseId])])`,
            {index: value, id, baseId},
          )
          return count === 0 ? true : 'Index already in use by another social'
        }),
    }),
  ],
  orderings: [
    {
      title: 'Index Position',
      name: 'index',
      by: [{field: 'index', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'href',
      media: 'image',
    },
  },
})
